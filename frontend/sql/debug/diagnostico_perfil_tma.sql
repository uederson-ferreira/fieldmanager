-- ===================================================================
-- DIAGNÓSTICO ESPECÍFICO - PROBLEMA PERFIL TMA
-- ===================================================================

-- 1. Verificar se a tabela perfis existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'perfis';

-- 2. Verificar estrutura da tabela perfis
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'perfis'
ORDER BY ordinal_position;

-- 3. Verificar todos os perfis existentes
SELECT 
  id,
  nome,
  descricao,
  created_at,
  updated_at
FROM perfis
ORDER BY nome;

-- 4. Verificar se existe perfil 'tma' (case sensitive)
SELECT 
  id,
  nome,
  descricao,
  created_at
FROM perfis 
WHERE nome = 'tma';

-- 5. Verificar se existe perfil 'TMA' (maiúsculo)
SELECT 
  id,
  nome,
  descricao,
  created_at
FROM perfis 
WHERE nome = 'TMA';

-- 6. Verificar se existe perfil com 'tma' no nome (case insensitive)
SELECT 
  id,
  nome,
  descricao,
  created_at
FROM perfis 
WHERE LOWER(nome) LIKE '%tma%';

-- 7. Verificar RLS na tabela perfis
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'perfis';

-- 8. Verificar se RLS está habilitado na tabela perfis
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'perfis';

-- 9. Testar inserção direta (se RLS permitir)
-- Descomente para testar:
/*
INSERT INTO perfis (id, nome, descricao, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'tma',
  'Técnico de Meio Ambiente',
  NOW(),
  NOW()
) RETURNING id, nome, descricao;
*/

-- 10. Verificar usuários e seus perfis
SELECT 
  u.id,
  u.nome,
  u.email,
  u.ativo,
  p.nome as perfil_nome,
  p.id as perfil_id
FROM usuarios u
LEFT JOIN perfis p ON u.perfil_id = p.id
ORDER BY u.nome;

-- 11. Verificar usuários sem perfil
SELECT 
  u.id,
  u.nome,
  u.email,
  u.ativo,
  u.perfil_id
FROM usuarios u
WHERE u.perfil_id IS NULL;

-- 12. Verificar usuários com perfil_id inválido
SELECT 
  u.id,
  u.nome,
  u.email,
  u.ativo,
  u.perfil_id
FROM usuarios u
LEFT JOIN perfis p ON u.perfil_id = p.id
WHERE u.perfil_id IS NOT NULL AND p.id IS NULL;

-- 13. Contar usuários por perfil
SELECT 
  COALESCE(p.nome, 'Sem perfil') as perfil,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN u.ativo = true THEN 1 END) as usuarios_ativos
FROM usuarios u
LEFT JOIN perfis p ON u.perfil_id = p.id
GROUP BY p.nome, p.id
ORDER BY perfil;

-- 14. Resumo do diagnóstico
SELECT 
  'DIAGNÓSTICO PERFIL TMA' as info,
  (SELECT COUNT(*) FROM perfis) as total_perfis,
  (SELECT COUNT(*) FROM perfis WHERE nome = 'tma') as perfil_tma_existe,
  (SELECT COUNT(*) FROM usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM usuarios WHERE ativo = true) as usuarios_ativos,
  (SELECT COUNT(*) FROM usuarios u JOIN perfis p ON u.perfil_id = p.id WHERE p.nome = 'tma') as usuarios_com_perfil_tma; 