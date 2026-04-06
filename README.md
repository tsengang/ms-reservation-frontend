# MS Reservation — Angular frontend (17+)

Standalone Angular app with **English** and **French** UI. Translations are split per language:

- `src/assets/i18n/<lang>/header.json` — app title and subtitle
- `src/assets/i18n/<lang>/tabs.json` — tab labels (Customers, Drivers, Cars, Reservations)
- `src/assets/i18n/<lang>/forms.json` — shared form and button labels

A custom `MultiFileTranslateLoader` merges these into namespaces `HEADER`, `TABS`, and `FORMS` (e.g. `{{ 'HEADER.APP_TITLE' | translate }}`).

## Layout

This project is **next to** the Java backend repo, not inside it:

```text
<parent>/
  ms-reservation/          ← Spring Boot API (Maven)
  ms-reservation-frontend/ ← this Angular app
```

## API URL (`/api`)

`src/environments/environment.ts` uses **`apiBase: '/api'`** (relative):

- **Netlify:** `netlify.toml` proxies `/api/*` to `https://ms-reservation.onrender.com/api/*`, so the browser stays same-origin and avoids CORS issues.
- **Local dev (`ng serve`):** `proxy.conf.json` forwards `/api` to the Render API (see `angular.json` → `proxyConfig`).
- **Cloudflare Pages:** `_redirects` only handles SPA routing; it does **not** proxy to Render. Either deploy on Netlify, use a Worker to proxy `/api`, or temporarily set `apiBase` to `https://ms-reservation.onrender.com/api` and rely on backend CORS for your Pages origin.

## Install and run

```bash
cd ms-reservation-frontend
npm install
npm start
```

Open `http://localhost:4200` — API calls go through the dev proxy to Render.

## Build

```bash
npm run build
```

Output: `dist/ms-reservation-frontend/browser`.

## Backend CORS

The Spring Boot app configures CORS in `SecurityConfig`. For any host that calls the API **directly** (full Render URL), add that UI origin. Netlify with `/api` proxy does not need the Netlify domain in CORS for API calls.
