package main

import (
	"chatapp/helper"
	. "chatapp/structure"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool)

// var (
//
//	userMutex sync.Mutex
//	mesMutex  sync.Mutex
//
// )
var broadcast = make(chan Update)

// var allMessages []Message
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // return true to allow all origins, or customize as needed
	},
}
var uId int64

var mesId int64 = 1
var UserMap = make(map[int64]User)
var mesMap = make(map[int64]Message)

func Upfile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hello")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	err := r.ParseMultipartForm(10 << 50)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var user User
	err = json.Unmarshal([]byte(r.FormValue("user")), &user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	var message Message
	err = json.Unmarshal([]byte(r.FormValue("message")), &message)
	fmt.Println(r.FormValue("message"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	file, handle, err := r.FormFile("file")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fileData, err := helper.ProcessFile(file, handle)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	broadcast <- Update{
		Type: UpFile,
		User: user,
		Message: Message{
			Id:       mesId,
			Uid:      user.Id,
			Time:     time.Now().Format(time.RFC3339),
			Username: message.Username,
			Message:  message.Message,
			Photo:    message.Photo,
			File:     fileData,
		},
	}
	mesMap[mesId] = Message{
		Id:       mesId,
		Uid:      user.Id,
		Time:     time.Now().Format(time.RFC3339),
		Username: message.Username,
		Message:  message.Message,
		Photo:    message.Photo,
		File:     fileData,
	}

	atomic.AddInt64(&mesId, 1)
	w.Write([]byte("Upfile Successful"))

}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.RemoteAddr)

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
	}
	var user User
	var currentUid int64

	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()
	clients[ws] = true
	for {

		var update Update
		err := ws.ReadJSON(&update)
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				broadcast <- Update{
					Type: UserLeave,
					User: user,
					Message: Message{
						Message: user.UserName + " leave from chatapp",
						Time:    time.Now().Format(time.RFC3339),
					},
				}
				fmt.Println("Client has gone away:", err)
			} else {
				fmt.Println(err)
			}
			delete(clients, ws)
			break
		}
		switch update.Type {
		case UserJoin:
			user = User{
				Id:         uId,
				UserName:   update.User.UserName,
				Photo:      update.User.Photo,
				CreateAt:   time.Now(),
				RemoteAddr: r.RemoteAddr,
			}
			fmt.Println(user.Photo)
			UserMap[uId] = user
			currentUid = uId

			atomic.AddInt64(&uId, 1)
			broadcast <- Update{
				Type: UserJoin,
				User: user,
			}
			// case UpFile:
			// 	ResponseFile, err := helper.ProcessFile(update.Message.File)
			// 	fmt.Println(update)
			// 	if err != nil {
			// 		broadcast <- Update{
			// 			Type: UpFile,
			// 			User: User{
			// 				Id:       0,
			// 				UserName: "Admin",
			// 			},
			// 			Message: Message{
			// 				Message: "Err : Cant upload file",
			// 			},
			// 		}
			// 	}
			// mesMap[mesId] = Message{
			// 	Id:       mesId,
			// 	Uid:      currentUid,
			// 	Time:     update.Message.Time,
			// 	Message:  update.Message.Message,
			// 	Username: update.User.UserName,
			// }
			// new := update
			// new.Message.File = ResponseFile
			// update = new
			// broadcast <- update
			// atomic.AddInt64(&mesId, 1)
		case AddMessage:

			mesMap[mesId] = Message{
				Id:       mesId,
				Photo:    user.Photo,
				Uid:      currentUid,
				Time:     update.Message.Time,
				Message:  update.Message.Message,
				Username: update.User.UserName,
			}
			UserMap[currentUid] = User{
				Id:         UserMap[currentUid].Id,
				Photo:      user.Photo,
				UserName:   update.User.UserName,
				RemoteAddr: UserMap[currentUid].RemoteAddr,
				CreateAt:   UserMap[currentUid].CreateAt,
				Messages:   append(UserMap[currentUid].Messages, update.Message),
			}
			atomic.AddInt64(&mesId, 1)
			update.Message.Photo = user.Photo
			broadcast <- update

		case EditMessage:
			mesMap[mesId] = Message{
				Id:       mesId,
				Uid:      currentUid,
				Time:     update.Message.Time,
				Message:  update.Message.Message,
				Username: update.User.UserName,
			}
			UserMap[currentUid].Messages[mesId].Message = update.Message.Message

			broadcast <- update
		case DeleteMessage:
			mesMap[mesId] = Message{
				Id:       mesId,
				Uid:      currentUid,
				Time:     update.Message.Time,
				Message:  "",
				Username: update.User.UserName,
			}
			UserMap[currentUid].Messages[mesId].Message = ""
			broadcast <- update
		default:
			fmt.Println("Unknown update type:", update.Type)
		}

		userData, err := json.Marshal(UserMap)
		if err != nil {
			fmt.Println(err)
		}
		ioutil.WriteFile("Users.json", userData, 0777)
		MesData, err := json.Marshal(mesMap)
		if err != nil {
			fmt.Println(err)
		}
		ioutil.WriteFile("Message.json", MesData, 0777)
		if err != nil {
			fmt.Println(err)
			delete(clients, ws)
			break
		}
		//fmt.Println(UserMap)
		//broadcast <- update
	}
}

func handleMessages() {
	for {
		update := <-broadcast
		for client := range clients {
			err := client.WriteJSON(update)
			if err != nil {
				fmt.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func main() {

	fs := http.FileServer(http.Dir("./Static/"))
	http.Handle("/uploaded/", http.StripPrefix("/uploaded/", fs))
	http.HandleFunc("/ws", handleConnections)
	http.HandleFunc("/upload", Upfile)
	http.HandleFunc("/allmessages", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		messageJson, _ := json.Marshal(mesMap)
		w.Write([]byte(messageJson))
	})
	http.HandleFunc("/allusers", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		usersJson, _ := json.Marshal(UserMap)
		w.Write([]byte(usersJson))
	})
	go handleMessages()
	fmt.Println("Server is listening on port 8080")
	http.ListenAndServe(":8080", nil)
}
