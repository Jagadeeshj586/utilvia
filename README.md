# Utilvia

All your everyday tools, in one place. Free, privacy-first browser utilities for PDF, images, calculators, developers, and India-specific workflows. Most processing stays on-device - no account required.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS + Shadcn-style UI
- Zustand (search, recents, favorites)
- next-themes (light / dark / system)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Press `⌘K` or `/` to search tools.

## Scripts

- `npm run dev` - local development
- `npm run build` - production build
- `npm run start` - serve the production build
- `npm run lint` - ESLint

Set `NEXT_PUBLIC_SITE_URL` for canonical URLs, sitemap, and Open Graph (defaults to `https://utilvia.app`).

### Background Remover

Runs on-device by default (IS-Net). Optional cloud engines stay server-side:

```bash
BACKGROUND_REMOVAL_PROVIDER=imgly   # imgly | clipdrop | removebg | auto
BACKGROUND_REMOVAL_MODEL=isnet_fp16 # isnet_quint8 (fast) | isnet_fp16 | isnet (max)
NEXT_PUBLIC_BACKGROUND_REMOVAL_DEVICE=cpu # cpu is most reliable; gpu if WebGPU works
BACKGROUND_REMOVAL_API_KEY=         # Clipdrop or remove.bg key; never put this in frontend code
```
# jaganajagadeesh
# utilvia
# utilvia
