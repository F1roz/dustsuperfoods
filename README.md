# Dust Superfoods website

Static site (HTML/CSS/JS), so there's no build step. Open `index.html` locally, or upload the whole folder to any host (Netlify, Vercel, cPanel, GitHub Pages…).

## 1. Prices (the only place to edit)
Open **`js/config.js`** and replace the two `XX.XX` values:

```js
PRICE_SO_FRESH_SO_GREEN: "XX.XX",   // ← PRICE #1
PRICE_POWER_UP:          "XX.XX",   // ← PRICE #2
```
Use numbers only (e.g. `"49.99"`). Every price on every page, plus the cart total, updates automatically.

## 2. Forms (FormSubmit → elizavelardez@dustsuperfoods.com)
Contact, newsletter, ebook requests and order requests are all sent through FormSubmit.co.
**The first time any form is submitted, FormSubmit emails an activation link to that inbox. Click it once** and every form will start delivering.
To change the inbox, edit `email` in `js/config.js`. For people without JavaScript, also find/replace the address in the HTML `action="…"` attributes.

## 3. Cart / checkout
The bag is saved in the visitor's browser. "Request my order" emails you the order plus the customer's name, email and address, and you reply with a payment link. When you set up Shopify, Stripe or Square, point the buttons there.

## 4. Things to review before launch
- **Testimonials** (`index.html`, search `TESTIMONIALS`): replace the 3 placeholder cards with real reviews.
- **Founder**: `about.html` uses `assets/img/kitchen-powerup.webp` (Eliza with the pouches).
- **Shipping & returns** FAQ answers (`index.html`) and the **Privacy / Terms** templates.
- **Ebook**: requests arrive by email. Reply with the PDF or set up an autoresponder.
- **Domain**: canonical/OG URLs and `sitemap.xml` assume `https://www.dustsuperfoods.com`.

## 5. Logos
`assets/logo/` contains SVG rebuilds of the Dust logo and the "Powder to the People" fist, matched to the official artwork colors. The original .ai file arrived corrupted, so if you have the original vector exports (SVG), drop them in with the same file names.

## Structure
```
index.html  about.html  shop.html  so-fresh-so-green.html  power-up.html
ingredients.html  learn.html  contact.html  privacy.html  terms.html  thank-you.html  404.html
css/style.css        design system and all styles
js/config.js         ★ prices, email, Instagram
js/main.js           nav, animations, cart, forms, accordions
js/hero3d.js         Three.js 3D pouch (bundled); falls back to a photo without WebGL
vendor/              GSAP + ScrollTrigger
assets/              fonts (self-hosted), images (WebP), logos, favicon
```
Respects `prefers-reduced-motion`. Uses the default cursor.
