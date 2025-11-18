-- ===================================================================
-- REMOVER FOREIGN KEY CONSTRAINTS - ECOFIELD
-- Localização: scripts/remover_fk_usuarios.sql
-- ===================================================================

-- Remover foreign key constraints que apontam para a tabela usuarios

-- 1. LVs
ALTER TABLE lvs DROP CONSTRAINT IF EXISTS lvs_usuario_id_fkey;

-- 2. LV Resíduos  
ALTER TABLE lv_residuos DROP CONSTRAINT IF EXISTS lv_residuos_usuario_id_fkey;

-- 3. Termos Ambientais
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 4. Atividades Rotina
ALTER TABLE atividades_rotina DROP CONSTRAINT IF EXISTS atividades_rotina_tma_responsavel_id_fkey;

-- 5. Metas Atribuições
ALTER TABLE metas_atribuicoes DROP CONSTRAINT IF EXISTS metas_atribuicoes_tma_id_fkey;

-- 6. Progresso Metas
ALTER TABLE progresso_metas DROP CONSTRAINT IF EXISTS progresso_metas_tma_id_fkey;

-- Verificar se as constraints foram removidas
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
ORDER BY tc.table_name; 