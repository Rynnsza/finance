-- Storage bucket for goal images (public for direct display)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'goal-images',
  'goal-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- RLS: users can upload/delete own images
create policy "Users can CRUD own goal images"
  on storage.objects for all
  using (auth.uid()::text = owner_id and bucket_id = 'goal-images')
  with check (auth.uid()::text = owner_id and bucket_id = 'goal-images');

-- Add image_url column to goals
alter table public.goals
  add column if not exists image_url text;
