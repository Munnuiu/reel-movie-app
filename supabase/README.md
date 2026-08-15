# Supabase setup

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Optional: run `seed.sql` to add starter movies.
4. In Authentication, create or sign up your admin user.
5. In SQL Editor, promote your user to admin:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

6. Copy Project URL and anon public key into Vercel environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ADMIN_ACCESS_CODE
```

`VITE_ADMIN_ACCESS_CODE` is only used when Supabase is not configured. In production, admin access is controlled by `profiles.role = 'admin'` plus row level security.
