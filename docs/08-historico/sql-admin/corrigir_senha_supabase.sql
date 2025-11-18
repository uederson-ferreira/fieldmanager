-- ===================================================================
-- CORRIGIR SENHA NO SUPABASE AUTH
-- Email: mateus.evangelista@turntown.com
-- Senha: 123456
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR USUÁRIO ATUAL NO AUTH.USERS
-- ===================================================================

SELECT 
    'USUÁRIO ATUAL' as secao,
    id as auth_user_id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '❌ Email NÃO confirmado'
    END as email_status
FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 2. VERIFICAR USUÁRIO NA TABELA USUARIOS
-- ===================================================================

SELECT 
    'TABELA USUARIOS' as secao,
    id,
    nome,
    email,
    senha,
    ativo,
    auth_user_id,
    created_at,
    updated_at
FROM public.usuarios 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 3. CORRIGIR PROBLEMAS COMUNS
-- ===================================================================

-- 3.1. Confirmar email no auth.users
UPDATE auth.users 
SET email_confirmed_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com' 
AND email_confirmed_at IS NULL;

-- 3.2. Ativar usuário na tabela usuarios
UPDATE public.usuarios 
SET ativo = true
WHERE email = 'mateus.evangelista@turntown.com' 
AND ativo = false;

-- 3.3. Corrigir senha na tabela usuarios
UPDATE public.usuarios 
SET 
    senha = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 4. INSTRUÇÕES PARA CORRIGIR SENHA NO SUPABASE AUTH
-- ===================================================================

/*
PROBLEMA IDENTIFICADO: A senha no Supabase Auth pode estar incorreta.

SOLUÇÃO: Recriar o usuário no Supabase Auth

PASSO 1: Excluir usuário atual
1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/auth/users
2. Encontre: mateus.evangelista@turntown.com
3. Clique em "..." → "Delete"
4. Confirme a exclusão

PASSO 2: Criar novo usuário
1. Clique em "Add user"
2. Preencha:
   - Email: mateus.evangelista@turntown.com
   - Password: 123456
   - Email confirm: ✓ (marcado)
3. Clique em "Create user"

PASSO 3: Atualizar mapeamento
1. Copie o novo auth_user_id
2. Execute o UPDATE abaixo
*/

-- ===================================================================
-- 5. ATUALIZAR MAPEAMENTO (APÓS RECRIAR NO AUTH)
-- ===================================================================

-- Substitua 'NOVO_AUTH_USER_ID' pelo ID do usuário recriado
UPDATE public.usuarios 
SET 
    auth_user_id = 'NOVO_AUTH_USER_ID', -- ⚠️ SUBSTITUA PELO ID REAL
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 6. VERIFICAR CORREÇÃO
-- ===================================================================

SELECT 
    'VERIFICAÇÃO FINAL' as secao,
    'Auth Users:' as info,
    (SELECT COUNT(*) FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') as auth_users,
    'Usuarios:' as info2,
    (SELECT COUNT(*) FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') as usuarios,
    'Mapeamento:' as info3,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users au 
            JOIN public.usuarios u ON au.id = u.auth_user_id 
            WHERE au.email = 'mateus.evangelista@turntown.com'
        ) THEN '✅ OK'
        ELSE '❌ PROBLEMA'
    END as mapeamento,
    'Email confirmado:' as info4,
    CASE 
        WHEN (SELECT email_confirmed_at FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') IS NOT NULL 
        THEN '✅ OK'
        ELSE '❌ PROBLEMA'
    END as email_status;

-- ===================================================================
-- 7. TESTAR LOGIN
-- ===================================================================

/*
Após as correções, teste o login:

1. Acesse: https://ecofield.vercel.app
2. Faça login com:
   - Email: mateus.evangelista@turntown.com
   - Senha: 123456
3. Verifique se funciona

Se ainda houver problemas, verifique:
- Se o usuário foi recriado corretamente no Supabase Auth
- Se o mapeamento auth_user_id está correto
- Se o email está confirmado
*/ 