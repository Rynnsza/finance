-- Goals: Add partner read RLS policy
-- Previously only had "Users can view own goals" — we need partner read too

drop policy if exists "Users can view own goals" on public.goals;

create policy "Users can view own and partner's goals"
  on public.goals for select
  using (
    auth.uid() = user_id
    or public.is_my_partner(user_id)
  );
