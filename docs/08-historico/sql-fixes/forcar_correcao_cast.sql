-- ===================================================================
-- FORÇAR CORREÇÃO DO CAST UUID - POLÍTICA INSERT
-- ===================================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE termos_ambientais DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS
DROP POLICY IF EXISTS "termos_insert_user" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_select_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_update_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_delete_admin_only" ON termos_ambientais;

-- 3. CRIAR POLÍTICAS COM CAST EXPLÍCITO
-- ===================================================================

-- POLÍTICA INSERT
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT WITH CHECK (emitido_por_usuario_id::text = auth.uid());

-- POLÍTICA SELECT
CREATE POLICY "termos_select_user_admin" ON termos_ambientais
FOR SELECT USING (
  emitido_por_usuario_id::text = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- POLÍTICA UPDATE
CREATE POLICY "termos_update_user_admin" ON termos_ambientais
FOR UPDATE USING (
  emitido_por_usuario_id::text = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- POLÍTICA DELETE
CREATE POLICY "termos_delete_admin_only" ON termos_ambientais
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- 4. REABILITAR RLS
ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  'POLÍTICAS COM CAST TEXT' as status,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY cmd, policyname;

-- 6. TESTAR SE O JOÃO CONSEGUE VER SEUS TERMOS
DO $$
DECLARE
  current_user_id text := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
  rls_result integer;
BEGIN
  RAISE NOTICE '🧪 Testando com cast text...';
  RAISE NOTICE '👤 Usuário: %', current_user_id;
  
  SELECT COUNT(*) INTO rls_result
  FROM termos_ambientais 
  WHERE emitido_por_usuario_id::text = current_user_id;
  
  RAISE NOTICE '📊 Termos visíveis para João: %', rls_result;
  
  IF rls_result = 5 THEN
    RAISE NOTICE '✅ RLS funcionando! João pode ver seus 5 termos!';
  ELSE
    RAISE NOTICE '❌ Ainda há problema no RLS!';
  END IF;
END $$; 