-- Allow partners to update each other's transactions
-- Previously only the owner could UPDATE; now partner can too

drop policy if exists "Users can update own transactions" on public.transactions;

create policy "Users can update own and partner's transactions"
  on public.transactions for update
  using (auth.uid() = user_id or public.is_my_partner(user_id))
  with check (auth.uid() = user_id or public.is_my_partner(user_id));
