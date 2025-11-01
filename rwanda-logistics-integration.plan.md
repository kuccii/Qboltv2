<!-- 427dd0e3-7758-43fc-ba24-4f463c9e65ca 4f5443e5-5593-4dc4-b7bb-e79b0b32537e -->
# Page-by-Page Critique and Redesign Plan

## Global Cross-Cutting Improvements
- **Navigation and layout**: Standardize around `AppLayout` + `PageHeader` + `RailLayout` + `PageLayout` + `SectionLayout` with `max-w-7xl` and right rail occupying the margin.
- **Dark mode**: Ensure all pages use tailwind dark variants; remove inline styles that fight theme.
- **Data layer**: Use hooks (`useApi`, `usePrices`, `useSuppliers`) with loading/empty/error states via `EmptyState`.
- **Actions**: Move export/refresh/settings into `ActionMenu` in headers; unify search with `SearchInput`.
- **Filters**: Centralize filters in `FilterSidebar` or left rail quick filters; persist selections in URL params when useful.
- **A11y**: Provide semantic headings, keyboard-focusable controls, aria-live updates on async.

---

## Dashboard (`src/pages/Dashboard.tsx`)
- **Critique**: Improved with design system; ensure charts/metrics reflect user industry and country selection; avoid redundant padding; verify rail content value.
- **Proposed**: 
  - Replace mock filter console logs with real state and query param sync.
  - Add saved dashboard layouts per user; metric card config in profile.
  - Add recent activity feed; add anomaly alerts widget.
- **Content/Functions**:
  - Country and industry filters drive all sections; `ActionMenu`: export CSV/PDF, refresh, personalize.
  - Right rail: “Tips”, “Sponsored”, “What’s new”.

## Price Tracking (`src/pages/PriceTracking.tsx`)
- **Critique**: Modernized; fix filter groups referencing `regions` before declaration; align chart time range to data.
- **Proposed**:
  - Multi-series compare with legend toggles; material chips with color keys.
  - Alert thresholds with `Plus` action; save views (time range, region, materials).
- **Content/Functions**:
  - Left quick filters: time presets; right rail: report, volatility explainer.
  - API-backed export; debounce `SearchInput` to filter materials.

## Price Reporting (`src/pages/PriceReporting.tsx`)
- **Critique**: Currently basic; lacks guidance and validation feedback.
- **Proposed**: Split-screen: left form, right live context (recent prices, credibility tips, rules).
- **Content/Functions**:
  - Multi-step form with progress; photo/upload; location picker; anonymization option.
  - Server-side validation; draft autosave; submission receipts.

## Supplier Directory (`src/pages/SupplierDirectory.tsx`)
- **Critique**: Margins correct; filters are basic; no compare or map.
- **Proposed**: Advanced filters (verification, rating, region, materials), grid/list toggle, map view.
- **Content/Functions**:
  - Comparison tray; save supplier lists; quick contact actions; Rwanda badge integration.
  - Infinite scroll/virtualization; SEO-friendly URLs.

## Supplier Scores (`src/pages/SupplierScores.tsx`)
- **Critique**: Needs methodology clarity; static rankings.
- **Proposed**: Score breakdown accordion, weighting sliders, benchmarks by industry/country.
- **Content/Functions**:
  - Leaderboard with filters; detail drawer with history and peer comparison.

## Logistics (`src/pages/Logistics.tsx`)
- **Critique**: Lacks interactivity; not tied to price or routes.
- **Proposed**: Route planner, cost calculator, carrier performance.
- **Content/Functions**:
  - Inputs: origin/destination, mode, load; outputs: ETA, cost, risks; save routes.

## Demand Mapping (`src/pages/DemandMapping.tsx`)
- **Critique**: High-level only; needs visual map and forecasts.
- **Proposed**: Choropleth by demand index; trend charts; sector toggles.
- **Content/Functions**:
  - Filters by timeframe and sector; tooltip with regional stats; export map.

## Document Vault (`src/pages/DocumentVault.tsx`)
- **Critique**: Flat listing; missing expiry warnings.
- **Proposed**: Grid with smart folders, tags, expiry badges; bulk operations.
- **Content/Functions**:
  - OCR and metadata; versioning; share links with permissions; expiries calendar.

## Financing (`src/pages/Financing.tsx`)
- **Critique**: Static info; no eligibility scoring.
- **Proposed**: Eligibility checker wizard; loan comparison; application tracker.
- **Content/Functions**:
  - Integrate with suppliers/orders; export application package; status updates.

## Risk Mitigation (`src/pages/RiskMitigation.tsx`)
- **Critique**: General tips, limited real-time linkage.
- **Proposed**: Risk dashboard with timeline, alerts linked to prices/logistics.
- **Content/Functions**:
  - Mitigation playbooks; subscribe to risk topics; incident postmortems.

## Admin Dashboard (`src/pages/AdminDashboard.tsx` and `src/components/AdminDashboard.tsx`)
- **Critique**: Minimal; lacks health and moderation tools.
- **Proposed**: System health, queues, user analytics, content moderation.
- **Content/Functions**:
  - Feature flags; audit logs; role management; provider status panels.

