-- ===================================================================
-- LIMPAR METAS PARA TESTE - ECOFIELD
-- ===================================================================
-- Este script remove todas as metas antigas para permitir testes limpos
-- Execute apenas em ambiente de desenvolvimento/teste

-- 1. DESABILITAR TRIGGERS TEMPORARIAMENTE
-- ===================================================================
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- 2. LIMPAR DADOS DE METAS (CASCADE)
-- ===================================================================
-- Limpar progresso de metas (será recalculado pelos triggers)
DELETE FROM progresso_metas;

-- Limpar atribuições de metas
DELETE FROM metas_atribuicoes;

-- Limpar metas
DELETE FROM metas;

-- 3. VERIFICAR LIMPEZA
-- ===================================================================
SELECT 'Verificação após limpeza:' as status;

SELECT 
  'metas' as tabela,
  COUNT(*) as registros
FROM metas
UNION ALL
SELECT 
  'metas_atribuicoes' as tabela,
  COUNT(*) as registros
FROM metas_atribuicoes
UNION ALL
SELECT 
  'progresso_metas' as tabela,
  COUNT(*) as registros
FROM progresso_metas;

-- 4. REABILITAR TRIGGERS
-- ===================================================================
-- Recriar triggers para funcionamento normal
CREATE TRIGGER trigger_calcular_progresso_termos 
  AFTER INSERT OR UPDATE ON termos_ambientais 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lvs 
  AFTER INSERT OR UPDATE ON lvs 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lv_residuos 
  AFTER INSERT OR UPDATE ON lv_residuos 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_rotinas 
  AFTER INSERT OR UPDATE ON atividades_rotina 
  FOR EACH ROW EXECUTE FUNCTION calcular_progresso_metas();

-- 5. VERIFICAR TRIGGERS
-- ===================================================================
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE '%calcular_progresso%'
ORDER BY table_name;

-- 6. MENSAGEM FINAL
-- ===================================================================
SELECT '✅ LIMPEZA CONCLUÍDA - Sistema pronto para testes!' as resultado; 