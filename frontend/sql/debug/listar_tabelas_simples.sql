-- =====================================================
-- LISTAR TABELAS E SCHEMAS - VERSÃO SIMPLES
-- Data: 04/01/2025
-- =====================================================

-- 1. Lista de tabelas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Colunas de cada tabela
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Contagem de registros
DO $$
DECLARE
  r RECORD;
  v_count INTEGER;
BEGIN
  FOR r IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(r.table_name) INTO v_count;
    RAISE NOTICE '% registros em %', LPAD(v_count::TEXT, 6, ' '), r.table_name;
  END LOOP;
END $$;
