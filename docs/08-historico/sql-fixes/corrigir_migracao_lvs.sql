-- ===================================================================
// CORREÇÃO DA MIGRAÇÃO - CRIAR LVs BASEADO NAS AVALIAÇÕES
-- ===================================================================

-- ⚠️ ATENÇÃO: Este script corrige a migração criando LVs baseado nas avaliações existentes

-- 1. Primeiro, vamos verificar quais LVs precisam ser criadas
WITH lvs_para_criar AS (
  SELECT DISTINCT
    la.lv_id,
    la.tipo_lv,
    lr.numero_sequencial,
    lr.area,
    lr.responsavel_tecnico,
    lr.responsavel_empresa,
    lr.inspetor_principal,
    lr.inspetor_secundario,
    lr.data_inspecao,
    lr.observacoes_gerais,
    lr.latitude,
    lr.longitude,
    lr.gps_precisao,
    lr.endereco_gps,
    lr.usuario_id,
    lr.usuario_nome,
    lr.usuario_matricula,
    lr.usuario_email,
    lr.status,
    lr.total_conformes,
    lr.total_nao_conformes,
    lr.total_nao_aplicaveis,
    lr.percentual_conformidade,
    lr.total_fotos,
    lr.created_at,
    lr.updated_at
  FROM public.lv_avaliacoes la
  LEFT JOIN public.lvs l ON la.lv_id = l.id
  LEFT JOIN public.lv_residuos lr ON la.lv_id = lr.id
  WHERE l.id IS NULL 
    AND la.tipo_lv = '01'
    AND lr.id IS NOT NULL
)
SELECT 
  'LVs para criar' as acao,
  COUNT(*) as total
FROM lvs_para_criar;

-- 2. Criar as LVs que estão faltando
INSERT INTO public.lvs (
  id,
  tipo_lv,
  nome_lv,
  numero_sequencial,
  usuario_id,
  usuario_nome,
  usuario_matricula,
  usuario_email,
  data_inspecao,
  area,
  responsavel_area,
  responsavel_tecnico,
  responsavel_empresa,
  inspetor_principal,
  inspetor_secundario,
  latitude,
  longitude,
  gps_precisao,
  endereco_gps,
  observacoes_gerais,
  status,
  total_conformes,
  total_nao_conformes,
  total_nao_aplicaveis,
  percentual_conformidade,
  total_fotos,
  created_at,
  updated_at
)
SELECT DISTINCT
  la.lv_id as id,
  la.tipo_lv,
  'Resíduos' as nome_lv,
  lr.numero_sequencial,
  lr.usuario_id,
  lr.usuario_nome,
  lr.usuario_matricula,
  lr.usuario_email,
  lr.data_inspecao,
  lr.area,
  lr.responsavel_area,
  lr.responsavel_tecnico,
  lr.responsavel_empresa,
  lr.inspetor_principal,
  lr.inspetor_secundario,
  lr.latitude,
  lr.longitude,
  lr.gps_precisao,
  lr.endereco_gps,
  lr.observacoes_gerais,
  lr.status,
  lr.total_conformes,
  lr.total_nao_conformes,
  lr.total_nao_aplicaveis,
  lr.percentual_conformidade,
  lr.total_fotos,
  lr.created_at,
  lr.updated_at
FROM public.lv_avaliacoes la
LEFT JOIN public.lvs l ON la.lv_id = l.id
LEFT JOIN public.lv_residuos lr ON la.lv_id = lr.id
WHERE l.id IS NULL 
  AND la.tipo_lv = '01'
  AND lr.id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se a correção funcionou
SELECT 
  'lvs_apos_correcao' as status,
  COUNT(*) as total_registros
FROM public.lvs
WHERE tipo_lv = '01';

-- 4. Verificar se todas as avaliações agora têm LVs correspondentes
SELECT 
  'avaliacoes_sem_lv' as problema,
  COUNT(*) as total
FROM public.lv_avaliacoes la
LEFT JOIN public.lvs l ON la.lv_id = l.id
WHERE l.id IS NULL
UNION ALL
SELECT 
  'avaliacoes_com_lv' as ok,
  COUNT(*) as total
FROM public.lv_avaliacoes la
INNER JOIN public.lvs l ON la.lv_id = l.id;

-- 5. Mostrar algumas LVs criadas
SELECT 
  id,
  numero_sequencial,
  tipo_lv,
  area,
  responsavel_tecnico,
  usuario_nome,
  data_inspecao,
  status,
  created_at
FROM public.lvs
WHERE tipo_lv = '01'
ORDER BY created_at DESC
LIMIT 5; 