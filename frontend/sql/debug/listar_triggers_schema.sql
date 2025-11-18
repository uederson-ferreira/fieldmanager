-- LISTAR TODOS OS TRIGGERS DO SCHEMA
-- Script para mostrar todos os triggers existentes

-- 1. TODOS OS TRIGGERS COM DETALHES
SELECT 
    'TRIGGERS EXISTENTES' as secao,
    c.relname as tabela,
    t.tgname as nome_trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status,
    p.proname as funcao_executada,
    CASE 
        WHEN t.tgtype & 66 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 66 = 4 THEN 'AFTER'
        WHEN t.tgtype & 66 = 8 THEN 'INSTEAD OF'
        ELSE 'UNKNOWN'
    END as momento,
    CASE 
        WHEN t.tgtype & 28 = 4 THEN 'INSERT'
        WHEN t.tgtype & 28 = 8 THEN 'DELETE'
        WHEN t.tgtype & 28 = 16 THEN 'UPDATE'
        WHEN t.tgtype & 28 = 12 THEN 'INSERT/DELETE'
        WHEN t.tgtype & 28 = 20 THEN 'INSERT/UPDATE'
        WHEN t.tgtype & 28 = 24 THEN 'DELETE/UPDATE'
        WHEN t.tgtype & 28 = 28 THEN 'INSERT/DELETE/UPDATE'
        ELSE 'UNKNOWN'
    END as evento,
    CASE 
        WHEN t.tgtype & 1 = 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END as escopo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal  -- Excluir triggers internos do sistema
ORDER BY c.relname, t.tgname;

-- 2. TRIGGERS ESPECÍFICOS PARA METAS (PROGRESSO)
SELECT 
    'TRIGGERS DE METAS' as secao,
    c.relname as tabela,
    t.tgname as nome_trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status,
    p.proname as funcao_executada
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
  AND (t.tgname LIKE '%progresso%' OR t.tgname LIKE '%meta%')
ORDER BY c.relname, t.tgname;

-- 3. TRIGGERS DE UPDATE_AT (AUTOMÁTICOS)
SELECT 
    'TRIGGERS UPDATE_AT' as secao,
    c.relname as tabela,
    t.tgname as nome_trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status,
    p.proname as funcao_executada
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
  AND t.tgname LIKE '%updated_at%'
ORDER BY c.relname, t.tgname;

-- 4. RESUMO POR TABELA
SELECT 
    'RESUMO POR TABELA' as secao,
    c.relname as tabela,
    COUNT(*) as total_triggers,
    COUNT(CASE WHEN t.tgenabled = 'A' THEN 1 END) as ativos,
    COUNT(CASE WHEN t.tgenabled = 'D' THEN 1 END) as desabilitados,
    COUNT(CASE WHEN t.tgenabled = 'O' THEN 1 END) as desconhecidos
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
GROUP BY c.relname
HAVING COUNT(*) > 0
ORDER BY total_triggers DESC, c.relname;

-- 5. FUNÇÕES MAIS USADAS EM TRIGGERS
SELECT 
    'FUNÇÕES DE TRIGGER' as secao,
    p.proname as nome_funcao,
    COUNT(*) as total_triggers_que_usam
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
GROUP BY p.proname
HAVING COUNT(*) > 1
ORDER BY total_triggers_que_usam DESC;

-- 6. VERIFICAÇÃO ESPECÍFICA - TERMOS AMBIENTAIS
SELECT 
    'TRIGGERS TERMOS' as secao,
    t.tgname as nome_trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status,
    p.proname as funcao_executada
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
  AND c.relname = 'termos_ambientais'
ORDER BY t.tgname;

-- 7. VERIFICAÇÃO ESPECÍFICA - ATIVIDADES ROTINA
SELECT 
    'TRIGGERS ATIVIDADES' as secao,
    t.tgname as nome_trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status,
    p.proname as funcao_executada
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
  AND c.relname = 'atividades_rotina'
ORDER BY t.tgname; 