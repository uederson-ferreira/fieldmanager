-- ===================================================================
-- VERIFICAÇÃO E CORREÇÃO: Triggers de progresso de metas
-- Data: 2025-11-07
-- ===================================================================

-- 1. Verificar triggers existentes na tabela lvs
SELECT
    '=== TRIGGERS NA TABELA lvs ===' as info,
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as definition,
    CASE t.tgenabled::text
        WHEN 'O' THEN '✅ ATIVO'
        WHEN 'D' THEN '❌ DESATIVADO'
        ELSE 'OUTRO: ' || t.tgenabled::text
    END as status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.lvs'::regclass
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 2. Verificar código da função calcular_progresso_metas
SELECT
    '=== FUNÇÃO calcular_progresso_metas ===' as info,
    p.proname as function_name,
    CASE
        WHEN p.prosrc LIKE '%atualizar_progresso_meta%' THEN '✅ Chama atualizar_progresso_meta'
        ELSE '❌ NÃO chama atualizar_progresso_meta'
    END as chama_funcao_correta,
    CASE
        WHEN p.prosrc LIKE '%usuario_id%' THEN '✅ Usa usuario_id'
        WHEN p.prosrc LIKE '%criada_por%' THEN '❌ USA criada_por (ERRO!)'
        ELSE '⚠️ Campo não identificado'
    END as campo_usuario
FROM pg_proc p
WHERE p.proname = 'calcular_progresso_metas';

-- 3. Se não houver trigger, criar
DO $$
BEGIN
    -- Verificar se trigger existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.lvs'::regclass
          AND tgname = 'trigger_calcular_progresso_lvs'
    ) THEN
        RAISE NOTICE '📝 Criando trigger para LVs...';

        CREATE TRIGGER trigger_calcular_progresso_lvs
        AFTER INSERT OR UPDATE ON lvs
        FOR EACH ROW
        EXECUTE FUNCTION calcular_progresso_metas();

        RAISE NOTICE '✅ Trigger criado!';
    ELSE
        RAISE NOTICE 'ℹ️ Trigger já existe';
    END IF;
END $$;

-- 4. Verificar se a função calcular_progresso_metas chama atualizar_progresso_meta
SELECT
    '=== VERIFICAR SE FUNÇÕES ESTÃO CONECTADAS ===' as info,
    p.proname,
    CASE
        WHEN p.prosrc LIKE '%atualizar_progresso_meta%' THEN
            '✅ calcular_progresso_metas() chama atualizar_progresso_meta()'
        ELSE
            '❌ calcular_progresso_metas() NÃO chama atualizar_progresso_meta()'
    END as status
FROM pg_proc p
WHERE p.proname = 'calcular_progresso_metas';

-- 5. TESTE: Criar uma LV de teste e verificar se trigger dispara
SELECT '=== PREPARANDO TESTE ===' as info;

DO $$
DECLARE
    v_test_lv_id UUID;
    v_usuario_id UUID;
    v_antes INTEGER;
    v_depois INTEGER;
BEGIN
    -- Pegar primeiro usuário
    SELECT id INTO v_usuario_id FROM usuarios LIMIT 1;

    -- Contar progresso antes
    SELECT COUNT(*) INTO v_antes
    FROM progresso_metas pm
    JOIN metas m ON pm.meta_id = m.id
    WHERE m.tipo_meta = 'lv'
      AND pm.ultima_atualizacao >= NOW() - INTERVAL '1 minute';

    RAISE NOTICE '📊 Progresso antes do teste: % registros', v_antes;

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
        'TESTE - LV para verificar trigger',
        v_usuario_id,
        (SELECT nome FROM usuarios WHERE id = v_usuario_id),
        (SELECT email FROM usuarios WHERE id = v_usuario_id),
        CURRENT_DATE,
        'Área de Teste',
        (SELECT nome FROM usuarios WHERE id = v_usuario_id),
        (SELECT nome FROM usuarios WHERE id = v_usuario_id),
        'Empresa Teste',
        (SELECT auth_user_id FROM usuarios WHERE id = v_usuario_id),
        'concluido'
    )
    RETURNING id INTO v_test_lv_id;

    RAISE NOTICE '📝 LV de teste criada: %', v_test_lv_id;

    -- Aguardar 1 segundo
    PERFORM pg_sleep(1);

    -- Contar progresso depois
    SELECT COUNT(*) INTO v_depois
    FROM progresso_metas pm
    JOIN metas m ON pm.meta_id = m.id
    WHERE m.tipo_meta = 'lv'
      AND pm.ultima_atualizacao >= NOW() - INTERVAL '1 minute';

    RAISE NOTICE '📊 Progresso depois do teste: % registros', v_depois;

    IF v_depois > v_antes THEN
        RAISE NOTICE '✅ TRIGGER FUNCIONANDO! Progresso foi atualizado automaticamente';
    ELSE
        RAISE NOTICE '❌ TRIGGER NÃO DISPAROU! Progresso não foi atualizado';
    END IF;

    -- Deletar LV de teste
    DELETE FROM lvs WHERE id = v_test_lv_id;
    RAISE NOTICE '🗑️ LV de teste removida';

END $$;

-- 6. Resumo final
SELECT
    '=== RESUMO ===' as info,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgrelid = 'public.lvs'::regclass AND NOT tgisinternal) as triggers_lvs,
    (SELECT COUNT(*) FROM pg_proc WHERE proname = 'calcular_progresso_metas') as funcao_calcular_existe,
    (SELECT COUNT(*) FROM pg_proc WHERE proname = 'atualizar_progresso_meta') as funcao_atualizar_existe;
