-- SCRIPT PARA CORRIGIR METAS DE LV
-- Força o recálculo das metas de LV que não estão sendo atualizadas automaticamente

-- 1. Verificar metas de LV existentes
SELECT 
    'METAS LV EXISTENTES' as teste,
    m.id,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade,
    m.ano,
    m.mes,
    m.ativa,
    COUNT(pm.id) as progressos_existentes
FROM metas m
LEFT JOIN progresso_metas pm ON m.id = pm.meta_id
WHERE m.tipo_meta = 'lv' AND m.ativa = true
GROUP BY m.id, m.tipo_meta, m.escopo, m.meta_quantidade, m.ano, m.mes, m.ativa
ORDER BY m.ano DESC, m.mes DESC;

-- 2. Calcular progresso manual para todas as metas de LV
DO $$
DECLARE
    meta_record RECORD;
    qtd_atual INTEGER;
    percentual_calc NUMERIC(5,2);
    status_val VARCHAR(20);
    tma_record RECORD;
BEGIN
    -- Para cada meta de LV ativa
    FOR meta_record IN 
        SELECT id, meta_quantidade, ano, mes, escopo
        FROM metas 
        WHERE tipo_meta = 'lv' AND ativa = true
    LOOP
        -- Calcular progresso da equipe (sem tma_id)
        SELECT COUNT(*) INTO qtd_atual
        FROM lv_residuos
        WHERE EXTRACT(YEAR FROM data_preenchimento) = meta_record.ano
          AND EXTRACT(MONTH FROM data_preenchimento) = meta_record.mes;
        
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
        INSERT INTO progresso_metas (meta_id, tma_id, quantidade_atual, percentual_alcancado, status)
        VALUES (meta_record.id, NULL, qtd_atual, percentual_calc, status_val)
        ON CONFLICT (meta_id, tma_id) 
        DO UPDATE SET 
            quantidade_atual = EXCLUDED.quantidade_atual,
            percentual_alcancado = EXCLUDED.percentual_alcancado,
            status = EXCLUDED.status,
            updated_at = NOW();
        
        -- Se a meta é individual, calcular para cada TMA
        IF meta_record.escopo = 'individual' THEN
            FOR tma_record IN 
                SELECT DISTINCT usuario_id as tma_id
                FROM lv_residuos
                WHERE EXTRACT(YEAR FROM data_preenchimento) = meta_record.ano
                  AND EXTRACT(MONTH FROM data_preenchimento) = meta_record.mes
            LOOP
                -- Calcular progresso individual
                SELECT COUNT(*) INTO qtd_atual
                FROM lv_residuos
                WHERE usuario_id = tma_record.tma_id
                  AND EXTRACT(YEAR FROM data_preenchimento) = meta_record.ano
                  AND EXTRACT(MONTH FROM data_preenchimento) = meta_record.mes;
                
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
                INSERT INTO progresso_metas (meta_id, tma_id, quantidade_atual, percentual_alcancado, status)
                VALUES (meta_record.id, tma_record.tma_id, qtd_atual, percentual_calc, status_val)
                ON CONFLICT (meta_id, tma_id) 
                DO UPDATE SET 
                    quantidade_atual = EXCLUDED.quantidade_atual,
                    percentual_alcancado = EXCLUDED.percentual_alcancado,
                    status = EXCLUDED.status,
                    updated_at = NOW();
            END LOOP;
        END IF;
        
        RAISE NOTICE '✅ Meta LV %: % LVs, %.2f%%, status: %', 
            meta_record.id, qtd_atual, percentual_calc, status_val;
    END LOOP;
END $$;

-- 3. Verificar resultado após correção
SELECT 
    'RESULTADO APÓS CORREÇÃO' as teste,
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
WHERE m.tipo_meta = 'lv' AND m.ativa = true
ORDER BY m.escopo, pm.tma_id;

-- 4. Verificar se há dados de LV para o mês atual
SELECT 
    'DADOS LV MÊS ATUAL' as teste,
    EXTRACT(YEAR FROM CURRENT_DATE) as ano_atual,
    EXTRACT(MONTH FROM CURRENT_DATE) as mes_atual,
    COUNT(*) as total_lvs_mes,
    COUNT(DISTINCT usuario_id) as usuarios_com_lv
FROM lv_residuos
WHERE EXTRACT(YEAR FROM data_preenchimento) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data_preenchimento) = EXTRACT(MONTH FROM CURRENT_DATE);

-- 5. Verificar se existem metas para o mês atual
SELECT 
    'METAS MÊS ATUAL' as teste,
    m.id,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade,
    m.ano,
    m.mes,
    m.ativa
FROM metas m
WHERE m.tipo_meta = 'lv' 
  AND m.ano = EXTRACT(YEAR FROM CURRENT_DATE)
  AND m.mes = EXTRACT(MONTH FROM CURRENT_DATE)
  AND m.ativa = true; 