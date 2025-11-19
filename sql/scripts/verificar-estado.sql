-- ================================================================
-- VERIFICAR ESTADO ATUAL DO BANCO - FIELDMANAGER v2.0
-- Execute este script no Supabase SQL Editor
-- ================================================================

\echo '🔍 Verificando estado atual do banco de dados...'
\echo ''

-- ================================================================
-- 1. TABELAS EXISTENTES
-- ================================================================

SELECT
  'TABELAS EXISTENTES' as secao,
  table_name as nome,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name)::text as total_colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''

-- ================================================================
-- 2. CONTAGEM DE REGISTROS
-- ================================================================

SELECT 'REGISTROS' as secao, 'perfis' as tabela, COUNT(*)::text as total FROM perfis
UNION ALL
SELECT 'REGISTROS', 'dominios', COUNT(*)::text FROM dominios
UNION ALL
SELECT 'REGISTROS', 'tenants', COUNT(*)::text FROM tenants
UNION ALL
SELECT 'REGISTROS', 'tenant_dominios', COUNT(*)::text FROM tenant_dominios
UNION ALL
SELECT 'REGISTROS', 'usuarios', COUNT(*)::text FROM usuarios
UNION ALL
SELECT 'REGISTROS', 'modulos_sistema', COUNT(*)::text FROM modulos_sistema
UNION ALL
SELECT 'REGISTROS', 'perguntas_modulos', COUNT(*)::text FROM perguntas_modulos
UNION ALL
SELECT 'REGISTROS', 'execucoes', COUNT(*)::text FROM execucoes
UNION ALL
SELECT 'REGISTROS', 'execucoes_respostas', COUNT(*)::text FROM execucoes_respostas
UNION ALL
SELECT 'REGISTROS', 'execucoes_fotos', COUNT(*)::text FROM execucoes_fotos;

\echo ''

-- ================================================================
-- 3. PERFIS CADASTRADOS
-- ================================================================

SELECT 'PERFIS' as secao, nome, nivel_acesso, ativo FROM perfis ORDER BY nivel_acesso DESC;

\echo ''

-- ================================================================
-- 4. DOMÍNIOS CADASTRADOS
-- ================================================================

SELECT 'DOMÍNIOS' as secao, codigo, nome, ativo FROM dominios ORDER BY ordem;

\echo ''

-- ================================================================
-- 5. MÓDULOS CADASTRADOS
-- ================================================================

SELECT
  'MÓDULOS' as secao,
  m.codigo,
  m.nome,
  d.nome as dominio,
  m.template,
  (SELECT COUNT(*) FROM perguntas_modulos WHERE modulo_id = m.id)::text as total_perguntas
FROM modulos_sistema m
LEFT JOIN dominios d ON d.id = m.dominio_id
ORDER BY d.nome, m.nome;

\echo ''

-- ================================================================
-- 6. USUÁRIOS CADASTRADOS
-- ================================================================

SELECT
  'USUÁRIOS' as secao,
  u.nome,
  u.email,
  p.nome as perfil,
  u.auth_user_id as tem_auth,
  u.ativo
FROM usuarios u
LEFT JOIN perfis p ON p.id = u.perfil_id
ORDER BY u.nome;

\echo ''

-- ================================================================
-- 7. INDICES ÚNICOS (para ON CONFLICT)
-- ================================================================

SELECT
  'ÍNDICES ÚNICOS' as secao,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%UNIQUE%'
ORDER BY tablename, indexname;

\echo ''
\echo '✅ Verificação completa!'
