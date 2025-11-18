-- ===================================================================
-- ALTERAR SENHA DO USUÁRIO - VERSÃO SIMPLES
-- Usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
-- ===================================================================

-- 1. Verificar usuário
SELECT 'USUÁRIO ATUAL:' as info, id, nome, email, ativo 
FROM public.usuarios 
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- 2. Alterar senha para "123456" (texto plano)
UPDATE public.usuarios 
SET 
    senha = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    updated_at = CURRENT_TIMESTAMP
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- 3. Verificar alteração
SELECT 'SENHA ALTERADA:' as info, id, nome, email, senha, updated_at
FROM public.usuarios 
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- IMPORTANTE: ALTERAR TAMBÉM NO SUPABASE AUTH
-- ===================================================================

/*
Para alterar no Supabase Auth:

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/auth/users
2. Encontre o usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
3. Clique em "..." → "Edit"
4. Altere a senha para: "123456"
5. Salve as alterações

OU use a API do Supabase:

curl -X PUT "https://[SEU_PROJECT_ID].supabase.co/auth/v1/admin/users/94af2236-8c8e-4c91-914b-e16fb3775d84" \
  -H "apikey: [SUA_SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SUA_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"password": "123456"}'
*/ 