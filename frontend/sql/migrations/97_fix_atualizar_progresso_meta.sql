-- ===================================================================
-- CORREÇÃO: Função atualizar_progresso_meta usando usuario_id ao invés de criada_por
-- Erro: column "criada_por" does not exist in table "lvs"
-- Data: 2025-11-07
-- ===================================================================

CREATE OR REPLACE FUNCTION atualizar_progresso_meta(
  p_tipo_meta VARCHAR(50),
  p_tma_id UUID,
  p_ano INTEGER,
  p_mes INTEGER DEFAULT NULL,
  p_semana INTEGER DEFAULT NULL,
  p_dia INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_meta RECORD;
  v_progresso RECORD;
  v_quantidade_atual INTEGER;
  v_percentual_atual NUMERIC(5,2);
  v_status VARCHAR(20);
BEGIN
  -- Buscar metas ativas do tipo especificado
  FOR v_meta IN
    SELECT
      m.id,
      m.periodo,
      m.meta_quantidade,
      m.escopo,
      m.ano,
      m.mes,
      m.semana,
      m.dia
    FROM metas m
    WHERE m.tipo_meta = p_tipo_meta
    AND m.ativa = true
    AND m.ano = p_ano
    AND (m.mes IS NULL OR m.mes = p_mes)
    AND (m.semana IS NULL OR m.semana = p_semana)
    AND (m.dia IS NULL OR m.dia = p_dia)
  LOOP

    -- Calcular quantidade atual baseado no tipo
    IF p_tipo_meta = 'lv' THEN
      SELECT COUNT(*) INTO v_quantidade_atual
      FROM lvs
      WHERE DATE_PART('year', created_at) = p_ano
      AND (p_mes IS NULL OR DATE_PART('month', created_at) = p_mes)
      AND (v_meta.escopo = 'equipe' OR usuario_id = p_tma_id);  -- ✅ CORRIGIDO: usuario_id

    ELSIF p_tipo_meta = 'termo' THEN
      SELECT COUNT(*) INTO v_quantidade_atual
      FROM termos_ambientais
      WHERE DATE_PART('year', created_at) = p_ano
      AND (p_mes IS NULL OR DATE_PART('month', created_at) = p_mes)
      AND (v_meta.escopo = 'equipe' OR emitido_por_usuario_id = p_tma_id);  -- ✅ CORRIGIDO

    ELSIF p_tipo_meta = 'rotina' THEN
      SELECT COUNT(*) INTO v_quantidade_atual
      FROM atividades_rotina
      WHERE DATE_PART('year', created_at) = p_ano
      AND (p_mes IS NULL OR DATE_PART('month', created_at) = p_mes)
      AND (v_meta.escopo = 'equipe' OR tma_responsavel_id = p_tma_id);  -- ✅ CORRIGIDO
    END IF;

    -- Calcular percentual
    v_percentual_atual := ROUND((v_quantidade_atual::NUMERIC / v_meta.meta_quantidade::NUMERIC) * 100, 2);

    -- Determinar status
    IF v_percentual_atual >= 100 THEN
      v_status := 'alcancada';
      IF v_percentual_atual > 110 THEN
        v_status := 'superada';
      END IF;
    ELSIF v_percentual_atual < 50 THEN
      v_status := 'nao_alcancada';
    ELSE
      v_status := 'em_andamento';
    END IF;

    -- Inserir ou atualizar progresso
    INSERT INTO progresso_metas (
      meta_id,
      periodo,
      ano,
      mes,
      semana,
      dia,
      quantidade_atual,
      percentual_atual,
      percentual_alcancado,
      status,
      tma_id,
      ultima_atualizacao
    ) VALUES (
      v_meta.id,
      v_meta.periodo,
      p_ano,
      p_mes,
      p_semana,
      p_dia,
      v_quantidade_atual,
      v_percentual_atual,
      v_percentual_atual,
      v_status,
      CASE WHEN v_meta.escopo = 'individual' THEN p_tma_id ELSE NULL END,
      NOW()
    )
    ON CONFLICT (meta_id, COALESCE(tma_id, '00000000-0000-0000-0000-000000000000'::UUID), periodo, ano, COALESCE(mes, 0))
    DO UPDATE SET
      quantidade_atual = EXCLUDED.quantidade_atual,
      percentual_atual = EXCLUDED.percentual_atual,
      percentual_alcancado = EXCLUDED.percentual_alcancado,
      status = EXCLUDED.status,
      ultima_atualizacao = NOW();

  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a função foi criada
SELECT
    '✅ FUNÇÃO CORRIGIDA' as status,
    proname as nome,
    '- lvs: usuario_id' as correcao_1,
    '- termos: emitido_por_usuario_id' as correcao_2,
    '- rotinas: tma_responsavel_id' as correcao_3
FROM pg_proc
WHERE proname = 'atualizar_progresso_meta';
