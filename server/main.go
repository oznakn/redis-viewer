package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"

	"github.com/spf13/viper"
	"github.com/urfave/cli"
)

const (
	DEFAULT_COUNT = 20
)

func main() {
	db := dbInit()
	defer db.Close()

	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.ReadInConfig()

	viper.SetDefault("publish.host", "127.0.0.1")
	viper.SetDefault("publish.port", 5000)
	viper.SetDefault("redis.connect.host", "127.0.0.1")
	viper.SetDefault("redis.connect.port", 6379)
	viper.SetDefault("redis.pass", "")
	viper.SetDefault("static.dir", "./dist")

	app := cli.NewApp()

	app.Commands = []cli.Command{
		{
			Name:  "start",
			Usage: "start redis proxy server",
			Action: func(c *cli.Context) error {
				redisInit()
				websocketInit()

				go hub.run()
				go listenRedisEvents()

				startServer(true, false)

				return nil
			},
		},
		{
			Name:  "startandserve",
			Usage: "start redis proxy server, also serve web interface",
			Action: func(c *cli.Context) error {
				redisInit()
				websocketInit()

				go hub.run()
				go listenRedisEvents()

				startServer(true, true)

				return nil
			},
		},
		{
			Name:  "serve",
			Usage: "just serve web interface",
			Action: func(c *cli.Context) error {
				startServer(false, true)

				return nil
			},
		},
		{
			Name:  "createuser",
			Usage: "create user",
			Action: func(c *cli.Context) error {
				reader := bufio.NewReader(os.Stdin)

				fmt.Print("Username: ")
				username, _ := reader.ReadString('\n')
				username = username[:len(username)-1]

				fmt.Print("Password: ")
				password, _ := reader.ReadString('\n')
				password = password[:len(password)-1]

				fmt.Print("Give user full access (Write) [y/N]: ")
				access, _ := reader.ReadString('\n')
				access = access[:len(access)-1]

				userType := 0

				if strings.ToLower(access) == "y" {
					userType = 1
				}

				if createUser(username, password, userType) {
					fmt.Print("\nUser successfully created.\n")
				} else {
					fmt.Print("\nUser creation failed.\n")
				}

				return nil
			},
		},
	}

	sort.Sort(cli.CommandsByName(app.Commands))

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
