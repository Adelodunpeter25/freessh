package main

import (
	"freessh-backend/internal/ipc"
	"log"
)

func main() {
	server := ipc.NewServer()
	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}
