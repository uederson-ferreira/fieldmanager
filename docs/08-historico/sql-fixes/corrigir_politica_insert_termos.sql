-- ===================================================================
-- CORRIGIR POLÍTICA INSERT - TERMOS_AMBIENTAIS
-- ===================================================================

-- 1. VERIFICAR POLÍTICA INSERT ATUAL
-- ===================================================================
SELECT 
  'POLÍTICA INSERT ATUAL' as tipo,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
AND cmd = 'INSERT';

-- 2. REMOVER POLÍTICA INSERT INCORRETA
-- ===================================================================
DROP POLICY IF EXISTS "termos_insert_user" ON termos_ambientais;

-- 3. CRIAR POLÍTICA INSERT CORRETA
-- ===================================================================
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT WITH CHECK (
  emitido_por_usuario_id = auth.uid()
);

-- 4. VERIFICAR POLÍTICA CORRIGIDA
-- ===================================================================
SELECT 
  'POLÍTICA INSERT CORRIGIDA' as tipo,
  policyname,
  cmd,
  qual,
  with_check,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ COM RESTRIÇÃO'
    ELSE '❌ SEM RESTRIÇÃO'
  END as status
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
AND cmd = 'INSERT';

-- 5. VERIFICAR TODAS AS POLÍTICAS
-- ===================================================================
SELECT 
  'TODAS AS POLÍTICAS' as tipo,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL OR with_check IS NOT NULL THEN '✅ COM RESTRIÇÃO'
    ELSE '❌ SEM RESTRIÇÃO'
  END as restricao
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY cmd;

-- 6. TESTE FINAL
-- ===================================================================
DO $$
DECLARE
  insert_restricted boolean;
  total_restricted integer;
BEGIN
  -- Verificar se INSERT tem restrição
  SELECT with_check IS NOT NULL INTO insert_restricted
  FROM pg_policies 
  WHERE tablename = 'termos_ambientais'
  AND cmd = 'INSERT';
  
  -- Contar políticas com restrição
  SELECT COUNT(*) INTO total_restricted
  FROM pg_policies 
  WHERE tablename = 'termos_ambientais'
  AND (qual IS NOT NULL OR with_check IS NOT NULL);
  
  RAISE NOTICE '🔒 Verificação final das políticas:';
  RAISE NOTICE '📤 INSERT com restrição: %', insert_restricted;
  RAISE NOTICE '📊 Total com restrição: %/4', total_restricted;
  
  IF insert_restricted AND total_restricted = 4 THEN
    RAISE NOTICE '✅ Todas as políticas estão seguras!';
  ELSE
    RAISE NOTICE '⚠️ Ainda há políticas sem restrição!';
  END IF;
  
END $$; 