-- Couple Collaboration: Add partner_id to profiles + RLS helper function

-- Add partner_id column to profiles
alter table public.profiles
  add column if not exists partner_id uuid references auth.users(id);

-- Index for faster partner lookups
create index if not exists idx_profiles_partner_id
  on public.profiles(partner_id);

-- Helper function for RLS: check if auth.uid() is the partner of target_user_id
create or replace function public.is_my_partner(target_user_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = target_user_id
      and partner_id = auth.uid()
  );
$$;

-- Update profile policies to allow partner to view
-- Drop existing first
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Users can view own and partner's profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.is_my_partner(id)
    or exists (
      select 1 from public.profiles
      where id = auth.uid()
        and partner_id = public.profiles.id
    )
  );
