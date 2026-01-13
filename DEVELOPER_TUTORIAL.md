# Developer Tutorial: Everything UMass Platform

**A Comprehensive Guide for New Developers**

This tutorial explains the technical decisions, architecture patterns, and engineering concepts used in the Everything UMass platform. It's designed to help new developers understand not just *what* we built, but *why* we built it this way—as if explaining in a technical interview.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack & Dependencies](#technology-stack--dependencies)
3. [Architecture Decisions](#architecture-decisions)
4. [Key Engineering Concepts](#key-engineering-concepts)
5. [Code Organization](#code-organization)
6. [Cloud & Hosting Cost Analysis](#cloud--hosting-cost-analysis)
7. [Development Workflow](#development-workflow)

---

## Project Overview

### What We're Building

Everything UMass is a student-only platform that combines:
- **Marketplace**: Buy/sell items with zero transaction fees
- **Events**: Campus event discovery and organization
- **Clubs**: Student organization management
- **Sports**: Pickup game coordination
- **Common Room**: Community forums

### Current Status

**MVP (Marketplace)**: Fully functional with listings, search, seller dashboard, and messaging.

**Future Modules**: Architecture in place for expansion (Sports, Events, Clubs, Common Room).

### Scale Target

- **1,000-2,000 daily active users (DAU)**
- **~10,000 registered users**
- **~50,000 listings per semester**
- **Peak traffic**: Class registration periods, move-in/move-out weeks

---

## Technology Stack & Dependencies

### Frontend Stack

#### Core Framework: React 18 + TypeScript

**Why React?**
- **Component reusability**: Our UI has many repeated patterns (listing cards, forms, modals)
- **Large ecosystem**: Rich library support for maps, forms, routing
- **Performance**: Virtual DOM handles frequent updates (real-time messaging, search filters)
- **Team familiarity**: Most web developers know React

**Why TypeScript?**
- **Type safety**: Prevents runtime errors in API calls, form validation, state management
- **Better IDE support**: Autocomplete for API responses, component props
- **Refactoring confidence**: Safe to rename/move code across 100+ files
- **Self-documenting**: Types serve as inline documentation

**Interview Answer**: "We chose React + TypeScript because we needed a component-based architecture that scales. TypeScript catches errors at compile-time—critical when dealing with API contracts that change. The type system documents our data structures, reducing onboarding time for new developers."

#### Build Tool: Vite

**Why Vite over Create React App or Webpack?**
- **10-100x faster dev server**: Uses native ES modules, no bundling during development
- **Instant HMR**: Changes reflect immediately without full page reload
- **Optimized production builds**: Uses Rollup for smaller bundles
- **Modern tooling**: Built for ES modules, TypeScript, and modern browsers

**Dependency**: `vite@^4.5.0`, `@vitejs/plugin-react@^4.1.1`

**Interview Answer**: "Vite dramatically improves developer experience. With 50+ React components, waiting 5-10 seconds for Webpack to rebuild was painful. Vite's ESM-based dev server starts in milliseconds and provides instant feedback. This directly impacts productivity—developers iterate faster."

#### State Management: React Query (TanStack Query)

**Why React Query over Redux or Context API?**
- **Server state management**: Handles API caching, background refetching, optimistic updates
- **Automatic caching**: Reduces API calls—critical for listing searches with filters
- **Built-in loading/error states**: Less boilerplate than manual useState/useEffect
- **Optimistic updates**: Update UI immediately, rollback on error (e.g., marking listing as sold)

**Dependency**: `@tanstack/react-query@^5.8.4`

**Key Features We Use**:
```typescript
// Automatic caching and refetching
const { data, isLoading } = useQuery({
  queryKey: ['listings', filters, page],
  queryFn: () => apiClient.getListings({ page, ...filters }),
  staleTime: 30000, // Cache for 30 seconds
})

// Optimistic mutations
const mutation = useMutation({
  mutationFn: updateListing,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['listings'] })
    // Snapshot previous value
    const previous = queryClient.getQueryData(['listings'])
    // Optimistically update
    queryClient.setQueryData(['listings'], newData)
    return { previous }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['listings'], context.previous)
  },
})
```

**Interview Answer**: "React Query eliminates 80% of our server state boilerplate. Instead of manually managing loading states, error handling, and cache invalidation, React Query handles it. For a marketplace with frequent searches and filters, the automatic caching prevents redundant API calls. The optimistic updates make the UI feel instant—users see changes immediately, even before the server confirms."

#### Routing: React Router v6

**Why React Router?**
- **Declarative routing**: Routes defined in JSX, easy to understand
- **Code splitting**: Lazy loading for pages reduces initial bundle size
- **Nested routes**: Supports complex layouts (dashboard with sub-pages)
- **Type-safe navigation**: Works well with TypeScript

**Dependency**: `react-router-dom@^6.20.1`

#### Form Handling: React Hook Form + Zod

**Why React Hook Form?**
- **Performance**: Uncontrolled components, minimal re-renders
- **Small bundle size**: ~9KB vs 45KB for Formik
- **Easy validation**: Integrates with Zod for type-safe schemas

**Why Zod?**
- **TypeScript-first**: Generates TypeScript types from schemas
- **Runtime validation**: Validates API responses, form inputs
- **Composable**: Build complex validation rules from simple primitives

**Dependencies**: 
- `react-hook-form@^7.48.2`
- `@hookform/resolvers@^3.3.2`
- `zod@^3.22.4`

**Example**:
```typescript
const createListingSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  price: z.number().positive("Price must be greater than 0"),
  description: z.string().max(2000).optional(),
})

type CreateListingForm = z.infer<typeof createListingSchema>

const { register, handleSubmit, formState: { errors } } = useForm<CreateListingForm>({
  resolver: zodResolver(createListingSchema),
})
```

**Interview Answer**: "React Hook Form + Zod gives us type-safe forms with minimal boilerplate. Zod schemas serve dual purpose: runtime validation and TypeScript type generation. This means our form validation logic is the single source of truth—no drift between TypeScript types and validation rules."

#### UI Components: shadcn/ui (Radix UI + Tailwind)

**Why shadcn/ui?**
- **Copy-paste components**: Own the code, customize freely (not a library dependency)
- **Accessibility**: Built on Radix UI primitives (ARIA-compliant)
- **Styling flexibility**: Tailwind CSS, easy to theme
- **No vendor lock-in**: Components live in our codebase

**Key Dependencies**:
- `@radix-ui/react-dialog@^1.1.15` - Modals
- `@radix-ui/react-dropdown-menu@^2.0.6` - Dropdowns
- `@radix-ui/react-toast@^1.1.5` - Notifications
- `tailwindcss@^3.3.5` - Utility-first CSS

**Interview Answer**: "shadcn/ui gives us production-ready, accessible components without the bloat of a full component library. Since we copy components into our codebase, we can customize them for our design system. Radix UI handles accessibility concerns (keyboard navigation, screen readers), which is critical for a student platform."

#### Styling: Tailwind CSS

**Why Tailwind?**
- **Rapid development**: No context switching between CSS files
- **Consistent design**: Utility classes enforce design system
- **Small bundle size**: Purges unused CSS in production
- **Responsive by default**: Mobile-first utilities

**Interview Answer**: "Tailwind accelerates development. Instead of writing custom CSS for every component, we use utility classes. This enforces consistency—all spacing uses the same scale, all colors come from our palette. The mobile-first approach means responsive design is built-in."

#### Maps & Location: Leaflet + Turf.js

**Why Leaflet?**
- **Open source**: No API keys or usage limits
- **Lightweight**: ~38KB vs 200KB+ for Google Maps
- **Customizable**: Full control over map styling
- **Mobile-friendly**: Touch gestures work out of the box

**Why Turf.js?**
- **Geospatial calculations**: Distance, area, point-in-polygon
- **Pure JavaScript**: No external API calls for distance calculations
- **Small bundle**: Only import what we need

**Dependencies**:
- `leaflet@^1.9.4`
- `react-leaflet@^4.2.1`
- `@turf/turf@^7.3.1`

**Interview Answer**: "Leaflet gives us full control over the map experience without vendor lock-in. For a campus marketplace, we need to show distance between users and listings. Turf.js calculates this client-side, reducing API calls. The combination is lightweight and works offline—important for students on campus WiFi."

#### Excel/CSV Processing: ExcelJS + PapaParse

**Why ExcelJS?**
- **Template generation**: Create Excel templates for bulk listing uploads
- **Formatting support**: Preserves cell styles, formulas
- **Streaming**: Handles large files without memory issues

**Why PapaParse?**
- **Fast CSV parsing**: Optimized for large files
- **TypeScript support**: Type-safe CSV handling
- **Error handling**: Detailed parsing errors

**Dependencies**: `exceljs@^4.4.0`, `papaparse@^5.5.3`, `xlsx@^0.18.5`

**Interview Answer**: "Students often have dozens of items to list (textbooks, furniture, etc.). Bulk upload via Excel is a huge time-saver. ExcelJS generates templates with validation rules, and PapaParse handles CSV imports. This feature directly addresses user pain—listing 20 textbooks manually takes 30+ minutes; bulk upload takes 2 minutes."

---

### Backend Stack

#### Framework: Spring Boot 3.2.3

**Why Spring Boot?**
- **Rapid development**: Auto-configuration, embedded server
- **Enterprise-grade**: Battle-tested, used by Fortune 500 companies
- **Rich ecosystem**: Spring Data JPA, Spring Security, Spring Doc
- **Java 21**: Modern language features (records, pattern matching, virtual threads)

**Interview Answer**: "Spring Boot accelerates backend development. Instead of configuring servlets, connection pools, and security manually, Spring Boot auto-configures based on dependencies. For a team building an MVP, this means we focus on business logic, not infrastructure. The Spring ecosystem (JPA, Security, Validation) provides consistent patterns across the codebase."

#### Language: Java 21

**Why Java 21?**
- **Virtual threads (Project Loom)**: Handle 10,000+ concurrent requests efficiently
- **Records**: Immutable data classes (DTOs) with less boilerplate
- **Pattern matching**: Cleaner switch expressions
- **Long-term support**: LTS release, supported until 2029

**Interview Answer**: "Java 21's virtual threads are a game-changer for I/O-bound APIs. Traditional threads consume ~1MB of memory each. Virtual threads share a small thread pool, allowing us to handle thousands of concurrent requests without memory issues. For a marketplace with real-time messaging, this directly impacts scalability."

#### Database: PostgreSQL 16

**Why PostgreSQL?**
- **ACID compliance**: Critical for financial transactions (even if we don't process payments)
- **Rich data types**: JSON, arrays, full-text search
- **Extensibility**: PostGIS for geospatial queries (future: location-based search)
- **Open source**: No licensing costs
- **Performance**: Handles complex queries efficiently

**Interview Answer**: "PostgreSQL is the right choice for a marketplace. We need ACID transactions for listing updates, foreign key constraints for data integrity, and JSON support for flexible schemas (e.g., listing metadata). As we scale, PostgreSQL's full-text search and PostGIS extensions will power advanced features without adding external services."

#### ORM: JPA/Hibernate

**Why JPA over raw SQL?**
- **Type safety**: Compile-time checks for entity relationships
- **Less boilerplate**: Annotations handle CRUD operations
- **Database agnostic**: Can switch databases with minimal code changes
- **Lazy loading**: Efficient relationship fetching

**Trade-offs**:
- **N+1 queries**: Must be careful with `@OneToMany` relationships
- **Complex queries**: Sometimes raw SQL is clearer

**Interview Answer**: "JPA reduces boilerplate for standard CRUD operations. Instead of writing `SELECT * FROM listings WHERE seller_id = ?`, we write `listingRepository.findBySellerId(sellerId)`. However, we use `@Query` annotations for complex queries (filtered searches) where SQL is more readable. The key is knowing when to use JPA vs raw SQL."

#### Database Migrations: Hibernate DDL (Currently)

**Why Hibernate DDL instead of Flyway?**
- **Rapid prototyping**: Schema changes during development
- **Less ceremony**: No migration files to write

**Why we'll switch to Flyway later**:
- **Version control**: Migration history in Git
- **Production safety**: Explicit migrations, no auto-generated changes
- **Rollback support**: Can revert migrations

**Current State**: Using `ddl-auto: create-drop` for development

**Interview Answer**: "We're using Hibernate DDL for MVP development because it's faster—schema changes happen automatically. However, for production, we'll use Flyway. Flyway migrations are version-controlled, testable, and reversible. This is critical for production deployments where schema changes must be explicit and auditable."

#### API Documentation: SpringDoc OpenAPI

**Why SpringDoc?**
- **Auto-generated docs**: Swagger UI from annotations
- **Type-safe**: Generates TypeScript types for frontend
- **Interactive testing**: Try endpoints from browser
- **Contract-first**: API contract is the source of truth

**Dependency**: `springdoc-openapi-starter-webmvc-ui@^2.2.0`

**Interview Answer**: "SpringDoc generates API documentation automatically from our controller annotations. This serves as living documentation—when we change an endpoint, the docs update automatically. The OpenAPI spec can generate TypeScript types for the frontend, ensuring type safety across the stack."

#### Security: Spring Security (OAuth2)

**Why Spring Security?**
- **Industry standard**: Battle-tested security framework
- **OAuth2 support**: Built-in Google OAuth integration
- **CORS handling**: Configurable cross-origin policies
- **CSRF protection**: Automatic token validation

**Current State**: Authentication disabled for MVP (all endpoints `permitAll()`)

**Future**: OAuth2 with Google (@umass.edu email verification)

**Interview Answer**: "Spring Security provides enterprise-grade security out of the box. For MVP, we've disabled authentication to focus on core features. In production, we'll use OAuth2 with Google to verify @umass.edu emails. Spring Security handles token validation, session management, and CSRF protection—critical for a student platform handling personal data."

#### Code Generation: Lombok

**Why Lombok?**
- **Reduces boilerplate**: `@Data` generates getters, setters, `equals()`, `hashCode()`, `toString()`
- **Cleaner code**: Entities are more readable
- **Compile-time**: No runtime overhead

**Dependency**: `lombok@^1.18.38`

**Example**:
```java
// Without Lombok: 50+ lines
// With Lombok: 5 lines
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "listings")
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String title;
    // ... getters, setters, equals, hashCode, toString generated
}
```

**Interview Answer**: "Lombok eliminates boilerplate. Entity classes with 10+ fields would have 100+ lines of getters/setters. Lombok generates this at compile-time, keeping our code focused on business logic. The trade-off is IDE setup (Lombok plugin required), but the productivity gain is worth it."

#### Testing: Testcontainers

**Why Testcontainers?**
- **Real database tests**: Tests run against actual PostgreSQL
- **Isolated**: Each test gets a fresh database
- **No mocks**: Tests reflect production behavior

**Dependency**: `testcontainers-postgresql`

**Interview Answer**: "Testcontainers run tests against real PostgreSQL instances in Docker. This catches issues that mocks miss—SQL syntax errors, constraint violations, transaction problems. The tests are slower than unit tests, but they give us confidence that our code works in production."

---

## Architecture Decisions

### 1. Monorepo Structure

**Decision**: Single repository for frontend and backend.

**Justification**:
- **Shared types**: API contracts defined once, used by both frontend and backend
- **Atomic commits**: Feature changes span both repos (e.g., "Add listing status filter")
- **Simplified CI/CD**: One pipeline, one deployment
- **Easier onboarding**: New developers clone one repo

**Trade-offs**:
- **Larger repo**: Slower clones, more files to search
- **Coupling**: Frontend and backend must deploy together (mitigated with API versioning)

**Interview Answer**: "We chose a monorepo because features span both frontend and backend. When we add a new listing field, we update the entity, DTO, API endpoint, and frontend form in one commit. This makes code reviews easier—reviewers see the full feature context. The trade-off is repo size, but for a team of 5-10 developers, this is manageable."

### 2. Feature-Based Code Organization

**Decision**: Organize code by feature (marketplace, sports, events) rather than by layer (controllers, services, repositories).

**Structure**:
```
api/src/main/java/edu/umass/marketplace/
├── common/              # Shared infrastructure
│   ├── config/
│   ├── exception/
│   └── security/
├── marketplace/        # Marketplace feature
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
└── sports/             # Future: Sports feature
    ├── controller/
    └── service/
```

**Justification**:
- **Scalability**: Easy to add new features without touching existing code
- **Team ownership**: Different teams can own different features
- **Clear boundaries**: Features are self-contained, easier to understand
- **Independent deployment**: Features can be deployed separately (future microservices)

**Interview Answer**: "Feature-based organization scales better than layer-based. When we add the Sports module, we create a new `sports/` package with its own controllers, services, and repositories. This keeps code organized as we grow from 1 feature to 5. The `common/` package holds shared code (security, exceptions) that all features use."

### 3. RESTful API Design

**Decision**: REST endpoints with JSON responses, following REST conventions.

**Examples**:
- `GET /api/listings` - List all listings (paginated)
- `GET /api/listings/{id}` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/{id}` - Update listing
- `DELETE /api/listings/{id}` - Delete listing

**Justification**:
- **Standard conventions**: Developers know REST, easy to understand
- **HTTP semantics**: Status codes (200, 201, 404, 500) convey meaning
- **Cacheable**: GET requests can be cached by CDNs
- **Tooling**: Swagger UI, Postman work out of the box

**Interview Answer**: "REST is the right choice for a CRUD-heavy application like a marketplace. The HTTP verbs (GET, POST, PUT, DELETE) map directly to operations (read, create, update, delete). This makes the API self-documenting—developers can guess endpoint names. For real-time features (messaging), we might add WebSockets later, but REST handles 90% of our use cases."

### 4. Pagination Strategy

**Decision**: Page-based pagination (not cursor-based).

**Implementation**:
```java
Page<Listing> listings = listingRepository.findAll(
    PageRequest.of(page, size, Sort.by("createdAt").desc())
);
```

**Justification**:
- **Simple to implement**: Spring Data JPA supports it natively
- **User-friendly**: "Page 1 of 10" is intuitive
- **Cacheable**: Pages can be cached

**Trade-offs**:
- **Inconsistent results**: If new listings are added, page boundaries shift
- **Not ideal for real-time**: Cursor-based is better for infinite scroll

**Interview Answer**: "We use page-based pagination because it's simple and works for our use case. Users browse listings in pages of 12 items. The trade-off is that if a new listing is added, page boundaries shift slightly, but this is acceptable for a marketplace. For real-time feeds (messaging), we'd use cursor-based pagination."

### 5. Image Storage Strategy

**Decision**: Store images as base64-encoded strings in the database (MVP).

**Justification**:
- **Simple**: No S3 setup, no CDN configuration
- **Works for MVP**: Handles small images (< 400KB compressed)
- **No external dependencies**: Everything in one database

**Future**: Move to S3 + CloudFront CDN

**Trade-offs**:
- **Database bloat**: Images increase database size
- **Slower queries**: Large JSON responses
- **No image optimization**: Can't serve different sizes

**Interview Answer**: "For MVP, we store images as base64 in the database. This eliminates external dependencies (S3, CDN) and simplifies deployment. However, as we scale, we'll move to S3 + CloudFront. S3 is cheaper for storage, CloudFront caches images globally, and we can generate thumbnails on upload. The migration path is clear—we'll add an `imageUrl` field and migrate existing base64 data."

### 6. Error Handling Strategy

**Decision**: Global exception handler with consistent error responses.

**Implementation**:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage()));
    }
}
```

**Justification**:
- **Consistent API**: All errors follow the same format
- **Centralized logic**: Error handling in one place
- **Type-safe**: Frontend knows error structure

**Interview Answer**: "A global exception handler ensures all API errors follow the same format. The frontend can handle errors consistently—display user-friendly messages, log technical details. This is critical for a good user experience—users see 'Title is required' not '400 Bad Request'."

### 7. CORS Configuration

**Decision**: Allow all localhost origins in development, restrict in production.

**Implementation**:
```java
configuration.setAllowedOriginPatterns(
    Arrays.asList("http://localhost:*", "http://127.0.0.1:*")
);
```

**Justification**:
- **Development flexibility**: Frontend can run on any port
- **Security**: Production will restrict to specific domains

**Interview Answer**: "CORS is configured permissively for development—any localhost origin is allowed. This lets developers run the frontend on any port without CORS errors. In production, we'll restrict to our actual domain. This is a common pattern—permissive in dev, restrictive in prod."

---

## Key Engineering Concepts

### 1. Separation of Concerns (SoC)

**What it is**: Each layer has a single responsibility.

**Our Implementation**:
- **Controllers**: Handle HTTP requests, validate input, return responses
- **Services**: Business logic, orchestrate operations
- **Repositories**: Data access, database queries
- **Entities**: Data models, database schema

**Example**:
```java
// Controller: HTTP concerns
@RestController
public class ListingController {
    private final ListingService listingService;
    
    @PostMapping("/api/listings")
    public ResponseEntity<ListingResponse> createListing(
        @Valid @RequestBody CreateListingRequest request
    ) {
        ListingResponse response = listingService.createListing(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

// Service: Business logic
@Service
public class ListingService {
    public ListingResponse createListing(CreateListingRequest request) {
        // Validate business rules
        if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Price must be positive");
        }
        // Create entity, save, return DTO
    }
}

// Repository: Data access
@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    // Database queries
}
```

**Why it matters**: Changes to business logic don't affect HTTP handling. Changes to database schema don't affect business logic.

**Interview Answer**: "Separation of concerns makes the codebase maintainable. If we change how listings are validated, we only touch the Service layer. If we change the database schema, we only touch the Repository layer. This isolation prevents bugs—a database change won't accidentally break HTTP response formatting."

### 2. Dependency Injection (DI)

**What it is**: Objects receive dependencies from outside, rather than creating them internally.

**Our Implementation**: Spring's `@Autowired` (or constructor injection).

**Example**:
```java
@Service
@RequiredArgsConstructor  // Lombok generates constructor
public class ListingService {
    private final ListingRepository listingRepository;  // Injected by Spring
    private final UserRepository userRepository;
    
    // No need to write: this.listingRepository = new ListingRepository();
}
```

**Why it matters**:
- **Testability**: Can inject mock repositories in tests
- **Flexibility**: Can swap implementations (e.g., PostgreSQL → MongoDB)
- **Loose coupling**: Service doesn't know how repository is created

**Interview Answer**: "Dependency injection makes our code testable. In tests, we inject mock repositories instead of real databases. This lets us test business logic in isolation. Spring's DI container manages object lifecycle—we declare dependencies, Spring provides them."

### 3. Data Transfer Objects (DTOs)

**What it is**: Objects that transfer data between layers, separate from entities.

**Our Pattern**:
- **Entity**: Database representation (`Listing` with JPA annotations)
- **DTO**: API representation (`ListingResponse` with only needed fields)
- **Request DTO**: Input validation (`CreateListingRequest` with validation annotations)

**Example**:
```java
// Entity: Database model
@Entity
public class Listing {
    @Id
    private UUID id;
    @ManyToOne
    private User seller;  // Full entity relationship
    // ... database fields
}

// DTO: API response
public class ListingResponse {
    private UUID id;
    private UUID sellerId;  // Just the ID, not full entity
    private String sellerName;
    // ... only fields needed by frontend
}
```

**Why it matters**:
- **API stability**: Can change database schema without breaking API
- **Performance**: Don't send unnecessary data (e.g., full user object when only name needed)
- **Security**: Don't expose internal fields (e.g., `password` field)

**Interview Answer**: "DTOs decouple our database schema from our API contract. If we add a new database field, we don't have to expose it in the API. DTOs also let us shape data for the frontend—we include `sellerName` in `ListingResponse` so the frontend doesn't need a separate API call. This reduces round-trips and improves performance."

### 4. Repository Pattern

**What it is**: Abstraction layer between business logic and database.

**Our Implementation**: Spring Data JPA repositories.

**Example**:
```java
@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    // Spring generates implementation automatically
    Page<Listing> findBySellerId(UUID sellerId, Pageable pageable);
    
    // Custom query
    @Query("SELECT l FROM Listing l WHERE l.status = :status")
    Page<Listing> findByStatus(@Param("status") String status, Pageable pageable);
}
```

**Why it matters**:
- **Abstraction**: Business logic doesn't know about SQL
- **Testability**: Can mock repositories in tests
- **Flexibility**: Can swap JPA for MongoDB, Elasticsearch, etc.

**Interview Answer**: "The repository pattern abstracts data access. Our services call `listingRepository.findBySellerId()`, not SQL queries. This makes code readable and testable—we can mock repositories in unit tests. Spring Data JPA generates implementations automatically, reducing boilerplate."

### 5. Transaction Management

**What it is**: Ensuring database operations are atomic (all succeed or all fail).

**Our Implementation**: Spring's `@Transactional` annotation.

**Example**:
```java
@Transactional
public ListingResponse createListing(CreateListingRequest request) {
    Listing listing = new Listing();
    listing.setSeller(seller);
    listing = listingRepository.save(listing);  // If this fails, transaction rolls back
    
    // Update seller's listing count
    seller.setListingCount(seller.getListingCount() + 1);
    userRepository.save(seller);  // If this fails, listing creation also rolls back
    
    return ListingResponse.fromEntity(listing);
}
```

**Why it matters**: Prevents data inconsistency. If saving the listing succeeds but updating the seller fails, we'd have an orphaned listing.

**Interview Answer**: "Transactions ensure data consistency. When creating a listing, we save the listing and update the seller's count. If either operation fails, both roll back. This prevents partial updates—we never have a listing without a valid seller, or a seller with an incorrect count."

### 6. API Versioning Strategy

**Current State**: No versioning (MVP).

**Future Strategy**: URL-based versioning (`/api/v1/listings`, `/api/v2/listings`).

**Why it matters**: As we add features, we can't break existing API consumers.

**Interview Answer**: "For MVP, we don't version the API—we can make breaking changes. In production, we'll use URL versioning (`/api/v1/`, `/api/v2/`). This lets us add features (e.g., new listing fields) in v2 while keeping v1 stable for existing clients. The frontend will always use the latest version, but third-party integrations can stay on v1."

### 7. Caching Strategy

**Current State**: React Query caches API responses client-side.

**Future Strategy**: 
- **API-level**: Redis for frequently accessed data (user profiles, popular listings)
- **CDN**: CloudFront for static assets (images, JS bundles)
- **Database**: PostgreSQL query cache for repeated queries

**Interview Answer**: "Caching reduces database load and improves response times. React Query caches listing searches—if a user applies the same filters twice, the second request is instant. In production, we'll add Redis for server-side caching (user sessions, popular listings) and CloudFront for static assets. This is critical for handling 1-2k DAU without expensive database scaling."

### 8. Error Boundaries (Frontend)

**What it is**: React components that catch JavaScript errors and display fallback UI.

**Our Implementation**:
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

**Why it matters**: Prevents one component error from crashing the entire app.

**Interview Answer**: "Error boundaries isolate failures. If the listing detail modal crashes, the rest of the app continues working. Users see a friendly error message instead of a blank screen. This is critical for production—we can't have one bug take down the entire marketplace."

---

## Code Organization

### Frontend Structure

```
web/src/
├── app/                    # App-level code
│   ├── App.tsx            # Root component, routing
│   └── main.tsx           # Entry point
├── shared/                 # Shared code (used by all features)
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   └── Layout.tsx     # App layout
│   ├── contexts/          # React contexts (User, Cart, Chat)
│   ├── hooks/             # Shared hooks
│   ├── lib/               # Utilities
│   │   ├── utils/         # formatPrice, formatDate, etc.
│   │   └── constants/     # CATEGORIES, CONDITIONS
│   └── types/             # Shared TypeScript types
└── features/              # Feature modules
    └── marketplace/       # Marketplace feature
        ├── api/           # API client, types
        ├── components/    # Feature-specific components
        ├── pages/         # Feature pages
        └── hooks/         # Feature-specific hooks
```

**Principles**:
- **Shared code in `shared/`**: Used by multiple features
- **Feature code in `features/`**: Self-contained, can be extracted to separate app
- **App code in `app/`**: Routing, providers, global setup

**Interview Answer**: "We organize code by feature, not by type. All marketplace code lives in `features/marketplace/`. This makes it easy to find code—if I need the listing form, I know it's in `features/marketplace/pages/SellPage.tsx`. Shared code (utilities, UI components) lives in `shared/` and is used by all features. This structure scales—when we add Sports, we create `features/sports/` without touching marketplace code."

### Backend Structure

```
api/src/main/java/edu/umass/marketplace/
├── common/                 # Shared infrastructure
│   ├── config/            # Global configurations
│   │   ├── OpenApiConfig.java
│   │   └── SecurityConfig.java
│   ├── exception/         # Global exception handlers
│   └── security/          # Security utilities
├── marketplace/           # Marketplace feature
│   ├── controller/        # REST endpoints
│   ├── service/           # Business logic
│   ├── repository/        # Data access
│   ├── model/             # JPA entities
│   ├── dto/               # Request DTOs
│   └── response/          # Response DTOs
└── [future modules]/      # Sports, Events, Clubs, etc.
```

**Principles**:
- **Common code in `common/`**: Used by all features
- **Feature code in feature packages**: Self-contained modules
- **Layered architecture**: Controller → Service → Repository → Database

**Interview Answer**: "Backend follows the same feature-based structure. Each feature has its own controllers, services, and repositories. The `common/` package holds shared code (security config, exception handlers) that all features use. This keeps features independent—we can modify marketplace without affecting future Sports module."

---

## Cloud & Hosting Cost Analysis

### Assumptions

- **Daily Active Users (DAU)**: 1,000-2,000
- **Peak concurrent users**: ~200 (during class registration, move-in week)
- **API requests per user per day**: ~50 (browse listings, search, view details)
- **Total API requests/day**: 50,000-100,000
- **Database size**: ~10GB (listings, users, messages, images)
- **Image storage**: ~50GB (compressed images)
- **Bandwidth**: ~500GB/month

### Architecture Options

#### Option 1: AWS (Recommended for Production)

**Services**:
- **EC2 (API)**: `t3.medium` (2 vCPU, 4GB RAM) - $30/month
- **RDS PostgreSQL**: `db.t3.small` (2 vCPU, 2GB RAM) - $50/month
- **S3 (Images)**: 50GB storage - $1.15/month
- **CloudFront CDN**: 500GB transfer - $42.50/month
- **Route 53 (DNS)**: $0.50/month
- **Elastic IP**: $3.65/month

**Total**: ~$128/month (~$1,536/year)

**Scaling**:
- **2,000 DAU**: Upgrade to `t3.large` (+$30/month)
- **5,000 DAU**: Add load balancer, 2x EC2 instances (+$60/month)
- **10,000 DAU**: RDS `db.t3.medium` (+$50/month)

**Interview Answer**: "For 1-2k DAU, we'd use AWS with a single EC2 instance and RDS. The API runs on a `t3.medium` instance ($30/month), which handles ~200 concurrent requests comfortably. PostgreSQL on RDS ($50/month) provides managed backups and automatic failover. Images go to S3 + CloudFront ($44/month) for global CDN caching. Total cost is ~$128/month. As we scale to 5k DAU, we'd add a load balancer and multiple EC2 instances, but costs stay under $300/month."

#### Option 2: Heroku (Easiest Deployment)

**Services**:
- **Dyno (API)**: Standard-1X (512MB RAM) - $25/month
- **PostgreSQL**: Standard-0 (64GB storage) - $50/month
- **S3 (Images)**: Same as AWS - $1.15/month
- **CloudFront CDN**: Same as AWS - $42.50/month

**Total**: ~$119/month (~$1,428/year)

**Pros**: Easy deployment, automatic SSL, zero-downtime deploys
**Cons**: Less control, vendor lock-in, more expensive at scale

**Interview Answer**: "Heroku is great for MVP—one command deploys. However, it's more expensive at scale. For 1-2k DAU, it's comparable to AWS ($119 vs $128/month), but as we grow, AWS becomes cheaper. We'd start on Heroku for speed, then migrate to AWS when we hit 5k DAU."

#### Option 3: DigitalOcean (Budget-Friendly)

**Services**:
- **Droplet (API + DB)**: 4GB RAM, 2 vCPU - $24/month
- **Spaces (Images)**: 50GB storage + 500GB transfer - $5/month
- **Load Balancer**: $12/month (optional)

**Total**: ~$29-41/month (~$348-492/year)

**Pros**: Simple pricing, good performance, includes backups
**Cons**: Manual database management, no managed PostgreSQL

**Interview Answer**: "DigitalOcean is the most cost-effective option. A single Droplet can run both the API and PostgreSQL for $24/month. However, we'd need to manage database backups and updates manually. For a student project, this is acceptable, but for production, managed databases (RDS) are worth the extra cost."

#### Option 4: Railway / Render (Modern PaaS)

**Services**:
- **Railway**: $20/month (includes API + PostgreSQL)
- **S3 + CloudFront**: Same as AWS - $44/month

**Total**: ~$64/month (~$768/year)

**Pros**: Modern tooling, automatic deploys, good DX
**Cons**: Less control, newer platform (less proven)

**Interview Answer**: "Railway is a modern PaaS that's easier than AWS but cheaper than Heroku. For $20/month, we get API hosting and managed PostgreSQL. This is perfect for MVP—we focus on features, not infrastructure. As we scale, we'd migrate to AWS for more control and better pricing."

### Cost Breakdown by Component

#### API Hosting

| Provider | Instance | Cost/Month | Notes |
|----------|----------|------------|-------|
| AWS EC2 | t3.medium | $30 | Auto-scaling, load balancer ready |
| Heroku | Standard-1X | $25 | Easy deploys, less control |
| DigitalOcean | 4GB Droplet | $24 | Manual management |
| Railway | Included | $20 | Modern PaaS |

**Recommendation**: Start with Railway/Render for MVP ($20/month), migrate to AWS at scale.

#### Database

| Provider | Instance | Cost/Month | Notes |
|----------|----------|------------|-------|
| AWS RDS | db.t3.small | $50 | Managed backups, automatic failover |
| Heroku Postgres | Standard-0 | $50 | Same as RDS, easier setup |
| DigitalOcean | Manual | $0 | Included in Droplet (manual backups) |
| Railway | Included | $0 | Included in $20/month plan |

**Recommendation**: Use managed database (RDS/Heroku) for production. Manual databases are risky—backups can fail, updates require downtime.

#### Image Storage & CDN

| Service | Storage | Transfer | Cost/Month |
|---------|---------|----------|------------|
| AWS S3 + CloudFront | 50GB | 500GB | $44 |
| DigitalOcean Spaces | 50GB | 500GB | $5 |
| Cloudflare R2 | 50GB | 500GB | $0 (egress free) |

**Recommendation**: Use Cloudflare R2 for MVP (free egress), migrate to S3 + CloudFront if we need AWS integration.

#### Total Monthly Costs

| Option | API | DB | Storage/CDN | **Total** |
|--------|-----|----|----|-----------|
| **AWS** | $30 | $50 | $44 | **$124** |
| **Heroku** | $25 | $50 | $44 | **$119** |
| **DigitalOcean** | $24 | $0 | $5 | **$29** |
| **Railway** | $20 | $0 | $44 | **$64** |

### Scaling Costs (5,000 DAU)

**Assumptions**:
- **API requests/day**: 250,000
- **Database size**: 50GB
- **Image storage**: 200GB
- **Bandwidth**: 2TB/month

| Component | 1-2k DAU | 5k DAU | Increase |
|-----------|----------|--------|----------|
| API (EC2) | $30 | $90 (3x instances) | +$60 |
| Database (RDS) | $50 | $100 (db.t3.medium) | +$50 |
| Storage/CDN | $44 | $176 (4x images) | +$132 |
| **Total** | **$124** | **$366** | **+$242** |

**Interview Answer**: "Scaling from 1-2k to 5k DAU roughly triples costs. We'd need 3 API instances (load balanced) instead of 1, a larger database, and 4x image storage. Total goes from $124 to $366/month. However, this is still manageable—$366/month for 5k users is $0.07 per user per month. With ads or premium features, this is profitable."

### Cost Optimization Strategies

1. **Image Optimization**: Compress images client-side (reduce storage by 70%)
2. **CDN Caching**: Cache API responses for 30 seconds (reduce database load by 50%)
3. **Database Indexing**: Proper indexes reduce query time (smaller instance needed)
4. **Reserved Instances**: AWS Reserved Instances save 30-40% (commit to 1-year term)
5. **Serverless**: Use Lambda for image processing (pay per request, not per hour)

**Interview Answer**: "We optimize costs at multiple levels. Client-side image compression reduces storage by 70%—50GB becomes 15GB, saving $7/month. CDN caching reduces database load—we can use a smaller RDS instance, saving $25/month. Proper database indexes mean queries are 10x faster—we can handle 2x traffic on the same instance. Combined, these optimizations save ~$50/month, bringing our 1-2k DAU cost from $124 to $74/month."

---

## Development Workflow

### Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/shivraj-S-bhatti/umass-marketplace.git
   cd umass-marketplace
   ```

2. **Start services**
   ```bash
   make dev  # Starts API + Frontend + Database
   ```

3. **Access points**
   - Frontend: http://localhost:5173
   - API: http://localhost:8080
   - Swagger: http://localhost:8080/swagger-ui

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/add-listing-filters
   ```

2. **Make changes**
   - Backend: Edit Java files in `api/src/main/java/`
   - Frontend: Edit TypeScript files in `web/src/`

3. **Test locally**
   ```bash
   # Backend tests
   cd api && mvn test
   
   # Frontend build
   cd web && npm run build
   ```

4. **Commit and push**
   ```bash
   git commit -m "feat: add category filter to listings"
   git push origin feature/add-listing-filters
   ```

5. **Create PR**: GitHub will run CI/CD pipeline

### Code Review Checklist

- [ ] Code follows project structure (feature-based organization)
- [ ] Types are defined (TypeScript types, Java DTOs)
- [ ] Error handling is implemented (try/catch, error boundaries)
- [ ] Tests are added (unit tests for services, integration tests for APIs)
- [ ] Documentation is updated (README, API docs)
- [ ] No console.logs in production code
- [ ] Images are optimized (< 400KB compressed)

---

## Common Pitfalls & Solutions

### 1. N+1 Query Problem

**Problem**: Loading listings with sellers causes N+1 queries (1 for listings, N for sellers).

**Solution**: Use `@EntityGraph` or `JOIN FETCH`:
```java
@Query("SELECT l FROM Listing l JOIN FETCH l.seller")
Page<Listing> findAllWithSeller(Pageable pageable);
```

### 2. CORS Errors

**Problem**: Frontend can't call API from different origin.

**Solution**: Configure CORS in `SecurityConfig.java`:
```java
configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
```

### 3. Type Mismatches

**Problem**: Frontend expects `string` but backend returns `number`.

**Solution**: Use shared types. Generate TypeScript types from OpenAPI spec:
```bash
npm run gen:api
```

### 4. Image Upload Failures

**Problem**: Large images (> 5MB) fail to upload.

**Solution**: Compress images client-side before upload:
```typescript
const compressed = await compressImage(imageData, 400); // Max 400KB
```

### 5. Database Connection Issues

**Problem**: "Connection refused" errors.

**Solution**: Check database is running:
```bash
docker ps  # Should show postgres container
# Or
pg_isready  # Should return "accepting connections"
```

---

## Next Steps for New Developers

1. **Read the codebase**: Start with `HomePage.tsx` (frontend) and `ListingController.java` (backend)
2. **Run locally**: Follow "Getting Started" in README.md
3. **Make a small change**: Add a new listing field (e.g., "brand" for electronics)
4. **Submit a PR**: Get code review feedback
5. **Ask questions**: Use GitHub Discussions or team Slack

---

## Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev
- **React Query Docs**: https://tanstack.com/query/latest
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Last Updated**: January 2025
**Maintained By**: Everything UMass Development Team
