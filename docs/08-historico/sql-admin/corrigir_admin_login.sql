-- ===================================================================
// SCRIPT PARA CORRIGIR PROBLEMAS DE LOGIN DO ADMIN - ECOFIELD SYSTEM
// Localização: sql/corrigir_admin_login.sql
// ===================================================================

-- ===================================================================
// 1. VERIFICAR E CORRIGIR EMAIL CONFIRMADO
// ===================================================================

SELECT '=== CORRIGINDO EMAIL CONFIRMADO ===' as info;

-- Atualizar email_confirmed_at se estiver NULL
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@ecofield.com' 
AND email_confirmed_at IS NULL;

-- Verificar se foi corrigido
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ CONFIRMADO'
        ELSE '❌ NÃO CONFIRMADO'
    END as status
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
// 2. VERIFICAR E CORRIGIR USUÁRIO ATIVO
// ===================================================================

SELECT '=== CORRIGINDO USUÁRIO ATIVO ===' as info;

-- Atualizar usuário para ativo se estiver inativo
UPDATE public.usuarios 
SET ativo = TRUE, updated_at = NOW()
WHERE email = 'admin@ecofield.com' 
AND ativo = FALSE;

-- Verificar se foi corrigido
SELECT 
    nome,
    email,
    ativo,
    CASE 
        WHEN ativo = true THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END as status
FROM public.usuarios 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
// 3. VERIFICAR E CORRIGIR MAPEAMENTO AUTH_USER_ID
// ===================================================================

SELECT '=== CORRIGINDO MAPEAMENTO ===' as info;

-- Buscar auth_user_id correto
DO $$
DECLARE
    auth_id UUID;
    usuarios_id UUID;
BEGIN
    -- Buscar ID do auth.users
    SELECT id INTO auth_id 
    FROM auth.users 
    WHERE email = 'admin@ecofield.com';
    
    -- Buscar ID do public.usuarios
    SELECT id INTO usuarios_id 
    FROM public.usuarios 
    WHERE email = 'admin@ecofield.com';
    
    -- Atualizar auth_user_id se necessário
    IF auth_id IS NOT NULL AND usuarios_id IS NOT NULL THEN
        UPDATE public.usuarios 
        SET auth_user_id = auth_id, updated_at = NOW()
        WHERE id = usuarios_id 
        AND (auth_user_id IS NULL OR auth_user_id != auth_id);
        
        RAISE NOTICE '✅ Mapeamento corrigido: auth_user_id = %', auth_id;
    ELSE
        RAISE NOTICE '❌ Não foi possível corrigir mapeamento';
    END IF;
END $$;

-- Verificar mapeamento
SELECT 
    au.id as auth_id,
    pu.id as usuarios_id,
    pu.auth_user_id,
    CASE 
        WHEN au.id = pu.auth_user_id THEN '✅ MAPEADO CORRETAMENTE'
        ELSE '❌ MAPEAMENTO INCORRETO'
    END as status_mapeamento
FROM auth.users au
LEFT JOIN public.usuarios pu ON au.email = pu.email
WHERE au.email = 'admin@ecofield.com';

-- ===================================================================
// 4. VERIFICAR E CORRIGIR PERFIL ADMIN
// ===================================================================

SELECT '=== CORRIGINDO PERFIL ADMIN ===' as info;

-- Buscar perfil admin
DO $$
DECLARE
    admin_perfil_id UUID;
    usuarios_id UUID;
BEGIN
    -- Buscar perfil admin
    SELECT id INTO admin_perfil_id 
    FROM public.perfis 
    WHERE nome IN ('ADM', 'admin', 'DESENVOLVEDOR') 
    LIMIT 1;
    
    -- Buscar ID do usuário
    SELECT id INTO usuarios_id 
    FROM public.usuarios 
    WHERE email = 'admin@ecofield.com';
    
    -- Atualizar perfil se necessário
    IF admin_perfil_id IS NOT NULL AND usuarios_id IS NOT NULL THEN
        UPDATE public.usuarios 
        SET perfil_id = admin_perfil_id, updated_at = NOW()
        WHERE id = usuarios_id;
        
        RAISE NOTICE '✅ Perfil admin atribuído: perfil_id = %', admin_perfil_id;
    ELSE
        RAISE NOTICE '❌ Não foi possível atribuir perfil admin';
    END IF;
END $$;

-- Verificar perfil
SELECT 
    u.nome,
    u.email,
    p.nome as perfil_nome,
    CASE 
        WHEN p.nome IN ('ADM', 'admin', 'DESENVOLVEDOR') THEN '✅ PERFIL ADMIN'
        ELSE '⚠️ PERFIL NÃO ADMIN'
    END as status_perfil
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@ecofield.com';

-- ===================================================================
// 5. VERIFICAR SENHA
// ===================================================================

SELECT '=== VERIFICANDO SENHA ===' as info;

-- Verificar se a senha está correta (não podemos ver a senha criptografada)
SELECT 
    email,
    encrypted_password,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✅ SENHA DEFINIDA'
        ELSE '❌ SENHA NÃO DEFINIDA'
    END as status_senha
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
// 6. TESTE FINAL DE LOGIN
// ===================================================================

SELECT '=== TESTE FINAL ===' as info;

SELECT 
    'admin@ecofield.com' as email,
    'admin123' as senha,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'admin@ecofield.com' 
            AND email_confirmed_at IS NOT NULL
            AND encrypted_password IS NOT NULL
        ) THEN '✅ AUTH OK'
        ELSE '❌ AUTH PROBLEMA'
    END as status_auth,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE email = 'admin@ecofield.com' 
            AND ativo = true
            AND auth_user_id IS NOT NULL
        ) THEN '✅ USUARIOS OK'
        ELSE '❌ USUARIOS PROBLEMA'
    END as status_usuarios;

-- ===================================================================
// 7. INSTRUÇÕES PARA TESTE
// ===================================================================

SELECT '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    'Para testar o login:' as instrucao,
    '1. Vá para a tela de login' as passo1,
    '2. Digite: admin@ecofield.com' as passo2,
    '3. Digite: admin123' as passo3,
    '4. Clique em Entrar' as passo4,
    '5. Se não funcionar, verifique o console do navegador' as passo5; 