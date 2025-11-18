-- ===================================================================
-- RECRIAR FUNÇÃO calcular_progresso_metas CORRETAMENTE
-- A função no banco está errada (tentando popular auth_user_id)
-- Data: 2025-11-07
-- ===================================================================

-- 1. Remover função incorreta
DROP FUNCTION IF EXISTS calcular_progresso_metas() CASCADE;

-- 2. Recriar função CORRETA que calcula progresso
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id_atual UUID;
    meta_record RECORD;
    qtd_atual INTEGER;
    percentual_calc NUMERIC(5,2);
    status_val VARCHAR(20);
    tipo_meta_atual TEXT;
    v_ano INTEGER;
    v_mes INTEGER;
BEGIN
    -- Log de entrada
    RAISE NOTICE '🔄 TRIGGER: Processando % para tabela %', TG_OP, TG_TABLE_NAME;

    -- Determinar o ID do usuário e tipo de meta baseado na tabela
    CASE TG_TABLE_NAME
        WHEN 'termos_ambientais' THEN
            usuario_id_atual := NEW.emitido_por_usuario_id;
            tipo_meta_atual := 'termo';
            v_ano := EXTRACT(YEAR FROM NEW.created_at);
            v_mes := EXTRACT(MONTH FROM NEW.created_at);
            RAISE NOTICE '👤 Usuário termos: %', usuario_id_atual;

        WHEN 'lvs' THEN
            usuario_id_atual := NEW.usuario_id;
            tipo_meta_atual := 'lv';
            v_ano := EXTRACT(YEAR FROM NEW.created_at);
            v_mes := EXTRACT(MONTH FROM NEW.created_at);
            RAISE NOTICE '👤 Usuário LVs: %', usuario_id_atual;

        WHEN 'lv_residuos' THEN
            usuario_id_atual := NEW.usuario_id;
            tipo_meta_atual := 'lv';
            v_ano := EXTRACT(YEAR FROM NEW.created_at);
            v_mes := EXTRACT(MONTH FROM NEW.created_at);
            RAISE NOTICE '👤 Usuário LVs resíduos: %', usuario_id_atual;

        WHEN 'atividades_rotina' THEN
            usuario_id_atual := NEW.tma_responsavel_id;
            tipo_meta_atual := 'rotina';
            v_ano := EXTRACT(YEAR FROM NEW.created_at);
            v_mes := EXTRACT(MONTH FROM NEW.created_at);
            RAISE NOTICE '👤 Usuário rotinas: %', usuario_id_atual;

        ELSE
            RAISE NOTICE '⚠️ Tabela não suportada: %', TG_TABLE_NAME;
            RETURN NEW;
    END CASE;

    -- Se não há usuário, não fazer nada
    IF usuario_id_atual IS NULL THEN
        RAISE NOTICE '⚠️ Usuário NULL, ignorando...';
        RETURN NEW;
    END IF;

    RAISE NOTICE '📅 Ano: %, Mês: %', v_ano, v_mes;

    -- Buscar APENAS metas do tipo correspondente à tabela atual
    FOR meta_record IN
        SELECT
            m.id,
            m.descricao,
            m.tipo_meta,
            m.escopo,
            m.meta_quantidade,
            m.periodo,
            m.ano,
            m.mes,
            ma.meta_quantidade_individual
        FROM metas m
        LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = usuario_id_atual
        WHERE m.ativa = true
        AND m.tipo_meta = tipo_meta_atual  -- ✅ FILTRO ESPECÍFICO POR TIPO
        AND m.ano = v_ano
        AND (m.mes IS NULL OR m.mes = v_mes)
        AND (
            (m.escopo = 'equipe') OR
            (m.escopo = 'individual' AND ma.tma_id = usuario_id_atual)
        )
    LOOP
        RAISE NOTICE '🎯 Processando meta: % (tipo: %)', meta_record.descricao, meta_record.tipo_meta;

        -- Calcular quantidade atual baseada no tipo de meta (SEM AMBIGUIDADE)
        CASE tipo_meta_atual
            WHEN 'termo' THEN
                -- ✅ APENAS termos ambientais
                SELECT COUNT(*) INTO qtd_atual
                FROM termos_ambientais
                WHERE emitido_por_usuario_id = usuario_id_atual
                AND EXTRACT(YEAR FROM created_at) = v_ano
                AND EXTRACT(MONTH FROM created_at) = v_mes;

            WHEN 'lv' THEN
                -- ✅ APENAS LVs (normais + resíduos)
                SELECT COUNT(*) INTO qtd_atual
                FROM (
                    SELECT created_at FROM lvs WHERE usuario_id = usuario_id_atual
                    UNION ALL
                    SELECT created_at FROM lv_residuos WHERE usuario_id = usuario_id_atual
                ) as todas_lvs
                WHERE EXTRACT(YEAR FROM created_at) = v_ano
                AND EXTRACT(MONTH FROM created_at) = v_mes;

            WHEN 'rotina' THEN
                -- ✅ APENAS atividades rotina
                SELECT COUNT(*) INTO qtd_atual
                FROM atividades_rotina
                WHERE tma_responsavel_id = usuario_id_atual
                AND EXTRACT(YEAR FROM created_at) = v_ano
                AND EXTRACT(MONTH FROM created_at) = v_mes;

            ELSE
                qtd_atual := 0;
        END CASE;

        RAISE NOTICE '📊 Quantidade atual (%): %', tipo_meta_atual, qtd_atual;

        -- Calcular percentual alcançado
        IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
            percentual_calc := (qtd_atual::NUMERIC / meta_record.meta_quantidade_individual::NUMERIC) * 100;
            RAISE NOTICE '📈 Percentual individual: % (meta: %)', percentual_calc, meta_record.meta_quantidade_individual;
        ELSE
            percentual_calc := (qtd_atual::NUMERIC / meta_record.meta_quantidade::NUMERIC) * 100;
            RAISE NOTICE '📈 Percentual equipe: % (meta: %)', percentual_calc, meta_record.meta_quantidade;
        END IF;

        -- Determinar status
        IF percentual_calc >= 100 THEN
            status_val := 'alcancada';
        ELSIF percentual_calc >= 80 THEN
            status_val := 'em_andamento';
        ELSE
            status_val := 'em_andamento';
        END IF;

        RAISE NOTICE '🏷️ Status: %', status_val;

        -- Inserir ou atualizar progresso (usando UPSERT)
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
            CASE WHEN meta_record.escopo = 'individual' THEN usuario_id_atual ELSE NULL END,
            meta_record.periodo,
            v_ano,
            v_mes,
            qtd_atual,
            percentual_calc,
            status_val,
            NOW()
        )
        ON CONFLICT (meta_id, tma_id, periodo, ano, mes)
        DO UPDATE SET
            quantidade_atual = EXCLUDED.quantidade_atual,
            percentual_alcancado = EXCLUDED.percentual_alcancado,
            status = EXCLUDED.status,
            ultima_atualizacao = NOW();

        RAISE NOTICE '✅ Progresso atualizado para meta % (%)', meta_record.id, tipo_meta_atual;
    END LOOP;

    RAISE NOTICE '✅ Trigger concluído com sucesso para %', tipo_meta_atual;
    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ Erro no trigger (%): %', tipo_meta_atual, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar triggers para todas as tabelas
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- Trigger para termos ambientais
CREATE TRIGGER trigger_calcular_progresso_termos
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para LVs
CREATE TRIGGER trigger_calcular_progresso_lvs
    AFTER INSERT OR UPDATE ON lvs
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para LVs de resíduos
CREATE TRIGGER trigger_calcular_progresso_lv_residuos
    AFTER INSERT OR UPDATE ON lv_residuos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- Trigger para atividades rotina
CREATE TRIGGER trigger_calcular_progresso_rotinas
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- 4. Verificar se foi criado corretamente
SELECT
    '✅ FUNÇÃO RECRIADA' as status,
    proname as nome,
    LENGTH(prosrc) as tamanho_codigo,
    CASE
        WHEN prosrc LIKE '%TG_TABLE_NAME%' THEN '✅ Usa TG_TABLE_NAME'
        ELSE '❌ NÃO usa TG_TABLE_NAME'
    END as verifica_tabela
FROM pg_proc
WHERE proname = 'calcular_progresso_metas';

-- 5. Verificar triggers
SELECT
    '✅ TRIGGERS CRIADOS' as status,
    tgrelid::regclass as tabela,
    tgname as trigger_name,
    CASE tgenabled::text
        WHEN 'O' THEN '✅ ATIVO'
        ELSE '❌ INATIVO'
    END as status
FROM pg_trigger
WHERE tgname LIKE '%calcular_progresso%'
  AND NOT tgisinternal
ORDER BY tgrelid, tgname;
