-- ===================================================================
-- TESTE: Verificar se trigger atualiza progresso automaticamente
-- Data: 2025-11-07
-- ===================================================================

-- 1. Estado ANTES do teste
SELECT '=== ESTADO ANTES DO TESTE ===' as info;

SELECT
    'Progresso antes' as momento,
    COUNT(*) as total_registros,
    MAX(ultima_atualizacao) as ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'lv';

-- 2. Criar LV de teste
DO $$
DECLARE
    v_test_lv_id UUID;
    v_usuario_id UUID;
    v_usuario_nome TEXT;
    v_usuario_email TEXT;
BEGIN
    -- Pegar primeiro usuário ativo
    SELECT id, nome, email INTO v_usuario_id, v_usuario_nome, v_usuario_email
    FROM usuarios
    WHERE ativo = true
    LIMIT 1;

    RAISE NOTICE '📝 Criando LV de teste para usuário: % (%)', v_usuario_nome, v_usuario_id;

    -- Inserir LV de teste
    INSERT INTO lvs (
        tipo_lv,
        nome_lv,
        usuario_id,
        usuario_nome,
        usuario_email,
        data_inspecao,
        area,
        inspetor_principal,
        responsavel_tecnico,
        responsavel_empresa,
        auth_user_id,
        status
    ) VALUES (
        '99',
        'TESTE AUTOMÁTICO - Verificar trigger',
        v_usuario_id,
        v_usuario_nome,
        v_usuario_email,
        CURRENT_DATE,
        'Área de Teste Trigger',
        v_usuario_nome,
        v_usuario_nome,
        'Empresa Teste Trigger',
        (SELECT auth_user_id FROM usuarios WHERE id = v_usuario_id),
        'concluido'
    )
    RETURNING id INTO v_test_lv_id;

    RAISE NOTICE '✅ LV de teste criada: %', v_test_lv_id;
    RAISE NOTICE '⏳ Aguardando 2 segundos para trigger processar...';

    -- Aguardar 2 segundos
    PERFORM pg_sleep(2);

    RAISE NOTICE '✅ Aguardando concluído!';
END $$;

-- 3. Estado DEPOIS do teste
SELECT '=== ESTADO DEPOIS DO TESTE ===' as info;

SELECT
    'Progresso depois' as momento,
    COUNT(*) as total_registros,
    MAX(ultima_atualizacao) as ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'lv';

-- 4. Ver progresso atualizado recentemente (últimos 10 segundos)
SELECT
    '=== PROGRESSO ATUALIZADO NOS ÚLTIMOS 10 SEGUNDOS ===' as info,
    pm.meta_id,
    m.descricao as meta,
    m.escopo,
    m.meta_quantidade,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    u.nome as tma,
    pm.ultima_atualizacao,
    NOW() - pm.ultima_atualizacao as tempo_decorrido
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE m.tipo_meta = 'lv'
  AND pm.ultima_atualizacao >= NOW() - INTERVAL '10 seconds'
ORDER BY pm.ultima_atualizacao DESC;

-- 5. Ver LVs criadas nos últimos 10 segundos
SELECT
    '=== LVS CRIADAS NOS ÚLTIMOS 10 SEGUNDOS ===' as info,
    l.id,
    l.tipo_lv,
    l.nome_lv,
    l.usuario_id,
    u.nome as usuario_nome,
    l.created_at,
    NOW() - l.created_at as tempo_decorrido
FROM lvs l
JOIN usuarios u ON l.usuario_id = u.id
WHERE l.created_at >= NOW() - INTERVAL '10 seconds'
ORDER BY l.created_at DESC;

-- 6. Remover LV de teste
DO $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM lvs
    WHERE tipo_lv = '99'
      AND nome_lv LIKE 'TESTE%'
      AND created_at >= NOW() - INTERVAL '1 minute';

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_deleted_count > 0 THEN
        RAISE NOTICE '🗑️ % LV(s) de teste removida(s)', v_deleted_count;
    ELSE
        RAISE NOTICE 'ℹ️ Nenhuma LV de teste para remover';
    END IF;
END $$;

-- 7. RESULTADO FINAL
SELECT
    '=== RESULTADO DO TESTE ===' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM progresso_metas pm
            JOIN metas m ON pm.meta_id = m.id
            WHERE m.tipo_meta = 'lv'
              AND pm.ultima_atualizacao >= NOW() - INTERVAL '15 seconds'
        ) THEN '✅ TRIGGER FUNCIONANDO! Progresso foi atualizado automaticamente'
        ELSE '❌ TRIGGER NÃO DISPAROU! Progresso não foi atualizado'
    END as resultado;
