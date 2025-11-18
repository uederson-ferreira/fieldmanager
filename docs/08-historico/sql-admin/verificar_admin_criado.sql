-- ===================================================================
-- SCRIPT PARA VERIFICAR USUÁRIO ADMIN CRIADO - ECOFIELD SYSTEM
-- Localização: sql/verificar_admin_criado.sql
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR USUÁRIO NO AUTH.USERS
-- ===================================================================

SELECT '=== VERIFICANDO AUTH.USERS ===' as info;

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    'auth.users' as tabela
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
-- 2. VERIFICAR USUÁRIO NO PUBLIC.USUARIOS
-- ===================================================================

SELECT '=== VERIFICANDO PUBLIC.USUARIOS ===' as info;

SELECT 
    u.id,
    u.nome,
    u.email,
    u.matricula,
    u.ativo,
    u.auth_user_id,
    p.nome as perfil_nome,
    'public.usuarios' as tabela
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@ecofield.com';

-- ===================================================================
-- 3. VERIFICAR MAPEAMENTO ENTRE TABELAS
-- ===================================================================

SELECT '=== VERIFICANDO MAPEAMENTO ===' as info;

SELECT 
    au.id as auth_id,
    au.email as auth_email,
    pu.id as usuarios_id,
    pu.nome as usuarios_nome,
    pu.auth_user_id,
    pu.ativo,
    CASE 
        WHEN au.id = pu.auth_user_id THEN '✅ MAPEADO CORRETAMENTE'
        ELSE '❌ MAPEAMENTO INCORRETO'
    END as status_mapeamento
FROM auth.users au
LEFT JOIN public.usuarios pu ON au.id = pu.auth_user_id
WHERE au.email = 'admin@ecofield.com';

-- ===================================================================
-- 4. VERIFICAR SE USUÁRIO ESTÁ ATIVO
-- ===================================================================

SELECT '=== VERIFICANDO STATUS ATIVO ===' as info;

SELECT 
    u.nome,
    u.email,
    u.ativo,
    CASE 
        WHEN u.ativo = true THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END as status_ativo
FROM public.usuarios u
WHERE u.email = 'admin@ecofield.com';

-- ===================================================================
-- 5. VERIFICAR PERFIL ATRIBUÍDO
-- ===================================================================

SELECT '=== VERIFICANDO PERFIL ===' as info;

SELECT 
    u.nome,
    u.email,
    p.nome as perfil_nome,
    p.permissoes,
    CASE 
        WHEN p.nome IN ('ADM', 'admin', 'DESENVOLVEDOR') THEN '✅ PERFIL ADMIN'
        ELSE '⚠️ PERFIL NÃO ADMIN'
    END as status_perfil
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@ecofield.com';

-- ===================================================================
-- 6. TESTAR LOGIN VIA SUPABASE
-- ===================================================================

SELECT '=== TESTE DE LOGIN ===' as info;

-- Verificar se o usuário pode fazer login
SELECT 
    'admin@ecofield.com' as email,
    'admin123' as senha,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'admin@ecofield.com' 
            AND email_confirmed_at IS NOT NULL
        ) THEN '✅ EMAIL CONFIRMADO'
        ELSE '❌ EMAIL NÃO CONFIRMADO'
    END as status_email,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE email = 'admin@ecofield.com' 
            AND ativo = true
        ) THEN '✅ USUÁRIO ATIVO'
        ELSE '❌ USUÁRIO INATIVO'
    END as status_usuario;

-- ===================================================================
-- 7. RESUMO FINAL
-- ===================================================================

SELECT '=== RESUMO FINAL ===' as info;

SELECT 
    'VERIFICAÇÃO COMPLETA' as status,
    COUNT(DISTINCT au.id) as usuarios_auth,
    COUNT(DISTINCT pu.id) as usuarios_public,
    COUNT(DISTINCT CASE WHEN au.id = pu.auth_user_id THEN au.id END) as mapeamentos_corretos,
    CASE 
        WHEN COUNT(DISTINCT au.id) = 1 
        AND COUNT(DISTINCT pu.id) = 1 
        AND COUNT(DISTINCT CASE WHEN au.id = pu.auth_user_id THEN au.id END) = 1
        THEN '✅ TUDO OK'
        ELSE '❌ PROBLEMAS ENCONTRADOS'
    END as resultado
FROM auth.users au
FULL OUTER JOIN public.usuarios pu ON au.id = pu.auth_user_id
WHERE au.email = 'admin@ecofield.com' OR pu.email = 'admin@ecofield.com'; 