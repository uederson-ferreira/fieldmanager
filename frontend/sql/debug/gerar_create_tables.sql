-- =====================================================
-- GERAR CREATE TABLE STATEMENTS
-- Data: 04/01/2025
-- Descrição: Gera scripts CREATE TABLE de todas as tabelas
-- Uso: Execute no SQL Editor do Supabase e salve o resultado
-- =====================================================

-- Função para gerar CREATE TABLE de uma tabela específica
CREATE OR REPLACE FUNCTION generate_create_table_statement(table_name_param text)
RETURNS text AS $$
DECLARE
  create_stmt text;
  columns_part text;
  constraints_part text;
BEGIN
  -- Gerar parte das colunas
  SELECT string_agg(
    '  ' || column_name || ' ' ||
    CASE
      WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
      WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
      WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
      WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
      WHEN data_type = 'ARRAY' THEN udt_name || '[]'
      ELSE UPPER(data_type)
    END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
    CASE
      WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
      ELSE ''
    END,
    ',' || E'\n'
    ORDER BY ordinal_position
  ) INTO columns_part
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = table_name_param;

  -- Gerar parte dos constraints
  SELECT string_agg(
    '  CONSTRAINT ' || constraint_name || ' ' ||
    CASE constraint_type
      WHEN 'PRIMARY KEY' THEN 'PRIMARY KEY (' || column_name || ')'
      WHEN 'UNIQUE' THEN 'UNIQUE (' || column_name || ')'
      WHEN 'FOREIGN KEY' THEN 'FOREIGN KEY (' || column_name || ') REFERENCES ' ||
        referenced_table || '(' || referenced_column || ')'
      ELSE constraint_type
    END,
    ',' || E'\n'
  ) INTO constraints_part
  FROM (
    SELECT
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS referenced_table,
      ccu.column_name AS referenced_column
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = table_name_param
      AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
  ) constraints;

  -- Montar statement completo
  create_stmt := 'CREATE TABLE public.' || table_name_param || ' (' || E'\n' ||
    columns_part ||
    CASE
      WHEN constraints_part IS NOT NULL THEN ',' || E'\n' || constraints_part
      ELSE ''
    END ||
    E'\n' || ') TABLESPACE pg_default;';

  RETURN create_stmt;
END;
$$ LANGUAGE plpgsql;

-- Gerar CREATE TABLE de todas as tabelas
SELECT
  table_name,
  generate_create_table_statement(table_name) as create_statement
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Limpar função temporária
DROP FUNCTION IF EXISTS generate_create_table_statement(text);
