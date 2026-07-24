-- ─────────────────────────────────────────────────────────────
--  0005 — Variações de produto + controle do hero da home
-- ─────────────────────────────────────────────────────────────
-- Roda inteira de uma vez no SQL Editor. É idempotente: pode
-- rodar de novo sem quebrar nada.
--
-- 1) Hero: a lojista escolhe QUAIS peças passam na tela principal
--    e ONDE a foto deve ser enquadrada (o corte de tela cheia
--    cortava a bijuteria e sobrava só a modelo).
-- 2) Variações: peças em que a cliente escolhe material, cor da
--    cordinha etc. Preço e estoque continuam por produto.

-- ── 1. Hero ──────────────────────────────────────────────────

alter table public.products
  add column if not exists in_hero boolean not null default false,
  add column if not exists hero_order int not null default 0;

-- Ponto focal da foto, em % (0–100). 50/50 = centro, que é o
-- comportamento atual. É isso que resolve o enquadramento.
alter table public.product_images
  add column if not exists focal_x smallint not null default 50,
  add column if not exists focal_y smallint not null default 50;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_images_focal_range'
  ) then
    alter table public.product_images
      add constraint product_images_focal_range
      check (focal_x between 0 and 100 and focal_y between 0 and 100);
  end if;
end $$;

create index if not exists products_in_hero_idx
  on public.products (in_hero, hero_order);

-- ── 2. Variações ─────────────────────────────────────────────

-- Grupo de escolha: "Material", "Cor da cordinha"…
create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Valores do grupo: "Dourado", "Prata", "Marrom"…
create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options (id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create index if not exists product_options_product_idx
  on public.product_options (product_id);
create index if not exists product_option_values_option_idx
  on public.product_option_values (option_id);

alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;

-- Mesmo padrão do resto: leitura pública, escrita só admin.
drop policy if exists "product_options_select_public" on public.product_options;
create policy "product_options_select_public" on public.product_options
  for select using (true);

drop policy if exists "product_options_write_admin" on public.product_options;
create policy "product_options_write_admin" on public.product_options
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_option_values_select_public" on public.product_option_values;
create policy "product_option_values_select_public" on public.product_option_values
  for select using (true);

drop policy if exists "product_option_values_write_admin" on public.product_option_values;
create policy "product_option_values_write_admin" on public.product_option_values
  for all using (public.is_admin()) with check (public.is_admin());
