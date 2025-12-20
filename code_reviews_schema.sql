-- Create table for storing GitHub configurations (PATs)
create table if not exists github_configs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  encrypted_pat text not null, -- In a real app, use proper encryption. For MVP, we might store as is or simple encoding
  github_username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for storing Code Review sessions
create table if not exists code_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  repo_owner text not null,
  repo_name text not null,
  pr_number integer not null,
  pr_title text,
  pr_url text,
  analysis_result text, -- Markdown content from AI
  status text default 'pending', -- pending, completed, failed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table github_configs enable row level security;
alter table code_reviews enable row level security;

-- RLS Policies for github_configs
create policy "Users can view their own github config" 
  on github_configs for select 
  using (auth.uid() = user_id);

create policy "Users can insert/update their own github config" 
  on github_configs for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own github config" 
  on github_configs for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own github config" 
  on github_configs for delete 
  using (auth.uid() = user_id);

-- RLS Policies for code_reviews
create policy "Users can view their own reviews" 
  on code_reviews for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own reviews" 
  on code_reviews for insert 
  with check (auth.uid() = user_id);
