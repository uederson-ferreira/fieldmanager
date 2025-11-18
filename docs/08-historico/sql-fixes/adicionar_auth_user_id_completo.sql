-- ===================================================================
-- ADICIONAR auth_user_id EM TODAS AS TABELAS NECESSÁRIAS
-- ===================================================================

-- 1. ADICIONAR auth_user_id NA TABELA LVs
-- ===================================================================

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

-- 2. ADICIONAR auth_user_id NA TABELA METAS
-- ===================================================================

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

-- 3. ADICIONAR auth_user_id NA TABELA LV_RESIDUOS
-- ===================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lv_residuos' 
      AND column_name = 'auth_user_id'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE lv_residuos ADD COLUMN auth_user_id UUID;
    COMMENT ON COLUMN lv_residuos.auth_user_id IS 'ID do usuário no Supabase Auth - facilita consultas diretas do frontend';
    RAISE NOTICE '✅ Coluna auth_user_id adicionada na tabela lv_residuos!';
  ELSE
    RAISE NOTICE '⚠️ Coluna auth_user_id já existe na tabela lv_residuos!';
  END IF;
END $$;

-- Preencher auth_user_id com base no usuario_id
UPDATE lv_residuos 
SET auth_user_id = (
  SELECT u.auth_user_id 
  FROM usuarios u 
  WHERE u.id = lv_residuos.usuario_id
)
WHERE auth_user_id IS NULL;

-- 4. ADICIONAR auth_user_id NA TABELA INSPECOES_LV
-- ===================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inspecoes_lv' 
      AND column_name = 'auth_user_id'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE inspecoes_lv ADD COLUMN auth_user_id UUID;
    COMMENT ON COLUMN inspecoes_lv.auth_user_id IS 'ID do usuário no Supabase Auth - facilita consultas diretas do frontend';
    RAISE NOTICE '✅ Coluna auth_user_id adicionada na tabela inspecoes_lv!';
  ELSE
    RAISE NOTICE '⚠️ Coluna auth_user_id já existe na tabela inspecoes_lv!';
  END IF;
END $$;

-- Preencher auth_user_id com base no usuario_id
UPDATE inspecoes_lv 
SET auth_user_id = (
  SELECT u.auth_user_id 
  FROM usuarios u 
  WHERE u.id = inspecoes_lv.usuario_id
)
WHERE auth_user_id IS NULL;

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- ===================================================================

-- Índices para LVs
CREATE INDEX IF NOT EXISTS idx_lvs_auth_user_id 
ON lvs(auth_user_id);

-- Índices para Metas
CREATE INDEX IF NOT EXISTS idx_metas_auth_user_id 
ON metas(auth_user_id);

-- Índices para LV Resíduos
CREATE INDEX IF NOT EXISTS idx_lv_residuos_auth_user_id 
ON lv_residuos(auth_user_id);

-- Índices para Inspeções LV
CREATE INDEX IF NOT EXISTS idx_inspecoes_lv_auth_user_id 
ON inspecoes_lv(auth_user_id);

-- 6. CRIAR TRIGGERS PARA SINCRONIZAÇÃO AUTOMÁTICA
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

-- Trigger para LV Resíduos
CREATE OR REPLACE FUNCTION sync_auth_user_id_lv_residuos()
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

-- Aplicar trigger para LV Resíduos
DROP TRIGGER IF EXISTS trigger_sync_auth_user_id_lv_residuos ON lv_residuos;
CREATE TRIGGER trigger_sync_auth_user_id_lv_residuos
  BEFORE INSERT OR UPDATE ON lv_residuos
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_lv_residuos();

-- Trigger para Inspeções LV
CREATE OR REPLACE FUNCTION sync_auth_user_id_inspecoes_lv()
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

-- Aplicar trigger para Inspeções LV
DROP TRIGGER IF EXISTS trigger_sync_auth_user_id_inspecoes_lv ON inspecoes_lv;
CREATE TRIGGER trigger_sync_auth_user_id_inspecoes_lv
  BEFORE INSERT OR UPDATE ON inspecoes_lv
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_inspecoes_lv();

-- 7. VERIFICAÇÃO FINAL
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
FROM metas
UNION ALL
SELECT 
  'LV Resíduos' as tabela,
  COUNT(*) as total,
  COUNT(auth_user_id) as com_auth_user_id,
  ROUND((COUNT(auth_user_id)::numeric / COUNT(*)) * 100, 2) as percentual
FROM lv_residuos
UNION ALL
SELECT 
  'Inspeções LV' as tabela,
  COUNT(*) as total,
  COUNT(auth_user_id) as com_auth_user_id,
  ROUND((COUNT(auth_user_id)::numeric / COUNT(*)) * 100, 2) as percentual
FROM inspecoes_lv;

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
LIMIT 3;

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
LIMIT 3; 