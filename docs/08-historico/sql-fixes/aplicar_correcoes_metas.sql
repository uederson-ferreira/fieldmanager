-- ===================================================================
-- SCRIPT PARA APLICAR CORREÇÕES DO SISTEMA DE METAS - ECOFIELD
-- Execute este script no SQL Editor do Supabase para corrigir o sistema
-- ===================================================================

-- 1. LIMPAR TRIGGERS E FUNÇÕES EXISTENTES
-- ===================================================================
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON public.termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON public.lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON public.lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON public.atividades_rotina;

DROP FUNCTION IF EXISTS calcular_progresso_metas() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 2. CORRIGIR ESTRUTURA DAS TABELAS
-- ===================================================================

-- Verificar se a constraint única está correta
ALTER TABLE public.progresso_metas 
DROP CONSTRAINT IF EXISTS progresso_metas_meta_id_periodo_ano_mes_semana_dia_key;

-- Recriar constraint única correta
ALTER TABLE public.progresso_metas 
ADD CONSTRAINT progresso_metas_meta_id_periodo_ano_mes_semana_dia_tma_key 
UNIQUE (meta_id, periodo, ano, mes, semana, dia, tma_id);

-- 3. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR TRIGGERS PARA ATUALIZAR TIMESTAMP
-- ===================================================================
CREATE TRIGGER update_metas_updated_at 
  BEFORE UPDATE ON public.metas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metas_atribuicoes_updated_at 
  BEFORE UPDATE ON public.metas_atribuicoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progresso_metas_updated_at 
  BEFORE UPDATE ON public.progresso_metas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. CRIAR FUNÇÃO PRINCIPAL PARA CALCULAR PROGRESSO (CORRIGIDA)
-- ===================================================================
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

-- 6. CRIAR TRIGGERS PARA CALCULAR PROGRESSO
-- ===================================================================
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

-- 7. VERIFICAÇÃO FINAL
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

-- 8. TESTE DE FUNCIONAMENTO
-- ===================================================================
-- Verificar se há metas ativas
SELECT 
  'METAS ATIVAS' as status,
  COUNT(*) as total_metas
FROM metas 
WHERE ativa = true;

-- Verificar se há progresso registrado
SELECT 
  'PROGRESSO REGISTRADO' as status,
  COUNT(*) as total_progresso
FROM progresso_metas;

-- Verificar se há atribuições
SELECT 
  'ATRIBUIÇÕES' as status,
  COUNT(*) as total_atribuicoes
FROM metas_atribuicoes; 