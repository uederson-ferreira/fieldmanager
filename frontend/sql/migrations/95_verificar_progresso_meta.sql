-- ===================================================================
-- VERIFICAÇÃO: Progresso das metas após criação de LV
-- Data: 2025-11-07
-- ===================================================================

-- 1. Verificar LVs criadas hoje
SELECT
    '=== LVS CRIADAS HOJE ===' as info,
    id,
    tipo_lv,
    nome_lv,
    usuario_id,
    data_inspecao,
    created_at,
    DATE_PART('year', created_at) as ano,
    DATE_PART('month', created_at) as mes
FROM lvs
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- 2. Verificar metas ativas de LV para o período atual
SELECT
    '=== METAS DE LV ATIVAS (MÊS ATUAL) ===' as info,
    m.id,
    m.descricao,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade,
    m.periodo,
    m.ano,
    m.mes,
    m.ativa
FROM metas m
WHERE m.tipo_meta = 'lv'
  AND m.ativa = true
  AND m.ano = DATE_PART('year', CURRENT_DATE)
  AND m.mes = DATE_PART('month', CURRENT_DATE)
ORDER BY m.escopo, m.created_at DESC;

-- 3. Verificar progresso atual das metas de LV
SELECT
    '=== PROGRESSO DAS METAS DE LV ===' as info,
    pm.id,
    pm.meta_id,
    m.descricao as meta_descricao,
    m.escopo,
    m.meta_quantidade,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.tma_id,
    u.nome as tma_nome,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE m.tipo_meta = 'lv'
  AND pm.ano = DATE_PART('year', CURRENT_DATE)
  AND pm.mes = DATE_PART('month', CURRENT_DATE)
ORDER BY pm.ultima_atualizacao DESC;

-- 4. Contar LVs do usuário no mês atual
SELECT
    '=== TOTAL LVS POR USUÁRIO (MÊS ATUAL) ===' as info,
    u.id as usuario_id,
    u.nome,
    u.email,
    COUNT(l.id) as total_lvs,
    DATE_PART('year', CURRENT_DATE) as ano,
    DATE_PART('month', CURRENT_DATE) as mes
FROM usuarios u
LEFT JOIN lvs l ON u.id = l.usuario_id
  AND DATE_PART('year', l.created_at) = DATE_PART('year', CURRENT_DATE)
  AND DATE_PART('month', l.created_at) = DATE_PART('month', CURRENT_DATE)
GROUP BY u.id, u.nome, u.email
HAVING COUNT(l.id) > 0
ORDER BY total_lvs DESC;

-- 5. Verificar se triggers estão ativos
SELECT
    '=== TRIGGERS ATIVOS EM lvs ===' as info,
    t.tgname as trigger_name,
    p.proname as function_name,
    CASE t.tgenabled
        WHEN 'O' THEN '✅ ATIVO'
        WHEN 'D' THEN '❌ DESATIVADO'
        ELSE 'OUTRO'
    END as status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.lvs'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 6. Teste manual: Forçar atualização de progresso
SELECT '=== FORÇANDO ATUALIZAÇÃO MANUAL ===' as info;

DO $$
DECLARE
    v_usuario_id UUID;
    v_ano INTEGER := DATE_PART('year', CURRENT_DATE);
    v_mes INTEGER := DATE_PART('month', CURRENT_DATE);
BEGIN
    -- Para cada usuário que criou LV hoje
    FOR v_usuario_id IN
        SELECT DISTINCT usuario_id
        FROM lvs
        WHERE DATE(created_at) = CURRENT_DATE
    LOOP
        RAISE NOTICE '🔄 Atualizando progresso para usuário: %', v_usuario_id;

        -- Chamar função de atualização
        PERFORM atualizar_progresso_meta('lv', v_usuario_id, v_ano, v_mes);
    END LOOP;

    RAISE NOTICE '✅ Atualização manual concluída!';
END $$;

-- 7. Verificar progresso após atualização manual
SELECT
    '=== PROGRESSO APÓS ATUALIZAÇÃO MANUAL ===' as info,
    pm.meta_id,
    m.descricao,
    m.escopo,
    m.meta_quantidade as meta,
    pm.quantidade_atual as atual,
    pm.percentual_alcancado as percentual,
    pm.status,
    u.nome as tma,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE m.tipo_meta = 'lv'
  AND pm.ano = DATE_PART('year', CURRENT_DATE)
  AND pm.mes = DATE_PART('month', CURRENT_DATE)
ORDER BY pm.ultima_atualizacao DESC;

-- 8. Resumo final
SELECT
    '=== RESUMO FINAL ===' as info,
    (SELECT COUNT(*) FROM lvs WHERE DATE(created_at) = CURRENT_DATE) as lvs_hoje,
    (SELECT COUNT(*) FROM metas WHERE tipo_meta = 'lv' AND ativa = true) as metas_lv_ativas,
    (SELECT COUNT(*) FROM progresso_metas pm
     JOIN metas m ON pm.meta_id = m.id
     WHERE m.tipo_meta = 'lv'
       AND pm.ultima_atualizacao >= NOW() - INTERVAL '5 minutes') as progressos_atualizados_ultimos_5min;
