-- ===================================================================
-- CORREÇÃO DE TODAS AS AMBIGUIDADES DE COLUNAS
-- ===================================================================

-- PROBLEMA: Múltiplas ambiguidades de colunas na função calcular_progresso_metas
-- - column reference "quantidade_atual" is ambiguous
-- - column reference "percentual_alcancado" is ambiguous
-- - column reference "status" is ambiguous

-- ===================================================================
-- 1. REMOVER TRIGGERS E FUNÇÃO EXISTENTES
-- ===================================================================

-- Remover triggers existentes
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- Remover função existente
DROP FUNCTION IF EXISTS calcular_progresso_metas();

-- ===================================================================
-- 2. CRIAR FUNÇÃO CORRIGIDA (SEM AMBIGUIDADES)
-- ===================================================================

CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id_atual UUID;
    meta_record RECORD;
    progresso_record RECORD;
    qtd_atual INTEGER; -- ✅ Renomeada para evitar ambiguidade
    percentual_calc DECIMAL(5,2); -- ✅ Renomeada para evitar ambiguidade
    status_calc TEXT; -- ✅ Renomeada para evitar ambiguidade
BEGIN
    -- Obter ID do usuário atual (corrigido para cada tabela)
    CASE TG_TABLE_NAME
        WHEN 'termos_ambientais' THEN
            usuario_id_atual := NEW.emitido_por_usuario_id;
        WHEN 'lvs' THEN
            usuario_id_atual := NEW.usuario_id;
        WHEN 'lv_residuos' THEN
            usuario_id_atual := NEW.usuario_id;
        WHEN 'atividades_rotina' THEN
            usuario_id_atual := NEW.tma_responsavel_id;
        ELSE
            usuario_id_atual := NULL;
    END CASE;
    
    IF usuario_id_atual IS NULL THEN
        RETURN NEW;
    END IF;

            -- Buscar metas ativas para o usuário
        FOR meta_record IN 
            SELECT 
                m.id,
                m.tipo_meta,
                m.periodo,
                m.ano,
                m.mes,
                m.meta_quantidade,
                ma.meta_quantidade_individual, -- ✅ Coluna correta da tabela metas_atribuicoes
                m.escopo
            FROM metas m
            JOIN metas_atribuicoes ma ON m.id = ma.meta_id
            WHERE ma.tma_id = usuario_id_atual
            AND m.ativa = true
            AND m.tipo_meta IN ('termo', 'lv', 'rotina')
        LOOP
        -- Calcular quantidade atual baseada no tipo de meta
        CASE meta_record.tipo_meta
            WHEN 'termo' THEN
                -- CORREÇÃO: Usar data_termo em vez de created_at
                SELECT COUNT(*) INTO qtd_atual
                FROM termos_ambientais ta
                WHERE ta.emitido_por_usuario_id = usuario_id_atual
                AND EXTRACT(YEAR FROM ta.data_termo) = meta_record.ano
                AND EXTRACT(MONTH FROM ta.data_termo) = meta_record.mes;
            WHEN 'lv' THEN
                -- Contar LVs normais e de resíduos
                SELECT COUNT(*) INTO qtd_atual
                FROM (
                    SELECT l.usuario_id, l.created_at FROM lvs l
                    WHERE l.usuario_id = usuario_id_atual
                    UNION ALL
                    SELECT lr.usuario_id, lr.created_at FROM lv_residuos lr
                    WHERE lr.usuario_id = usuario_id_atual
                ) todas_lvs
                WHERE EXTRACT(YEAR FROM todas_lvs.created_at) = meta_record.ano
                AND EXTRACT(MONTH FROM todas_lvs.created_at) = meta_record.mes;
            WHEN 'rotina' THEN
                SELECT COUNT(*) INTO qtd_atual
                FROM atividades_rotina ar
                WHERE ar.tma_responsavel_id = usuario_id_atual
                AND EXTRACT(YEAR FROM ar.data_atividade) = meta_record.ano
                AND EXTRACT(MONTH FROM ar.data_atividade) = meta_record.mes;
            ELSE
                qtd_atual := 0;
        END CASE;

        -- Calcular percentual alcançado
        IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
            percentual_calc := (qtd_atual::DECIMAL / meta_record.meta_quantidade_individual) * 100;
        ELSE
            percentual_calc := (qtd_atual::DECIMAL / meta_record.meta_quantidade) * 100;
        END IF;

        -- Determinar status baseado no percentual
        IF percentual_calc >= 100 THEN
            status_calc := 'CONCLUIDA';
        ELSIF percentual_calc >= 75 THEN
            status_calc := 'EM_ANDAMENTO';
        ELSIF percentual_calc >= 50 THEN
            status_calc := 'EM_ANDAMENTO';
        ELSE
            status_calc := 'PENDENTE';
        END IF;

        -- Verificar se já existe progresso para esta meta
        SELECT * INTO progresso_record
        FROM progresso_metas pm
        WHERE pm.meta_id = meta_record.id
        AND pm.tma_id = usuario_id_atual;

        -- Atualizar ou inserir progresso
        IF FOUND THEN
            UPDATE progresso_metas
            SET 
                quantidade_atual = qtd_atual,
                percentual_alcancado = percentual_calc,
                status = status_calc,
                ultima_atualizacao = NOW()
            WHERE meta_id = meta_record.id
            AND tma_id = usuario_id_atual;
        ELSE
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
                usuario_id_atual,
                meta_record.periodo,
                meta_record.ano,
                meta_record.mes,
                qtd_atual,
                percentual_calc,
                status_calc,
                NOW()
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 3. CRIAR TRIGGERS
-- ===================================================================

-- Trigger para termos ambientais
CREATE TRIGGER trigger_calcular_progresso_termos
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para LVs normais
CREATE TRIGGER trigger_calcular_progresso_lvs
    AFTER INSERT OR UPDATE ON lvs
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para LVs de resíduos
CREATE TRIGGER trigger_calcular_progresso_lv_residuos
    AFTER INSERT OR UPDATE ON lv_residuos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para atividades de rotina
CREATE TRIGGER trigger_calcular_progresso_rotinas
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- ===================================================================
-- 4. VERIFICAR TRIGGERS CRIADOS
-- ===================================================================

SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE '%calcular_progresso%'
ORDER BY tgname;

-- ===================================================================
-- 5. TESTE DE FUNCIONAMENTO
-- ===================================================================

-- Verificar se a função foi criada corretamente
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- Verificar se há dados nas tabelas relacionadas
SELECT 
    'metas' as tabela,
    COUNT(*) as total_registros
FROM metas
UNION ALL
SELECT 
    'metas_atribuicoes' as tabela,
    COUNT(*) as total_registros
FROM metas_atribuicoes
UNION ALL
SELECT 
    'progresso_metas' as tabela,
    COUNT(*) as total_registros
FROM progresso_metas;

-- ===================================================================
-- 6. INSTRUÇÕES PARA TESTE
-- ===================================================================

/*
APÓS EXECUTAR ESTE SCRIPT:

1. Teste criar um termo ambiental
2. Verifique se não há mais erros de ambiguidade
3. Verifique se o progresso de metas é calculado automaticamente
4. Teste criar uma atividade de rotina
5. Teste criar uma LV

SE AINDA HOUVER PROBLEMAS:

1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase
3. Execute as verificações SQL listadas acima
4. Consulte a documentação de troubleshooting
*/ 