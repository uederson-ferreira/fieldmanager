-- SCRIPT COMPLETO PARA CORRIGIR TODAS AS METAS
-- Considera todas as tabelas: lv_residuos, termos_ambientais, atividades_rotina

-- 1. Verificar todas as metas existentes
SELECT 
    'TODAS AS METAS' as teste,
    COUNT(*) as total_metas,
    COUNT(CASE WHEN ativa = true THEN 1 END) as metas_ativas,
    COUNT(CASE WHEN escopo = 'equipe' THEN 1 END) as metas_equipe,
    COUNT(CASE WHEN escopo = 'individual' THEN 1 END) as metas_individuais,
    COUNT(CASE WHEN tipo_meta = 'lv' THEN 1 END) as metas_lv,
    COUNT(CASE WHEN tipo_meta = 'termo' THEN 1 END) as metas_termo,
    COUNT(CASE WHEN tipo_meta = 'rotina' THEN 1 END) as metas_rotina
FROM metas;

-- 2. Verificar dados que alimentam as metas
SELECT 
    'DADOS TERMOS AMBIENTAIS' as teste,
    COUNT(*) as total_termos,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_termo) = EXTRACT(YEAR FROM CURRENT_DATE) 
                AND EXTRACT(MONTH FROM data_termo) = EXTRACT(MONTH FROM CURRENT_DATE) 
           THEN 1 END) as termos_mes_atual,
    COUNT(DISTINCT emitido_por_usuario_id) as usuarios_com_termos
FROM termos_ambientais;

SELECT 
    'DADOS LV RESIDUOS' as teste,
    COUNT(*) as total_lvs,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_preenchimento) = EXTRACT(YEAR FROM CURRENT_DATE) 
                AND EXTRACT(MONTH FROM data_preenchimento) = EXTRACT(MONTH FROM CURRENT_DATE) 
           THEN 1 END) as lvs_mes_atual,
    COUNT(DISTINCT usuario_id) as usuarios_com_lv
FROM lv_residuos;

SELECT 
    'DADOS ATIVIDADES ROTINA' as teste,
    COUNT(*) as total_atividades,
    COUNT(CASE WHEN EXTRACT(YEAR FROM data_atividade) = EXTRACT(YEAR FROM CURRENT_DATE) 
                AND EXTRACT(MONTH FROM data_atividade) = EXTRACT(MONTH FROM CURRENT_DATE) 
           THEN 1 END) as atividades_mes_atual,
    COUNT(DISTINCT tma_responsavel_id) as tmas_com_atividades
FROM atividades_rotina;

-- 3. Calcular progresso manual para TODAS as metas
DO $$
DECLARE
    meta_record RECORD;
    qtd_atual INTEGER;
    percentual_calc NUMERIC(5,2);
    status_val VARCHAR(20);
    tma_record RECORD;
    periodo_val VARCHAR(20);
    ano_val INTEGER;
    mes_val INTEGER;
