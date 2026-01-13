-- Create the profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  updated_at timestamp with time zone,
  
  constraint proper_email check (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy to allow users to SELECT their own profile
create policy "Users can view own profile" on public.profiles
for select using (auth.uid() = id);

-- Policy to allow users to INSERT their own profile
-- This is crucial for the first time someone logs in or saves settings
create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = id);

-- Policy to allow users to UPDATE their own profile
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id);

-- (Optional) Public Read Access if you want people to see other's names:
-- create policy "Public profiles are viewable by everyone" on public.profiles
-- for select using (true);
