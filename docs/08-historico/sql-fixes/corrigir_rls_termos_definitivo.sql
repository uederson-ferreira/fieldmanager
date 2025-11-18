-- ===================================================================
-- CORRIGIR RLS TERMOS AMBIENTAIS - SOLUÇÃO DEFINITIVA
-- ===================================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE termos_ambientais DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "termos_insert_user" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_select_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_update_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_delete_admin_only" ON termos_ambientais;

-- 3. CRIAR POLÍTICAS CORRETAS
-- ===================================================================

-- POLÍTICA INSERT: Usuário só pode inserir seus próprios termos
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT WITH CHECK (emitido_por_usuario_id = auth.uid()::uuid);

-- POLÍTICA SELECT: Usuário vê seus próprios termos OU admins veem todos
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

-- POLÍTICA UPDATE: Usuário atualiza seus próprios termos OU admins atualizam todos
CREATE POLICY "termos_update_user_admin" ON termos_ambientais
FOR UPDATE USING (
  emitido_por_usuario_id = auth.uid()::uuid 
  OR EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid()::uuid
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- POLÍTICA DELETE: Apenas admins podem deletar
CREATE POLICY "termos_delete_admin_only" ON termos_ambientais
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid()::uuid
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- 4. REABILITAR RLS
ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  'POLÍTICAS CRIADAS' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY cmd, policyname;

-- 6. TESTAR COM O JOÃO
DO $$
DECLARE
  current_user_id text := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
  rls_result integer;
BEGIN
  RAISE NOTICE '🧪 Testando RLS corrigido...';
  RAISE NOTICE '👤 Usuário: %', current_user_id;
  
  SELECT COUNT(*) INTO rls_result
  FROM termos_ambientais 
  WHERE emitido_por_usuario_id = current_user_id::uuid;
  
  RAISE NOTICE '📊 Resultado com RLS corrigido: %', rls_result;
  
  IF rls_result = 5 THEN
    RAISE NOTICE '✅ RLS corrigido! João pode ver seus 5 termos!';
  ELSE
    RAISE NOTICE '❌ Ainda há problema no RLS!';
  END IF;
END $$; 