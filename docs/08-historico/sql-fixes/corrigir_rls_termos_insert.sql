-- ===================================================================
-- CORRIGIR RLS TERMOS AMBIENTAIS - PERMITIR INSERT
-- ===================================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- ===================================================================
ALTER TABLE termos_ambientais DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS EXISTENTES
-- ===================================================================
DROP POLICY IF EXISTS "termos_insert_user" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_select_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_update_user" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_delete_user" ON termos_ambientais;

-- 3. CRIAR POLÍTICA INSERT CORRETA
-- ===================================================================
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT WITH CHECK (
  emitido_por_usuario_id = auth.uid()::uuid
);

-- 4. CRIAR POLÍTICA SELECT CORRETA
-- ===================================================================
CREATE POLICY "termos_select_user_admin" ON termos_ambientais
FOR SELECT USING (
  emitido_por_usuario_id = auth.uid()::uuid 
  OR EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid()::uuid
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- 5. CRIAR POLÍTICA UPDATE CORRETA
-- ===================================================================
CREATE POLICY "termos_update_user" ON termos_ambientais
FOR UPDATE USING (
  emitido_por_usuario_id = auth.uid()::uuid
) WITH CHECK (
  emitido_por_usuario_id = auth.uid()::uuid
);

-- 6. CRIAR POLÍTICA DELETE CORRETA
-- ===================================================================
CREATE POLICY "termos_delete_user" ON termos_ambientais
FOR DELETE USING (
  emitido_por_usuario_id = auth.uid()::uuid
);

-- 7. REABILITAR RLS
-- ===================================================================
ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- 8. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================
SELECT 
  'POLÍTICAS CRIADAS' as status,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'SEM RESTRIÇÃO'
  END as restricao
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY cmd;

-- 9. TESTE FINAL
-- ===================================================================
DO $$
DECLARE
  total_policies integer;
BEGIN
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies 
  WHERE tablename = 'termos_ambientais';
  
  RAISE NOTICE '🔒 Políticas criadas: %/4', total_policies;
  
  IF total_policies = 4 THEN
    RAISE NOTICE '✅ Todas as políticas foram criadas com sucesso!';
  ELSE
    RAISE NOTICE '⚠️ Ainda faltam políticas!';
  END IF;
  
END $$; 