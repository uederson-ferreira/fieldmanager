-- ===================================================================
-- CRIAR USUÁRIO JOÃO SILVA E ATRIBUIR META (SE NECESSÁRIO)
-- ===================================================================

-- 1. Verificar se já existe um usuário TMA ativo
SELECT id, nome, email, perfil_tipo 
FROM usuarios 
WHERE perfil_tipo ILIKE '%tma%' 
   AND ativo = true 
LIMIT 5;

-- 2. Se não houver João Silva, criar um usuário de teste
INSERT INTO usuarios (
  id,
  nome,
  email,
  perfil_tipo,
  ativo,
  created_at,
  updated_at
)
VALUES (
  '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028'::uuid,
  'João Silva',
  'joao.silva@empresa.com',
  'TMA Campo',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  perfil_tipo = EXCLUDED.perfil_tipo,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- 3. Verificar se o usuário foi criado/atualizado
SELECT id, nome, email, perfil_tipo, ativo 
FROM usuarios 
WHERE id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028';

-- 4. Agora atribuir uma meta ao usuário
INSERT INTO metas_atribuicoes (
  id,
  meta_id,
  tma_id,
  meta_quantidade_individual,
  responsavel,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  m.id,
  '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028'::uuid,
  10,
  true,
  NOW(),
  NOW()
FROM metas m
WHERE m.ativa = true
ORDER BY m.created_at DESC
LIMIT 1
ON CONFLICT DO NOTHING;

-- 5. Verificar resultado final
SELECT 
  u.nome as usuario_nome,
  u.email as usuario_email,
  u.perfil_tipo,
  ma.meta_quantidade_individual,
  ma.responsavel,
  m.descricao as meta_descricao,
  m.tipo_meta
FROM usuarios u
JOIN metas_atribuicoes ma ON u.id = ma.tma_id
JOIN metas m ON ma.meta_id = m.id
WHERE u.id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028'; 