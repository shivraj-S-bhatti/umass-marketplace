# Good First Issue: Expand UMass Links Directory

## Title
[GOOD FIRST ISSUE] Add 15 verified UMass links to `/directory`

## Why this matters
The directory is now part of the live app and should be genuinely useful for new students on day one.

## Scope
- Add at least 15 useful, currently working UMass-related links to `web/src/pages/DirectoryPage.tsx`.
- Keep categories clean (`Official`, `Housing`, `Student Life`, `Tech`, `Careers`, `Community`).
- Remove dead links and duplicates.

## Acceptance criteria
- `/directory` renders with the new links and no UI breakage on mobile.
- Added links are specific to UMass Amherst or directly useful to UMass students.
- `npm run build -C web` passes.

## Constraints
- Do not change existing component structure or design system primitives.
- Keep copy concise and factual.

## Starter commands
```bash
npm install -C web
npm run dev -C web
npm run build -C web
```

## Suggested issue labels
- `good first issue`
- `community`
- `documentation`
