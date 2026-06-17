-- Fix RLS vulnerabilities found by security audit
-- Issues fixed:
-- 1. Partner Escalation: profiles UPDATE policy had no WITH CHECK clause,
--    allowing users to set partner_id to any UUID and gain partner read access
-- 2. Goals table missing partner SELECT policy
-- 3. Activity logs table missing partner SELECT policy

-- ============================================================
-- 1. Fix profiles UPDATE policy — prevent arbitrary partner_id
-- ============================================================
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Block changing partner_id outside the security-definer RPC.
    -- The RPCs (accept_couple_invitation, disconnect_partner) bypass RLS.
    and partner_id is not distinct from (
      select partner_id from public.profiles where id = auth.uid()
    )
  );

-- ============================================================
-- 2. Goals: add partner SELECT policy
-- ============================================================
create policy "Users can view partner's goals"
  on public.goals for select
  using (
    auth.uid() = user_id
    or public.is_my_partner(user_id)
  );

-- ============================================================
-- 3. Activity logs: add partner SELECT policy
-- ============================================================
create policy "Users can view partner's activity logs"
  on public.activity_logs for select
  using (
    auth.uid() = user_id
    or public.is_my_partner(user_id)
  );
