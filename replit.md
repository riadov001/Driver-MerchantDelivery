# Jatek Pro — Marchand & Livreur

Mobile app (Expo) for the Jatek food delivery platform in Oujda, Morocco. Used by restaurant owners (marchands), delivery drivers (livreurs), and admins. French UI, orange Jatek brand (#ff6b35).

## Architecture
- `artifacts/marchand` — the user-facing Expo app (the project's single artifact).
- `artifacts/api-server` — shared backend (also serves customer app + admin dashboard). Express + Drizzle + Postgres.
- `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `lib/db`, `lib/object-storage-web` — shared workspace packages.

## Roles
- `restaurant_owner` → merchant interface (`app/(merchant)`): dashboard, orders, menu CRUD, profile.
- `driver` → driver interface (`app/(driver)`): available orders, active deliveries, earnings, profile.
- `admin` → both, with a mode switcher in the header (persisted to AsyncStorage as `marchand_view_mode`).

## Auth
- Email/password against `/api/auth/login`. Token stored in AsyncStorage as `marchand_token`.
- `setBaseUrl` + `setAuthTokenGetter` from `@workspace/api-client-react` wired in `app/_layout.tsx`.
- AuthGate routes by role + view mode; unauthenticated → `/login`.

## Order lifecycle
- Merchant transitions: pending → accepted → preparing → ready.
- Driver picks up via `POST /api/orders/{id}/accept-delivery` (status → picked_up).
- Driver confirms delivery via `POST /api/orders/{id}/confirm-delivery` with 4-digit pickup code.

## Demo accounts (password: `password123`)
- owner@jatek.ma
- driver@jatek.ma
- admin@jatek.ma

## Custom backend addition
- `GET /api/drivers/me` — returns the driver row for the authenticated user (added in `artifacts/api-server/src/routes/drivers.ts`, placed before `/:id`).

## Notes
- `app.json` has `experiments.typedRoutes = false` (we delete the stale `.expo/types/router.d.ts`).
- Query option overrides are cast `as any` because the orval-generated `UseQueryOptions` strictly requires `queryKey` (the hook fills it in at runtime).
