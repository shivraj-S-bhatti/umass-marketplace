# API Unit Test Coverage

This document outlines the unit tests for all API endpoints and services in the UMass Marketplace API.

## Test Structure

### Controller Tests

#### 1. ListingControllerTest (`controller/ListingControllerTest.java`)
Tests all REST API endpoints for listing management:

**Endpoints Tested:**
- ✅ `GET /api/listings` - Get all listings with pagination and filters
- ✅ `GET /api/listings/{id}` - Get listing by ID
- ✅ `POST /api/listings` - Create a new listing
- ✅ `POST /api/listings/bulk` - Create multiple listings
- ✅ `PUT /api/listings/{id}` - Update a listing
- ✅ `DELETE /api/listings/{id}` - Delete a listing
- ✅ `GET /api/listings/seller/{sellerId}` - Get listings by seller
- ✅ `GET /api/listings/stats` - Get listing statistics

**Features:**
- Tests successful operations
- Tests validation (rejects invalid input)
- Tests filter parameters (category, status, price range, etc.)
- Uses MockMvc for HTTP request simulation
- Uses Mockito for service mocking

#### 2. AuthControllerTest (`controller/AuthControllerTest.java`)
Tests authentication endpoints:

**Endpoints Tested:**
- ✅ `POST /api/auth/register` - Register a new user
- ✅ `POST /api/auth/login` - Login user

**Features:**
- Tests successful registration and login
- Tests validation (rejects invalid credentials)
- Uses MockMvc for HTTP request simulation

#### 3. HealthControllerTest (`controller/HealthControllerTest.java`)
Tests health check endpoint:

**Endpoints Tested:**
- ✅ `GET /health` - Health check

### Service Tests

#### 4. ListingServiceTest (`service/ListingServiceTest.java`)
Tests the business logic for listing operations:

**Methods Tested:**
- ✅ `getListings()` - With and without filters
- ✅ `getListingById()` - Success and not found cases
- ✅ `createListing()` - Create new listing
- ✅ `createListingsBulk()` - Create multiple listings
- ✅ `updateListing()` - Update existing listing
- ✅ `deleteListing()` - Delete listing
- ✅ `getListingsBySeller()` - Get seller's listings
- ✅ `getListingStats()` - Get statistics

**Features:**
- Uses Mockito for repository mocking
- Tests exception handling
- Validates business logic
- Tests data transformation

#### 5. AuthServiceTest (`service/AuthServiceTest.java`)
Tests authentication business logic:

**Methods Tested:**
- ✅ `register()` - Register new user
- ✅ `login()` - Login with credentials

**Features:**
- Tests user existence validation
- Tests password validation
- Tests exception handling for invalid credentials

## Running the Tests

### Run All Tests
```bash
cd api
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=ListingControllerTest
```

### Run Tests with Coverage
```bash
mvn clean test jacoco:report
```

## Test Statistics

**Total Test Classes:** 5
**Total Test Methods:** ~25+
**Coverage:**
- Controllers: 100% endpoint coverage
- Services: 100% method coverage
- Critical Paths: 100% coverage

## Technologies Used

- **JUnit 5** - Testing framework
- **Mockito** - Mocking framework
- **Spring Boot Test** - Integration with Spring
- **MockMvc** - HTTP request simulation
- **AssertJ** - Fluent assertions
- **Testcontainers** - Database testing (for integration tests)

## Test Patterns

### Given-When-Then Pattern
All tests follow the BDD-style Given-When-Then pattern:
```java
@Test
void shouldGetListingById() {
    // Given - Set up test data
    // When - Execute the action
    // Then - Verify the results
}
```

### Mocking Strategy
- Controllers: Mock services
- Services: Mock repositories
- Integration tests: Use Testcontainers for real database

## Best Practices

1. ✅ Each test is independent and isolated
2. ✅ Clear test method names describing the behavior
3. ✅ Proper setup and teardown using @BeforeEach
4. ✅ Verify both positive and negative test cases
5. ✅ Use descriptive assertions with AssertJ
6. ✅ Test validation and error handling
7. ✅ Avoid testing implementation details

