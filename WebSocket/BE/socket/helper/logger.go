package helper

import (
	"log"
	"os"
)

var Logger *log.Logger

func InitLogger() {
	LogFile, err := os.OpenFile("server.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Lỗi mở file log:", err)
	}

	// Thiết lập logger mới.
	Logger = log.New(LogFile, "prefix ", log.LstdFlags|log.Lshortfile)
}
