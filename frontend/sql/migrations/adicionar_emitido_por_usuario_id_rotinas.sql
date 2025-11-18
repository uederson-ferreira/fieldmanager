-- Adicionar coluna emitido_por_usuario_id na tabela atividades_rotina
-- ID do João Silva: 59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028

-- 1. Adicionar a coluna emitido_por_usuario_id
ALTER TABLE atividades_rotina 
ADD COLUMN IF NOT EXISTS emitido_por_usuario_id uuid;

-- 2. Atualizar registros existentes copiando de tma_responsavel_id
UPDATE atividades_rotina 
SET emitido_por_usuario_id = tma_responsavel_id 
WHERE emitido_por_usuario_id IS NULL;

-- 3. Se auth_user_id ainda não existe, adicionar também
ALTER TABLE atividades_rotina 
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- 4. Atualizar auth_user_id também
UPDATE atividades_rotina 
SET auth_user_id = tma_responsavel_id 
WHERE auth_user_id IS NULL;

-- 5. Verificar as atualizações
SELECT 
  'Registros com emitido_por_usuario_id:' as status,
  count(*) as quantidade
FROM atividades_rotina 
WHERE emitido_por_usuario_id IS NOT NULL;

SELECT 
  'Registros com auth_user_id:' as status,
  count(*) as quantidade
FROM atividades_rotina 
WHERE auth_user_id IS NOT NULL;

-- 6. Mostrar alguns registros para verificar estrutura
SELECT 
  id,
  tma_responsavel_id,
  auth_user_id,
  emitido_por_usuario_id,
  atividade,
  status,
  created_at
FROM atividades_rotina 
ORDER BY created_at DESC
LIMIT 3;

-- 7. Reabilitar os triggers se foram desabilitados
ALTER TABLE atividades_rotina ENABLE TRIGGER ALL;

-- 8. Testar insert simples (descomente para testar)
/*
INSERT INTO atividades_rotina (
  data_atividade,
  atividade,
  tma_responsavel_id,
  auth_user_id,
  emitido_por_usuario_id,
  status
) VALUES (
  CURRENT_DATE,
  'Teste de Insert',
  '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028',
  '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028',
  '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028',
  'Planejada'
);
*/ 