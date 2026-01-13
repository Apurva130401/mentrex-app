-- Create Workflows Table
create table workflows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  nodes jsonb default '[]'::jsonb,
  edges jsonb default '[]'::jsonb,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table workflows enable row level security;

-- Policies
create policy "Users can view their own workflows"
  on workflows for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workflows"
  on workflows for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workflows"
  on workflows for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workflows"
  on workflows for delete
  using (auth.uid() = user_id);
