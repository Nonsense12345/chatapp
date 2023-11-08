package main

import (
	"chatapp/helper"
	. "chatapp/structure"
	"encoding/json"

	"io/ioutil"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool)

var broadcast = make(chan Update)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var uId int64

var mesId int64 = 1
var UserMap = make(map[int64]User)
var mesMap = make(map[int64]Message)

func Init() {
	helper.InitLogger()
}

func Upfile(w http.ResponseWriter, r *http.Request) {
	helper.Logger.Println("hello")
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
	helper.Logger.Println(r.FormValue("message"))
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
	helper.Logger.Println(r.RemoteAddr)

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		helper.Logger.Println(err)
	}
	var user User
	var currentUid int64

	if err != nil {
		helper.Logger.Println(err)
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
				helper.Logger.Println("Client has gone away:", err)
			} else {
				helper.Logger.Println(err)
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
			helper.Logger.Println(user.Photo)
			UserMap[uId] = user
			currentUid = uId

			atomic.AddInt64(&uId, 1)
			broadcast <- Update{
				Type: UserJoin,
				User: user,
			}

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
			helper.Logger.Println("Unknown update type:", update.Type)
		}

		userData, err := json.Marshal(UserMap)
		if err != nil {
			helper.Logger.Println(err)
		}
		ioutil.WriteFile("Users.json", userData, 0777)
		MesData, err := json.Marshal(mesMap)
		if err != nil {
			helper.Logger.Println(err)
		}
		ioutil.WriteFile("Message.json", MesData, 0777)
		if err != nil {
			helper.Logger.Println(err)
			delete(clients, ws)
			break
		}

	}
}

func handleMessages() {
	for {
		update := <-broadcast
		for client := range clients {
			err := client.WriteJSON(update)
			if err != nil {
				helper.Logger.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func main() {
	Init()
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
	helper.Logger.Println("Server is listening on port 8080")
	http.ListenAndServe(":8080", nil)
}
