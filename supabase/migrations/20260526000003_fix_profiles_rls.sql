-- Fix profiles RLS: simplify partner view policy to avoid infinite recursion
-- Previous policy queried profiles inside its own policy, causing Supabase RLS recursion detection

drop policy if exists "Users can view own and partner's profile" on public.profiles;

create policy "Users can view own and partner's profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or partner_id = auth.uid()
  );
