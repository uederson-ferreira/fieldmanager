-- Investigar triggers e funções na tabela atividades_rotina
-- Erro: record "new" has no field "emitido_por_usuario_id"

-- 1. Listar todos os triggers na tabela atividades_rotina
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_statement,
  t.action_timing,
  t.action_orientation
FROM information_schema.triggers t
WHERE t.event_object_table = 'atividades_rotina'
ORDER BY t.trigger_name;

-- 2. Verificar funções que podem estar sendo chamadas pelos triggers
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) ILIKE '%emitido_por_usuario_id%'
ORDER BY p.proname;

-- 3. Verificar se há triggers genéricos que afetam todas as tabelas
SELECT 
  t.trigger_name,
  t.event_object_table,
  t.action_statement
FROM information_schema.triggers t
WHERE t.action_statement ILIKE '%emitido_por_usuario_id%'
ORDER BY t.trigger_name;

-- 4. Desabilitar temporariamente todos os triggers na tabela
ALTER TABLE atividades_rotina DISABLE TRIGGER ALL;

-- 5. Verificar se há triggers desabilitados
SELECT 
  trigger_name,
  trigger_schema,
  trigger_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'atividades_rotina';

-- 6. Tentar um insert simples para teste (comentado - para referência)
-- INSERT INTO atividades_rotina (
--   data_atividade,
--   atividade,
--   tma_responsavel_id,
--   auth_user_id,
--   status
-- ) VALUES (
--   CURRENT_DATE,
--   'Teste',
--   '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028',
--   '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028',
--   'Planejada'
-- );

-- 7. Reabilitar triggers (comentado - executar só depois de corrigir)
-- ALTER TABLE atividades_rotina ENABLE TRIGGER ALL; 