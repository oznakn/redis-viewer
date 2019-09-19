package main

import (
	"fmt"
	"log"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/rs/xid"
	"golang.org/x/crypto/bcrypt"
)

const (
	USER_REGULAR = 0
	USER_FULL    = 1
)

type User struct {
	gorm.Model
	Username string
	Password string
	Type     int
}

type AccessKey struct {
	gorm.Model
	UserID int
	User   User
	Key    string
}

var db *gorm.DB

func randomString(length int) string {
	guid := xid.New()

	return guid.String() + guid.String()
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))

	return err == nil
}

func createUser(username string, password string, userType int) bool {
	password, err := hashPassword(password)

	if err != nil {
		fmt.Println(err)

		return false
	} else {
		user := User{}

		if err := db.First(&user, "username = ?", username).Error; err == nil {
			return false
		}

		user = User{
			Username: username, Password: password, Type: userType,
		}

		if err := db.Create(&user).Error; err != nil {
			fmt.Println(err)

			return false
		}

		return true
	}
}

func deleteUser(username string) bool {
	user := User{}

	return db.Unscoped().Delete(&user, "username = ?", username).Error == nil
}

func getUsers() []User {
	users := make([]User, 0)

	db.Find(&users)

	return users
}

func deleteAccessKeys() bool {
	accessKey := AccessKey{}

	return db.Unscoped().Delete(&accessKey).Error == nil
}

func authUser(username string, password string) (bool, User, string) {
	user := User{}

	if err := db.First(&user, "username = ?", username).Error; err != nil {
		fmt.Println(err)

		return false, user, ""
	} else {
		if user.ID == 0 {
			return false, user, ""
		}

		if checkPasswordHash(password, user.Password) == false {
			return false, user, ""

		} else {
			key := randomString(12)

			if err := db.Create(&AccessKey{User: user, Key: key}).Error; err != nil {
				fmt.Println(err)

				return false, user, ""
			}

			return true, user, key
		}
	}
}

func fetchUserWithAccessKey(key string) (bool, User) {
	var user User
	accessKey := AccessKey{}

	if err := db.First(&accessKey, "key = ?", key).Error; err != nil {
		fmt.Println(err)

		return false, user
	} else {
		if accessKey.ID == 0 {
			fmt.Println(err)
			return false, user
		}

		if err := db.First(&user, "id = ?", accessKey.UserID).Error; err != nil {
			fmt.Println(err)
			return false, user
		}

		return true, user
	}
}

func dbInit() *gorm.DB {
	var err error

	db, err = gorm.Open("sqlite3", "db.sqlite3")

	if err != nil {
		log.Fatal("failed to connect local database")
	}

	db.AutoMigrate(&User{})
	db.AutoMigrate(&AccessKey{})

	return db
}
