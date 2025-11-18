-- ===================================================================
-- IDENTIFICAR FKs RESTANTES - ATIVIDADES ROTINA
-- Localização: sql/identificar_fk_rotinas.sql
-- ===================================================================

-- Identificar as 2 FKs restantes na tabela atividades_rotina
SELECT '=== FKs RESTANTES ATIVIDADES ROTINA ===' as info;

SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'atividades_rotina'
ORDER BY tc.constraint_name;

-- Verificar se são FKs para usuarios
SELECT '=== FKs PARA USUARIOS ===' as info;

SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'atividades_rotina'
    AND ccu.table_name = 'usuarios'
ORDER BY tc.constraint_name; 