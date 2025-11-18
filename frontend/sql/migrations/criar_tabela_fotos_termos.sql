-- ===================================================================
-- CRIAR TABELA FOTOS_TERMOS SE NÃO EXISTIR
-- ===================================================================

-- 1. CRIAR TABELA FOTOS_TERMOS
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.fotos_termos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  termo_id UUID NOT NULL REFERENCES public.termos_ambientais(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT DEFAULT 'geral',
  tamanho INTEGER,
  tipo TEXT DEFAULT 'image/jpeg',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  precisao_gps INTEGER,
  endereco TEXT,
  timestamp_captura TIMESTAMP WITH TIME ZONE,
  offline BOOLEAN DEFAULT false,
  sincronizado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_fotos_termos_termo_id ON public.fotos_termos(termo_id);
CREATE INDEX IF NOT EXISTS idx_fotos_termos_categoria ON public.fotos_termos(categoria);
CREATE INDEX IF NOT EXISTS idx_fotos_termos_created_at ON public.fotos_termos(created_at);

-- 3. HABILITAR RLS
-- ===================================================================
ALTER TABLE public.fotos_termos ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS
-- ===================================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver fotos de seus termos" ON public.fotos_termos;
DROP POLICY IF EXISTS "Usuários podem inserir fotos em seus termos" ON public.fotos_termos;
DROP POLICY IF EXISTS "Usuários podem atualizar fotos de seus termos" ON public.fotos_termos;
DROP POLICY IF EXISTS "Usuários podem deletar fotos de seus termos" ON public.fotos_termos;

-- Política para SELECT
CREATE POLICY "Usuários podem ver fotos de seus termos" ON public.fotos_termos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = fotos_termos.termo_id
    AND termos_ambientais.emitido_por_id = auth.uid()
  )
);

-- Política para INSERT
CREATE POLICY "Usuários podem inserir fotos em seus termos" ON public.fotos_termos
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = fotos_termos.termo_id
    AND termos_ambientais.emitido_por_id = auth.uid()
  )
);

-- Política para UPDATE
CREATE POLICY "Usuários podem atualizar fotos de seus termos" ON public.fotos_termos
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = fotos_termos.termo_id
    AND termos_ambientais.emitido_por_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = fotos_termos.termo_id
    AND termos_ambientais.emitido_por_id = auth.uid()
  )
);

-- Política para DELETE
CREATE POLICY "Usuários podem deletar fotos de seus termos" ON public.fotos_termos
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = fotos_termos.termo_id
    AND termos_ambientais.emitido_por_id = auth.uid()
  )
);

-- 5. VERIFICAR SE A TABELA FOI CRIADA
-- ===================================================================
SELECT 
  'TABELA STATUS' as tipo,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'fotos_termos';

-- 6. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================
SELECT 
  'POLÍTICAS FOTOS_TERMOS' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'fotos_termos'
ORDER BY policyname;

-- 7. LOG DE CONCLUSÃO
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela fotos_termos criada/verificada';
  RAISE NOTICE '✅ RLS habilitado na tabela fotos_termos';
  RAISE NOTICE '✅ Políticas RLS configuradas para fotos de termos';
  RAISE NOTICE '✅ Usuários podem gerenciar fotos de seus próprios termos';
  RAISE NOTICE '✅ Teste o salvamento de fotos agora';
END $$; 