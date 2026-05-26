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

## 📦 6. Release Artifact Download (APK)

### 6.1 Demo Recording

- Demo 1: [Google Drive demo_walkthrough_1.webm](https://drive.google.com/file/d/1MopMzKkuqNGuu3sd1ukzV_qPRTL-70eK/view?usp=drive_link)
- Demo 2: [Google Drive demo_walkthrough_2.webm](https://drive.google.com/file/d/19mWDTn2LeG53CaCc8Y5eSatnfNcz4FsA/view?usp=drive_link)
- Demo 3: [Google Drive demo_walkthrough_3.webm](https://drive.google.com/file/d/1AwNQq_F9_Ga6psp1120OVXIa2RIZT50P/view?usp=drive_link)
- Suggested coverage: authentication flow, home feed pagination, explore filters/search, cart discount rules, offline banner behavior, and navigation across tabs.

### 6.2 Android APK Artifact

To validate the Android build without running a local native compile, download the generated APK artifact directly from GitHub Actions:

- APK artifact download: https://github.com/emeniceMhungu/MarketplaceExplorerAI/actions/runs/26424639315/artifacts/7206601484

Notes:

- The artifact is produced by the `android-apk-delivery` job in the workflow at `.github/workflows/ci.yml`.
- The upload step publishes `android/app/build/outputs/apk/debug/*.apk` as artifact name `marketplaceexplorerai-android-apk`.
- This artifact is generated after Expo Android prebuild and Gradle debug assembly complete successfully.

### 6.3 Why There Is No iOS APK-Equivalent Download Link

- iOS does not have a universal installable binary equivalent to Android APK that can be publicly downloaded and installed on arbitrary devices.
- iOS app binaries (`.ipa`) require Apple code signing, provisioning profiles, and device eligibility through App Store Connect distribution channels (for example, TestFlight or App Store release).
- Because of that platform policy, this repository provides a direct Android artifact link, while iOS should be built/run from source.

Build from this repository:

```bash
npx expo install
npx expo run:ios
```

Optional Android local build from source:

```bash
npx expo run:android
```

---

## 📋 7. Continuous Integration (CI) Workflow

The repository uses a single executable workflow at `.github/workflows/ci.yml`.

### 7.1 Trigger Strategy

- Runs on `push` to `main` and `master`.
- Runs on `pull_request` targeting `main` and `master` for `opened`, `synchronize`, and `reopened` events.

### 7.2 Job Overview

- `verify-build-integrity`
  - `npm ci`
  - `npx tsc --noEmit`
  - `npm run lint --if-present`
  - `npm test`
- `dependency-audit-gate`
  - `npm ci`
  - `npm audit --audit-level=high`
- `dependency-review-gate` (PR only)
  - Runs `actions/dependency-review-action@v4`
  - Emits a warning message if dependency graph is disabled
- `android-apk-delivery`
  - Runs only for main/master push or PR-to-main/master contexts
  - Validates upstream prechecks before build
  - Executes `npx expo prebuild --platform android --non-interactive`
  - Builds with Gradle `assembleDebug`
  - Uploads logs on failure (`android-gradle-logs`)
  - Uploads APK artifact (`marketplaceexplorerai-android-apk`)

### 7.3 CI Output Artifacts

- Android debug APK artifact name: `marketplaceexplorerai-android-apk`
- APK path captured by workflow: `android/app/build/outputs/apk/debug/*.apk`
- Failure diagnostics artifact name: `android-gradle-logs`

---

## ✅ 8. Correctness & Coverage Addendum

Operational parity checks aligned with CI:

- TypeScript gate: `npx tsc --noEmit`
- Lint gate: `npm run lint`
- Unit tests: `npm test`

---

## 🧪 9. Automated Testing Suite & Domain Verification

Our automated testing strategy uses deterministic unit tests focused on business-rule correctness and store-level pricing behavior. The suite validates premium badge eligibility, stock and cart eligibility restrictions, quantity clamping for low-stock products, and bulk discount application through Zustand cart metrics.

Run the full local test suite with:

```bash
npm test
```

CI Integration (Stage 1):

- Stage 1 of our CI pipeline executes the repository quality gates (type-checking + lint enforcement).
- The automated unit test command is configured in the scripts block and can be executed in the same Stage 1 validation phase for deterministic pre-merge domain verification.
