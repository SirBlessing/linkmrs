# Linkmrs — React Frontend Prototype

A fully functional micro-vendor platform prototype, built to match the
attached "Kinetic Minimalist" design system exactly.

- **React** (pure JavaScript, no TypeScript)
- **Vanilla CSS** — one standalone stylesheet (`src/index.css`), no
  Tailwind, no Bootstrap, no UI component libraries
- **Vite** as the build tool (fast dev server, zero extra config)

## Getting started

```bash
npm install
npm run dev      # starts a local dev server (usually http://localhost:5173)
```

To produce an optimized production build:

```bash
npm run build     # outputs to /dist
npm run preview   # serve the production build locally
```

## What's inside

The app is a single-page React application that toggles between two
simulated experiences via the pill switcher fixed to the top of the screen:

### 1. Vendor Dashboard (`src/components/VendorDashboard.jsx`)
- Add / edit products through a validated form (name, price, description,
  image upload) — capped at **10 products** on the Free plan, matching the
  source design's "8 of 10 slots used" indicator.
- Product list with inline **Edit** / **Delete** actions.
- Editable shop profile card (logo, name, bio, location, currency symbol,
  WhatsApp number) with a generated store link (`Linkmrs.com/your-shop-name`)
  and a one-tap **Copy Link** button.
- **Desktop (≥1024px):** replicates the three-column split layout — fixed
  280px sidebar, scrollable main workspace, and a 360px live phone preview
  of the storefront on the right that mirrors product/profile edits in
  real time.
- **Mobile (<1024px):** stacks into a single column with a floating action
  button that opens the add/edit form in a bottom sheet, plus a fixed
  bottom navigation bar (the "Store" icon jumps straight to the customer
  view for easy simulation).

### 2. Customer Storefront (`src/components/CustomerStorefront.jsx`)
- Bio-link style header: circular logo, shop name, bio, location chip and
  rating chip.
- Responsive product grid — 2 columns on mobile, 3 on tablet/desktop,
  capped at an 800px container exactly as in the source design.
- Tapping a product's cart icon adds it to the bag; a sticky bottom bar
  shows the live item count and running total.
- Tapping the bag opens a review sheet where quantities can be adjusted
  per line item.
- **Send Order via WhatsApp** builds a `https://wa.me/<number>?text=...`
  URL with an itemized, human-readable order summary (quantities, unit
  totals, grand total) and opens it in a new tab.

## File structure

```
src/
  App.jsx                       top-level state + view switcher
  index.css                     the standalone vanilla CSS file
  utils.js                      formatPrice / slugify / id helpers
  data/initialData.js           seed shop profile + starter catalog
  components/
    VendorDashboard.jsx
    ProductForm.jsx              add/edit form (inline on desktop, sheet on mobile)
    ProductListItem.jsx
    ShopProfileCard.jsx
    PhonePreview.jsx             live phone-bezel mirror of the storefront
    CustomerStorefront.jsx
    ProductCard.jsx
    CartBar.jsx
    CartSheet.jsx
    BottomNav.jsx                shared pill bottom navigation
```

## Notes on data

There's no backend — all state (products, shop profile, cart) lives in
`App.jsx` via `useState` and is shared between both views so edits made in
the dashboard immediately show up in the storefront and its live preview.
Seed images come from Picsum's placeholder photo service; swap
`src/data/initialData.js` for real product data whenever you're ready.
