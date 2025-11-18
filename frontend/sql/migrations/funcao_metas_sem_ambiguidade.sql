-- ===================================================================
-- FUNÇÃO DE METAS SEM AMBIGUIDADE - VERSÃO MELHORADA
-- ===================================================================

-- 1. REMOVER TRIGGERS EXISTENTES PRIMEIRO
SELECT '=== REMOVENDO TRIGGERS EXISTENTES ===' as info;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- 2. AGORA REMOVER FUNÇÃO EXISTENTE
SELECT '=== REMOVENDO FUNÇÃO EXISTENTE ===' as info;

DROP FUNCTION IF EXISTS calcular_progresso_metas();

-- 3. CRIAR FUNÇÃO SEM AMBIGUIDADE
SELECT '=== CRIANDO FUNÇÃO SEM AMBIGUIDADE ===' as info;

CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id_atual UUID;
    meta_record RECORD;
    qtd_atual INTEGER;
    percentual_calc NUMERIC(5,2);
    status_val VARCHAR(20);
    tipo_meta_atual TEXT;
BEGIN
    -- Log de entrada
    RAISE NOTICE '🔄 TRIGGER: Processando % para tabela %', TG_OP, TG_TABLE_NAME;
    
    -- Determinar o ID do usuário e tipo de meta baseado na tabela
    CASE TG_TABLE_NAME
        WHEN 'termos_ambientais' THEN
            usuario_id_atual := NEW.emitido_por_usuario_id;
            tipo_meta_atual := 'termo';
            RAISE NOTICE '👤 Usuário termos: %', usuario_id_atual;
        WHEN 'lvs' THEN
            usuario_id_atual := NEW.usuario_id;
            tipo_meta_atual := 'lv';
            RAISE NOTICE '👤 Usuário LVs: %', usuario_id_atual;
        WHEN 'lv_residuos' THEN
            usuario_id_atual := NEW.usuario_id;
            tipo_meta_atual := 'lv';
            RAISE NOTICE '👤 Usuário LVs resíduos: %', usuario_id_atual;
        WHEN 'atividades_rotina' THEN
            usuario_id_atual := NEW.tma_responsavel_id;
            tipo_meta_atual := 'rotina';
            RAISE NOTICE '👤 Usuário rotinas: %', usuario_id_atual;
        ELSE
            RAISE NOTICE '⚠️ Tabela não suportada: %', TG_TABLE_NAME;
            RETURN NEW;
    END CASE;
    
    -- Se não há usuário, não fazer nada
    IF usuario_id_atual IS NULL THEN
        RAISE NOTICE '⚠️ Usuário NULL, ignorando...';
        RETURN NEW;
    END IF;
    
    -- Buscar APENAS metas do tipo correspondente à tabela atual
    FOR meta_record IN 
        SELECT 
            m.id,
            m.descricao,
            m.tipo_meta,
            m.escopo,
            m.meta_quantidade,
            m.periodo,
            m.ano,
            m.mes,
            ma.meta_quantidade_individual
        FROM metas m
        LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = usuario_id_atual
        WHERE m.ativa = true
        AND m.tipo_meta = tipo_meta_atual  -- ✅ FILTRO ESPECÍFICO POR TIPO
        AND (
            (m.escopo = 'equipe') OR
            (m.escopo = 'individual' AND ma.tma_id = usuario_id_atual)
        )
    LOOP
        RAISE NOTICE '🎯 Processando meta: % (%s)', meta_record.descricao, meta_record.tipo_meta;
        
        -- Calcular quantidade atual baseada no tipo de meta (SEM AMBIGUIDADE)
        CASE tipo_meta_atual
            WHEN 'termo' THEN
                -- ✅ APENAS termos ambientais
                SELECT COUNT(*) INTO qtd_atual
                FROM termos_ambientais
                WHERE emitido_por_usuario_id = usuario_id_atual
                AND EXTRACT(YEAR FROM data_termo) = meta_record.ano
                AND EXTRACT(MONTH FROM data_termo) = meta_record.mes;
                
            WHEN 'lv' THEN
                -- ✅ APENAS LVs (normais + resíduos)
                SELECT COUNT(*) INTO qtd_atual
                FROM (
                    SELECT usuario_id, created_at FROM lvs WHERE usuario_id = usuario_id_atual
                    UNION ALL
                    SELECT usuario_id, created_at FROM lv_residuos WHERE usuario_id = usuario_id_atual
                ) as todas_lvs
                WHERE EXTRACT(YEAR FROM created_at) = meta_record.ano
                AND EXTRACT(MONTH FROM created_at) = meta_record.mes;
                
            WHEN 'rotina' THEN
                -- ✅ APENAS atividades rotina
                SELECT COUNT(*) INTO qtd_atual
                FROM atividades_rotina
                WHERE tma_responsavel_id = usuario_id_atual
                AND EXTRACT(YEAR FROM created_at) = meta_record.ano
                AND EXTRACT(MONTH FROM created_at) = meta_record.mes;
                
            ELSE
                qtd_atual := 0;
        END CASE;
        
        RAISE NOTICE '📊 Quantidade atual (%s): %', tipo_meta_atual, qtd_atual;
        
        -- Calcular percentual alcançado
        IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
            percentual_calc := (qtd_atual::NUMERIC / meta_record.meta_quantidade_individual::NUMERIC) * 100;
            RAISE NOTICE '📈 Percentual individual: %%% (meta: %)', percentual_calc, meta_record.meta_quantidade_individual;
        ELSE
            percentual_calc := (qtd_atual::NUMERIC / meta_record.meta_quantidade::NUMERIC) * 100;
            RAISE NOTICE '📈 Percentual equipe: %%% (meta: %)', percentual_calc, meta_record.meta_quantidade;
        END IF;
        
        -- Determinar status
        IF percentual_calc >= 100 THEN
            status_val := 'alcancada';
        ELSIF percentual_calc >= 80 THEN
            status_val := 'em_andamento';
        ELSE
            status_val := 'em_andamento';
        END IF;
        
        RAISE NOTICE '🏷️ Status: %', status_val;
        
        -- Inserir ou atualizar progresso (usando UPSERT)
        INSERT INTO progresso_metas (
            meta_id,
            tma_id,
            periodo,
            ano,
            mes,
            quantidade_atual,
            percentual_alcancado,
            status,
            ultima_atualizacao
        ) VALUES (
            meta_record.id,
            CASE WHEN meta_record.escopo = 'individual' THEN usuario_id_atual ELSE NULL END,
            meta_record.periodo,
            meta_record.ano,
            meta_record.mes,
            qtd_atual,
            percentual_calc,
            status_val,
            NOW()
        )
        ON CONFLICT (meta_id, tma_id, periodo, ano, mes)
        DO UPDATE SET
            quantidade_atual = EXCLUDED.quantidade_atual,
            percentual_alcancado = EXCLUDED.percentual_alcancado,
            status = EXCLUDED.status,
            ultima_atualizacao = NOW();
            
        RAISE NOTICE '✅ Progresso atualizado para meta %s (%s)', meta_record.id, tipo_meta_atual;
    END LOOP;
    
    RAISE NOTICE '✅ Trigger concluído com sucesso para %s', tipo_meta_atual;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ Erro no trigger (%s): %', tipo_meta_atual, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICAR FUNÇÃO CRIADA
SELECT '=== FUNÇÃO CRIADA ===' as info;

SELECT 
    'FUNÇÃO:' as tipo,
    proname as nome,
    '✅ CRIADA SEM AMBIGUIDADE' as status
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- 5. CRIAR TRIGGERS (usando a função sem ambiguidade)
SELECT '=== CRIANDO TRIGGERS ===' as info;

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

-- 6. VERIFICAR TRIGGERS
SELECT '=== TRIGGERS CRIADOS ===' as info;

SELECT 
    'TRIGGER:' as tipo,
    tgname as nome,
    tgrelid::regclass as tabela,
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

-- 9. TESTE DE FUNCIONAMENTO
SELECT '=== TESTE DE FUNCIONAMENTO ===' as info;

-- Verificar se há metas ativas para testar
SELECT 
    'METAS ATIVAS:' as tipo,
    tipo_meta,
    COUNT(*) as total_metas
FROM metas 
WHERE ativa = true
GROUP BY tipo_meta
ORDER BY tipo_meta; 