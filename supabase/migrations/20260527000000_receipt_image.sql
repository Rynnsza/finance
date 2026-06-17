-- Add receipt_image column to transactions
alter table public.transactions
  add column if not exists receipt_image text;

-- Storage bucket for receipt images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- RLS: users can manage their own receipts
create policy "Users can CRUD own receipts"
  on storage.objects for all
  using (auth.uid()::text = owner_id)
  with check (auth.uid()::text = owner_id);
