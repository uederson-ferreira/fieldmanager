-- CORRIGIR AMBIGUIDADE DA COLUNA META_ID
-- Especificar melhor as tabelas nas queries para evitar ambiguidade

-- 1. Corrigir função calcular_progresso_termos
DROP FUNCTION IF EXISTS calcular_progresso_termos() CASCADE;

CREATE OR REPLACE FUNCTION calcular_progresso_termos()
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
    
    -- Determinar valores baseados no termo
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
        
        -- Calcular quantidade atual
        SELECT COUNT(*) INTO qtd_atual
        FROM termos_ambientais 
        WHERE emitido_por_usuario_id = tma_id_val
          AND EXTRACT(YEAR FROM data_termo) = ano_val
          AND EXTRACT(MONTH FROM data_termo) = mes_val;
        
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
        
        -- Inserir ou atualizar progresso (sem qualificação na tabela)
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

-- 2. Corrigir função calcular_progresso_lvs
DROP FUNCTION IF EXISTS calcular_progresso_lvs() CASCADE;

CREATE OR REPLACE FUNCTION calcular_progresso_lvs()
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
    
    -- Determinar valores baseados na LV
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
        
        -- Calcular quantidade atual (soma de lv_residuos + lvs)
        SELECT 
            (SELECT COUNT(*) FROM lv_residuos 
             WHERE usuario_id = tma_id_val
               AND EXTRACT(YEAR FROM data_preenchimento) = ano_val
               AND EXTRACT(MONTH FROM data_preenchimento) = mes_val) +
            (SELECT COUNT(*) FROM lvs 
             WHERE usuario_id = tma_id_val
               AND EXTRACT(YEAR FROM data_preenchimento) = ano_val
               AND EXTRACT(MONTH FROM data_preenchimento) = mes_val)
        INTO qtd_atual;
        
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
        
        -- Inserir ou atualizar progresso (sem qualificação na tabela)
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

-- 3. Corrigir função calcular_progresso_rotinas
DROP FUNCTION IF EXISTS calcular_progresso_rotinas() CASCADE;

CREATE OR REPLACE FUNCTION calcular_progresso_rotinas()
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
    
    -- Determinar valores baseados na atividade
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
        
        -- Calcular quantidade atual
        SELECT COUNT(*) INTO qtd_atual
        FROM atividades_rotina 
        WHERE tma_responsavel_id = tma_id_val
          AND EXTRACT(YEAR FROM data_atividade) = ano_val
          AND EXTRACT(MONTH FROM data_atividade) = mes_val;
        
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
        
        -- Inserir ou atualizar progresso (sem qualificação na tabela)
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

-- 4. Recriar triggers
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_insert ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_update ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_delete ON termos_ambientais;

CREATE TRIGGER trigger_calcular_progresso_termos_insert
AFTER INSERT ON termos_ambientais
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_termos();

CREATE TRIGGER trigger_calcular_progresso_termos_update
AFTER UPDATE ON termos_ambientais
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_termos();

CREATE TRIGGER trigger_calcular_progresso_termos_delete
AFTER DELETE ON termos_ambientais
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_termos();

-- 5. Verificar funções corrigidas
SELECT 
    'FUNÇÕES CORRIGIDAS' as teste,
    proname as nome_funcao,
    proargtypes::regtype[] as tipos_argumentos,
    prorettype::regtype as tipo_retorno
FROM pg_proc 
WHERE proname IN ('calcular_progresso_termos', 'calcular_progresso_lvs', 'calcular_progresso_rotinas')
ORDER BY proname; 