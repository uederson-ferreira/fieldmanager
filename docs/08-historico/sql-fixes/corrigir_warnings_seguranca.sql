-- SCRIPT PARA CORRIGIR WARNINGS DE SEGURANÇA
-- Adiciona SET search_path = public em todas as funções que têm warning

-- 1. Corrigir função get_termos_storage_stats
DROP FUNCTION IF EXISTS get_termos_storage_stats();
CREATE OR REPLACE FUNCTION get_termos_storage_stats()
RETURNS TABLE (
    total_termos BIGINT,
    termo_photos_count BIGINT,
    termo_photos_size BIGINT,
    termo_photos_avg_size NUMERIC
) AS $$
BEGIN
    SET search_path = public;
    
    RETURN QUERY
    SELECT 
        COUNT(*) as total_termos,
        COUNT(photos) as termo_photos_count,
        COALESCE(SUM(JSONB_ARRAY_LENGTH(photos)), 0) as termo_photos_size,
        CASE 
            WHEN COUNT(photos) > 0 THEN 
                ROUND(SUM(JSONB_ARRAY_LENGTH(photos))::NUMERIC / COUNT(photos), 2)
            ELSE 0 
        END as termo_photos_avg_size
    FROM termos_ambientais;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Corrigir função calcular_progresso_metas (versão simplificada)
