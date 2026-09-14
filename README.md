# Agrolink — Farm-to-Market Platform

Agrolink connects farmers, FPOs (farmer producer organisations), buyers and logistics partners in one marketplace. Farmers list produce with live pricing guidance, FPOs aggregate/gain or buy directly, consumers order fresh produce with a fair-price discovery, and orders move through delivery, payment escrow and settlement.

## Repository layout

| Path | Status | Purpose |
| --- | --- | --- |
| `frontend/` | **Implemented** | React 18 + Vite single-page app (all 14 feature modules, mock-first) |
| `backend/` | Scaffold | Spring Boot API (auth, marketplace, orders, payments) |
| `ai-service/` | Scaffold | Python service for price/demand forecasting and chatbot |
| `optimization-service/` | Scaffold | Python service for logistics/route optimization |
| `docs/` | Empty | `api`, `architecture`, `requirements`, `research` |
| `data/`, `scripts/`, `tests/` | Empty | Shared data / automation / integration tests |

The frontend runs fully standalone today using an in-browser mock layer — no servers required.

## Getting started (frontend)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run build` (production bundle), `npm run preview`, `npm run lint` (`eslint src`).

Vite proxies are pre-configured for when backends land: `/api` → `localhost:8080` (Spring Boot), `/ai` → `localhost:8000`, `/optimize` → `localhost:8001`. Every service in `src/services/` checks `MOCK_MODE` (`src/mocks/db.js`) and falls back to real HTTP automatically.

## Demo accounts

Password for every demo account is `secret`. The login page also has one-tap fill buttons.

| Role | Email | What you can do |
| --- | --- | --- |
| Consumer | `meera@example.com` | Browse marketplace, cart + checkout, orders, track/delivery confirm, pay, chatbot |
| Farmer | `harpreet@example.com` | Dashboard stats, list/edit products, incoming orders + confirm, payments, pricing/demand forecasts |
| FPO | `fpo.punjab@example.com` | FPO dashboard/profile, manage products, buy (procurement) and sell, incoming/outgoing orders, payments |

Route landing per role: consumer → `/marketplace`, farmer → `/producer/farmer/dashboard`, FPO → `/producer/fpo/dashboard`.

## Feature modules

All pages are implemented in `frontend/src/pages/` and wired in `frontend/src/routes/AppRoutes.jsx` with role-aware guards.

| # | Module | Pages / highlights |
| --- | --- | --- |
| 0–2 | Setup, infra, layout | Shared UI kit (`components/ui`), layout + sidebar per role, common widgets (`StatCard`, `DataTable`, `PageHeader`, `StatusBadge`…) |
| 3 | Auth | Login (phone or email), register (consumer/farmer/FPO), forgot password, protected routes, session via `AuthContext` |
| 4 | Marketplace | Product catalog with filters/search, product details, add-to-cart |
| 5 | Consumer | Dashboard, profile/address, cart, checkout, wishlist |
| 6 | Farmer | Dashboard, profile, add/my/edit product (shared `ProductForm`), incoming orders, confirm order, payments |
| 7 | FPO | Dashboard, profile, manage products, direct procurement (buy), sell, incoming/outgoing orders, confirm order, payments |
| 8 | Orders | Place order (from cart), order details (role-aware), order history, live order tracking |
| 9 | Pricing | Price forecast charts (recharts), price calculation suggestion (grade/channel aware) |
| 10 | Demand | Demand forecast by district |
| 11 | Logistics | Logistics dashboard, shipment details + route map, vehicle assignment, route planner |
| 12 | Delivery | Delivery status list, delivery confirmation (marks delivered, releases escrow payment) |
| 13 | Payment | Pay order (UPI/card/netbanking), payment confirmation, payment history (role-aware) |
| 14 | Chatbot | Agro Assistant chat window (context-backed, suggestion chips, typing indicator) |

## Architecture

```
frontend/src
  api/        axios client + endpoint constants
  components/ ui kit (shadcn-style) + common widgets + feature forms
  context/    Auth, Cart, Chatbot providers
  pages/      one folder per module (auth, marketplace, producer, orders,
              pricing, demand, logistics, delivery, payment, chatbot, consumer)
  services/   one service per domain, each: MOCK_MODE ? mockDb : axios
  mocks/      data.js (seed data) + db.js (in-browser CRUD "database")
  constants/  roles/allowed routes, statuses, navigation
  utils/      formatting (price/date), validation
```

- **Mock layer**: `mocks/data.js` seeds ready-to-use demo data (users, 20+ products, price/demand forecasts, shipments, payments). `mocks/db.js` implements `list/get/create/update*` used by every service, so the UI is fully interactive offline.
- **Design**: Tailwind CSS utility styling with a custom shadcn/ui-style component set. Dark-mode class toggle supported.
- **Status model**: orders flow `PENDING → CONFIRMED → PROCESSING → READY_FOR_SHIPMENT → OUT_FOR_DELIVERY → IN_TRANSIT → DELIVERED` (or `CANCELLED`); payments `PENDING → COMPLETED → RELEASED`.

## Verification

```bash
cd frontend
npm run lint   # clean (0 errors / warnings)
npm run build  # vite production build passes
```

## What's next

The backend (`backend/`, Spring Boot), AI forecasting/chatbot service (`ai-service/`) and route optimizer (`optimization-service/`) are planned next. The frontend services already call their live HTTP paths when `MOCK_MODE` is toggled off.