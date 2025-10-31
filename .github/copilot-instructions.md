# Copilot instructions for the Idempotency demo microservices

Be concise and only modify files that are necessary. This repository is a small microservices demo showing an idempotent persistence strategy and an async processing pipeline. Use the notes below to make focused, low-risk edits.

- Architecture (big picture)
  - Services are wired in docker-compose.yml and run as separate containers.
  - order-service (Node/Express) receives HTTP POST /api/orders and publishes JSON messages to RabbitMQ queue `orders_queue`. See `order-service/server.js`.
  - order-processor (Go) consumes `orders_queue`, processes orders, and POSTs results to the Mongo service at `/orders`. See `order-processor/main.go`.
  - mongodb-service (Python/Flask) persists orders into MongoDB using an upsert on `orderId` (this is the idempotency mechanism). See `mongodb-service/app.py`.
  - Kong is configured as the HTTP gateway in `kong/kong.yml` (routes `/api/orders` to the `order-service`). Frontend calls the gateway at `http://localhost:8000`.

- Key files to reference when coding or changing behavior
  - `docker-compose.yml` — service topology, env var names and ports.
  - `order-service/server.js` — request validation, queue publish, header `x-retry-count` is set here.
  - `order-processor/main.go` — RabbitMQ consumer loop, ack/nack behavior, and HTTP POST to mongodb-service.
  - `mongodb-service/app.py` — `update_one(..., upsert=True)` implements idempotent save.
  - `kong/kong.yml` — gateway routes, key-auth and rate-limiting plugins.

- Important conventions & patterns (project-specific)
  - Inter-service comms: synchronous HTTP (service -> mongodb-service) for reads/writes and RabbitMQ for async work. Prefer using the existing endpoints and queue names rather than introducing new channels.
  - Idempotency: persistence is idempotent by design — the Mongo service uses upsert on `orderId`. When making changes, preserve `orderId` as the canonical id.
  - Message shape: orders are JSON objects with at least `orderId`, `customerId`, `items`, `createdAt`, `status`. Follow existing structure in `order-service` when producing messages.
  - Retry semantics: `order-service` sets header `x-retry-count` when publishing. The processor currently does not decrement/read it — if you add retry logic, update both producer and consumer.
  - DLQ: `orders_dlq` queue is asserted by `order-service`, but no explicit dead-letter routing is implemented. Note this before adding DLQ behavior.

- Developer workflows (how to run & debug)
  - Full stack (recommended): from repo root run `docker-compose up --build`. This brings up MongoDB (27017), RabbitMQ (5672, 15672), kong (8000/8001), order-service (3000), mongodb-service (4000), order-processor, and frontend (3001 -> 80).
  - Run services individually (for iterative work):
    - order-service: `cd order-service && npm install && node server.js` (env: RABBITMQ_URL, MONGODB_SERVICE_URL)
    - mongodb-service: `cd mongodb-service && pip install -r requirements.txt && python app.py` (env: MONGODB_URL)
    - order-processor: `cd order-processor && go mod download && go run main.go` (env: RABBITMQ_URL, MONGODB_SERVICE_URL)
    - frontend: `cd frontend && npm install && npm start`

- Port & env mapping (quick reference)
  - Mongo: 27017
  - RabbitMQ: 5672, management 15672
  - order-service: 3000
  - mongodb-service: 4000
  - Kong: 8000 (proxy), 8001 (admin)
  - frontend: 3001 → container port 80

- Tests & linting
  - There are no automated tests in the repo. Keep changes minimal and add small, focused tests if you modify core flows.

- When you make changes, check these behaviors manually
  - POST /api/orders (via Kong) results in a message in RabbitMQ (`orders_queue`) and a 201 response from `order-service`.
  - `order-processor` consumes and posts to mongodb-service `/orders` and the DB document should be upserted.
  - Health endpoints: `/health` exist on services (use them to validate readiness).

- Common low-risk edits examples
  - Add metrics/logging around queue publish/consume in `order-service` and `order-processor`.
  - Implement retry header handling in `order-processor` — ensure you read `x-retry-count` and update it if requeueing.
  - Small bugfixes in `mongodb-service` data validation, preserving `orderId` key and upsert behavior.

If anything here is unclear or you'd like a slightly different scope (more detail on Kong plugins, or an implemented DLQ pattern example), tell me which area to expand and I will update this file.
