# 🏗️ Order Processing Service

![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?logo=rabbitmq&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🧩 Overview

The **Order Processing Service** is a minimalistic e-commerce system design showcasing key architectural concepts like **message queuing**, **containerization**, and **microservices communication**.

This setup demonstrates:
- **Front-End user interaction**
- **Message queuing (RabbitMQ)**
- **Database integration**
- **Background order processing**
- **Containerized architecture using Docker Compose**

---

## 🧠 Architecture Diagram

```text
                +----------------------+
                |     Frontend UI      |
                |  (React.js)          |
                +----------+-----------+
                           |
                           |  (HTTP POST / API Call)
                           v
                +----------------------+
                |     Order Service    |
                |   (Receives Orders)  |
                +----------+-----------+
                           |
                           |  (Publishes to Queue)
                           v
                +----------------------+
                |      RabbitMQ        |
                | (Message Broker)     |
                +----------+-----------+
                           |
                           |  (Consumed by Worker)
                           v
                +----------------------+
                |   Order Processor    |
                | (Consumes, Stores)   |
                |  Backend Golang code |
                +----------+-----------+
                           |
                           |  (DB Write)
                           v
                +----------------------+
                |     Maria DB         |
                +----------------------+

⚙️ Components
ComponentDescriptionFrontend : React-based UI for submitting orders
Order Service : Receives orders and publishes messages to RabbitMQ Message queue for order communication.
Order Processor : Worker service that consumes messages and writes to DB
Database : MariaDB instance storing processed orders

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

2️⃣ Build and Run with Docker
docker compose build
docker compose up

3️⃣ Access the Application
Frontend UI: http://localhost:3001
RabbitMQ Dashboard: http://localhost:15672 (Default user: ****, password: ****)

🧪 How It Works
The user fills order details in the web UI.
The Order Service sends the data via a POST request.
The order is added to the RabbitMQ queue.
The Order Processor consumes the message and stores it in the database.
The processed data can then be queried or visualized.

🧰 Tech Stack
Frontend: React.js
Backend: Node.js
Message Broker: RabbitMQ
Database: PostgreSQL
Containerization: Docker Compose

📜 License
This project is licensed under the MIT License.

🙌 Acknowledgements

RabbitMQ Docs
Docker Docs
PostgreSQL Docs


