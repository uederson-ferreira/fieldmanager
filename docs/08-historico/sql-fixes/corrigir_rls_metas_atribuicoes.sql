-- ===================================================================
-- CORREÇÃO ESPECÍFICA DO RLS PARA TABELA METAS_ATRIBUIÇÕES
-- ===================================================================

-- 1. Verificar o problema atual
SELECT 
  'DIAGNÓSTICO' as tipo,
  auth.uid() as auth_uid,
  auth.email() as auth_email,
  auth.role() as auth_role;

-- 2. Verificar se o usuário atual tem perfil admin
SELECT 
  'VERIFICAÇÃO_PERFIL' as tipo,
  u.id as user_id,
  u.email,
  u.nome,
  p.nome as perfil,
  CASE 
    WHEN p.nome IN ('admin', 'developer', 'ADM') THEN 'TEM_PERFIL_ADMIN'
    ELSE 'SEM_PERFIL_ADMIN'
  END as status_perfil
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE u.id = auth.uid();

-- 3. Verificar políticas atuais da tabela metas_atribuicoes
SELECT 
  'POLÍTICAS_ATUAIS' as tipo,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'metas_atribuicoes'
ORDER BY policyname;

-- 4. Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Admin pode gerenciar atribuições" ON metas_atribuicoes;
DROP POLICY IF EXISTS "TMA pode ver suas atribuições" ON metas_atribuicoes;

-- 5. Criar política mais permissiva para teste (temporária)
CREATE POLICY "Política temporária para admin" ON metas_atribuicoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- 6. Verificar se a política foi criada
SELECT 
  'POLÍTICA_CRIADA' as tipo,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'metas_atribuicoes'
ORDER BY policyname;

-- 7. Teste de inserção na tabela metas_atribuicoes
-- Primeiro, vamos verificar se existe uma meta para testar
SELECT 
  'META_PARA_TESTE' as tipo,
  id,
  tipo_meta,
  descricao
FROM metas 
WHERE ativa = true 
LIMIT 1;

-- 8. Teste de inserção (descomente se houver uma meta disponível)
/*
INSERT INTO metas_atribuicoes (
  meta_id,
  tma_id,
  responsavel
) VALUES (
  (SELECT id FROM metas WHERE ativa = true LIMIT 1),
  auth.uid(),
  true
);
*/

-- 9. Verificar se a inserção funcionou
SELECT 
  'VERIFICAÇÃO_INSERÇÃO' as tipo,
  COUNT(*) as total_atribuicoes
FROM metas_atribuicoes;

-- 10. Limpar dados de teste se necessário
-- DELETE FROM metas_atribuicoes WHERE meta_id = (SELECT id FROM metas WHERE ativa = true LIMIT 1) AND tma_id = auth.uid();

-- ===================================================================
-- POLÍTICA ALTERNATIVA MAIS SIMPLES (se a anterior não funcionar)
-- ===================================================================

-- Descomente se a política anterior não funcionar:
/*
DROP POLICY IF EXISTS "Política temporária para admin" ON metas_atribuicoes;

CREATE POLICY "Política simples por email" ON metas_atribuicoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.email = auth.email()
      AND u.email IN ('admin@sistema.com', 'developer@sistema.com')
    )
  );
*/

-- ===================================================================
-- POLÍTICA MAIS PERMISSIVA PARA DESENVOLVIMENTO (último recurso)
-- ===================================================================

-- Descomente apenas em ambiente de desenvolvimento:
/*
DROP POLICY IF EXISTS "Política temporária para admin" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política simples por email" ON metas_atribuicoes;

CREATE POLICY "Política permissiva para desenvolvimento" ON metas_atribuicoes
  FOR ALL USING (true);
*/

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

SELECT 
  'VERIFICAÇÃO_FINAL' as tipo,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'metas_atribuicoes'
ORDER BY policyname; 