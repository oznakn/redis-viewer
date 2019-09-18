package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/go-redis/redis"
	"github.com/spf13/viper"
)

var clients map[int]*redis.Client = make(map[int]*redis.Client)

var redisConnect, redisPass string

func parseKeyspaceData(data string, selectDB string) []map[string]interface{} {
	results := make([]map[string]interface{}, 0)

	values := strings.Split(data, "\r\n")
	values = values[1 : len(values)-1]

	for _, value := range values {
		items := strings.Split(value, ":")

		resultItem := make(map[string]interface{})

		idString := string(items[0][len(items[0])-1])

		if selectDB != "" && selectDB != idString {
			continue
		}

		id, _ := strconv.Atoi(idString)

		resultItem["id"] = id
		resultItem["name"] = items[0]

		kvs := strings.Split(items[1], ",")

		for _, kv := range kvs {
			kvPair := strings.Split(kv, "=")

			k := kvPair[0]
			v := kvPair[1]

			if k == "name" {
				resultItem[k] = v
			} else {
				s, _ := strconv.Atoi(v)

				resultItem[k] = s
			}
		}

		results = append(results, resultItem)
	}

	return results
}

func parseInfoData(data string) map[string]interface{} {
	result := make(map[string]interface{})

	values := strings.Split(data, "\r\n")

	for _, v := range values {
		kv := strings.Split(v, ":")

		if kv[0] == "redis_version" {
			result["version"] = kv[1]
		} else if kv[0] == "os" {
			result["os"] = kv[1]
		} else if kv[0] == "used_memory_human" {
			result["memory"] = kv[1]
		} else if kv[0] == "used_cpu_user" {
			result["cpu"] = kv[1]
		}

	}

	return result
}

func createClient(db int) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     redisConnect,
		Password: redisPass,
		DB:       db,
		PoolSize: 20,
	})

	_, err := client.Ping().Result()

	if err != nil {
		log.Fatal("Cannot connect to redis database")
	}

	return client
}

func listenRedisEvents() {
	client := createClient(0)

	client.ConfigSet("notify-keyspace-events", "KA")

	pubsub := client.PSubscribe("__keyspace*__:*")
	defer pubsub.Close()

	for true {
		msg, err := pubsub.ReceiveMessage()

		if err == nil {
			dbString := msg.Channel[11 : strings.LastIndex(msg.Channel, ":")-2]
			// key := msg.Channel[strings.LastIndex(msg.Channel, ":")+1 : len(msg.Channel)]

			db, err := strconv.Atoi(dbString)

			if err == nil {
				data := make(map[string]interface{})
				data["db"] = db

				response, err := json.Marshal(data)

				if err == nil {
					hub.broadcast <- []byte(response)
				}
			}

		}
	}
}

func redisInit() {
	redisConnect = fmt.Sprintf("%s:%d", viper.Get("redis.connect.host").(string), viper.Get("redis.connect.port").(int))
	redisPass = viper.Get("redis.pass").(string)
}
