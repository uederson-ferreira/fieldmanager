-- ===================================================================
-- CORRIGIR ATRIBUIÇÕES INDIVIDUAIS COM meta_quantidade_individual NULL
-- ===================================================================

-- PROBLEMA: Atribuições individuais têm meta_quantidade_individual = NULL
-- SOLUÇÃO: Atualizar com os valores corretos das metas

-- 1. Verificar atribuições problemáticas
SELECT 
    'ATRIBUIÇÕES PROBLEMÁTICAS:' as status,
    ma.id,
    ma.meta_id,
    ma.tma_id,
    ma.meta_quantidade_individual,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade as meta_original
FROM metas_atribuicoes ma
JOIN metas m ON ma.meta_id = m.id
WHERE m.tipo_meta = 'termo'
  AND ma.meta_quantidade_individual IS NULL
ORDER BY ma.tma_id;

-- 2. Corrigir atribuições individuais
UPDATE metas_atribuicoes 
SET meta_quantidade_individual = (
    SELECT m.meta_quantidade 
    FROM metas m 
    WHERE m.id = metas_atribuicoes.meta_id
)
WHERE meta_quantidade_individual IS NULL
  AND meta_id IN (
    SELECT id FROM metas WHERE tipo_meta = 'termo'
  );

-- 3. Verificar se foi corrigido
SELECT 
    'ATRIBUIÇÕES CORRIGIDAS:' as status,
    ma.id,
    ma.meta_id,
    ma.tma_id,
    ma.meta_quantidade_individual,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade as meta_original
FROM metas_atribuicoes ma
JOIN metas m ON ma.meta_id = m.id
WHERE m.tipo_meta = 'termo'
ORDER BY ma.tma_id;

-- 4. Forçar recálculo do progresso para o usuário
DO $$
DECLARE
    user_id UUID := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
    total_termos INTEGER;
BEGIN
    -- Contar termos do usuário
    SELECT COUNT(*) INTO total_termos
    FROM termos_ambientais 
    WHERE emitido_por_usuario_id = user_id;
    
    RAISE NOTICE '🔄 FORÇANDO RECÁLCULO PARA USUÁRIO: %', user_id;
    RAISE NOTICE '📊 TOTAL DE TERMOS: %', total_termos;
    
    -- Simular inserção de um termo para forçar recálculo
    -- (não vamos inserir de verdade, só verificar se o trigger funciona agora)
    RAISE NOTICE '✅ Atribuições corrigidas. Agora teste criar um termo no frontend!';
    
    -- Verificar progresso atual
    SELECT 
        'PROGRESSO ATUAL:' as status,
        pm.id,
        pm.meta_id,
        m.tipo_meta,
        m.escopo,
        pm.tma_id,
        pm.quantidade_atual,
        pm.percentual_alcancado,
        pm.status
    FROM progresso_metas pm
    JOIN metas m ON pm.meta_id = m.id
    WHERE m.tipo_meta = 'termo'
      AND pm.tma_id = user_id
    ORDER BY pm.ultima_atualizacao DESC;
    
END $$;

-- 5. Verificar se há progresso registrado
SELECT 
    'PROGRESSO FINAL:' as status,
    pm.id,
    pm.meta_id,
    m.tipo_meta,
    m.escopo,
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