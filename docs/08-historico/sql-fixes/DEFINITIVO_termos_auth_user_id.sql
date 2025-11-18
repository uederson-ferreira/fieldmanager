-- ===================================================================
-- 🎯 SCRIPT DEFINITIVO - COLUNA É UUID
-- ===================================================================

-- 1. Remover constraint problemática
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 2. Adicionar coluna auth_user_id
ALTER TABLE termos_ambientais 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 3. Verificar estado inicial
SELECT 'ANTES:' as status, COUNT(*) as total_termos, COUNT(auth_user_id) as com_auth_user_id FROM termos_ambientais;

-- 4. Popular auth_user_id diretamente (ambos são UUID)
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id
WHERE auth_user_id IS NULL 
AND emitido_por_usuario_id IS NOT NULL;

-- 5. Verificar resultado
SELECT 'DEPOIS:' as status, COUNT(*) as total_termos, COUNT(auth_user_id) as com_auth_user_id FROM termos_ambientais;

-- 6. Para termos ainda sem auth_user_id, usar primeiro usuário ativo
UPDATE termos_ambientais 
SET auth_user_id = (
  SELECT auth_user_id 
  FROM usuarios 
  WHERE ativo = true 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE auth_user_id IS NULL;

-- 7. Criar trigger para futuros registros
CREATE OR REPLACE FUNCTION sync_auth_user_id_termos()
RETURNS TRIGGER AS $$
BEGIN
  -- Se auth_user_id não está definido, copiar de emitido_por_usuario_id
  IF NEW.auth_user_id IS NULL AND NEW.emitido_por_usuario_id IS NOT NULL THEN
    NEW.auth_user_id := NEW.emitido_por_usuario_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Aplicar trigger
DROP TRIGGER IF EXISTS sync_auth_user_id_termos_trigger ON termos_ambientais;
CREATE TRIGGER sync_auth_user_id_termos_trigger
  BEFORE INSERT OR UPDATE ON termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_termos();

-- 9. Verificação final
SELECT 'RESULTADO FINAL:' as status, COUNT(*) as total_termos, COUNT(auth_user_id) as com_auth_user_id FROM termos_ambientais;

-- 10. Mostrar alguns exemplos
SELECT 
  numero_termo,
  emitido_por_nome,
  emitido_por_usuario_id,
  auth_user_id,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ OK'
    ELSE '❌ FALTANDO'
  END as status,
  created_at
FROM termos_ambientais 
ORDER BY created_at DESC 
LIMIT 5;

-- 11. Status final
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '🎉 PERFEITO! Todos os termos têm auth_user_id'
    ELSE '⚠️ Ainda faltam ' || COUNT(*) || ' termos com auth_user_id'
  END as resultado
FROM termos_ambientais 
WHERE auth_user_id IS NULL; 