-- ===================================================================
-- SOLUÇÃO IMEDIATA PARA ERRO RLS - METAS_ATRIBUIÇÕES
-- ===================================================================

-- ⚠️ ATENÇÃO: Este script resolve o problema imediatamente
-- Execute no SQL Editor do Supabase

-- 1. Remover todas as políticas existentes da tabela metas_atribuicoes
DROP POLICY IF EXISTS "Admin pode gerenciar atribuições" ON metas_atribuicoes;
DROP POLICY IF EXISTS "TMA pode ver suas atribuições" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política temporária para admin" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política simples por email" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política permissiva para desenvolvimento" ON metas_atribuicoes;

-- 2. Criar política simples e funcional
CREATE POLICY "Política funcional para metas_atribuicoes" ON metas_atribuicoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM', 'tma')
    )
  );

-- 3. Verificar se a política foi criada
SELECT 
  'POLÍTICA_CRIADA' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'metas_atribuicoes';

-- 4. Teste rápido de funcionamento
-- Verificar se o usuário atual pode acessar a tabela
SELECT 
  'TESTE_ACESSO' as status,
  COUNT(*) as total_registros
FROM metas_atribuicoes;

-- 5. Se ainda houver problemas, usar política mais permissiva
-- Descomente apenas se o teste acima falhar:
/*
DROP POLICY IF EXISTS "Política funcional para metas_atribuicoes" ON metas_atribuicoes;

CREATE POLICY "Política permissiva para desenvolvimento" ON metas_atribuicoes
  FOR ALL USING (true);
*/

-- 6. Verificação final
SELECT 
  'VERIFICAÇÃO_FINAL' as status,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'metas_atribuicoes'; 