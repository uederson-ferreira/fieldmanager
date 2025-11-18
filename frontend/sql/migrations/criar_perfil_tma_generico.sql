-- ===================================================================
-- CRIAR PERFIL TMA GENÉRICO
-- ===================================================================

-- Verificar perfis TMA existentes
SELECT 
  id,
  nome,
  descricao,
  permissoes,
  ativo
FROM perfis 
WHERE LOWER(nome) LIKE '%tma%'
ORDER BY nome;

-- Criar perfil genérico 'tma' baseado nos existentes
INSERT INTO perfis (id, nome, descricao, permissoes, ativo, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'tma',
  'Técnico de Meio Ambiente (Genérico)',
  '{"lv":true,"gps":true,"fotos":true,"inspecoes":true,"relatorios":true}',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM perfis WHERE nome = 'tma'
);

-- Verificar se foi criado
SELECT 
  id,
  nome,
  descricao,
  permissoes,
  ativo,
  created_at
FROM perfis 
WHERE nome = 'tma';

-- Verificar todos os perfis TMA após a criação
SELECT 
  id,
  nome,
  descricao,
  ativo
FROM perfis 
WHERE LOWER(nome) LIKE '%tma%'
ORDER BY nome;

-- Contar usuários por perfil TMA
SELECT 
  p.nome as perfil,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN u.ativo = true THEN 1 END) as usuarios_ativos
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE LOWER(p.nome) LIKE '%tma%'
GROUP BY p.nome, p.id
ORDER BY p.nome; 