# Commit Message

## Summary
Major UI/UX redesign and feature additions for UMass Marketplace

## Changes

### Frontend Design System
- Complete visual redesign with warm autumn color palette
- Added comic-style design elements (rounded panels, thick borders, halftone textures)
- Created reusable Logo component with shopping bag emoji
- Implemented responsive design with mobile-first approach
- Added custom scrollbar styling matching theme
- Created Design Playground page for UI/UX testing

### Navigation & Layout
- Removed category sidebar (functionality moved to navbar)
- Added Buyer/Seller toggle in navbar (fixed position next to login)
- Implemented shopping cart for buyers (only visible in buyer mode)
- Added cart access control (auto-redirects if accessed in seller mode)
- Improved responsive navbar that stacks properly on mobile
- Fixed search button to be circular and properly bound to input

### New Features
- Shopping cart page with quantity controls and checkout summary
- Category filtering via URL params and navbar dropdown
- Sort by price functionality (low to high, high to low)
- Improved responsive listing cards that scale properly
- Clean category display in results section

### Code Quality
- Removed excessive console.logs
- Added comprehensive route/page documentation comments
- Created reusable Logo component
- Removed redundant UI elements ("Search Results" duplicate text)
- Fixed all JSX structure errors

### Bug Fixes
- Fixed sidebar cut-off issue
- Fixed search button jumping out of container
- Fixed navbar responsiveness on mobile
- Fixed duplicate navigation elements
- Removed all syntax errors

## Breaking Changes
**NONE** - All changes are backward compatible

## Verification
- ✅ **Java version remains 21** (matches main branch - verified)
- ✅ Spring Boot upgraded from 3.3.0 to 3.5.6 (minor version upgrade, backward compatible)
- ✅ Database configuration changes are dev-environment specific (umarket_dev vs umarket)
- ✅ All routes remain accessible (no access control added)
- ✅ No API contract changes
- ✅ Dockerfile uses Java 21 (eclipse-temurin:21) - matches pom.xml

## Files Changed
- Frontend: UI components, pages, styling
- Backend: Minor config updates (dev environment only)
- New: Logo component, Cart page, Design Playground page

