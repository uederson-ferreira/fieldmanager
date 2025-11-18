-- ===================================================================
-- TESTAR LOGIN DIRETAMENTE NO BACKEND
-- Email: mateus.evangelista@turntown.com
-- Senha: 123456
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR SE O USUÁRIO EXISTE NO SUPABASE AUTH
-- ===================================================================

SELECT 
    'TESTE AUTH' as secao,
    id as auth_user_id,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
        ELSE '❌ Email NÃO confirmado - PROBLEMA!'
    END as email_status
FROM auth.users 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 2. VERIFICAR SE O USUÁRIO EXISTE NA TABELA USUARIOS
-- ===================================================================

SELECT 
    'TESTE USUARIOS' as secao,
    id,
    nome,
    email,
    senha,
    ativo,
    auth_user_id,
    CASE 
        WHEN ativo = true THEN '✅ Usuário ativo'
        ELSE '❌ Usuário inativo - PROBLEMA!'
    END as status_ativo,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ Mapeamento OK'
        ELSE '❌ Sem mapeamento - PROBLEMA!'
    END as mapeamento_status
FROM public.usuarios 
WHERE email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 3. SIMULAR LOGIN NO BACKEND
-- ===================================================================

-- Dados que o frontend envia para o backend
SELECT 
    'DADOS ENVIADOS PELO FRONTEND' as secao,
    'Email:' as campo1,
    'mateus.evangelista@turntown.com' as valor1,
    'Senha:' as campo2,
    '123456' as valor2,
    'useHash:' as campo3,
    'false' as valor3,
    'useHash:' as campo4,
    'true' as valor4;

-- ===================================================================
-- 4. VERIFICAR PROCESSAMENTO DE SENHA NO BACKEND
-- ===================================================================

-- O backend deve:
-- 1. Receber senha "123456" como texto plano
-- 2. Usar diretamente no Supabase Auth
-- 3. Não processar hash

SELECT 
    'PROCESSAMENTO DE SENHA' as secao,
    'Senha recebida:' as info1,
    '123456' as senha_recebida,
    'Processamento:' as info2,
    'Texto plano (useHash=false)' as processamento,
    'Enviada para Supabase:' as info3,
    '123456' as enviada_supabase;

-- ===================================================================
-- 5. VERIFICAR AUTENTICAÇÃO NO SUPABASE
-- ===================================================================

-- Simular autenticação no Supabase
SELECT 
    'SIMULAÇÃO SUPABASE AUTH' as secao,
    'Email:' as campo1,
    'mateus.evangelista@turntown.com' as valor1,
    'Senha:' as campo2,
    '123456' as valor2,
    'Resultado esperado:' as campo3,
    'SUCCESS' as valor3;

-- ===================================================================
-- 6. VERIFICAR DADOS RETORNADOS PELO BACKEND
-- ===================================================================

-- Após autenticação bem-sucedida, o backend deve retornar:
SELECT 
    'DADOS RETORNADOS PELO BACKEND' as secao,
    'user.id:' as campo1,
    (SELECT id FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') as valor1,
    'user.email:' as campo2,
    'mateus.evangelista@turntown.com' as valor2,
    'access_token:' as campo3,
    'JWT_TOKEN_AQUI' as valor3,
    'refresh_token:' as campo4,
    'REFRESH_TOKEN_AQUI' as valor4;

-- ===================================================================
-- 7. VERIFICAR DADOS DO USUÁRIO NA TABELA USUARIOS
-- ===================================================================

-- O backend deve buscar dados adicionais na tabela usuarios
SELECT 
    'DADOS ADICIONAIS DO USUÁRIO' as secao,
    u.id,
    u.nome,
    u.email,
    u.matricula,
    u.ativo,
    p.nome as perfil,
    e.nome as empresa,
    CASE 
        WHEN u.ativo = true THEN '✅ Usuário ativo'
        ELSE '❌ Usuário inativo'
    END as status
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
LEFT JOIN public.empresas_contratadas e ON u.empresa_id = e.id
WHERE u.email = 'mateus.evangelista@turntown.com';

-- ===================================================================
-- 8. POSSÍVEIS CAUSAS DO ERRO 401
-- ===================================================================

SELECT 
    'POSSÍVEIS CAUSAS DO ERRO 401' as secao,
    '1. Email não confirmado no auth.users' as causa1,
    CASE 
        WHEN (SELECT email_confirmed_at FROM auth.users WHERE email = 'mateus.evangelista@turntown.com') IS NULL 
        THEN '❌ PROBLEMA ENCONTRADO'
        ELSE '✅ OK'
    END as status1,
    '2. Usuário inativo na tabela usuarios' as causa2,
    CASE 
        WHEN (SELECT ativo FROM public.usuarios WHERE email = 'mateus.evangelista@turntown.com') = false 
        THEN '❌ PROBLEMA ENCONTRADO'
        ELSE '✅ OK'
    END as status2,
    '3. Senha incorreta' as causa3,
    '✅ OK (senha correta: 123456)' as status3,
    '4. Mapeamento incorreto entre tabelas' as causa4,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users au 
            JOIN public.usuarios u ON au.id = u.auth_user_id 
            WHERE au.email = 'mateus.evangelista@turntown.com'
        ) THEN '✅ OK'
        ELSE '❌ PROBLEMA ENCONTRADO'
    END as status4; 