-- ===================================================================
-- SCRIPT PARA REDEFINIR SENHA DO ADMIN - ECOFIELD SYSTEM
-- Localização: sql/redefinir_senha_admin.sql
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR USUÁRIO ATUAL
-- ===================================================================

SELECT '=== VERIFICANDO USUÁRIO ATUAL ===' as info;

SELECT 
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
-- 2. REDEFINIR SENHA
-- ===================================================================

SELECT '=== REDEFININDO SENHA ===' as info;

-- Atualizar senha criptografada
UPDATE auth.users 
SET 
    encrypted_password = crypt('admin123', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@ecofield.com';

-- Verificar se foi atualizada
SELECT 
    email,
    encrypted_password,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✅ SENHA REDEFINIDA'
        ELSE '❌ SENHA NÃO DEFINIDA'
    END as status_senha
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
-- 3. GARANTIR QUE EMAIL ESTÁ CONFIRMADO
-- ===================================================================

SELECT '=== CONFIRMANDO EMAIL ===' as info;

-- Confirmar email se necessário
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@ecofield.com' 
AND email_confirmed_at IS NULL;

-- Verificar status do email
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMADO'
        ELSE '❌ EMAIL NÃO CONFIRMADO'
    END as status_email
FROM auth.users 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
-- 4. VERIFICAR USUÁRIO NA TABELA PUBLIC.USUARIOS
-- ===================================================================

SELECT '=== VERIFICANDO TABELA USUARIOS ===' as info;

SELECT 
    u.id,
    u.nome,
    u.email,
    u.ativo,
    u.auth_user_id,
    p.nome as perfil_nome
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@ecofield.com';

-- ===================================================================
-- 5. GARANTIR QUE USUÁRIO ESTÁ ATIVO
-- ===================================================================

SELECT '=== ATIVANDO USUÁRIO ===' as info;

-- Ativar usuário se necessário
UPDATE public.usuarios 
SET ativo = TRUE, updated_at = NOW()
WHERE email = 'admin@ecofield.com' 
AND ativo = FALSE;

-- Verificar status ativo
SELECT 
    nome,
    email,
    ativo,
    CASE 
        WHEN ativo = true THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END as status_ativo
FROM public.usuarios 
WHERE email = 'admin@ecofield.com';

-- ===================================================================
-- 6. TESTE FINAL DE CREDENCIAIS
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
        ) THEN '✅ USUARIOS OK'
        ELSE '❌ USUARIOS PROBLEMA'
    END as status_usuarios;

-- ===================================================================
-- 7. INSTRUÇÕES PARA TESTE
-- ===================================================================

SELECT '=== INSTRUÇÕES PARA TESTE ===' as info;

SELECT 
    'Para testar o login:' as instrucao,
    '1. Recarregue a página (F5)' as passo1,
    '2. Digite: admin@ecofield.com' as passo2,
    '3. Digite: admin123' as passo3,
    '4. Clique em Entrar' as passo4,
    '5. Se não funcionar, verifique o console' as passo5; 