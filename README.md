# aperiaskin.com — marketing site

A single self-contained `index.html` (embedded CSS + vanilla JS, no build step). Deploys anywhere, fully yours, easy to edit.

## 1. Drop in your real assets
Create an `assets/` folder next to `index.html` and add:
- **App screenshots** (PNG): `screen-score.png`, `screen-cycle.png`, `screen-insights.png`, `screen-beforeafter.png` — then replace the placeholder `.ph` blocks in the hero + "showcase" sections with `<img src="assets/screen-score.png" alt="…">`.
- **Before/after photos** (with consent): swap the 4 `.jcell` placeholders in the "Personal journeys" grid.
- **Journal images**: swap the 3 `.thumb` placeholders.
- **Logo**: replace the inline swan `<svg>` in the header + footer `.mark` with your real `aperia-logo` (or an `<img>`).
- **Favicon**: `assets/favicon.png` (the swan).
- **OG share image**: `assets/og-image.png` (1200×630) — shown when the link is posted on socials.

## 2. Set the App Store link (one place)
In `index.html`, near the bottom `<script>`:
```js
var APP_STORE_URL = "https://apps.apple.com/app/idXXXXXXXXXX";
```
Every "Download / Get the app" button uses it automatically.

## 3. Wire the email signup (optional)
The footer form currently just shows "Thanks ✓". To actually collect emails, point the `<form>` at Buttondown / Formspree / Mailchimp (free tiers) — one attribute change.

## 4. App Store badge
For Apple guideline compliance, swap the custom App Store buttons for Apple's official "Download on the App Store" badge (download from Apple's marketing resources) — keep the same `data-appstore` link.

## 5. Deploy (pick one — all free)
- **Netlify (easiest):** netlify.com → "Add new site" → "Deploy manually" → **drag the whole `website/` folder** onto the page. Live in ~30s.
- **Vercel:** push the folder to a GitHub repo → import at vercel.com → deploy.
- **Cloudflare Pages:** same idea, connect the repo.

## 6. Point aperiaskin.com at it
In your host's dashboard, add the custom domain `aperiaskin.com` (and `www`). It gives you DNS records:
- **Netlify/Vercel:** usually an **A record** for the apex (`@`) to their IP + a **CNAME** for `www`. Add those in **Namecheap → Advanced DNS** (same place you added the `legal` CNAME). Leave your Google email + Resend + the `legal` records untouched.
- HTTPS is issued automatically.

Keep `legal.aperiaskin.com` exactly as it is — this site is the apex `aperiaskin.com` and links out to it.
