-- ===================================================================
-- FIX RLS METAS_ATRIBUIÇÕES - SOLUÇÃO DEFINITIVA
-- ===================================================================

-- Execute este script no SQL Editor do Supabase para resolver o erro 403

-- 1. Limpar políticas existentes
DROP POLICY IF EXISTS "Admin pode gerenciar atribuições" ON metas_atribuicoes;
DROP POLICY IF EXISTS "TMA pode ver suas atribuições" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política funcional para metas_atribuicoes" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política temporária para admin" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política simples por email" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política permissiva para desenvolvimento" ON metas_atribuicoes;

-- 2. Criar política única e funcional
CREATE POLICY "Acesso completo para usuários autenticados" ON metas_atribuicoes
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Verificar resultado
SELECT 'POLÍTICA APLICADA' as status, policyname, cmd FROM pg_policies WHERE tablename = 'metas_atribuicoes'; 