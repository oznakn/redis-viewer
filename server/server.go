package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime/debug"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/context"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/spf13/viper"
)

func indexHandler(entrypoint string) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, entrypoint)
	}
	return http.HandlerFunc(fn)
}

func parseBody(r *http.Request) map[string]interface{} {
	t := make(map[string]interface{})

	err := json.NewDecoder(r.Body).Decode(&t)

	if err != nil {
		return nil
	} else {
		return t
	}
}

func writeError(w http.ResponseWriter, err error, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err != nil {
		debug.PrintStack()
		fmt.Println(err)
	}

	result := make(map[string]interface{})
	result["success"] = false
	result["time"] = time.Now()

	json.NewEncoder(w).Encode(result)
}

func writeResponse(w http.ResponseWriter, result map[string]interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if result == nil {
		result = make(map[string]interface{})
	}

	result["success"] = true
	result["time"] = time.Now()

	json.NewEncoder(w).Encode(result)
}

func authenticationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
		} else {
			key := r.Header.Get("Authorization")

			if len(key) > 7 {
				success, user := fetchUserWithAccessKey(key[7:])

				if success {
					context.Set(r, "user", user)

					next.ServeHTTP(w, r)
				} else {
					writeError(w, nil, 403)
				}
			} else {
				writeError(w, nil, 403)
			}
		}
	})
}

func parseBodyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost || r.Method == http.MethodPut {
			body := parseBody(r)

			if body == nil {
				writeError(w, nil, 500)
			} else {
				for k, v := range body {
					context.Set(r, k, v)
				}

				next.ServeHTTP(w, r)
			}
		} else {
			next.ServeHTTP(w, r)
		}
	})
}

func createRedisClientMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		dbString := r.FormValue("db")
		db := 0
		var err error = nil

		if dbString != "" {
			db, err = strconv.Atoi(dbString)
		}

		if err != nil {
			writeError(w, err, 500)
		} else {
			context.Set(r, "db", db)

			if _, ok := clients[db]; !ok {
				clients[db] = createClient(db)
			}

			next.ServeHTTP(w, r)
		}
	})
}

func login(w http.ResponseWriter, r *http.Request) {
	username, ok1 := context.GetOk(r, "username")
	password, ok2 := context.GetOk(r, "password")

	if ok1 && ok2 {
		success, user, key := authUser(username.(string), password.(string))

		if success {
			response := make(map[string]interface{})
			response["accessKey"] = key
			response["userType"] = user.Type

			writeResponse(w, response)
		} else {
			writeError(w, nil, 500)
		}
	} else {
		writeError(w, nil, 500)
	}
}

func getDBs(w http.ResponseWriter, r *http.Request) {
	keyspace, err := clients[0].Info("keyspace").Result()

	if err != nil {
		writeError(w, err, 500)
	} else {
		results := parseKeyspaceData(keyspace, "")

		response := make(map[string]interface{})
		response["results"] = results

		writeResponse(w, response)
	}
}

func getDBSize(w http.ResponseWriter, r *http.Request) {
	client := clients[context.Get(r, "db").(int)]

	size, err := client.DBSize().Result()

	if err != nil {
		writeError(w, err, 500)
	} else {
		response := make(map[string]interface{})

		response["size"] = size

		writeResponse(w, response)
	}
}

func getKey(w http.ResponseWriter, r *http.Request) {
	key := r.FormValue("key")
	hash := r.FormValue("hash")

	client := clients[context.Get(r, "db").(int)]

	var result string
	var err error

	if hash != "" {
		result, err = client.HGet(hash, key).Result()
	} else {
		result, err = client.Get(key).Result()
	}

	if err != nil {
		writeError(w, err, 500)
	} else {
		response := make(map[string]interface{})

		response["result"] = result

		writeResponse(w, response)
	}
}

func setKey(w http.ResponseWriter, r *http.Request) {
	key := context.Get(r, "key").(string)
	value := context.Get(r, "value").(string)
	hash := ""

	_, hashExists := context.GetOk(r, "hash")
	if hashExists {
		hash = context.Get(r, "hash").(string)
	}

	client := clients[context.Get(r, "db").(int)]

	var err error

	if hash != "" {
		_, err = client.HSet(hash, key, value).Result()
	} else {
		_, err = client.Set(key, value, 0).Result()
	}

	if err != nil {
		writeError(w, err, 500)
	} else {
		writeResponse(w, nil)
	}
}

func delKey(w http.ResponseWriter, r *http.Request) {
	key := r.FormValue("key")
	hash := r.FormValue("hash")

	client := clients[context.Get(r, "db").(int)]

	var err error

	if hash != "" {
		_, err = client.HDel(hash, key).Result()
	} else {
		_, err = client.Del(key).Result()
	}

	if err != nil {
		writeError(w, err, 500)
	} else {
		writeResponse(w, nil)
	}
}

