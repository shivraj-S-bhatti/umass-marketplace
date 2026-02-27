# Example Sub-App Module (Template)

Use this template as a reference when adding a new sub-app to Everything UMass.

## Recommended structure

```
features/
  your-subapp/
    api/           – API client functions
    components/    – React components specific to this module
    pages/         – Route-level page components
    hooks/         – Custom React hooks
    types/         – TypeScript types
    README.md      – Module overview
```

## How to wire it up

1. Create your feature directory under `web/src/features/`.
2. Add page components inside `pages/`.
3. Register routes in `web/src/app/App.tsx` (wrap with `<ProtectedRoute>` if auth is required).
4. Add a dropdown entry in the `SUBAPPS` array in `web/src/shared/components/Layout.tsx`.

## Example route registration (App.tsx)

```tsx
import MyPage from '@/features/your-subapp/pages/MyPage'

<Route
  path="/your-subapp"
  element={
    <ProtectedRoute>
      <MyPage />
    </ProtectedRoute>
  }
/>
```
