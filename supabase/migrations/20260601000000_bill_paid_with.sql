-- Add paid_with_account_id to bills table
alter table public.bills
add column if not exists paid_with_account_id uuid references public.accounts(id) on delete set null;