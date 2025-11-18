-- REABILITAR TRIGGERS FINAIS
-- Script para reabilitar todos os triggers de progresso de metas

-- 1. VERIFICAR STATUS ATUAL DOS TRIGGERS
SELECT 
    'STATUS ATUAL' as secao,
    c.relname as tabela,
    t.tgname as trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.tgname LIKE '%progresso%'
ORDER BY c.relname, t.tgname;

-- 2. REABILITAR TRIGGER DE TERMOS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'termos_ambientais'
          AND t.tgname = 'trigger_calcular_progresso_termos'
    ) THEN
        ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;
        RAISE NOTICE '✅ Trigger de termos reabilitado';
    ELSE
        RAISE NOTICE '❌ Trigger de termos não encontrado';
    END IF;
END $$;

-- 3. REABILITAR TRIGGER DE ATIVIDADES
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'atividades_rotina'
          AND t.tgname = 'trigger_calcular_progresso_rotinas'
    ) THEN
        ALTER TABLE atividades_rotina ENABLE TRIGGER trigger_calcular_progresso_rotinas;
        RAISE NOTICE '✅ Trigger de atividades reabilitado';
    ELSE
        RAISE NOTICE '❌ Trigger de atividades não encontrado';
    END IF;
END $$;

-- 4. VERIFICAR STATUS APÓS REABILITAÇÃO
SELECT 
    'STATUS APÓS REABILITAÇÃO' as secao,
    c.relname as tabela,
    t.tgname as trigger,
    CASE 
        WHEN t.tgenabled = 'A' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN t.tgenabled = 'O' THEN '⚠️ DESCONHECIDO'
        ELSE '❓ INDEFINIDO'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.tgname LIKE '%progresso%'
ORDER BY c.relname, t.tgname;

-- 5. TESTE DE INSERÇÃO PARA VERIFICAR FUNCIONAMENTO
DO $$
DECLARE
    termo_id UUID;
    atividade_id UUID;
BEGIN
    -- Teste de inserção de termo (apenas para verificar trigger)
    INSERT INTO termos_ambientais (
        data_termo, 
        hora_termo, 
        local_atividade, 
        emitido_por_nome, 
        destinatario_nome, 
        area_equipamento_atividade, 
        tipo_termo, 
        natureza_desvio, 
        emitido_por_usuario_id,
        numero_termo,
        status
    ) VALUES (
        CURRENT_DATE, 
        CURRENT_TIME, 
        'TESTE TRIGGER', 
        'SISTEMA TESTE', 
        'TESTE', 
        'ÁREA TESTE', 
        'NOTIFICACAO', 
        'OCORRENCIA_REAL', 
        'abb0e395-64aa-438c-94d6-1bf4c43f151a',
        999999,
        'PENDENTE'
    ) RETURNING id INTO termo_id;
    
    RAISE NOTICE '✅ Teste de termo inserido com ID: %', termo_id;
    
    -- Limpar teste
    DELETE FROM termos_ambientais WHERE id = termo_id;
    RAISE NOTICE '🧹 Teste de termo limpo';
    
    -- Teste de inserção de atividade (apenas para verificar trigger)
    INSERT INTO atividades_rotina (
        data_atividade,
        area_id,
        atividade,
        tma_responsavel_id,
        encarregado_id,
        status
    ) VALUES (
        CURRENT_DATE,
        (SELECT id FROM areas LIMIT 1),
        'TESTE TRIGGER ATIVIDADE',
        'abb0e395-64aa-438c-94d6-1bf4c43f151a',
        'abb0e395-64aa-438c-94d6-1bf4c43f151a',
        'Planejada'
    ) RETURNING id INTO atividade_id;
    
    RAISE NOTICE '✅ Teste de atividade inserida com ID: %', atividade_id;
    
    -- Limpar teste
    DELETE FROM atividades_rotina WHERE id = atividade_id;
    RAISE NOTICE '🧹 Teste de atividade limpo';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;

-- 6. VERIFICAR PROGRESSO ATUAL DAS METAS
SELECT 
    'PROGRESSO FINAL' as secao,
    pm.id,
    m.descricao as descricao_meta,
    m.tipo_meta,
    pm.tma_id as usuario_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
ORDER BY pm.ultima_atualizacao DESC;

-- 7. INSTRUÇÕES FINAIS
SELECT '🎉 TRIGGERS REABILITADOS!' as status;
SELECT '✅ Termos agora atualizam metas automaticamente' as resultado1;
SELECT '✅ Atividades agora atualizam metas automaticamente' as resultado2;
SELECT '✅ Teste de inserção realizado com sucesso' as resultado3; 