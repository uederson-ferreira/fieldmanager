-- ===================================================================
-- CORRIGIR POLÍTICA SELECT - TERMOS_AMBIENTAIS
-- ===================================================================

-- 1. REMOVER POLÍTICA SELECT ATUAL
-- ===================================================================
DROP POLICY IF EXISTS "termos_select_user_admin" ON termos_ambientais;

-- 2. CRIAR POLÍTICA SELECT CORRIGIDA
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

-- 3. VERIFICAR POLÍTICA CORRIGIDA
-- ===================================================================
SELECT 
  'POLÍTICA SELECT CORRIGIDA' as tipo,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
AND cmd = 'SELECT';

-- 4. TESTE DE VISIBILIDADE
-- ===================================================================
DO $$
DECLARE
  current_user_id text;
  user_terms_count integer;
  admin_terms_count integer;
  total_visible integer;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  RAISE NOTICE '👤 Usuário atual: %', current_user_id;
  
  -- Contar termos do usuário
  SELECT COUNT(*) INTO user_terms_count
  FROM termos_ambientais 
  WHERE emitido_por_usuario_id = current_user_id::uuid;
  
  -- Contar termos visíveis para admin
  SELECT COUNT(*) INTO admin_terms_count
  FROM termos_ambientais 
  WHERE EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = current_user_id::uuid
    AND p.nome = ANY (ARRAY['admin', 'developer', 'ADM'])
  );
  
  -- Contar total visível
  SELECT COUNT(*) INTO total_visible
  FROM termos_ambientais;
  
  RAISE NOTICE '📊 Teste de visibilidade:';
  RAISE NOTICE '👤 Termos do usuário: %', user_terms_count;
  RAISE NOTICE '👑 Termos visíveis como admin: %', admin_terms_count;
  RAISE NOTICE '📋 Total visível: %', total_visible;
  
  IF user_terms_count > 0 OR admin_terms_count > 0 THEN
    RAISE NOTICE '✅ Política SELECT funcionando!';
  ELSE
    RAISE NOTICE '❌ Política SELECT ainda com problema!';
  END IF;
  
END $$; 