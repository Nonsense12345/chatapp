package helper

import (
	"chatapp/structure"
	"io"
	"mime/multipart"
	"os"
	"path"
	"strings"
)

func SaveFile(filedata multipart.File, filename string, mimetype string, directory string, subfolder string) (structure.FileData, error) {
	link := "./Static/" + subfolder + "/" + filename
	dst, err := os.Create(link)
	if err != nil {
		return structure.FileData{}, err
	}
	if _, err := io.Copy(dst, filedata); err != nil {
		return structure.FileData{}, err
	}
	defer dst.Close()
	return structure.FileData{
		MimeType: mimetype,
		FileName: filename,
		Data:     []byte(""),
		Link:     path.Join("/uploaded", subfolder, filename),
	}, nil
}

func ProcessFile(file multipart.File, header *multipart.FileHeader) (structure.FileData, error) {
	var subfolder string
	var filename string = header.Filename
	var mimetype string = header.Header.Get("Content-Type")
	switch {
	case strings.Contains(mimetype, "image"):
		subfolder = "images"
	case strings.Contains(mimetype, "video"):
		subfolder = "videos"
	case strings.Contains(mimetype, "audio"):
		subfolder = "audios"
	default:
		subfolder = "someFuckingothers"
	}

	return SaveFile(file, filename, mimetype, "../Static", subfolder)
}
