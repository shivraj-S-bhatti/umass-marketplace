# Module Development Guide

This guide explains how to add new modules (Sports, Events, Clubs, Common Room) to the Everything UMass platform.

## Architecture Overview

The codebase is organized into feature-based modules:

```
api/src/main/java/edu/umass/marketplace/
├── common/              # Shared infrastructure
│   ├── config/         # Global configurations
│   ├── exception/      # Global exception handlers
│   ├── security/       # Security configuration
│   └── util/           # Shared utilities
├── marketplace/        # Marketplace module (existing)
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/
│   └── response/
└── [new-module]/       # Your new module
    ├── controller/
    ├── service/
    ├── repository/
    ├── model/
    └── dto/

web/src/
├── shared/             # Shared code
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Shared hooks
│   ├── lib/            # Utilities, API base
│   ├── contexts/       # Global contexts
│   └── types/          # Shared types
├── features/
│   ├── marketplace/    # Marketplace module (existing)
│   └── [new-module]/   # Your new module
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── api/
│       └── types/
└── app/                # App-level code
```

## Adding a New Backend Module

### Step 1: Create Module Structure

```bash
cd api/src/main/java/edu/umass/marketplace
mkdir -p [module-name]/{controller,service,repository,model,dto}
```

### Step 2: Create Base Classes

1. **Model/Entity** (`model/[Module]Entity.java`):
   ```java
   package edu.umass.marketplace.[module-name].model;
   
   @Entity
   @Table(name = "[table_name]")
   @Data
   public class [Module]Entity {
       @Id
       @GeneratedValue(strategy = GenerationType.UUID)
       private UUID id;
       // ... fields
   }
   ```

2. **Repository** (`repository/[Module]Repository.java`):
   ```java
   package edu.umass.marketplace.[module-name].repository;
   
   @Repository
   public interface [Module]Repository extends JpaRepository<[Module]Entity, UUID> {
       // Custom queries
   }
   ```

3. **Service** (`service/[Module]Service.java`):
   ```java
   package edu.umass.marketplace.[module-name].service;
   
   @Service
   @RequiredArgsConstructor
   public class [Module]Service {
       private final [Module]Repository repository;
       // Business logic
   }
   ```

4. **Controller** (`controller/[Module]Controller.java`):
   ```java
   package edu.umass.marketplace.[module-name].controller;
   
   @RestController
   @RequestMapping("/api/[module-name]")
   @RequiredArgsConstructor
   public class [Module]Controller {
       private final [Module]Service service;
       // REST endpoints
   }
   ```

5. **DTOs** (`dto/[Module]Request.java`, `dto/[Module]Response.java`):
   ```java
   package edu.umass.marketplace.[module-name].dto;
   
   @Data
   public class [Module]Request {
       // Request fields
   }
   ```

### Step 3: Update Component Scanning

Add your module to `MarketplaceApplication.java`:

```java
@SpringBootApplication(scanBasePackages = {
    "edu.umass.marketplace.common",
    "edu.umass.marketplace.marketplace",
    "edu.umass.marketplace.[module-name]",  // Add this
    // ... other modules
})
```

### Step 4: Create Database Migration

Create a Flyway migration in `api/src/main/resources/db/migration/`:

```sql
-- V[N]__create_[module]_tables.sql
CREATE TABLE [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ... columns
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Adding a New Frontend Module

### Step 1: Create Module Structure

```bash
cd web/src/features
mkdir -p [module-name]/{components,pages,hooks,api,types}
```

### Step 2: Create Base Files

1. **Types** (`types/index.ts`):
   ```typescript
   export interface [Module] {
     id: string
     // ... fields
   }
   
   export interface Create[Module]Request {
     // ... fields
   }
   ```

2. **API Client** (`api/[module]Api.ts`):
   ```typescript
   import { apiClient } from '@/shared/lib/api/BaseApiClient'
   import type { [Module], Create[Module]Request } from '../types'
   
   export const [module]Api = {
     getAll: () => apiClient.get<[Module][]>('/api/[module-name]'),
     create: (data: Create[Module]Request) => 
       apiClient.post<[Module]>('/api/[module-name]', data),
     // ... other methods
   }
   ```

3. **Page Component** (`pages/[Module]Page.tsx`):
   ```typescript
   export default function [Module]Page() {
     // Component implementation
   }
   ```

4. **Components** (`components/[Module]Card.tsx`, etc.):
   ```typescript
   export function [Module]Card({ [module] }: { [module]: [Module] }) {
     // Component implementation
   }
   ```

### Step 3: Add Routes

Update `app/App.tsx`:

```typescript
import [Module]Page from '@/features/[module-name]/pages/[Module]Page'

// In Routes:
<Route path="/[module-name]" element={<[Module]Page />} />
```

### Step 4: Update Navigation

Update `shared/components/Layout.tsx` to add navigation items for your module.

## Shared Code Usage

### Backend

- **Common utilities**: Use `edu.umass.marketplace.common.util.*`
- **Security**: Use `@AuthenticationPrincipal UserPrincipal` from `common.security`
- **Exception handling**: Extend exceptions in `common.exception` or use `GlobalExceptionHandler`

### Frontend

- **UI Components**: Import from `@/shared/components/ui/*`
- **Utilities**: Import from `@/shared/lib/utils/*`
- **Contexts**: Use `@/shared/contexts/*`
- **Types**: Import shared types from `@/shared/types/*`

## Best Practices

1. **Separation of Concerns**: Keep module-specific code in your module, shared code in `common/` or `shared/`
2. **Naming Conventions**: Use consistent naming (PascalCase for classes, camelCase for methods)
3. **Error Handling**: Use the global exception handler for consistent error responses
4. **Type Safety**: Define TypeScript types for all API interactions
5. **Documentation**: Add JSDoc comments to public methods and classes
6. **Testing**: Create unit tests for services and integration tests for controllers

## Example: Sports Module Checklist

- [ ] Create backend module structure
- [ ] Create `SportsEntity`, `SportsRepository`, `SportsService`, `SportsController`
- [ ] Create DTOs (`CreateSportsEventRequest`, `SportsEventResponse`)
- [ ] Add database migration
- [ ] Update `MarketplaceApplication` component scanning
- [ ] Create frontend module structure
- [ ] Create types, API client, pages, components
- [ ] Add routes to `App.tsx`
- [ ] Update navigation in `Layout.tsx`
- [ ] Test end-to-end functionality
- [ ] Update documentation

## Resources

- Marketplace module serves as a reference implementation
- See `common/` and `shared/` for reusable patterns
- Check existing migrations for database schema patterns
- Review existing API clients for request/response patterns
