-- Fix receipts storage RLS: add missing bucket_id check
-- Without this, the policy could allow operations on files in other buckets
-- where the user happens to be the owner_id.

drop policy if exists "Users can CRUD own receipts" on storage.objects;

create policy "Users can CRUD own receipts"
  on storage.objects for all
  using (auth.uid()::text = owner_id and bucket_id = 'receipts')
  with check (auth.uid()::text = owner_id and bucket_id = 'receipts');
