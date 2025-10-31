FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN go build -o processor .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/processor .
CMD ["./processor"]
