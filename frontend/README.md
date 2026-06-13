# AI Doc QA — Frontend

This is a Next.js (App Router) + TypeScript + Tailwind frontend scaffold for the AI Doc QA project.

Highlights
- Next.js (App Router)
- TailwindCSS
- React Hook Form + Zod for forms
- Axios for backend calls
- Simple admin UI and Assistant chat UI

Setup

1. From `frontend/` install dependencies:

```bash
cd frontend
npm install
```

2. Install ShadCN UI (optional) — these commands are suggestions to install and scaffold ShadCN components. You can also use Tailwind-only components if you don't want to use the shadcn package:

```bash
# install Radix + shadcn/ui tooling (optional)
npm install @radix-ui/react-icons
# if you want the shadcn CLI (optional)
npx shadcn@latest init
```

3. Create an `.env.local` in `frontend/` with:

```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Run

```bash
npm run dev
```

Notes & Assumptions
- Backend already exists and exposes the ADMIN and USER endpoints described in the project notes.
- The frontend will use `NEXT_PUBLIC_API_BASE` to call the backend. Keep CORS configured on the backend.
- I intentionally did not add any backend DB or Prisma files here — per your note the backend is authoritative for document state. If you want the admin panel to manage a local DB, I can add Prisma schema + migrations in a follow-up.

Next steps I can do for you
- Wire up authentication for the admin area (session + middleware)
- Add shadcn-generated component library and theme
- Add tests, E2E flows, or CI
