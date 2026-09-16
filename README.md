# Agrolink — Farm-to-Market Platform

Agrolink connects farmers, FPOs (farmer producer organisations), buyers and logistics partners in one marketplace. Farmers list produce with live pricing guidance, FPOs aggregate/gain or buy directly, consumers order fresh produce with fair-price discovery, and orders move through delivery, payment escrow and settlement.

## Repository layout

| Path | Status | Purpose |
| --- | --- | --- |
| `frontend/` | **Implemented** | React 18 + Vite single-page app (all 14 feature modules, mock-first) |
| `backend/` | **Implemented** | Spring Boot API (auth, marketplace, orders, payments, logistics, AI proxy) |
| `ai-service/ml-service/` | **Implemented** | FastAPI AgroLink ML service (price/demand/supply prediction via trained joblib models) |
| `optimization-service/` | **Implemented** | FastAPI nearest-neighbor route optimizer with capacity validation |
| `docs/` | Empty | `api`, `architecture`, `requirements`, `research` |
| `tests/` | Empty | `e2e`, `integration`, `performance` (planned) |
| `data/`, `scripts/` | Empty | Shared data / automation |

The frontend runs fully standalone today using an in-browser mock layer — no servers required.

## Tech stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Radix UI (shadcn-style components), Recharts, React Router v6, Axios, Google Identity Services (OAuth), browser Geolocation + BigDataCloud/Nominatim reverse geocoding
- **Backend**: Spring Boot 4.1.1, Spring Security + JWT, Spring Data JPA, Springdoc OpenAPI, MySQL 8
- **Optimization service**: FastAPI + Pydantic (haversine nearest-neighbor routing)
- **ML service**: FastAPI + joblib/pandas (trained price/demand/supply models)
- **Infra**: Docker Compose (MySQL, backend nginx, frontend nginx) (optional)

## Getting started (frontend, mock-only)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run build` (production bundle), `npm run preview`, `npm run lint` (`eslint src`).

## Run the backend

Requires MySQL 8 running locally (or use Docker Compose, see below). Defaults: `jdbc:mysql://localhost:3306/agrolink`, user `root`, password configurable via env vars.

```bash
cd backend
.\mvnw.cmd spring-boot:run    # Windows  |  ./mvnw spring-boot:run  # Linux/macOS
# http://localhost:8080   (Swagger UI: http://localhost:8080/swagger-ui.html)
```

Requires JDK 21+ (tested on Java 25). Tests: `.\mvnw.cmd test`.

