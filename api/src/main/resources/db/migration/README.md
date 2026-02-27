Migration notes:

- Existing versioned migrations are append-only and should not be deleted or rewritten.
- `V4__simplify_schema.sql` is an intentional no-op kept for version continuity.
- Schema cleanup and behavior changes should be done in new migration files only.
