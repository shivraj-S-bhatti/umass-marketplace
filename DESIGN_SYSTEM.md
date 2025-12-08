# UMass Marketplace Design System

## Design Philosophy

**North Star:** Cozy, wholesome, nostalgic; "campus yard in October"

The UMass Marketplace combines the warm, inviting aesthetic of vintage comic books with the dense, information-rich layouts of modern e-commerce platforms like Goldbelly and StackOverflow.

---

## Visual Identity

### Color Palette

#### Primary Colors
- **Background:** Warm cream (`hsl(35, 100%, 97%)`) - Main page background
- **Card Background:** Off-white cream (`hsl(35, 100%, 99%)`) - Card panels
- **Foreground/Text:** Deep brown (`hsl(15, 85%, 20%)`) - Primary text for high contrast
- **Primary/Accent:** Warm orange-red (`hsl(15, 85%, 45%)`) - Buttons, highlights
- **Secondary:** Light orange (`hsl(25, 90%, 92%)`) - Secondary elements
- **Border:** Dark brown (`hsl(15, 85%, 30%)`) - Thick comic panel borders

#### Semantic Colors
- **Success/Active:** Green tones (for active listings, success states)
- **Warning/On Hold:** Yellow tones (for on-hold items)
- **Destructive:** Red tones (for errors, sold items)
- **Muted:** Warm beige (`hsl(30, 80%, 95%)`) - Secondary text, subtle backgrounds

### Typography

#### Font Family
- **Body Text:** System sans-serif (readable, no comic fonts)
- **Headings:** Bold system sans-serif (comic-style boldness without comic fonts)

#### Font Sizes & Hierarchy
- **H1/Page Titles:** `text-4xl md:text-5xl` (36px/48px) - Bold, tracking-tight
- **H2/Section Titles:** `text-3xl` (30px) - Bold
- **H3/Card Titles:** `text-xl` (20px) - Bold
- **Body Text:** `text-sm` (14px) - Regular weight
- **Labels:** `text-sm` (14px) - Bold
- **Small Text/Metadata:** `text-xs` (12px) - Regular weight

#### Font Weights
- **Headings:** `font-bold` (700)
- **Labels:** `font-bold` (700)
- **Body:** `font-medium` (500) for emphasis, regular (400) for normal text

---

## Visual Elements

### Comic Panels

**Comic Panel Style:**
- Rounded corners: `rounded-2xl` (1rem / 16px)
- Thick border: `border-4` (4px) in foreground color
- Shadow: `shadow-comic` - Layered shadow effect
- Background: Paper texture overlay

**Usage:**
- All cards (`Card` component)
- Form containers
- Search filter panels
- Modal dialogs

### Paper Texture

**Implementation:**
- CSS class: `paper-texture`
- SVG pattern overlay for subtle paper grain
- Applied to cards and backgrounds

### Halftone Patterns

**Background Halftone:**
- Radial gradient dots pattern
- Applied to body background
- Subtle, low-opacity (3% black)

**Usage:**
- Page backgrounds
- Section dividers

### Sticker Badges

**Price Stickers:**
- Variant: `price` (orange/red background)
- Jagged edge clip-path
- Slight rotation (-2deg)
- Thick border
- Used for: Prices, special badges

**Status Stickers:**
- Variant: `status` (secondary background)
- Used for: Active/On Hold/Sold status

**New/Badge Stickers:**
- Variant: `new` (primary background)
- Used for: New items, featured badges

### Leaf Decorations

**Hand-drawn Leaf Doodles:**
- SVG-based, lightweight
- Colors: Red, orange, yellow
- Sizes: sm (32px), md (48px), lg (64px)
- Opacity: 30%
- Positioned absolutely, scattered
- Non-interactive (pointer-events: none)

**Usage:**
- Layout background decorations
- Header/footer accents
- Empty state illustrations

---

## Component Standards

### Buttons

**Base Style:**
- Rounded: `rounded-comic` (1.5rem)
- Border: `border-2` (2px) in foreground color
- Shadow: `shadow-comic`
- Font: Bold
- Hover: Slight translate and shadow increase

**Variants:**
- `default`: Primary orange-red background
- `outline`: Transparent background, thick border
- `secondary`: Light orange background
- `ghost`: Transparent, border on hover

**Sizes:**
- `sm`: `h-9 px-3`
- `default`: `h-10 px-4`
- `lg`: `h-11 px-8`

### Cards

**Structure:**
- Comic panel styling
- Paper texture background
- Padding: `p-6` (24px)
- Hover: Scale 1.02, shadow increase

**Content Density:**
- Tight spacing between elements
- Compact padding: `pb-3` for headers, `pt-0` for content
- Minimal gaps: `space-y-2` or `space-y-3`

### Input Fields

**Style:**
- Rounded: `rounded-comic`
- Border: `border-2` in foreground color
- Background: Card color
- Font: Medium weight
- Padding: `px-3 py-2`

### Form Layouts

**Spacing:**
- Vertical spacing: `space-y-4` or `space-y-6`
- Form groups: `space-y-2` between label and input
- Compact margins

---

## Layout Principles

### Information Density

