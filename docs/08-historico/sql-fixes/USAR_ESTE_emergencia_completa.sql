-- ===================================================================
-- 🚨 SCRIPT DE EMERGÊNCIA DEFINITIVO - USE ESTE! 🚨
-- ===================================================================

-- 1. Remover constraint problemática se existir
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 2. Adicionar coluna auth_user_id se não existir
ALTER TABLE termos_ambientais 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 3. Verificar estado inicial
SELECT 'ANTES:' as status, COUNT(*) as total, COUNT(auth_user_id) as com_auth_id FROM termos_ambientais;

-- 4. Popular auth_user_id onde emitido_por_usuario_id é UUID válido
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id::uuid
WHERE auth_user_id IS NULL 
AND LENGTH(emitido_por_usuario_id) = 36
AND emitido_por_usuario_id LIKE '%-%-%-%-%';

-- 5. Se ainda há termos sem auth_user_id, usar primeiro usuário TMA ativo
UPDATE termos_ambientais 
SET auth_user_id = (
  SELECT auth_user_id 
  FROM usuarios 
  WHERE perfil = 'TMA' AND ativo = true 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE auth_user_id IS NULL;

-- 6. Verificar resultado final
SELECT 'DEPOIS:' as status, COUNT(*) as total, COUNT(auth_user_id) as com_auth_id FROM termos_ambientais;

-- 7. Criar trigger simples para novos registros
CREATE OR REPLACE FUNCTION auto_populate_auth_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.auth_user_id IS NULL AND NEW.emitido_por_usuario_id IS NOT NULL THEN
    -- Se parece UUID, usar diretamente
    IF LENGTH(NEW.emitido_por_usuario_id) = 36 AND NEW.emitido_por_usuario_id LIKE '%-%-%-%-%' THEN
      NEW.auth_user_id := NEW.emitido_por_usuario_id::uuid;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Aplicar trigger
DROP TRIGGER IF EXISTS auto_populate_auth_user_id_trigger ON termos_ambientais;
CREATE TRIGGER auto_populate_auth_user_id_trigger
  BEFORE INSERT OR UPDATE ON termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_auth_user_id();

-- 9. Mostrar alguns exemplos para verificar
SELECT 
  numero_termo,
  emitido_por_nome,
  LEFT(emitido_por_usuario_id, 8) || '...' as emitido_id,
  LEFT(auth_user_id::text, 8) || '...' as auth_id,
  created_at,
  '✅' as status
FROM termos_ambientais 
WHERE auth_user_id IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;

-- 10. Verificar se existem problemas
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '🎉 TODOS OS TERMOS TÊM auth_user_id!'
    ELSE '⚠️  Ainda há ' || COUNT(*) || ' termos sem auth_user_id'
  END as resultado
FROM termos_ambientais 
WHERE auth_user_id IS NULL; 