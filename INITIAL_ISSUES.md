# Initial GitHub Issues for UMass Marketplace

Copy these issues into your GitHub repository to get started with project management.

## Issue 1: API - Listing entity + repository + basic controller

**Labels:** `api`, `backend`, `priority:high`

**Description:**
Create the core listing functionality with JPA entity, repository, and REST controller.

**Acceptance Criteria:**
- [x] Listing entity with all required fields
- [x] ListingRepository with custom query methods
- [x] ListingController with GET (paginated) and POST endpoints
- [x] Request/response DTOs with validation
- [x] Swagger documentation with examples
- [ ] Unit tests for repository and controller

**Estimated Effort:** 4-6 hours

---

## Issue 2: API - Swagger/OpenAPI + nice tags + examples

**Labels:** `api`, `documentation`, `priority:medium`

**Description:**
Enhance API documentation with comprehensive Swagger/OpenAPI setup.

**Acceptance Criteria:**
- [ ] Configure springdoc-openapi properly
- [ ] Add detailed API documentation with examples
- [ ] Group endpoints with meaningful tags
- [ ] Add request/response schemas
- [ ] Include error response documentation
- [ ] Test Swagger UI accessibility

**Estimated Effort:** 2-3 hours

---

## Issue 3: API - DB migration wiring + local Postgres via compose

**Labels:** `api`, `database`, `priority:high`

**Description:**
Set up database migrations and local PostgreSQL development environment.

**Acceptance Criteria:**
- [ ] Flyway migrations working properly
- [ ] Docker Compose PostgreSQL service
- [ ] Database connection configuration
- [ ] Migration scripts for initial schema
- [ ] Health checks for database service
- [ ] Documentation for local setup

**Estimated Effort:** 3-4 hours

---

## Issue 4: WEB - Tailwind + shadcn/ui setup + base layout

**Labels:** `web`, `frontend`, `priority:high`

**Description:**
Set up the frontend foundation with Tailwind CSS and shadcn/ui components.

**Acceptance Criteria:**
- [ ] Tailwind CSS configured and working
- [ ] shadcn/ui components installed and configured
- [ ] Base layout component with navigation
- [ ] Dark theme support
- [ ] Responsive design
- [ ] Component library documentation

**Estimated Effort:** 4-5 hours

---

## Issue 5: WEB - Explore listings page wired to /api/listings

**Labels:** `web`, `frontend`, `priority:high`

**Description:**
Create the main listings page that displays items from the API.

**Acceptance Criteria:**
- [ ] Listings page component
- [ ] API integration with React Query
- [ ] Pagination support
- [ ] Loading and error states
- [ ] Responsive grid layout
- [ ] Search functionality (basic)

**Estimated Effort:** 5-6 hours

---

## Issue 5.5: WEB - Fix JavaScript context issue in React Query mutations

**Labels:** `web`, `frontend`, `bug`, `priority:high`

**Description:**
Fix JavaScript 'this' context loss when passing methods to React Query mutations.

**Acceptance Criteria:**
- [x] Identify 'this.request is not a function' error
- [x] Create bound functions to preserve context
- [x] Update all mutation calls to use bound functions
- [x] Test create listing functionality works end-to-end
- [x] Add debugging logs for troubleshooting

**Technical Details:**
When passing `apiClient.createListing` directly to `useMutation`, JavaScript loses the `this` context. Solution was to create bound functions that explicitly call methods with correct context.

**Estimated Effort:** 1 hour

---

## Issue 6: WEB - Create listing form with zod validation

**Labels:** `web`, `frontend`, `priority:high`

**Description:**
Build the form for creating new marketplace listings.

**Acceptance Criteria:**
- [x] Create listing form component
- [x] Zod schema validation
- [x] Form submission to API
- [x] Success/error handling
- [x] Form field validation
- [x] Responsive design

**Estimated Effort:** 4-5 hours

---

## Issue 7: DEVEX - CI pipeline green for both api/web

**Labels:** `devops`, `ci`, `priority:medium`

**Description:**
Set up GitHub Actions CI pipeline for automated testing and validation.

**Acceptance Criteria:**
- [ ] GitHub Actions workflow configured
- [ ] Java/Maven testing pipeline
- [ ] Node.js/npm testing pipeline
- [ ] Docker build validation
- [ ] Code quality checks (ESLint, Spotless)
- [ ] Pipeline runs on PR and push

