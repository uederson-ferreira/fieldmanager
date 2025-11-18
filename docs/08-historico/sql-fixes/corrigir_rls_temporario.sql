-- ===================================================================
-- CORREÇÃO TEMPORÁRIA DE RLS - PARA TESTE
-- ===================================================================

-- ⚠️ ATENÇÃO: Este script é apenas para teste!
-- Em produção, deve-se configurar RLS corretamente

-- 1. Desabilitar RLS temporariamente nas tabelas
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

-- 3. Verificar se os dados estão acessíveis
SELECT 
  'lvs' as tabela,
  COUNT(*) as total_registros
FROM public.lvs
UNION ALL
SELECT 
  'lv_avaliacoes' as tabela,
  COUNT(*) as total_registros
FROM public.lv_avaliacoes
UNION ALL
SELECT 
  'lv_fotos' as tabela,
  COUNT(*) as total_registros
FROM public.lv_fotos;

-- 4. Testar acesso aos dados
SELECT 
  id,
  numero_sequencial,
  area,
  usuario_id,
  usuario_nome,
  created_at
FROM public.lvs
ORDER BY created_at DESC
LIMIT 5;

-- ===================================================================
-- PARA REATIVAR RLS (quando necessário):
-- ===================================================================

/*
-- Reativar RLS
ALTER TABLE public.lvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_fotos ENABLE ROW LEVEL SECURITY;

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename, policyname;
*/ 