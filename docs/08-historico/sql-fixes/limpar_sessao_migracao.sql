-- ===================================================================
-- LIMPAR SESSÕES ANTIGAS DA MIGRAÇÃO - ECOFIELD
-- Localização: sql/limpar_sessao_migracao.sql
-- ===================================================================

-- Este script limpa sessões antigas que podem estar causando problemas
-- após a migração para Supabase Auth

-- ===================================================================
-- 1. VERIFICAR ESTRUTURA DA TABELA SESSIONS
-- ===================================================================

SELECT 
  'ESTRUTURA SESSIONS' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'sessions'
ORDER BY ordinal_position;

-- ===================================================================
-- 2. VERIFICAR SESSÕES ATIVAS (ESTRUTURA CORRETA)
-- ===================================================================

SELECT 
  'SESSÕES ATIVAS' as info,
  COUNT(*) as total_sessoes,
  COUNT(CASE WHEN created_at < NOW() - INTERVAL '24 hours' THEN 1 END) as antigas,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recentes
FROM auth.sessions;

-- ===================================================================
-- 3. VERIFICAR USUÁRIOS COM PROBLEMAS DE SESSÃO
-- ===================================================================

SELECT 
  'USUÁRIOS COM PROBLEMAS' as info,
  u.email,
  u.auth_user_id,
  CASE 
    WHEN s.id IS NULL THEN '❌ SEM SESSÃO'
    WHEN s.created_at < NOW() - INTERVAL '24 hours' THEN '⚠️ SESSÃO ANTIGA'
    ELSE '✅ SESSÃO ATIVA'
  END as status_sessao
FROM usuarios u
LEFT JOIN auth.sessions s ON u.auth_user_id = s.user_id
WHERE u.email = 'joao.silva@empresa.com';

-- ===================================================================
-- 4. VERIFICAR SE O USUÁRIO EXISTE NO AUTH.USERS
-- ===================================================================

SELECT 
  'VERIFICAÇÃO AUTH.USERS' as info,
  au.id as auth_user_id,
  au.email,
  au.email_confirmed_at,
  CASE 
    WHEN au.id IS NULL THEN '❌ NÃO EXISTE'
    WHEN au.email_confirmed_at IS NULL THEN '⚠️ EMAIL NÃO CONFIRMADO'
    ELSE '✅ USUÁRIO VÁLIDO'
  END as status
FROM usuarios u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'joao.silva@empresa.com';

-- ===================================================================
-- 5. VERIFICAR SE HÁ PROBLEMAS DE MIGRAÇÃO
-- ===================================================================

SELECT 
  'PROBLEMAS DE MIGRAÇÃO' as info,
  u.email,
  u.auth_user_id,
  au.id as auth_users_id,
  CASE 
    WHEN au.id IS NULL THEN '❌ ID NÃO EXISTE NO AUTH.USERS'
    WHEN u.auth_user_id != au.id THEN '❌ IDS DIFERENTES'
    ELSE '✅ MIGRAÇÃO OK'
  END as status_migracao
FROM usuarios u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'joao.silva@empresa.com';

-- ===================================================================
-- 6. LIMPAR SESSÕES ANTIGAS (OPCIONAL)
-- ===================================================================

-- Descomente se quiser limpar sessões antigas
-- DELETE FROM auth.sessions WHERE created_at < NOW() - INTERVAL '24 hours'; 