-- Forçar recálculo manual das metas para João
-- Execute este script para atualizar o progresso

-- 1. Primeiro, vamos verificar o ID correto do João
SELECT 
    id,
    nome,
    email,
    perfil_id
FROM usuarios 
WHERE nome ILIKE '%joao%' OR email ILIKE '%joao%';

-- 2. Atualizar progresso manualmente para todas as metas ativas
-- (Substitua 'joao-user-id' pelo ID real do João)

DO $$
DECLARE
    usuario_id_atual UUID := 'joao-user-id'; -- Substitua pelo ID real
    meta_record RECORD;
    quantidade_atual INTEGER;
    percentual_alcancado DECIMAL(5,2);
    status_atual TEXT;
BEGIN
    -- Iterar por todas as metas ativas
    FOR meta_record IN 
        SELECT m.*, ma.meta_quantidade_individual
        FROM metas m
        LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = usuario_id_atual
        WHERE m.ativa = true
        AND (
            (m.escopo = 'equipe') OR
            (m.escopo = 'individual' AND ma.tma_id = usuario_id_atual)
        )
    LOOP
        -- Calcular quantidade atual baseada no tipo de meta
        CASE meta_record.tipo_meta
            WHEN 'termo' THEN
                SELECT COUNT(*) INTO quantidade_atual
                FROM termos_ambientais
                WHERE emitido_por_usuario_id = usuario_id_atual
                AND EXTRACT(YEAR FROM data_termo) = meta_record.ano
                AND EXTRACT(MONTH FROM data_termo) = meta_record.mes;
            WHEN 'lv' THEN
                SELECT COUNT(*) INTO quantidade_atual
                FROM lvs
                WHERE usuario_id = usuario_id_atual
                AND EXTRACT(YEAR FROM created_at) = meta_record.ano
                AND EXTRACT(MONTH FROM created_at) = meta_record.mes;
            WHEN 'rotina' THEN
                SELECT COUNT(*) INTO quantidade_atual
                FROM atividades_rotina
                WHERE tma_responsavel_id = usuario_id_atual
                AND EXTRACT(YEAR FROM created_at) = meta_record.ano
                AND EXTRACT(MONTH FROM created_at) = meta_record.mes;
            ELSE
                quantidade_atual := 0;
        END CASE;
        
        -- Calcular percentual alcançado
        IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
            percentual_alcancado := (quantidade_atual::DECIMAL / meta_record.meta_quantidade_individual) * 100;
        ELSE
            percentual_alcancado := (quantidade_atual::DECIMAL / meta_record.meta_quantidade) * 100;
        END IF;
        
        -- Determinar status
        IF percentual_alcancado >= 100 THEN
            status_atual := 'alcancada';
        ELSIF percentual_alcancado >= 80 THEN
            status_atual := 'em_andamento';
        ELSE
            status_atual := 'em_andamento';
        END IF;
        
        -- Atualizar ou inserir progresso
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
            quantidade_atual,
            percentual_alcancado,
            status_atual,
            NOW()
        )
        ON CONFLICT (meta_id, tma_id)
        DO UPDATE SET
            quantidade_atual = EXCLUDED.quantidade_atual,
            percentual_alcancado = EXCLUDED.percentual_alcancado,
            status = EXCLUDED.status,
            ultima_atualizacao = NOW();
            
        RAISE NOTICE 'Meta %: %/% (%.2f%%) - Status: %', 
            meta_record.descricao, 
            quantidade_atual, 
            COALESCE(meta_record.meta_quantidade_individual, meta_record.meta_quantidade),
            percentual_alcancado,
            status_atual;
    END LOOP;
END $$;

-- 3. Verificar resultado
SELECT 
    pm.meta_id,
    m.descricao,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE pm.tma_id = 'joao-user-id' -- Substitua pelo ID real
ORDER BY pm.ultima_atualizacao DESC; 