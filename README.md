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

## Database and admin

The app can run in two modes:

- Local fallback mode: no environment variables needed; admin movie changes are saved in browser localStorage.
- Supabase mode: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel, then run `supabase/schema.sql` in the Supabase SQL editor.

Admin panel:

- Open the app and click `Admin`.
- The fallback admin code comes from `VITE_ADMIN_ACCESS_CODE`; if it is not set, local development uses `1234`.

Production note: the fallback admin code is only a UI gate. Real production protection comes from Supabase Auth, the `profiles.role = 'admin'` value, and the RLS policies in `supabase/schema.sql`.

Detailed Supabase setup lives in `supabase/README.md`.
