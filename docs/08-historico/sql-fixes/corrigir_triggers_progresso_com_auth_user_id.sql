-- ===================================================================
-- CORRIGIR TRIGGERS DE PROGRESSO PARA INCLUIR auth_user_id
-- ===================================================================

-- 1. Função que calcula progresso E popula auth_user_id
CREATE OR REPLACE FUNCTION calcular_progresso_metas_com_auth_id()
RETURNS TRIGGER AS $$
DECLARE
    meta_record RECORD;
    qtd_atual INTEGER;
    percentual_calc NUMERIC;
    status_val TEXT;
    percentual_alcancado_val NUMERIC;
    periodo_val TEXT;
    ano_val INTEGER;
    mes_val INTEGER;
    semana_val INTEGER;
    dia_val INTEGER;
    tma_id_val UUID;
    auth_user_id_val UUID;
    progresso_existente RECORD;
BEGIN
    -- Determinar o ID do usuário e auth_user_id baseado na tabela
    IF TG_TABLE_NAME = 'termos_ambientais' THEN
        tma_id_val := NEW.emitido_por_usuario_id;
    ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
        tma_id_val := NEW.tma_responsavel_id;
    ELSIF TG_TABLE_NAME = 'lv_residuos' THEN
        tma_id_val := NEW.usuario_id;
    ELSIF TG_TABLE_NAME = 'inspecoes_lv' THEN
        tma_id_val := NEW.usuario_id;
    ELSE
        RETURN NEW; -- Tabela não reconhecida
    END IF;
    
    -- ✅ BUSCAR auth_user_id correspondente
    SELECT auth_user_id INTO auth_user_id_val
    FROM usuarios 
    WHERE id = tma_id_val;
    
    IF auth_user_id_val IS NULL THEN
        RAISE WARNING 'auth_user_id não encontrado para tma_id: %', tma_id_val;
        RETURN NEW; -- Continuar sem erro
    END IF;
    
    -- Buscar metas ativas para este usuário
    FOR meta_record IN 
        SELECT m.*, ma.meta_quantidade_individual
        FROM metas m
        JOIN metas_atribuicoes ma ON m.id = ma.meta_id
        WHERE ma.tma_id = tma_id_val 
          AND m.ativa = true
          AND (
            (TG_TABLE_NAME = 'termos_ambientais' AND m.tipo_meta = 'termo') OR
            (TG_TABLE_NAME = 'atividades_rotina' AND m.tipo_meta = 'rotina') OR
            (TG_TABLE_NAME IN ('lv_residuos', 'inspecoes_lv') AND m.tipo_meta = 'lv')
          )
    LOOP
        -- Definir período baseado na meta
        periodo_val := meta_record.periodo;
        ano_val := COALESCE(meta_record.ano, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
        
        CASE periodo_val
            WHEN 'diario' THEN
                mes_val := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
                dia_val := EXTRACT(DAY FROM CURRENT_DATE)::INTEGER;
                semana_val := NULL;
            WHEN 'semanal' THEN
                mes_val := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
                semana_val := EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER;
                dia_val := NULL;
            WHEN 'mensal' THEN
                mes_val := COALESCE(meta_record.mes, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);
                semana_val := NULL;
                dia_val := NULL;
            ELSE -- anual
                mes_val := NULL;
                semana_val := NULL;
                dia_val := NULL;
        END CASE;
        
        -- Calcular quantidade atual baseada no tipo
        qtd_atual := 0;
        
        IF meta_record.tipo_meta = 'termo' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM termos_ambientais
            WHERE emitido_por_usuario_id = tma_id_val
              AND EXTRACT(YEAR FROM data_termo) = ano_val
              AND (mes_val IS NULL OR EXTRACT(MONTH FROM data_termo) = mes_val)
              AND (semana_val IS NULL OR EXTRACT(WEEK FROM data_termo) = semana_val)
              AND (dia_val IS NULL OR EXTRACT(DAY FROM data_termo) = dia_val);
              
        ELSIF meta_record.tipo_meta = 'rotina' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM atividades_rotina
            WHERE tma_responsavel_id = tma_id_val
              AND status = 'Concluída'
              AND EXTRACT(YEAR FROM data_atividade) = ano_val
              AND (mes_val IS NULL OR EXTRACT(MONTH FROM data_atividade) = mes_val)
              AND (semana_val IS NULL OR EXTRACT(WEEK FROM data_atividade) = semana_val)
              AND (dia_val IS NULL OR EXTRACT(DAY FROM data_atividade) = dia_val);
              
        ELSIF meta_record.tipo_meta = 'lv' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM (
                SELECT created_at FROM lv_residuos WHERE usuario_id = tma_id_val
                UNION ALL
                SELECT created_at FROM inspecoes_lv WHERE usuario_id = tma_id_val
            ) lv_unificado
            WHERE EXTRACT(YEAR FROM created_at) = ano_val
              AND (mes_val IS NULL OR EXTRACT(MONTH FROM created_at) = mes_val)
              AND (semana_val IS NULL OR EXTRACT(WEEK FROM created_at) = semana_val)
              AND (dia_val IS NULL OR EXTRACT(DAY FROM created_at) = dia_val);
        END IF;
        
        -- Calcular percentual usando meta_quantidade_individual se disponível
        IF meta_record.meta_quantidade_individual IS NOT NULL AND meta_record.meta_quantidade_individual > 0 THEN
            percentual_calc := (qtd_atual::NUMERIC / meta_record.meta_quantidade_individual::NUMERIC) * 100;
        ELSIF meta_record.meta_quantidade > 0 THEN
            percentual_calc := (qtd_atual::NUMERIC / meta_record.meta_quantidade::NUMERIC) * 100;
        ELSE
            percentual_calc := 0;
        END IF;
        
        -- Determinar status
        IF percentual_calc >= 100 THEN
            status_val := 'alcancada';
            percentual_alcancado_val := 100;
        ELSIF percentual_calc >= 80 THEN
            status_val := 'em_andamento';
            percentual_alcancado_val := percentual_calc;
        ELSE
            status_val := 'em_andamento';
            percentual_alcancado_val := percentual_calc;
        END IF;
        
        -- Verificar se já existe progresso
        SELECT * INTO progresso_existente
        FROM progresso_metas
        WHERE meta_id = meta_record.id
          AND (tma_id = tma_id_val OR auth_user_id = auth_user_id_val)
          AND periodo = periodo_val
          AND ano = ano_val
          AND (mes_val IS NULL OR mes = mes_val)
          AND (semana_val IS NULL OR semana = semana_val)
          AND (dia_val IS NULL OR dia = dia_val);
        
        IF progresso_existente.id IS NOT NULL THEN
            -- ✅ ATUALIZAR incluindo auth_user_id
            UPDATE progresso_metas 
            SET quantidade_atual = qtd_atual,
                percentual_atual = percentual_calc,
                percentual_alcancado = percentual_alcancado_val,
                status = status_val,
                ultima_atualizacao = NOW(),
                updated_at = NOW(),
                tma_id = tma_id_val,
                auth_user_id = auth_user_id_val
            WHERE id = progresso_existente.id;
        ELSE
            -- ✅ INSERIR novo com auth_user_id
            INSERT INTO progresso_metas (
                meta_id, periodo, ano, mes, semana, dia,
                quantidade_atual, percentual_atual, percentual_alcancado,
                status, ultima_atualizacao, tma_id, auth_user_id
            ) VALUES (
                meta_record.id, periodo_val, ano_val, mes_val, semana_val, dia_val,
                qtd_atual, percentual_calc, percentual_alcancado_val,
                status_val, NOW(), tma_id_val, auth_user_id_val
            );
        END IF;
        
        RAISE NOTICE '✅ [TRIGGER] Progresso atualizado para meta % - User: % (auth: %)', 
                     meta_record.id, tma_id_val, auth_user_id_val;
    END LOOP;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '⚠️ Erro no trigger calcular_progresso_metas_com_auth_id: %', SQLERRM;
        RETURN NEW; -- Não bloquear a operação
END;
$$ LANGUAGE plpgsql;

-- 2. Aplicar triggers nas tabelas relevantes
-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS calcular_progresso_metas ON termos_ambientais;

-- Criar novo trigger que inclui auth_user_id
CREATE TRIGGER trigger_calcular_progresso_termos_com_auth
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas_com_auth_id();

-- Rotinas
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;
DROP TRIGGER IF EXISTS calcular_progresso_metas ON atividades_rotina;
CREATE TRIGGER trigger_calcular_progresso_rotinas_com_auth
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas_com_auth_id();

-- LV Resíduos
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS calcular_progresso_metas ON lv_residuos;
CREATE TRIGGER trigger_calcular_progresso_lv_residuos_com_auth
    AFTER INSERT OR UPDATE ON lv_residuos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas_com_auth_id();

-- Se a tabela inspecoes_lv existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inspecoes_lv') THEN
    DROP TRIGGER IF EXISTS trigger_calcular_progresso_inspecoes ON inspecoes_lv;
    DROP TRIGGER IF EXISTS calcular_progresso_metas ON inspecoes_lv;
    CREATE TRIGGER trigger_calcular_progresso_inspecoes_com_auth
        AFTER INSERT OR UPDATE ON inspecoes_lv
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas_com_auth_id();
    RAISE NOTICE '✅ Trigger criado para inspecoes_lv';
  END IF;
END $$;

-- 3. Teste do sistema completo
INSERT INTO termos_ambientais (
    id,
    numero_termo,
    data_termo,
    tipo_termo,
    emitido_por_usuario_id,
    emitido_por_nome,
    destinatario_nome,
    local_atividade,
    area_equipamento_atividade,
    natureza_desvio,
    descricao_nc_1,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'TESTE-TRIGGER-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),
    CURRENT_DATE,
    'NOTIFICACAO',
    '2d7f480e-e42d-4b80-be70-97a4123fca09', -- João Silva
    'João Silva',
    'Responsável Teste',
    'Local de Teste',
    'Área de Teste',
    'OCORRENCIA_REAL',
    'Teste para verificar se o trigger popula auth_user_id automaticamente',
    NOW(),
    NOW()
);

-- 4. Verificar resultado
SELECT 
    '🎯 TESTE TRIGGER COMPLETO' as resultado,
    pm.id,
    pm.meta_id,
    pm.tma_id,
    pm.auth_user_id,
    pm.quantidade_atual,
    pm.percentual_atual,
    u.nome,
    m.descricao as meta_descricao,
    CASE 
        WHEN pm.auth_user_id IS NOT NULL THEN '✅ auth_user_id POPULADO'
        ELSE '❌ auth_user_id NÃO POPULADO'
    END as status_auth_id,
    CASE 
        WHEN pm.auth_user_id = u.auth_user_id THEN '✅ IDs COINCIDEM'
        ELSE '❌ IDs NÃO COINCIDEM'  
    END as verificacao_ids
FROM progresso_metas pm
JOIN usuarios u ON pm.tma_id = u.id
JOIN metas m ON pm.meta_id = m.id
WHERE u.nome LIKE '%João%'
  AND pm.updated_at >= NOW() - INTERVAL '5 minutes'
ORDER BY pm.updated_at DESC
LIMIT 5; 