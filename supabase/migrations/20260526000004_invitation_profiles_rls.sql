-- Fix profiles RLS to allow viewing profiles of people involved in invitations
-- This allows recipients to see the name/avatar of the sender, and vice versa

drop policy if exists "Users can view own and partner's profile" on public.profiles;

create policy "Users can view relevant profiles"
  on public.profiles for select
  using (
    auth.uid() = id -- Own profile
    or partner_id = auth.uid() -- Partner's profile
    or exists (
      select 1 from public.couple_invitations
      where (sender_id = public.profiles.id and recipient_email = auth.email()) -- Sender of invitation to me
      or (sender_id = auth.uid() and recipient_email = (select email from auth.users where id = public.profiles.id)) -- Recipient of invitation from me
    )
  );
