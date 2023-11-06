package structure

import "time"

type UpdateType string

const (
	AddMessage    UpdateType = "ADD_MESSAGE"
	EditMessage   UpdateType = "EDIT_MESSAGE"
	DeleteMessage UpdateType = "DELETE_MESSAGE"
	UserJoin      UpdateType = "USER_JOIN"
	UserLeave     UpdateType = "USER_LEAVE"
	UpFile        UpdateType = "UpFile"
)

type Update struct {
	Type    UpdateType `json:"type"`
	User    User       `json:"user,omitempty"`
	Message Message    `json:"message,omitempty"`
}

type Message struct {
	Id       int64    `json:"mesid"`
	Photo    string   `json:"photo"`
	Uid      int64    `json:"uid"`
	Time     string   `json:"time"`
	Username string   `json:"username"`
	Message  string   `json:"message"`
	File     FileData `json:"File"`
}

type User struct {
	Id         int64
	UserName   string `json:"UserName"`
	RemoteAddr string
	CreateAt   time.Time
	Photo      string `json:"Photo"`
	Messages   []Message
}

type FileData struct {
	MimeType string `json:"mime_type"`
	FileName string `json:"file_name"`
	Link     string `json:"link"`
	Data     []byte `json:"data"`
}
