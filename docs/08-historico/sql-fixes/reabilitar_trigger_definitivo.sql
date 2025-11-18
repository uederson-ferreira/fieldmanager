-- ===================================================================
-- REABILITAR TRIGGER DEFINITIVAMENTE
-- ===================================================================

-- PROBLEMA: Trigger está sendo desabilitado automaticamente
-- SOLUÇÃO: Reabilitar e investigar a causa

-- ===================================================================
-- 1. VERIFICAR STATUS ATUAL
-- ===================================================================

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

-- ===================================================================
-- 2. REABILITAR O TRIGGER
-- ===================================================================

ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;

-- ===================================================================
-- 3. VERIFICAR SE FOI REABILITADO
-- ===================================================================

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

-- ===================================================================
-- 4. VERIFICAR SE A FUNÇÃO ESTÁ CORRETA
-- ===================================================================

SELECT 
    'FUNÇÃO STATUS:' as status,
    proname as nome_funcao,
    prosrc IS NOT NULL as tem_codigo,
    CASE 
        WHEN prosrc LIKE '%EXCEPTION%' THEN '✅ COM TRATAMENTO DE ERRO'
        ELSE '⚠️ SEM TRATAMENTO DE ERRO'
    END as tratamento_erro
FROM pg_proc 
WHERE proname = 'calcular_progresso_metas';

-- ===================================================================
-- 5. VERIFICAR PROGRESSO ATUAL
-- ===================================================================

SELECT 
    'PROGRESSO ATUAL:' as status,
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

-- ===================================================================
-- 6. TESTE RÁPIDO: INSERIR TERMO DE TESTE
-- ===================================================================

-- Verificar progresso antes do teste
SELECT 
    'PROGRESSO ANTES DO TESTE:' as status,
    SUM(pm.quantidade_atual) as total_termos_progresso
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
  AND pm.tma_id = 'abb0e395-64aa-438c-94d6-1bf4c43f151a';

-- Inserir termo de teste
INSERT INTO termos_ambientais (
    numero_termo,
    tipo_termo,
    data_termo,
    hora_termo,
    emitido_por_usuario_id,
    created_at,
    updated_at
) VALUES (
    'TESTE-001',
    'teste',
    CURRENT_DATE,
    CURRENT_TIME,
    'abb0e395-64aa-438c-94d6-1bf4c43f151a',
    NOW(),
    NOW()
);

-- Verificar progresso após o teste
SELECT 
    'PROGRESSO APÓS TESTE:' as status,
    SUM(pm.quantidade_atual) as total_termos_progresso
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
WHERE m.tipo_meta = 'termo'
  AND pm.tma_id = 'abb0e395-64aa-438c-94d6-1bf4c43f151a';

-- Remover termo de teste
DELETE FROM termos_ambientais 
WHERE numero_termo = 'TESTE-001';

-- ===================================================================
-- 7. VERIFICAR STATUS FINAL DO TRIGGER
-- ===================================================================

SELECT 
    'STATUS FINAL DO TRIGGER:' as status,
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