# CarbonJar

## API Documentation

- Live docs: visit `/api-docs` when the dev server is running.
- Spec file: `openapi.yml` (OpenAPI 3.1). Start with health, contact requests, and trainings. Expand as routes stabilize.
- Static UI: `public/swagger.html` is embedded via an iframe for React 19 compatibility.

Local run

- Start app: `npm run dev` (then open http://localhost:3000/api-docs)
- Edit `openapi.yml`, refresh the page to see updates.

## Developer Guide

Tooling

- Lint: ESLint 9 with Next.js rules and type-aware checks
- Format: Prettier 3 + prettier-plugin-tailwindcss
- Tests: Jest 30 + @testing-library/react + jest-dom

Common scripts

- Dev: npm run dev
- Lint: npm run lint (use npm run lint:fix to autofix)
- Typecheck: npm run typecheck
- Tests: npm test, npm run test:watch, npm run test:coverage
- Format: npm run format (write), npm run format:check (verify)

Git hooks (Husky + lint-staged)

- pre-commit: runs Next lint per-staged file and Prettier
- pre-push: runs typecheck and tests

CI (GitHub Actions)

- Workflow: `.github/workflows/ci.yml` on Node 20
- Steps: install → lint → typecheck → test

Next.js App Router params (Next 15)

- Dynamic params are Promise-based. Pattern:
  - API routes: `export async function GET(_req, { params }: { params: Promise<{ id: string }> }) { const { id } = await params }`
  - Pages: `export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params }`

Conventions

- Treat `req.json()` as unknown and narrow before use
- Guard enum values via schema enums (includes checks)
- Build conditional update objects and parse dates safely
