-- ===================================================================
-- CORREÇÃO: Remover ON CONFLICT problemático da função atualizar_progresso_meta
-- Erro: there is no unique or exclusion constraint matching the ON CONFLICT specification
-- Data: 2025-11-07
-- ===================================================================

-- PASSO 1: Verificar constraints existentes em progresso_metas
SELECT
    '=== CONSTRAINTS EM progresso_metas ===' as info,
    conname as constraint_name,
    contype as type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.progresso_metas'::regclass
ORDER BY contype;

-- PASSO 2: Criar constraint única se não existir
DO $$
BEGIN
    -- Tentar criar a constraint única
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.progresso_metas'::regclass
          AND conname = 'progresso_metas_unique_key'
    ) THEN
        RAISE NOTICE '📝 Criando constraint única...';

        -- Primeiro, remover duplicatas se existirem
        DELETE FROM progresso_metas pm1
        WHERE EXISTS (
            SELECT 1 FROM progresso_metas pm2
            WHERE pm1.meta_id = pm2.meta_id
              AND COALESCE(pm1.tma_id, '00000000-0000-0000-0000-000000000000'::UUID) =
                  COALESCE(pm2.tma_id, '00000000-0000-0000-0000-000000000000'::UUID)
              AND pm1.periodo = pm2.periodo
              AND pm1.ano = pm2.ano
              AND COALESCE(pm1.mes, 0) = COALESCE(pm2.mes, 0)
              AND pm1.id > pm2.id
        );

        -- Criar constraint única
        ALTER TABLE progresso_metas
        ADD CONSTRAINT progresso_metas_unique_key
        UNIQUE (meta_id, tma_id, periodo, ano, mes);

        RAISE NOTICE '✅ Constraint única criada!';
    ELSE
        RAISE NOTICE 'ℹ️ Constraint já existe';
    END IF;
END $$;

-- PASSO 3: Recriar função com ON CONFLICT correto
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
      AND (v_meta.escopo = 'equipe' OR usuario_id = p_tma_id);

    ELSIF p_tipo_meta = 'termo' THEN
      SELECT COUNT(*) INTO v_quantidade_atual
      FROM termos_ambientais
      WHERE DATE_PART('year', created_at) = p_ano
      AND (p_mes IS NULL OR DATE_PART('month', created_at) = p_mes)
      AND (v_meta.escopo = 'equipe' OR emitido_por_usuario_id = p_tma_id);

    ELSIF p_tipo_meta = 'rotina' THEN
      SELECT COUNT(*) INTO v_quantidade_atual
      FROM atividades_rotina
      WHERE DATE_PART('year', created_at) = p_ano
      AND (p_mes IS NULL OR DATE_PART('month', created_at) = p_mes)
      AND (v_meta.escopo = 'equipe' OR tma_responsavel_id = p_tma_id);
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

    -- Inserir ou atualizar progresso (usando ON CONFLICT com constraint correta)
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
      v_meta.id,
      CASE WHEN v_meta.escopo = 'individual' THEN p_tma_id ELSE NULL END,
      v_meta.periodo,
      p_ano,
      p_mes,
      p_semana,
      p_dia,
      v_quantidade_atual,
      v_percentual_atual,
      v_percentual_atual,
      v_status,
      NOW()
    )
    ON CONFLICT (meta_id, tma_id, periodo, ano, mes)
    DO UPDATE SET
      quantidade_atual = EXCLUDED.quantidade_atual,
      percentual_atual = EXCLUDED.percentual_atual,
      percentual_alcancado = EXCLUDED.percentual_alcancado,
      status = EXCLUDED.status,
      ultima_atualizacao = NOW();

  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- VERIFICAÇÃO FINAL
SELECT
    '✅ CORREÇÃO CONCLUÍDA' as status,
    'Constraint única criada' as passo_1,
    'Função atualizar_progresso_meta corrigida' as passo_2;
