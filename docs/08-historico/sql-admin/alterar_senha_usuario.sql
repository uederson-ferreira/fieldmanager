-- ===================================================================
-- ALTERAR SENHA DO USUÁRIO - ECOFIELD SYSTEM
-- Localização: sql/admin/alterar_senha_usuario.sql
-- Usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR USUÁRIO ATUAL
-- ===================================================================

-- Verificar se o usuário existe no auth.users
SELECT 
    'AUTH USERS' as tabela,
    id,
    email,
    created_at,
    updated_at
FROM auth.users 
WHERE id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- Verificar se o usuário existe na tabela usuarios
SELECT 
    'USUARIOS' as tabela,
    id,
    nome,
    email,
    matricula,
    ativo,
    auth_user_id,
    created_at,
    updated_at
FROM public.usuarios 
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- 2. ALTERAR SENHA NO SUPABASE AUTH
-- ===================================================================

-- IMPORTANTE: Esta operação deve ser feita via Supabase Dashboard ou API
-- O SQL direto não pode alterar senhas no auth.users por segurança

-- Para alterar via Supabase Dashboard:
-- 1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/auth/users
-- 2. Encontre o usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
-- 3. Clique em "..." → "Edit"
-- 4. Altere a senha para: "123456"
-- 5. Salve as alterações

-- ===================================================================
-- 3. ALTERAR SENHA NA TABELA USUARIOS
-- ===================================================================

-- Atualizar senha na tabela usuarios (senha em texto plano)
UPDATE public.usuarios 
SET 
    senha = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', -- hash de "admin"
    updated_at = CURRENT_TIMESTAMP
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- 4. VERIFICAR ALTERAÇÕES
-- ===================================================================

-- Verificar se a alteração foi aplicada
SELECT 
    'VERIFICAÇÃO' as status,
    id,
    nome,
    email,
    senha,
    ativo,
    auth_user_id,
    updated_at
FROM public.usuarios 
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- 5. SENHAS PADRÃO DISPONÍVEIS
-- ===================================================================

/*
SENHAS PADRÃO (TEXTO PLANO):

1. "123456" = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
2. "admin" = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"
3. "admin123" = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
4. "password" = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"

PARA USAR OUTRA SENHA:
1. Use a senha em texto plano diretamente
2. Substitua no UPDATE acima
3. Execute o script
*/

-- ===================================================================
-- 6. SCRIPT ALTERNATIVO PARA OUTRAS SENHAS
-- ===================================================================

/*
-- Para senha "123456":
UPDATE public.usuarios 
SET senha = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- Para senha "admin123":
UPDATE public.usuarios 
SET senha = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- Para senha "password":
UPDATE public.usuarios 
SET senha = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';
*/ 