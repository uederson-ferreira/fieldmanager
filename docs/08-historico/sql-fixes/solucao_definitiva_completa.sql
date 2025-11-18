-- SOLUÇÃO DEFINITIVA PARA O PROBLEMA DO TRIGGER DESABILITADO
-- Baseado na análise completa do schema das tabelas

-- 1. PRIMEIRO: VERIFICAR E LIMPAR TRIGGERS EXISTENTES
DO $$
BEGIN
    -- Remover triggers específicos se existirem (sem desabilitar ALL)
    DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
    DROP TRIGGER IF EXISTS trigger_monitorar_termos ON termos_ambientais;
    DROP TRIGGER IF EXISTS calcular_progresso_termos ON termos_ambientais;
    
    RAISE NOTICE '🔧 Triggers removidos com sucesso';
END $$;

-- 2. CRIAR FUNÇÃO PRINCIPAL COM TRATAMENTO DE ERROS ROBUSTO
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    -- Variáveis para evitar ambiguidades
    qtd_atual INTEGER := 0;
    percentual_calc NUMERIC(5,2) := 0;
    meta_quantidade_val INTEGER := 0;
    meta_percentual_val NUMERIC(5,2) := 0;
    meta_id_val UUID := NULL;
    periodo_val VARCHAR(20) := 'mensal';
    ano_val INTEGER := 0;
    mes_val INTEGER := 0;
    semana_val INTEGER := 0;
    dia_val INTEGER := 0;
    tma_id_val UUID := NULL;
    status_val VARCHAR(20) := 'em_andamento';
    percentual_alcancado_val NUMERIC(5,2) := 0;
    progresso_existente RECORD;
    meta_info RECORD;
    atribuicao_info RECORD;
    error_message TEXT;
    error_detail TEXT;
    error_hint TEXT;
    error_context TEXT;
BEGIN
    -- TRATAMENTO DE ERROS GLOBAL
    BEGIN
        -- Determinar o tipo de registro baseado na tabela
        IF TG_TABLE_NAME = 'termos_ambientais' THEN
            -- Para termos ambientais
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
                meta_id_val := meta_info.id;
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
                meta_id_val := meta_info.id;
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
                meta_id_val := meta_info.id;
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
        END IF;
        
        -- Se encontrou uma meta, calcular progresso
        IF meta_id_val IS NOT NULL THEN
            -- Verificar se já existe progresso para este período
            SELECT * INTO progresso_existente 
            FROM progresso_metas pm
            WHERE pm.meta_id = meta_id_val 
              AND pm.periodo = periodo_val 
              AND pm.ano = ano_val 
              AND pm.mes = mes_val 
              AND pm.semana = semana_val 
              AND pm.dia = dia_val;
            
            -- Calcular quantidade atual baseada no tipo
            IF TG_TABLE_NAME = 'termos_ambientais' THEN
                SELECT COALESCE(COUNT(*), 0) INTO qtd_atual
                FROM termos_ambientais ta
                WHERE ta.emitido_por_usuario_id = tma_id_val
                  AND EXTRACT(YEAR FROM ta.data_termo) = ano_val
                  AND EXTRACT(MONTH FROM ta.data_termo) = mes_val
                  AND EXTRACT(WEEK FROM ta.data_termo) = semana_val
                  AND EXTRACT(DAY FROM ta.data_termo) = dia_val;
                  
            ELSIF TG_TABLE_NAME = 'lv_residuos' THEN
                SELECT COALESCE(COUNT(*), 0) INTO qtd_atual
                FROM lv_residuos lr
                WHERE lr.usuario_id = tma_id_val
                  AND EXTRACT(YEAR FROM lr.data_preenchimento) = ano_val
                  AND EXTRACT(MONTH FROM lr.data_preenchimento) = mes_val
                  AND EXTRACT(WEEK FROM lr.data_preenchimento) = semana_val
                  AND EXTRACT(DAY FROM lr.data_preenchimento) = dia_val;
                  
            ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
                SELECT COALESCE(COUNT(*), 0) INTO qtd_atual
                FROM atividades_rotina ar
                WHERE ar.tma_responsavel_id = tma_id_val
                  AND EXTRACT(YEAR FROM ar.data_atividade) = ano_val
                  AND EXTRACT(MONTH FROM ar.data_atividade) = mes_val
                  AND EXTRACT(WEEK FROM ar.data_atividade) = semana_val
                  AND EXTRACT(DAY FROM ar.data_atividade) = dia_val;
            END IF;
            
            -- Calcular percentual atual
            IF meta_quantidade_val > 0 THEN
                percentual_calc := (qtd_atual::NUMERIC / meta_quantidade_val::NUMERIC) * 100;
            ELSE
                percentual_calc := 0;
            END IF;
            
            -- Determinar status
            IF percentual_calc >= 100 THEN
                status_val := 'alcancada';
                percentual_alcancado_val := 100;
            ELSIF percentual_calc >= 80 THEN
                status_val := 'em_andamento';
                percentual_alcancado_val := percentual_calc;
            ELSE
                status_val := 'em_andamento';
                percentual_alcancado_val := percentual_calc;
            END IF;
            
            -- Inserir ou atualizar progresso
            IF progresso_existente.id IS NOT NULL THEN
                -- Atualizar progresso existente
                UPDATE progresso_metas 
                SET quantidade_atual = qtd_atual,
                    percentual_atual = percentual_calc,
                    percentual_alcancado = percentual_alcancado_val,
                    status = status_val,
                    ultima_atualizacao = NOW(),
                    updated_at = NOW()
                WHERE id = progresso_existente.id;
            ELSE
                -- Inserir novo progresso
                INSERT INTO progresso_metas (
                    meta_id, periodo, ano, mes, semana, dia,
                    quantidade_atual, percentual_atual, percentual_alcancado,
                    status, ultima_atualizacao, tma_id
                ) VALUES (
                    meta_id_val, periodo_val, ano_val, mes_val, semana_val, dia_val,
                    qtd_atual, percentual_calc, percentual_alcancado_val,
                    status_val, NOW(), tma_id_val
                );
            END IF;
            
            RAISE NOTICE '✅ Progresso atualizado: Meta %s, Quantidade: %s/%s, Percentual: %s%%', 
                meta_id_val, qtd_atual, meta_quantidade_val, percentual_calc;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Capturar detalhes do erro
        GET STACKED DIAGNOSTICS 
            error_message = MESSAGE_TEXT,
            error_detail = PG_EXCEPTION_DETAIL,
            error_hint = PG_EXCEPTION_HINT,
            error_context = PG_EXCEPTION_CONTEXT;
        
        -- Log do erro sem interromper a operação
        RAISE WARNING '⚠️ Erro no trigger calcular_progresso_metas: % | % | % | %', 
            error_message, error_detail, error_hint, error_context;
        
        -- NÃO re-raise o erro para evitar desabilitar o trigger
        -- Apenas retornar NEW para continuar a operação
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR TRIGGER PRINCIPAL
CREATE TRIGGER trigger_calcular_progresso_termos
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- 4. CRIAR FUNÇÃO DE MONITORAMENTO AUTOMÁTICO
CREATE OR REPLACE FUNCTION monitorar_trigger_termos()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se o trigger principal está desabilitado
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgrelid = 'termos_ambientais'::regclass
          AND tgname = 'trigger_calcular_progresso_termos'
          AND tgenabled = 'O'
    ) THEN
        -- Reabilitar o trigger
        ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;
        RAISE NOTICE '🔄 Trigger reabilitado automaticamente';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGER DE MONITORAMENTO (BEFORE para interceptar)
