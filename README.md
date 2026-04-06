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

## API URL

A single environment file points at the hosted API:

- `src/environments/environment.ts` → `https://ms-reservation.onrender.com/api`

`ng serve` and `ng build` both use this URL. For local development, the backend must allow your origin in CORS (e.g. `http://localhost:4200`).

## Install and run

```bash
cd ms-reservation-frontend
npm install
npm start
```

Open `http://localhost:4200` — requests go to the Render API above.

## Build

```bash
npm run build
```

Output: `dist/ms-reservation-frontend/browser` (for Cloudflare Pages and similar).

## Backend CORS

The Spring Boot app configures CORS in `SecurityConfig`. Ensure **`http://localhost:4200`** and your **production UI origin** (e.g. `https://*.pages.dev`) are allowed for `/api/**`.