## Agents Directory (`src/pages/AgentsDirectory.tsx`)
- **Critique**: Similar to suppliers but fewer attributes.
- **Proposed**: Profiles with ratings, service maps, direct booking.
- **Content/Functions**:
  - Availability calendar; messaging; SLA badges.

## Community Forum (`src/components/CommunityForum.tsx`)
- **Critique**: Needs moderation, search, tagging.
- **Proposed**: Threads with tags, accepted answers, expert badges.
- **Content/Functions**:
  - Rich editor; pin/lock; report abuse; mention users.

## Home (`src/pages/Home.tsx`)
- **Critique**: Needs stronger value prop and social proof.
- **Proposed**: Hero with CTA, animated stats, live price ticker, coverage map.
- **Content/Functions**:
  - Customer logos, testimonials carousel; quick links to core flows.

## Login/Register (`src/pages/Login.tsx`, `src/pages/Register.tsx`)
- **Critique**: Long forms; limited feedback, no social login.
- **Proposed**: Progressive onboarding by industry; password meter, social auth.
- **Content/Functions**:
  - Magic link; 2FA; terms consent; post-register checklist.

## NotFound (`src/pages/NotFound.tsx`)
- **Critique**: Sparse.
- **Proposed**: Helpful suggestions, search, popular pages, link to support.

## Price Reporting Admin/Moderation (new or extend `AdminDashboard`)
- **Proposed**: Queue, reviewer tools, quality scores, duplicate detection.

---

## Technical Changes by File (high-level)
- Add/extend usage of `PageHeader`, `RailLayout`, `FilterSidebar`, `DataCard`, `SectionLayout` across all pages in `src/pages/*`.
- Introduce reusable widgets: comparison tray, map components, route planner, score breakdown.
- Ensure dark mode classes on all new layouts; remove inline styles.
- Adopt hooks for data with error/loading/empty states and URL param sync.

## Success Metrics
- Engagement: time-on-page +15%, dashboard interactions +25%.
- Conversion: registrations +10%, report submissions +20%.
- Performance: LCP < 2.5s, TTI < 3s, Lighthouse > 90.
- Accessibility: Keyboard complete, color contrast AA.


### To-dos

- [ ] Enhance Dashboard: saved layouts, alerts, real filters
- [ ] Advance Price Tracking: compare, alerts, saved views
- [ ] Split-screen Price Reporting with validation and uploads
- [ ] Rebuild Supplier Directory: filters, map, compare
- [ ] Upgrade Supplier Scores: methodology and leaderboard
- [ ] Add Logistics route planner and cost calculator
- [ ] Add Demand Mapping choropleth and forecasts
- [ ] Document Vault: smart folders, bulk ops, expiries
- [ ] Financing eligibility wizard and comparison
- [ ] Risk dashboard with alerts and playbooks
- [ ] Admin health, moderation, flags, analytics
- [ ] Agents profiles with booking and availability
- [ ] Forum: tags, accepted answers, moderation
- [ ] Home: hero, stats, ticker, social proof
- [ ] Auth: social login, onboarding, 2FA
- [ ] NotFound: suggestions and search
- [ ] A11y and performance upgrades across pages

---

## Deep Critique and Redesign Details (per page)

### Dashboard (`src/pages/Dashboard.tsx`)
- Critique
  - Metrics not personalized enough; mock filters previously not wired to data.
  - Contextual insights limited; activity and anomaly signals absent.
  - Right rail can carry higher-value guidance than generic content.
- What it should be
  - Personalized overview driven by industry, countries, and supplier interests.
  - Clear primary KPIs, price trends, change deltas, and actionable next steps.
  - Activity feed from suppliers you follow; anomaly alerts surfaced prominently.
- Content
  - KPIs (transactions, AOV, suppliers, volatility), price trend chart, price changes list, supply alerts, recent activity, anomaly alerts.
- Functions
  - URL-synced filters; saved layout presets; export; refresh; quick personalization.
  - Right rail: tips, sponsored content, release notes.
  - Loading/empty/error states via `EmptyState`.

### Price Tracking (`src/pages/PriceTracking.tsx`)
- Critique
  - Good foundation; needs true compare, alerting, and saved views.
  - Time range must affect queried data, not only UI state.
- What it should be
  - Multi-material compare with toggleable legend; focus by region/timeframe.
  - Threshold alerts creation and management inline.
- Content
  - Chart with brushes or presets; key metric cards; insights/alerts section.
- Functions
  - Debounced search to filter materials; export with current view; save named views.
  - URL param sync; right rail with volatility explainer and report link.

### Price Reporting (`src/pages/PriceReporting.tsx`)
- Critique
  - Single-shot form lacks guidance, validation clarity, and trust cues.
- What it should be
  - Split-screen: left multi-step wizard, right live context (recent prices, rules, trust tips).
