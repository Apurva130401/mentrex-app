-- 1. Create the ENUM type
create type ticket_status as enum ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- 2. Drop the old check constraint (if you haven't already, otherwise this might fail individually but is safe to run)
-- Note: You might need to find the specific constraint name if it was auto-generated, 
-- but usually altering the column type handles the conversion if data aligns.
-- However, best practice is to explicitely alter the column.

-- 2. Drop the old check constraint to avoid type mismatch
-- The constraint checks against text values ('OPEN'), which fails when we convert to ENUM.
alter table public.tickets drop constraint if exists tickets_status_check;

-- 3. Alter the column to use the new Enum type
alter table public.tickets 
  alter column status drop default,
  alter column status type ticket_status using status::ticket_status,
  alter column status set default 'OPEN'::ticket_status;

-- 3. Just to be clean, we don't need the check constraint anymore if we have the Enum type
-- But Postgres Enums enforce values automatically.