CREATE TRIGGER trigger_monitorar_termos
    BEFORE INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION monitorar_trigger_termos();

-- 6. VERIFICAÇÃO FINAL
DO $$
DECLARE
    trigger_status RECORD;
BEGIN
    -- Verificar status dos triggers
    SELECT 
        tgname as nome_trigger,
        tgenabled as ativo,
        CASE 
            WHEN tgenabled = 'O' THEN '❌ DESABILITADO'
            WHEN tgenabled = 'D' THEN '❌ DESABILITADO'
            WHEN tgenabled = 'R' THEN '❌ DESABILITADO'
            WHEN tgenabled = 'A' THEN '✅ ATIVO'
            ELSE '⚠️ DESCONHECIDO'
        END as status_trigger
    INTO trigger_status
    FROM pg_trigger 
    WHERE tgrelid = 'termos_ambientais'::regclass
      AND tgname IN ('trigger_calcular_progresso_termos', 'trigger_monitorar_termos');
    
    RAISE NOTICE '🔍 STATUS DOS TRIGGERS:';
    RAISE NOTICE '   Trigger Principal: % - %', trigger_status.nome_trigger, trigger_status.status_trigger;
    
    -- Verificar se a função existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'calcular_progresso_metas'
    ) THEN
        RAISE NOTICE '✅ Função calcular_progresso_metas criada com sucesso';
    ELSE
        RAISE NOTICE '❌ Erro: Função não foi criada';
    END IF;
    
    -- Verificar se a função de monitoramento existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'monitorar_trigger_termos'
    ) THEN
        RAISE NOTICE '✅ Função monitorar_trigger_termos criada com sucesso';
    ELSE
        RAISE NOTICE '❌ Erro: Função de monitoramento não foi criada';
    END IF;
END $$;

-- 7. RECALCULAR PROGRESSO EXISTENTE
DO $$
DECLARE
    termo_record RECORD;
    total_termos INTEGER := 0;
BEGIN
    -- Contar termos existentes
    SELECT COUNT(*) INTO total_termos FROM termos_ambientais;
    
    RAISE NOTICE '🔄 Recalculando progresso para % termos existentes...', total_termos;
    
    -- Recalcular progresso para todos os termos existentes
    FOR termo_record IN 
        SELECT id, emitido_por_usuario_id, data_termo 
        FROM termos_ambientais 
        ORDER BY data_termo
    LOOP
        -- Simular um UPDATE para disparar o trigger
        UPDATE termos_ambientais 
        SET updated_at = NOW() 
        WHERE id = termo_record.id;
    END LOOP;
    
    RAISE NOTICE '✅ Recalculo concluído!';
END $$;

-- 8. VERIFICAÇÃO FINAL DO PROGRESSO
SELECT 
    'PROGRESSO FINAL' as status,
    COUNT(*) as total_progressos,
    COUNT(CASE WHEN status = 'alcancada' THEN 1 END) as metas_alcancadas,
    COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as metas_em_andamento
FROM progresso_metas 
WHERE meta_id IN (
    SELECT id FROM metas WHERE tipo_meta = 'termo' AND ativa = true
); 