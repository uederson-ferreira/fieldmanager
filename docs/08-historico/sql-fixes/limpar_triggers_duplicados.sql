-- ===================================================================
-- LIMPAR TRIGGERS DUPLICADOS E DEIXAR APENAS OS CORRETOS
-- ===================================================================

-- 1. VERIFICAR TRIGGERS ATUAIS
SELECT '=== TRIGGERS ATUAIS ===' as info;

SELECT 
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo
FROM pg_trigger 
WHERE tgname LIKE '%calcular_progresso%'
ORDER BY tgrelid, tgname;

-- 2. REMOVER TODOS OS TRIGGERS EXISTENTES
SELECT '=== REMOVENDO TRIGGERS DUPLICADOS ===' as info;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;

-- Remover triggers com nomes específicos também
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;

-- 3. REMOVER FUNÇÕES ESPECÍFICAS (se existirem)
SELECT '=== REMOVENDO FUNÇÕES ESPECÍFICAS ===' as info;

DROP FUNCTION IF EXISTS calcular_progresso_lvs();
DROP FUNCTION IF EXISTS calcular_progresso_rotinas();
DROP FUNCTION IF EXISTS calcular_progresso_termos();

-- 4. VERIFICAR SE A FUNÇÃO PRINCIPAL EXISTE
SELECT '=== VERIFICANDO FUNÇÃO PRINCIPAL ===' as info;

SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'calcular_progresso_metas' THEN '✅ FUNÇÃO PRINCIPAL EXISTE'
        ELSE '❌ FUNÇÃO NÃO ENCONTRADA'
    END as status
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- 5. CRIAR APENAS OS TRIGGERS CORRETOS
SELECT '=== CRIANDO TRIGGERS CORRETOS ===' as info;

-- Trigger para termos ambientais
CREATE TRIGGER trigger_calcular_progresso_termos
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para LVs
CREATE TRIGGER trigger_calcular_progresso_lvs
    AFTER INSERT OR UPDATE ON lvs
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para LVs de resíduos
CREATE TRIGGER trigger_calcular_progresso_lv_residuos
    AFTER INSERT OR UPDATE ON lv_residuos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para atividades rotina
CREATE TRIGGER trigger_calcular_progresso_rotinas
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- 6. VERIFICAR TRIGGERS FINAIS
SELECT '=== TRIGGERS FINAIS ===' as info;

SELECT 
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    CASE 
        WHEN tgenabled = 't' THEN '✅ ATIVO'
        ELSE '❌ DESATIVADO'
    END as status
FROM pg_trigger 
WHERE tgname LIKE '%calcular_progresso%'
ORDER BY tgrelid, tgname;

-- 7. RECALCULAR PROGRESSO PARA TERMOS EXISTENTES
SELECT '=== RECALCULANDO PROGRESSO ===' as info;

DO $$
DECLARE
    termo_record RECORD;
    total_processados INTEGER := 0;
BEGIN
    RAISE NOTICE '🔄 Recalculando progresso para termos existentes...';
    
    FOR termo_record IN 
        SELECT id, emitido_por_usuario_id, data_termo
        FROM termos_ambientais 
        WHERE EXTRACT(YEAR FROM data_termo) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND EXTRACT(MONTH FROM data_termo) = EXTRACT(MONTH FROM CURRENT_DATE)
        ORDER BY created_at DESC
    LOOP
        -- Simular update para disparar o trigger
        UPDATE termos_ambientais 
        SET updated_at = NOW() 
        WHERE id = termo_record.id;
        
        total_processados := total_processados + 1;
        
        IF total_processados % 5 = 0 THEN
            RAISE NOTICE '📊 Processados: % termos', total_processados;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Recalculo concluído! Total processados: %', total_processados;
END $$;

-- 8. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar progresso atualizado
SELECT 
    'PROGRESSO ATUALIZADO:' as tipo,
    pm.meta_id,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao,
    m.descricao as meta_descricao,
    u.nome as tma_nome
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE m.tipo_meta = 'termo'
  AND pm.ultima_atualizacao >= NOW() - INTERVAL '1 hour'
ORDER BY pm.ultima_atualizacao DESC; 