create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  message text not null,
  status text check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED')) default 'OPEN',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tickets enable row level security;

-- Policy: Users can view their own tickets
create policy "Users can view own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own tickets
create policy "Users can insert own tickets"
  on public.tickets for insert
  with check (auth.uid() = user_id);

-- Policy: Admins/Service Role can do everything (Implicitly true for service role, but good for admin users if we had them)
-- For now, we rely on service role or a specific admin flag in metadata if needed. 
