-- Couple Collaboration: Invitations table
-- Manages the invitation flow between two users

create table if not exists public.couple_invitations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  token uuid not null default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.couple_invitations enable row level security;

-- Sender policies
create policy "Users can view own sent invitations"
  on public.couple_invitations for select
  using (auth.uid() = sender_id);

create policy "Users can send invitations"
  on public.couple_invitations for insert
  with check (auth.uid() = sender_id);

create policy "Users can update own invitations"
  on public.couple_invitations for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

create policy "Users can delete own invitations"
  on public.couple_invitations for delete
  using (auth.uid() = sender_id);

-- Recipient can view pending invitations sent to their email
create policy "Recipient can view invitations by email"
  on public.couple_invitations for select
  using (
    recipient_email = auth.email() AND status = 'pending'
  );

-- Recipient can accept/reject (update) invitations sent to their email
create policy "Recipient can respond to invitations"
  on public.couple_invitations for update
  using (
    recipient_email = auth.email() AND status = 'pending'
  )
  with check (
    recipient_email = auth.email() AND status in ('accepted', 'rejected')
  );

-- Indexes
create index if not exists idx_couple_invitations_sender
  on public.couple_invitations(sender_id);

create index if not exists idx_couple_invitations_email
  on public.couple_invitations(recipient_email);

create index if not exists idx_couple_invitations_token
  on public.couple_invitations(token);
