-- ===================================================================
-- CORRIGIR POLÍTICAS DE STORAGE - SISTEMA DE TERMOS
-- ===================================================================

-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
-- ===================================================================
DROP POLICY IF EXISTS "Permitir leitura pública das fotos de termos" ON storage.objects;

-- 2. ADICIONAR POLÍTICA DE INSERT (UPLOAD)
-- ===================================================================
CREATE POLICY "fotos_termos_insert_authenticated" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'fotos-termos' 
  AND auth.role() = 'authenticated'
);

-- 3. CORRIGIR POLÍTICA DE SELECT (LEITURA AUTENTICADA)
-- ===================================================================
CREATE POLICY "fotos_termos_select_authenticated" ON storage.objects
FOR SELECT USING (
  bucket_id = 'fotos-termos' 
  AND auth.role() = 'authenticated'
);

-- 4. VERIFICAR POLÍTICAS FINAIS
-- ===================================================================
SELECT 
  'POLÍTICAS CORRIGIDAS' as tipo,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND qual LIKE '%fotos-termos%'
ORDER BY cmd;

-- 5. TESTE DE SEGURANÇA
-- ===================================================================
DO $$
DECLARE
  public_select_count integer;
  authenticated_policies integer;
BEGIN
  -- Verificar se ainda há SELECT público
  SELECT COUNT(*) INTO public_select_count
  FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND cmd = 'SELECT'
  AND qual LIKE '%fotos-termos%'
  AND qual NOT LIKE '%auth.role()%';
  
  -- Contar políticas autenticadas
  SELECT COUNT(*) INTO authenticated_policies
  FROM pg_policies 
  WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND qual LIKE '%fotos-termos%'
  AND qual LIKE '%auth.role()%';
  
  RAISE NOTICE '🔒 Verificação de segurança concluída';
  RAISE NOTICE '📊 Políticas públicas restantes: %', public_select_count;
  RAISE NOTICE '📊 Políticas autenticadas: %', authenticated_policies;
  
  IF public_select_count = 0 AND authenticated_policies >= 4 THEN
    RAISE NOTICE '✅ Storage seguro configurado!';
  ELSE
    RAISE NOTICE '⚠️ Ainda há problemas de segurança!';
  END IF;
  
END $$; 