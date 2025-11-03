# Order Processing Service

The **Order Processing Service** in this repository is a minimalistic design that demonstrates key aspects of **system design** for an e-commerce application.

## 🧩 Components

The system contains the following components:

- **Front-End User Interaction**
- **Message Queuing (RabbitMQ)**
- **Database** containing key data
- **Order Processor** with a consumption mechanism to read data from the queue and process it
- **Order Service**

## 🐳 Architecture

The entire architecture is **containerized** using Docker.

## 🚀 Steps to Run the Application

1. **Pull the repository**

   ```bash
   git clone <repo_url>
   cd <repo_name>
