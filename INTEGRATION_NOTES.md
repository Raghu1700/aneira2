# Backend Integration — Status & Credentials Needed

The Aneira backend (https://github.com/PrajanS/Aneira) is merged into this repo. The build is green and the storefront renders end-to-end. Below is what works today and what each external service unlocks.

## What works today (no credentials)

- All frontend routes serve 200 (`/`, `/shop`, `/shop/[filter]`, `/product/[id]`).
- The catalog adapter ([lib/catalog-adapter.ts](lib/catalog-adapter.ts)) tries the backend's `searchProducts` / `getProduct` / `getFeaturedProducts` server actions first; when the DB is unreachable it transparently falls back to the static seed in [lib/products.ts](lib/products.ts). No code changes needed to switch over once the DB is provisioned.
- Cart and wishlist state is local-first (still backed by localStorage) and best-effort syncs to the server actions in the background — silent failure when DB is down.
- Build registers three API routes: `/api/auth/[...nextauth]`, `/api/cloudinary/sign`, `/api/webhooks/razorpay`.
- Middleware loads and guards `/admin/*` and `/account/*` (returns 404 / login redirect when not signed in).

## What is wired but inactive until you set env vars

Fill in [.env.local](.env.local) to activate each path:

| Capability | Required env vars | How to get them |
|---|---|---|
| Real product catalog from DB | `DATABASE_URL`, `DIRECT_URL` | Free Postgres at [Neon](https://console.neon.tech). After setting, run `npm run db:migrate` then `npm run db:seed`. |
| User sign-in (OTP via email) | `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM` | `openssl rand -base64 32` for AUTH_SECRET; Resend account for the API key. |
| Razorpay checkout | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Test keys at [dashboard.razorpay.com](https://dashboard.razorpay.com/app/keys). |
| Product/enquiry image uploads (admin) | `CLOUDINARY_*` (5 vars) | [Cloudinary dashboard](https://console.cloudinary.com); create an unsigned upload preset called `aneira_signed`. |
| Order/shipment emails | `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_NOTIFY_TO` | [Resend.com](https://resend.com/api-keys). |

## Activation sequence (when ready)

```bash
# 1. Set DATABASE_URL + AUTH_SECRET in .env.local
npm run db:migrate     # creates the schema
npm run db:seed        # seeds settings + 3 collections
npm run admin:create   # interactive, creates first admin user

# 2. Optional: enable sample-product seed
SEED_PRODUCTS=true npm run db:seed

# 3. Restart the dev server
npm run dev
```

The frontend will start serving DB-backed product data the moment migrations + seed complete; no frontend code change required.

## File map

```
actions/                # Server actions (catalog, cart, wishlist, checkout, auth, enquiries, admin)
lib/
  catalog-adapter.ts    # The frontend's data layer — DB-first, static-fallback
  products.ts           # Static seed used as fallback + for `generateStaticParams`
  db.ts                 # Prisma singleton
  auth.ts               # Auth.js v5 config
  validators/           # Zod schemas shared by FE forms and BE actions
  ... (cloudinary, email, razorpay, rate-limit, etc.)
app/api/                # Auth, Cloudinary signing, Razorpay webhook
prisma/schema.prisma    # 18 models — auth, catalog, cart, orders, enquiries, settings
emails/                 # React Email templates
scripts/                # admin:create, check:env, db:seed
middleware.ts           # Edge guards for /admin and /account
```

## Notes

- Pinned to **Next 14 + React 18** to keep your frontend stable. The upstream backend uses Next 15 + React 19 RC; everything still resolves on 14/18 except `cookies-next` which was downgraded to `^4.3.0`.
- Auth.js v5 beta supports both Next 14 and 15.
- The Prisma "Can't reach database" warnings during `npm run build` are expected and swallowed by the adapter's catch — the build still completes and pages render the static fallback.
- Admin UI (`/admin/*`) and account UI (`/account/*`) routes are intentionally not built yet — backend actions exist (`actions/admin/*.ts`) but no pages call them. Add `app/(admin)/` and `app/(account)/` route groups when ready.
