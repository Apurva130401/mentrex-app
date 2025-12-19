-- WARNING: This will delete existing API keys!
DROP TABLE IF EXISTS api_keys CASCADE;

create table api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text,
  key_hash text,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  CONSTRAINT unique_user_key UNIQUE (user_id)
);

-- Enable RLS
alter table api_keys enable row level security;

-- Policies
create policy "Users can view their own keys" 
  on api_keys for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own keys" 
  on api_keys for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own keys" 
  on api_keys for delete 
  using (auth.uid() = user_id);
