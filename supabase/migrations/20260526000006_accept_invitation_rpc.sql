-- Function to safely accept a couple invitation and pair both users
-- Handles all updates in a single transaction

create or replace function public.accept_couple_invitation(invitation_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
  caller_id uuid;
  caller_email text;
begin
  caller_id := auth.uid();
  caller_email := auth.email();

  if caller_id is null then
    return json_build_object('error', 'Not authenticated');
  end if;

  -- 1. Fetch and lock the invitation
  select * into inv
  from public.couple_invitations
  where id = invitation_id
  for update;

  if not found then
    return json_build_object('error', 'Invitation not found');
  end if;

  -- 2. Validate invitation
  if inv.status != 'pending' then
    return json_build_object('error', 'Invitation is no longer pending');
  end if;

  if inv.recipient_email != caller_email then
    return json_build_object('error', 'This invitation was not sent to you');
  end if;

  -- 3. Check if sender already has a partner
  if exists (
    select 1 from public.profiles
    where id = inv.sender_id and partner_id is not null
  ) then
    return json_build_object('error', 'Sender already has a partner');
  end if;

  -- 4. Check if recipient already has a partner
  if exists (
    select 1 from public.profiles
    where id = caller_id and partner_id is not null
  ) then
    return json_build_object('error', 'You already have a partner');
  end if;

  -- 5. Perform updates
  -- Update invitation status
  update public.couple_invitations
  set status = 'accepted', updated_at = now()
  where id = invitation_id;

  -- Update recipient's profile
  update public.profiles
  set partner_id = inv.sender_id, updated_at = now()
  where id = caller_id;

  -- Update sender's profile
  update public.profiles
  set partner_id = caller_id, updated_at = now()
  where id = inv.sender_id;

  return json_build_object('success', true);
exception
  when others then
    return json_build_object('error', sqlerrm);
end;
$$;
