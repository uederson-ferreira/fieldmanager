-- ===================================================================
-- CORREÇÃO DA AMBIGUIDADE DA COLUNA meta_quantidade
-- ===================================================================

-- PROBLEMA: column reference "meta_quantidade" is ambiguous
-- CAUSA: A coluna meta_quantidade existe em múltiplas tabelas

-- ===================================================================
-- SOLUÇÃO: Qualificar todas as referências à meta_quantidade
-- ===================================================================

-- Recriar a função com todas as referências qualificadas
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    -- Variáveis renomeadas para evitar ambiguidade
    qtd_atual INTEGER;
    percentual_calc NUMERIC(5,2);
    meta_quantidade_val INTEGER;
    meta_percentual_val NUMERIC(5,2);
    meta_id UUID;
    periodo_val VARCHAR(20);
    ano_val INTEGER;
    mes_val INTEGER;
    semana_val INTEGER;
    dia_val INTEGER;
    tma_id_val UUID;
    status_val VARCHAR(20);
    percentual_alcancado_val NUMERIC(5,2);
    progresso_existente RECORD;
    meta_info RECORD;
    atribuicao_info RECORD;
BEGIN
    -- Determinar o tipo de registro baseado na tabela
    IF TG_TABLE_NAME = 'termos_ambientais' THEN
        -- Para termos ambientais
        meta_id := NULL;
        periodo_val := 'mensal';
        ano_val := EXTRACT(YEAR FROM NEW.data_termo);
        mes_val := EXTRACT(MONTH FROM NEW.data_termo);
        semana_val := EXTRACT(WEEK FROM NEW.data_termo);
        dia_val := EXTRACT(DAY FROM NEW.data_termo);
        tma_id_val := NEW.emitido_por_usuario_id;
        
        -- Buscar meta de termos para o período
        SELECT m.id, m.meta_quantidade, m.meta_percentual 
        INTO meta_info 
        FROM metas m
        WHERE m.tipo_meta = 'termo' 
          AND m.periodo = periodo_val 
          AND m.ano = ano_val 
          AND m.mes = mes_val 
          AND m.ativa = true 
        LIMIT 1;
        
        IF meta_info.id IS NOT NULL THEN
            meta_id := meta_info.id;
            meta_quantidade_val := meta_info.meta_quantidade;
            meta_percentual_val := meta_info.meta_percentual;
            
            -- Buscar atribuição individual se existir
            SELECT ma.meta_quantidade_individual 
            INTO atribuicao_info 
            FROM metas_atribuicoes ma
            WHERE ma.meta_id = meta_info.id 
              AND ma.tma_id = tma_id_val;
            
            IF atribuicao_info.meta_quantidade_individual IS NOT NULL THEN
                meta_quantidade_val := atribuicao_info.meta_quantidade_individual;
            END IF;
        END IF;
        
    ELSIF TG_TABLE_NAME = 'lv_residuos' THEN
        -- Para LVs de resíduos
        meta_id := NULL;
        periodo_val := 'mensal';
        ano_val := EXTRACT(YEAR FROM NEW.data_preenchimento);
        mes_val := EXTRACT(MONTH FROM NEW.data_preenchimento);
        semana_val := EXTRACT(WEEK FROM NEW.data_preenchimento);
        dia_val := EXTRACT(DAY FROM NEW.data_preenchimento);
        tma_id_val := NEW.usuario_id;
        
        -- Buscar meta de LVs para o período
        SELECT m.id, m.meta_quantidade, m.meta_percentual 
        INTO meta_info 
        FROM metas m
        WHERE m.tipo_meta = 'lv' 
          AND m.periodo = periodo_val 
          AND m.ano = ano_val 
          AND m.mes = mes_val 
          AND m.ativa = true 
        LIMIT 1;
        
        IF meta_info.id IS NOT NULL THEN
            meta_id := meta_info.id;
            meta_quantidade_val := meta_info.meta_quantidade;
            meta_percentual_val := meta_info.meta_percentual;
            
            -- Buscar atribuição individual se existir
            SELECT ma.meta_quantidade_individual 
            INTO atribuicao_info 
            FROM metas_atribuicoes ma
            WHERE ma.meta_id = meta_info.id 
              AND ma.tma_id = tma_id_val;
            
            IF atribuicao_info.meta_quantidade_individual IS NOT NULL THEN
                meta_quantidade_val := atribuicao_info.meta_quantidade_individual;
            END IF;
        END IF;
        
    ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
        -- Para atividades de rotina
        meta_id := NULL;
        periodo_val := 'mensal';
        ano_val := EXTRACT(YEAR FROM NEW.data_atividade);
        mes_val := EXTRACT(MONTH FROM NEW.data_atividade);
        semana_val := EXTRACT(WEEK FROM NEW.data_atividade);
        dia_val := EXTRACT(DAY FROM NEW.data_atividade);
        tma_id_val := NEW.tma_responsavel_id;
        
        -- Buscar meta de rotinas para o período
        SELECT m.id, m.meta_quantidade, m.meta_percentual 
        INTO meta_info 
        FROM metas m
        WHERE m.tipo_meta = 'rotina' 
          AND m.periodo = periodo_val 
          AND m.ano = ano_val 
          AND m.mes = mes_val 
          AND m.ativa = true 
        LIMIT 1;
        
        IF meta_info.id IS NOT NULL THEN
            meta_id := meta_info.id;
            meta_quantidade_val := meta_info.meta_quantidade;
            meta_percentual_val := meta_info.meta_percentual;
            
            -- Buscar atribuição individual se existir
            SELECT ma.meta_quantidade_individual 
            INTO atribuicao_info 
            FROM metas_atribuicoes ma
            WHERE ma.meta_id = meta_info.id 
              AND ma.tma_id = tma_id_val;
            
            IF atribuicao_info.meta_quantidade_individual IS NOT NULL THEN
                meta_quantidade_val := atribuicao_info.meta_quantidade_individual;
            END IF;
        END IF;
    END IF;
    
    -- Se encontrou uma meta, calcular progresso
    IF meta_id IS NOT NULL THEN
        -- Verificar se já existe progresso para este período
        SELECT * INTO progresso_existente 
        FROM progresso_metas pm
        WHERE pm.meta_id = meta_id 
          AND pm.periodo = periodo_val 
          AND pm.ano = ano_val 
          AND pm.mes = mes_val 
          AND pm.semana = semana_val 
          AND pm.dia = dia_val;
        
        -- Calcular quantidade atual baseada no tipo
        IF TG_TABLE_NAME = 'termos_ambientais' THEN
            SELECT COALESCE(COUNT(*), 0) INTO qtd_atual
            FROM termos_ambientais ta
            WHERE ta.emitido_por_usuario_id = tma_id_val
              AND EXTRACT(YEAR FROM ta.data_termo) = ano_val
              AND EXTRACT(MONTH FROM ta.data_termo) = mes_val
              AND EXTRACT(WEEK FROM ta.data_termo) = semana_val
              AND EXTRACT(DAY FROM ta.data_termo) = dia_val;
              
        ELSIF TG_TABLE_NAME = 'lv_residuos' THEN
            SELECT COALESCE(COUNT(*), 0) INTO qtd_atual
            FROM lv_residuos lr
            WHERE lr.usuario_id = tma_id_val
              AND EXTRACT(YEAR FROM lr.data_preenchimento) = ano_val
              AND EXTRACT(MONTH FROM lr.data_preenchimento) = mes_val
              AND EXTRACT(WEEK FROM lr.data_preenchimento) = semana_val
              AND EXTRACT(DAY FROM lr.data_preenchimento) = dia_val;
              
        ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
            SELECT COALESCE(COUNT(*), 0) INTO qtd_atual
            FROM atividades_rotina ar
            WHERE ar.tma_responsavel_id = tma_id_val
              AND EXTRACT(YEAR FROM ar.data_atividade) = ano_val
              AND EXTRACT(MONTH FROM ar.data_atividade) = mes_val
              AND EXTRACT(WEEK FROM ar.data_atividade) = semana_val
              AND EXTRACT(DAY FROM ar.data_atividade) = dia_val;
        END IF;
        
        -- Calcular percentual atual
        IF meta_quantidade_val > 0 THEN
            percentual_calc := (qtd_atual::NUMERIC / meta_quantidade_val::NUMERIC) * 100;
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
        
        -- Inserir ou atualizar progresso
        IF progresso_existente.id IS NOT NULL THEN
            -- Atualizar progresso existente
            UPDATE progresso_metas 
            SET quantidade_atual = qtd_atual,
                percentual_atual = percentual_calc,
                percentual_alcancado = percentual_alcancado_val,
                status = status_val,
                ultima_atualizacao = NOW(),
                updated_at = NOW()
            WHERE id = progresso_existente.id;
        ELSE
            -- Inserir novo progresso
            INSERT INTO progresso_metas (
                meta_id, periodo, ano, mes, semana, dia,
                quantidade_atual, percentual_atual, percentual_alcancado,
                status, ultima_atualizacao, tma_id
            ) VALUES (
                meta_id, periodo_val, ano_val, mes_val, semana_val, dia_val,
                qtd_atual, percentual_calc, percentual_alcancado_val,
                status_val, NOW(), tma_id_val
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 