-- Diagnóstico final da contabilização automática
-- Execute após gerar um termo para verificar se funcionou

-- 1. Verificar termos mais recentes
SELECT 
    id,
    emitido_por_usuario_id,
    data_termo,
    EXTRACT(YEAR FROM data_termo) as ano,
    EXTRACT(MONTH FROM data_termo) as mes,
    created_at
FROM termos_ambientais
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar metas ativas
SELECT 
    m.id,
    m.descricao,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade,
    m.ano,
    m.mes,
    ma.meta_quantidade_individual,
    ma.tma_id
FROM metas m
LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id
WHERE m.ativa = true
AND m.tipo_meta = 'termo'
ORDER BY m.escopo, m.descricao;

-- 3. Verificar progresso atual
SELECT 
    pm.meta_id,
    m.descricao,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
ORDER BY pm.ultima_atualizacao DESC;

-- 4. Contar termos por usuário no período atual
SELECT 
    emitido_por_usuario_id,
    COUNT(*) as total_termos,
    EXTRACT(YEAR FROM data_termo) as ano,
    EXTRACT(MONTH FROM data_termo) as mes
FROM termos_ambientais
WHERE EXTRACT(YEAR FROM data_termo) = EXTRACT(YEAR FROM NOW())
AND EXTRACT(MONTH FROM data_termo) = EXTRACT(MONTH FROM NOW())
GROUP BY emitido_por_usuario_id, EXTRACT(YEAR FROM data_termo), EXTRACT(MONTH FROM data_termo);

-- 5. Verificar se a função está correta
SELECT 
    proname as function_name,
    prosrc
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas'; 