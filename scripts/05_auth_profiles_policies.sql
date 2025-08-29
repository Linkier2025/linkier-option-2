-- Supabase Auth schema additions: profiles table, trigger, and RLS policies
-- Run this in your Supabase project SQL editor

-- 1) Create enum for user roles, only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('student', 'landlord', 'admin');
  END IF;
END$$;

-- 2) Profiles table mapped 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  first_name text,
  surname text,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.profiles;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- 4) Insert a profile row automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_first text;
  v_surname text;
  v_full text;
BEGIN
  v_first := COALESCE(NEW.raw_user_meta_data->>'first_name', NULL);
  v_surname := COALESCE(NEW.raw_user_meta_data->>'surname', NULL);
  v_full := COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);

  INSERT INTO public.profiles (id, email, first_name, surname, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    v_first,
    v_surname,
    COALESCE(v_full, CONCAT_WS(' ', v_first, v_surname)),
    'student',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6) Policies
-- Allow authenticated users to read profiles (adjust to your privacy needs)
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Prevent direct inserts by users; profiles are created by trigger. Only service role may insert.
DROP POLICY IF EXISTS "Only service role can insert profiles" ON public.profiles;
CREATE POLICY "Only service role can insert profiles"
ON public.profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can delete profiles
DROP POLICY IF EXISTS "Only service role can delete profiles" ON public.profiles;
CREATE POLICY "Only service role can delete profiles"
ON public.profiles FOR DELETE
TO service_role
USING (true);

-- 7) Helpful view (optional): join auth.users minimal fields with profiles
CREATE OR REPLACE VIEW public.user_minimal AS
SELECT
  u.id,
  u.email,
  p.first_name,
  p.surname,
  p.full_name,
  p.phone,
  p.avatar_url,
  p.role,
  p.created_at,
  p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id;

-- 8) (Optional) Storage policies for an "avatars" bucket
-- Create the bucket in the Dashboard (Storage > + New bucket) named: avatars
-- Then run these policies to allow users to manage their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can read avatars'
  ) THEN
    CREATE POLICY "Users can read avatars"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own avatar'
  ) THEN
    CREATE POLICY "Users can upload their own avatar"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own avatar'
  ) THEN
    CREATE POLICY "Users can update their own avatar"
      ON storage.objects FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
      )
      WITH CHECK (
        bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own avatar'
  ) THEN
    CREATE POLICY "Users can delete their own avatar"
      ON storage.objects FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]
      );
  END IF;
END$$;
