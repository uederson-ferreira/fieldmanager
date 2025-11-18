-- ===================================================================
-- LIMPAR E RECRIAR RLS TERMOS AMBIENTAIS - ECOFIELD
-- Localização: sql/limpar_recriar_rls_termos.sql
-- ===================================================================

-- Este script remove TODAS as políticas RLS e recria apenas as corretas

-- ===================================================================
-- 1. VERIFICAR POLÍTICAS ATUAIS
-- ===================================================================

SELECT 
  'POLÍTICAS ATUAIS' as info,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'termos_ambientais';

-- ===================================================================
-- 2. REMOVER TODAS AS POLÍTICAS
-- ===================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios termos" ON termos_ambientais;

-- Remover políticas com nomes diferentes
DROP POLICY IF EXISTS "termos_insert_user" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_select_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_update_user" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_update_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_delete_user_admin" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_delete_admin_only" ON termos_ambientais;

-- Remover qualquer outra política que possa existir
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'termos_ambientais'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON termos_ambientais';
    END LOOP;
END $$;

-- ===================================================================
-- 3. VERIFICAR SE TODAS FORAM REMOVIDAS
-- ===================================================================

SELECT 
  'POLÍTICAS APÓS LIMPEZA' as info,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'termos_ambientais';

-- ===================================================================
-- 4. CRIAR APENAS AS POLÍTICAS CORRETAS
-- ===================================================================

-- Política para INSERT
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
);

-- Política para SELECT
CREATE POLICY "termos_select_user_admin" ON termos_ambientais
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
);

-- Política para UPDATE
CREATE POLICY "termos_update_user" ON termos_ambientais
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
CREATE POLICY "termos_delete_user_admin" ON termos_ambientais
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND
  emitido_por_usuario_id = auth.uid()
);

-- ===================================================================
-- 5. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================

SELECT 
  'POLÍTICAS FINAIS' as info,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY policyname;

-- ===================================================================
-- 6. VERIFICAR SESSÃO ATUAL
-- ===================================================================

SELECT 
  'SESSÃO ATUAL' as info,
  auth.uid() as sessao_ativa,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ SEM SESSÃO'
    ELSE '✅ SESSÃO ATIVA'
  END as status;

-- ===================================================================
-- 7. TESTAR INSERÇÃO
-- ===================================================================

-- Tentar inserir um termo de teste
INSERT INTO termos_ambientais (
  tipo_termo,
  numero_termo,
  data_termo,
  hora_termo,
  emitido_por_usuario_id,
  emitido_por_nome,
  destinatario_nome,
  local_atividade,
  area_equipamento_atividade,
  natureza_desvio,
  projeto_ba,
  fase_etapa_obra,
  atividade_especifica,
  observacoes,
  status,
  created_at,
  updated_at
) VALUES (
  'NOTIFICACAO',
  '2025-NT-TESTE-002',
  CURRENT_DATE,
  CURRENT_TIME,
  auth.uid(),
  'João Silva',
  'Teste de Inserção',
  'Local de Teste',
  'Área de Teste',
  'OCORRENCIA_REAL',
  'Projeto Teste',
  'Fase Teste',
  'Atividade de teste para verificar RLS',
  'Teste de inserção via SQL',
  'PENDENTE',
  NOW(),
  NOW()
) RETURNING id, numero_termo, created_at; 