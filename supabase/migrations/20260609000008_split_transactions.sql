-- Split transactions: allow one transaction to be split across multiple categories
alter table public.transactions
  add column if not exists splits jsonb default '[]'::jsonb;
