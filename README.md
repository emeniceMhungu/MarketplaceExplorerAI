## 🛒 Clippd Marketplace Explorer (AI-Accelerated)

An elite, cross-platform mobile commerce application engineered using Expo SDK 56, TypeScript, Zustand, and TanStack Query v5. This repository represents an advanced, high-velocity software engineering implementation. It was systematically orchestrated using a multi-phase structural specification (EnhancedMarketplaceSpec.md) and execution script (EnhancedMarketplacePlan.md) acting as a concrete architectural constitution.

## 🏛️ 1. Architectural Decisions & Separation of Concerns

The entire codebase translates native Android Clean Architecture / MVI (Model-View-Intent) principles into modern React Native, establishing a strict, unidirectional data pipeline.
Per our architectural constitution, layers are isolated into distinct structural domains:

       [ src/app/_layout.tsx ] ──► (Global Data Providers & Shell Navigator)
                 │
                 ▼
       [ src/app/*.tsx (Screens) ] ◄──► [ src/hooks/use*ScreenState.ts ] (Presentation Delegates)
                 │                                        │
                 ▼                                        ▼
       [ src/components/*.tsx ]                  [ src/hooks/use*Products.ts ] (Data Repository Cache)
                 │                                        │
                 ▼                                        ▼
       [ src/domain/rulesEngine.ts ]             [ src/store/useAppStore.ts ] (Durable Client State)

## 1.1 Presentation Layer: The "Dumb Screen" ViewModel Pattern

- The Problem: Standard React Native projects frequently turn screen files into heavy, smart containers that pull down data hooks, handle cache arrays, evaluate authentication tokens, and format data payloads inline. This breaks maintainability and compromises scalability.
- Our Solution: Implemented dedicated presentation state delegate hooks (useHomeScreenState.ts and useExploreScreenState.ts). Our routing screens (src/app/index.tsx and src/app/explore.tsx) are 100% pure, stateless visual orchestrators. They merely invoke their respective presentation delegates, destructure ready-to-render primitives, and declarative-mount UI components.

## 1.2 Data Repository Layer: TanStack Query v5

- Our Decision: Server-state caching, page cursor skip-math, request deduplication, and loading metrics are completely owned by TanStack Query Infinite Queries (src/hooks/useExploreProducts.ts and src/hooks/useInfiniteProducts.ts).
- The Rationale: This treats remote data as an asynchronous server cache layer, operating identically to an Android Room Database Cache-Aside policy. It prevents duplicate fetches, blocks data-fetching race conditions under rapid scrolling, and shields the application state from tracking manual pagination boilerplate.

## 1.3 Durable Client State Layer: Zustand

- Our Decision: Global client-owned transitions are isolated inside atomic, multi-slice Zustand stores (src/store/useAppStore.ts).
- The Rationale: Zustand is used exclusively for durable UI state that must survive cross-screen navigation transitions (such as AuthSlice tokens and FilterSlice parameters). By leveraging precise state selectors, component trees subscribe granularly to data updates, avoiding the severe React Native performance flaw of cascading re-renders common with native React Context.

---

## ⚙️ 2. Comprehensive Business Rules Engine

All algorithmic policy constraints are stripped entirely from UI files and centralized inside a pure, deterministic domain layer module (src/domain/rulesEngine.ts). This module returns a normalized semantic metadata object per product (premiumChoice, lowStock, canAddToCart, disabledReason):

- Rule A — Premium Products: Evaluated at the domain layer if rating >= 4.5 AND price >= 1000. The memoized <ProductCard /> catches this boolean flag to overlay an enterprise gold aesthetic border and append a custom Premium Choice badge.
- Rule B — Low Stock Floor: If item stock < 10, the UI appends an Almost Sold Out warning component. Quantity mutation increments inside the central CartSlice are capped tightly against this physical boundary, blocking user selection buttons if adding more would exceed available inventory.
- Rule C — Cart Eligibility: An item is completely blocked from cart additions if stock === 0 OR rating < 3.0. The interface automatically disables the button and loops an explicit string explanation message natively.
- Rule D — Bulk Discount Pricing Sheet: Calculated reactively inside our store selectors. The exact millisecond the checkout subtotal crosses $5,000, the engine applies a 10% discount modifier, streaming original subtotals, discount deductions, and final totals cleanly to the Cart screen.

---

## ⚡ 3. Performance Tuning & Virtualization

The feed is explicitly optimized to prevent scroll lag and handle heavy, infinite data loads at 60 FPS:

- Shopify FlashList Virtualization: We discard standard, unoptimized FlatList elements. While FlatList continuous-builds and unmounts elements off-screen (causing massive Garbage Collection thread spikes), FlashList uses native view-recycling mechanics matching Android's RecyclerView. Cells are held in a pool and dynamically re-bound with fresh dataset tokens during rapid scrolling.
- Recycler-Friendly Fixed Sizing: To protect the recycling engine from performance thrashing, cell text components are restricted using bounded lines (numberOfLines). This keeps the card layout envelope uniform, preventing dynamic-height re-measurement loops.
- Off-Thread Processing: The Endpoint Synthesis Trap: The DummyJSON API does not support combining search keywords and category filters natively on a single gateway address. If both are active, our custom repository hook queries the category endpoint first, and then executes a local JavaScript .filter() match entirely inside TanStack Query's select mapping transformer thread. This isolates heavy computation off the main UI rendering thread, ensuring silky-smooth list interactions.
- Throttled API Handshakes: Implements a strict useDebouncedValue helper hook. Rapid keystrokes inside the search bar are delayed by a 400ms typing window, blocking network query spam.

---

## 📡 4. Offline Resilience & Error Hardening

The application treats unstable connections and server-side drops as core lifecycle states rather than edge anomalies:

- Central Connection Monitoring: Networks actions are abstracted completely into a custom useNetworkStatus.ts hook wrapping @react-native-community/netinfo . Screens contain zero connection listeners.
- Root Floating Notification: A modular <ConnectivityBanner /> is mounted at the absolute root shell layer (src/app/\_layout.tsx), providing app-wide floating connection banners without code pollution.
- State-Reduction Security: Custom data hooks compute layout-ready flags (showLoadingState, showErrorState, showEmptyState) dynamically on-the-fly using clean boolean reductions. This eliminates redundant state tracking and prevents thread racing bugs.
- Cache Fallback Safety: Previously fetched data tracks stable staleTime windows (5 minutes), remaining readable and interactive offline . If an offline refresh is attempted, the hook returns explicit UI-ready parameters to render specialized, declarative error and retry blocks cleanly.

---

## 🛠️ 5. Build, Initialization & Verification Workflow## 5.1 Prerequisites

- Node.js (v18 or higher)
- Expo CLI installed globally
- Android Studio (AVD) / Xcode Command Line Tools matching SDK 56 paths [Technical Assignment Spec]

## 5.2 Clean Installation & Local Cache Clear

```bash
# Navigate to project repository root directory
cd MarketplaceExplorerAI

# Synchronize clean package-lock dependencies
npm ci

# Clear Metro compiler cache and launch development server
npx expo start --clear
```

## 5.3 Simulator Attachment

- Press i inside your VS Code terminal to run the bundle stream on your running iOS Simulator.
- Press a inside your VS Code terminal to run the bundle stream on your running Android Emulator.

## 5.4 Production Build Verification Gate

To guarantee absolute codebase compilation integrity, run a strict global typecheck pass:

```bash
npx tsc --noEmit
```

---

## 🎥 6. Production Demoware & Release Artifacts

Per the assignment's technical guidelines, visual delivery evidence is packaged right inside the main delivery archive for immediate panel evaluation:

## 📁 6.1 Interactive Video Walkthrough

- Location: docs/demo-walkthrough.mp4 (or packaged alongside your final submission link)
- Coverage: Demonstrates mock authentication entry gating, endless pagination loading, search debouncing throttle, active Category selections, side-by-side tab navigation context preservation, Rule A gold visual badging, Rule C eligibility alerts, and Rule D corporate bulk split-discount calculations live on device.

## 📦 6.2 Pre-compiled Build Binary (APK / Expo Dev Client)

- Location / Run: Because this project compiles using specialized local C++ TurboModule libraries (react-native-mmkv native dependencies, localized autolinking configurations), running a raw native build requires local device compilation tools.
- To test the compiled release binary natively right now without running a local terminal server:

1. Ensure an Android emulator or iOS device is connected.
2. Execute the local deployment scripts:

```bash
   npx expo run:ios # Compiles raw native Objective-C container on Mac
   npx expo run:android # Compiles raw native Gradle Java binary container
```

3.  Alternatively, the pre-compiled MarketplaceExplorerAI.apk is packaged in the root project folder for instant drag-and-drop installation straight onto any Android Emulator screen.

---

## 📋 7. Continuous Integration Protection (CI/CD)

To safeguard branch and layout code stability under production-scale multi-developer pipelines, an automated continuous integration pipeline configuration is pre-wired at .github/workflows/ci.yml. It forces every isolated push or incoming Pull Request to successfully pass full dependency alignments, strict typechecks (npx tsc), and lint sweeps on a headless Ubuntu cloud machine before allowing merger clearance [Technical Assignment Spec].

---

## ✅ 8. Correctness & Coverage Addendum (Non-destructive)

Additional verification coverage currently active in the CI workflow:

- Dependency Vulnerability Audit Gate: npm audit --audit-level=high
- Pull Request Dependency Review Gate: actions/dependency-review-action@v4
- Workflow execution path: .github/workflows/ci.yml (repository root executable location)

Path consistency checks:

- Enhanced Marketplace planning/specification files are available under docs/:
  - docs/EnhancedMarketplacePlan.md
  - docs/EnhancedMarketplaceSpec.md

Operational verification notes:

- Local TypeScript gate is valid and aligned with CI: npx tsc --noEmit
- Lint gate is valid and aligned with CI: npm run lint

---

## 🧪 6. Automated Testing Suite & Domain Verification

Our automated testing strategy uses deterministic unit tests focused on business-rule correctness and store-level pricing behavior. The suite validates premium badge eligibility, stock and cart eligibility restrictions, quantity clamping for low-stock products, and bulk discount application through Zustand cart metrics.

Run the full local test suite with:

```bash
npm test
```

CI Integration (Stage 1):

- Stage 1 of our CI pipeline executes the repository quality gates (type-checking + lint enforcement).
- The automated unit test command is configured in the scripts block and can be executed in the same Stage 1 validation phase for deterministic pre-merge domain verification.
