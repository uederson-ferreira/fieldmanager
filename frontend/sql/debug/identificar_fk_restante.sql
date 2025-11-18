-- ===================================================================
-- IDENTIFICAR FK RESTANTE - ECOFIELD
-- Localização: sql/identificar_fk_restante.sql
-- ===================================================================

-- Identificar qual foreign key ainda aponta para usuarios

SELECT '=== FK RESTANTE ===' as info;

SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'usuarios'
ORDER BY tc.table_name, tc.constraint_name;

-- ===================================================================
-- REMOVER A FK RESTANTE
-- ===================================================================

SELECT '=== REMOVENDO FK RESTANTE ===' as info;

-- Remover baseado no resultado acima
-- (Execute o comando específico após identificar)

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    'FOREIGN KEYS' as tipo,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TODAS REMOVIDAS'
        ELSE '❌ AINDA EXISTEM'
    END as status,
    CONCAT(COUNT(*), ' FKs restantes') as detalhes
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'usuarios'; 