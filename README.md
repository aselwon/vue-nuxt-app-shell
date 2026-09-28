# Taskly

Taskly is a warm, consumer-focused task manager built with Nuxt 3, Vue 3, TypeScript, Tailwind CSS, and Pinia. The Bloomline visual system uses coral and teal accents, light workspace navigation, and board/list views for everyday planning.

**Demo:** [Open the live Taskly demo](https://taskly-demo.pages.dev)

## Run locally

Node.js 22.12 or newer is required.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. To preview a production build:

```bash
npm run build
npm run preview
```

The project runs offline and does not require API keys or an `.env` file.

## Demo accounts

Both accounts use the password `demo1234`: `alex@taskly.demo` and `sam@taskly.demo`.

The mock API stores data and sessions in process memory, so demo data resets when the server restarts.

## Features

- SSR landing page and authenticated CSR workspace.
- Demo authentication with an HTTP-only session cookie.
- Pinia state for auth, projects, tasks, filters, and board/list preference.
- Project and task CRUD through validated Nitro API routes.
- Tags, due dates, status filters, search, board/list views, and optimistic task completion with rollback.
- Responsive Bloomline landing, login, board, list, and dialog layouts.

Task status is edited through the task dialog; the MVP does not include realtime collaboration or drag and drop.

## Quality checks

```bash
npm run typecheck
npm test
npm run test:e2e
```

Vitest covers unit behavior and Playwright covers landing/auth/workspace, API isolation, dialog, optimistic update, and mobile flows. The current suite passes 4/4 tests. The landing smoke expectation uses `Big ideas.`; business logic assertions are unchanged.

## Cloudflare Pages

```bash
npm run build:cloudflare
npx wrangler pages deploy dist
```

`wrangler.toml` contains the Pages project settings. In-memory demo storage is suitable for portfolio demonstration only; production requires durable storage and production authentication.

## Project structure

- `pages/` — landing, login, and workspace routes.
- `components/` — reusable task UI.
- `stores/` — Pinia auth and workspace stores.
- `shared/` — domain types and Zod schemas.
- `server/api/` — auth, workspace, and CRUD endpoints.
- `tests/` — Vitest and Playwright tests.
