-- CORRIGIR FUNÇÃO CALCULAR_PROGRESSO_METAS
-- Adicionar suporte para as 4 tabelas de metas:
-- lvs, lv_residuos, termos_ambientais, atividades_rotina
-- Incluir DROP FUNCTION para evitar erros de assinatura

DROP FUNCTION IF EXISTS calcular_progresso_metas() CASCADE;

CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    meta_id UUID;
    meta_quantidade_val INTEGER;
    meta_percentual_val NUMERIC(5,2);
    periodo_val TEXT;
    ano_val INTEGER;
    mes_val INTEGER;
    semana_val INTEGER;
    dia_val INTEGER;
    tma_id_val UUID;
    qtd_atual INTEGER;
    percentual_calc NUMERIC(5,2);
    status_val TEXT;
    meta_info RECORD;
    atribuicao_info RECORD;
BEGIN
    SET search_path = public;
    
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
        
    ELSIF TG_TABLE_NAME = 'lvs' THEN
        -- Para LVs gerais (nova tabela)
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
        
    ELSE
        -- Tabela não suportada
        RETURN NEW;
    END IF;
    
    -- Se encontrou uma meta, calcular progresso
    IF meta_id IS NOT NULL THEN
        -- Calcular quantidade atual baseada na tabela
        IF TG_TABLE_NAME = 'termos_ambientais' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM termos_ambientais 
            WHERE emitido_por_usuario_id = tma_id_val
              AND EXTRACT(YEAR FROM data_termo) = ano_val
              AND EXTRACT(MONTH FROM data_termo) = mes_val;
              
        ELSIF TG_TABLE_NAME = 'lv_residuos' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM lv_residuos 
            WHERE usuario_id = tma_id_val
              AND EXTRACT(YEAR FROM data_preenchimento) = ano_val
              AND EXTRACT(MONTH FROM data_preenchimento) = mes_val;
              
        ELSIF TG_TABLE_NAME = 'lvs' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM lvs 
            WHERE usuario_id = tma_id_val
              AND EXTRACT(YEAR FROM data_preenchimento) = ano_val
              AND EXTRACT(MONTH FROM data_preenchimento) = mes_val;
              
        ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM atividades_rotina 
            WHERE tma_responsavel_id = tma_id_val
              AND EXTRACT(YEAR FROM data_atividade) = ano_val
              AND EXTRACT(MONTH FROM data_atividade) = mes_val;
        END IF;
        
        -- Calcular percentual alcançado
        IF meta_quantidade_val > 0 THEN
            percentual_calc := (qtd_atual::NUMERIC / meta_quantidade_val::NUMERIC) * 100;
        ELSE
            percentual_calc := 0;
        END IF;
        
        -- Determinar status
        IF percentual_calc >= 100 THEN
            status_val := 'alcancada';
        ELSIF percentual_calc >= 80 THEN
            status_val := 'em_andamento';
        ELSE
            status_val := 'nao_alcancada';
        END IF;
        
        -- Inserir ou atualizar progresso
        INSERT INTO progresso_metas (
            meta_id, tma_id, periodo, ano, mes, semana, dia,
            quantidade_atual, percentual_alcancado, status
        ) VALUES (
            meta_id, tma_id_val, periodo_val, ano_val, mes_val, semana_val, dia_val,
            qtd_atual, percentual_calc, status_val
        ) ON CONFLICT (meta_id, periodo, ano, mes, semana, dia) 
        DO UPDATE SET
            quantidade_atual = EXCLUDED.quantidade_atual,
            percentual_alcancado = EXCLUDED.percentual_alcancado,
            status = EXCLUDED.status,
            ultima_atualizacao = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a função foi criada corretamente
SELECT 
    'FUNÇÃO CALCULAR_PROGRESSO_METAS' as teste,
    proname as nome_funcao,
    proargtypes::regtype[] as tipos_argumentos,
    prorettype::regtype as tipo_retorno
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas'; 