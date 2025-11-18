-- ===================================================================
-- RECRIAR USUÁRIO MATEUS EVANGELISTA DO ZERO
-- Email: mateus.evangelista@turntown.com
-- Senha: 123456
-- ===================================================================

-- ===================================================================
-- 1. LIMPAR USUÁRIO EXISTENTE
-- ===================================================================

-- Excluir da tabela usuarios
DELETE FROM public.usuarios 
WHERE email = 'mateus.evangelista@turntown.com';

-- Excluir do auth.users (se existir)
DELETE FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 2. VERIFICAR LIMPEZA
-- ===================================================================

SELECT 
    'LIMPEZA' as status,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') as auth_users,
    (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') as usuarios;

-- ===================================================================
-- 3. CRIAR NO AUTH.USERS (MANUAL)
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
5. Copie o ID do usuário criado
*/

-- ===================================================================
-- 4. OBTER AUTH_USER_ID
-- ===================================================================

-- Execute esta query após criar o usuário no auth.users
SELECT 
    'AUTH USER CRIADO' as status,
    id as auth_user_id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 5. INSERIR NA TABELA USUARIOS
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
-- 6. VERIFICAR CRIAÇÃO
-- ===================================================================

SELECT 
    'VERIFICAÇÃO FINAL' as status,
    'Auth Users:' as info,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') as auth_users,
    'Usuarios:' as info2,
    (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') as usuarios,
    'Mapeamento:' as info3,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users au 
            JOIN public.usuarios u ON au.id = u.auth_user_id 
            WHERE au.email = 'mateus.evangelista@turntown.com'
        ) THEN '✅ OK'
        ELSE '❌ PROBLEMA'
    END as mapeamento;

-- ===================================================================
-- 7. DADOS DO USUÁRIO CRIADO
-- ===================================================================

SELECT 
    'DADOS DO USUÁRIO' as info,
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
-- 8. TESTAR LOGIN
-- ===================================================================

/*
Para testar o login:

1. Acesse: https://ecofield.vercel.app
2. Faça login com:
   - Email: mateus.evangelista@turntown.com
   - Senha: 123456
3. Verifique se o usuário consegue acessar normalmente

Se ainda houver problemas, verifique:
- Se o email está confirmado no auth.users
- Se o usuário está ativo na tabela usuarios
- Se o mapeamento auth_user_id está correto
*/ 