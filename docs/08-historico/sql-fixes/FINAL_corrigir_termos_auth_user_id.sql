-- ===================================================================
-- 🎯 SCRIPT FINAL - EXECUTAR APENAS ESTE! 
-- ===================================================================

-- 1. Remover constraint problemática
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 2. Adicionar coluna auth_user_id
ALTER TABLE termos_ambientais 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 3. Verificar estado inicial
SELECT 'ANTES DA CORREÇÃO:' as status, COUNT(*) as total_termos, COUNT(auth_user_id) as com_auth_user_id FROM termos_ambientais;

-- 4. Popular auth_user_id onde emitido_por_usuario_id é UUID válido (converte text para uuid)
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id::uuid
WHERE auth_user_id IS NULL 
AND emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 5. Para termos restantes sem auth_user_id, usar primeiro usuário TMA ativo como fallback
UPDATE termos_ambientais 
SET auth_user_id = (
  SELECT auth_user_id 
  FROM usuarios 
  WHERE perfil = 'TMA' AND ativo = true 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE auth_user_id IS NULL;

-- 6. Verificar resultado
SELECT 'APÓS A CORREÇÃO:' as status, COUNT(*) as total_termos, COUNT(auth_user_id) as com_auth_user_id FROM termos_ambientais;

-- 7. Criar trigger simples para futuros registros
CREATE OR REPLACE FUNCTION set_auth_user_id_termos()
RETURNS TRIGGER AS $$
BEGIN
  -- Se auth_user_id não está definido e emitido_por_usuario_id parece ser UUID
  IF NEW.auth_user_id IS NULL AND NEW.emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    NEW.auth_user_id := NEW.emitido_por_usuario_id::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Aplicar trigger
DROP TRIGGER IF EXISTS set_auth_user_id_termos_trigger ON termos_ambientais;
CREATE TRIGGER set_auth_user_id_termos_trigger
  BEFORE INSERT OR UPDATE ON termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION set_auth_user_id_termos();

-- 9. Mostrar alguns exemplos dos termos corrigidos
SELECT 
  numero_termo,
  emitido_por_nome,
  emitido_por_usuario_id,
  auth_user_id,
  created_at
FROM termos_ambientais 
ORDER BY created_at DESC 
LIMIT 5;

-- 10. Verificação final
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '🎉 SUCESSO! Todos os termos têm auth_user_id'
    ELSE '⚠️ Ainda faltam ' || COUNT(*) || ' termos'
  END as resultado_final
FROM termos_ambientais 
WHERE auth_user_id IS NULL; 