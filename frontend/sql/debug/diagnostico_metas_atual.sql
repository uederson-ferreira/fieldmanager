-- ===================================================================
-- DIAGNÓSTICO E CORREÇÃO - METAS NÃO ATUALIZAM APÓS CRIAR TERMO
-- ===================================================================

-- 1. VERIFICAR SE OS TRIGGERS ESTÃO ATIVOS
SELECT '=== VERIFICAR TRIGGERS ===' as info;

SELECT 
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgenabled as ativo,
    CASE 
        WHEN tgenabled = 't' THEN '✅ ATIVO'
        WHEN tgenabled = 'f' THEN '❌ DESATIVADO'
        ELSE '⚠️ DESCONHECIDO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'termos_ambientais'::regclass
  AND tgname LIKE '%calcular_progresso%';

-- 2. VERIFICAR SE A FUNÇÃO EXISTE
SELECT '=== VERIFICAR FUNÇÃO ===' as info;

SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'calcular_progresso_metas' THEN '✅ FUNÇÃO EXISTE'
        ELSE '❌ FUNÇÃO NÃO ENCONTRADA'
    END as status_funcao
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- 3. VERIFICAR METAS ATIVAS PARA TERMOS
SELECT '=== METAS ATIVAS PARA TERMOS ===' as info;

SELECT 
    id,
    descricao,
    tipo_meta,
    escopo,
    meta_quantidade,
    periodo,
    ano,
    mes,
    ativa,
    created_at
FROM metas 
WHERE tipo_meta = 'termo' 
  AND ativa = true
  AND ano = EXTRACT(YEAR FROM CURRENT_DATE)
  AND mes = EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY created_at DESC;

-- 4. VERIFICAR ATRIBUIÇÕES DE METAS
SELECT '=== ATRIBUIÇÕES DE METAS ===' as info;

SELECT 
    ma.id,
    ma.meta_id,
    ma.tma_id,
    ma.meta_quantidade_individual,
    m.descricao as meta_descricao,
    m.tipo_meta,
    m.escopo,
    m.ativa,
    u.nome as tma_nome,
    u.email as tma_email
FROM metas_atribuicoes ma
JOIN metas m ON ma.meta_id = m.id
LEFT JOIN usuarios u ON ma.tma_id = u.id
WHERE m.tipo_meta = 'termo'
  AND m.ativa = true
ORDER BY ma.created_at DESC;

-- 5. VERIFICAR PROGRESSO ATUAL
SELECT '=== PROGRESSO ATUAL ===' as info;

SELECT 
    pm.id,
    pm.meta_id,
    pm.tma_id,
    pm.periodo,
    pm.ano,
    pm.mes,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    pm.ultima_atualizacao,
    m.descricao as meta_descricao,
    m.meta_quantidade,
    u.nome as tma_nome
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE m.tipo_meta = 'termo'
ORDER BY pm.ultima_atualizacao DESC;

-- 6. VERIFICAR TERMOS MAIS RECENTES
SELECT '=== TERMOS MAIS RECENTES ===' as info;

SELECT 
    id,
    numero_termo,
    tipo_termo,
    data_termo,
    emitido_por_usuario_id,
    created_at
FROM termos_ambientais 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. CONTAR TERMOS POR USUÁRIO NO MÊS ATUAL
SELECT '=== TERMOS POR USUÁRIO (MÊS ATUAL) ===' as info;

SELECT 
    ta.emitido_por_usuario_id,
    u.nome as usuario_nome,
    u.email as usuario_email,
    COUNT(*) as total_termos,
    MIN(ta.data_termo) as primeiro_termo,
    MAX(ta.data_termo) as ultimo_termo
FROM termos_ambientais ta
LEFT JOIN usuarios u ON ta.emitido_por_usuario_id = u.id
WHERE EXTRACT(YEAR FROM ta.data_termo) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM ta.data_termo) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY ta.emitido_por_usuario_id, u.nome, u.email
ORDER BY total_termos DESC;

-- 8. VERIFICAR SE HÁ PROBLEMAS DE CONSTRAINT
SELECT '=== VERIFICAR CONSTRAINTS ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'progresso_metas'
  AND tc.constraint_type = 'UNIQUE';

-- 9. TESTE MANUAL DE CONTABILIZAÇÃO
SELECT '=== TESTE MANUAL DE CONTABILIZAÇÃO ===' as info;

-- Contar termos do usuário mais ativo
WITH usuario_mais_ativo AS (
    SELECT ta.emitido_por_usuario_id
    FROM termos_ambientais ta
    WHERE EXTRACT(YEAR FROM ta.data_termo) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND EXTRACT(MONTH FROM ta.data_termo) = EXTRACT(MONTH FROM CURRENT_DATE)
    GROUP BY ta.emitido_por_usuario_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
)
SELECT 
    'USUÁRIO MAIS ATIVO:' as tipo,
    u.id,
    u.nome,
    u.email,
    COUNT(ta.id) as total_termos_mes
FROM usuario_mais_ativo uma
JOIN usuarios u ON uma.emitido_por_usuario_id = u.id
JOIN termos_ambientais ta ON u.id = ta.emitido_por_usuario_id
WHERE EXTRACT(YEAR FROM ta.data_termo) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM ta.data_termo) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY u.id, u.nome, u.email;

-- 10. VERIFICAR LOGS DE ERRO (se existir tabela de logs)
SELECT '=== VERIFICAR LOGS ===' as info;

-- Tentar verificar se há tabela de logs
SELECT 
    table_name,
    'TABELA DE LOGS ENCONTRADA' as status
FROM information_schema.tables 
WHERE table_name LIKE '%log%' 
  AND table_schema = 'public'; 