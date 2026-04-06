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

## Prerequisites

- Node.js **18.19+** (recommended for Angular 18 CLI; Angular **17** tooling works with Node 18 LTS)
- For local API calls: backend running at `http://localhost:8080` (see `src/environments/environment.ts` and `proxy.conf.json`)

## Install and run

```bash
cd ms-reservation-frontend
npm install
npm start
```

Open `http://localhost:4200`. Dev mode uses the proxy so `/api` is forwarded to `http://localhost:8080`.

## Build

```bash
npm run build
```

Output: `dist/ms-reservation-frontend`.

## Backend CORS

The Spring Boot app configures CORS in `SecurityConfig` (allowing `http://localhost:4200` for `/api/**`). Add your production UI origin when you deploy.
