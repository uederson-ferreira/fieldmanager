-- ===================================================================
-- IDENTIFICAR FK RESTANTE - SCRIPT SIMPLES
-- ===================================================================

-- Identificar qual foreign key ainda aponta para usuarios
SELECT 
    tc.table_name as tabela, 
    tc.constraint_name as constraint_name, 
    kcu.column_name as coluna,
    ccu.table_name AS tabela_referenciada,
    ccu.column_name AS coluna_referenciada
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