# Enhanced Marketplace Specification

## 1. Document Purpose

Define a production-style specification for a React Native mobile application named Marketplace Explorer. This specification is the implementation contract for engineering execution, QA validation, and architecture review.

This document translates the raw assessment requirements into:

- Functional scope
- Architecture boundaries
- Non-functional expectations
- Data and state models
- Feature acceptance criteria
- Delivery artifacts

No implementation code is included in this document.

## 2. Product Goal and Objective

Marketplace Explorer is a mobile commerce browsing experience where users can:

- Browse a large product catalog
- Search and filter products
- View product details
- Manage a persistent shopping cart
- Experience resilient behavior across pagination, offline, and API failure scenarios

Primary architecture objective: demonstrate scalable React Native design suitable for large lists and growing feature surface area.

Expected implementation window: 1.5 to 2 development days.

## 3. Platform and Technology Constraints

- Mobile framework: React Native with Expo (target Expo SDK 56)
- Language: TypeScript
- UI paradigm: functional components and hooks
- Navigation: Expo Router file-based navigation using a flat route layout in src/app (no nested tab folders)
- State management: mandatory centralized state strategy (Redux Toolkit, Zustand, MobX, or React Query + state store)
- Networking: dummyjson products API
- Persistence: local storage for session and cart

## 4. External API Contract

Base documentation:

- https://dummyjson.com/docs/products

Base endpoint:

- https://dummyjson.com/products

Required endpoint usage:

- Product list with pagination: /products?limit={limit}&skip={skip}
- Product search: /products/search?q={query}
- Product categories: /products/categories
- Products by category: /products/category/{category}

Assumptions:

- API is public and does not require authentication
- API may return intermittent failures and must be treated as unreliable network dependency

## 5. In Scope

1. Mock authentication gate with persisted session
2. High-performance product feed with large-list behavior
3. Search, category filter, and sorting
4. Cart management with quantity control and persistence
5. Mandatory business rules enforcement
6. Product details screen
7. Basic offline read support for previously loaded data
8. Error and empty-state handling with retry support
9. Modern tab-based UX shell

## 6. Out of Scope

1. Real backend authentication and token lifecycle
2. Payments or checkout integration
3. User profile management beyond session/logout placeholder
4. Server-side cart sync
5. Full PWA/web parity

## 7. High-Level Architecture

Application architecture must separate responsibilities into distinct layers:

1. UI Layer

- Screens, presentation components, user interactions
- No direct business rule implementation

2. State Layer

- Global stores and selectors
- Request status flags and derived data

3. Data Layer

- API client, endpoint wrappers, request cancellation/deduplication support
- Mapping from API response to app domain entities

4. Domain/Business Layer

- Rule evaluation (premium tag, low-stock logic, cart eligibility, bulk discount)
- Cart pricing calculations

5. Persistence Layer

- Session and cart persistence
- Product page cache for offline visibility

Architecture quality gate:

- UI components may consume domain outputs, but may not own business logic decisions directly.

## 8. Navigation Specification

Root flow:

1. Splash
2. Login (mock)
3. Main app flat-route shell (src/app top-level files)

Route file structure constraint (Expo SDK 56):

- All navigation stubs must be side-by-side at the top level of src/app
- Do not implement nested tab folders for this assessment
- Routing must be mapped as flat file paths, coordinated by src/app/\_layout.tsx
- Required stub routes must include screens for Splash, Login, Home, Search, Cart, and Profile

Main tabs:

1. Home
2. Search
3. Cart
4. Profile

Stack detail behavior:

- Product details is reachable from Home and Search contexts
- Navigation must preserve filter/search state when returning from detail to listing

Navigation acceptance criteria:

- Route stubs for core screens are implemented as flat file paths directly under src/app
- No nested tab folder structure exists in the routing tree

## 9. State Model Specification

Global state domains (minimum):

1. Auth State

- isAuthenticated
- session metadata
- bootstrap/loading flags

2. Catalog State

- products by page/query/category context
- category list
- pagination metadata (limit, skip, hasMore)
- request status and last error
- cache timestamps

3. Search and Filter State

- search query
- active category
- active sort option
- debounce timing state

4. Cart State

- line items by product id
- quantities
- subtotal
- discount
- total
- cart validation warnings

5. Network and App Status State

- online/offline indicator
- pending request count or screen-level loading flags

Persistence requirements:

- Auth session persists across restarts
- Cart persists across restarts
- Previously loaded catalog data remains readable offline

## 10. Feature Specifications

### 10.1 Authentication Gate (Mock)

Behavior:

- App starts on splash while persisted session is checked
- If session exists, route directly to app tabs
- If session missing, route to login screen

Login requirements:

- Email and password client-side validation
- Fake async login simulation (loading state shown)
- Successful login persists session

Acceptance criteria:

- Invalid credentials format blocks submission and shows error
- Relaunch after login restores authenticated entry without re-login
- Logout clears session and returns user to login
- Protected app tabs and protected direct routes are not accessible while signed out
- Any unauthenticated attempt to access Home, Search, Cart, Profile, or legacy non-spec routes inside the app shell redirects to the login gate

### 10.2 Home Product Feed

Card content requirements:

- Product image
- Product title
- Brand
- Category
- Price
- Discount percentage
- Rating
- Stock status
- Add to Cart action

Feed behavior requirements:

- Initial load fetches first page
- Infinite scroll loads next page
- Pull to refresh resets and reloads first page
- End-of-list state shown when no more data

Performance requirements:

- List virtualization/recycling must be enabled
- Duplicate fetch prevention for the same page context
- Avoid full-list re-renders on single item/cart changes
- Skeleton loading placeholders used for initial and/or page fetches

