# Warpvio — V1 Website Analysis

**Status:** Responsive landing + real server-side HTTP/HTML website inspection + evidence-based compatibility result UI. App compilation and payments are **not implemented yet**.

## Current flow

1. Open `index.html`; paste a public website URL and select Windows, Android and/or macOS.
2. Continue to `analyzing.html`. The page calls `POST /api/analyze` and shows the real request state and actionable errors.
3. The response is stored in browser session storage; `compatibility.html` renders confirmed findings and clearly labels native behaviors as unverified.

### Checks that actually run

- Public URL validation; redirects limited and revalidated
- DNS checks rejecting private, local, reserved, multicast and link-local network targets
- HTTP status and HTML content-type; request timeout and HTML size limits
- HTTPS, page title, favicon link reference, viewport meta tag
- Explicit limitations for login, payments, popups, native WebViews, device permissions and app signing

**Not tested:** Native compilation, installability, actual Android responsiveness, real login/checkout journeys, app-store acceptance, app code signing or JavaScript rendering. A successful check is preliminary, not proof of compatibility.

## Run locally

Requirements: Node.js 20+.

```bash
npm test
npx vercel dev
```

Open the URL printed by `vercel dev`. The local HTML pages and `/api/analyze` must be served by the same host. A simple static file server or GitHub Pages will show the UI but **cannot run the analysis API**.

## Deploy

1. Import `helloskyorigin/Warpvio` into Vercel as a new project.
2. Choose the "Other" framework preset (the project consists of static HTML and a Node serverless function).
3. Leave the build command empty. The repository root is the output directory for static pages.
4. Deploy. Verify that `GET /api/analyze` returns HTTP 405 (POST only), then submit an owned public website through the landing page.
5. For production traffic, enable platform WAF/bot protection or persistent rate limiting. The included in-memory limiter is only a first defense per warm serverless instance.

There are no third-party runtime dependencies for the analysis function.

## Repository files

- `index.html` — original no-bubbles landing page, responsive URL/platform selector
- `analyzing.html` — real request state, retry/error UI
- `compatibility.html` — confirmed findings + unverified native requirements
- `flow.css` — shared analysis/results design
- `api/analyze.js` — Node serverless URL scanner
- `tests/analyze.test.cjs` — scanner unit/security tests
- `vercel.json` — deployment configuration

## Security and privacy notes

- URL scanner only supports public HTTP/HTTPS websites and limits payload size, redirects and request time.
- The scanner does **not** submit forms or execute a webpage's JavaScript.
- Analysis results stay in the browser tab's `sessionStorage` for the current flow.
- No account, payments or downloadable EXE/APK/DMG are active yet.
- A public service should enforce durable rate limits/WAF rules, observability and build quotas before selling app exports.
