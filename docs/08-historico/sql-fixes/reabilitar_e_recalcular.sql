-- ===================================================================
-- REABILITAR TRIGGER E FORÇAR RECÁLCULO PARA 15 TERMOS
-- ===================================================================

-- PROBLEMA: Trigger desabilitado novamente
-- SOLUÇÃO: Reabilitar e forçar recálculo

-- 1. Verificar status atual
SELECT 
    'STATUS ATUAL:' as status,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgenabled as ativo,
    CASE 
        WHEN tgenabled = 't' THEN '✅ ATIVO'
        WHEN tgenabled = 'f' THEN '❌ DESATIVADO'
        WHEN tgenabled = 'O' THEN '⚠️ DESABILITADO'
        ELSE '❓ DESCONHECIDO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'termos_ambientais'::regclass
  AND tgname = 'trigger_calcular_progresso_termos';

-- 2. Reabilitar o trigger
ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;

-- 3. Verificar se foi reabilitado
SELECT 
    'STATUS APÓS REABILITAÇÃO:' as status,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgenabled as ativo,
    CASE 
        WHEN tgenabled = 't' THEN '✅ ATIVO'
        WHEN tgenabled = 'f' THEN '❌ DESATIVADO'
        WHEN tgenabled = 'O' THEN '⚠️ DESABILITADO'
        ELSE '❓ DESCONHECIDO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'termos_ambientais'::regclass
  AND tgname = 'trigger_calcular_progresso_termos';

-- 4. Forçar recálculo para 15 termos
DO $$
DECLARE
    user_id UUID := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
    total_termos INTEGER;
    meta_record RECORD;
    progresso_existente RECORD;
    percentual_calc NUMERIC(5,2);
    status_calc VARCHAR(20);
BEGIN
    -- Contar termos reais
    SELECT COUNT(*) INTO total_termos
    FROM termos_ambientais 
    WHERE emitido_por_usuario_id = user_id;
    
    RAISE NOTICE '🔄 FORÇANDO RECÁLCULO PARA % TERMOS...', total_termos;
    
    -- Processar cada meta de termos
    FOR meta_record IN 
        SELECT m.*, ma.meta_quantidade_individual
        FROM metas m
        LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = user_id
        WHERE m.tipo_meta = 'termo' 
          AND m.ativa = true
    LOOP
        -- Determinar quantidade da meta
        DECLARE
            meta_quantidade_final INTEGER;
        BEGIN
            IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
                meta_quantidade_final := meta_record.meta_quantidade_individual;
            ELSE
                meta_quantidade_final := meta_record.meta_quantidade;
            END IF;
            
            -- Calcular percentual
            IF meta_quantidade_final > 0 THEN
                percentual_calc := (total_termos::NUMERIC / meta_quantidade_final::NUMERIC) * 100;
            ELSE
                percentual_calc := 0;
            END IF;
            
            -- Determinar status
            IF percentual_calc >= 100 THEN
                status_calc := 'alcancada';
            ELSIF percentual_calc >= 80 THEN
                status_calc := 'em_andamento';
            ELSE
                status_calc := 'em_andamento';
            END IF;
            
            -- Verificar se já existe progresso
            SELECT * INTO progresso_existente 
            FROM progresso_metas pm
            WHERE pm.meta_id = meta_record.id 
              AND pm.tma_id = user_id;
            
            -- Atualizar ou inserir progresso
            IF FOUND THEN
                UPDATE progresso_metas 
                SET quantidade_atual = total_termos,
                    percentual_atual = percentual_calc,
                    percentual_alcancado = percentual_calc,
                    status = status_calc,
                    ultima_atualizacao = NOW(),
                    updated_at = NOW()
                WHERE id = progresso_existente.id;
                
                RAISE NOTICE '   ✅ Meta % (%): Atualizado - % termos (%.1f%%)', 
                    meta_record.id, meta_record.escopo, total_termos, percentual_calc;
            ELSE
                INSERT INTO progresso_metas (
                    meta_id, tma_id, periodo, ano, mes, semana, dia,
                    quantidade_atual, percentual_atual, percentual_alcancado,
                    status, ultima_atualizacao
                ) VALUES (
                    meta_record.id, user_id, meta_record.periodo, 
                    meta_record.ano, meta_record.mes, meta_record.semana, meta_record.dia,
                    total_termos, percentual_calc, percentual_calc,
                    status_calc, NOW()
                );
                
                RAISE NOTICE '   ✅ Meta % (%): Criado - % termos (%.1f%%)', 
                    meta_record.id, meta_record.escopo, total_termos, percentual_calc;
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE '🎉 RECÁLCULO FORÇADO CONCLUÍDO!';
END $$;

-- 5. Verificar progresso final
SELECT 
    'PROGRESSO FINAL:' as status,
    pm.id,
    pm.meta_id,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade as meta_objetivo,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao,
    CASE 
        WHEN pm.quantidade_atual IS NULL THEN '❌ SEM PROGRESSO'
        WHEN pm.quantidade_atual = 0 THEN '⚠️ ZERO TERMOS'
        WHEN pm.percentual_alcancado >= 100 THEN '🎉 META ALCANÇADA'
        WHEN pm.percentual_alcancado >= 80 THEN '🚀 QUASE LÁ'
        ELSE '📈 EM ANDAMENTO'
    END as status_progresso
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
ORDER BY pm.percentual_alcancado DESC;

-- 6. Verificar se os números batem
DO $$
DECLARE
    user_id UUID := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
    total_termos INTEGER;
    total_progresso INTEGER;
BEGIN
    -- Contar termos reais
    SELECT COUNT(*) INTO total_termos
    FROM termos_ambientais 
    WHERE emitido_por_usuario_id = user_id;
    
    -- Contar progresso registrado
    SELECT COALESCE(SUM(pm.quantidade_atual), 0) INTO total_progresso
    FROM progresso_metas pm
    JOIN metas m ON pm.meta_id = m.id
    WHERE m.tipo_meta = 'termo'
      AND pm.tma_id = user_id;
    
    RAISE NOTICE '📊 VERIFICAÇÃO FINAL:';
    RAISE NOTICE '   Termos reais: %', total_termos;
    RAISE NOTICE '   Progresso registrado: %', total_progresso;
    
    IF total_termos = total_progresso THEN
        RAISE NOTICE '✅ PERFEITO: Números batem!';
    ELSE
        RAISE NOTICE '⚠️ DIFERENÇA: Termos (%) vs Progresso (%)', total_termos, total_progresso;
    END IF;
END $$; 