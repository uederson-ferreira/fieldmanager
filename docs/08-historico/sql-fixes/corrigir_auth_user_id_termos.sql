-- Corrigir auth_user_id dos termos para o João Silva
-- ID correto: 59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028

BEGIN;

-- Primeiro, verificar quantos termos existem com o ID antigo
SELECT 
  'ANTES - Termos com ID antigo:' as status,
  count(*) as quantidade
FROM termos_ambientais 
WHERE auth_user_id = '2d7f480e-e42d-4b80-be70-97a4123fca09';

-- Atualizar os termos para o auth_user_id correto
UPDATE termos_ambientais 
SET auth_user_id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028'
WHERE auth_user_id = '2d7f480e-e42d-4b80-be70-97a4123fca09';

-- Verificar após a correção
SELECT 
  'DEPOIS - Termos com ID correto:' as status,
  count(*) as quantidade
FROM termos_ambientais 
WHERE auth_user_id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028';

-- Mostrar alguns termos corrigidos
SELECT 
  id,
  auth_user_id,
  emitido_por_usuario_id,
  tipo_termo,
  created_at
FROM termos_ambientais 
WHERE auth_user_id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028'
ORDER BY created_at DESC
LIMIT 3;

COMMIT; 