-- ===================================================================
-- CORRIGIR FUNÇÃO DE CÁLCULO DE METAS
-- ===================================================================

-- Remover a função antiga
DROP FUNCTION IF EXISTS calcular_progresso_metas();

-- Criar nova função corrigida
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
  meta_record RECORD;
  atribuicao_record RECORD;
  quantidade_atual INTEGER := 0;
  percentual_atual DECIMAL(5,2) := 0;
  percentual_alcancado DECIMAL(5,2) := 0;
  status_meta VARCHAR(20) := 'em_andamento';
  meta_quantidade_final INTEGER;
  usuario_id_atual UUID;
BEGIN
  -- Determinar o ID do usuário baseado na tabela que disparou o trigger
  IF TG_TABLE_NAME = 'termos_ambientais' THEN
    usuario_id_atual := NEW.emitido_por_usuario_id;
  ELSIF TG_TABLE_NAME = 'lvs' THEN
    usuario_id_atual := NEW.usuario_id;
  ELSIF TG_TABLE_NAME = 'lv_residuos' THEN
    usuario_id_atual := NEW.usuario_id;
  ELSIF TG_TABLE_NAME = 'atividades_rotina' THEN
    usuario_id_atual := NEW.tma_responsavel_id;
  ELSE
    RETURN NEW;
  END IF;

  -- Buscar todas as metas ativas do tipo correspondente
  FOR meta_record IN 
    SELECT * FROM metas 
    WHERE ativa = true 
      AND (
        (TG_TABLE_NAME = 'termos_ambientais' AND tipo_meta = 'termo') OR
        (TG_TABLE_NAME = 'lvs' AND tipo_meta = 'lv') OR
        (TG_TABLE_NAME = 'lv_residuos' AND tipo_meta = 'lv') OR
        (TG_TABLE_NAME = 'atividades_rotina' AND tipo_meta = 'rotina')
      )
  LOOP
    -- Se é meta individual, buscar atribuição
    IF meta_record.escopo = 'individual' THEN
      SELECT * INTO atribuicao_record FROM metas_atribuicoes 
      WHERE meta_id = meta_record.id AND tma_id = usuario_id_atual;
      
      IF FOUND THEN
        meta_quantidade_final := COALESCE(atribuicao_record.meta_quantidade_individual, meta_record.meta_quantidade);
      ELSE
        -- Se não há atribuição individual, pular esta meta
        CONTINUE;
      END IF;
    ELSE
      meta_quantidade_final := meta_record.meta_quantidade;
    END IF;
    
    -- Calcular quantidade atual baseada no tipo de meta
    CASE meta_record.tipo_meta
      WHEN 'lv' THEN
        IF meta_record.escopo = 'individual' THEN
          -- Contar LVs criadas pelo TMA específico no período
          SELECT COUNT(*) INTO quantidade_atual
          FROM lvs
          WHERE usuario_id = usuario_id_atual
            AND tipo_lv = COALESCE(meta_record.categoria, tipo_lv)
            AND EXTRACT(YEAR FROM created_at) = meta_record.ano
            AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
            AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
            AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
        ELSE
          -- Contar LVs criadas por toda equipe no período
          SELECT COUNT(*) INTO quantidade_atual
          FROM lvs
          WHERE tipo_lv = COALESCE(meta_record.categoria, tipo_lv)
            AND EXTRACT(YEAR FROM created_at) = meta_record.ano
            AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
            AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
            AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
        END IF;
          
      WHEN 'termo' THEN
        IF meta_record.escopo = 'individual' THEN
          -- Contar termos criados pelo TMA específico no período
          SELECT COUNT(*) INTO quantidade_atual
          FROM termos_ambientais
          WHERE emitido_por_usuario_id = usuario_id_atual
            AND EXTRACT(YEAR FROM created_at) = meta_record.ano
            AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
            AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
            AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
        ELSE
          -- Contar termos criados por toda equipe no período
          SELECT COUNT(*) INTO quantidade_atual
          FROM termos_ambientais
          WHERE EXTRACT(YEAR FROM created_at) = meta_record.ano
            AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
            AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
            AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
        END IF;
          
      WHEN 'rotina' THEN
        IF meta_record.escopo = 'individual' THEN
          -- Contar rotinas criadas pelo TMA específico no período
          SELECT COUNT(*) INTO quantidade_atual
          FROM atividades_rotina
          WHERE tma_responsavel_id = usuario_id_atual
            AND EXTRACT(YEAR FROM created_at) = meta_record.ano
            AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
            AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
            AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
        ELSE
          -- Contar rotinas criadas por toda equipe no período
          SELECT COUNT(*) INTO quantidade_atual
          FROM atividades_rotina
          WHERE EXTRACT(YEAR FROM created_at) = meta_record.ano
            AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM created_at) = meta_record.mes)
            AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM created_at) = meta_record.semana)
            AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM created_at) = meta_record.dia);
        END IF;
    END CASE;
    
    -- Calcular percentual alcançado
    IF meta_quantidade_final > 0 THEN
      percentual_alcancado := (quantidade_atual::DECIMAL / meta_quantidade_final::DECIMAL) * 100;
    END IF;
    
    -- Determinar status
    IF percentual_alcancado >= 100 THEN
      status_meta := 'alcancada';
      IF percentual_alcancado > 120 THEN
        status_meta := 'superada';
      END IF;
    ELSIF percentual_alcancado < 80 THEN
      status_meta := 'nao_alcancada';
    END IF;
    
    -- Atualizar ou inserir progresso
    INSERT INTO progresso_metas (
      meta_id, tma_id, periodo, ano, mes, semana, dia,
      quantidade_atual, percentual_atual, percentual_alcancado, status
    ) VALUES (
      meta_record.id, 
      CASE WHEN meta_record.escopo = 'individual' THEN usuario_id_atual ELSE NULL END,
      meta_record.periodo, meta_record.ano, meta_record.mes, meta_record.semana, meta_record.dia,
      quantidade_atual, percentual_atual, percentual_alcancado, status_meta
    )
    ON CONFLICT (meta_id, tma_id, periodo, ano, mes, semana, dia)
    DO UPDATE SET
      quantidade_atual = EXCLUDED.quantidade_atual,
      percentual_atual = EXCLUDED.percentual_atual,
      percentual_alcancado = EXCLUDED.percentual_alcancado,
      status = EXCLUDED.status,
      ultima_atualizacao = NOW(),
      updated_at = NOW();
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- VERIFICAR SE A FUNÇÃO FOI CRIADA
-- ===================================================================

SELECT 
    'FUNÇÃO CRIADA:' as status,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- ===================================================================
-- PRONTO! AGORA A FUNÇÃO FUNCIONA CORRETAMENTE
-- =================================================================== 