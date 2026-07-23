-- ============================================================
-- GABI BIJUS — Contas administradoras
--
-- Rode APÓS criar os usuários no dashboard do Supabase
-- (Authentication → Users → Add user, com "Auto Confirm User").
-- Troque os e-mails abaixo pelos reais antes de executar.
-- ============================================================

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email in (
  'EMAIL_ADMIN_1',  -- lojista (conta principal)
  'EMAIL_ADMIN_2'   -- assistente
)
on conflict (user_id) do nothing;

-- Remove a conta de teste, se ainda existir
delete from public.admin_users where email = 'admin-teste@gabibijus.com';

-- Confira o resultado — devem aparecer só os e-mails autorizados
select email, created_at from public.admin_users order by created_at;
