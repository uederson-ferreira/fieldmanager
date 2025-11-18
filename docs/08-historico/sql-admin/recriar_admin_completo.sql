-- ===================================================================
-- SCRIPT PARA RECRIAR USUÁRIO ADMIN COMPLETO - ECOFIELD SYSTEM
-- Localização: sql/recriar_admin_completo.sql
-- ===================================================================

-- ===================================================================
-- 1. DELETAR USUÁRIO EXISTENTE
-- ===================================================================

SELECT '=== DELETANDO USUÁRIO EXISTENTE ===' as info;

-- Deletar da tabela public.usuarios
DELETE FROM public.usuarios 
WHERE email = 'admin@ecofield.com';

-- Deletar da tabela auth.users
DELETE FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- Verificar se foi deletado
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users 
WHERE email = 'admin@ecofield.com'

UNION ALL

SELECT 
    'public.usuarios' as tabela,
    COUNT(*) as total
FROM public.usuarios 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
-- 2. CRIAR USUÁRIO NOVO COMPLETO
-- ===================================================================

SELECT '=== CRIANDO USUÁRIO NOVO ===' as info;

DO $$
DECLARE
    admin_perfil_id UUID;
    admin_auth_id UUID;
BEGIN
    -- Buscar perfil admin
    SELECT id INTO admin_perfil_id 
    FROM public.perfis 
    WHERE nome IN ('ADM', 'admin', 'DESENVOLVEDOR') 
    LIMIT 1;
    
    -- Se não existir perfil admin, usar o primeiro disponível
    IF admin_perfil_id IS NULL THEN
        SELECT id INTO admin_perfil_id FROM public.perfis LIMIT 1;
        RAISE NOTICE '⚠️ Perfil admin não encontrado, usando perfil: %', admin_perfil_id;
    END IF;
    
    -- Criar usuário admin no auth.users
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        gen_random_uuid(),
        'admin@ecofield.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"nome":"Administrador EcoField","matricula":"ADM001"}',
        FALSE,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_auth_id;
    
    RAISE NOTICE '✅ Usuário criado no auth.users com ID: %', admin_auth_id;
    
    -- Criar usuário admin na tabela usuarios
    INSERT INTO public.usuarios (
        nome,
        email,
        senha,
        matricula,
        telefone,
        perfil_id,
        auth_user_id,
        ativo,
        created_at,
        updated_at
    ) VALUES (
        'Administrador EcoField',
        'admin@ecofield.com',
        'admin123',
        'ADM001',
        NULL,
        admin_perfil_id,
        admin_auth_id,
        TRUE,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Usuário criado no public.usuarios';
    RAISE NOTICE '✅ Usuário admin recriado com sucesso: admin@ecofield.com / admin123';
END $$;

-- ===================================================================
-- 3. VERIFICAR CRIAÇÃO
-- ===================================================================

SELECT '=== VERIFICANDO CRIAÇÃO ===' as info;

-- Verificar usuário no auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    'auth.users' as tabela
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- Verificar usuário no public.usuarios
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
-- 4. VERIFICAR MAPEAMENTO
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
-- 5. TESTE FINAL
-- ===================================================================

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
-- 6. INSTRUÇÕES PARA TESTE
-- ===================================================================

SELECT '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    'Para testar o login:' as instrucao,
    '1. Recarregue a página (F5)' as passo1,
    '2. Digite: admin@ecofield.com' as passo2,
    '3. Digite: admin123' as passo3,
    '4. Clique em Entrar' as passo4,
    '5. Se não funcionar, verifique o console' as passo5; 