Key configuration (environment variables, see `backend/src/main/resources/application.properties`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/agrolink` | JDBC URL |
| `DB_USER` / `DB_PASSWORD` | `root` / (local default) | Database credentials |
| `JWT_SECRET` | dev secret | JWT signing key |
| `JWT_EXPIRATION` | `86400000` | Token TTL (ms) |
| `AI_URL` | `http://localhost:8000` | AI prediction service base URL |
| `SERVER_PORT` | `8080` | Server port |
| `PAYMENT_GATEWAY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | empty | Payment gateway credentials |

## Phone OTP verification (dev mock)

Registration is gated by a phone OTP. The backend runs in mock mode: no SMS provider
is wired up, so the fixed `OTP_DEV_CODE` (default `123456`) is accepted — and exposed
in the send response while `OTP_EXPOSE_CODE=true` — keeping the frontend usable offline.

| Variable | Purpose |
| --- | --- |
| `OTP_DEV_CODE` | Fixed code accepted in mock mode |
| `OTP_EXPOSE_CODE` | Expose the code in the send response (dev only) |
| `OTP_REQUIRE_VERIFY` | Reject `/api/auth/register` without a valid OTP-verified token |
| `OTP_MAX_SENDS`, `OTP_RATE_WINDOW_MINUTES`, `OTP_RESEND_COOLDOWN` | Send rate limiting |
| `OTP_MAX_ATTEMPTS` | Wrong-code attempts before the OTP is invalidated |
| `OTP_TTL_SECONDS` | Lifetime of a verification session |

Endpoints:

- `POST /api/auth/otp/send` → `{ email, phone }` (phone in **E.164**, e.g. `+919876543210`)
- `POST /api/auth/otp/verify` → `{ requestId, phone, code, email }` → returns a short-lived `registrationToken`
- `POST /api/auth/register` → requires `otpToken` + `phone`; the token is bound to both the email and the phone

Mock-based tests (`OtpServiceImplTest`) cover send/verify/expiry/attempt-limit/rate-limit paths.

## Run the AI service

The ML service lives under `ai-service/ml-service/`. It serves price, demand and supply
predictions from pre-trained `joblib` models. The Spring Boot backend at `AI_URL`
proxies to it and falls back to rule-based predictions when it is unavailable.

```bash
cd ai-service/ml-service
python -m pip install -r app/requirements.txt   # if requirements are hosted in app/
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000    # http://localhost:8000
```

Endpoints: `GET /`, `POST /predict` (price/demand/supply based on market, category, product
and arrival/demand tonnes), plus model-training scripts under `app/ml/`
(`train_price.py`, `train_demand.py`, `train_supply.py`).

## Run the optimization service

```bash
cd optimization-service
python -m pip install -r requirements.txt
python run.py                  # http://localhost:8001
```

Endpoints: `GET /health`, `POST /optimize/route`. Route requests accept stops, optional `vehicleCapacity`, `averageSpeedKph` and `returnToStart`; demand over capacity returns `422`.

## Run everything with Docker Compose

```bash
cp .env.example .env   # then edit the secrets
docker compose up --build
```

| Service | Port |
| --- | --- |
| MySQL 8.4 | `3306` |
| Spring Boot backend | `8080` |
| Nginx-served frontend | `80` |

`VITE_API_BASE_URL` in `.env` sets the base URL baked into the frontend bundle at build time.

## Demo accounts

Password for every demo account is `secret`. The login page also has one-tap fill buttons.

| Role | Email | What you can do |
| --- | --- | --- |
| Consumer | `meera@example.com` | Browse marketplace, cart + checkout, orders, track/delivery confirm, pay, chatbot |
| Farmer | `harpreet@example.com` | Dashboard stats, list/edit products, incoming orders + confirm, payments, pricing/demand forecasts |
| FPO | `fpo.punjab@example.com` | FPO dashboard/profile, manage products, buy (procurement) and sell, incoming/outgoing orders, payments |
| Delivery partner | `dp.gurmeet@example.com` | My shipments list (auto-created deliveries), self-assign shipments, update status → propagates to order lifecycle |
| Admin | `admin@example.com` | Admin stats, all orders, reviews moderation |

Route landing per role: consumer → `/marketplace`, farmer → `/producer/farmer/dashboard`, FPO → `/producer/fpo/dashboard`, delivery partner → `/partner/logistics`, admin → `/admin`.

## Current capabilities

- **Real marketplace listings only** — the marketplace shows listings created by real
  sellers; no demo products are seeded. (A `MOCK_MODE` in-browser layer still powers the
  frontend when run standalone.)
- **Real-time location auto-detect** — sellers can capture their pickup address and buyers
  their delivery address via browser GPS (`navigator.geolocation`) with reverse-geocoding
  (BigDataCloud + Nominatim fallback), filling latitude/longitude and pincode automatically.
- **Logistics automation** — placing an order auto-creates a logistics record (pickup/drop
  from product + shipping address, coordinates included); the status lifecycle
  `CREATED → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED` drives the order lifecycle
  (`PENDING → READY_FOR_SHIPMENT → IN_TRANSIT → DELIVERED`).
- **Google Sign-In** — OAuth login via Google Identity Services (origin allowlisted for the
  current dev/ngrok URL in Google Cloud Console).

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

## Backend API surface

All routes under Spring Boot at `localhost:8080`:

| Domain | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/me`, `/otp/send`, `/otp/verify`, `/forgot-password`, `/reset-password`, `/google` |
| Users | `GET /api/users/me`, `/me/profile`, `/{id}/public` |
| Marketplace | `GET/POST/PUT/DELETE /api/products`, `GET /api/products/search|mine`; `GET/POST/PUT/DELETE /api/categories`; reviews |
| Cart | `GET /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/{id}`, `DELETE /api/cart` |
| Orders | `POST /api/orders/checkout`, `GET /api/orders|/seller|/{id}`, `POST /api/orders/{id}/status` |
| Payment | `POST /api/payments/orders/{orderId}`, `/orders/{orderId}/confirm` |
| Pricing/Demand | `GET /api/pricing/forecast/{productId}`, `POST /api/pricing/calculate`, `GET /api/pricing/trend`; `GET /api/demand/forecast[/{productId}]` |
| Logistics | `POST /api/logistics/orders/{orderId}`, shipments/vehicles CRUD, `PUT /api/logistics/{id}/assign|status`, `POST /api/logistics/{id}/route` |
| Delivery | `GET /api/delivery/status/{orderId}`, `POST /api/delivery/confirm` |
| AI | `POST /api/ai/crop-prediction`, `/demand-prediction`, `/yield-prediction`, `/chat` |
| Farmer/FPO | `GET/POST/PUT /api/farmer/profile`, `/api/fpo/profile`; farms under `/api/farmer/farms` |
| Admin | `GET /api/admin/orders`, `/stats`; `PUT /api/admin/orders/{id}`, `/reviews/{id}` |
| Misc | `GET /api/health`, addresses, notifications |

Interactive docs at `/swagger-ui.html` and `/v3/api-docs`.

## Architecture

```
frontend/src
  api/         axios client + endpoint constants
  components/  ui kit (shadcn-style) + common widgets + feature forms
  context/     Auth, Cart, Chatbot providers
  pages/       one folder per module (auth, marketplace, producer, orders,
               pricing, demand, logistics, delivery, payment, chatbot, consumer)
  services/    one service per domain, each: MOCK_MODE ? mockDb : axios
  mocks/       data.js (seed data) + db.js (in-browser CRUD "database")
  constants/   roles/allowed routes, statuses, navigation
  utils/       formatting (price/date), validation

backend/src/main/java/com/agrolink
  controller/  REST endpoints (one per domain)
  service/     business logic
  repository/  Spring Data JPA
  entity/      JPA models       dto/        request/response objects
  security/    JWT filter + config            config/    beans, CORS, security
  ai/          AI-service client (crop/demand/yield/chat)
```

- **Mock layer**: for standalone frontend runs only — `mocks/data.js` seeds demo data (users, 15 products, price/demand forecasts, shipments, payments). `mocks/db.js` implements `list/get/create/update*` used by every service, so the UI is fully interactive offline. Toggle `MOCK_MODE` (`frontend/src/mocks/db.js`, default `true`) to call live services; against the real backend the marketplace shows only seller-created listings.
- **Vite proxies** (dev only): `/api` → `localhost:8080` (Spring Boot), `/optimize` → `localhost:8001`.
- **Design**: Tailwind CSS utility styling with a custom shadcn/ui-style component set. Dark-mode class toggle supported.
- **Status model**: orders flow `PENDING → READY_FOR_SHIPMENT → IN_TRANSIT → DELIVERED` (or cancelled/returned); driven by the logistics lifecycle (`CREATED → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED`). Payments `PENDING → COMPLETED → RELEASED`.

## Verification

```bash
cd frontend
npm run lint   # eslint — 0 errors / warnings
npm run build  # vite production build passes

cd ../backend
./mvnw test    # Spring Boot context test (needs local MySQL)
```

### Status (verified 2026-09-16)

| Component | Check | Result |
| --- | --- | --- |
| Frontend | `npm run lint` | PASS (0 errors / warnings) |
| Frontend | `npm run build` | PASS (vite production build) |
| Backend | `./mvnw test` · `AgroLinkApplicationTests` | PASS (context loads against MySQL 8.0.46) |
| Backend | `./mvnw clean compile` (JDK 25) | PASS |
| Optimization | `/health`, `/optimize/route`, capacity-exceeded → 422 | 3/3 PASS |
| Delivery e2e | product → order → logistics auto-create → assign → status propagation | PASS (via API scripts) |

`tests/e2e`, `tests/integration`, `tests/performance` are reserved for future integration suites.