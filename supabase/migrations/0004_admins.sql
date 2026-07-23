-- ============================================================
-- GABI BIJUS — Contas administradoras (rodar APÓS criar os
-- usuários em Authentication → Users, com Auto Confirm)
-- ============================================================

-- 1) Registra os dois e-mails autorizados no painel
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email in (
  'EMAIL_ADMIN_1',           -- Gabi (principal)
  'EMAIL_ADMIN_2'   -- assistente
)
on conflict (user_id) do nothing;

-- 2) Remove a conta de teste (se ainda existir)
delete from public.admin_users where email = 'admin-teste@gabibijus.com';

-- 3) Confira o resultado — devem aparecer só os dois e-mails acima
select email, created_at from public.admin_users order by created_at;