DROP FUNCTION IF EXISTS calcular_progresso_metas() CASCADE;
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
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
    -- Definir search_path para resolver warning de segurança
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
        
    ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
        -- Para atividades de rotina
        meta_id := NULL;
        periodo_val := 'mensal';
        ano_val := EXTRACT(YEAR FROM NEW.data_atividade);
        mes_val := EXTRACT(MONTH FROM NEW.data_atividade);
        semana_val := EXTRACT(WEEK FROM NEW.data_atividade);
        dia_val := EXTRACT(DAY FROM NEW.data_atividade);
        tma_id_val := NEW.tma_id;
        
        -- Buscar meta de atividades para o período
        SELECT m.id, m.meta_quantidade, m.meta_percentual 
        INTO meta_info 
        FROM metas m
        WHERE m.tipo_meta = 'atividade' 
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
        -- Calcular quantidade atual
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
        ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM atividades_rotina
            WHERE tma_id = tma_id_val
              AND EXTRACT(YEAR FROM data_atividade) = ano_val
              AND EXTRACT(MONTH FROM data_atividade) = mes_val;
        END IF;
        
        -- Calcular percentual
        IF meta_quantidade_val > 0 THEN
            percentual_calc := ROUND((qtd_atual::NUMERIC / meta_quantidade_val) * 100, 2);
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
        
        -- Verificar se já existe progresso para esta meta e TMA
        SELECT * INTO progresso_existente
        FROM progresso_metas
        WHERE meta_id = meta_id AND tma_id = tma_id_val;
        
        IF progresso_existente IS NOT NULL THEN
            -- Atualizar progresso existente
            UPDATE progresso_metas
            SET 
                quantidade_atual = qtd_atual,
                percentual_alcancado = percentual_calc,
                status = status_val,
                updated_at = NOW()
            WHERE meta_id = meta_id AND tma_id = tma_id_val;
        ELSE
            -- Inserir novo progresso
            INSERT INTO progresso_metas (
                meta_id, tma_id, quantidade_atual, percentual_alcancado, status
            ) VALUES (
                meta_id, tma_id_val, qtd_atual, percentual_calc, status_val
            );
        END IF;
        
        -- Calcular progresso da equipe (sem tma_id)
        IF TG_TABLE_NAME = 'termos_ambientais' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM termos_ambientais
            WHERE EXTRACT(YEAR FROM data_termo) = ano_val
              AND EXTRACT(MONTH FROM data_termo) = mes_val;
        ELSIF TG_TABLE_NAME = 'lv_residuos' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM lv_residuos
            WHERE EXTRACT(YEAR FROM data_preenchimento) = ano_val
              AND EXTRACT(MONTH FROM data_preenchimento) = mes_val;
        ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM atividades_rotina
            WHERE EXTRACT(YEAR FROM data_atividade) = ano_val
              AND EXTRACT(MONTH FROM data_atividade) = mes_val;
        END IF;
        
        -- Calcular percentual da equipe
        IF meta_quantidade_val > 0 THEN
            percentual_calc := ROUND((qtd_atual::NUMERIC / meta_quantidade_val) * 100, 2);
        ELSE
            percentual_calc := 0;
        END IF;
        
        -- Determinar status da equipe
        IF percentual_calc >= 100 THEN
            status_val := 'alcancada';
        ELSIF percentual_calc >= 80 THEN
            status_val := 'em_andamento';
        ELSE
            status_val := 'nao_alcancada';
        END IF;
        
        -- Verificar se já existe progresso da equipe para esta meta
        SELECT * INTO progresso_existente
        FROM progresso_metas
        WHERE meta_id = meta_id AND tma_id IS NULL;
        
        IF progresso_existente IS NOT NULL THEN
            -- Atualizar progresso da equipe
            UPDATE progresso_metas
            SET 
                quantidade_atual = qtd_atual,
                percentual_alcancado = percentual_calc,
                status = status_val,
                updated_at = NOW()
            WHERE meta_id = meta_id AND tma_id IS NULL;
        ELSE
            -- Inserir progresso da equipe
            INSERT INTO progresso_metas (
                meta_id, tma_id, quantidade_atual, percentual_alcancado, status
            ) VALUES (
                meta_id, NULL, qtd_atual, percentual_calc, status_val
            );
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erro no trigger calcular_progresso_metas: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Corrigir função monitorar_trigger_termos
DROP FUNCTION IF EXISTS monitorar_trigger_termos() CASCADE;
CREATE OR REPLACE FUNCTION monitorar_trigger_termos()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = public;
    
    -- Log da operação
    INSERT INTO logs_sistema (
        tabela, operacao, registro_id, dados_anteriores, dados_novos, usuario_id
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        to_jsonb(NEW),
        COALESCE(NEW.emitido_por_usuario_id, auth.uid())
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Corrigir função update_updated_at_column
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = public;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Corrigir função calcular_progresso_rotinas
DROP FUNCTION IF EXISTS calcular_progresso_rotinas() CASCADE;
CREATE OR REPLACE FUNCTION calcular_progresso_rotinas()
RETURNS TRIGGER AS $$
DECLARE
    qtd_atual INTEGER;
    percentual_calc NUMERIC(5,2);
    meta_quantidade_val INTEGER;
    meta_percentual_val NUMERIC(5,2);
    meta_id UUID;
    periodo_val VARCHAR(20);
    ano_val INTEGER;
    mes_val INTEGER;
    tma_id_val UUID;
    status_val VARCHAR(20);
    progresso_existente RECORD;
    meta_info RECORD;
BEGIN
    SET search_path = public;
    
    -- Determinar valores baseados na atividade
    periodo_val := 'mensal';
    ano_val := EXTRACT(YEAR FROM NEW.data_atividade);
    mes_val := EXTRACT(MONTH FROM NEW.data_atividade);
    tma_id_val := NEW.tma_id;
    
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
        
        -- Calcular quantidade atual
        SELECT COUNT(*) INTO qtd_atual
        FROM atividades_rotina
        WHERE tma_id = tma_id_val
          AND EXTRACT(YEAR FROM data_atividade) = ano_val
          AND EXTRACT(MONTH FROM data_atividade) = mes_val;
        
        -- Calcular percentual
        IF meta_quantidade_val > 0 THEN
            percentual_calc := ROUND((qtd_atual::NUMERIC / meta_quantidade_val) * 100, 2);
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
        
        -- Verificar se já existe progresso
        SELECT * INTO progresso_existente
        FROM progresso_metas
        WHERE meta_id = meta_id AND tma_id = tma_id_val;
        
        IF progresso_existente IS NOT NULL THEN
            -- Atualizar progresso existente
            UPDATE progresso_metas
            SET 
                quantidade_atual = qtd_atual,
                percentual_alcancado = percentual_calc,
                status = status_val,
                updated_at = NOW()
            WHERE meta_id = meta_id AND tma_id = tma_id_val;
        ELSE
            -- Inserir novo progresso
            INSERT INTO progresso_metas (
                meta_id, tma_id, quantidade_atual, percentual_alcancado, status
            ) VALUES (
                meta_id, tma_id_val, qtd_atual, percentual_calc, status_val
            );
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erro no trigger calcular_progresso_rotinas: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Corrigir função atribuir_meta_a_todos_tmas
DROP FUNCTION IF EXISTS atribuir_meta_a_todos_tmas(UUID);
CREATE OR REPLACE FUNCTION atribuir_meta_a_todos_tmas(meta_id_param UUID)
RETURNS VOID AS $$
DECLARE
    tma_record RECORD;
BEGIN
    SET search_path = public;
    
    -- Buscar todos os TMAs ativos
    FOR tma_record IN 
        SELECT id FROM tmas WHERE ativo = true
    LOOP
        -- Inserir atribuição se não existir
        INSERT INTO metas_atribuicoes (meta_id, tma_id)
        VALUES (meta_id_param, tma_record.id)
        ON CONFLICT (meta_id, tma_id) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Corrigir função gerar_proximo_numero_termo
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo();
CREATE OR REPLACE FUNCTION gerar_proximo_numero_termo()
RETURNS VARCHAR AS $$
DECLARE
    ano_atual INTEGER;
    ultimo_numero INTEGER;
    proximo_numero VARCHAR;
BEGIN
    SET search_path = public;
    
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Buscar o último número do ano atual
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_termo FROM 6) AS INTEGER)), 0)
    INTO ultimo_numero
    FROM termos_ambientais
    WHERE numero_termo LIKE ano_atual || '-%';
    
    -- Gerar próximo número
    proximo_numero := ano_atual || '-' || LPAD((ultimo_numero + 1)::TEXT, 4, '0');
    
    RETURN proximo_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Corrigir função atualizar_estatisticas_lv
