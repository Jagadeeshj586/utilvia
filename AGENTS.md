# Utilvia

Next.js 14 (App Router) + TypeScript app of privacy-first browser utilities (calculators, converters, dev tools). Most processing runs on-device; there is no backend database or auth. See `README.md` for the stack and standard scripts.

## Cursor Cloud specific instructions

- Single service: the Next.js dev server (`npm run dev`, http://localhost:3000). There is no separate backend/API service to run.
- Node 22 is available and works with Next.js 14.2.x. There is no `.nvmrc`; don't switch node versions.
- Standard commands live in `package.json`: `npm run dev`, `npm run build`, `npm run lint`.
- `npm run lint` currently exits 0 with only `react-hooks`/`jsx-a11y` warnings; treat warnings as pre-existing.
- Tests are per-tool scripts run via `tsx --test` (e.g. `npm run test:sip`, `npm run test:color`). There is no single "run all tests" script; pick the `test:*` script matching the lib you changed (see the `scripts` block in `package.json`).
- Env vars are all optional (see `.env.example`); the app runs with no `.env`. `NEXT_PUBLIC_SITE_URL` only affects canonical/OG URLs. Background Remover defaults to on-device (no API key).
- On first page load the dev server logs `Failed to find font override values for font 'Newsreader'`; this is a harmless warning, not a failure.
