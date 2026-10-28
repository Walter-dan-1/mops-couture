# Mop's Couture

Mop's Couture is a React/Vite website. It is a web app; it does not require a desktop-app runtime.

## Run locally

From the project directory, open a terminal and run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`) in Microsoft Edge. Keep the terminal open while using the site. Press **Ctrl+C** to stop the server.

To check a production build:

```powershell
npm run lint
npm run build
npm run preview
```

There is no configured automated test suite at present.

## Pages

The public routes are `/`, `/ready-to-wear`, `/custom-couture`, `/gallery`, `/community`, `/our-story`, `/contact`, and `/bag`. Settings includes `/settings`, `/settings/account` and its planned account subsections, `/settings/preferences`, `/settings/accessibility`, `/settings/privacy`, `/settings/help`, and `/settings/terms`. The policy pages are `/terms`, `/terms/custom-couture`, and `/privacy`. `/admin/login` and `/admin` show a secure setup notice rather than pretending that an unconfigured admin area is protected. The Vercel rewrite supports direct route access and page refreshes.

The Ready-to-Wear page currently contains 27 distinct demo style records with category, silhouette, colour, sample-size, sample-price and text filters. All prices and size/colour selections are illustrative, availability is unconfirmed, and the external Pexels/Unsplash fashion photographs are editorial references rather than verified Mop's Couture products or customer orders. Pexels source links are available from the relevant product details and Gallery image preview.

The Gallery is a visual journal rather than a second catalogue: it has an editorial lookbook, a truthful custom-creation portfolio notice, empty customer-photo and review states, and a clearly labelled curated demo edit. Customer photos and genuine reviews should only be added when supplied and approved. The original promotional image at `src/assets/mops-couture-hero.png` is preserved and shown in full in the home hero and other brand-photo placements. The bag is browser-local and enquiries go to WhatsApp; there is no payment checkout.

The Community page at `/community` is an interactive local demo feed. It supports browser-local demo posts with up to three JPG, PNG, WebP or GIF photos (1 MB each, 2 MB total), captions, optional design/occasion details and sample ratings; visitors can sort, filter, like/unlike and comment. Seed posts, names, photos, comments, likes and ratings are illustrative, not verified customer submissions or testimonials. New uploads and interactions are stored only in the current browser and are not shared with other visitors. The post form asks the visitor to confirm the outfit is a Mop's Couture design they own and have worn, and that they have permission to use the photos; this demo confirmation is not independently verified. There is no account authentication, moderation, remote storage or backend Community service. Use genuine customer photos only after receiving permission.

## Visitor preferences and background audio

The reduced-motion preference is saved locally in the visitor's browser, and the site also respects the operating-system setting. The bag is stored locally as well; neither is synced to an account.

The Custom Couture enquiry form validates details and consent, shows a review before the visitor chooses to open WhatsApp, and does not store enquiries or consent records on this site. Preferred dates are requests only. The policy summaries are informational and need business/legal review before production use.

The background audio playlist is invisible and references the MP3 assets in `public/music/`. Playback is attempted only after a visitor interacts with the page, because browsers may block audio before a user gesture. A single audio element moves through the playlist and continues across client-side navigation. Missing tracks are skipped silently. Ensure you have permission to use each audio track. To add or remove tracks, update the title/source entries in the `tracks` playlist in `src/Storefront.jsx`.

## Owner product administration

There is no backend configured or connected to this storefront yet. The owner routes are intentionally not functional: setting environment values alone does not enable sign-in, product management, or image uploads. Do not enter real products or credentials until the frontend is wired to the backend and the access rules have been reviewed.

The repository includes a Supabase schema/policy starting point in `supabase/migrations/20261028000000_products.sql`. Before applying it:

1. Create a Supabase project and create the owner account using Supabase Auth.
2. Replace every `REPLACE_WITH_OWNER_USER_UUID` placeholder in the migration with that account's Auth user UUID.
3. Review the migration and apply it through Supabase's migration workflow.
4. Configure the project's public URL and anon key in local `.env` or Vercel project environment variables, using `.env.example` as a reference.
5. Implement and test Supabase Auth, product CRUD, image upload validation, and public-catalogue reads in the app before enabling the admin routes.

Only the Supabase anon key belongs in a browser app. Never expose a service-role key, database password, or other administrative secret in a `VITE_` variable. The database and storage policies—not a hidden route or client-side check—must enforce owner permissions.

## Deploy to Vercel

Import the project into Vercel and deploy with the existing Vite defaults. The included `vercel.json` sends app routes to the Vite entry point so refreshes work. No backend-backed admin features are ready for production until the setup and integration described above are completed.
