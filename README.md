# Conserium Client

Next.js frontend for the Conserium backend.

## Tech Stack

- **Next.js** – React framework for production
- **TypeScript** – Type-safe development
- **React** – UI library
- **TanStack Query** – Server state management
- **Zustand** – Client state management
- **Tailwind CSS** – Utility-first styling
- **shadcn/ui** – High-quality React components

## Local Start

```bash
cd conserium_client
npm install
cp .env.example .env.local
npm run dev
```

`npm run dev` uses the webpack dev server because the current Next/Turbopack stack can panic locally with `Next.js package not found`. Use `npm run dev:turbo` only when testing Turbopack explicitly.

The app expects the backend at `NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8000`.

Production builds verify the generated client against `PRODUCTION_OPENAPI_SCHEMA`, defaulting to
`https://api.conserium.app/openapi.json`. Deploy backend schema changes before promoting frontend
changes that consume them. Backend migrations must remain backward compatible with the previous
frontend until the Vercel deployment completes.

## API Client

The backend OpenAPI schema is the source of truth for JSON request and response types.

Generate the client from a local backend schema:

```bash
OPENAPI_SCHEMA=../conserium/openapi.json npm run generate:api
```

Check the committed generated client against backend `main`:

```bash
npm run check:api
```

Check it against production before Vercel promotion:

```bash
npm run check:production-api
```

Manual transport is limited to auth bootstrap, refresh flow, SSE streams, multipart uploads, and
binary downloads. Normal JSON endpoints should use the generated OpenAPI client types instead of
duplicating API-shaped local types.

## Verification

```bash
npm run typecheck
npm test
npm run build
```
