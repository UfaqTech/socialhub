# UfaqTech Social Hub Admin Panel

## Overview
This Next.js app is a Vercel-ready admin dashboard for approving and managing links submitted from the Android app. It uses Supabase as the central database.

## Required Environment Variables
Configure these in Vercel and locally in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL` (recommended)
- `ADMIN_PASSWORD` (recommended)

## Supabase PostgreSQL Schema
Use the `supabase-schema.sql` file to create your tables and enums in Supabase SQL Editor.

The schema supports:
- Moderation queue
- Dynamic categories
- Audit logs
- User profiles
- Reported links

Run this SQL in Supabase SQL Editor:

```sql
-- 1. ROLES ENUM
CREATE TYPE user_role AS ENUM ('super_admin', 'moderator', 'user');

-- 2. LINK STATUS ENUM
CREATE TYPE link_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user'::user_role,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. DYNAMIC CATEGORIES TABLE
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. SOCIAL LINKS TABLE (Approved/Pending/Rejected)
CREATE TABLE public.links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_type TEXT NOT NULL,
    image_url TEXT,
    status link_status DEFAULT 'pending'::link_status,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. REPORTED/FLAGGED LINKS TABLE
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. AUDIT LOGS FOR ADMIN ACTIONS
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) on critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Simple Policy: Admins can do everything, Users can read approved links
CREATE POLICY "Allow public read of approved links" ON public.links
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Allow users to manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);
```

## Android App Sync
Both your Android app and Vercel Admin Panel connect to the same Supabase database instance. The app submits links as `pending`, and the panel approves them using the same `links` table.

## Deployment
1. Push repo to GitHub.
2. Connect project to Vercel.
3. Add environment variables in Vercel settings.
4. Deploy.

## Local Development
Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

- `id` (UUID, primary key)
- `title` (text)
- `url` (text)
- `category` (text)
- `sub_type` (text)
- `platform` (text)
- `status` (text)
- `user_id` (uuid)
- `created_at` (timestamp)

## How It Works
- The Android app submits links with `status = pending`.
- The admin panel loads pending links and approved links from Supabase.
- Approve updates `status` to `approved`.
- Delete removes the record from Supabase.

## Deployment
1. Push this repo to GitHub.
2. Create a new Vercel project.
3. Add environment variables in Vercel.
4. Deploy.

## Local Development
Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```
