-- ===================================================================
-- REMOVER TODAS AS FOREIGN KEYS PARA TABELA USUARIOS - ECOFIELD
-- Localização: sql/remover_todas_fk_usuarios.sql
-- ===================================================================

-- Este script remove todas as foreign key constraints que apontam para a tabela usuarios
-- que não é mais usada, já que agora usamos Supabase Auth (auth.users)

-- 1. ATIVIDADES ROTINA
ALTER TABLE atividades_rotina DROP CONSTRAINT IF EXISTS atividades_rotina_tma_responsavel_id_fkey;
ALTER TABLE atividades_rotina DROP CONSTRAINT IF EXISTS atividades_rotina_encarregado_id_fkey;

-- 2. INSPEÇÕES
ALTER TABLE inspecoes DROP CONSTRAINT IF EXISTS inspecoes_responsavel_id_fkey;

-- 3. LV RESÍDUOS
ALTER TABLE lv_residuos DROP CONSTRAINT IF EXISTS lv_residuos_usuario_id_fkey;

-- 4. TERMOS AMBIENTAIS
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 5. TERMOS HISTÓRICO
ALTER TABLE termos_historico DROP CONSTRAINT IF EXISTS termos_historico_usuario_id_fkey;

-- 6. METAS
ALTER TABLE metas DROP CONSTRAINT IF EXISTS metas_criada_por_fkey;

-- 7. METAS ATRIBUIÇÕES
ALTER TABLE metas_atribuicoes DROP CONSTRAINT IF EXISTS metas_atribuicoes_tma_id_fkey;

-- 8. PROGRESSO METAS
ALTER TABLE progresso_metas DROP CONSTRAINT IF EXISTS progresso_metas_tma_id_fkey;

-- ===================================================================
-- VERIFICAR SE TODAS AS CONSTRAINTS FORAM REMOVIDAS
-- ===================================================================

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

-- ===================================================================
-- VERIFICAR TABELAS QUE AINDA REFERENCIAM USUARIOS
-- ===================================================================

SELECT 
    table_name,
    column_name,
    data_type
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND column_name LIKE '%usuario%' 
    OR column_name LIKE '%tma%'
    OR column_name LIKE '%responsavel%'
    OR column_name LIKE '%encarregado%'
ORDER BY table_name, column_name; 