- Content
  - Steps: Material & location → Price details → Evidence upload → Review & submit.
- Functions
  - Client and server validation; photo/file upload; location picker; draft autosave; anonymization option; submission receipt and status.

### Supplier Directory (`src/pages/SupplierDirectory.tsx`)
- Critique
  - Filters basic; no compare tray; no map context; list can be heavy without virtualization.
- What it should be
  - Powerful discovery with advanced filters, list/grid toggle, and optional map.
- Content
  - Cards with rating, badges (verified, Rwanda-ready), materials, regions, quick actions.
- Functions
  - Comparison tray; save lists; contact, bookmark; infinite scroll/virtualize; SEO params in URL.

### Supplier Scores (`src/pages/SupplierScores.tsx`)
- Critique
  - Rankings opaque; methodology unclear; limited drill-down.
- What it should be
  - Transparent scoring with breakdowns, weights, and benchmarking.
- Content
  - Leaderboard, filters by industry/country, detail drawer with history and peers.
- Functions
  - Weighting sliders; download report; shareable links; methodology explainer.

### Logistics (`src/pages/Logistics.tsx`)
- Critique
  - Static estimates; no scenario planning, no carrier performance.
- What it should be
  - Route planner and cost estimator that ties to price and risk data.
- Content
  - Form (origin, destination, mode, load); outputs (ETA, cost, risk); carrier list with SLAs.
- Functions
  - Save routes; compare modes; export quote; risk overlays; Rwanda corridor presets.

### Demand Mapping (`src/pages/DemandMapping.tsx`)
- Critique
  - Lacks visual mapping and temporal trends.
- What it should be
  - Choropleth map by demand index with sector filters and time slider.
- Content
  - Map, trend mini-charts, region detail panel, sector toggles.
- Functions
  - Export map snapshot; deep link to region; URL-synced state.

### Document Vault (`src/pages/DocumentVault.tsx`)
- Critique
  - Flat list; no tagging, expiry awareness, or bulk ops.
- What it should be
  - Smart folders and tags with expiries and versioning.
- Content
  - Grid/list, tags, expiry badges, versions timeline.
- Functions
  - OCR ingestion; bulk actions; share with permissions; calendar view of expiries.

### Financing (`src/pages/Financing.tsx`)
- Critique
  - Informational; no eligibility assessment or comparisons.
- What it should be
  - Guided eligibility wizard with product comparison and application tracker.
- Content
  - Inputs (revenue, orders, collateral), offers comparison, checklist.
- Functions
  - Export package; provider handoff; status updates; reminders.

### Risk Mitigation (`src/pages/RiskMitigation.tsx`)
- Critique
  - Generic content; lacks live linkage to market/logistics signals.
- What it should be
  - Risk console with timelines, alerts, and playbooks.
- Content
  - Risk timeline, alert list, playbooks, postmortems.
- Functions
  - Subscribe to topics; simulate impact; task assignments.

### Admin Dashboard (`src/pages/AdminDashboard.tsx`, component variant)
- Critique
  - Missing operational views and moderation controls.
- What it should be
  - Ops console with health, queues, moderation, analytics, flags.
- Content
  - User growth, DAU/WAU/MAU, error rates, provider statuses, moderation queues.
- Functions
  - Role/permissions management; audit logs; feature flags; PR review links.

### Agents Directory (`src/pages/AgentsDirectory.tsx`)
- Critique
  - Undifferentiated from suppliers; lacks booking and availability.
- What it should be
  - Service-forward profiles with ratings and scheduling.
- Content
  - Profile cards, service areas map, pricing bands, reviews.
- Functions
  - Availability calendar; request quote; SLA badges; chat.

### Community Forum (`src/components/CommunityForum.tsx`)
- Critique
  - Discovery and quality signals limited; moderation tools missing.
- What it should be
  - Tag-based threads, accepted answers, expert badges, search.
- Content
  - Thread list, rich editor, answer sorter, pinned posts.
- Functions
  - Upvotes/accepted answers; report abuse; moderation queue; mentions.

### Home (`src/pages/Home.tsx`)
- Critique
  - Needs stronger narrative and proof.
- What it should be
  - Crisp value prop with social proof and live product signal.
- Content
  - Hero with CTA, live price ticker, stats, testimonials, logos.
- Functions
  - Primary CTA to onboarding; secondary to explore prices/suppliers.

### Login/Register (`src/pages/Login.tsx`, `src/pages/Register.tsx`)
- Critique
  - Long forms; little guidance; no alternatives.
- What it should be
  - Streamlined onboarding with social auth and password quality.
- Content
  - Step-wise fields based on industry; terms consent; 2FA prompt.
- Functions
  - Magic link; social login; enforce strong passwords; post-signup checklist.

### NotFound (`src/pages/NotFound.tsx`)
- Critique
  - Dead-end page.
- What it should be
  - Recovery hub with search, popular links, and support.
- Content
  - Search input, quick links, help contact.
- Functions
  - Track 404 source; suggest likely targets.


