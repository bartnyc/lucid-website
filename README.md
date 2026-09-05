# LucidClaim Marketing Site

Static multi-page site + a serverless lead-capture endpoint. No build step, no framework — plain HTML/CSS/JS, deployable as-is.

## Why static instead of Astro

The original plan (matching the Triovera precedent) was an Astro + TypeScript build. This sandbox's npm install hung indefinitely on Astro's full dependency tree (dozens of platform-specific binaries) and partially-written `node_modules` directories became undeletable on the Windows-mounted output folder. Rather than ship a broken half-install, this is a plain static site with the same pages, copy, and brand — it deploys identically on Cloudflare Pages, Netlify, or any static host, with zero install risk. If you want a real Astro/Next rebuild later, do it locally where `npm install` isn't sandboxed.

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Home — hero, stats, links to Who we are / What we do |
| `who-we-are.html` | Mission, values, expertise |
| `what-we-do.html` | Standalone vs integrated solutions, platform, denial prevention |
| `workflow.html` | 4-step process + app screens |
| `technology.html` | AI, data platform, and application stack |
| `roadmap.html` | 3-phase implementation roadmap |
| `pricing.html` | Subscription vs. usage-based + business value |
| `contact.html` | Lead form → posts to `/api/lead-capture` |
| `thank-you.html` | Confirmation page |
| `assets/style.css` | Design system (purple `#6C4FA8` + teal `#0E9F7A`, dark navy bg) |
| `assets/site-config.js` | Snowflake app login URL |
| `assets/main.js` | Nav, login link, form submit handler |
| `functions/api/lead-capture.js` | Cloudflare Pages Function — validates lead, relays to Slack/HubSpot if configured |

## Run locally

```bash
cd lucidclaim-site
python3 -m http.server 8080
# open http://localhost:8080
```

The contact form's `fetch('/api/lead-capture')` call will 404 under the plain Python server (no functions runtime) — that's expected locally. It works once deployed to Cloudflare Pages, or under `wrangler pages dev`.

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → **Workers & Pages → Create → Connect to Git**.
3. Framework preset: **None** · Build command: *(leave blank)* · Build output directory: `/`
4. Cloudflare auto-detects `functions/api/lead-capture.js` as a Pages Function — no extra config needed.
5. Optional env vars (Settings → Environment variables): `SLACK_WEBHOOK_URL`, `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_GUID`. Site works fine without them — the lead is just validated and accepted with no relay.
6. **Custom domains** → add yours.

## Test the API locally with Wrangler (optional)

```bash
npm install -g wrangler
wrangler pages dev lucidclaim-site
curl -X POST http://localhost:8788/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","practice":"Example Psychiatry"}'
```

## Content source

All copy pulled directly from `LucidClaim_Pitch_Deck.pptx`. See `LucidClaim_Positioning_Brief.docx` for the full positioning/copy library and site map this was built from.