BEGIN
    -- Para cada meta ativa
    FOR meta_record IN 
        SELECT id, tipo_meta, meta_quantidade, ano, mes, escopo, periodo
        FROM metas 
        WHERE ativa = true
    LOOP
        periodo_val := meta_record.periodo;
        ano_val := meta_record.ano;
        mes_val := meta_record.mes;
        
        -- Calcular progresso da equipe (sem tma_id) baseado no tipo de meta
        IF meta_record.tipo_meta = 'termo' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM termos_ambientais
            WHERE EXTRACT(YEAR FROM data_termo) = ano_val
              AND EXTRACT(MONTH FROM data_termo) = mes_val;
              
        ELSIF meta_record.tipo_meta = 'lv' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM lv_residuos
            WHERE EXTRACT(YEAR FROM data_preenchimento) = ano_val
              AND EXTRACT(MONTH FROM data_preenchimento) = mes_val;
              
        ELSIF meta_record.tipo_meta = 'rotina' THEN
            SELECT COUNT(*) INTO qtd_atual
            FROM atividades_rotina
            WHERE EXTRACT(YEAR FROM data_atividade) = ano_val
              AND EXTRACT(MONTH FROM data_atividade) = mes_val;
        END IF;
        
        -- Calcular percentual da equipe
        IF meta_record.meta_quantidade > 0 THEN
            percentual_calc := ROUND((qtd_atual::NUMERIC / meta_record.meta_quantidade) * 100, 2);
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
        
        -- Inserir ou atualizar progresso da equipe
        INSERT INTO progresso_metas (meta_id, tma_id, periodo, ano, mes, quantidade_atual, percentual_alcancado, status)
        VALUES (meta_record.id, NULL, periodo_val, ano_val, mes_val, qtd_atual, percentual_calc, status_val)
        ON CONFLICT (meta_id, periodo, ano, mes, semana, dia) 
        DO UPDATE SET 
            quantidade_atual = EXCLUDED.quantidade_atual,
            percentual_alcancado = EXCLUDED.percentual_alcancado,
            status = EXCLUDED.status,
            updated_at = NOW();
        
        -- Se a meta é individual, calcular para cada TMA
        IF meta_record.escopo = 'individual' THEN
            -- Buscar TMAs baseado no tipo de meta
            IF meta_record.tipo_meta = 'termo' THEN
                FOR tma_record IN 
                    SELECT DISTINCT emitido_por_usuario_id as tma_id
                    FROM termos_ambientais
                    WHERE EXTRACT(YEAR FROM data_termo) = ano_val
                      AND EXTRACT(MONTH FROM data_termo) = mes_val
                LOOP
                    -- Calcular progresso individual para termos
                    SELECT COUNT(*) INTO qtd_atual
                    FROM termos_ambientais
                    WHERE emitido_por_usuario_id = tma_record.tma_id
                      AND EXTRACT(YEAR FROM data_termo) = ano_val
                      AND EXTRACT(MONTH FROM data_termo) = mes_val;
                    
                    -- Calcular percentual individual
                    IF meta_record.meta_quantidade > 0 THEN
                        percentual_calc := ROUND((qtd_atual::NUMERIC / meta_record.meta_quantidade) * 100, 2);
                    ELSE
                        percentual_calc := 0;
                    END IF;
                    
                    -- Determinar status individual
                    IF percentual_calc >= 100 THEN
                        status_val := 'alcancada';
                    ELSIF percentual_calc >= 80 THEN
                        status_val := 'em_andamento';
                    ELSE
                        status_val := 'nao_alcancada';
                    END IF;
                    
                    -- Inserir ou atualizar progresso individual
                    INSERT INTO progresso_metas (meta_id, tma_id, periodo, ano, mes, quantidade_atual, percentual_alcancado, status)
                    VALUES (meta_record.id, tma_record.tma_id, periodo_val, ano_val, mes_val, qtd_atual, percentual_calc, status_val)
                    ON CONFLICT (meta_id, periodo, ano, mes, semana, dia) 
                    DO UPDATE SET 
                        quantidade_atual = EXCLUDED.quantidade_atual,
                        percentual_alcancado = EXCLUDED.percentual_alcancado,
                        status = EXCLUDED.status,
                        updated_at = NOW();
                END LOOP;
                
            ELSIF meta_record.tipo_meta = 'lv' THEN
                FOR tma_record IN 
                    SELECT DISTINCT usuario_id as tma_id
                    FROM lv_residuos
                    WHERE EXTRACT(YEAR FROM data_preenchimento) = ano_val
                      AND EXTRACT(MONTH FROM data_preenchimento) = mes_val
                LOOP
                    -- Calcular progresso individual para LVs
                    SELECT COUNT(*) INTO qtd_atual
                    FROM lv_residuos
                    WHERE usuario_id = tma_record.tma_id
                      AND EXTRACT(YEAR FROM data_preenchimento) = ano_val
                      AND EXTRACT(MONTH FROM data_preenchimento) = mes_val;
                    
                    -- Calcular percentual individual
                    IF meta_record.meta_quantidade > 0 THEN
                        percentual_calc := ROUND((qtd_atual::NUMERIC / meta_record.meta_quantidade) * 100, 2);
                    ELSE
                        percentual_calc := 0;
                    END IF;
                    
                    -- Determinar status individual
                    IF percentual_calc >= 100 THEN
                        status_val := 'alcancada';
                    ELSIF percentual_calc >= 80 THEN
                        status_val := 'em_andamento';
                    ELSE
                        status_val := 'nao_alcancada';
                    END IF;
                    
                    -- Inserir ou atualizar progresso individual
                    INSERT INTO progresso_metas (meta_id, tma_id, periodo, ano, mes, quantidade_atual, percentual_alcancado, status)
                    VALUES (meta_record.id, tma_record.tma_id, periodo_val, ano_val, mes_val, qtd_atual, percentual_calc, status_val)
                    ON CONFLICT (meta_id, periodo, ano, mes, semana, dia) 
                    DO UPDATE SET 
                        quantidade_atual = EXCLUDED.quantidade_atual,
                        percentual_alcancado = EXCLUDED.percentual_alcancado,
                        status = EXCLUDED.status,
                        updated_at = NOW();
                END LOOP;
                
            ELSIF meta_record.tipo_meta = 'rotina' THEN
                FOR tma_record IN 
                    SELECT DISTINCT tma_responsavel_id as tma_id
                    FROM atividades_rotina
                    WHERE EXTRACT(YEAR FROM data_atividade) = ano_val
                      AND EXTRACT(MONTH FROM data_atividade) = mes_val
                LOOP
                    -- Calcular progresso individual para rotinas
                    SELECT COUNT(*) INTO qtd_atual
                    FROM atividades_rotina
                    WHERE tma_responsavel_id = tma_record.tma_id
                      AND EXTRACT(YEAR FROM data_atividade) = ano_val
                      AND EXTRACT(MONTH FROM data_atividade) = mes_val;
                    
                    -- Calcular percentual individual
                    IF meta_record.meta_quantidade > 0 THEN
                        percentual_calc := ROUND((qtd_atual::NUMERIC / meta_record.meta_quantidade) * 100, 2);
                    ELSE
                        percentual_calc := 0;
                    END IF;
                    
                    -- Determinar status individual
                    IF percentual_calc >= 100 THEN
                        status_val := 'alcancada';
                    ELSIF percentual_calc >= 80 THEN
                        status_val := 'em_andamento';
                    ELSE
                        status_val := 'nao_alcancada';
                    END IF;
                    
                    -- Inserir ou atualizar progresso individual
                    INSERT INTO progresso_metas (meta_id, tma_id, periodo, ano, mes, quantidade_atual, percentual_alcancado, status)
                    VALUES (meta_record.id, tma_record.tma_id, periodo_val, ano_val, mes_val, qtd_atual, percentual_calc, status_val)
                    ON CONFLICT (meta_id, periodo, ano, mes, semana, dia) 
                    DO UPDATE SET 
                        quantidade_atual = EXCLUDED.quantidade_atual,
                        percentual_alcancado = EXCLUDED.percentual_alcancado,
                        status = EXCLUDED.status,
                        updated_at = NOW();
                END LOOP;
            END IF;
        END IF;
        
        RAISE NOTICE '✅ Meta % (%): % registros, %.2f%%, status: %', 
            meta_record.tipo_meta, meta_record.id, qtd_atual, percentual_calc, status_val;
    END LOOP;
