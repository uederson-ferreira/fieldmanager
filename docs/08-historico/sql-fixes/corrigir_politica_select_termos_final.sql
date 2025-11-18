-- ===================================================================
-- CORRIGIR POLÍTICA SELECT TERMOS AMBIENTAIS - CAST CORRETO
-- ===================================================================

-- Desabilitar RLS temporariamente
ALTER TABLE termos_ambientais DISABLE ROW LEVEL SECURITY;

-- Remover política atual
DROP POLICY IF EXISTS "termos_select_user_admin" ON termos_ambientais;

-- Recriar política com cast correto
CREATE POLICY "termos_select_user_admin" ON termos_ambientais
FOR SELECT USING (
  emitido_por_usuario_id = auth.uid()::uuid 
  OR EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid()::uuid  -- ✅ CAST CORRETO AQUI
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- Reabilitar RLS
ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- Verificar política criada
SELECT 
  'POLÍTICA CORRIGIDA' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
AND cmd = 'SELECT'; 