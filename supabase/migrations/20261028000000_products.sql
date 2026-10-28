-- Create the owner account in Supabase Auth first, then replace the UUID
-- placeholder below with that account's auth.users.id before applying.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 160),
  description text not null check (char_length(description) <= 3000),
  category text not null check (char_length(category) between 1 and 80),
  price_ngn integer not null check (price_ngn >= 0),
  images text[] not null default '{}',
  sizes text[] not null default '{}',
  colours text[] not null default '{}',
  availability text not null default 'unconfirmed'
    check (availability in ('available', 'unavailable', 'unconfirmed')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Visitors can view published products"
  on public.products for select
  using (published);

create policy "Owner can view all products"
  on public.products for select
  using (auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid);

create policy "Owner can create products"
  on public.products for insert
  with check (
    auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid
    and owner_id = auth.uid()
  );

create policy "Owner can update products"
  on public.products for update
  using (auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid)
  with check (
    auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid
    and owner_id = auth.uid()
  );

create policy "Owner can delete products"
  on public.products for delete
  using (auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Visitors can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Owner can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid
  );

create policy "Owner can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid
  )
  with check (
    bucket_id = 'product-images'
    and auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid
  );

create policy "Owner can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and auth.uid() = 'REPLACE_WITH_OWNER_USER_UUID'::uuid
  );
