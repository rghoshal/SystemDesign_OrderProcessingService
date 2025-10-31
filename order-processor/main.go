package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Item struct {
	ProductID string  `json:"productId"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}

type Order struct {
	OrderID    string `json:"orderId"`
	CustomerID string `json:"customerId"`
	Status     string `json:"status"`
	CreatedAt  string `json:"createdAt"`
	Items      []Item `json:"items"`
}

const MaxRetries = 3

func main() {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	mongoURL := os.Getenv("MONGODB_SERVICE_URL")

	conn, err := connectRabbitMQ(rabbitURL)
	if err != nil {
		log.Fatal("Failed to connect:", err)
	}

	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal("Failed to open channel:", err)
	}
	defer ch.Close()

	err = ch.Qos(1, 0, false)
	if err != nil {
		log.Fatal("Failed to set QoS:", err)
	}

	// Declare the queue to ensure it exists
	_, err = ch.QueueDeclare(
		"orders_queue", // name
		true,           // durable
		false,          // delete when unused
		false,          // exclusive
		false,          // no-wait
		nil,            // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare queue:", err)
	}

	msgs, err := ch.Consume(
		"orders_queue", // queue
		"",             // consumer
		false,          // auto-ack
		false,          // exclusive
		false,          // no-local
		false,          // no-wait
		nil,            // args
	)
	if err != nil {
		log.Fatal("Failed to register consumer:", err)
	}

	log.Println("🚀 Order Processor started and Listening...")

	for msg := range msgs {
		var order Order
		json.Unmarshal(msg.Body, &order)

		log.Printf("⚙️  Processing order: %s", order.OrderID)

		time.Sleep(500 * time.Millisecond)

		order.Status = "completed"
		data, _ := json.Marshal(order)

		resp, err := http.Post(mongoURL+"/orders", "application/json", bytes.NewBuffer(data))
		if err == nil {
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
			log.Printf("✓ Order %s completed", order.OrderID)
			msg.Ack(false)
		} else {
			log.Printf("❌ Error: %v", err)
			msg.Nack(false, true)
		}
	}
}

func connectRabbitMQ(url string) (*amqp.Connection, error) {
	for i := 0; i < 10; i++ {
		conn, err := amqp.Dial(url)
		if err == nil {
			log.Println("✓ Connected to RabbitMQ")
			return conn, nil
		}
		log.Printf("Retrying... (%d/10)", i+1)
		time.Sleep(5 * time.Second)
	}
	return nil, nil
}
