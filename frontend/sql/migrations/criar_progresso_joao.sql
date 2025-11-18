-- Script para criar progresso da meta individual do João
-- Execute este script se não houver progresso registrado

-- 1. Inserir progresso inicial para a meta individual do João
INSERT INTO progresso_metas (
    meta_id,
    tma_id,
    periodo,
    ano,
    mes,
    quantidade_atual,
    percentual_alcancado,
    status,
    ultima_atualizacao
) VALUES (
    'e1a06c3d-0424-40b5-ba07-af554572c44f',  -- ID da meta individual
    'abb0e395-64aa-438c-94d6-1bf4c43f151a',  -- ID do João
    'mensal',  -- período
    2025,  -- ano
    7,  -- mês
    0,  -- quantidade atual
    0.0,  -- percentual alcançado
    'em_andamento',  -- status
    NOW()  -- última atualização
);

-- 2. Verificar se foi criado
SELECT 
    pm.id as progresso_id,
    pm.meta_id,
    pm.tma_id,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao,
    m.descricao as meta_descricao,
    u.nome as usuario_nome
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE pm.meta_id = 'e1a06c3d-0424-40b5-ba07-af554572c44f' 
  AND pm.tma_id = 'abb0e395-64aa-438c-94d6-1bf4c43f151a'; 