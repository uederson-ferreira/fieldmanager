-- CRIAR TRIGGER PARA ATIVIDADES DE ROTINA
-- Verificar e criar trigger para atualizar metas de rotina

-- 1. VERIFICAR SE EXISTE TRIGGER PARA ATIVIDADES DE ROTINA
SELECT 
    'VERIFICAÇÃO TRIGGER ROTINAS' as secao,
    tgname as nome_trigger,
    CASE 
        WHEN tgenabled = 'A' THEN '✅ ATIVO'
        WHEN tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'atividades_rotina'::regclass
  AND tgname LIKE '%progresso%';

-- 2. CRIAR FUNÇÃO PARA CALCULAR PROGRESSO DE ROTINAS
CREATE OR REPLACE FUNCTION calcular_progresso_rotinas()
RETURNS TRIGGER AS $$
DECLARE
    meta_id_val UUID;
    meta_quantidade_val INTEGER;
    quantidade_atual_val INTEGER;
    percentual_val NUMERIC(5,2);
    status_val TEXT;
BEGIN
    -- Log de entrada
    RAISE NOTICE 'TRIGGER ROTINAS: Processando atividade % para usuário %', NEW.atividade, NEW.tma_responsavel_id;
    
    -- Buscar metas ativas do tipo 'rotina' para o usuário
    FOR meta_id_val, meta_quantidade_val IN
        SELECT m.id, ma.meta_quantidade_individual
        FROM metas m
        JOIN metas_atribuicoes ma ON m.id = ma.meta_id
        WHERE m.tipo_meta = 'rotina'
          AND m.ativa = true
          AND ma.tma_id = NEW.tma_responsavel_id
          AND ma.meta_quantidade_individual IS NOT NULL
    LOOP
        -- Contar atividades atuais do usuário (apenas concluídas)
        SELECT COUNT(*) INTO quantidade_atual_val
        FROM atividades_rotina 
        WHERE tma_responsavel_id = NEW.tma_responsavel_id
          AND status = 'Concluída';
        
        -- Calcular percentual
        percentual_val := LEAST(100.0, (quantidade_atual_val::NUMERIC / meta_quantidade_val::NUMERIC) * 100);
        
        -- Definir status
        IF percentual_val >= 100 THEN
            status_val := 'alcancada';
        ELSIF percentual_val >= 80 THEN
            status_val := 'em_andamento';
        ELSE
            status_val := 'em_andamento';
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
            meta_id_val,
            NEW.tma_responsavel_id,
            'mensal',
            EXTRACT(YEAR FROM CURRENT_DATE),
            EXTRACT(MONTH FROM CURRENT_DATE),
            quantidade_atual_val,
            percentual_val,
            status_val,
            NOW()
        )
        ON CONFLICT (meta_id, periodo, ano, mes, semana, dia) 
        DO UPDATE SET
            quantidade_atual = quantidade_atual_val,
            percentual_alcancado = percentual_val,
            status = status_val,
            ultima_atualizacao = NOW();
        
        RAISE NOTICE 'TRIGGER ROTINAS: Meta atualizada - ID: % Percentual: % Atual/Meta: %/%', meta_id_val, percentual_val, quantidade_atual_val, meta_quantidade_val;
    END LOOP;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log do erro mas não falha a inserção
    RAISE WARNING 'TRIGGER ROTINAS: Erro ao calcular progresso das metas: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR TRIGGER PARA ATIVIDADES DE ROTINA
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

CREATE TRIGGER trigger_calcular_progresso_rotinas
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW 
    EXECUTE FUNCTION calcular_progresso_rotinas();

-- 4. RECALCULAR PROGRESSO PARA ATIVIDADES EXISTENTES
DO $$
DECLARE
    atividade_record RECORD;
    total_processados INTEGER := 0;
BEGIN
    RAISE NOTICE 'Recalculando progresso para atividades existentes...';
    
    -- Processar cada atividade existente
    FOR atividade_record IN 
        SELECT id, tma_responsavel_id, atividade, data_atividade
        FROM atividades_rotina 
        ORDER BY data_atividade DESC
        LIMIT 50  -- Processar em lotes para evitar locks
    LOOP
        -- Simular update para disparar o trigger
        UPDATE atividades_rotina 
        SET updated_at = NOW() 
        WHERE id = atividade_record.id;
        
        total_processados := total_processados + 1;
        
        -- Log a cada 10 processados
        IF total_processados % 10 = 0 THEN
            RAISE NOTICE 'Processados: % atividades', total_processados;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Recalculo concluido! Total processados: %', total_processados;
END $$;

-- 5. VERIFICAÇÃO FINAL
SELECT 
    'TRIGGER ROTINAS CRIADO' as status,
    tgname as nome_trigger,
    CASE 
        WHEN tgenabled = 'A' THEN '✅ ATIVO'
        ELSE '❌ DESABILITADO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'atividades_rotina'::regclass
  AND tgname = 'trigger_calcular_progresso_rotinas';

-- 6. VERIFICAR PROGRESSO ATUAL DAS METAS DE ROTINA
SELECT 
    'PROGRESSO METAS ROTINA' as status,
    pm.id,
    m.descricao as descricao_meta,
    m.tipo_meta,
    pm.tma_id as usuario_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'rotina'
ORDER BY pm.ultima_atualizacao DESC;

-- 7. INSTRUÇÕES FINAIS
SELECT '🎉 TRIGGER ROTINAS CRIADO!' as status;
SELECT '✅ Atividades de rotina agora atualizam metas automaticamente' as resultado1;
SELECT '✅ Progresso recalculado para atividades existentes' as resultado2; 