**Estimated Effort:** 3-4 hours

---

## Issue 8: SECURITY - OAuth2 Google login (stub) + allowlist flag

**Labels:** `security`, `auth`, `priority:medium`

**Description:**
Implement Google OAuth2 authentication with UMass domain restriction.

**Acceptance Criteria:**
- [ ] Spring Security OAuth2 configuration
- [ ] Google OAuth2 integration
- [ ] @umass.edu domain allowlist
- [ ] JWT token handling
- [ ] User session management
- [ ] Frontend login/logout flow

**Estimated Effort:** 6-8 hours

---

## Issue 9: TESTS - Testcontainers basic CRUD test

**Labels:** `testing`, `api`, `priority:medium`

**Description:**
Add comprehensive integration tests using Testcontainers.

**Acceptance Criteria:**
- [ ] Testcontainers setup for PostgreSQL
- [ ] Integration tests for ListingRepository
- [ ] API endpoint integration tests
- [ ] Database migration tests
- [ ] Test data setup and cleanup
- [ ] CI pipeline integration

**Estimated Effort:** 3-4 hours

---

## Issue 10: DOCS - README polish + API usage examples + screenshots

**Labels:** `documentation`, `priority:low`

**Description:**
Enhance project documentation with comprehensive README and examples.

**Acceptance Criteria:**
- [ ] Comprehensive README with setup instructions
- [ ] API usage examples with curl commands
- [ ] Screenshots of key features
- [ ] Development setup guide
- [ ] Contributing guidelines
- [ ] Architecture documentation

**Estimated Effort:** 2-3 hours

---

## Issue 11: WEB - Dashboard page for seller's listings

**Labels:** `web`, `frontend`, `priority:medium`

**Description:**
Create a dashboard where sellers can manage their listings.

**Acceptance Criteria:**
- [ ] Dashboard page layout
- [ ] Display seller's listings
- [ ] Edit listing functionality
- [ ] Mark as sold/on hold
- [ ] Delete listing option
- [ ] Statistics overview

**Estimated Effort:** 5-6 hours

---

## Issue 12: API - Search and filtering improvements

**Labels:** `api`, `backend`, `priority:medium`

**Description:**
Enhance listing search and filtering capabilities.

**Acceptance Criteria:**
- [ ] Full-text search on title and description
- [ ] Category filtering
- [ ] Price range filtering
- [ ] Condition filtering
- [ ] Status filtering
- [ ] Sorting options (price, date, relevance)

**Estimated Effort:** 4-5 hours

---

## Issue 13: WEB - Image upload for listings

**Labels:** `web`, `frontend`, `priority:low`

**Description:**
Add image upload functionality for listing photos.

**Acceptance Criteria:**
- [ ] Image upload component
- [ ] File validation and compression
- [ ] Multiple image support
- [ ] Image preview and management
- [ ] Integration with listing creation/editing
- [ ] Error handling for upload failures

**Estimated Effort:** 6-8 hours

---

## Issue 14: API - User management and profiles

**Labels:** `api`, `backend`, `priority:low`

**Description:**
Implement user profile management and user-related endpoints.

**Acceptance Criteria:**
- [ ] User profile endpoints
- [ ] User registration flow
- [ ] Profile picture upload
- [ ] User statistics
- [ ] User preferences
- [ ] User search functionality

**Estimated Effort:** 5-6 hours

---

## Issue 15: WEB - Real-time messaging between buyers and sellers

**Labels:** `web`, `frontend`, `priority:low`

**Description:**
Add messaging system for communication between buyers and sellers.

**Acceptance Criteria:**
- [ ] WebSocket integration
- [ ] Chat interface
- [ ] Message history
- [ ] Real-time notifications
- [ ] Message status indicators
- [ ] Mobile-responsive design

**Estimated Effort:** 8-10 hours

---

## Instructions for Creating Issues

1. Go to your GitHub repository
2. Click "Issues" tab
3. Click "New issue"
4. Copy the title, description, and labels from each issue above
5. Assign appropriate team members
6. Set milestones if desired
7. Create the issue

## Project Board Setup

1. Go to "Projects" tab in GitHub
2. Create a new project board called "UMass Marketplace"
3. Add columns: "Backlog", "In Progress", "In Review", "Done"
4. Add the created issues to the appropriate columns
5. Set up automation rules for moving issues between columns
