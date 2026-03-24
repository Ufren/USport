.PHONY: build package package-linux package-windows run clean test lint fmt mod deps generate deploy deploy-linux

APP_NAME=usport-api
BUILD_DIR=./bin
MAIN_FILE=./cmd/server/main.go
GENERATE_FILE=./cmd/generate/main.go

build:
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_FILE)

package:
	./scripts/build.sh

package-linux:
	TARGET_OS=linux TARGET_ARCH=amd64 ./scripts/build.sh

package-windows:
	powershell -ExecutionPolicy Bypass -File .\scripts\build.ps1

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

deploy:
	./scripts/deploy.sh

deploy-linux:
	./scripts/deploy.sh

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
	@echo "  make package   - Build a release package for Linux"
	@echo "  make package-linux   - Build Linux release package"
	@echo "  make package-windows - Build Windows release package"
	@echo "  make generate  - Generate models and queries using GORM Gen"
	@echo "  make deploy    - Build and deploy to a Linux server through ssh/scp"
	@echo "  make init-db   - Initialize database with SQL script"
