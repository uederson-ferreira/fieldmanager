-- ===================================================================
-- CORRIGIR FK E POPULAÇÃO DE auth_user_id EM TERMOS
-- ===================================================================

-- 1. Verificar estado atual
SELECT 
  'Estado antes das correções' as status,
  COUNT(*) as total_termos,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(CASE WHEN emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as emitido_eh_uuid
FROM termos_ambientais;

-- 2. Dropar FK constraint se existir (pode estar incorreto)
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 3. Adicionar auth_user_id se não existir
ALTER TABLE termos_ambientais 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- 4. Popular auth_user_id onde emitido_por_usuario_id é UUID (auth_user_id)
UPDATE termos_ambientais 
SET auth_user_id = emitido_por_usuario_id::uuid
WHERE auth_user_id IS NULL 
AND emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 5. Popular auth_user_id onde emitido_por_usuario_id é usuarios.id
UPDATE termos_ambientais 
SET auth_user_id = u.auth_user_id
FROM usuarios u
WHERE termos_ambientais.emitido_por_usuario_id::uuid = u.id
AND termos_ambientais.auth_user_id IS NULL
AND termos_ambientais.emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 6. Verificar se temos dados de João Silva no banco
SELECT 
  'Dados do João Silva' as tipo,
  u.id as usuarios_id,
  u.auth_user_id,
  u.nome,
  u.email
FROM usuarios u 
WHERE u.nome ILIKE '%joão%silva%' OR u.email LIKE '%joao%'
LIMIT 3;

-- 7. Mostrar termos com problemas de ID
SELECT 
  'Termos com problemas' as tipo,
  numero_termo,
  emitido_por_nome,
  emitido_por_usuario_id,
  auth_user_id,
  created_at
FROM termos_ambientais 
WHERE auth_user_id IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 8. Recriar FK constraint correta (referenciar usuarios.id como text)
-- Primeiro converter usuarios.id para text para compatibilidade
-- ALTER TABLE termos_ambientais 
-- ADD CONSTRAINT termos_ambientais_emitido_por_usuario_id_fkey 
-- FOREIGN KEY (emitido_por_usuario_id) 
-- REFERENCES usuarios(id) 
-- ON DELETE SET NULL;
-- (Comentado pois emitido_por_usuario_id pode ser tanto usuarios.id quanto auth_user_id)

-- 9. Criar trigger para popular auth_user_id automaticamente
CREATE OR REPLACE FUNCTION sync_auth_user_id_termos()
RETURNS TRIGGER AS $$
BEGIN
  -- Se emitido_por_usuario_id é um UUID válido (auth_user_id), usar diretamente
  IF NEW.emitido_por_usuario_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    NEW.auth_user_id := NEW.emitido_por_usuario_id::uuid;
  ELSE
    -- Se emitido_por_usuario_id é usuarios.id, buscar o auth_user_id correspondente
    SELECT auth_user_id INTO NEW.auth_user_id 
    FROM usuarios 
    WHERE id = NEW.emitido_por_usuario_id::uuid;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Aplicar trigger
DROP TRIGGER IF EXISTS sync_auth_user_id_termos_trigger ON termos_ambientais;
CREATE TRIGGER sync_auth_user_id_termos_trigger
  BEFORE INSERT OR UPDATE ON termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_termos();

-- 11. Verificar resultado final
SELECT 
  'Estado após correções' as status,
  COUNT(*) as total_termos,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id,
  COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as percentual_ok
FROM termos_ambientais;

-- 12. Mostrar alguns exemplos de termos
SELECT 
  numero_termo,
  emitido_por_nome,
  emitido_por_usuario_id,
  auth_user_id,
  created_at,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ PRONTO'
    ELSE '❌ PROBLEMA'
  END as status
FROM termos_ambientais 
ORDER BY created_at DESC 
LIMIT 10; 