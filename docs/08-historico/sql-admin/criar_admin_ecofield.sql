-- ===================================================================
-- SCRIPT PARA CRIAR USUÁRIO ADMIN - ECOFIELD SYSTEM
-- Localização: sql/criar_admin_ecofield.sql
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR SE USUÁRIO JÁ EXISTE
-- ===================================================================

SELECT '=== VERIFICANDO USUÁRIO EXISTENTE ===' as info;

-- Verificar se já existe no auth.users
SELECT 
    id,
    email,
    created_at,
    'auth.users' as tabela
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- Verificar se já existe no public.usuarios
SELECT 
    id,
    nome,
    email,
    perfil_id,
    auth_user_id,
    ativo,
    'public.usuarios' as tabela
FROM public.usuarios 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
-- 2. CRIAR USUÁRIO ADMIN
-- ===================================================================

SELECT '=== CRIANDO USUÁRIO ADMIN ===' as info;

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
    
    -- Verificar se já existe usuário admin
    IF EXISTS (
        SELECT 1 FROM public.usuarios u
        WHERE u.email = 'admin@ecofield.com'
    ) THEN
        RAISE NOTICE 'ℹ️ Usuário admin@ecofield.com já existe na tabela usuarios';
        
        -- Atualizar usuário existente
        UPDATE public.usuarios SET
            nome = 'Administrador EcoField',
            senha = 'admin123',
            matricula = 'ADM001',
            perfil_id = admin_perfil_id,
            ativo = TRUE,
            updated_at = NOW()
        WHERE email = 'admin@ecofield.com';
        
        RAISE NOTICE '✅ Usuário admin@ecofield.com atualizado';
    ELSE
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
        
        -- Verificar se matrícula ADM001 já existe
        IF EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.matricula = 'ADM001' AND u.email != 'admin@ecofield.com'
        ) THEN
            RAISE NOTICE '⚠️ Matrícula ADM001 já existe, usando matrícula alternativa';
            
            -- Criar usuário admin na tabela usuarios com matrícula alternativa
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
                'ADM_' || SUBSTRING(admin_auth_id::text, 1, 8),
                NULL,
                admin_perfil_id,
                admin_auth_id,
                TRUE,
                NOW(),
                NOW()
            );
        ELSE
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
        END IF;
        
        RAISE NOTICE '✅ Usuário criado no public.usuarios';
        RAISE NOTICE '✅ Usuário admin criado com sucesso: admin@ecofield.com / admin123';
    END IF;
END $$;

-- ===================================================================
-- 3. VERIFICAR RESULTADO
-- ===================================================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

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
    p.nome as perfil_nome,
    u.auth_user_id,
    'public.usuarios' as tabela
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@ecofield.com';

-- ===================================================================
-- 4. CREDENCIAIS PARA TESTE
-- ===================================================================

SELECT '=== CREDENCIAIS PARA TESTE ===' as info;

SELECT 
    'ADMIN ECOFIELD' as tipo,
    'admin@ecofield.com' as email,
    'admin123' as senha,
    'Administrador EcoField' as nome,
    'ADM001' as matricula;

-- ===================================================================
-- 5. RESUMO FINAL
-- ===================================================================

SELECT '=== RESUMO FINAL ===' as info;

SELECT 
    'USUÁRIO ADMIN CRIADO' as status,
    COUNT(*) as total_usuarios_admin,
    COUNT(auth_user_id) as usuarios_mapeados,
    CASE 
        WHEN COUNT(auth_user_id) = COUNT(*) THEN '✅ SUCESSO'
        ELSE '⚠️ VERIFICAR MAPEAMENTO'
    END as resultado
FROM public.usuarios 
WHERE email = 'admin@ecofield.com'; 