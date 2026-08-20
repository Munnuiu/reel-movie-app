# Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Optional: run `seed.sql` to add starter movies.
4. For a project where the tables already exist, run `migrations/20260820_production_baseline.sql` once. It adds safe indexes, the movie `updated_at` trigger, hardened admin RLS, and the account-synced favorites table without deleting data.
5. In Authentication, create or sign up your admin user.
6. In SQL Editor, promote your user to admin:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

7. Copy Project URL and anon public key into Vercel environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ADMIN_ACCESS_CODE
```

`VITE_ADMIN_ACCESS_CODE` is only used when Supabase is not configured. In production, admin access is controlled by `profiles.role = 'admin'` plus row level security.
