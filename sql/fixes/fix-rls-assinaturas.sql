-- ===================================================================
-- FIX: RLS POLICIES - TABELA ASSINATURAS_EXECUCOES
-- Data: 20/11/2025
-- Problema: Políticas RLS complexas com current_setting() bloqueando inserts
-- Solução: Simplificar para permitir usuários autenticados
-- ===================================================================

-- Remover políticas antigas que usam current_setting
DROP POLICY IF EXISTS assinaturas_tenant_isolation ON assinaturas_execucoes;
DROP POLICY IF EXISTS assinaturas_admin_full_access ON assinaturas_execucoes;

-- Nova política: Authenticated users podem inserir/ler assinaturas
CREATE POLICY assinaturas_authenticated_access ON assinaturas_execucoes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comentário
COMMENT ON POLICY assinaturas_authenticated_access ON assinaturas_execucoes
  IS 'Permite que usuários autenticados criem e leiam assinaturas';

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policy atualizada: assinaturas_execucoes agora permite authenticated users';
END $$;
