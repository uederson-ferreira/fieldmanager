-- ===================================================================
-- ADICIONAR auth_user_id À TABELA termos_ambientais
-- ===================================================================

-- 1. Adicionar coluna auth_user_id
ALTER TABLE termos_ambientais 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 2. Dropar constraint existente se houver
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 3. Popular auth_user_id para registros existentes onde emitido_por_usuario_id é usuarios.id
-- (Pulamos esta etapa por problemas de tipo - será feito pelo trigger)

-- 4. Popular auth_user_id para registros onde emitido_por_usuario_id já é auth_user_id
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id::uuid
WHERE auth_user_id IS NULL 
AND emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 5. Criar trigger para sincronizar auth_user_id automaticamente
CREATE OR REPLACE FUNCTION sync_auth_user_id_termos_ambientais()
RETURNS TRIGGER AS $$
BEGIN
  -- Se emitido_por_usuario_id é um UUID válido (auth_user_id), usar diretamente
  IF NEW.emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    NEW.auth_user_id := NEW.emitido_por_usuario_id::uuid;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Aplicar trigger na tabela
DROP TRIGGER IF EXISTS sync_auth_user_id_termos_trigger ON termos_ambientais;
CREATE TRIGGER sync_auth_user_id_termos_trigger
  BEFORE INSERT OR UPDATE ON termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_termos_ambientais();

-- 7. Verificar resultados
SELECT 
  'Verificação termos_ambientais' as tabela,
  COUNT(*) as total_registros,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id
FROM termos_ambientais;

-- 8. Mostrar alguns exemplos
SELECT 
  numero_termo,
  emitido_por_nome,
  emitido_por_usuario_id,
  auth_user_id,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ auth_user_id OK'
    ELSE '❌ auth_user_id FALTANDO'
  END as status
FROM termos_ambientais 
ORDER BY created_at DESC 
LIMIT 5; 