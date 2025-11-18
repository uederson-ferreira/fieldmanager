-- REATIVAR TRIGGERS DE METAS
-- Script para reativar triggers que podem ter sido desabilitados

-- 1. VERIFICAR STATUS ATUAL
SELECT 
    'STATUS ANTES' as secao,
    c.relname as tabela,
    t.tgname as trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.tgname LIKE '%progresso%'
ORDER BY c.relname, t.tgname;

-- 2. REATIVAR TRIGGER DE TERMOS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'termos_ambientais'
          AND t.tgname = 'trigger_calcular_progresso_termos'
    ) THEN
        ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;
        RAISE NOTICE '✅ Trigger de termos reativado';
    ELSE
        RAISE NOTICE '❌ Trigger de termos não encontrado';
    END IF;
END $$;

-- 3. REATIVAR TRIGGER DE ATIVIDADES
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'atividades_rotina'
          AND t.tgname = 'trigger_calcular_progresso_rotinas'
    ) THEN
        ALTER TABLE atividades_rotina ENABLE TRIGGER trigger_calcular_progresso_rotinas;
        RAISE NOTICE '✅ Trigger de atividades reativado';
    ELSE
        RAISE NOTICE '❌ Trigger de atividades não encontrado';
    END IF;
END $$;

-- 4. RECALCULAR PROGRESSO PARA DADOS EXISTENTES
DO $$
DECLARE
    termo_record RECORD;
    atividade_record RECORD;
    total_termos INTEGER := 0;
    total_atividades INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Recalculando progresso para dados existentes...';
    
    -- Recalcular termos
    FOR termo_record IN 
        SELECT id, emitido_por_usuario_id, tipo_termo, data_termo
        FROM termos_ambientais 
        ORDER BY data_termo DESC
        LIMIT 100
    LOOP
        UPDATE termos_ambientais 
        SET updated_at = NOW() 
        WHERE id = termo_record.id;
        
        total_termos := total_termos + 1;
    END LOOP;
    
    -- Recalcular atividades
    FOR atividade_record IN 
        SELECT id, tma_responsavel_id, atividade, data_atividade
        FROM atividades_rotina 
        ORDER BY data_atividade DESC
        LIMIT 100
    LOOP
        UPDATE atividades_rotina 
        SET updated_at = NOW() 
        WHERE id = atividade_record.id;
        
        total_atividades := total_atividades + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Recalculo concluido! Termos: %, Atividades: %', total_termos, total_atividades;
END $$;

-- 5. VERIFICAR STATUS APÓS REATIVAÇÃO
SELECT 
    'STATUS APÓS' as secao,
    c.relname as tabela,
    t.tgname as trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.tgname LIKE '%progresso%'
ORDER BY c.relname, t.tgname;

-- 6. VERIFICAR PROGRESSO ATUAL
SELECT 
    'PROGRESSO ATUAL' as secao,
    pm.id,
    m.descricao as descricao_meta,
    m.tipo_meta,
    pm.tma_id as usuario_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
ORDER BY pm.ultima_atualizacao DESC;

-- 7. RESULTADO FINAL
SELECT '🎉 TRIGGERS REATIVADOS COM SUCESSO!' as resultado; 