-- ===================================================================
-- REMOVER FOREIGN KEYS RESTANTES - ECOFIELD
-- Localização: sql/remover_fks_restantes.sql
-- ===================================================================

-- Este script remove as foreign keys restantes que ainda apontam para usuarios

-- ===================================================================
-- 1. IDENTIFICAR TODAS AS FKs RESTANTES
-- ===================================================================

SELECT '=== FKs RESTANTES ===' as info;

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
-- 2. REMOVER TODAS AS FKs RESTANTES
-- ===================================================================

SELECT '=== REMOVENDO FKs ===' as info;

-- Atividades Rotina
ALTER TABLE atividades_rotina DROP CONSTRAINT IF EXISTS atividades_rotina_tma_responsavel_id_fkey;
ALTER TABLE atividades_rotina DROP CONSTRAINT IF EXISTS atividades_rotina_encarregado_id_fkey;

-- Inspeções
ALTER TABLE inspecoes DROP CONSTRAINT IF EXISTS inspecoes_responsavel_id_fkey;

-- LV Resíduos
ALTER TABLE lv_residuos DROP CONSTRAINT IF EXISTS lv_residuos_usuario_id_fkey;

-- Termos Ambientais
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- Termos Histórico
ALTER TABLE termos_historico DROP CONSTRAINT IF EXISTS termos_historico_usuario_id_fkey;

-- Metas
ALTER TABLE metas DROP CONSTRAINT IF EXISTS metas_criada_por_fkey;

-- Metas Atribuições
ALTER TABLE metas_atribuicoes DROP CONSTRAINT IF EXISTS metas_atribuicoes_tma_id_fkey;

-- Progresso Metas
ALTER TABLE progresso_metas DROP CONSTRAINT IF EXISTS progresso_metas_tma_id_fkey;

-- ===================================================================
-- 3. VERIFICAR SE FORAM REMOVIDAS
-- ===================================================================

SELECT '=== VERIFICAÇÃO FINAL ===' as info;

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
-- 4. RESUMO FINAL
-- ===================================================================

SELECT '=== RESUMO FINAL ===' as info;

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
    AND ccu.table_name = 'usuarios'

UNION ALL

SELECT 
    'ARQUITETURA HÍBRIDA' as tipo,
    CASE 
        WHEN COUNT(auth_user_id) = COUNT(*) THEN '✅ FUNCIONANDO'
        ELSE '❌ PROBLEMA'
    END as status,
    CONCAT(COUNT(auth_user_id), '/', COUNT(*), ' usuários mapeados') as detalhes
FROM public.usuarios

UNION ALL

SELECT 
    'POLÍTICAS RLS' as tipo,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CRIADAS'
        ELSE '❌ FALTANDO'
    END as status,
    CONCAT(COUNT(*), ' políticas') as detalhes
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('termos_ambientais', 'atividades_rotina', 'lv_residuos', 'metas'); 