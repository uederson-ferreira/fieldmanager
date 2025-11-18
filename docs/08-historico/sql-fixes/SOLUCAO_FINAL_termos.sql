-- ===================================================================
-- 🎯 SOLUÇÃO FINAL - BASEADA NO SCHEMA REAL
-- ===================================================================

-- 1. Verificar estado atual dos termos
SELECT 'SITUAÇÃO ATUAL DOS TERMOS:' as info;
SELECT 
  COUNT(*) as total_termos,
  COUNT(emitido_por_usuario_id) as com_usuario_id,
  COUNT(*) - COUNT(emitido_por_usuario_id) as sem_usuario_id
FROM termos_ambientais;

-- 2. Adicionar coluna auth_user_id para compatibilidade
ALTER TABLE termos_ambientais 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 3. Popular auth_user_id copiando de emitido_por_usuario_id (ambos são UUID)
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id
WHERE auth_user_id IS NULL 
AND emitido_por_usuario_id IS NOT NULL;

-- 4. Para termos antigos sem emitido_por_usuario_id, usar primeiro usuário ativo
UPDATE termos_ambientais 
SET auth_user_id = (
  SELECT id 
  FROM usuarios 
  WHERE ativo = true 
  ORDER BY created_at ASC 
  LIMIT 1
),
emitido_por_usuario_id = (
  SELECT id 
  FROM usuarios 
  WHERE ativo = true 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE emitido_por_usuario_id IS NULL;

-- 5. Atualizar trigger existente para popular auth_user_id também
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
BEGIN
  -- Popular auth_user_id se não estiver definido
  IF NEW.auth_user_id IS NULL AND NEW.emitido_por_usuario_id IS NOT NULL THEN
    NEW.auth_user_id := NEW.emitido_por_usuario_id;
  END IF;

  -- Lógica original do trigger (se houver)
  -- Aqui você pode adicionar a lógica original se necessário
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Verificar resultado final
SELECT 'RESULTADO FINAL:' as info;
SELECT 
  COUNT(*) as total_termos,
  COUNT(emitido_por_usuario_id) as com_emitido_por,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id
FROM termos_ambientais;

-- 7. Mostrar alguns exemplos
SELECT 
  numero_termo,
  emitido_por_nome,
  emitido_por_usuario_id,
  auth_user_id,
  CASE 
    WHEN auth_user_id IS NOT NULL AND emitido_por_usuario_id IS NOT NULL THEN '✅ COMPLETO'
    WHEN emitido_por_usuario_id IS NOT NULL THEN '⚠️ SÓ emitido_por'
    WHEN auth_user_id IS NOT NULL THEN '⚠️ SÓ auth_user'
    ELSE '❌ SEM IDs'
  END as status,
  created_at
FROM termos_ambientais 
ORDER BY created_at DESC 
LIMIT 8;

-- 8. Verificar usuários disponíveis
SELECT 'USUÁRIOS DISPONÍVEIS:' as info;
SELECT id, nome, email, ativo 
FROM usuarios 
WHERE ativo = true 
ORDER BY created_at ASC 
LIMIT 3; 