# React Native Technical Assessment — “Marketplace Explorer”

Build a production-style React Native application that simulates a real-world e-commerce browsing experience.

This task is intentionally designed to evaluate:

- • Architecture decisions
- • State management
- • Performance optimization
- • API integration
- • Business logic implementation
- • Offline and pagination handling
- • React Native scalability practices

Expected completion time:
1.5 – 2 full development days

## Objective

Create a mobile app where users can:

- • Browse a large catalog of products
- • Search and filter products
- • Manage a shopping cart
- • Persist state locally
- • Handle business rules
- • Support smooth performance with large datasets

## Real API

Use the public commerce API from:
https://dummyjson.com/docs/products

Base endpoint:
https://dummyjson.com/products

Examples:

- GET /products?limit=20&skip=0
- GET /products/search?q=phone
- GET /products/categories
- GET /products/category/smartphones

This API supports:

- • Pagination
- • Categories
- • Search
- • Product images
- • Pricing
- • Ratings
- • Stock
- • Metadata

Perfect for realistic mobile architecture testing.

## Core Features

1. Authentication Gate (Mocked)
   The app should start with:
   - • Splash screen
   - • Mock login screen
     No real authentication required.

   Requirements:
   - • Email/password validation
   - • Fake login request simulation
   - • Persist logged-in session locally
   - • Auto-login on app restart

   Suggested tools:
   - • AsyncStorage
   - • MMKV

2. Home Screen — Product Feed
   Display a high-performance product feed.
   Each product card must contain:
   - • Product image
   - • Product title
   - • Brand
   - • Category
   - • Price
   - • Discount percentage
   - • Rating
   - • Stock status
   - • “Add to Cart” button

3. Large List Requirements (Very Important)
   The product feed must be optimized for large datasets.

   Mandatory:
   - • Infinite scrolling pagination
   - • Pull to refresh
   - • List recycling/virtualization
   - • Skeleton loading state
   - • Pagination caching
   - • Prevent duplicate fetches
   - • Graceful end-of-list handling

   The implementation should avoid:
   - • Scroll lag
   - • Excessive re-renders
   - • Full list re-rendering
   - • Fetch race conditions

   Preferred list libraries:
   - • FlashList
   - • RecyclerListView

   Plain FlatList is allowed only if properly optimized.

4. State Management (Mandatory)
   The app MUST use proper state management.
   The state should include:
   - • Authentication state
   - • Product cache
   - • Cart state
   - • Search/filter state
   - • Pagination state
   - • Network/loading states

   Accepted solutions:
   - • Redux Toolkit
   - • Zustand
   - • MobX
   - • React Query + Zustand
   - • Redux Saga / RTK Query (bonus)

   The architecture should clearly separate:
   - • API layer
   - • State layer
   - • UI layer
   - • Business logic layer

5. Search & Filtering
   Implement:
   - • Debounced search
   - • Category filtering
   - • Sorting

   Sorting options:
   - • Price ascending
   - • Price descending
   - • Highest rated

   Requirements:
   - • Search should not spam API calls
   - • Filters should persist while navigating
   - • Pagination must work with filters
   - • UI should remain performant

6. Cart Module
   Users should be able to:
   - • Add/remove items
   - • Increase/decrease quantity
   - • View cart total
   - • Persist cart locally

   Cart should survive app restarts.

7. Business Rules (Important)
   Rule A — Premium Products
   If:
   rating >= 4.5
   AND
   price >= 1000
   Display:
   “Premium Choice”
   The product card should visually emphasize premium products.

   Rule B — Low Stock
   If:
   stock < 10
   Display:
   “Almost Sold Out”
   Users cannot add more than available stock to cart.

   Rule C — Cart Eligibility
   A product cannot be added to cart if:
   stock === 0
   OR
   rating < 3

   Requirements:
   - • Disable Add to Cart button
   - • Show explanation message

   Rule D — Bulk Discount
   If cart subtotal exceeds:
   $5000
   Apply:
   10% discount
   Display:
   - • Original subtotal
   - • Discount amount
   - • Final total

