-- ===================================================================
-- ADICIONAR auth_user_id NAS TABELAS LVs E METAS
-- ===================================================================

-- 1. ADICIONAR auth_user_id NA TABELA LVs
-- ===================================================================

-- Verificar se a coluna já existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lvs' 
      AND column_name = 'auth_user_id'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE lvs ADD COLUMN auth_user_id UUID;
    COMMENT ON COLUMN lvs.auth_user_id IS 'ID do usuário no Supabase Auth - facilita consultas diretas do frontend';
    RAISE NOTICE '✅ Coluna auth_user_id adicionada na tabela lvs!';
  ELSE
    RAISE NOTICE '⚠️ Coluna auth_user_id já existe na tabela lvs!';
  END IF;
END $$;

-- Preencher auth_user_id com base no usuario_id
UPDATE lvs 
SET auth_user_id = (
  SELECT u.auth_user_id 
  FROM usuarios u 
  WHERE u.id = lvs.usuario_id
)
WHERE auth_user_id IS NULL;

-- Verificar preenchimento
SELECT 
  'LVs - Verificação após preenchimento' as info,
  COUNT(*) as total_lvs,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id
FROM lvs;

-- 2. ADICIONAR auth_user_id NA TABELA METAS
-- ===================================================================

-- Verificar se a coluna já existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'metas' 
      AND column_name = 'auth_user_id'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE metas ADD COLUMN auth_user_id UUID;
    COMMENT ON COLUMN metas.auth_user_id IS 'ID do usuário no Supabase Auth - facilita consultas diretas do frontend';
    RAISE NOTICE '✅ Coluna auth_user_id adicionada na tabela metas!';
  ELSE
    RAISE NOTICE '⚠️ Coluna auth_user_id já existe na tabela metas!';
  END IF;
END $$;

-- Preencher auth_user_id com base no criada_por
UPDATE metas 
SET auth_user_id = (
  SELECT u.auth_user_id 
  FROM usuarios u 
  WHERE u.id = metas.criada_por
)
WHERE auth_user_id IS NULL;

-- Verificar preenchimento
SELECT 
  'Metas - Verificação após preenchimento' as info,
  COUNT(*) as total_metas,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id
FROM metas;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ===================================================================

-- Índice para LVs
CREATE INDEX IF NOT EXISTS idx_lvs_auth_user_id 
ON lvs(auth_user_id);

-- Índice para Metas
CREATE INDEX IF NOT EXISTS idx_metas_auth_user_id 
ON metas(auth_user_id);

-- 4. CRIAR TRIGGERS PARA SINCRONIZAÇÃO AUTOMÁTICA
-- ===================================================================

-- Trigger para LVs
CREATE OR REPLACE FUNCTION sync_auth_user_id_lvs()
RETURNS TRIGGER AS $$
BEGIN
  -- Em INSERT ou UPDATE do usuario_id, buscar o auth_user_id correspondente
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.usuario_id IS DISTINCT FROM NEW.usuario_id) THEN
    SELECT auth_user_id INTO NEW.auth_user_id
    FROM usuarios 
    WHERE id = NEW.usuario_id;
    
    IF NEW.auth_user_id IS NULL THEN
      RAISE WARNING 'auth_user_id não encontrado para usuario_id: %', NEW.usuario_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para LVs
DROP TRIGGER IF EXISTS trigger_sync_auth_user_id_lvs ON lvs;
CREATE TRIGGER trigger_sync_auth_user_id_lvs
  BEFORE INSERT OR UPDATE ON lvs
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_lvs();

-- Trigger para Metas
CREATE OR REPLACE FUNCTION sync_auth_user_id_metas()
RETURNS TRIGGER AS $$
BEGIN
  -- Em INSERT ou UPDATE do criada_por, buscar o auth_user_id correspondente
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.criada_por IS DISTINCT FROM NEW.criada_por) THEN
    SELECT auth_user_id INTO NEW.auth_user_id
    FROM usuarios 
    WHERE id = NEW.criada_por;
    
    IF NEW.auth_user_id IS NULL THEN
      RAISE WARNING 'auth_user_id não encontrado para criada_por: %', NEW.criada_por;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para Metas
DROP TRIGGER IF EXISTS trigger_sync_auth_user_id_metas ON metas;
CREATE TRIGGER trigger_sync_auth_user_id_metas
  BEFORE INSERT OR UPDATE ON metas
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_metas();

-- 5. VERIFICAÇÃO FINAL
-- ===================================================================

SELECT 'RESUMO FINAL' as info;
SELECT 
  'LVs' as tabela,
  COUNT(*) as total,
  COUNT(auth_user_id) as com_auth_user_id,
  ROUND((COUNT(auth_user_id)::numeric / COUNT(*)) * 100, 2) as percentual
FROM lvs
UNION ALL
SELECT 
  'Metas' as tabela,
  COUNT(*) as total,
  COUNT(auth_user_id) as com_auth_user_id,
  ROUND((COUNT(auth_user_id)::numeric / COUNT(*)) * 100, 2) as percentual
FROM metas;

-- Mostrar alguns exemplos
SELECT 
  'Exemplos LVs' as info,
  id,
  LEFT(usuario_id::text, 8) || '...' as usuario_id,
  LEFT(auth_user_id::text, 8) || '...' as auth_user_id,
  tipo_lv,
  created_at
FROM lvs 
WHERE auth_user_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

SELECT 
  'Exemplos Metas' as info,
  id,
  LEFT(criada_por::text, 8) || '...' as criada_por,
  LEFT(auth_user_id::text, 8) || '...' as auth_user_id,
  tipo_meta,
  descricao,
  created_at
FROM metas 
WHERE auth_user_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5; 