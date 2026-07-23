-- ============================================================
-- GABI BIJUS — Cupons de desconto
-- Tabela protegida (ninguém lista códigos por fora) +
-- função de validação chamada pelo site.
-- ============================================================

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('percent', 'fixed')),
  value numeric(10, 2) not null check (value > 0),
  min_subtotal numeric(10, 2) check (min_subtotal is null or min_subtotal >= 0),
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

-- Só admins enxergam/gerenciam a lista de cupons
create policy "coupons_select_admin" on public.coupons
  for select using (public.is_admin());
create policy "coupons_write_admin" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Validação pública de UM código por vez (sem expor a lista):
-- retorna o cupom apenas se ativo e dentro da validade.
create or replace function public.validar_cupom(codigo text)
returns table (code text, kind text, value numeric, min_subtotal numeric)
language sql
stable
security definer
set search_path = public
as $$
  select c.code, c.kind, c.value, c.min_subtotal
  from public.coupons c
  where upper(c.code) = upper(trim(codigo))
    and c.active
    and (c.ends_at is null or c.ends_at >= now());
$$;

revoke all on function public.validar_cupom(text) from public;
grant execute on function public.validar_cupom(text) to anon, authenticated;

-- Cupom de exemplo (10% off), pra testar — a lojista pode excluir
insert into public.coupons (code, kind, value)
values ('VERAO10', 'percent', 10);