8. Product Details Screen
   When tapping a product:
   - • Navigate to detail screen

   Display:
   - • Carousel/gallery
   - • Full description
   - • Reviews/rating
   - • Availability
   - • Related products section
   - • Add to cart controls

9. Offline Support
   Basic offline support required.

   Requirements:
   - • Previously loaded products remain visible offline
   - • Cart still accessible offline
   - • Proper “No Internet” handling

10. Error Handling
    Handle:
    - • API failures
    - • Timeouts
    - • Empty states
    - • Retry actions
    - • Offline mode
    - • Pagination failures

11. UI / UX Expectations
    The UI should feel modern and production-like.

    Suggested structure:
    Bottom Tabs
    - • Home
    - • Search
    - • Cart
    - • Profile

    Home Screen Layout
    Header
    - • Greeting
    - • Search bar
    - • Filter button

    Horizontal Category List
    Scrollable chips:
    - • Smartphones
    - • Laptops
    - • Fragrances
    - • Furniture
    - • Groceries
    - • etc.

    Product Feed
    Pinterest-like or card list layout.

    Suggested UI Direction
    Visual Style
    - • Clean e-commerce design
    - • Rounded cards
    - • Sticky search/filter bar
    - • Floating cart badge
    - • Skeleton placeholders

    Suggested Screens
    Screen Purpose

---

Splash Session bootstrap
Login Mock authentication
Home Product feed
Product Details Product information
Cart Checkout summary
Profile Session/logout

## Technical Expectations

Required

- • TypeScript
- • Functional components
- • Hooks
- • Clean folder structure
- • Reusable components
- • Proper navigation architecture
- • Optimized rendering
- • Proper loading states

Nice-to-Have

- • Unit tests (some unit tests would be a bonus)
- • E2E tests
- • RTK Query / React Query
- • Dark mode
- • Animations
- • Shared element transitions
- • Feature-based architecture
- • CI setup

## Suggested Stack

Candidate may choose freely, but recommended:

Core

- • React Native
- • TypeScript
- • React Navigation

State

- • Redux Toolkit or Zustand

Networking

- • Axios
- • React Query / RTK Query

Storage

- • MMKV
- • AsyncStorage

Performance

- • FlashList

## Deliverables

The candidate must provide:

1. Git Repository
   With commit history.
2. README
   Include:
   - • Setup instructions
   - • Architectural decisions
   - • State management explanation
   - • Performance optimization explanation
   - • Tradeoffs made
3. APK or Demo Video (Bonus)
   Optional but encouraged.

## Evaluation Criteria

Architecture

- • Separation of concerns
- • Scalability
- • State structure

React Native Knowledge

- • Navigation
- • Lifecycle handling
- • Hooks
- • Async flows

Performance

- • List optimization
- • Rendering efficiency
- • Caching
- • Pagination quality

Code Quality

- • Naming
- • Readability
- • Reusability
- • Maintainability

UX Quality

- • Responsiveness
- • Loading states
- • Error handling
- • Smooth interactions

Business Logic

- • Correct rule handling
- • Cart calculations
- • State persistence

## Additional Constraints

The candidate should NOT:

- • Store everything in component state
- • Fetch all products at once
- • Ignore loading/error states
- • Use unoptimized lists for large datasets
- • Mix business logic directly inside UI components

## Optional Discussion Section (For Interview Follow-Up)

Be prepared to explain:

- • Why you chose your state management approach
- • How you optimized rendering
- • How pagination caching works
- • How you prevent duplicate requests
- • How you would scale the architecture further
- • What improvements you would make in production

## Technical Skills Being tested:

- Strong React Native fundamentals and understanding of RN internals
- React Native development using Expo
- React Native view lifecycle
- Debugging React Native UI issues
- Lists, Styled Components, and Navigation
- State management, data flow, and basic React Native architecture concepts (MobX, Redux, Zustand)
- Solid software engineering fundamentals
- Testing fundamentals
