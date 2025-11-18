-- ====================================================================
-- MIGRAÇÃO COMPLETA: SISTEMA DE METAS - ECOFIELD
-- Data: 2025-11-06
-- Descrição: Refatoração completa do sistema de metas funcional
-- ====================================================================

-- ====================================================================
-- PARTE 1: ADICIONAR auth_user_id E CORRIGIR ESTRUTURA
-- ====================================================================

-- 1.1. Adicionar coluna auth_user_id na tabela metas
ALTER TABLE public.metas
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 1.2. Popular auth_user_id baseado em criada_por
UPDATE public.metas
SET auth_user_id = (
  SELECT u.auth_user_id
  FROM public.usuarios u
  WHERE u.id = metas.criada_por
)
WHERE auth_user_id IS NULL AND criada_por IS NOT NULL;

-- 1.3. Para metas órfãs, usar primeiro admin
UPDATE public.metas
SET auth_user_id = (
  SELECT u.auth_user_id
  FROM public.usuarios u
  INNER JOIN public.perfis p ON u.perfil_id = p.id
  WHERE p.nome = 'Admin'
  LIMIT 1
)
WHERE auth_user_id IS NULL;

-- 1.4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_metas_auth_user_id
ON public.metas(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_metas_ativa_escopo
ON public.metas(ativa, escopo);

CREATE INDEX IF NOT EXISTS idx_metas_periodo_ano_mes
ON public.metas(periodo, ano, mes);

-- ====================================================================
-- PARTE 2: CRIAR/ATUALIZAR FUNÇÃO DE SINCRONIZAÇÃO auth_user_id
-- ====================================================================

CREATE OR REPLACE FUNCTION sync_auth_user_id_metas()
RETURNS TRIGGER AS $$
BEGIN
  -- Se criada_por foi definido, buscar auth_user_id
  IF NEW.criada_por IS NOT NULL THEN
    NEW.auth_user_id := (
      SELECT auth_user_id
      FROM usuarios
      WHERE id = NEW.criada_por
    );
  END IF;

  -- Se ainda não tiver, usar auth.uid()
  IF NEW.auth_user_id IS NULL THEN
    NEW.auth_user_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dropar trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_sync_auth_user_id_metas ON public.metas;

-- Criar novo trigger
CREATE TRIGGER trigger_sync_auth_user_id_metas
  BEFORE INSERT OR UPDATE ON public.metas
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_metas();

-- ====================================================================
-- PARTE 3: ATUALIZAR POLÍTICAS RLS PARA METAS
-- ====================================================================

-- Habilitar RLS
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Dropar políticas antigas
DROP POLICY IF EXISTS "metas_select_policy" ON public.metas;
DROP POLICY IF EXISTS "metas_insert_policy" ON public.metas;
DROP POLICY IF EXISTS "metas_update_policy" ON public.metas;
DROP POLICY IF EXISTS "metas_delete_policy" ON public.metas;

-- SELECT: Admin/Supervisor vê todas, Técnico vê só suas atribuições
CREATE POLICY "metas_select_policy" ON public.metas
  FOR SELECT
  USING (
    -- Admin e Supervisor veem todas
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('Admin', 'Supervisor')
    )
    OR
    -- Técnico vê metas de equipe ativas
    (escopo = 'equipe' AND ativa = true)
    OR
    -- Técnico vê metas atribuídas a ele
    EXISTS (
      SELECT 1 FROM metas_atribuicoes ma
      INNER JOIN usuarios u ON ma.tma_id = u.id
      WHERE ma.meta_id = metas.id
      AND u.auth_user_id = auth.uid()
    )
  );

-- INSERT: Apenas Admin e Supervisor
CREATE POLICY "metas_insert_policy" ON public.metas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('Admin', 'Supervisor')
    )
  );

-- UPDATE: Apenas Admin e Supervisor
CREATE POLICY "metas_update_policy" ON public.metas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('Admin', 'Supervisor')
    )
  );

-- DELETE: Apenas Admin
CREATE POLICY "metas_delete_policy" ON public.metas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome = 'Admin'
    )
  );

-- ====================================================================
-- PARTE 4: POLÍTICAS RLS PARA TABELAS RELACIONADAS
-- ====================================================================

-- RLS para metas_atribuicoes
ALTER TABLE public.metas_atribuicoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metas_atribuicoes_select_policy" ON public.metas_atribuicoes;
CREATE POLICY "metas_atribuicoes_select_policy" ON public.metas_atribuicoes
  FOR SELECT
  USING (
    -- Admin/Supervisor veem todas
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('Admin', 'Supervisor')
    )
    OR
    -- Técnico vê só suas atribuições
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = metas_atribuicoes.tma_id
      AND u.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "metas_atribuicoes_insert_policy" ON public.metas_atribuicoes;
CREATE POLICY "metas_atribuicoes_insert_policy" ON public.metas_atribuicoes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('Admin', 'Supervisor')
    )
  );

DROP POLICY IF EXISTS "metas_atribuicoes_delete_policy" ON public.metas_atribuicoes;
CREATE POLICY "metas_atribuicoes_delete_policy" ON public.metas_atribuicoes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('Admin', 'Supervisor')
    )
  );

-- RLS para progresso_metas
ALTER TABLE public.progresso_metas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progresso_metas_select_policy" ON public.progresso_metas;
CREATE POLICY "progresso_metas_select_policy" ON public.progresso_metas
  FOR SELECT
  USING (
    -- Admin/Supervisor veem todos
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('Admin', 'Supervisor')
    )
    OR
    -- Técnico vê seu próprio progresso
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = progresso_metas.tma_id
      AND u.auth_user_id = auth.uid()
    )
    OR
    -- Técnico vê progresso de metas de equipe
    EXISTS (
      SELECT 1 FROM metas m
      WHERE m.id = progresso_metas.meta_id
      AND m.escopo = 'equipe'
      AND m.ativa = true
    )
  );

