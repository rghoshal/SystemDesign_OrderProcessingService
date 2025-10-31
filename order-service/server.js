const express = require("express");
const amqp = require("amqplib");
const http = require("http");

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const MONGODB_SERVICE =
  process.env.MONGODB_SERVICE_URL || "http://mongodb-service:4000";
const QUEUE_NAME = "orders_queue";

let channel;

function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`.toUpperCase();
}

async function connectRabbitMQ() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.assertQueue("orders_dlq", { durable: true });
    console.log("✓ Connected to RabbitMQ");
  } catch (error) {
    console.error("RabbitMQ error:", error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(MONGODB_SERVICE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => resolve(JSON.parse(body)));
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

app.post("/api/orders", async (req, res) => {
  try {
    if (!req.body.customerId || !req.body.items) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const orderId = generateOrderId();
    const order = {
      orderId,
      ...req.body,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(order)), {
      persistent: true,
      headers: { "x-retry-count": 0 },
    });

    console.log(`📦 Order ${orderId} queued`);
    res.status(201).json({ orderId, message: "Order queued" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await makeRequest("GET", "/orders");
    res.json(orders);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

connectRabbitMQ();
app.listen(3000, () => console.log("🚀 Order Service on port 3000"));
