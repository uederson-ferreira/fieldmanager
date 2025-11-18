-- ===================================================================
-- CORRIGIR RLS TERMOS AMBIENTAIS - ECOFIELD
-- Localização: sql/corrigir_rls_termos_final.sql
-- ===================================================================

-- Este script corrige as políticas RLS da tabela termos_ambientais

-- ===================================================================
-- 1. VERIFICAR POLÍTICAS ATUAIS
-- ===================================================================

SELECT 
  'POLÍTICAS ATUAIS' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'termos_ambientais';

-- ===================================================================
-- 2. VERIFICAR SESSÃO ATUAL
-- ===================================================================

SELECT 
  'SESSÃO ATUAL' as info,
  auth.uid() as sessao_ativa,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ SEM SESSÃO'
    ELSE '✅ SESSÃO ATIVA'
  END as status;

-- ===================================================================
-- 3. VERIFICAR USUÁRIO ESPECÍFICO
-- ===================================================================

SELECT 
  'USUÁRIO ESPECÍFICO' as info,
  u.email,
  u.auth_user_id,
  u.id as usuario_id,
  CASE 
    WHEN u.auth_user_id IS NULL THEN '❌ SEM AUTH_ID'
    ELSE '✅ COM AUTH_ID'
  END as status
FROM usuarios u
WHERE u.email = 'joao.silva@empresa.com';

-- ===================================================================
-- 4. REMOVER POLÍTICAS ANTIGAS
-- ===================================================================

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios termos" ON termos_ambientais;

-- ===================================================================
-- 5. CRIAR POLÍTICAS CORRIGIDAS
-- ===================================================================

-- Política para INSERT
CREATE POLICY "Usuários podem inserir seus próprios termos" ON termos_ambientais
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
);

-- Política para SELECT
CREATE POLICY "Usuários podem ver seus próprios termos" ON termos_ambientais
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
);

-- Política para UPDATE
CREATE POLICY "Usuários podem atualizar seus próprios termos" ON termos_ambientais
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
);

-- Política para DELETE
CREATE POLICY "Usuários podem deletar seus próprios termos" ON termos_ambientais
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
);

-- ===================================================================
-- 6. VERIFICAR SE RLS ESTÁ ATIVO
-- ===================================================================

SELECT 
  'RLS STATUS' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'termos_ambientais';

-- ===================================================================
-- 7. ATIVAR RLS SE NECESSÁRIO
-- ===================================================================

ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 8. TESTAR POLÍTICAS
-- ===================================================================

-- Simular inserção (não executar, apenas verificar sintaxe)
-- INSERT INTO termos_ambientais (
--   tipo_termo, 
--   numero_termo, 
--   data_termo, 
--   emitido_por_usuario_id,
--   destinatario,
--   local_atividade
-- ) VALUES (
--   'NOTIFICACAO',
--   '2025-NT-0001',
--   CURRENT_DATE,
--   auth.uid(),
--   'Teste',
--   'Local Teste'
-- );

-- ===================================================================
-- 9. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================

SELECT 
  'POLÍTICAS CRIADAS' as info,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY policyname; 