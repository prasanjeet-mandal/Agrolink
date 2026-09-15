# Agrolink — Farm-to-Market Platform

Agrolink connects farmers, FPOs (farmer producer organisations), buyers and logistics partners in one marketplace. Farmers list produce with live pricing guidance, FPOs aggregate/gain or buy directly, consumers order fresh produce with fair-price discovery, and orders move through delivery, payment escrow and settlement.

## Repository layout

| Path | Status | Purpose |
| --- | --- | --- |
| `frontend/` | **Implemented** | React 18 + Vite single-page app (all 14 feature modules, mock-first) |
| `backend/` | **Implemented** | Spring Boot API (auth, marketplace, orders, payments, logistics, AI proxy) |
| `ai-service/` | **Implemented** | FastAPI service for crop, demand, yield prediction and chatbot responses |
| `optimization-service/` | **Implemented** | FastAPI nearest-neighbor route optimizer with capacity validation |
| `ai-service/agromarket-ml/` | **Implemented** | Standalone AgroMarket ML project (price/arrival/demand/matching/route), datasets + trained models |
| `docs/` | Empty | `api`, `architecture`, `requirements`, `research` |
| `tests/` | Empty | `e2e`, `integration`, `performance` (planned) |
| `data/`, `scripts/` | Empty | Shared data / automation |

The frontend runs fully standalone today using an in-browser mock layer — no servers required.

## Tech stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Radix UI (shadcn-style components), Recharts, React Router v6, Axios
- **Backend**: Spring Boot 4.1.1, Spring Security + JWT, Spring Data JPA, Springdoc OpenAPI, MySQL 8
- **AI service**: FastAPI + Pydantic
- **Optimization service**: FastAPI + Pydantic (haversine nearest-neighbor routing)
- **Infra**: Docker Compose (MySQL, backend nginx, frontend nginx)

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

Requires JDK 21+. Tests: `.\mvnw.cmd test`.

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

## SMS OTP via Twilio Verify

Registration is gated by a phone OTP. The backend uses **Twilio Verify V2**: Twilio generates, delivers, expires and checks the code — the app never generates or stores OTPs, and no OTP column/table exists.

| Variable | Purpose |
| --- | --- |
| `TWILIO_ACCOUNT_SID` | Account SID (`AC…`) |
| `TWILIO_API_KEY_SID` | API key SID (`SK…`) — Console → Account → API keys & tokens |
| `TWILIO_API_KEY_SECRET` | API key secret (shown once when created) |
| `TWILIO_VERIFY_SERVICE_SID` | Verify Service SID (`VA…`) — Console → Verify → Services |
| `TWILIO_VERIFY_CHANNEL` | Delivery channel, default `sms` |

Endpoints:

- `POST /api/auth/otp/send` → `{ email, phone }` (phone in **E.164**, e.g. `+919876543210`)
- `POST /api/auth/otp/verify` → `{ requestId, phone, code, email }` → returns a short-lived `registrationToken`
- `POST /api/auth/register` → requires `otpToken` + `phone`; the token is bound to both the email and the phone

**Setup:** 1) create a Twilio Verify Service (SMS), 2) create an API Key (SID+Secret) scoped to your project, 3) put the four values in `.env` (never commit them — `.env` is git-ignored).

**Dev fallback:** when any of the four values is empty, Twilio is bypassed and the fixed `OTP_DEV_CODE` (default `123456`) is accepted and shown in the UI. This lets the frontend keep working without credentials. With Twilio configured, the real code is **never** exposed in any response.

**Twilio trial accounts** can only send to verified phone numbers; sending to an unverified number returns a "Unable to send the verification code" error. Mock-based tests (`OtpServiceImplTest`) cover send/verify/expiry/attempt-limit/rate-limit paths without sending real SMS.

## Run the AI service

```bash
cd ai-service
python -m pip install -r requirements.txt
python run.py                  # http://localhost:8000
```

Endpoints: `GET /health`, `POST /predict/crop`, `POST /predict/demand`, `POST /predict/yield`, `POST /chat`. The Spring Boot backend calls these via `AI_URL`.

## Run the optimization service

```bash
cd optimization-service
python -m pip install -r requirements.txt
python run.py                  # http://localhost:8001
```

Endpoints: `GET /health`, `POST /optimize/route`. Route requests accept stops, optional `vehicleCapacity`, `averageSpeedKph` and `returnToStart`; demand over capacity returns `422`.

## AgroMarket ML project

Assembled under `ai-service/agromarket-ml/`, it includes the attached project's source code, datasets and trained model files (virtual environments and `.env` secrets excluded). Its API can be compiled/imported independently and exposes price, arrival, demand, supply, matching, route and chatbot routes (chatbot accepts both `message` and Agrolink-compatible `question` payloads).

```bash
cd ai-service/agromarket-ml
python -m pip install -r requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8002   # http://localhost:8002
```

Health: `GET /health`. Tests: `python -m pytest tests`.

## Run everything with Docker Compose

```bash
cp .env.example .env   # then edit the secrets
docker compose up --build
```

| Service | Port |
| --- | --- |
| MySQL 8.4 | `3306` |
| Spring Boot backend | `8080` |
| FastAPI AI service | `8000` |
| Nginx-served frontend | `80` |

`VITE_API_BASE_URL` in `.env` sets the base URL baked into the frontend bundle at build time.

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

## Backend API surface

All routes under Spring Boot at `localhost:8080`:

| Domain | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/me`, `/otp/send`, `/otp/verify`, `/forgot-password`, `/reset-password` |
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

- **Mock layer**: `mocks/data.js` seeds ready-to-use demo data (users, 20+ products, price/demand forecasts, shipments, payments). `mocks/db.js` implements `list/get/create/update*` used by every service, so the UI is fully interactive offline. Toggle `MOCK_MODE` (`frontend/src/mocks/db.js`) to call live services.
- **Vite proxies** (dev only): `/api` → `localhost:8080` (Spring Boot), `/ai` → `localhost:8000`, `/optimize` → `localhost:8001`.
- **Design**: Tailwind CSS utility styling with a custom shadcn/ui-style component set. Dark-mode class toggle supported.
- **Status model**: orders flow `PENDING → CONFIRMED → PROCESSING → READY_FOR_SHIPMENT → OUT_FOR_DELIVERY → IN_TRANSIT → DELIVERED` (or `CANCELLED`); payments `PENDING → COMPLETED → RELEASED`.

## Verification

```bash
cd frontend
npm run lint   # eslint — 0 errors / warnings
npm run build  # vite production build passes

cd ../backend
./mvnw test    # Spring Boot context test (needs local MySQL)
```

### Status (verified 2026-09-15)

| Component | Check | Result |
| --- | --- | --- |
| Frontend | `npm run lint` | PASS (0 errors / warnings) |
| Frontend | `npm run build` | PASS (2640 modules; non-blocking chunk-size warning only) |
| Backend | `./mvnw test` · `AgroLinkApplicationTests` | PASS (context loads against MySQL 8.0.46) |
| AI service | `/health`, `/predict/crop`, `/predict/demand`, `/predict/yield`, `/chat` | 5/5 PASS |
| Optimization | `/health`, `/optimize/route`, capacity-exceeded → 422 | 3/3 PASS |

`tests/e2e`, `tests/integration`, `tests/performance` are reserved for future integration suites.