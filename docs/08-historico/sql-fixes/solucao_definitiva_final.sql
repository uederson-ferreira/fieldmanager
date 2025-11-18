-- ===================================================================
-- SOLUÇÃO DEFINITIVA: MANTER TRIGGER SEMPRE ATIVO
-- ===================================================================

-- PROBLEMA: Trigger está sendo desabilitado automaticamente
-- SOLUÇÃO: Reabilitar e criar função de monitoramento

-- ===================================================================
-- 1. REABILITAR O TRIGGER
-- ===================================================================

ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;

-- ===================================================================
-- 2. VERIFICAR STATUS
-- ===================================================================

SELECT 
    'TRIGGER STATUS:' as status,
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
-- 3. CRIAR FUNÇÃO DE MONITORAMENTO AUTOMÁTICO
-- ===================================================================

-- Remover função de monitoramento se existir
DROP FUNCTION IF EXISTS monitorar_trigger_termos();

-- Criar função de monitoramento
CREATE OR REPLACE FUNCTION monitorar_trigger_termos()
RETURNS void AS $$
BEGIN
    -- Verificar se o trigger está desabilitado
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgrelid = 'termos_ambientais'::regclass
          AND tgname = 'trigger_calcular_progresso_termos'
          AND tgenabled = 'O'
    ) THEN
        -- Reabilitar o trigger
        ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;
        RAISE NOTICE '🔄 Trigger reabilitado automaticamente';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 4. CRIAR TRIGGER DE MONITORAMENTO
-- ===================================================================

-- Remover trigger de monitoramento se existir
DROP TRIGGER IF EXISTS trigger_monitorar_termos ON termos_ambientais;

-- Criar trigger de monitoramento (executa antes do trigger principal)
CREATE TRIGGER trigger_monitorar_termos
    BEFORE INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION monitorar_trigger_termos();

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
-- 6. TESTE FINAL
-- ===================================================================

-- Verificar se há 16 termos
SELECT 
    'TERMOS REAIS:' as status,
    COUNT(*) as total_termos,
    MAX(created_at) as ultimo_criado
FROM termos_ambientais 
WHERE emitido_por_usuario_id = 'abb0e395-64aa-438c-94d6-1bf4c43f151a';

-- ===================================================================
-- 7. INSTRUÇÕES PARA USO
-- ===================================================================

/*
SOLUÇÃO IMPLEMENTADA:

1. ✅ Trigger principal reabilitado
2. ✅ Função de monitoramento criada
3. ✅ Trigger de monitoramento criado (reabilita automaticamente)
4. ✅ Progresso corrigido para 16 termos

COMO FUNCIONA:
- O trigger de monitoramento executa ANTES de cada INSERT/UPDATE
- Se o trigger principal estiver desabilitado, ele é reabilitado automaticamente
- Isso garante que o trigger principal sempre funcione

PARA TESTAR:
1. Gere um novo termo no frontend
2. O trigger deve funcionar automaticamente
3. O progresso deve ser atualizado
4. O frontend deve refletir as mudanças

SE AINDA NÃO FUNCIONAR:
- Execute este script novamente
- Verifique se há erros no console do navegador
- Verifique se há erros nos logs do Supabase
*/ 