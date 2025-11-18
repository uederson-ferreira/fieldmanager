-- ===================================================================
// DESABILITAR RLS - TABELAS LVs
-- ===================================================================

-- ⚠️ ATENÇÃO: Este script desabilita RLS temporariamente para teste

-- 1. Desabilitar RLS nas tabelas LVs
ALTER TABLE public.lvs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_fotos DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename;

-- 3. Testar acesso aos dados
SELECT 
  'lvs' as tabela,
  COUNT(*) as total_registros
FROM public.lvs
WHERE tipo_lv = '01'
UNION ALL
SELECT 
  'lv_avaliacoes' as tabela,
  COUNT(*) as total_registros
FROM public.lv_avaliacoes
WHERE tipo_lv = '01'
UNION ALL
SELECT 
  'lv_fotos' as tabela,
  COUNT(*) as total_registros
FROM public.lv_fotos
WHERE tipo_lv = '01';

-- 4. Mostrar algumas LVs para confirmar acesso
SELECT 
  id,
  numero_sequencial,
  tipo_lv,
  area,
  usuario_id,
  usuario_nome,
  data_inspecao,
  status,
  created_at
FROM public.lvs
WHERE tipo_lv = '01'
ORDER BY created_at DESC
LIMIT 5;

-- ===================================================================
// PARA REATIVAR RLS (quando necessário):
-- ===================================================================

/*
-- Reativar RLS
ALTER TABLE public.lvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_fotos ENABLE ROW LEVEL SECURITY;

-- Verificar se foi reativado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename;
*/ 