**Goldbelly/StackOverflow Inspired:**
- **Dense spacing:** Reduced gaps between elements
- **Compact cards:** Tighter padding, less whitespace
- **Grid layouts:** More items per row, smaller gaps
- **Efficient use of space:** Information-rich without clutter

### Spacing Scale

**Compact Spacing:**
- `gap-2` (8px) - Between related items
- `gap-3` (12px) - Between groups
- `gap-4` (16px) - Between sections
- `gap-6` (24px) - Between major sections

**Padding:**
- Cards: `p-4` to `p-6` (16px-24px)
- Headers: `pb-2` to `pb-3` (8px-12px)
- Content: `pt-0` to `pt-2` (0-8px)

### Grid Layouts

**Product Grids:**
- Gap: `gap-4` (16px) - Tighter than default
- Responsive: 1 column (mobile), 2-3 columns (tablet), 3-4 columns (desktop)
- Card size: Compact, information-dense

**Dashboard Grids:**
- Stats cards: `gap-4` (16px)
- Listings grid: `gap-4` (16px)

---

## UI Components Catalog

### Listing Cards

**Layout:**
- Image: `h-48` (192px) - Fixed height
- Header: Title + Status badge (compact)
- Price: Sticker badge (centered)
- Metadata: Date, category, condition (compact tags)
- Actions: Edit/Mark Sold buttons (if on dashboard)

**Spacing:**
- Header: `pb-3`
- Content: `pt-0`, `space-y-3`
- Tags: `gap-2`

### Search Filters

**Layout:**
- Comic panel container
- Dense form layout
- Inline elements where possible
- Compact spacing

### Dashboard Stats

**Layout:**
- 3-column grid
- Large number display
- Compact label
- Icon + text

### Navigation

**Header:**
- Thick bottom border (`border-b-4`)
- Compact padding
- Bold navigation items
- Inline layout

---

## Assets

### Icons

**Icon Library:** Lucide React
- Consistent stroke width: 2px
- Size: `h-4 w-4` (16px) for small, `h-5 w-5` (20px) for medium

### Images

**Product Images:**
- Aspect ratio: 16:9 or 4:3
- Object fit: `cover`
- Rounded corners: Match card rounding

**Logo:**
- SVG format (from assets folder)
- Size: `h-10 w-10` (40px)

---

## Responsive Design

### Breakpoints (Tailwind Defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px

### Mobile-First Approach
- Single column layouts on mobile
- 2-3 columns on tablet
- 3-4 columns on desktop
- Dense spacing maintained across all sizes

---

## Accessibility

### Contrast
- Text on background: WCAG AA compliant
- Deep brown text on cream: High contrast
- Border colors: Dark enough for visibility

### Interactive Elements
- Minimum touch target: 44x44px
- Clear focus states
- Keyboard navigation support

### Readability
- Body text: System fonts (readable)
- No comic fonts for body text
- Sufficient line height

---

## Design Tokens

### Border Radius
- `rounded-comic`: 1.5rem (24px) - Main rounded corners
- `rounded-2xl`: 1rem (16px) - Card panels
- `rounded-lg`: 0.5rem (8px) - Small elements

### Border Width
- `border-4`: 4px - Comic panels
- `border-2`: 2px - Buttons, inputs, badges

### Shadows
- `shadow-comic`: `4px 4px 0px rgba(0, 0, 0, 0.2), 8px 8px 0px rgba(0, 0, 0, 0.1)`

### Opacity
- Leaf decorations: 30%
- Muted text: 60-70%

---

## Usage Guidelines

### When to Use Comic Panels
- All major content containers
- Cards and product listings
- Form containers
- Modal dialogs

### When to Use Sticker Badges
- Prices (always)
- Status indicators
- Special badges (New, Featured, Top 100)
- Sale indicators

### When to Use Leaf Decorations
- Background decorations (sparingly)
- Empty states
- Section dividers
- Never as functional elements

### Spacing Rules
- **Tight spacing** for related items (gap-2)
- **Moderate spacing** for groups (gap-4)
- **Generous spacing** only for major sections (gap-8)
- **Consistent padding** within cards (p-4 to p-6)

---

## Future Enhancements

### Planned Components
- [ ] Toast notifications with comic styling
- [ ] Modal dialogs with comic panels
- [ ] Dropdown menus with rounded corners
- [ ] Loading skeletons with halftone effect
- [ ] Empty states with leaf illustrations

### Design Iterations
- [ ] Additional sticker badge variants
- [ ] More leaf decoration variations
- [ ] Seasonal color variations
- [ ] Dark mode consideration (if needed)

---

## Implementation Notes

### CSS Classes
- Custom classes defined in `index.css`
- Tailwind utilities for spacing and layout
- Component-specific classes in individual component files

### Component Structure
- Base components in `components/ui/`
- Page-specific components in `pages/`
- Shared layout in `components/Layout.tsx`

### File Organization
- Design tokens: `tailwind.config.js`, `index.css`
- Components: `components/ui/`
- Pages: `pages/`
- Assets: `assets/` (if applicable)

---

**Last Updated:** 2024
**Version:** 1.0

