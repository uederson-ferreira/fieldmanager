-- ===================================================================
-- EXECUTAR MIGRAÇÃO COMPLETA - ECOFIELD
-- Localização: sql/executar_migracao_completa.sql
-- ===================================================================

-- Este script executa a migração completa e verifica o resultado

-- ===================================================================
-- 1. VERIFICAR ESTADO ATUAL
-- ===================================================================

SELECT '=== ESTADO ATUAL ===' as info;

-- Verificar auth.users
SELECT 
    'AUTH.USERS' as tabela,
    COUNT(*) as total
FROM auth.users
WHERE email IS NOT NULL;

-- Verificar usuarios
SELECT 
    'USUARIOS' as tabela,
    COUNT(*) as total,
    COUNT(auth_user_id) as mapeados
FROM public.usuarios;

-- ===================================================================
-- 2. EXECUTAR MIGRAÇÃO
-- ===================================================================

SELECT '=== EXECUTANDO MIGRAÇÃO ===' as info;

-- Migrar usuários do auth.users para usuarios
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
)
SELECT 
    -- Nome: usar metadata ou email como fallback
    COALESCE(
        (raw_user_meta_data->>'nome'),
        SPLIT_PART(email, '@', 1)
    ) as nome,
    
    -- Email
    email,
    
    -- Senha: placeholder (não temos acesso à senha criptografada)
    'senha_temporaria_' || id as senha,
    
    -- Matrícula: usar metadata ou gerar
    COALESCE(
        (raw_user_meta_data->>'matricula'),
        'AUTH_' || SUBSTRING(id::text, 1, 8)
    ) as matricula,
    
    -- Telefone: usar metadata
    (raw_user_meta_data->>'telefone') as telefone,
    
    -- Perfil: usar metadata ou padrão TMA
    COALESCE(
        (SELECT id FROM public.perfis WHERE nome = (raw_user_meta_data->>'perfil')),
        (SELECT id FROM public.perfis WHERE nome = 'TMA' LIMIT 1),
        (SELECT id FROM public.perfis LIMIT 1)
    ) as perfil_id,
    
    -- Auth User ID (mapeamento)
    id as auth_user_id,
    
    -- Ativo
    TRUE as ativo,
    
    -- Timestamps
    created_at,
    NOW() as updated_at

FROM auth.users
WHERE email IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.usuarios u 
    WHERE u.auth_user_id = auth.users.id
);

-- ===================================================================
-- 3. CRIAR USUÁRIO ADMIN (SE NECESSÁRIO)
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
    WHERE nome IN ('admin', 'ADM', 'DESENVOLVEDOR') 
    LIMIT 1;
    
    -- Se não existir perfil admin, usar o primeiro disponível
    IF admin_perfil_id IS NULL THEN
        SELECT id INTO admin_perfil_id FROM public.perfis LIMIT 1;
    END IF;
    
    -- Verificar se já existe usuário admin
    IF NOT EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.perfis p ON u.perfil_id = p.id
        WHERE p.nome IN ('admin', 'ADM', 'DESENVOLVEDOR')
    ) THEN
        -- Criar usuário admin no auth.users
        INSERT INTO auth.users (
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
            'admin@ecofield.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"nome":"Administrador","matricula":"ADM001"}',
            FALSE,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_auth_id;
        
        -- Criar usuário admin na tabela usuarios
        INSERT INTO public.usuarios (
            nome,
            email,
            senha,
            matricula,
            perfil_id,
            auth_user_id,
            ativo,
            created_at,
            updated_at
        ) VALUES (
            'Administrador Sistema',
            'admin@ecofield.com',
            'admin123',
            'ADM001',
            admin_perfil_id,
            admin_auth_id,
            TRUE,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Usuário admin criado: admin@ecofield.com / admin123';
    ELSE
        RAISE NOTICE 'ℹ️ Usuário admin já existe';
    END IF;
END $$;

-- ===================================================================
-- 4. VERIFICAR RESULTADO
-- ===================================================================

SELECT '=== RESULTADO FINAL ===' as info;

-- Verificar mapeamento
SELECT 
    u.id,
    u.nome,
    u.email,
    u.matricula,
    CASE 
        WHEN u.auth_user_id IS NOT NULL THEN '✅ Mapeado'
        ELSE '❌ Não mapeado'
    END as status_mapeamento,
    p.nome as perfil_nome
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
ORDER BY u.nome;

-- Resumo final
SELECT 
    'MIGRAÇÃO CONCLUÍDA' as status,
    COUNT(*) as total_usuarios,
    COUNT(auth_user_id) as usuarios_mapeados,
    COUNT(*) - COUNT(auth_user_id) as usuarios_sem_mapeamento,
    CASE 
        WHEN COUNT(auth_user_id) = COUNT(*) THEN '✅ SUCESSO'
        WHEN COUNT(auth_user_id) > 0 THEN '⚠️ PARCIAL'
        ELSE '❌ FALHA'
    END as resultado
FROM public.usuarios;

-- ===================================================================
-- 5. CREDENCIAIS PARA TESTE
-- ===================================================================

SELECT '=== CREDENCIAIS PARA TESTE ===' as info;

SELECT 
    'ADMIN' as tipo,
    'admin@ecofield.com' as email,
    'admin123' as senha,
    'Administrador Sistema' as nome

UNION ALL

SELECT 
    'USUÁRIOS MIGRADOS' as tipo,
    email,
    'senha_temporaria_' || SUBSTRING(auth_user_id::text, 1, 8) as senha,
    nome
FROM public.usuarios 
WHERE auth_user_id IS NOT NULL
AND email != 'admin@ecofield.com'
LIMIT 3; 