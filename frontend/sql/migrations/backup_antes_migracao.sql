-- ===================================================================
-- BACKUP ANTES DA MIGRAÇÃO - ESTRUTURA UNIFICADA
-- ===================================================================
-- EXECUTAR ESTE SCRIPT ANTES DA MIGRAÇÃO PARA GARANTIR SEGURANÇA
-- ===================================================================

-- 1. Criar tabelas de backup
CREATE TABLE IF NOT EXISTS backup_lv_residuos AS 
SELECT * FROM public.lv_residuos;

CREATE TABLE IF NOT EXISTS backup_lv_residuos_avaliacoes AS 
SELECT * FROM public.lv_residuos_avaliacoes;

CREATE TABLE IF NOT EXISTS backup_lv_residuos_fotos AS 
SELECT * FROM public.lv_residuos_fotos;

-- 2. Verificar se o backup foi criado corretamente
SELECT 
  'backup_lv_residuos' as tabela,
  COUNT(*) as total_registros
FROM backup_lv_residuos
UNION ALL
SELECT 
  'backup_lv_residuos_avaliacoes' as tabela,
  COUNT(*) as total_registros
FROM backup_lv_residuos_avaliacoes
UNION ALL
SELECT 
  'backup_lv_residuos_fotos' as tabela,
  COUNT(*) as total_registros
FROM backup_lv_residuos_fotos;

-- 3. Verificar integridade dos dados
SELECT 
  'Verificação de integridade' as tipo,
  COUNT(DISTINCT lr.id) as total_lvs,
  COUNT(DISTINCT lra.lv_residuos_id) as lvs_com_avaliacoes,
  COUNT(DISTINCT lrf.lv_residuos_id) as lvs_com_fotos
FROM backup_lv_residuos lr
LEFT JOIN backup_lv_residuos_avaliacoes lra ON lr.id = lra.lv_residuos_id
LEFT JOIN backup_lv_residuos_fotos lrf ON lr.id = lrf.lv_residuos_id;

-- 4. Verificar dados críticos
SELECT 
  'Dados críticos' as tipo,
  COUNT(*) as total_lvs,
  COUNT(CASE WHEN observacoes_gerais IS NOT NULL THEN 1 END) as com_observacoes_gerais,
  COUNT(CASE WHEN total_fotos > 0 THEN 1 END) as com_fotos,
  COUNT(CASE WHEN total_conformes > 0 OR total_nao_conformes > 0 OR total_nao_aplicaveis > 0 THEN 1 END) as com_avaliacoes
FROM backup_lv_residuos;

-- ===================================================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ===================================================================
-- Se todos os SELECTs acima retornaram dados, o backup foi bem-sucedido
-- Agora você pode executar a migração com segurança
-- =================================================================== 