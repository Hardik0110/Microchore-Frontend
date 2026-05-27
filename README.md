# Microchore Frontend

React 19 + Vite 7 + TypeScript SPA for **Microchore**, a viral-comment microtask platform. Talks to the Django + DRF backend over JWT.

## Stack

- React 19, react-router-dom 6
- Vite 7, TypeScript 5 with `erasableSyntaxOnly`
- Tailwind CSS, custom theme tokens (PG-style v4.0 brand)
- @react-oauth/google for Google sign-in
- Twitter OAuth 2.0 PKCE handled via backend redirect
- Vitest + Testing Library

## App surface

| Route | Who sees it |
|---|---|
| `/` and `/signup` | Public marketing + auth |
| `/onboarding/*` | Wizard: verify-email, welcome, link-account, attest, tutorial, first-task |
| `/app/dashboard`, `/app/marketplace`, `/app/submissions`, `/app/earnings`, `/app/feedback`, `/app/profile`, `/app/settings` | Writer / reviewer (nav filters by role) |
| `/app/queue` | Reviewers only |
| `/company/*` | Company admin: projects, submissions, settings |
| `/admin/users` | Platform admin |

Permission-based layout: a single `AppLayout` renders all roles, with the sidebar filtered by `user.isReviewer` and `hiddenForReviewer` / `requiresReviewer` flags on each nav entry.

## Run locally

```bash
npm install
cp .env.example .env.local        # then set VITE_API_URL etc.
npm run dev                       # http://localhost:5173
```

The dev server proxies API calls to whatever `VITE_API_URL` points at. Default fallback is `http://127.0.0.1:8000`.

## Test + build

```bash
npm test            # vitest
npm run build       # tsc -b && vite build
npm run preview     # serve the built dist
```

## Environment

See `.env.example`. Vite only exposes vars prefixed with `VITE_`.

- `VITE_API_URL`: backend base URL, no trailing slash
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth web client (origin must be allowlisted in Google Cloud Console)

## Deploy

`vercel.json` declares the project as a Vite SPA with rewrites that route every path to `index.html` so deep-link refresh works. To deploy:

1. Link this repo to a Vercel project
2. In Vercel Project Settings, add `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`
3. Push to `main` and Vercel builds automatically

For client demos where the backend runs on a laptop, set `VITE_API_URL` to the Cloudflare quick-tunnel URL printed by the backend's `run-tunnel.bat`.

## Companion repo

Backend: [Microchore-Backend](https://github.com/Hardik0110/Microchore-Backend)

## Maintainer

Hardik Kubavat
