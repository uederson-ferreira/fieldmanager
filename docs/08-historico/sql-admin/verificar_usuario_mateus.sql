-- ===================================================================
-- VERIFICAR E CORRIGIR USUÁRIO MATEUS EVANGELISTA
-- Email: mateus.evangelista@turntown.com
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR SE O USUÁRIO EXISTE EM AMBAS AS TABELAS
-- ===================================================================

-- Verificar no auth.users
SELECT 
    'AUTH.USERS' as tabela,
    id as auth_user_id,
    email,
    created_at,
    updated_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '❌ Email não confirmado'
    END as email_status
FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- Verificar na tabela usuarios
SELECT 
    'PUBLIC.USUARIOS' as tabela,
    id,
    nome,
    email,
    senha,
    matricula,
    ativo,
    auth_user_id,
    created_at,
    updated_at,
    CASE 
        WHEN ativo = true THEN '✅ Ativo'
        ELSE '❌ Inativo'
    END as status
FROM public.usuarios 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 2. VERIFICAR MAPEAMENTO ENTRE AS TABELAS
-- ===================================================================

SELECT 
    'MAPEAMENTO' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users au 
            JOIN public.usuarios u ON au.id = u.auth_user_id 
            WHERE au.email = 'mateus.evangelista@turntown.com'
        ) THEN '✅ Mapeamento correto'
        ELSE '❌ Mapeamento incorreto'
    END as mapeamento,
    (SELECT id FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') as auth_id,
    (SELECT auth_user_id FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') as usuarios_auth_id;

-- ===================================================================
-- 3. CORRIGIR PROBLEMAS COMUNS
-- ===================================================================

-- 3.1. Confirmar email no auth.users (se necessário)
UPDATE auth.users 
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com' 
AND email_confirmed_at IS NULL;

-- 3.2. Ativar usuário na tabela usuarios (se necessário)
UPDATE public.usuarios 
SET ativo = true
WHERE email = 'mateus.evangelista@turntown.com' 
AND ativo = false;

-- 3.3. Corrigir senha na tabela usuarios (hash SHA-256 de "123456")
UPDATE public.usuarios 
SET 
    senha = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com';

-- 3.4. Corrigir mapeamento auth_user_id (se necessário)
UPDATE public.usuarios 
SET 
    auth_user_id = (SELECT id FROM auth.users WHERE email = 'mateus.evangelista@turntown.com'),
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com' 
AND auth_user_id IS NULL;

-- ===================================================================
-- 4. VERIFICAR APÓS CORREÇÕES
-- ===================================================================

SELECT 
    'VERIFICAÇÃO FINAL' as status,
    'Auth Users:' as info,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') as total_auth,
    'Usuarios:' as info2,
    (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') as total_usuarios,
    'Mapeamento:' as info3,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users au 
            JOIN public.usuarios u ON au.id = u.auth_user_id 
            WHERE au.email = 'mateus.evangelista@turntown.com'
        ) THEN '✅ OK'
        ELSE '❌ PROBLEMA'
    END as mapeamento_final;

-- ===================================================================
-- 5. DADOS PARA TESTE
-- ===================================================================

SELECT 
    'DADOS PARA TESTE' as info,
    'Email:' as campo1,
    'mateus.evangelista@turntown.com' as valor1,
    'Senha:' as campo2,
    '123456' as valor2,
    'Hash SHA-256:' as campo3,
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' as valor3;

-- ===================================================================
-- 6. RECRIAR USUÁRIO (SE NECESSÁRIO)
-- ===================================================================

/*
Se o problema persistir, execute este script para recriar o usuário:

-- 1. Excluir usuário existente
DELETE FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com';
DELETE FROM auth.users WHERE email = 'mateus.evangelista@turntown.com';

-- 2. Criar novo usuário no auth.users (manual)
-- 3. Executar o script de inserção novamente
*/ 