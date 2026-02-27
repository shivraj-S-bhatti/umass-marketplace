# Contributing to UMass Marketplace

Thank you for your interest in contributing to UMass Marketplace! This guide will help you get started with development.

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Java 21+
- Maven 3.8+
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/umass-marketplace.git
   cd umass-marketplace
   ```

2. **Set up environment**
   ```bash
   cp deploy/env.example deploy/.env
   ```

3. **Start development environment**
   ```bash
   # Start database
   docker compose -f deploy/docker-compose.yml up db -d
   
   # Install dependencies
   npm install -C web
   
   # Start API (terminal 1)
   mvn spring-boot:run -f api
   
   # Start frontend (terminal 2)
   npm run dev -C web
   ```

## 🌳 Branching Strategy

We use a main-first workflow:

- **`main`** - Production branch and default PR target
- **`feature/*`** - Feature and improvement branches
- **`fix/*`** - Bug-fix branches

### Branch Naming Convention

```
feature/listing-image-upload
feature/user-dashboard
fix/chat-shared-listing-regression
```

## 📝 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following our style guidelines
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# API tests
mvn test -f api

# Frontend tests
npm test -C web

# Integration tests
mvn verify -f api

# Linting
npm run lint -C web
```

### 4. Commit Your Changes

Follow our commit message convention:

```
type(scope): brief description

Detailed description of changes

Closes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add image upload endpoint for listings

Implements multipart file upload with validation and S3 storage integration.

Closes #45
```

```
fix(web): resolve form validation error on mobile

Fixes issue where form validation messages were not displaying properly on mobile devices.

Closes #67
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Create a pull request targeting the `main` branch.

## 🎨 Code Style Guidelines

### Java (API)

- Follow Google Java Style Guide
- Use meaningful variable and method names
- Add Javadoc comments for public methods
- Keep methods under 50 lines when possible
- Use Lombok annotations to reduce boilerplate

```java
/**
 * Creates a new marketplace listing for the authenticated user.
 * 
 * @param request the listing creation request
 * @return the created listing response
 * @throws ValidationException if the request is invalid
 */
@PostMapping
public ResponseEntity<ListingResponse> createListing(
    @Valid @RequestBody CreateListingRequest request
) {
    // Implementation
}
```

### TypeScript/React (Frontend)

- Use functional components with hooks
- Prefer TypeScript over JavaScript
- Use meaningful component and variable names
- Keep components under 200 lines
- Use proper TypeScript types

```typescript
interface ListingCardProps {
  listing: Listing
  onEdit?: (listing: Listing) => void
  onDelete?: (listing: Listing) => void
}

export function ListingCard({ listing, onEdit, onDelete }: ListingCardProps) {
  // Implementation
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Keep custom CSS minimal

```tsx
<div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
  <Card className="flex-1 hover:shadow-lg transition-shadow">
    {/* Content */}
  </Card>
</div>
```

## 🧪 Testing Guidelines

### API Testing

- Write unit tests for all service methods
- Add integration tests for API endpoints
- Use Testcontainers for database tests
- Aim for 80%+ code coverage

```java
@Test
void shouldCreateListingWithValidRequest() {
    // Given
    CreateListingRequest request = new CreateListingRequest();
    request.setTitle("Test Item");
    request.setPrice(new BigDecimal("100.00"));
    
    // When
    ResponseEntity<ListingResponse> response = listingController.createListing(request);
    
    // Then
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    assertThat(response.getBody().getTitle()).isEqualTo("Test Item");
}
```

### Frontend Testing

- Write unit tests for components
- Test user interactions and form validation
- Mock API calls in tests
- Use React Testing Library best practices

```typescript
test('should display listing information', () => {
  const mockListing = createMockListing()
  
  render(<ListingCard listing={mockListing} />)
  
  expect(screen.getByText(mockListing.title)).toBeInTheDocument()
  expect(screen.getByText('$100.00')).toBeInTheDocument()
})
```

## 📚 Documentation

### Code Documentation

- Add Javadoc comments for public API methods
- Include README files for complex modules
- Document configuration options
- Keep documentation up-to-date

### API Documentation

- Use OpenAPI/Swagger annotations
- Provide example requests and responses
- Document error codes and messages
- Keep API documentation current

```java
@Operation(
    summary = "Create listing",
    description = "Creates a new marketplace listing for the authenticated user"
)
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "Listing created successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid request data"),
    @ApiResponse(responseCode = "401", description = "Authentication required")
})
@PostMapping
public ResponseEntity<ListingResponse> createListing(@Valid @RequestBody CreateListingRequest request) {
    // Implementation
}
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, Node.js version, etc.
6. **Screenshots**: If applicable
7. **Logs**: Relevant error logs

## 💡 Feature Requests

When suggesting features:

1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: How you think it should work
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## 🔍 Code Review Process

### For Contributors

- Ensure all tests pass
- Follow code style guidelines
- Write clear commit messages
- Respond to review feedback promptly
- Keep PRs focused and reasonably sized

### For Reviewers

- Review code for correctness and style
- Check test coverage and quality
- Verify documentation is updated
- Test the changes locally if needed
- Provide constructive feedback

## 🚀 Release Process

1. **Feature Complete**: All features for the release are complete
2. **Testing**: All tests pass, including integration tests
3. **Documentation**: Update README and API docs
4. **Version Bump**: Update version numbers
5. **Release Notes**: Document changes and new features
6. **Deploy**: Deploy to staging and production

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: marketplace@umass.edu
- **Office Hours**: TBD (to be announced)

## 📄 License

By contributing to UMass Marketplace, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to UMass Marketplace! 🎉
