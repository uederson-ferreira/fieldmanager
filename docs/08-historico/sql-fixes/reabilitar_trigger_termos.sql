-- ===================================================================
-- REABILITAR TRIGGER DE TERMOS DESABILITADO
-- ===================================================================

-- PROBLEMA: Trigger está desabilitado (status "O")
-- SOLUÇÃO: Reabilitar o trigger

-- 1. Verificar status atual
SELECT 
    'STATUS ATUAL:' as status,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgenabled as ativo,
    CASE 
        WHEN tgenabled = 't' THEN '✅ ATIVO'
        WHEN tgenabled = 'f' THEN '❌ DESATIVADO'
        WHEN tgenabled = 'O' THEN '⚠️ DESABILITADO'
        ELSE '❓ DESCONHECIDO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'termos_ambientais'::regclass
  AND tgname = 'trigger_calcular_progresso_termos';

-- 2. Reabilitar o trigger
ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;

-- 3. Verificar se foi reabilitado
SELECT 
    'STATUS APÓS REABILITAÇÃO:' as status,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgenabled as ativo,
    CASE 
        WHEN tgenabled = 't' THEN '✅ ATIVO'
        WHEN tgenabled = 'f' THEN '❌ DESATIVADO'
        WHEN tgenabled = 'O' THEN '⚠️ DESABILITADO'
        ELSE '❓ DESCONHECIDO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'termos_ambientais'::regclass
  AND tgname = 'trigger_calcular_progresso_termos';

-- 4. Teste rápido: Verificar se o trigger funciona agora
DO $$
DECLARE
    test_user_id UUID := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
    test_termo_id UUID;
    progresso_antes INTEGER;
    progresso_depois INTEGER;
BEGIN
    RAISE NOTICE '🧪 TESTE RÁPIDO APÓS REABILITAÇÃO...';
    
    -- Verificar progresso antes
    SELECT COALESCE(SUM(pm.quantidade_atual), 0) INTO progresso_antes
    FROM progresso_metas pm
    JOIN metas m ON pm.meta_id = m.id
    WHERE m.tipo_meta = 'termo'
      AND pm.tma_id = test_user_id;
    
    RAISE NOTICE '📊 Progresso antes: % termos', progresso_antes;
    
    -- Inserir termo de teste
    INSERT INTO termos_ambientais (
        numero_termo,
        tipo_termo,
        data_termo,
        hora_termo,
        local_atividade,
        projeto_ba,
        fase_etapa_obra,
        emitido_por_usuario_id,
        destinatario,
        descricao_atividade,
        observacoes
    ) VALUES (
        'TESTE-REABILITACAO-' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'NOTIFICACAO',
        CURRENT_DATE,
        CURRENT_TIME,
        'Local de Teste Reabilitação',
        'Projeto Teste Reabilitação',
        'Fase Teste Reabilitação',
        test_user_id,
        'Destinatário Teste Reabilitação',
        'Atividade de Teste Reabilitação',
        'Teste após reabilitação do trigger'
    ) RETURNING id INTO test_termo_id;
    
    RAISE NOTICE '✅ Termo inserido com ID: %', test_termo_id;
    
    -- Aguardar um pouco para o trigger executar
    PERFORM pg_sleep(2);
    
    -- Verificar progresso depois
    SELECT COALESCE(SUM(pm.quantidade_atual), 0) INTO progresso_depois
    FROM progresso_metas pm
    JOIN metas m ON pm.meta_id = m.id
    WHERE m.tipo_meta = 'termo'
      AND pm.tma_id = test_user_id;
    
    RAISE NOTICE '📊 Progresso depois: % termos', progresso_depois;
    
    -- Verificar se houve mudança
    IF progresso_depois > progresso_antes THEN
        RAISE NOTICE '🎉 SUCESSO: Trigger reabilitado e funcionando! Progresso aumentou de % para %', progresso_antes, progresso_depois;
    ELSE
        RAISE NOTICE '❌ FALHA: Trigger ainda não funcionou. Progresso não mudou (% -> %)', progresso_antes, progresso_depois;
    END IF;
    
    -- Limpar o teste
    DELETE FROM termos_ambientais WHERE id = test_termo_id;
    RAISE NOTICE '🧹 Termo de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO NO TESTE: %', SQLERRM;
        
        -- Tentar limpar se possível
        IF test_termo_id IS NOT NULL THEN
            DELETE FROM termos_ambientais WHERE id = test_termo_id;
            RAISE NOTICE '🧹 Termo de teste removido após erro';
        END IF;
END $$;

-- 5. Verificar progresso final
SELECT 
    'PROGRESSO FINAL:' as status,
    pm.id,
    pm.meta_id,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade as meta_objetivo,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
  AND pm.tma_id = 'abb0e395-64aa-438c-94d6-1bf4c43f151a'
ORDER BY pm.ultima_atualizacao DESC; 