# PrismCollective Site — Briefing

**What's deployed:** Premium Claude-designed static site on Vercel
**URL:** `https://prismcollective-duxjy95if-ramoventuregroup-2108s-projects.vercel.app/`
**GitHub:** `ramoventuregroup/prismcollective` → main branch → Vercel auto-deploys

## Files (public/ folder)
- **index.html** (42KB) — Claude's beautiful HTML with product grid containers
- **style.css** (28KB) — Claude's premium CSS: glass header, blob hero, animations, responsive grid
- **app.js** (9KB) — Product rendering + Claude's JS (cart, popup, toast, newsletter, scroll effects)
- **data.js** (36KB) — All 31 products with real Shopify CDN images, prices, compare-at, IDs

## Product data
- 31 real products: 17 Eco Home + 14 Eco Pet
- Real Shopify CDN image URLs (verified working)
- Real prices & compare-at prices
- Real Shopify product IDs → checkout links to `jv17sy-r4.myshopify.com/cart/ID:1`
- Product cards dynamically rendered from PRISM_DATA

## Design features
- Animated blob gradient hero section
- Glass morphism header (scrolls to glass)
- Category cards (Eco Home / Eco Pet)
- Product grids with star ratings, badges, wishlist
- Bundle section with savings display
- Trust badges (Free Shipping, Returns, Secure, Eco)
- Newsletter signup form
- Exit-intent popup with 10% off
- Toast notifications
- Fade-in animations via IntersectionObserver
- Mobile responsive with hamburger menu

## Next step
Junior needs to view the site and give feedback on design. After approval, point prismcollective.us → Vercel production.
