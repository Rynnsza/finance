-- Add image_url column to transactions for receipt/invoice attachments
alter table public.transactions
  add column if not exists image_url text;

-- Create storage bucket for transaction images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'transaction-images',
  'transaction-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage RLS policies for transaction-images bucket
create policy "Authenticated users can view transaction images"
  on storage.objects for select
  using (
    bucket_id = 'transaction-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can upload transaction images"
  on storage.objects for insert
  using (
    bucket_id = 'transaction-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can update own transaction images"
  on storage.objects for update
  using (
    bucket_id = 'transaction-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can delete own transaction images"
  on storage.objects for delete
  using (
    bucket_id = 'transaction-images'
    and auth.role() = 'authenticated'
  );
