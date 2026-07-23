-- ============================================================
-- GABI BIJUS — Schema inicial (Etapa 3)
-- Tabelas + RLS completo + bucket de imagens
-- ============================================================

-- ---------- TABELAS ----------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories (id) on delete set null,
  price numeric(10, 2) not null check (price >= 0),
  promo_price numeric(10, 2) check (promo_price is null or promo_price >= 0),
  description text not null default '',
  materials text not null default '',
  size_info text not null default '',
  is_new boolean not null default false,
  featured boolean not null default false,
  sold_out boolean not null default false,
  active boolean not null default true,
  stock int check (stock is null or stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_active_idx on public.products (active);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order int not null default 0
);

create index product_images_product_idx on public.product_images (product_id);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  image_url text,
  body text not null default '',
  cta_label text not null default 'Ver a coleção',
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.campaign_products (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (campaign_id, product_id)
);

-- Conteúdo editável do site (chave → JSON)
create table public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- E-mails autorizados a usar o painel admin.
-- Contas criadas manualmente no dashboard (cadastro público DESABILITADO).
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- FUNÇÃO is_admin ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- ROW LEVEL SECURITY ----------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_products enable row level security;
alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;

-- categories: leitura pública, escrita só admin
create policy "categories_select_public" on public.categories
  for select using (true);
create policy "categories_write_admin" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products: público vê só ativos; admin vê e edita tudo
create policy "products_select_active" on public.products
  for select using (active or public.is_admin());
create policy "products_write_admin" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- product_images: seguem a visibilidade do produto
create policy "product_images_select" on public.product_images
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.active
    )
  );
create policy "product_images_write_admin" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- campaigns: público vê só ativas
create policy "campaigns_select_active" on public.campaigns
  for select using (active or public.is_admin());
create policy "campaigns_write_admin" on public.campaigns
  for all using (public.is_admin()) with check (public.is_admin());

-- campaign_products: seguem a visibilidade da campanha
create policy "campaign_products_select" on public.campaign_products
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.active
    )
  );
create policy "campaign_products_write_admin" on public.campaign_products
  for all using (public.is_admin()) with check (public.is_admin());

-- site_content: leitura pública, escrita só admin
create policy "site_content_select_public" on public.site_content
  for select using (true);
create policy "site_content_write_admin" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

-- admin_users: só admins enxergam a lista; NINGUÉM escreve via API
-- (gerenciamento pelo dashboard/service_role, que ignora RLS)
create policy "admin_users_select_admin" on public.admin_users
  for select using (public.is_admin());

-- ---------- TRIGGER updated_at ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

-- ---------- STORAGE: bucket de imagens ----------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Leitura pública; upload/edição/remoção só admin
create policy "storage_select_public" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "storage_insert_admin" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "storage_update_admin" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "storage_delete_admin" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
