-- ===================================================================
-- DIAGNÓSTICO: VERIFICAR SE TRIGGER DE TERMOS ESTÁ FUNCIONANDO
-- ===================================================================

-- 1. Verificar se o trigger existe
SELECT 
    'TRIGGER TERMOS:' as status,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgenabled as ativo,
    tgtype,
    tgfoid::regproc as funcao
FROM pg_trigger 
WHERE tgrelid = 'termos_ambientais'::regclass
  AND tgname LIKE '%calcular_progresso%';

-- 2. Verificar se a função existe
SELECT 
    'FUNÇÃO:' as status,
    proname as nome_funcao,
    prosrc IS NOT NULL as tem_codigo
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- 3. Verificar metas de termos ativas
SELECT 
    'METAS TERMOS:' as status,
    id,
    tipo_meta,
    periodo,
    ano,
    mes,
    meta_quantidade,
    escopo,
    ativa
FROM metas 
WHERE tipo_meta = 'termo' 
  AND ativa = true
ORDER BY ano DESC, mes DESC;

-- 4. Verificar progresso existente para termos
SELECT 
    'PROGRESSO TERMOS:' as status,
    pm.id,
    pm.meta_id,
    m.tipo_meta,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
ORDER BY pm.ultima_atualizacao DESC;

-- 5. Verificar termos existentes
SELECT 
    'TERMOS EXISTENTES:' as status,
    COUNT(*) as total_termos,
    COUNT(DISTINCT emitido_por_usuario_id) as usuarios_diferentes,
    MIN(data_termo) as primeiro_termo,
    MAX(data_termo) as ultimo_termo
FROM termos_ambientais;

-- 6. Teste: Tentar inserir um termo de teste
DO $$
DECLARE
    test_user_id UUID;
    test_termo_id UUID;
BEGIN
    -- Pegar um usuário existente
    SELECT id INTO test_user_id FROM usuarios LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '🧪 TESTE: Inserindo termo de teste para usuário %', test_user_id;
        
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
            'TESTE-TRIGGER-' || EXTRACT(EPOCH FROM NOW())::TEXT,
            'NOTIFICACAO',
            CURRENT_DATE,
            CURRENT_TIME,
            'Local de Teste Trigger',
            'Projeto Teste Trigger',
            'Fase Teste Trigger',
            test_user_id,
            'Destinatário Teste Trigger',
            'Atividade de Teste Trigger',
            'Teste para verificar se trigger funciona'
        ) RETURNING id INTO test_termo_id;
        
        RAISE NOTICE '✅ TESTE: Termo inserido com ID %', test_termo_id;
        
        -- Verificar se o progresso foi atualizado
        SELECT 
            'PROGRESSO APÓS TESTE:' as status,
            pm.id,
            pm.meta_id,
            m.tipo_meta,
            pm.tma_id,
            pm.quantidade_atual,
            pm.percentual_alcancado,
            pm.status,
            pm.ultima_atualizacao
        FROM progresso_metas pm
        JOIN metas m ON pm.meta_id = m.id
        WHERE m.tipo_meta = 'termo'
          AND pm.tma_id = test_user_id
        ORDER BY pm.ultima_atualizacao DESC;
        
        -- Limpar o teste
        DELETE FROM termos_ambientais WHERE id = test_termo_id;
        RAISE NOTICE '🧹 TESTE: Termo de teste removido';
        
    ELSE
        RAISE NOTICE '❌ TESTE: Nenhum usuário encontrado para teste';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ TESTE: ERRO AO TESTAR TRIGGER: %', SQLERRM;
END $$; 