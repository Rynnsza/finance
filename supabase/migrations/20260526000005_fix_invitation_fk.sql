-- Fix foreign key in couple_invitations to allow direct join with profiles
-- This changes the reference from auth.users to public.profiles

alter table public.couple_invitations
  drop constraint if exists couple_invitations_sender_id_fkey;

alter table public.couple_invitations
  add constraint couple_invitations_sender_id_fkey
  foreign key (sender_id)
  references public.profiles(id)
  on delete cascade;

-- Ensure RLS allows the join
-- The previous migration 20260526000004 already added relevant profile viewing
