-- Allow partners to delete each other's transactions
-- Previously only the owner could DELETE; now partner can too

drop policy if exists "Users can delete own transactions" on public.transactions;

create policy "Users can delete own and partner's transactions"
  on public.transactions for delete
  using (auth.uid() = user_id or public.is_my_partner(user_id));