DROP FUNCTION IF EXISTS atualizar_estatisticas_lv();
CREATE OR REPLACE FUNCTION atualizar_estatisticas_lv()
RETURNS VOID AS $$
BEGIN
    SET search_path = public;
    
    -- Atualizar estatísticas de LVs
    UPDATE estatisticas_lv
    SET 
        total_lvs = (SELECT COUNT(*) FROM lv_residuos),
        lvs_mes_atual = (
            SELECT COUNT(*) 
            FROM lv_residuos 
            WHERE EXTRACT(YEAR FROM data_preenchimento) = EXTRACT(YEAR FROM CURRENT_DATE)
              AND EXTRACT(MONTH FROM data_preenchimento) = EXTRACT(MONTH FROM CURRENT_DATE)
        ),
        lvs_semana_atual = (
            SELECT COUNT(*) 
            FROM lv_residuos 
            WHERE data_preenchimento >= DATE_TRUNC('week', CURRENT_DATE)
        ),
        updated_at = NOW()
    WHERE id = (SELECT id FROM estatisticas_lv LIMIT 1);
    
    -- Se não existir registro, criar
    IF NOT FOUND THEN
        INSERT INTO estatisticas_lv (total_lvs, lvs_mes_atual, lvs_semana_atual)
        VALUES (
            (SELECT COUNT(*) FROM lv_residuos),
            (SELECT COUNT(*) FROM lv_residuos 
             WHERE EXTRACT(YEAR FROM data_preenchimento) = EXTRACT(YEAR FROM CURRENT_DATE)
               AND EXTRACT(MONTH FROM data_preenchimento) = EXTRACT(MONTH FROM CURRENT_DATE)),
            (SELECT COUNT(*) FROM lv_residuos 
             WHERE data_preenchimento >= DATE_TRUNC('week', CURRENT_DATE))
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Corrigir função trigger_atualizar_estatisticas_lv
DROP FUNCTION IF EXISTS trigger_atualizar_estatisticas_lv() CASCADE;
CREATE OR REPLACE FUNCTION trigger_atualizar_estatisticas_lv()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = public;
    
    PERFORM atualizar_estatisticas_lv();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Corrigir função exec_sql
DROP FUNCTION IF EXISTS exec_sql(TEXT);
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SET search_path = public;
    
    -- Executar a query e retornar resultado
    EXECUTE sql_query INTO result;
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', SQLERRM,
            'sql_state', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se as funções foram criadas corretamente
SELECT 
    proname as funcao,
    CASE 
        WHEN prosrc LIKE '%SET search_path = public%' THEN '✅ Corrigida'
        ELSE '❌ Precisa correção'
    END as status
FROM pg_proc 
WHERE proname IN (
    'get_termos_storage_stats',
    'calcular_progresso_metas',
    'monitorar_trigger_termos',
    'update_updated_at_column',
    'calcular_progresso_rotinas',
    'atribuir_meta_a_todos_tmas',
    'gerar_proximo_numero_termo',
    'atualizar_estatisticas_lv',
    'trigger_atualizar_estatisticas_lv',
    'exec_sql'
)
ORDER BY proname; 