-- CRIAR TRIGGERS PARA TABELA LVS
-- A tabela lvs é diferente de lv_residuos e precisa de triggers para metas

-- 1. Verificar se a tabela lvs existe
SELECT 
    'VERIFICAR TABELA LVS' as teste,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'lvs') THEN '✅ Tabela lvs existe'
        ELSE '❌ Tabela lvs não existe'
    END as status;

-- 2. Verificar triggers existentes para lvs
SELECT 
    'TRIGGERS EXISTENTES LVS' as teste,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'lvs'
  AND t.tgname LIKE '%calcular_progresso%'
ORDER BY t.tgname;

-- 3. Criar triggers para lvs
DO $$
BEGIN
    -- Verificar se os triggers já existem
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE c.relname = 'lvs'
          AND p.proname = 'calcular_progresso_metas'
    ) THEN
        -- Criar trigger para INSERT
        CREATE TRIGGER trigger_calcular_progresso_lvs_insert
        AFTER INSERT ON lvs
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        -- Criar trigger para UPDATE
        CREATE TRIGGER trigger_calcular_progresso_lvs_update
        AFTER UPDATE ON lvs
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        -- Criar trigger para DELETE
        CREATE TRIGGER trigger_calcular_progresso_lvs_delete
        AFTER DELETE ON lvs
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();
        
        RAISE NOTICE '✅ Triggers criados para lvs';
    ELSE
        RAISE NOTICE 'ℹ️ Triggers já existem para lvs';
    END IF;
END $$;

-- 4. Verificar se a função calcular_progresso_metas trata a tabela lvs
SELECT 
    'FUNÇÃO CALCULAR_PROGRESSO_METAS' as teste,
    proname as nome_funcao,
    prosrc LIKE '%lvs%' as trata_lvs,
    prosrc LIKE '%TG_TABLE_NAME%' as usa_tg_table_name
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- 5. Verificar dados na tabela lvs
SELECT 
    'DADOS TABELA LVS' as teste,
    COUNT(*) as total_lvs,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_preenchimento) = EXTRACT(YEAR FROM CURRENT_DATE) 
                AND EXTRACT(MONTH FROM data_preenchimento) = EXTRACT(MONTH FROM CURRENT_DATE) 
           THEN 1 END) as lvs_mes_atual,
    COUNT(DISTINCT usuario_id) as usuarios_com_lvs,
    COUNT(DISTINCT tipo_lv) as tipos_lv_diferentes
FROM lvs;

-- 6. Verificar metas que podem ser afetadas por lvs
SELECT 
    'METAS AFETADAS POR LVS' as teste,
    m.id,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade,
    m.ano,
    m.mes,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status
FROM metas m
LEFT JOIN progresso_metas pm ON m.id = pm.meta_id
WHERE m.tipo_meta = 'lv' 
  AND m.ativa = true
  AND m.ano = EXTRACT(YEAR FROM CURRENT_DATE)
  AND m.mes = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY m.escopo, pm.tma_id;

-- 7. Verificar todos os triggers após criação
SELECT 
    'TODOS OS TRIGGERS APÓS CRIAÇÃO' as teste,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('lvs', 'lv_residuos', 'termos_ambientais', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
ORDER BY c.relname, t.tgname;

-- 8. Resumo final de todas as tabelas com triggers
SELECT 
    'RESUMO FINAL - TODAS AS TABELAS' as teste,
    c.relname as tabela,
    COUNT(*) as total_triggers,
    COUNT(CASE WHEN t.tgenabled = 'O' THEN 1 END) as triggers_ativos
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('lvs', 'lv_residuos', 'termos_ambientais', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
GROUP BY c.relname
ORDER BY c.relname; 