-- Script definitivo para aplicar triggers de contabilização automática de metas
-- Execute este script no SQL Editor do Supabase

-- 1. Remover triggers existentes (se houver)
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- 2. Remover função existente
DROP FUNCTION IF EXISTS calcular_progresso_metas();

-- 3. Criar função corrigida
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id_atual UUID;
    meta_record RECORD;
    progresso_record RECORD;
    quantidade_atual INTEGER;
    percentual_alcancado DECIMAL(5,2);
    status_atual TEXT;
BEGIN
    -- Determinar o ID do usuário baseado na tabela que disparou o trigger
    CASE TG_TABLE_NAME
        WHEN 'termos_ambientais' THEN
            usuario_id_atual := NEW.emitido_por_usuario_id;
        WHEN 'lvs' THEN
            usuario_id_atual := NEW.usuario_id;
        WHEN 'atividades_rotina' THEN
            usuario_id_atual := NEW.tma_responsavel_id;
        ELSE
            RETURN NEW;
    END CASE;
    
    -- Se não há usuário, não fazer nada
    IF usuario_id_atual IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Iterar por todas as metas ativas do tipo correspondente
    FOR meta_record IN 
        SELECT m.*, ma.meta_quantidade_individual
        FROM metas m
        LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = usuario_id_atual
        WHERE m.ativa = true
        AND (
            (TG_TABLE_NAME = 'termos_ambientais' AND m.tipo_meta = 'termo') OR
            (TG_TABLE_NAME = 'lvs' AND m.tipo_meta = 'lv') OR
            (TG_TABLE_NAME = 'atividades_rotina' AND m.tipo_meta = 'rotina')
        )
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
        
        -- Verificar se já existe progresso para esta meta e usuário
        SELECT * INTO progresso_record
        FROM progresso_metas
        WHERE meta_id = meta_record.id
        AND tma_id = usuario_id_atual;
        
        -- Atualizar ou inserir progresso
        IF FOUND THEN
            UPDATE progresso_metas
            SET 
                quantidade_atual = quantidade_atual,
                percentual_alcancado = percentual_alcancado,
                status = status_atual,
                ultima_atualizacao = NOW()
            WHERE meta_id = meta_record.id
            AND tma_id = usuario_id_atual;
        ELSE
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
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar triggers
CREATE TRIGGER trigger_calcular_progresso_termos
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lvs
    AFTER INSERT OR UPDATE ON lvs
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_rotinas
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- 5. Verificar se foram criados
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE '%calcular_progresso%'
ORDER BY tgname; 