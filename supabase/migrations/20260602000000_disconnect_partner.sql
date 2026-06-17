-- Function to safely disconnect a partner pair
-- Clears partner_id on both profiles and updates related invitations
create or replace function public.disconnect_partner()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  caller_email text;
  partner_id uuid;
begin
  caller_id := auth.uid();
  caller_email := auth.email();

  if caller_id is null then
    return json_build_object('error', 'Not authenticated');
  end if;

  -- Get current partner
  select partner_id into partner_id
  from public.profiles
  where id = caller_id;

  if partner_id is null then
    return json_build_object('error', 'No partner found');
  end if;

  -- Clear partner_id on both profiles
  update public.profiles
  set partner_id = null, updated_at = now()
  where id in (caller_id, partner_id);

  -- Cancel pending invitations sent by either user
  update public.couple_invitations
  set status = 'cancelled', updated_at = now()
  where sender_id in (caller_id, partner_id)
    and status = 'pending';

  return json_build_object('success', true);
exception
  when others then
    return json_build_object('error', sqlerrm);
end;
$$;
