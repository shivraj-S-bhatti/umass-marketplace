# UMass Marketplace Makefile
# Provides convenient commands for development and deployment

.PHONY: help up down api web test clean install

# Default target
help:
	@echo "UMass Marketplace Development Commands"
	@echo "======================================"
	@echo ""
	@echo "Development:"
	@echo "  make up          - Start all services with Docker Compose"
	@echo "  make down        - Stop all services"
	@echo "  make api         - Start API locally (requires database)"
	@echo "  make web         - Start frontend locally"
	@echo "  make install     - Install all dependencies"
	@echo ""
	@echo "Testing:"
	@echo "  make test        - Run all tests"
	@echo "  make test-api    - Run API tests only"
	@echo "  make test-web    - Run frontend tests only"
	@echo ""
	@echo "Database:"
	@echo "  make db-up       - Start database only"
	@echo "  make db-down     - Stop database"
	@echo "  make db-reset    - Reset database (WARNING: deletes all data)"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make logs        - Show service logs"
	@echo "  make gen-api     - Generate TypeScript API client"

# Start all services
up:
	@echo "Starting UMass Marketplace services..."
	@if command -v docker >/dev/null 2>&1; then \
		docker compose -f deploy/docker-compose.yml up -d; \
		echo "Services started! Access points:"; \
		echo "  Frontend: http://localhost:5173"; \
		echo "  API: http://localhost:8080"; \
		echo "  Swagger: http://localhost:8080/swagger-ui"; \
	else \
		echo "Docker not found. Starting services locally..."; \
		$(MAKE) dev; \
	fi

# Start development environment (no Docker required)
dev:
	@echo "Starting development environment..."
	@echo "Starting database..."
	@if command -v docker >/dev/null 2>&1; then \
		docker compose -f deploy/docker-compose.yml up db -d; \
		echo "Database started with Docker"; \
	elif command -v psql >/dev/null 2>&1; then \
		echo "PostgreSQL found locally"; \
		@if ! pg_isready -q; then \
			echo "Starting PostgreSQL..."; \
			brew services start postgresql || sudo service postgresql start; \
		fi; \
		createdb umarket 2>/dev/null || true; \
		echo "Database ready"; \
	else \
		echo "No database found. Using H2 in-memory database..."; \
		$(MAKE) dev-h2; \
	fi
	@echo "Starting API and Frontend..."
	@$(MAKE) -j2 api web

# Start with H2 database (no external database required)
dev-h2:
	@echo "Starting with H2 in-memory database..."
	@cd api && JAVA_HOME=$$(/usr/libexec/java_home -v 21) mvn spring-boot:run -Dspring.profiles.active=h2 &
	@cd web && npm run dev &
	@echo "Services started with H2 database!"
	@echo "  Frontend: http://localhost:5173"
	@echo "  API: http://localhost:8080"
	@echo "  H2 Console: http://localhost:8080/h2-console"

# Stop all services
down:
	@echo "Stopping UMass Marketplace services..."
	docker compose -f deploy/docker-compose.yml down

# Start API locally (requires database to be running)
api:
	@echo "Starting API locally..."
	cd api && mvn spring-boot:run

# Start frontend locally
web:
	@echo "Starting frontend locally..."
	cd web && npm run dev

# Install all dependencies
install:
	@echo "Installing dependencies..."
	cd web && npm install
	cd api && mvn dependency:resolve

# Run all tests
test: test-api test-web

# Run API tests
test-api:
	@echo "Running API tests..."
	cd api && mvn test

# Run frontend tests
test-web:
	@echo "Running frontend tests..."
	cd web && npm test

# Start database only
db-up:
	@echo "Starting database..."
	docker compose -f deploy/docker-compose.yml up db -d

# Stop database
db-down:
	@echo "Stopping database..."
	docker compose -f deploy/docker-compose.yml stop db

# Reset database (WARNING: deletes all data)
db-reset:
	@echo "WARNING: This will delete all data in the database!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker compose -f deploy/docker-compose.yml down -v
	docker compose -f deploy/docker-compose.yml up db -d

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	cd api && mvn clean
	cd web && rm -rf dist node_modules/.vite
	docker system prune -f

# Show service logs
logs:
	docker compose -f deploy/docker-compose.yml logs -f

# Generate TypeScript API client
gen-api:
	@echo "Generating TypeScript API client..."
	cd web && npm run gen:api

# Development setup
dev-setup: install db-up
	@echo "Development environment ready!"
	@echo "Run 'make api' in one terminal and 'make web' in another"