Acceptance criteria:

- Scrolling remains smooth on large datasets
- No visible duplicate products after pagination
- Pull-to-refresh returns list to latest first page state

### 10.3 Search, Filter, and Sorting

Required controls:

- Debounced search input
- Category filter selection
- Sort options: price ascending, price descending, highest rated

Behavior:

- Search queries must be debounced to reduce request volume
- Filters persist while navigating between tabs/screens
- Pagination remains functional under active search/filter/sort contexts

Acceptance criteria:

- Rapid typing does not fire one network request per keystroke
- Returning from product details preserves the previous listing context
- Sort order applies consistently to the currently active data set

### 10.4 Cart Module

Required capabilities:

- Add item
- Remove item
- Increase quantity
- Decrease quantity
- View subtotal, discount, total
- Persist cart between app restarts

Validation behavior:

- Quantity cannot exceed available stock
- Disallowed products cannot be added per eligibility rules

Acceptance criteria:

- Cart totals update immediately on quantity change
- App restart restores prior cart state accurately

### 10.5 Business Rules Engine

Rule A: Premium Choice

- Condition: rating >= 4.5 AND price >= 1000
- Outcome: show Premium Choice label and visual emphasis on product card

Rule B: Low Stock

- Condition: stock < 10
- Outcome: show Almost Sold Out indicator
- Constraint: cart quantity cannot exceed stock

Rule C: Cart Eligibility

- Product cannot be added if stock === 0 OR rating < 3
- UI requirement: Add to Cart disabled
- UX requirement: explanation message visible

Rule D: Bulk Discount

- Condition: cart subtotal > 5000
- Outcome: apply 10% discount
- Cart summary must display:
  - Original subtotal
  - Discount amount
  - Final total

Acceptance criteria:

- Rule outcomes are deterministic and consistent across Home, Search, and Details contexts
- Discount is recalculated on every cart mutation

### 10.6 Product Details Screen

Display requirements:

- Image carousel/gallery
- Full description
- Rating/reviews summary
- Availability/stock
- Related products section
- Add to cart controls honoring all business rules

Acceptance criteria:

- Product details match selected product identity from list
- Add to cart behavior is consistent with feed/cart business rules

### 10.7 Offline Support

Minimum offline behavior:

- Previously loaded product pages remain visible when offline
- Cart remains fully accessible offline
- No-internet state is clearly communicated

Online recovery behavior:

- User can retry failed actions when connectivity returns

Acceptance criteria:

- Entering offline mode after prior data load keeps catalog usable in read mode
- Offline cart operations remain available and consistent

### 10.8 Error and Empty State Handling

Error classes to handle:

- API failures
- Request timeouts
- Pagination errors
- Empty search/list results
- Offline request attempts

UX requirements:

- Each recoverable failure exposes retry action
- Loading, error, and empty states are visually distinct

Acceptance criteria:

- User is never blocked without an actionable next step when recovery is possible

## 11. Non-Functional Requirements

### 11.1 Performance

- Large-list scrolling should remain responsive
- Rendering should minimize avoidable updates
- Request flow must prevent duplicate concurrent page fetches
- Pagination should avoid race-condition corruption

### 11.2 Maintainability

- Clear module boundaries by layer
- Reusable UI components where appropriate
- Predictable naming and folder organization
- Business rules centralized and testable

### 11.3 Reliability

- Graceful handling of unreliable network
- Persistent data survival across app restart for session/cart and cached products

## 12. UX and UI Specification

General expectations:

- Modern, production-like visual quality
- Responsive layout behavior across common device sizes
- Clear visual hierarchy for product metadata and actions

Home guidance:

- Greeting header
- Search bar and filter affordance
- Horizontal category chip list
- Product feed in card-oriented layout

Quality details:

- Skeleton placeholders during data load
- Sticky search/filter affordance preferred
- Cart badge visibility preferred when cart has items

## 13. Testing and Validation Expectations

Minimum validation:

- Manual scenario validation for all core feature paths
- Deterministic verification of business rules and cart totals

Bonus validation:

- Unit tests for business rules and state selectors
- E2E tests for login, browsing, search/filter, cart, and offline fallback scenarios

## 14. Delivery Requirements

Required deliverables:

1. Git repository with meaningful commit history
2. README containing:
   - Setup instructions
   - Architectural decisions
   - State management rationale
   - Performance optimization approach
   - Trade-offs

Optional deliverable: 3. APK or demo video

## 15. Evaluation Rubric Alignment

Architecture:

- Separation of concerns
- Scalability of state and module structure

React Native capability:

- Navigation and lifecycle handling
- Hook usage and async flow control

Performance:

- List optimization and rendering efficiency
- Caching and pagination quality

Code quality:

- Naming consistency
- Reusability and maintainability

UX quality:

- Responsiveness
- Loading and error-state quality
- Smooth interaction behavior

Business logic:

- Correct rule handling
- Accurate cart calculations
- Persistence correctness

## 16. Definition of Done

The solution is considered done when all conditions below are met:

1. All in-scope features are implemented and navigable
2. Business rules A through D are fully enforced in UI and cart logic
3. Pagination, refresh, search/filter/sort, and cart persistence work reliably
4. Offline mode supports previously loaded catalog data and cart access
5. Error and empty states include clear messaging and retry pathways
6. Architecture demonstrates separation of UI, state, data, and business logic
7. README and required delivery artifacts are complete

## 17. Candidate Discussion Prompts

Candidate should be prepared to explain:

- Why the chosen state strategy was selected
- How list rendering and pagination were optimized
- How duplicate requests and race conditions were prevented
- How caching and offline fallback were designed
- What architectural changes would be made for production scale