func searchKey(w http.ResponseWriter, r *http.Request) {
	client := clients[context.Get(r, "db").(int)]

	search := r.FormValue("search")
	hash := r.FormValue("hash")
	wantedPage, err := strconv.ParseInt(r.FormValue("page"), 10, 64)

	if err != nil {
		writeError(w, err, 500)
	} else {
		response := make(map[string]interface{})

		var currentPage int64 = 0
		var currentCursor uint64 = 0
		var count int64

		var totalKeyCount int64 = 0
		var totalKeys []string = make([]string, 0)

		if r.FormValue("count") != "" {
			count, err = strconv.ParseInt(r.FormValue("count"), 10, 64)

			if err != nil {
				count = DEFAULT_COUNT
			}
		} else {
			count = DEFAULT_COUNT
		}

		for true {
			var keys []string
			var cursor uint64
			var err error

			if hash != "" {
				keys, cursor, err = client.HScan(hash, currentCursor, search, count).Result()
			} else {
				keys, cursor, err = client.Scan(currentCursor, search, count).Result()
			}

			if err != nil {
				writeError(w, err, 500)
				break
			} else {
				currentCursor = cursor

				totalKeyCount += int64(len(keys) / 2)
				totalKeys = append(totalKeys, keys...)

				if totalKeyCount >= count-2 || currentCursor == 0 {
					currentPage++

					if currentPage == wantedPage {
						var results []map[string]string

						if hash != "" {
							results = make([]map[string]string, len(totalKeys)/2)

							for i := 0; i < len(totalKeys); i += 2 {
								key := totalKeys[i]
								keyType, err := client.Type(key).Result()

								if err != nil {
									continue
								}

								result := make(map[string]string)
								result["key"] = key

								if keyType == "none" {
									result["type"] = "hashKey"
								} else {
									result["type"] = keyType
								}

								results[i/2] = result
							}
						} else {
							results = make([]map[string]string, len(totalKeys))

							for i := 0; i < len(totalKeys); i++ {
								key := totalKeys[i]
								keyType, err := client.Type(key).Result()

								if err != nil {
									continue
								}

								result := make(map[string]string)
								result["key"] = key
								result["type"] = keyType

								results[i] = result
							}
						}

						response["results"] = results
						break
					} else {
						totalKeyCount = 0
						totalKeys = totalKeys[:0]

						if currentCursor == 0 {
							response["results"] = make([]map[string]string, 0)
							break
						}
					}
				}
			}
		}

		writeResponse(w, response)
	}
}

func index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "PONG")
}

func keyIndex(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getKey(w, r)
	} else {
		user := context.Get(r, "user").(User)

		if user.Type != USER_FULL {
			writeError(w, nil, 403)
		} else {
			if r.Method == http.MethodPost {
				setKey(w, r)
			} else if r.Method == http.MethodDelete {
				delKey(w, r)
			} else {
				writeError(w, nil, 403)
			}
		}
	}
}

func sendCommand(w http.ResponseWriter, r *http.Request) {
	user := context.Get(r, "user").(User)

	if user.Type != USER_FULL {
		writeError(w, nil, 403)
	} else {
		client := clients[context.Get(r, "db").(int)]
		command, ok := context.GetOk(r, "command")

		if !ok {
			writeError(w, nil, 500)
		} else {
			parts := strings.Split(command.(string), " ")

			args := make([]interface{}, len(parts))

			for i := 0; i < len(args); i++ {
				args[i] = parts[i]
			}

			result, err := client.Do(args...).Result()

			if err != nil {
				writeError(w, err, 500)
			} else {
				response := make(map[string]interface{})
				response["result"] = result

				writeResponse(w, response)
			}
		}
	}
}

func startSocketInterval() {
	ticker := time.NewTicker(3 * time.Second)
	quit := make(chan struct{})

	go func() {
		for {
			select {
			case <-ticker.C:
				client := clients[0]

				info, err := client.Info().Result()

				data := make(map[string]interface{})
				data["stats"] = true
				data["result"] = parseInfoData(info)
				data["time"] = time.Now()

				response, err := json.Marshal(data)

				if err == nil {
					hub.broadcast <- []byte(response)
				} else {
					fmt.Println(err)
				}
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
}

func startServer(enableRedisProxy bool, enableStaticServe bool) {
	clients[0] = createClient(0)

	publish := fmt.Sprintf("%s:%d", viper.Get("publish.host").(string), viper.Get("publish.port").(int))
	connect := fmt.Sprintf("%s:%d", viper.Get("redis.connect.host").(string), viper.Get("redis.connect.port").(int))
	staticDir, _ := filepath.Abs(viper.Get("static.dir").(string))

	if viper.Get("redis.pass").(string) != "" {
		fmt.Printf("Authenticating redis using password\n")
	}

	r := mux.NewRouter()

	if enableRedisProxy {
		startSocketInterval()

		s := r.PathPrefix("/api").Subrouter()

		s.Use(parseBodyMiddleware)
		s.HandleFunc("/login", login).Methods(http.MethodPost)
		s.HandleFunc("/ws", serveWs).Methods(http.MethodGet, http.MethodPost)

		q := s.PathPrefix("/").Subrouter()

		q.Use(authenticationMiddleware)
		q.Use(createRedisClientMiddleware)
		q.HandleFunc("/", index).Methods(http.MethodGet)
		q.HandleFunc("/dbs", getDBs).Methods(http.MethodGet)
		q.HandleFunc("/dbsize", getDBSize).Methods(http.MethodGet)
		q.HandleFunc("/search", searchKey).Methods(http.MethodGet)
		q.HandleFunc("/key", keyIndex).Methods(http.MethodGet, http.MethodPost, http.MethodDelete)
		q.HandleFunc("/command", sendCommand).Methods(http.MethodPost)

		fmt.Printf("Server started on %s using redis on %s\n", publish, connect)
	}

	if enableStaticServe {
		fileServer := http.FileServer(http.Dir(fmt.Sprintf("%s/", staticDir)))

		r.PathPrefix("/css").Handler(fileServer)
		r.PathPrefix("/js").Handler(fileServer)
		r.PathPrefix("/").HandlerFunc(indexHandler(fmt.Sprintf("%s/index.html", staticDir)))

		fmt.Printf("Serving files for web interface at %s\n", staticDir)
	}

	fmt.Print("\n")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowedMethods:   []string{http.MethodHead, http.MethodOptions, http.MethodGet, http.MethodPost, http.MethodDelete},
		MaxAge:           3600,
	})

	log.Fatal(
		http.ListenAndServe(
			publish,
			handlers.LoggingHandler(os.Stdout, c.Handler(r)),
		),
	)
}
