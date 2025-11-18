-- CRIAR TRIGGERS FALTANTES
-- Adicionar triggers para termos_ambientais e atividades_rotina

-- 1. Verificar triggers existentes
SELECT 
    'TRIGGERS EXISTENTES' as teste,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('termos_ambientais', 'lv_residuos', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
ORDER BY c.relname, t.tgname;

-- 2. Criar triggers para termos_ambientais
DO $$
BEGIN
    -- Verificar se os triggers já existem
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE c.relname = 'termos_ambientais'
          AND p.proname = 'calcular_progresso_metas'
    ) THEN
        -- Criar trigger para INSERT
        CREATE TRIGGER trigger_calcular_progresso_termos_insert
        AFTER INSERT ON termos_ambientais
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        -- Criar trigger para UPDATE
        CREATE TRIGGER trigger_calcular_progresso_termos_update
        AFTER UPDATE ON termos_ambientais
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        -- Criar trigger para DELETE
        CREATE TRIGGER trigger_calcular_progresso_termos_delete
        AFTER DELETE ON termos_ambientais
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        RAISE NOTICE '✅ Triggers criados para termos_ambientais';
    ELSE
        RAISE NOTICE 'ℹ️ Triggers já existem para termos_ambientais';
    END IF;
END $$;

-- 3. Criar triggers para atividades_rotina
DO $$
BEGIN
    -- Verificar se os triggers já existem
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE c.relname = 'atividades_rotina'
          AND p.proname = 'calcular_progresso_metas'
    ) THEN
        -- Criar trigger para INSERT
        CREATE TRIGGER trigger_calcular_progresso_rotinas_insert
        AFTER INSERT ON atividades_rotina
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        -- Criar trigger para UPDATE
        CREATE TRIGGER trigger_calcular_progresso_rotinas_update
        AFTER UPDATE ON atividades_rotina
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        -- Criar trigger para DELETE
        CREATE TRIGGER trigger_calcular_progresso_rotinas_delete
        AFTER DELETE ON atividades_rotina
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        RAISE NOTICE '✅ Triggers criados para atividades_rotina';
    ELSE
        RAISE NOTICE 'ℹ️ Triggers já existem para atividades_rotina';
    END IF;
END $$;

-- 4. Verificar todos os triggers após criação
SELECT 
    'TODOS OS TRIGGERS APÓS CRIAÇÃO' as teste,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo,
    CASE 
        WHEN tgtype & 66 = 66 THEN 'INSERT'
        WHEN tgtype & 130 = 130 THEN 'UPDATE'
        WHEN tgtype & 258 = 258 THEN 'DELETE'
        ELSE 'MIXED'
    END as evento
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('termos_ambientais', 'lv_residuos', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
ORDER BY c.relname, t.tgname;

-- 5. Resumo final
SELECT 
    'RESUMO TRIGGERS' as teste,
    c.relname as tabela,
    COUNT(*) as total_triggers,
    COUNT(CASE WHEN t.tgenabled = 'O' THEN 1 END) as triggers_ativos
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('termos_ambientais', 'lv_residuos', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
GROUP BY c.relname
ORDER BY c.relname; 