-- ===================================================================
-- CORRIGIR FUNÇÃO GERAR PRÓXIMO NÚMERO TERMO - ECOFIELD
-- Localização: sql/corrigir_funcao_numero_termo.sql
-- ===================================================================

-- PROBLEMA: A função não aceita o parâmetro p_tipo_termo que é usado no frontend
-- SOLUÇÃO: Corrigir a função para aceitar o parâmetro e gerar números por tipo

-- 1. REMOVER FUNÇÃO ANTIGA
-- ===================================================================
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo();
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo(text);

-- 2. CRIAR FUNÇÃO CORRIGIDA
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

-- 4. TESTAR A FUNÇÃO
-- ===================================================================
DO $$
DECLARE
    numero_pt VARCHAR;
    numero_nt VARCHAR;
    numero_rc VARCHAR;
BEGIN
    -- Testar para cada tipo
    SELECT gerar_proximo_numero_termo('PARALIZACAO_TECNICA') INTO numero_pt;
    SELECT gerar_proximo_numero_termo('NOTIFICACAO') INTO numero_nt;
    SELECT gerar_proximo_numero_termo('RECOMENDACAO') INTO numero_rc;
    
    RAISE NOTICE '✅ TESTE FUNÇÃO NUMERO TERMO:';
    RAISE NOTICE '   Paralização Técnica: %', numero_pt;
    RAISE NOTICE '   Notificação: %', numero_nt;
    RAISE NOTICE '   Recomendação: %', numero_rc;
END $$;

-- 5. VERIFICAR TERMOS EXISTENTES
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

-- 6. VERIFICAR SE HÁ PROBLEMAS DE NUMERAÇÃO
-- ===================================================================
SELECT 
    'ANÁLISE NUMERAÇÃO' as tipo,
    tipo_termo,
    COUNT(*) as total_termos,
    COUNT(DISTINCT numero_termo) as numeros_unicos,
    MIN(numero_termo) as primeiro_numero,
    MAX(numero_termo) as ultimo_numero
FROM termos_ambientais 
WHERE numero_termo IS NOT NULL
GROUP BY tipo_termo
ORDER BY tipo_termo; 