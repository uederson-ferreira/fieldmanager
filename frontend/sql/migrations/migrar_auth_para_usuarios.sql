-- ===================================================================
-- MIGRAR DADOS DO AUTH.USERS PARA USUARIOS - ECOFIELD
-- Localização: sql/migrar_auth_para_usuarios.sql
-- ===================================================================

-- Este script migra os dados do auth.users para a tabela usuarios
-- criando a correspondência necessária para a arquitetura híbrida

-- ===================================================================
-- 1. VERIFICAR DADOS NO AUTH.USERS
-- ===================================================================

-- Verificar quantos usuários existem no auth.users
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as usuarios_confirmados
FROM auth.users;

-- Listar usuários do auth.users
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at;

-- ===================================================================
-- 2. VERIFICAR PERFIS DISPONÍVEIS
-- ===================================================================

-- Verificar perfis existentes
SELECT 
    id,
    nome,
    descricao,
    permissoes
FROM public.perfis
ORDER BY nome;

-- ===================================================================
-- 3. MIGRAR USUÁRIOS DO AUTH PARA USUARIOS
-- ===================================================================

-- Inserir usuários do auth.users na tabela usuarios
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
-- 4. VERIFICAR MIGRAÇÃO
-- ===================================================================

-- Verificar quantos usuários foram migrados
SELECT 
    'AUTH.USERS' as origem,
    COUNT(*) as total
FROM auth.users
WHERE email IS NOT NULL

UNION ALL

SELECT 
    'USUARIOS' as origem,
    COUNT(*) as total
FROM public.usuarios;

-- Verificar mapeamento
SELECT 
    u.id,
    u.nome,
    u.email,
    u.matricula,
    u.auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created,
    p.nome as perfil_nome
FROM public.usuarios u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
LEFT JOIN public.perfis p ON u.perfil_id = p.id
ORDER BY u.nome;

-- ===================================================================
-- 5. ATUALIZAR SENHAS (OPCIONAL)
-- ===================================================================

-- Se você quiser definir senhas padrão para os usuários migrados
-- Descomente e ajuste conforme necessário:

/*
UPDATE public.usuarios 
SET senha = '123456'  -- Senha padrão
WHERE senha LIKE 'senha_temporaria_%';
*/

-- ===================================================================
-- 6. CRIAR USUÁRIOS ADMIN (SE NECESSÁRIO)
-- ===================================================================

-- Se não existir usuário admin, criar um
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
        
        RAISE NOTICE 'Usuário admin criado: admin@ecofield.com / admin123';
    END IF;
END $$;

-- ===================================================================
-- 7. RESUMO FINAL
-- ===================================================================

SELECT 
    'MIGRAÇÃO CONCLUÍDA' as status,
    COUNT(*) as total_usuarios,
    COUNT(auth_user_id) as usuarios_mapeados,
    COUNT(*) - COUNT(auth_user_id) as usuarios_sem_mapeamento
FROM public.usuarios; 