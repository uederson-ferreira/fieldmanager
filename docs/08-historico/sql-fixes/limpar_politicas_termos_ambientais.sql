-- ===================================================================
-- LIMPAR E RECRIAR POLÍTICAS - TERMOS_AMBIENTAIS
-- ===================================================================

-- 1. DESATIVAR RLS TEMPORARIAMENTE
-- ===================================================================
ALTER TABLE termos_ambientais DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ===================================================================
DROP POLICY IF EXISTS "Exclusão termos apenas admin" ON termos_ambientais;
DROP POLICY IF EXISTS "allow_delete_termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Criação termos por usuário" ON termos_ambientais;
DROP POLICY IF EXISTS "allow_insert_termos" ON termos_ambientais;
DROP POLICY IF EXISTS "allow_select_termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Visualização termos por usuário" ON termos_ambientais;
DROP POLICY IF EXISTS "allow_update_termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Atualização termos por usuário" ON termos_ambientais;

-- 3. VERIFICAR SE TODAS FORAM REMOVIDAS
-- ===================================================================
SELECT 
  'POLÍTICAS REMOVIDAS' as tipo,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'termos_ambientais';

-- 4. CRIAR POLÍTICAS CORRETAS
-- ===================================================================

-- INSERT: Usuários podem criar seus próprios termos
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT WITH CHECK (emitido_por_usuario_id = auth.uid());

-- SELECT: Usuários veem seus termos + admins veem todos
CREATE POLICY "termos_select_user_admin" ON termos_ambientais
FOR SELECT USING (
  emitido_por_usuario_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- UPDATE: Usuários editam seus termos + admins editam todos
CREATE POLICY "termos_update_user_admin" ON termos_ambientais
FOR UPDATE USING (
  emitido_por_usuario_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- DELETE: Apenas admins podem deletar
CREATE POLICY "termos_delete_admin_only" ON termos_ambientais
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  )
);

-- 5. ATIVAR RLS
-- ===================================================================
ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR POLÍTICAS FINAIS
-- ===================================================================
SELECT 
  'POLÍTICAS FINAIS' as tipo,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NULL THEN 'SEM RESTRIÇÃO'
    ELSE 'COM RESTRIÇÃO'
  END as restricao
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY cmd;

-- 7. TESTE DE SEGURANÇA
-- ===================================================================
DO $$
DECLARE
  total_policies integer;
  rls_active boolean;
BEGIN
  -- Verificar RLS
  SELECT rowsecurity INTO rls_active
  FROM pg_tables 
  WHERE tablename = 'termos_ambientais';
  
  -- Contar políticas
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies 
  WHERE tablename = 'termos_ambientais';
  
  RAISE NOTICE '🔒 Status final do RLS:';
  RAISE NOTICE '📊 RLS ativo: %', rls_active;
  RAISE NOTICE '📋 Total de políticas: %', total_policies;
  
  IF rls_active AND total_policies = 4 THEN
    RAISE NOTICE '✅ RLS configurado corretamente!';
  ELSE
    RAISE NOTICE '⚠️ RLS precisa de ajustes!';
  END IF;
  
END $$; 