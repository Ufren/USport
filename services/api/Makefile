.PHONY: build run clean test lint fmt mod deps generate

APP_NAME=usport-api
BUILD_DIR=./bin
MAIN_FILE=./cmd/server/main.go
GENERATE_FILE=./cmd/generate/main.go

build:
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_FILE)

run: build
	$(BUILD_DIR)/$(APP_NAME)

dev:
	go run $(MAIN_FILE)

clean:
	rm -rf $(BUILD_DIR)
	go clean

test:
	go test -v -cover ./...

lint:
	golangci-lint run

fmt:
	go fmt ./...

mod:
	go mod tidy

deps:
	go mod download

generate:
	go run $(GENERATE_FILE)

init-db:
	mysql -u root -p < scripts/init.sql

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build     - Build the application"
	@echo "  make run       - Build and run"
	@echo "  make dev       - Run in development mode"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make test      - Run tests"
	@echo "  make lint      - Run linter"
	@echo "  make fmt       - Format code"
	@echo "  make mod       - Tidy modules"
	@echo "  make deps      - Download dependencies"
	@echo "  make generate  - Generate models and queries using GORM Gen"
	@echo "  make init-db   - Initialize database with SQL script"
