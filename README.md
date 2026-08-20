# REEL Movie App

React + Vite + Tailwind CSS movie app built for Figma Make.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Android install

Deploy the app to HTTPS hosting such as Vercel. Open the public URL on Android Chrome, then choose install. The app includes a PWA manifest and update prompt, so new deployments can be applied from inside the installed app.

## Production deployment: GitHub → Vercel → Android

1. Push this repository to GitHub and import it into Vercel. Vercel detects Vite automatically; use `pnpm build` as the build command and `dist` as the output directory if it asks.
2. Add these **Production** environment variables in Vercel, then redeploy:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Do not put a Supabase service-role key in Vercel client environment variables.
3. In Supabase Authentication → URL Configuration, set the Vercel production URL as the Site URL and add it to Redirect URLs. This makes email confirmation and password reset links return to the app.
4. On Android Chrome, open the Vercel production URL and choose **Install app** (or browser menu → **Install app**). Installation needs HTTPS, so a plain local network URL is not sufficient.
5. For every release, push to the production GitHub branch. Once Vercel finishes deploying, open the installed app with internet access. It checks for a new service worker on launch, focus, and reconnect; when the banner appears, press **Шинэчлэх** to load the new version.

`vercel.json` intentionally prevents Vercel from caching `/sw.js`. Do not remove that header: caching the service worker prevents installed apps from discovering releases.

## Database and admin

The app can run in two modes:

- Local fallback mode: no environment variables needed; admin movie changes are saved in browser localStorage.
- Supabase mode: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel, then run `supabase/schema.sql` in the Supabase SQL editor.
- Existing Supabase project: also run `supabase/migrations/20260820_production_baseline.sql` once. It is non-destructive and adds database-synced saved movies.

Admin panel:

- Open the app and click `Admin`.
- The fallback admin code comes from `VITE_ADMIN_ACCESS_CODE`; if it is not set, local development uses `1234`.

Production note: the fallback admin code is only a UI gate. Real production protection comes from Supabase Auth, the `profiles.role = 'admin'` value, and the RLS policies in `supabase/schema.sql`.

Detailed Supabase setup lives in `supabase/README.md`.
