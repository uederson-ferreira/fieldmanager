-- Verificar e corrigir auth_user_id em termos_ambientais
-- ID do João Silva: 59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028

-- 1. Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'termos_ambientais' 
  AND column_name IN ('auth_user_id', 'emitido_por_usuario_id');

-- 2. Verificar dados existentes
SELECT 
  'Total de termos:' as status,
  count(*) as quantidade
FROM termos_ambientais;

SELECT 
  'Termos com auth_user_id:' as status,
  count(*) as quantidade
FROM termos_ambientais 
WHERE auth_user_id IS NOT NULL;

SELECT 
  'Termos com emitido_por_usuario_id:' as status,
  count(*) as quantidade
FROM termos_ambientais 
WHERE emitido_por_usuario_id IS NOT NULL;

-- 3. Mostrar alguns registros para verificar
SELECT 
  id,
  numero_termo,
  tipo_termo,
  emitido_por_usuario_id,
  auth_user_id,
  created_at
FROM termos_ambientais 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Atualizar auth_user_id onde estiver vazio
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id 
WHERE auth_user_id IS NULL 
  AND emitido_por_usuario_id IS NOT NULL;

-- 5. Verificar se ainda há termos sem auth_user_id
SELECT 
  'Termos sem auth_user_id após atualização:' as status,
  count(*) as quantidade
FROM termos_ambientais 
WHERE auth_user_id IS NULL;

-- 6. Se ainda houver termos sem auth_user_id, atribuir ao João Silva
UPDATE termos_ambientais 
SET auth_user_id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028'
WHERE auth_user_id IS NULL;

-- 7. Verificação final
SELECT 
  'Verificação final - Termos com auth_user_id:' as status,
  count(*) as quantidade
FROM termos_ambientais 
WHERE auth_user_id IS NOT NULL; 