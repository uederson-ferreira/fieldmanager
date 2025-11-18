-- ===================================================================
-- DIAGNÓSTICO: Encontrar onde criada_por está sendo usado
-- ===================================================================

-- 1. Verificar se coluna criada_por existe
SELECT
    '=== 1. COLUNA criada_por EXISTE? ===' as teste,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'lvs'
              AND column_name = 'criada_por'
        ) THEN '✅ SIM - A coluna existe'
        ELSE '❌ NÃO - A coluna não existe'
    END as resultado;

-- 2. Verificar DEFAULT VALUES que usam criada_por
SELECT
    '=== 2. DEFAULTS COM criada_por ===' as teste,
    a.attname as column_name,
    pg_get_expr(ad.adbin, ad.adrelid) as default_value
FROM pg_attrdef ad
JOIN pg_attribute a ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
WHERE a.attrelid = 'public.lvs'::regclass
  AND pg_get_expr(ad.adbin, adrelid) LIKE '%criada_por%';

-- 3. Verificar CONSTRAINTS que usam criada_por
SELECT
    '=== 3. CONSTRAINTS COM criada_por ===' as teste,
    conname as constraint_name,
    contype as type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.lvs'::regclass
  AND pg_get_constraintdef(oid) LIKE '%criada_por%';

-- 4. Verificar TRIGGERS que usam criada_por
SELECT
    '=== 4. TRIGGERS COM criada_por ===' as teste,
    t.tgname as trigger_name,
    p.proname as function_name,
    CASE WHEN p.prosrc LIKE '%criada_por%' THEN '❌ USA criada_por' ELSE '✅ NÃO USA criada_por' END as usa_criada_por
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.lvs'::regclass;

-- 5. Listar TODAS as colunas da tabela lvs
SELECT
    '=== 5. TODAS AS COLUNAS ===' as teste,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lvs'
ORDER BY ordinal_position;

-- 6. Verificar se há VIEWS usando criada_por
SELECT
    '=== 6. VIEWS COM criada_por ===' as teste,
    viewname as view_name,
    definition
FROM pg_views
WHERE schemaname = 'public'
  AND definition LIKE '%criada_por%'
  AND (definition LIKE '%lvs%' OR viewname LIKE '%lv%');

-- 7. Verificar FUNÇÕES que acessam criada_por
SELECT
    '=== 7. FUNÇÕES COM criada_por ===' as teste,
    p.proname as function_name,
    CASE WHEN p.prosrc LIKE '%criada_por%' THEN '❌ USA criada_por' ELSE '✅ NÃO USA' END as usa
FROM pg_proc p
WHERE p.prosrc LIKE '%criada_por%'
  AND p.prosrc LIKE '%lvs%';
