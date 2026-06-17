-- Fix profiles UPDATE RLS recursion
--
-- The previous UPDATE policy used a subquery referencing profiles in its
-- with check clause, which triggered recursive RLS evaluation and was
-- blocked by PostgreSQL.
--
-- Fix: create a security definer function to safely read the current
-- partner_id, then reference it in the policy instead of a raw subquery.

-- ============================================================
-- 1. Create helper function (bypasses RLS via security definer)
-- ============================================================
create or replace function public.get_my_partner_id()
returns uuid
language sql
stable
security definer
as $$
  select partner_id from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- 2. Recreate UPDATE policy using the helper function
-- ============================================================
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and partner_id is not distinct from public.get_my_partner_id()
  );
