# beinspiredbyus.be — Personal Website (Phase 1–3)

Next.js 14 (App Router) + Tailwind + React Hook Form + Supabase contact submissions.

## Local setup

1. Install deps
   - `npm install`
   - (Note: this environment had no DNS/network access to npm; install locally or in a CI environment with internet.)
2. Env vars
   - copy `.env.example` → `.env.local`
   - set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - optional: `INSTAGRAM_ACCESS_TOKEN` (Instagram Graph API) to show latest posts on the homepage
3. Run
   - `npm run dev`

## Supabase table

Create a table `contact_submissions`:

```sql
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  topic text not null,
  message text,
  source text,
  user_agent text,
  ip text
);
```

If you want to use the **service role key**, keep the table private (no need for RLS).

Create a table `mealplanner_leads`:

```sql
create table if not exists public.mealplanner_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text not null,
  goal text not null,
  preferences jsonb,
  consent boolean default true
);
```

## Deploy (Vercel)

- Framework preset: Next.js
- Add env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `INSTAGRAM_ACCESS_TOKEN`
- Deploy

---

## 🚀 Setup Instructions (for Arno)

### 1. Supabase Database Tables

Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard/project/uldlxqyqmpjznmnokbjz/sql):

```sql
-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  topic text NOT NULL,
  message text
);

-- Mealplanner leads
CREATE TABLE IF NOT EXISTS mealplanner_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  email text NOT NULL,
  goal text NOT NULL,
  preferences jsonb,
  consent boolean DEFAULT true
);
```

### 2. Vercel Environment Variables ✅
Already configured:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Custom Domain (Optional)
1. Go to Vercel → Project Settings → Domains
2. Add `beinspiredbyus.be`
3. Update DNS at your registrar

### 4. Redeploy
After creating tables, trigger a redeploy in Vercel to ensure everything works.

---

Built with ❤️ by Jarvis & Mike
