# Fatrina web

The public website for فاترينة: browse every store (براندات، معارض، مخازن، محلات) and product, then order in the app.
Buying, cart, coupons, points and order tracking stay in the app on purpose; every "order" button opens the same screen in the app
(`fatrina://…`) or Google Play.

## Stack
Next.js 16 (App Router) · React 19 · Tailwind v4 · lucide-react. Same tokens and font (Cairo) as the app and the dashboard.

Data comes from the public API on the server only (Server Components), so the backend's CORS list needs no change.

Hosted on **Cloudflare Workers** through [OpenNext](https://opennext.js.org/cloudflare) (`wrangler.jsonc`, `open-next.config.ts`).

## Run
```bash
cp .env.example .env.local   # API_BASE_URL, NEXT_PUBLIC_SITE_URL
npm install
npm run dev                  # http://localhost:3000
npm run preview              # the real Cloudflare runtime locally, http://localhost:8787
```

## Deploy (Cloudflare Workers, from GitHub)
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → pick `brandak-website`.
2. Build settings:
   - Project name: `brandak-website` (must match `name` in `wrangler.jsonc`)
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
   - Root directory: `/`
3. Build variables: `NEXT_PUBLIC_SITE_URL` = the site's address (first the `*.workers.dev` link, later the real domain — it is baked in
   at build time and used for canonical links, the sitemap and QR codes). Optional: `API_BASE_URL`.
4. Deploy. Every push to `main` deploys again.
5. Domain: the Worker → **Settings** → **Domains & Routes** → add a custom domain on Cloudflare DNS, then update
   `NEXT_PUBLIC_SITE_URL` and redeploy. Submit `https://<domain>/sitemap.xml` in Google Search Console.

From a terminal instead: `npx wrangler login` once, then `npm run deploy`.

Images are served as-is (`images.unoptimized`): API photos come sized from Cloudinary and `public/` holds pre-shrunk PNGs —
keep new images small. Optional page caching: see the R2 notes in `wrangler.jsonc`.

## Where things live
- `lib/api.ts` — every API call (read-only, public endpoints).
- `lib/store-types.ts` — the 4 store types; copy of the app's `features/catalog/store-types.ts` plus web pages and SEO copy.
- `lib/links.ts` — Play link, deep links, Android intent links.
- `components/OpenInApp.tsx` — the only call to action for buying.
