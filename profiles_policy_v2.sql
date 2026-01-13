-- Drop the previous policies to avoid conflicts
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Create policies that check the 'uid' column instead of 'id'
create policy "Users can view own profile" on public.profiles
for select using (auth.uid() = uid);

-- For INSERT, we allow if the inserted 'uid' matches the authenticated user
create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = uid);

-- For UPDATE, we allow if the row's 'uid' matches the authenticated user
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = uid);
