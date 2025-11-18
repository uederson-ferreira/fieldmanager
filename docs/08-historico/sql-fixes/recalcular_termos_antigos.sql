-- ===================================================================
-- RECALCULAR PROGRESSO DOS TERMOS ANTIGOS
-- ===================================================================

-- PROBLEMA: Termos antigos não estão contabilizados no progresso
-- SOLUÇÃO: Forçar recálculo para todos os termos existentes

-- 1. Verificar quantos termos existem
SELECT 
    'TERMOS EXISTENTES:' as status,
    COUNT(*) as total_termos,
    COUNT(DISTINCT emitido_por_usuario_id) as usuarios_diferentes,
    MIN(data_termo) as primeiro_termo,
    MAX(data_termo) as ultimo_termo
FROM termos_ambientais;

-- 2. Verificar progresso atual antes do recálculo
SELECT 
    'PROGRESSO ANTES DO RECÁLCULO:' as status,
    pm.id,
    pm.meta_id,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade as meta_objetivo,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
ORDER BY pm.ultima_atualizacao DESC;

-- 3. Recalcular progresso para todos os usuários que têm termos
DO $$
DECLARE
    user_record RECORD;
    total_termos_user INTEGER;
    meta_record RECORD;
    progresso_existente RECORD;
    percentual_calc NUMERIC(5,2);
    status_calc VARCHAR(20);
BEGIN
    RAISE NOTICE '🔄 INICIANDO RECÁLCULO DE PROGRESSO PARA TERMOS ANTIGOS...';
    
    -- Iterar por todos os usuários que têm termos
    FOR user_record IN 
        SELECT DISTINCT emitido_por_usuario_id as user_id
        FROM termos_ambientais 
        WHERE emitido_por_usuario_id IS NOT NULL
    LOOP
        RAISE NOTICE '👤 Processando usuário: %', user_record.user_id;
        
        -- Contar termos do usuário
        SELECT COUNT(*) INTO total_termos_user
        FROM termos_ambientais 
        WHERE emitido_por_usuario_id = user_record.user_id;
        
        RAISE NOTICE '📊 Total de termos do usuário: %', total_termos_user;
        
        -- Processar cada meta de termos
        FOR meta_record IN 
            SELECT m.*, ma.meta_quantidade_individual
            FROM metas m
            LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = user_record.user_id
            WHERE m.tipo_meta = 'termo' 
              AND m.ativa = true
        LOOP
            -- Determinar quantidade da meta (individual ou equipe)
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
                    percentual_calc := (total_termos_user::NUMERIC / meta_quantidade_final::NUMERIC) * 100;
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
                  AND pm.tma_id = user_record.user_id;
                
                -- Atualizar ou inserir progresso
                IF FOUND THEN
                    UPDATE progresso_metas 
                    SET quantidade_atual = total_termos_user,
                        percentual_atual = percentual_calc,
                        percentual_alcancado = percentual_calc,
                        status = status_calc,
                        ultima_atualizacao = NOW(),
                        updated_at = NOW()
                    WHERE id = progresso_existente.id;
                    
                    RAISE NOTICE '   ✅ Meta % (%): Atualizado - % termos (%.1f%%)', 
                        meta_record.id, meta_record.escopo, total_termos_user, percentual_calc;
                ELSE
                    INSERT INTO progresso_metas (
                        meta_id, tma_id, periodo, ano, mes, semana, dia,
                        quantidade_atual, percentual_atual, percentual_alcancado,
                        status, ultima_atualizacao
                    ) VALUES (
                        meta_record.id, user_record.user_id, meta_record.periodo, 
                        meta_record.ano, meta_record.mes, meta_record.semana, meta_record.dia,
                        total_termos_user, percentual_calc, percentual_calc,
                        status_calc, NOW()
                    );
                    
                    RAISE NOTICE '   ✅ Meta % (%): Criado - % termos (%.1f%%)', 
                        meta_record.id, meta_record.escopo, total_termos_user, percentual_calc;
                END IF;
            END;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '🎉 RECÁLCULO CONCLUÍDO!';
END $$;

-- 4. Verificar progresso final após recálculo
SELECT 
    'PROGRESSO APÓS RECÁLCULO:' as status,
    pm.id,
    pm.meta_id,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade as meta_objetivo,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
ORDER BY pm.ultima_atualizacao DESC;

-- 5. Verificar se os números batem
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