END $$;

-- 4. Verificar resultado final
SELECT 
    'RESULTADO FINAL - TODAS AS METAS' as teste,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    CASE 
        WHEN pm.tma_id IS NULL THEN 'Equipe'
        ELSE 'Individual - TMA ' || pm.tma_id::TEXT
    END as tipo_progresso
FROM metas m
LEFT JOIN progresso_metas pm ON m.id = pm.meta_id
WHERE m.ativa = true
ORDER BY m.tipo_meta, m.escopo, pm.tma_id;

-- 5. Verificar triggers para todas as tabelas
SELECT 
    'TRIGGERS TODAS AS TABELAS' as teste,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('termos_ambientais', 'lv_residuos', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
ORDER BY c.relname, t.tgname;

-- 6. Resumo final
SELECT 
    'RESUMO FINAL' as teste,
    m.tipo_meta,
    COUNT(*) as total_metas,
    COUNT(CASE WHEN pm.quantidade_atual IS NOT NULL THEN 1 END) as metas_com_progresso,
    AVG(pm.percentual_alcancado) as percentual_medio,
    COUNT(CASE WHEN pm.status = 'alcancada' THEN 1 END) as metas_alcancadas
FROM metas m
LEFT JOIN progresso_metas pm ON m.id = pm.meta_id
WHERE m.ativa = true
GROUP BY m.tipo_meta
ORDER BY m.tipo_meta; 