-- ===================================================================
-- CORRIGIR PROBLEMAS FINAIS - SISTEMA DE METAS
-- ===================================================================

-- 1. Verificar e criar perfil TMA se necessário
INSERT INTO perfis (id, nome, descricao, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'tma',
  'Técnico de Meio Ambiente',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM perfis WHERE nome = 'tma'
);

-- 2. Verificar se o perfil foi criado
SELECT 
  id,
  nome,
  descricao,
  created_at
FROM perfis 
WHERE nome = 'tma';

-- 3. Verificar TMAs ativos
SELECT 
  COUNT(*) as total_tmas,
  COUNT(CASE WHEN ativo = true THEN 1 END) as tmas_ativos
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE p.nome = 'tma';

-- 4. Listar TMAs ativos
SELECT 
  u.id,
  u.nome,
  u.email,
  u.ativo,
  p.nome as perfil
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE p.nome = 'tma' AND u.ativo = true
ORDER BY u.nome;

-- 5. Verificar se as tabelas de metas existem
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('metas', 'metas_atribuicoes', 'progresso_metas', 'configuracoes_metas')
ORDER BY table_name, ordinal_position;

-- 6. Verificar RLS nas tabelas de metas
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
WHERE tablename IN ('metas', 'metas_atribuicoes', 'progresso_metas', 'configuracoes_metas')
ORDER BY tablename, policyname;

-- 7. Verificar se há dados nas tabelas
SELECT 
  'metas' as tabela,
  COUNT(*) as total_registros
FROM metas
UNION ALL
SELECT 
  'metas_atribuicoes' as tabela,
  COUNT(*) as total_registros
FROM metas_atribuicoes
UNION ALL
SELECT 
  'progresso_metas' as tabela,
  COUNT(*) as total_registros
FROM progresso_metas
UNION ALL
SELECT 
  'configuracoes_metas' as tabela,
  COUNT(*) as total_registros
FROM configuracoes_metas;

-- 8. Testar inserção de meta (se houver usuário logado)
-- Descomente as linhas abaixo para testar (substitua o ID do usuário)
/*
INSERT INTO metas (
  id,
  tipo_meta,
  categoria,
  periodo,
  ano,
  mes,
  semana,
  dia,
  quantidade_meta,
  quantidade_atual,
  percentual_atual,
  percentual_alcancado,
  status,
  escopo,
  criada_por,
  ativa,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'quantitativa',
  'Resíduos',
  'mensal',
  2024,
  12,
  NULL,
  NULL,
  100,
  0,
  0,
  0,
  'em_andamento',
  'individual',
  'SEU_USER_ID_AQUI', -- Substitua pelo ID do usuário logado
  true,
  NOW(),
  NOW()
) RETURNING id, tipo_meta, status;
*/

-- 9. Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('metas', 'metas_atribuicoes', 'progresso_metas')
ORDER BY event_object_table, trigger_name;

-- 10. Resumo final
SELECT 
  'RESUMO FINAL' as info,
  (SELECT COUNT(*) FROM perfis WHERE nome = 'tma') as perfil_tma_existe,
  (SELECT COUNT(*) FROM usuarios u JOIN perfis p ON u.perfil_id = p.id WHERE p.nome = 'tma' AND u.ativo = true) as tmas_ativos,
  (SELECT COUNT(*) FROM metas) as total_metas,
  (SELECT COUNT(*) FROM metas_atribuicoes) as total_atribuicoes,
  (SELECT COUNT(*) FROM progresso_metas) as total_progressos; 