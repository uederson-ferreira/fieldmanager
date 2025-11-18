-- REMOVER FUNÇÃO REDUNDANTE
-- A função calcular_progresso_rotinas é redundante porque calcular_progresso_metas já trata atividades_rotina

-- 1. Remover triggers que usam a função redundante
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- 2. Remover a função redundante
DROP FUNCTION IF EXISTS calcular_progresso_rotinas() CASCADE;

-- 3. Verificar se a função foi removida
SELECT 
    'FUNÇÃO REMOVIDA' as teste,
    proname as nome_funcao,
    'FUNÇÃO REDUNDANTE REMOVIDA' as status
FROM pg_proc 
WHERE proname = 'calcular_progresso_rotinas';

-- 4. Verificar se calcular_progresso_metas ainda existe
SELECT 
    'FUNÇÃO PRINCIPAL' as teste,
    proname as nome_funcao,
    proargtypes::regtype[] as tipos_argumentos,
    prorettype::regtype as tipo_retorno
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- 5. Verificar triggers ativos para atividades_rotina
SELECT 
    'TRIGGERS ATIVOS - ATIVIDADES_ROTINA' as teste,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'atividades_rotina'
  AND t.tgname LIKE '%calcular_progresso%'
ORDER BY t.tgname; 