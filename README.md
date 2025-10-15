# DXLR Returns (Minimal)

**What you get**
- Customer portal (`/portal.html`) to lookup an order (by order number + phone), pick items/quantities, select reason, accept terms, and submit.
- Admin dashboard (`/admin/returns`) to view and manage requests.
- API routes to talk to Shopify + MongoDB.

## Setup (Vercel)
1) Create a project from this repo.
2) Add env vars:
   - SHOPIFY_SHOP = your-shop.myshopify.com
   - SHOPIFY_ADMIN_TOKEN = shpat_xxx
   - MONGODB_URI = mongodb+srv://USER:PASS@cluster0.mongodb.net
   - MONGODB_DB = dxlr
   - APP_SLA_DAYS = 5
   - APP_REQUIRE_PHONE = true
3) Deploy.

## Notes
- The admin actions currently update DB status. Hook them to Shopify (returns/refunds/draft orders) when ready.
