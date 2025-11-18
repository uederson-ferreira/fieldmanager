-- ===================================================================
-- SCHEMA CORRIGIDO PARA SISTEMA DE METAS - ECOFIELD
-- Versão: 2.0 - Corrigida e Unificada
-- ===================================================================

-- 1. TABELA DE METAS (CORRIGIDA)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.metas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo_meta character varying(50) NOT NULL,
  categoria character varying(100) NULL,
  periodo character varying(20) NOT NULL,
  ano integer NOT NULL,
  mes integer NULL,
  semana integer NULL,
  dia integer NULL,
  meta_quantidade integer NOT NULL,
  meta_percentual numeric(5, 2) NULL,
  descricao text NULL,
  ativa boolean NULL DEFAULT true,
  criada_por uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  escopo character varying(20) NULL DEFAULT 'equipe'::character varying,
  CONSTRAINT metas_pkey PRIMARY KEY (id),
  CONSTRAINT metas_criada_por_fkey FOREIGN KEY (criada_por) REFERENCES usuarios (id),
  CONSTRAINT metas_escopo_check CHECK (
    (escopo)::text = ANY (
      (ARRAY['equipe'::character varying, 'individual'::character varying])::text[]
    )
  ),
  CONSTRAINT metas_periodo_check CHECK (
    (periodo)::text = ANY (
      (ARRAY['diario'::character varying, 'semanal'::character varying, 'mensal'::character varying, 'trimestral'::character varying, 'anual'::character varying])::text[]
    )
  ),
  CONSTRAINT metas_tipo_meta_check CHECK (
    (tipo_meta)::text = ANY (
      (ARRAY['lv'::character varying, 'termo'::character varying, 'rotina'::character varying])::text[]
    )
  )
) TABLESPACE pg_default;

-- Índices para metas
CREATE INDEX IF NOT EXISTS idx_metas_tipo_periodo ON public.metas USING btree (tipo_meta, periodo, ano, mes) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_metas_ativa ON public.metas USING btree (ativa) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_metas_escopo ON public.metas USING btree (escopo) TABLESPACE pg_default;

