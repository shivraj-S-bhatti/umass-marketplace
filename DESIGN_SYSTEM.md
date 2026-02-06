# UMass Marketplace Design System

## Design Philosophy

**North Star:** Swiss / International Style — polished, minimal, functional.

The UMass Marketplace uses a clean, dark-mode-first aesthetic inspired by modern marketplaces: clarity and objectivity, typography as structure, grid-based layout, restrained color (one accent for CTAs), and minimal chrome. No decorative themes (comic, fall, nostalgia).

---

## Visual Identity

### Color Palette (Dark Mode)

- **Background:** Near-black (`hsl(0, 0%, 7%)`) — main page background
- **Card / surface:** Dark grey (`hsl(0, 0%, 11%)`) — cards, modals, inputs
- **Foreground:** White / light grey (`hsl(0, 0%, 98%)`) — primary text
- **Muted foreground:** Medium grey (`hsl(0, 0%, 60%)`) — secondary text
- **Border:** Subtle dark grey (`hsl(0, 0%, 22%)`) — thin borders, dividers
- **Primary / CTA accent:** Yellow (`hsl(48, 96%, 53%)`) — primary buttons, key actions; text on accent uses dark (`primary-foreground`)
- **Secondary:** Dark grey (`hsl(0, 0%, 18%)`) — secondary buttons, hover states
- **Destructive:** Red for errors and delete actions

All tokens are defined as CSS variables in `web/src/index.css` and referenced via Tailwind (e.g. `bg-background`, `text-foreground`, `border-border`, `bg-primary`).

### Typography

- **Font:** Inter (single sans-serif) — loaded via Google Fonts in `web/index.html`, set as `font-sans` in Tailwind and `body` in CSS.
- **Weights:** 400 (body), 500 (medium), 600 (semibold), 700 (bold).
- **Hierarchy:**
  - **Section titles:** Uppercase, bold or semibold, increased letter-spacing (e.g. `tracking-wider`), muted color — e.g. "POPULAR CATEGORIES".
  - **Page titles:** Bold, large size (`text-4xl` / `text-5xl`).
  - **Card / product titles:** Semibold or bold, readable size.
  - **Body / metadata:** Regular weight, smaller size; use `text-muted-foreground` for secondary text.
  - **Prices:** Bold, prominent.

---

## Layout Principles

- **Grid:** Invisible grid; elements align consistently. Use Tailwind grid and flex utilities.
- **Spacing:** 8px base scale — `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px). Generous padding on cards and sections so the UI feels "aired out."
- **Borders:** Thin (1px) by default — `border border-border`. No thick panel frames.

---

## Component Standards

### Buttons

- **Shape:** `rounded-lg`, thin or no border. No comic shadow or hover translate.
- **Primary (default):** `bg-primary text-primary-foreground` (yellow CTA with dark text).
- **Outline:** `border border-border`, transparent background, hover `bg-secondary`.
- **Sizes:** `h-10 px-4` (default), `h-9 px-3` (sm), `h-11 px-8` (lg), `h-10 w-10` (icon).

### Cards

- **Style:** `rounded-lg border border-border bg-card p-4`. No paper texture or thick borders.
- **Hover (optional):** Subtle border or opacity change (e.g. `hover:border-primary/50`). No scale or heavy shadow.

### Inputs & selects

- **Style:** `rounded-lg border border-input bg-card`, `text-foreground`, `placeholder:text-muted-foreground`. Focus ring: `ring-2 ring-ring ring-offset-2`.

### Badges (pills)

- **Style:** Minimal pill — small text (`text-xs`), subtle background, thin border, `rounded-md`. Used for status (Active / On Hold / Sold) and price. No rotation or jagged clip-path.

### Modals / dialogs

- **Style:** `rounded-lg border border-border bg-card`, dark surface. No comic panel styling.

---

## UI Components Catalog

- **Listing cards:** Image area, title, status pill, price pill, metadata (date, category, condition). Thin border, subtle hover.
- **Search / filters:** Simple inputs and selects, thin borders. Section labels: uppercase, letter-spacing, muted.
- **Navigation:** Thin bottom border (`border-b border-border`), compact padding. Active state: `bg-primary text-primary-foreground`.
- **Footer:** Thin top border, muted text, simple links.

---

## Assets

- **Icons:** Lucide React — consistent stroke, `h-4 w-4` (small), `h-5 w-5` (medium).
- **Logo:** SVG or icon + wordmark; works on dark background (uses `primary` and `foreground` tokens).

---

## Responsive Design

- **Breakpoints:** Tailwind defaults — sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1400px.
- **Mobile-first:** Single column where appropriate; 2–4 columns for grids on larger screens.

---

## Accessibility

- **Contrast:** Text on background meets WCAG AA. Muted text remains readable.
- **Focus:** Visible focus rings on interactive elements (`focus-visible:ring-2 focus-visible:ring-ring`).
- **Touch targets:** Prefer at least 44px for primary actions where possible.

---

## Design Tokens (summary)

- **Radius:** `--radius: 0.5rem`; use `rounded-lg`, `rounded-md` as needed.
- **Borders:** 1px default; use `border-border` for theme border color.
- **No comic/fall:** No `rounded-comic`, `shadow-comic`, `paper-texture`, leaf decorations, or autumn-only palette in the current system.

---

## Implementation Notes

- **CSS:** Variables and base styles in `web/src/index.css`. Tailwind theme in `web/tailwind.config.js` (colors, fontFamily, borderRadius).
- **Components:** Shared UI in `web/src/shared/components/ui/`; layout in `Layout.tsx`. Use design tokens (Tailwind semantic names) for consistency.

---

**Last Updated:** 2025  
**Version:** 2.0 — Swiss design, dark mode, single accent (yellow), Inter typography.
