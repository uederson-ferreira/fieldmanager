-- ===================================================================
-- EMERGÊNCIA: ADICIONAR auth_user_id AOS TERMOS DE FORMA SIMPLES
-- ===================================================================

-- 1. Adicionar coluna se não existir
ALTER TABLE termos_ambientais 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 2. Para todos os termos existentes, usar um usuário válido como fallback
-- Primeiro, verificar se temos usuários
SELECT 'Usuários disponíveis:' as info, id, auth_user_id, nome FROM usuarios WHERE ativo = true LIMIT 3;

-- 3. Popular auth_user_id onde emitido_por_usuario_id parece ser UUID
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id::uuid
WHERE auth_user_id IS NULL 
AND LENGTH(emitido_por_usuario_id) = 36
AND emitido_por_usuario_id LIKE '%-%-%-%-%';

-- 4. Para termos sem auth_user_id, usar o primeiro usuário TMA ativo
UPDATE termos_ambientais 
SET auth_user_id = (
  SELECT auth_user_id 
  FROM usuarios 
  WHERE perfil = 'TMA' AND ativo = true 
  LIMIT 1
)
WHERE auth_user_id IS NULL;

-- 5. Verificar resultado
SELECT 
  COUNT(*) as total_termos,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id
FROM termos_ambientais;

-- 6. Mostrar alguns exemplos
SELECT 
  numero_termo,
  emitido_por_nome,
  auth_user_id,
  created_at
FROM termos_ambientais 
ORDER BY created_at DESC 
LIMIT 5; 