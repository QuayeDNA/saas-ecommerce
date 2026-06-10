# BryteLinks — Telecom Storefront & Dashboard

React 19 + TypeScript + Vite storefront and management dashboard for the BryteLinks brand.

## Stack

- React 19, TypeScript 5.8, Vite 6
- Tailwind CSS 4, React Router 7
- TanStack Query, React Hook Form + Zod
- Chart.js, react-data-grid
- Axios, jwt-decode, js-cookie
- PWA via Workbox + vite-plugin-pwa

## Pages

### Public

| Route | Page |
|---|---|
| `/` | Login |
| `/home` | Landing page |
| `/login`, `/register` | Auth |
| `/forgot-password`, `/reset-password/:token` | Password flow |
| `/store` | Store discovery |
| `/store/:businessName` | Per-storefront bundle ordering |
| `/storefront/:storefrontId/callback` | Paystack callback |

### Agent Dashboard (`/agent/dashboard/`)

Dashboard, packages, orders, wallet, commissions, storefront management, AFA registration, profile, API marketplace.

### Superadmin (`/superadmin/`)

Analytics, users, packages & bundles, orders, wallet management (top-ups, payouts, history), store management, settings, announcements, referrals, audit logs.

### Store-Only Mode

Set `VITE_STORE_ONLY=true` to run as a pure storefront (no dashboard routes).

## Storefront Features

- Mobile-first, theme-aware responsive layout
- Bundle browsing by provider with search/filter
- Trending + Best Value featured carousel
- Single-item order flow (no cart)
- Payment: mobile money, bank transfer, Paystack inline
- Order tracking drawer
- Announcement banners, ad slots
- WhatsApp contact integration
- Store closure / site status awareness

## Development

```bash
npm run dev        # :5173
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # vite preview
```
