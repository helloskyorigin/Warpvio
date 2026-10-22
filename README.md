# Warpvio — V1 Website Check & App Customization

**Status:** Responsive landing, real HTTP/HTML website inspection, evidence-based compatibility results, browser-based app customization, preview and a server-backed **one-time checkout preparation flow**. **Real payments and native exports remain disabled.**

## Current flow

1. Open `index.html`; paste a public website URL and select Windows, Android and/or macOS.
2. Continue to `analyzing.html`. The page calls `POST /api/analyze` and shows the real request state and actionable errors.
3. The response is stored in browser session storage; `compatibility.html` renders confirmed findings and clearly labels native behaviors as unverified.
4. Click **Customize my app** for `customize.html`. Edit app name, upload a PNG/JPG/WebP icon (cropped locally to 256×256), choose accent/theme and configure selected platform preferences.
5. Click **Continue to preview** to open `preview.html`, which displays the saved design and proposed one-time export price. **No charges, generated files or paid entitlement exist in this phase.**
6. From `preview.html`, continue to `checkout.html` for the one-time export order summary and a server-side checkout-readiness check. The production payment action is deliberately disabled.

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
- `customize.html` / `customize.js` / `customize.css` — interactive editor, icon processing and live launch mockup
- `preview.html` / `preview.js` — configuration summary and pricing estimate, **not** an app build
- `app-config.js` — same-tab session state validation and persistence
- `tests/app-config.test.cjs` — customization state and pricing unit tests
- `checkout.html` / `checkout.js` / `checkout.css` — non-charging export order review
- `lib/commerce.js` — canonical USD pricing, allowed products and Dodo test checkout integration
- `api/checkout.js` — checkout readiness + protected sandbox-only Dodo Checkout Sessions
- `api/dodo-webhook.js` / `lib/dodo-webhook.js` — signed Dodo webhook **test receiver** (no entitlement)
- `payment-return.html` — non-entitlement sandbox return page
- `tests/commerce.test.cjs` — quote, Dodo sandbox and signature-verification tests
- `tests/checkout.test.cjs` — payment-disabled API and webhook parser safeguards
- `.env.example` — sandbox configuration template (never store real secrets in Git)
- `flow.css` — shared analysis/results design
- `api/analyze.js` — Node serverless URL scanner
- `tests/analyze.test.cjs` — scanner unit/security tests
- `vercel.json` — deployment configuration

## Security and privacy notes

- URL scanner only supports public HTTP/HTTPS websites and limits payload size, redirects and request time.
- The scanner does **not** submit forms or execute a webpage's JavaScript.
- Analysis results, app name, preferences and processed PNG icon previews stay in the browser tab's `sessionStorage` for the current flow. The original uploaded icon is not sent to a server.
- No account, payments or downloadable EXE/APK/DMG are active yet.
- A public service should enforce durable rate limits/WAF rules, observability and build quotas before selling app exports.

## App customization scope

- The launch mockups intentionally illustrate a **shell**, not your actual website rendered inside a native app.
- The inferred website title/fallback icon is editable. A user-uploaded icon is converted into a square PNG locally and kept in same-tab storage only; later export workers need a separate safe, durable upload path.
- Selected platforms come from the analyzed URL; preferences for Windows/macOS window size and Android orientation are only **planned build settings**, not verified artifacts.
- Pricing shown in preview is an **estimate** from the original launch plan ($15 Windows, $19 Android, $19 macOS, $39 all three), not a live checkout.
- Back/reload navigation preserves data within the same browser tab. Closing the tab or clearing site data loses the unsaved project draft. There is no account or cross-device recovery yet.

## Checkout foundation — intentionally not charging customers

- **Server-owned prices:** Windows $15, Android $19, macOS $19, all-three bundle $39 (USD, one-time, preliminary price schedule). Two-platform selections add individual item prices. App UI is not an authority for amounts.
- `GET /api/checkout` returns a structured price schedule and `readyToBuy:false`. The public order screen never exposes a payment button that charges a card.
- `POST /api/checkout` **always returns 503 unless all three conditions are met**: Dodo environment is exactly `test_mode`, `WARPVIO_TEST_CHECKOUT_ENABLED=true`, and the request includes the private header `x-warpvio-qa-token` matching `WARPVIO_TEST_CHECKOUT_TOKEN` (minimum 20 characters).
- For authorized QA only, that POST endpoint uses the Dodo **test** Checkout Sessions API at `https://test.dodopayments.com/checkouts`. Product IDs are mapped from the allowlisted `DODO_PRODUCT_*` environment variables; arbitrary client prices or product IDs are rejected. No live charge path exists.
- `POST /api/dodo-webhook` validates the Dodo Standard Webhooks HMAC signature against **raw request bytes** and a ±5-minute timestamp window, accepting events only in `test_mode`. No payment success is used to unlock exports.
- Dodo webhook endpoint for QA (once Vercel is deployed): `https://YOUR_DOMAIN/api/dodo-webhook`. Save the Dodo **test mode** webhook signing key as `DODO_PAYMENTS_WEBHOOK_KEY`; keep all secrets server-side.
- The sandbox return page is `/payment-return.html`, which explicitly warns that a redirect is **not proof of payment**.
- Run `npm test` (Node 20+) for automated scanner, customization and commerce tests.

### Developer-only test checkout request

This is not a public customer flow. First configure the Dodo **test** products with matching USD prices and environment settings in `.env.example` inside Vercel (do not upload the secrets to Git).

```sh
curl -X POST https://YOUR_DOMAIN/api/checkout \
  -H "Content-Type: application/json" \
  -H "x-warpvio-qa-token: YOUR_PRIVATE_TEST_TOKEN" \
  -d '{"platforms":["Windows"],"email":"your-test-email@example.com"}'
```

### Before enabling any real one-time payments

Do **not** switch to live mode yet. Complete and end-to-end test all the following:

1. Working Windows, Android and macOS build workers with signable, installable artifacts, compatibility policies and delivery failure handling.
2. Website/domain ownership verification and secure app configuration uploads.
3. **Durable** order records bound to exact signed quotes, a real purchaser and app configuration, not simply browser `sessionStorage`.
4. Durable webhook idempotency, payment/order reconciliation, refund and chargeback handling, proper product/amount/currency checks, and a safe fulfillment queue.
5. Secure artifact storage, expiration, verified purchaser recovery, installation guides and customer support.
6. Test-mode payment + refunds + failed builds + webhook redelivery end to end; only then implement a separately audited production live checkout path.

**Do not charge customers for files Warpvio cannot actually generate and deliver.**
