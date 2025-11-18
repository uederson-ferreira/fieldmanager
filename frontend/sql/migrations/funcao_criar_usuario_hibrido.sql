-- ===================================================================
-- FUNÇÃO PARA CRIAR USUÁRIO HÍBRIDO - ECOFIELD
-- Localização: sql/funcao_criar_usuario_hibrido.sql
-- ===================================================================

-- Esta função facilita a criação de usuários na arquitetura híbrida
-- Cria o registro em auth.users e mapeia para usuarios

CREATE OR REPLACE FUNCTION criar_usuario_hibrido(
    p_email TEXT,
    p_senha TEXT,
    p_nome TEXT,
    p_matricula TEXT DEFAULT NULL,
    p_telefone TEXT DEFAULT NULL,
    p_perfil_id UUID DEFAULT NULL,
    p_empresa_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auth_user_id UUID;
    v_usuario_id UUID;
    v_perfil_padrao_id UUID;
BEGIN
    -- Verificar se o usuário já existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'Usuário com email % já existe', p_email;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = p_email) THEN
        RAISE EXCEPTION 'Usuário com email % já existe na tabela usuarios', p_email;
    END IF;
    
    -- Obter perfil padrão se não especificado
    IF p_perfil_id IS NULL THEN
        SELECT id INTO v_perfil_padrao_id 
        FROM public.perfis 
        WHERE nome = 'TMA' 
        LIMIT 1;
        
        IF v_perfil_padrao_id IS NULL THEN
            RAISE EXCEPTION 'Perfil padrão TMA não encontrado';
        END IF;
    ELSE
        v_perfil_padrao_id := p_perfil_id;
    END IF;
    
    -- Criar usuário no auth.users
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
        p_email,
        crypt(p_senha, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object(
            'nome', p_nome,
            'matricula', p_matricula,
            'telefone', p_telefone
        ),
        FALSE,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO v_auth_user_id;
    
    -- Criar registro na tabela usuarios
    INSERT INTO public.usuarios (
        nome,
        email,
        senha,
        matricula,
        telefone,
        perfil_id,
        empresa_id,
        auth_user_id,
        ativo,
        created_at,
        updated_at
    ) VALUES (
        p_nome,
        p_email,
        p_senha, -- Senha em texto plano para compatibilidade
        p_matricula,
        p_telefone,
        v_perfil_padrao_id,
        p_empresa_id,
        v_auth_user_id,
        TRUE,
        NOW(),
        NOW()
    ) RETURNING id INTO v_usuario_id;
    
    -- Retornar o ID do usuário criado
    RETURN v_usuario_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback em caso de erro
        IF v_auth_user_id IS NOT NULL THEN
            DELETE FROM auth.users WHERE id = v_auth_user_id;
        END IF;
        RAISE;
END;
$$;

-- ===================================================================
-- FUNÇÃO PARA OBTER USUÁRIO ATUAL
-- ===================================================================

CREATE OR REPLACE FUNCTION obter_usuario_atual()
RETURNS TABLE (
    id UUID,
    nome TEXT,
    email TEXT,
    matricula TEXT,
    telefone TEXT,
    perfil_id UUID,
    empresa_id UUID,
    auth_user_id UUID,
    ativo BOOLEAN,
    perfil_nome TEXT,
    perfil_permissoes JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nome,
        u.email,
        u.matricula,
        u.telefone,
        u.perfil_id,
        u.empresa_id,
        u.auth_user_id,
        u.ativo,
        p.nome as perfil_nome,
        p.permissoes as perfil_permissoes
    FROM public.usuarios u
    LEFT JOIN public.perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid();
END;
$$;

-- ===================================================================
-- FUNÇÃO PARA VERIFICAR PERMISSÕES
-- ===================================================================

CREATE OR REPLACE FUNCTION tem_permissao(p_permissao TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_permissoes JSONB;
    v_perfil_nome TEXT;
BEGIN
    SELECT 
        p.permissoes,
        p.nome
    INTO v_permissoes, v_perfil_nome
    FROM public.usuarios u
    JOIN public.perfis p ON u.perfil_id = p.id
    WHERE u.auth_user_id = auth.uid();
    
    -- Admin/Developer sempre tem todas as permissões
    IF v_perfil_nome IN ('admin', 'developer', 'ADM', 'DESENVOLVEDOR') THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar permissão específica
    IF v_permissoes ? p_permissao THEN
        RETURN (v_permissoes ->> p_permissao)::BOOLEAN;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- ===================================================================
-- EXEMPLOS DE USO
-- ===================================================================

/*
-- Criar um novo usuário TMA
SELECT criar_usuario_hibrido(
    'joao@empresa.com',
    'senha123',
    'João Silva',
    'TMA001',
    '(11) 99999-9999'
);

-- Obter dados do usuário atual
SELECT * FROM obter_usuario_atual();

-- Verificar se tem permissão de admin
SELECT tem_permissao('admin');

-- Verificar se tem permissão de criar metas
SELECT tem_permissao('criar_metas');
*/ 