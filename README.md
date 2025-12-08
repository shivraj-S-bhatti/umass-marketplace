# Everything UMass

A student-only marketplace for buying and selling items on campus. Built with Spring Boot and React.

## 🎯 Overview

Everything UMass is a closed, student-only marketplace designed to help UMass students buy and sell items safely on campus. Features include marketplace listings, chat functionality, location-based maps, and trust scores. The platform serves as a Craigslist alternative specifically for the UMass community.

## 🏗️ Architecture

This is a monorepo containing:

- **`api/`** - Spring Boot 3 API with Java 21, PostgreSQL, and Flyway migrations
- **`web/`** - React + TypeScript frontend with Vite, Tailwind CSS, and shadcn/ui
- **`deploy/`** - Docker Compose setup for local development
- **`.github/workflows/`** - CI/CD pipeline with GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Java 21+ (for local development)
- Maven 3.8+ (for local development)

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/your-org/everything-umass.git
cd everything-umass

# Copy environment variables
cp deploy/env.example deploy/.env

# Start all services
docker compose -f deploy/docker-compose.yml up -d

# Install frontend dependencies (for local development)
npm install -C web

# Start frontend development server
npm run dev -C web

# Start API (in another terminal)
mvn spring-boot:run -f api
```

### Access Points

- **Frontend**: http://localhost:5173
- **API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui
- **Database**: localhost:5432 (umarket/umarket/umarket)

## 📚 API Documentation

The API is fully documented with OpenAPI/Swagger:

- **Swagger UI**: http://localhost:8080/swagger-ui
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs

### Key Endpoints

```bash
# Health check
GET /health

# Listings
GET /api/listings?page=0&size=20&q=laptop&category=Electronics
POST /api/listings
GET /api/listings/{id}
```

### Example API Usage

```bash
# Create a listing
curl -X POST http://localhost:8080/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Pro 13-inch",
    "description": "Great condition, barely used",
    "price": 1200.00,
    "category": "Electronics",
    "condition": "Like New"
  }'

# Get listings
curl "http://localhost:8080/api/listings?page=0&size=10"
```

## 🛠️ Development

### Local Development Setup

1. **Database**: Start PostgreSQL with Docker Compose
2. **API**: Run Spring Boot application locally
3. **Frontend**: Use Vite dev server with hot reload

```bash
# Start database only
docker compose -f deploy/docker-compose.yml up db -d

# Run API locally
mvn spring-boot:run -f api

# Run frontend locally
npm run dev -C web
```

### Code Generation

```bash
# Generate TypeScript API client from OpenAPI spec
npm run gen:api -C web
```

### Testing

```bash
# Run API tests
mvn test -f api

# Run frontend tests
npm test -C web

# Run integration tests with Testcontainers
mvn verify -f api
```

## 🗄️ Database

The application uses PostgreSQL with Flyway for database migrations.

### Schema

- **Users**: Student information (id, email, name, picture_url)
- **Listings**: Items for sale (id, title, description, price, category, condition, status, seller_id)

### Migrations

Database schema is managed with Flyway migrations in `api/src/main/resources/db/migration/`.

## 🔐 Authentication

Currently, the application allows anonymous access for MVP. OAuth2 Google integration is prepared but not yet implemented.

### Planned Authentication Flow

1. Google OAuth2 with @umass.edu domain restriction
2. JWT token-based authentication
3. User session management

## 🎨 Frontend

Built with modern React stack:

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Query** for API state management
- **React Router** for navigation

### Key Features

- Responsive design for mobile and desktop
- Dark theme support
- Real-time form validation
- Toast notifications
- Loading states and error handling

## 🐳 Deployment

### Docker Compose

The `deploy/` directory contains production-ready Docker Compose configuration:

```bash
# Production deployment
docker compose -f deploy/docker-compose.yml up -d
```

### Environment Variables

Copy `deploy/env.example` to `deploy/.env` and configure:

```bash
# Database
POSTGRES_DB=umarket
POSTGRES_USER=umarket
POSTGRES_PASSWORD=umarket

# OAuth2 (when implemented)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend
VITE_API_BASE_URL=http://localhost:8080
```

## 🧪 Testing

### API Testing

- **Unit Tests**: JUnit 5 with Mockito
- **Integration Tests**: Testcontainers with PostgreSQL
- **API Tests**: Spring Boot Test with MockMvc

### Frontend Testing

- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright (planned)
- **Linting**: ESLint with TypeScript rules

## 📋 Project Status

### ✅ Completed (MVP)

- [x] Monorepo structure with API and frontend
- [x] Spring Boot API with PostgreSQL and Flyway
- [x] React frontend with modern tooling
- [x] Docker Compose for local development
- [x] CI/CD pipeline with GitHub Actions
- [x] Swagger/OpenAPI documentation
- [x] Basic CRUD operations for listings
- [x] Responsive UI with dark theme

### 🚧 In Progress

- [ ] Google OAuth2 authentication
- [ ] User dashboard with listing management
- [ ] Image upload for listings
- [ ] Search and filtering improvements

### 📅 Planned

- [ ] Real-time messaging between buyers and sellers
- [ ] Price comparison features
- [ ] Mobile app (React Native)
- [ ] Admin moderation tools
- [ ] Multi-campus support

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and code standards.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/everything-umass/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/everything-umass/discussions)
- **Email**: everything@umass.edu

---

Built with ❤️ for UMass students
