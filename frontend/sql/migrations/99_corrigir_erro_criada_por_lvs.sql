-- ===================================================================
-- CORREÇÃO: Remover referências a criada_por na tabela lvs
-- Erro: column "criada_por" does not exist
-- Data: 2025-11-07
-- ===================================================================

-- 1. DIAGNÓSTICO: Verificar estrutura atual da tabela lvs
SELECT
    '=== ESTRUTURA TABELA LVS ===' as info,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lvs'
ORDER BY ordinal_position;

-- 2. DIAGNÓSTICO: Verificar se existe coluna criada_por
SELECT
    '=== VERIFICAR criada_por ===' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'lvs'
              AND column_name = 'criada_por'
        ) THEN '✅ Coluna criada_por existe'
        ELSE '❌ Coluna criada_por NÃO existe'
    END as status;

-- 3. DIAGNÓSTICO: Verificar constraints que usam criada_por
SELECT
    '=== CONSTRAINTS COM criada_por ===' as info,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.lvs'::regclass
  AND pg_get_constraintdef(oid) LIKE '%criada_por%';

-- 4. DIAGNÓSTICO: Verificar defaults que usam criada_por
SELECT
    '=== DEFAULTS COM criada_por ===' as info,
    pg_get_expr(adbin, adrelid) as default_expression
FROM pg_attrdef ad
JOIN pg_attribute a ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
WHERE a.attrelid = 'public.lvs'::regclass
  AND pg_get_expr(adbin, adrelid) LIKE '%criada_por%';

-- 5. DIAGNÓSTICO: Verificar RLS policies que usam criada_por
SELECT
    '=== RLS POLICIES COM criada_por ===' as info,
    polname as policy_name,
    polcmd as command,
    pg_get_expr(polqual, polrelid) as using_expression,
    pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy
WHERE polrelid = 'public.lvs'::regclass
  AND (
    pg_get_expr(polqual, polrelid) LIKE '%criada_por%' OR
    pg_get_expr(polwithcheck, polrelid) LIKE '%criada_por%'
  );

-- 6. DIAGNÓSTICO: Verificar triggers que usam criada_por
SELECT
    '=== TRIGGERS COM criada_por ===' as info,
    t.tgname as trigger_name,
    p.prosrc as function_source
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.lvs'::regclass
  AND p.prosrc LIKE '%criada_por%';

-- 7. CORREÇÃO: Verificar se auth_user_id existe (deve ser usado no lugar de criada_por)
SELECT
    '=== VERIFICAR auth_user_id ===' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'lvs'
              AND column_name = 'auth_user_id'
        ) THEN '✅ Coluna auth_user_id existe'
        ELSE '❌ Coluna auth_user_id NÃO existe'
    END as status;

-- 8. CORREÇÃO: Se auth_user_id não existir, criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'lvs'
          AND column_name = 'auth_user_id'
    ) THEN
        RAISE NOTICE '📝 Criando coluna auth_user_id...';

        ALTER TABLE public.lvs
        ADD COLUMN IF NOT EXISTS auth_user_id UUID;

        RAISE NOTICE '✅ Coluna auth_user_id criada!';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna auth_user_id já existe';
    END IF;
END $$;

-- 9. CORREÇÃO: Popular auth_user_id a partir de usuario_id (se vazio)
DO $$
DECLARE
    total_atualizados INTEGER;
BEGIN
    -- Tentar popular a partir de usuarios.auth_user_id
    UPDATE public.lvs l
    SET auth_user_id = u.auth_user_id
    FROM public.usuarios u
    WHERE l.usuario_id = u.id
      AND l.auth_user_id IS NULL
      AND u.auth_user_id IS NOT NULL;

    GET DIAGNOSTICS total_atualizados = ROW_COUNT;

    IF total_atualizados > 0 THEN
        RAISE NOTICE '✅ % LVs atualizadas com auth_user_id', total_atualizados;
    ELSE
        RAISE NOTICE 'ℹ️ Nenhuma LV precisou de atualização auth_user_id';
    END IF;
END $$;

-- 10. VERIFICAÇÃO FINAL
SELECT
    '=== VERIFICAÇÃO FINAL ===' as info,
    COUNT(*) as total_lvs,
    COUNT(auth_user_id) as lvs_com_auth_user_id,
    COUNT(*) - COUNT(auth_user_id) as lvs_sem_auth_user_id
FROM public.lvs;

-- 11. PRÓXIMOS PASSOS (MANUAL)
SELECT
    '=== PRÓXIMOS PASSOS ===' as info,
    '1. Se houver RLS policies com criada_por, remover ou substituir por auth_user_id' as passo_1,
    '2. Se houver constraints com criada_por, remover' as passo_2,
    '3. Se houver defaults com criada_por, remover' as passo_3,
    '4. Verificar se triggers estão funcionando corretamente' as passo_4;