-- 2. TABELA DE ATRIBUIÇÕES DE METAS (CORRIGIDA)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.metas_atribuicoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  meta_id uuid NULL,
  tma_id uuid NULL,
  meta_quantidade_individual integer NULL,
  responsavel boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT metas_atribuicoes_pkey PRIMARY KEY (id),
  CONSTRAINT metas_atribuicoes_meta_id_tma_id_key UNIQUE (meta_id, tma_id),
  CONSTRAINT metas_atribuicoes_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES metas (id) ON DELETE CASCADE,
  CONSTRAINT metas_atribuicoes_tma_id_fkey FOREIGN KEY (tma_id) REFERENCES usuarios (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Índices para atribuições
CREATE INDEX IF NOT EXISTS idx_metas_atribuicoes_meta ON public.metas_atribuicoes USING btree (meta_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_metas_atribuicoes_tma ON public.metas_atribuicoes USING btree (tma_id) TABLESPACE pg_default;

-- 3. TABELA DE PROGRESSO DE METAS (CORRIGIDA)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.progresso_metas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  meta_id uuid NULL,
  tma_id uuid NULL, -- NULL para progresso da equipe, UUID para progresso individual
  periodo character varying(20) NOT NULL,
  ano integer NOT NULL,
  mes integer NULL,
  semana integer NULL,
  dia integer NULL,
  quantidade_atual integer NULL DEFAULT 0,
  percentual_atual numeric(5, 2) NULL DEFAULT 0,
  percentual_alcancado numeric(5, 2) NULL DEFAULT 0,
  status character varying(20) NULL DEFAULT 'em_andamento'::character varying,
  ultima_atualizacao timestamp with time zone NULL DEFAULT now(),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT progresso_metas_pkey PRIMARY KEY (id),
  CONSTRAINT progresso_metas_meta_id_periodo_ano_mes_semana_dia_tma_key UNIQUE (meta_id, periodo, ano, mes, semana, dia, tma_id),
  CONSTRAINT progresso_metas_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES metas (id) ON DELETE CASCADE,
  CONSTRAINT progresso_metas_tma_id_fkey FOREIGN KEY (tma_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT progresso_metas_status_check CHECK (
    (status)::text = ANY (
      (ARRAY['em_andamento'::character varying, 'alcancada'::character varying, 'superada'::character varying, 'nao_alcancada'::character varying])::text[]
    )
  )
) TABLESPACE pg_default;

-- Índices para progresso
CREATE INDEX IF NOT EXISTS idx_progresso_metas_periodo ON public.progresso_metas USING btree (meta_id, periodo, ano, mes, semana, dia) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_progresso_metas_status ON public.progresso_metas USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_progresso_metas_tma ON public.progresso_metas USING btree (tma_id) TABLESPACE pg_default;

-- 4. FUNÇÃO PARA ATUALIZAR TIMESTAMP (CORRIGIDA)
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGERS PARA ATUALIZAR TIMESTAMP
-- ===================================================================
DROP TRIGGER IF EXISTS update_metas_updated_at ON public.metas;
CREATE TRIGGER update_metas_updated_at 
  BEFORE UPDATE ON public.metas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metas_atribuicoes_updated_at ON public.metas_atribuicoes;
CREATE TRIGGER update_metas_atribuicoes_updated_at 
  BEFORE UPDATE ON public.metas_atribuicoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_progresso_metas_updated_at ON public.progresso_metas;
CREATE TRIGGER update_progresso_metas_updated_at 
  BEFORE UPDATE ON public.progresso_metas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. FUNÇÃO PRINCIPAL PARA CALCULAR PROGRESSO (CORRIGIDA)
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
BEGIN
  -- Determinar o ID do usuário baseado na tabela que disparou o trigger
  CASE TG_TABLE_NAME
    WHEN 'termos_ambientais' THEN
      usuario_id_atual := NEW.emitido_por_usuario_id;
    WHEN 'lvs' THEN
      usuario_id_atual := NEW.usuario_id;
    WHEN 'lv_residuos' THEN
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
    -- Determinar quantidade da meta (individual ou equipe)
    IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
      meta_quantidade_final := meta_record.meta_quantidade_individual;
    ELSE
      meta_quantidade_final := meta_record.meta_quantidade;
    END IF;
    
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
        SELECT COUNT(*) INTO quantidade_atual
        FROM lvs 
        WHERE usuario_id = usuario_id_atual
        AND EXTRACT(YEAR FROM data_lv) = meta_record.ano
        AND (meta_record.mes IS NULL OR EXTRACT(MONTH FROM data_lv) = meta_record.mes)
        AND (meta_record.semana IS NULL OR EXTRACT(WEEK FROM data_lv) = meta_record.semana)
        AND (meta_record.dia IS NULL OR EXTRACT(DAY FROM data_lv) = meta_record.dia);
        
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
    
    -- Calcular percentual alcançado
    IF meta_quantidade_final > 0 THEN
      percentual_alcancado := LEAST(100.0, (quantidade_atual::NUMERIC / meta_quantidade_final::NUMERIC) * 100);
    ELSE
      percentual_alcancado := 0;
    END IF;
    
    -- Determinar status
    IF percentual_alcancado >= 100 THEN
      status_atual := 'alcancada';
    ELSIF percentual_alcancado >= 80 THEN
      status_atual := 'em_andamento';
    ELSE
      status_atual := 'em_andamento';
    END IF;
    
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
      ultima_atualizacao = NOW(),
      updated_at = NOW();
  END LOOP;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro sem interromper a operação
  RAISE WARNING 'Erro no trigger calcular_progresso_metas: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGERS PARA CALCULAR PROGRESSO
-- ===================================================================
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON public.termos_ambientais;
CREATE TRIGGER trigger_calcular_progresso_termos
  AFTER INSERT OR UPDATE ON public.termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON public.lvs;
CREATE TRIGGER trigger_calcular_progresso_lvs
  AFTER INSERT OR UPDATE ON public.lvs
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON public.lv_residuos;
CREATE TRIGGER trigger_calcular_progresso_lv_residuos
  AFTER INSERT OR UPDATE ON public.lv_residuos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON public.atividades_rotina;
CREATE TRIGGER trigger_calcular_progresso_rotinas
  AFTER INSERT OR UPDATE ON public.atividades_rotina
  FOR EACH ROW
  EXECUTE FUNCTION calcular_progresso_metas();

-- 8. VERIFICAÇÃO FINAL
-- ===================================================================
SELECT 
  'SCHEMA METAS CORRIGIDO' as status,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('metas', 'metas_atribuicoes', 'progresso_metas');

SELECT 
  'TRIGGERS CRIADOS' as status,
  COUNT(*) as total_triggers
FROM pg_trigger 
WHERE tgname LIKE '%calcular_progresso%';

SELECT 
  'FUNÇÃO CRIADA' as status,
  proname as function_name
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas'; 