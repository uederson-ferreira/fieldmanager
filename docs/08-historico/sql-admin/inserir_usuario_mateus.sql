-- ===================================================================
-- INSERIR NOVO USUÁRIO MATEUS EVANGELISTA - ECOFIELD SYSTEM
-- Email: mateus.evangelista@turntown.com
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR SE O EMAIL JÁ EXISTE
-- ===================================================================

SELECT 
    'VERIFICAÇÃO INICIAL' as status,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') as auth_users,
    (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') as usuarios;

-- ===================================================================
-- 2. INSERIR NO AUTH.USERS (MANUAL)
-- ===================================================================

/*
Para inserir no auth.users:

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/auth/users
2. Clique em "Add user"
3. Preencha:
   - Email: mateus.evangelista@turntown.com
   - Password: 123456
   - Email confirm: true
4. Clique em "Create user"

OU use a API do Supabase:

curl -X POST "https://[SEU_PROJECT_ID].supabase.co/auth/v1/admin/users" \
  -H "apikey: [SUA_SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SUA_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mateus.evangelista@turntown.com",
    "password": "123456",
    "email_confirm": true
  }'
*/

-- ===================================================================
-- 3. OBTER O AUTH_USER_ID CRIADO
-- ===================================================================

-- Execute esta query após criar o usuário no auth.users
SELECT 
    'AUTH USER CRIADO' as status,
    id as auth_user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 4. INSERIR NA TABELA USUARIOS
-- ===================================================================

-- Substitua [AUTH_USER_ID] pelo ID retornado na query anterior
INSERT INTO public.usuarios (
    nome,
    email,
    senha,
    matricula,
    telefone,
    perfil_id,
    empresa_id,
    ativo,
    auth_user_id,
    created_at,
    updated_at
) VALUES (
    'Mateus Evangelista',
    'mateus.evangelista@turntown.com',
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', -- hash de "123456"
    'TMA001',
    '(11) 99999-9999',
    (SELECT id FROM public.perfis WHERE nome = 'TMA Campo' LIMIT 1),
    (SELECT id FROM public.empresas_contratadas WHERE nome LIKE '%Turntown%' LIMIT 1),
    true,
    '[AUTH_USER_ID]', -- Substitua pelo ID real
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ===================================================================
-- 5. VERIFICAR INSERÇÃO
-- ===================================================================

SELECT 
    'VERIFICAÇÃO FINAL' as status,
    id,
    nome,
    email,
    matricula,
    ativo,
    auth_user_id,
    created_at
FROM public.usuarios 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 6. SCRIPT COMPLETO AUTOMÁTICO (ALTERNATIVA)
-- ===================================================================

/*
-- Se você já tem o auth_user_id, use este script completo:

INSERT INTO public.usuarios (
    nome,
    email,
    senha,
    matricula,
    telefone,
    perfil_id,
    empresa_id,
    ativo,
    auth_user_id,
    created_at,
    updated_at
) VALUES (
    'Mateus Evangelista',
    'mateus.evangelista@turntown.com',
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    'TMA001',
    '(11) 99999-9999',
    (SELECT id FROM public.perfis WHERE nome = 'TMA Campo' LIMIT 1),
    (SELECT id FROM public.empresas_contratadas WHERE nome LIKE '%Turntown%' LIMIT 1),
    true,
    'NOVO_AUTH_USER_ID_AQUI', -- Substitua pelo ID real
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
*/ 