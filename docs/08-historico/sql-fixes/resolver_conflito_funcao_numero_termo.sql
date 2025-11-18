-- ===================================================================
-- RESOLVER CONFLITO FUNÇÃO NUMERO TERMO - ECOFIELD
-- Localização: sql/resolver_conflito_funcao_numero_termo.sql
-- ===================================================================

-- PROBLEMA: Conflito de sobrecarga (function overloading) na função gerar_proximo_numero_termo
-- SOLUÇÃO: Remover todas as versões e criar apenas uma versão definitiva

-- 1. REMOVER TODAS AS VERSÕES DA FUNÇÃO
-- ===================================================================
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo();
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo(text);
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo(character varying);
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo(varchar);

-- 2. CRIAR FUNÇÃO ÚNICA E DEFINITIVA
-- ===================================================================
CREATE OR REPLACE FUNCTION gerar_proximo_numero_termo(p_tipo_termo text DEFAULT NULL)
RETURNS VARCHAR AS $$
DECLARE
    ano_atual INTEGER;
    ultimo_numero INTEGER;
    proximo_numero VARCHAR;
    prefixo_tipo VARCHAR;
BEGIN
    SET search_path = public;
    
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Definir prefixo baseado no tipo do termo
    CASE p_tipo_termo
        WHEN 'PARALIZACAO_TECNICA' THEN
            prefixo_tipo := 'PT';
        WHEN 'NOTIFICACAO' THEN
            prefixo_tipo := 'NT';
        WHEN 'RECOMENDACAO' THEN
            prefixo_tipo := 'RC';
        ELSE
            prefixo_tipo := 'TM'; -- Termo genérico
    END CASE;
    
    -- Buscar o último número do ano atual para o tipo específico
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_termo FROM 9) AS INTEGER)), 0)
    INTO ultimo_numero
    FROM termos_ambientais
    WHERE numero_termo LIKE ano_atual || '-' || prefixo_tipo || '-%'
    AND (p_tipo_termo IS NULL OR tipo_termo = p_tipo_termo);
    
    -- Gerar próximo número com formato: ANO-TIPO-XXXX
    proximo_numero := ano_atual || '-' || prefixo_tipo || '-' || LPAD((ultimo_numero + 1)::TEXT, 4, '0');
    
    RETURN proximo_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CONCEDER PERMISSÕES
-- ===================================================================
GRANT EXECUTE ON FUNCTION gerar_proximo_numero_termo(text) TO authenticated;
GRANT EXECUTE ON FUNCTION gerar_proximo_numero_termo(text) TO service_role;

-- 4. VERIFICAR SE A FUNÇÃO FOI CRIADA CORRETAMENTE
-- ===================================================================
SELECT 
    'VERIFICAÇÃO FUNÇÃO' as info,
    proname as nome_funcao,
    proargtypes::regtype[] as tipos_parametros,
    prorettype::regtype as tipo_retorno
FROM pg_proc 
WHERE proname = 'gerar_proximo_numero_termo';

-- 5. TESTAR A FUNÇÃO
-- ===================================================================
DO $$
DECLARE
    numero_pt VARCHAR;
    numero_nt VARCHAR;
    numero_rc VARCHAR;
    numero_default VARCHAR;
BEGIN
    -- Testar para cada tipo
    SELECT gerar_proximo_numero_termo('PARALIZACAO_TECNICA') INTO numero_pt;
    SELECT gerar_proximo_numero_termo('NOTIFICACAO') INTO numero_nt;
    SELECT gerar_proximo_numero_termo('RECOMENDACAO') INTO numero_rc;
    SELECT gerar_proximo_numero_termo() INTO numero_default;
    
    RAISE NOTICE '✅ TESTE FUNÇÃO NUMERO TERMO:';
    RAISE NOTICE '   Paralização Técnica: %', numero_pt;
    RAISE NOTICE '   Notificação: %', numero_nt;
    RAISE NOTICE '   Recomendação: %', numero_rc;
    RAISE NOTICE '   Default: %', numero_default;
END $$;

-- 6. VERIFICAR TERMOS EXISTENTES
-- ===================================================================
SELECT 
    'TERMOS EXISTENTES' as tipo,
    tipo_termo,
    numero_termo,
    created_at
FROM termos_ambientais 
WHERE numero_termo IS NOT NULL
ORDER BY created_at DESC
LIMIT 10; 