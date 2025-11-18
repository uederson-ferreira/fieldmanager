-- =====================================================
-- EXTRAIR SCHEMA COMPLETO DE TODAS AS TABELAS
-- Data: 04/01/2025
-- Descrição: Extrai estrutura completa de todas as tabelas do Supabase
-- =====================================================

-- =====================================================
-- 1. LISTAR TODAS AS TABELAS
-- =====================================================
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 2. SCHEMA DETALHADO DE CADA TABELA (com tipos e constraints)
-- =====================================================
SELECT
  t.table_name,
  c.column_name,
  c.ordinal_position as pos,
  c.data_type,
  c.character_maximum_length as max_length,
  c.is_nullable,
  c.column_default,
  CASE
    WHEN pk.column_name IS NOT NULL THEN 'PK'
    WHEN fk.column_name IS NOT NULL THEN 'FK'
    WHEN uq.column_name IS NOT NULL THEN 'UNIQUE'
    ELSE ''
  END as constraint_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
  ON t.table_name = c.table_name
  AND t.table_schema = c.table_schema
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
    AND tc.table_schema = ku.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
    AND tc.table_schema = ku.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
    AND tc.table_schema = ku.table_schema
  WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
) uq ON c.table_name = uq.table_name AND c.column_name = uq.column_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- =====================================================
-- 3. FOREIGN KEYS (relacionamentos entre tabelas)
-- =====================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 4. INDEXES
-- =====================================================
SELECT
  t.relname AS table_name,
  i.relname AS index_name,
  a.attname AS column_name
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r'
  AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY t.relname, i.relname;

-- =====================================================
-- 5. GERAR CREATE TABLE STATEMENTS (script completo)
-- =====================================================

-- Esta query gera os CREATE TABLE statements completos
SELECT
  'CREATE TABLE ' || table_name || ' (' || E'\n' ||
  string_agg(
    '  ' || column_name || ' ' ||
    CASE
      WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
      WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
      WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
      WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
      WHEN data_type = 'boolean' THEN 'BOOLEAN'
      WHEN data_type = 'uuid' THEN 'UUID'
      WHEN data_type = 'text' THEN 'TEXT'
      WHEN data_type = 'integer' THEN 'INTEGER'
      WHEN data_type = 'bigint' THEN 'BIGINT'
      WHEN data_type = 'numeric' THEN 'NUMERIC'
      WHEN data_type = 'date' THEN 'DATE'
      WHEN data_type = 'json' THEN 'JSON'
      WHEN data_type = 'jsonb' THEN 'JSONB'
      ELSE UPPER(data_type)
    END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE ' NULL' END ||
    CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
    ',' || E'\n'
    ORDER BY ordinal_position
  ) || E'\n' || ');' AS create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- =====================================================
-- 6. CONTAGEM DE REGISTROS POR TABELA
-- =====================================================

-- Esta query mostra quantos registros cada tabela tem
DO $$
DECLARE
  r RECORD;
  v_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CONTAGEM DE REGISTROS POR TABELA ===';
  RAISE NOTICE '';

  FOR r IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(r.table_name) INTO v_count;
    RAISE NOTICE '% registros em %', LPAD(v_count::TEXT, 6, ' '), r.table_name;
  END LOOP;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- 7. VERIFICAR RLS (Row Level Security)
-- =====================================================
SELECT
  tablename,
  rowsecurity::text as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 8. POLICIES (se RLS estiver habilitado)
-- =====================================================
SELECT
  schemaname || '.' || tablename as table_name,
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 9. TRIGGERS
-- =====================================================
SELECT
  event_object_table as table_name,
  trigger_name,
  event_manipulation as event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 10. RESUMO GERAL
-- =====================================================
DO $$
DECLARE
  v_total_tables INTEGER;
  v_total_columns INTEGER;
  v_total_fks INTEGER;
  v_total_indexes INTEGER;
BEGIN
  -- Contar tabelas
  SELECT COUNT(*) INTO v_total_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

  -- Contar colunas
  SELECT COUNT(*) INTO v_total_columns
  FROM information_schema.columns
  WHERE table_schema = 'public';

  -- Contar foreign keys
  SELECT COUNT(*) INTO v_total_fks
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';

  -- Contar indexes
  SELECT COUNT(DISTINCT i.relname) INTO v_total_indexes
  FROM pg_class t
  JOIN pg_index ix ON t.oid = ix.indrelid
  JOIN pg_class i ON i.oid = ix.indexrelid
  WHERE t.relkind = 'r'
    AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RESUMO GERAL DO SCHEMA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Estatísticas:';
  RAISE NOTICE '  • Total de tabelas: %', v_total_tables;
  RAISE NOTICE '  • Total de colunas: %', v_total_columns;
  RAISE NOTICE '  • Total de Foreign Keys: %', v_total_fks;
  RAISE NOTICE '  • Total de Indexes: %', v_total_indexes;
  RAISE NOTICE '';
END $$;
