-- ===================================================================
-- CORREÇÃO ESPECÍFICA PARA METAS DE LVs E LV_RESIDUOS - ECOFIELD
-- ===================================================================
-- Script para corrigir problemas com metas de LVs que não estão funcionando

-- 1. VERIFICAR PROBLEMA ATUAL
-- ===================================================================
SELECT 'VERIFICANDO PROBLEMA ATUAL:' as info;

-- Verificar se há dados nas tabelas
SELECT 'LVs existentes:' as tipo, COUNT(*) as total FROM lvs
UNION ALL
SELECT 'LV_RESIDUOS existentes:', COUNT(*) FROM lv_residuos
UNION ALL
SELECT 'Metas de LV:', COUNT(*) FROM metas WHERE tipo_meta = 'lv';

-- 2. RECRIAR FUNÇÃO COM LOGS DETALHADOS
-- ===================================================================
DROP FUNCTION IF EXISTS calcular_progresso_metas() CASCADE;

CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
  usuario_id_atual UUID;
  meta_record RECORD;
  quantidade_atual INTEGER := 0;
  percentual_alcancado DECIMAL(5,2) := 0;
  status_atual VARCHAR(20) := 'em_andamento';
  meta_quantidade_final INTEGER;
  debug_info TEXT;
BEGIN
  -- Log inicial
  debug_info := 'Trigger executado para tabela: ' || TG_TABLE_NAME;
  RAISE NOTICE '🔍 [TRIGGER] %', debug_info;
  
  -- Determinar o ID do usuário baseado na tabela que disparou o trigger
  CASE TG_TABLE_NAME
    WHEN 'termos_ambientais' THEN
      usuario_id_atual := NEW.emitido_por_usuario_id;
      debug_info := 'Termo - Usuário: ' || usuario_id_atual;
    WHEN 'lvs' THEN
      usuario_id_atual := NEW.usuario_id;
      debug_info := 'LV - Usuário: ' || usuario_id_atual;
    WHEN 'lv_residuos' THEN
      usuario_id_atual := NEW.usuario_id;
      debug_info := 'LV_RESIDUOS - Usuário: ' || usuario_id_atual;
    WHEN 'atividades_rotina' THEN
      usuario_id_atual := NEW.tma_responsavel_id;
      debug_info := 'Rotina - Usuário: ' || usuario_id_atual;
    ELSE
      debug_info := 'Tabela não reconhecida: ' || TG_TABLE_NAME;
      RAISE NOTICE '⚠️ [TRIGGER] %', debug_info;
      RETURN NEW;
  END CASE;
  
  RAISE NOTICE '👤 [TRIGGER] %', debug_info;
  
  -- Se não há usuário, não fazer nada
  IF usuario_id_atual IS NULL THEN
    RAISE NOTICE '❌ [TRIGGER] Usuário NULL - ignorando';
    RETURN NEW;
  END IF;
  
  -- Buscar todas as metas ativas do tipo correspondente
  FOR meta_record IN 
    SELECT 
      m.*,
      ma.meta_quantidade_individual,
      ma.tma_id as atribuicao_tma_id
    FROM metas m
    LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = usuario_id_atual
    WHERE m.ativa = true
    AND (
      (TG_TABLE_NAME = 'termos_ambientais' AND m.tipo_meta = 'termo') OR
      (TG_TABLE_NAME = 'lvs' AND m.tipo_meta = 'lv') OR
      (TG_TABLE_NAME = 'lv_residuos' AND m.tipo_meta = 'lv') OR
      (TG_TABLE_NAME = 'atividades_rotina' AND m.tipo_meta = 'rotina')
    )
    AND (
      (m.escopo = 'equipe') OR
      (m.escopo = 'individual' AND ma.tma_id = usuario_id_atual)
    )
    AND (
      (m.periodo = 'anual' AND m.ano = EXTRACT(YEAR FROM NOW())) OR
      (m.periodo = 'mensal' AND m.ano = EXTRACT(YEAR FROM NOW()) AND m.mes = EXTRACT(MONTH FROM NOW())) OR
      (m.periodo = 'semanal' AND m.ano = EXTRACT(YEAR FROM NOW()) AND m.semana = EXTRACT(WEEK FROM NOW())) OR
      (m.periodo = 'diario' AND m.ano = EXTRACT(YEAR FROM NOW()) AND m.dia = EXTRACT(DAY FROM NOW())) OR
      (m.periodo = 'trimestral' AND m.ano = EXTRACT(YEAR FROM NOW()) AND m.mes = EXTRACT(MONTH FROM NOW()))
    )
  LOOP
    RAISE NOTICE '🎯 [TRIGGER] Processando meta: % (tipo: %, escopo: %)', meta_record.id, meta_record.tipo_meta, meta_record.escopo;
    
    -- Determinar quantidade da meta (individual ou equipe)
    IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
      meta_quantidade_final := meta_record.meta_quantidade_individual;
    ELSE
      meta_quantidade_final := meta_record.meta_quantidade;
    END IF;
    
    RAISE NOTICE '📊 [TRIGGER] Meta quantidade: %', meta_quantidade_final;
    
    -- Contar quantidade atual baseada no tipo de meta
    CASE meta_record.tipo_meta
      WHEN 'termo' THEN
        SELECT COUNT(*) INTO quantidade_atual
        FROM termos_ambientais 
        WHERE emitido_por_usuario_id = usuario_id_atual
        AND EXTRACT(YEAR FROM data_termo) = meta_record.ano
        AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM data_termo) = meta_record.mes)
        AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM data_termo) = meta_record.semana)
        AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM data_termo) = meta_record.dia);
        
      WHEN 'lv' THEN
        -- CORREÇÃO: Contar tanto LVs quanto LV_RESIDUOS
        SELECT 
          (SELECT COUNT(*) FROM lvs 
           WHERE usuario_id = usuario_id_atual
           AND EXTRACT(YEAR FROM created_at) = meta_record.ano
           AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
           AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
           AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia)
          ) +
          (SELECT COUNT(*) FROM lv_residuos 
           WHERE usuario_id = usuario_id_atual
           AND EXTRACT(YEAR FROM created_at) = meta_record.ano
           AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
           AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
           AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia)
          ) INTO quantidade_atual;
        
      WHEN 'rotina' THEN
        SELECT COUNT(*) INTO quantidade_atual
        FROM atividades_rotina 
        WHERE tma_responsavel_id = usuario_id_atual
        AND status = 'Concluída'
        AND EXTRACT(YEAR FROM data_atividade) = meta_record.ano
        AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM data_atividade) = meta_record.mes)
        AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM data_atividade) = meta_record.semana)
        AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM data_atividade) = meta_record.dia);
        
      ELSE
        quantidade_atual := 0;
    END CASE;
    
    RAISE NOTICE '📈 [TRIGGER] Quantidade atual: %', quantidade_atual;
    
    -- Calcular percentual alcançado
    IF meta_quantidade_final > 0 THEN
      percentual_alcancado := LEAST(100.0, (quantidade_atual::NUMERIC / meta_quantidade_final::NUMERIC) * 100);
    ELSE
      percentual_alcancado := 0;
    END IF;
    
    RAISE NOTICE '📊 [TRIGGER] Percentual alcançado: %%%', percentual_alcancado;
    
    -- Determinar status
    IF percentual_alcancado >= 100 THEN
      status_atual := 'alcancada';
    ELSIF percentual_alcancado >= 80 THEN
      status_atual := 'em_andamento';
    ELSE
      status_atual := 'em_andamento';
    END IF;
    
    RAISE NOTICE '🎯 [TRIGGER] Status: %', status_atual;
    
    -- Inserir ou atualizar progresso usando UPSERT
    INSERT INTO progresso_metas (
      meta_id,
      tma_id,
      periodo,
      ano,
      mes,
      semana,
      dia,
      quantidade_atual,
      percentual_atual,
      percentual_alcancado,
      status,
      ultima_atualizacao
    ) VALUES (
      meta_record.id,
      CASE WHEN meta_record.escopo = 'individual' THEN usuario_id_atual ELSE NULL END,
      meta_record.periodo,
      meta_record.ano,
      meta_record.mes,
      meta_record.semana,
      meta_record.dia,
      quantidade_atual,
      percentual_alcancado,
      percentual_alcancado,
      status_atual,
      NOW()
    )
    ON CONFLICT (meta_id, periodo, ano, mes, semana, dia, tma_id)
    DO UPDATE SET
      quantidade_atual = EXCLUDED.quantidade_atual,
      percentual_atual = EXCLUDED.percentual_atual,
      percentual_alcancado = EXCLUDED.percentual_alcancado,
      status = EXCLUDED.status,
      ultima_atualizacao = NOW();
    
    RAISE NOTICE '✅ [TRIGGER] Progresso atualizado para meta: %', meta_record.id;
  END LOOP;
  
  RAISE NOTICE '🏁 [TRIGGER] Processamento concluído';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECRIAR TRIGGERS
-- ===================================================================
-- Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON public.termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON public.lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON public.lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON public.atividades_rotina;

-- Criar triggers novos
CREATE TRIGGER trigger_calcular_progresso_termos
  AFTER INSERT OR UPDATE ON public.termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lvs
  AFTER INSERT OR UPDATE ON public.lvs
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lv_residuos
  AFTER INSERT OR UPDATE ON public.lv_residuos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_rotinas
  AFTER INSERT OR UPDATE ON public.atividades_rotina
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

-- 4. VERIFICAR CORREÇÃO
-- ===================================================================
SELECT 'VERIFICANDO CORREÇÃO:' as info;

-- Verificar triggers ativos
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%calcular_progresso%'
ORDER BY event_object_table;

-- Verificar função
SELECT 
  proname as nome_funcao,
  CASE WHEN prosrc LIKE '%LVs%' AND prosrc LIKE '%LV_RESIDUOS%' 
       THEN '✅ Função corrigida - conta LVs + LV_RESIDUOS'
       ELSE '❌ Função não corrigida'
  END as status
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

SELECT '✅ CORREÇÃO APLICADA!' as resultado;
SELECT 'Agora as metas de LV devem contar tanto LVs quanto LV_RESIDUOS.' as instrucao; 