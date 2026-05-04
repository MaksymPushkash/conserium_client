# Cortex Client

Next.js frontend for the Cortex backend.

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
cd client
npm install
cp .env.example .env.local
npm run dev
```

The app expects the backend at `NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8000`.

