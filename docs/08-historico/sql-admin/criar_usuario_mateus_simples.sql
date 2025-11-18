-- ===================================================================
-- CRIAR USUÁRIO MATEUS EVANGELISTA - VERSÃO SIMPLES
-- Email: mateus.evangelista@turntown.com
-- Senha: 123456
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR SE EMAIL JÁ EXISTE
-- ===================================================================

SELECT 
    'VERIFICAÇÃO' as status,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') > 0 
        THEN '❌ Email já existe no auth.users'
        ELSE '✅ Email disponível no auth.users'
    END as auth_users,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') > 0 
        THEN '❌ Email já existe na tabela usuarios'
        ELSE '✅ Email disponível na tabela usuarios'
    END as usuarios;

-- ===================================================================
-- 2. CRIAR NO AUTH.USERS (MANUAL)
-- ===================================================================

/*
PASSO 1: Criar no Supabase Auth

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/auth/users
2. Clique em "Add user"
3. Preencha:
   - Email: mateus.evangelista@turntown.com
   - Password: 123456
   - Email confirm: ✓ (marcado)
4. Clique em "Create user"
5. Copie o ID do usuário criado (será algo como: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
*/

-- ===================================================================
-- 3. OBTER AUTH_USER_ID
-- ===================================================================

-- Execute esta query após criar o usuário no auth.users
SELECT 
    'AUTH USER ID' as info,
    id as auth_user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 4. INSERIR NA TABELA USUARIOS
-- ===================================================================

-- Substitua 'AUTH_USER_ID_AQUI' pelo ID real obtido na query anterior
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
    'AUTH_USER_ID_AQUI', -- ⚠️ SUBSTITUA PELO ID REAL
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ===================================================================
-- 5. VERIFICAR CRIAÇÃO
-- ===================================================================

SELECT 
    'USUÁRIO CRIADO' as status,
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
-- 6. TESTAR LOGIN
-- ===================================================================

/*
Para testar o login:

1. Acesse o sistema: https://ecofield.vercel.app
2. Faça login com:
   - Email: mateus.evangelista@turntown.com
   - Senha: 123456
3. Verifique se o usuário consegue acessar normalmente
*/ 