-- ====================================================================
-- PARTE 5: FUNÇÃO PARA ATUALIZAR PROGRESSO AUTOMATICAMENTE
-- ====================================================================

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
      AND (v_meta.escopo = 'equipe' OR criada_por IN (
        SELECT id FROM usuarios WHERE id = p_tma_id
      ));

    ELSIF p_tipo_meta = 'termo' THEN
      SELECT COUNT(*) INTO v_quantidade_atual
      FROM termos_ambientais
      WHERE DATE_PART('year', created_at) = p_ano
      AND (p_mes IS NULL OR DATE_PART('month', created_at) = p_mes)
      AND (v_meta.escopo = 'equipe' OR emitido_por IN (
        SELECT id FROM usuarios WHERE id = p_tma_id
      ));

    ELSIF p_tipo_meta = 'rotina' THEN
      SELECT COUNT(*) INTO v_quantidade_atual
      FROM atividades_rotina
      WHERE DATE_PART('year', created_at) = p_ano
      AND (p_mes IS NULL OR DATE_PART('month', created_at) = p_mes)
      AND (v_meta.escopo = 'equipe' OR usuario_id IN (
        SELECT id FROM usuarios WHERE id = p_tma_id
      ));
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
    ON CONFLICT (meta_id, periodo, ano, mes, semana, dia, tma_id)
    DO UPDATE SET
      quantidade_atual = EXCLUDED.quantidade_atual,
      percentual_atual = EXCLUDED.percentual_atual,
      percentual_alcancado = EXCLUDED.percentual_alcancado,
      status = EXCLUDED.status,
      ultima_atualizacao = NOW();

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- PARTE 6: TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ====================================================================

-- Trigger para LVs
CREATE OR REPLACE FUNCTION trigger_atualizar_progresso_lvs()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_ano INTEGER;
  v_mes INTEGER;
BEGIN
  -- Buscar usuario_id do criador
  SELECT u.id, DATE_PART('year', NEW.created_at), DATE_PART('month', NEW.created_at)
  INTO v_usuario_id, v_ano, v_mes
  FROM usuarios u
  WHERE u.auth_user_id = NEW.auth_user_id;

  -- Atualizar progresso
  PERFORM atualizar_progresso_meta('lv', v_usuario_id, v_ano, v_mes);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_progresso_lvs_insert ON public.lvs;
CREATE TRIGGER trigger_progresso_lvs_insert
  AFTER INSERT ON public.lvs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_progresso_lvs();

-- Trigger para Termos
CREATE OR REPLACE FUNCTION trigger_atualizar_progresso_termos()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_ano INTEGER;
  v_mes INTEGER;
BEGIN
  SELECT u.id, DATE_PART('year', NEW.created_at), DATE_PART('month', NEW.created_at)
  INTO v_usuario_id, v_ano, v_mes
  FROM usuarios u
  WHERE u.auth_user_id = NEW.auth_user_id;

  PERFORM atualizar_progresso_meta('termo', v_usuario_id, v_ano, v_mes);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_progresso_termos_insert ON public.termos_ambientais;
CREATE TRIGGER trigger_progresso_termos_insert
  AFTER INSERT ON public.termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_progresso_termos();

-- Trigger para Rotinas
CREATE OR REPLACE FUNCTION trigger_atualizar_progresso_rotinas()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_ano INTEGER;
  v_mes INTEGER;
BEGIN
  SELECT u.id, DATE_PART('year', NEW.created_at), DATE_PART('month', NEW.created_at)
  INTO v_usuario_id, v_ano, v_mes
  FROM usuarios u
  WHERE u.auth_user_id = NEW.auth_user_id;

  PERFORM atualizar_progresso_meta('rotina', v_usuario_id, v_ano, v_mes);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_progresso_rotinas_insert ON public.atividades_rotina;
CREATE TRIGGER trigger_progresso_rotinas_insert
  AFTER INSERT ON public.atividades_rotina
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_progresso_rotinas();

-- ====================================================================
-- PARTE 7: VERIFICAÇÃO E RELATÓRIO
-- ====================================================================

DO $$
DECLARE
  total_metas INTEGER;
  metas_com_auth INTEGER;
  total_atribuicoes INTEGER;
  total_progresso INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_metas FROM public.metas;
  SELECT COUNT(*) INTO metas_com_auth FROM public.metas WHERE auth_user_id IS NOT NULL;
  SELECT COUNT(*) INTO total_atribuicoes FROM public.metas_atribuicoes;
  SELECT COUNT(*) INTO total_progresso FROM public.progresso_metas;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRAÇÃO DO SISTEMA DE METAS CONCLUÍDA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de metas: %', total_metas;
  RAISE NOTICE 'Metas com auth_user_id: %', metas_com_auth;
  RAISE NOTICE 'Total de atribuições: %', total_atribuicoes;
  RAISE NOTICE 'Total de registros de progresso: %', total_progresso;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Recursos habilitados:';
  RAISE NOTICE '✅ Coluna auth_user_id adicionada';
  RAISE NOTICE '✅ Índices criados';
  RAISE NOTICE '✅ Triggers de sincronização';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '✅ Atualização automática de progresso';
  RAISE NOTICE '========================================';

  IF metas_com_auth < total_metas THEN
    RAISE WARNING '⚠️ Atenção: % metas sem auth_user_id!', (total_metas - metas_com_auth);
  END IF;
END $$;
