-- ===================================================================
-- DEBUG COMPLETO DO LOGIN - MATEUS EVANGELISTA
-- Email: mateus.evangelista@turntown.com
-- Senha: 123456
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAÇÃO COMPLETA DO USUÁRIO
-- ===================================================================

-- 1.1. Verificar auth.users
SELECT 
    'AUTH.USERS - VERIFICAÇÃO' as secao,
    id as auth_user_id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '❌ Email NÃO confirmado'
    END as email_status,
    CASE 
        WHEN created_at IS NOT NULL THEN '✅ Usuário criado'
        ELSE '❌ Usuário NÃO criado'
    END as criacao_status
FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- 1.2. Verificar public.usuarios
SELECT 
    'PUBLIC.USUARIOS - VERIFICAÇÃO' as secao,
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
        WHEN ativo = true THEN '✅ Usuário ativo'
        ELSE '❌ Usuário inativo'
    END as status_ativo,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ Mapeamento OK'
        ELSE '❌ Sem mapeamento'
    END as mapeamento_status
FROM public.usuarios 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 2. VERIFICAR MAPEAMENTO ENTRE TABELAS
-- ===================================================================

SELECT 
    'MAPEAMENTO - VERIFICAÇÃO' as secao,
    au.id as auth_id,
    au.email as auth_email,
    au.email_confirmed_at,
    u.id as usuarios_id,
    u.nome as usuarios_nome,
    u.auth_user_id as usuarios_auth_id,
    u.ativo as usuarios_ativo,
    CASE 
        WHEN au.id = u.auth_user_id THEN '✅ Mapeamento correto'
        ELSE '❌ Mapeamento incorreto'
    END as mapeamento_status
FROM auth.users au
LEFT JOIN public.usuarios u ON au.id = u.auth_user_id
WHERE au.email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 3. VERIFICAR SENHA E HASH
-- ===================================================================

SELECT 
    'SENHA - VERIFICAÇÃO' as secao,
    'Senha fornecida:' as info1,
    '123456' as senha_original,
    'Hash esperado:' as info2,
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' as hash_esperado,
    'Hash atual:' as info3,
    (SELECT senha FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') as hash_atual,
    CASE 
        WHEN (SELECT senha FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' 
        THEN '✅ Hash correto'
        ELSE '❌ Hash incorreto'
    END as hash_status;

-- ===================================================================
-- 4. VERIFICAR PERFIL E EMPRESA
-- ===================================================================

SELECT 
    'PERFIL E EMPRESA - VERIFICAÇÃO' as secao,
    u.nome as usuario_nome,
    u.email as usuario_email,
    p.nome as perfil_nome,
    e.nome as empresa_nome,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Perfil encontrado'
        ELSE '❌ Perfil não encontrado'
    END as perfil_status,
    CASE 
        WHEN e.id IS NOT NULL THEN '✅ Empresa encontrada'
        ELSE '❌ Empresa não encontrada'
    END as empresa_status
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
LEFT JOIN public.empresas_contratadas e ON u.empresa_id = e.id
WHERE u.email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 5. CORREÇÕES AUTOMÁTICAS
-- ===================================================================

-- 5.1. Confirmar email se necessário
UPDATE auth.users 
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com' 
AND email_confirmed_at IS NULL;

-- 5.2. Ativar usuário se necessário
UPDATE public.usuarios 
SET ativo = true
WHERE email = 'mateus.evangelista@turntown.com' 
AND ativo = false;

-- 5.3. Corrigir senha se necessário
UPDATE public.usuarios 
SET 
    senha = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com';

-- 5.4. Corrigir mapeamento se necessário
UPDATE public.usuarios 
SET 
    auth_user_id = (SELECT id FROM auth.users WHERE email = 'mateus.evangelista@turntown.com'),
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com' 
AND auth_user_id IS NULL;

-- ===================================================================
-- 6. VERIFICAÇÃO FINAL APÓS CORREÇÕES
-- ===================================================================

SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    'Status do login:' as info,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') > 0 
        AND (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') > 0
        AND (SELECT email_confirmed_at FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') IS NOT NULL
        AND (SELECT ativo FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') = true
        AND (SELECT senha FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
        THEN '✅ TUDO OK - Login deve funcionar'
        ELSE '❌ AINDA HÁ PROBLEMAS'
    END as status_final;

-- ===================================================================
-- 7. DADOS PARA TESTE NO FRONTEND
-- ===================================================================

SELECT 
    'DADOS PARA TESTE' as secao,
    'Email:' as campo1,
    'mateus.evangelista@turntown.com' as valor1,
    'Senha:' as campo2,
    '123456' as valor2,
    'Hash SHA-256:' as campo3,
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' as valor3,
    'Status:' as campo4,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') > 0 
        AND (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') > 0
        THEN '✅ Usuário pronto para login'
        ELSE '❌ Usuário com problemas'
    END as valor4; 