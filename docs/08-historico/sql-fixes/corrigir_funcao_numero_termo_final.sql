-- ===================================================================
-- CORRIGIR FUNÇÃO NÚMERO TERMO - ECOFIELD
-- Localização: sql/corrigir_funcao_numero_termo_final.sql
-- ===================================================================

-- Este script corrige a função gerar_proximo_numero_termo

-- ===================================================================
-- 1. VERIFICAR FUNÇÃO ATUAL
-- ===================================================================

SELECT 
  'FUNÇÃO ATUAL' as info,
  proname as nome_funcao,
  proargtypes::regtype[] as tipos_parametros,
  prorettype::regtype as tipo_retorno
FROM pg_proc 
WHERE proname = 'gerar_proximo_numero_termo';

-- ===================================================================
-- 2. VERIFICAR DADOS EXISTENTES
-- ===================================================================

SELECT 
  'DADOS EXISTENTES' as info,
  COUNT(*) as total_termos,
  COUNT(CASE WHEN numero_termo IS NOT NULL THEN 1 END) as com_numero,
  COUNT(CASE WHEN numero_termo IS NULL THEN 1 END) as sem_numero
FROM termos_ambientais;

-- ===================================================================
-- 3. VERIFICAR ÚLTIMOS NÚMEROS
-- ===================================================================

SELECT 
  'ÚLTIMOS NÚMEROS' as info,
  numero_termo,
  tipo_termo,
  created_at
FROM termos_ambientais 
WHERE numero_termo IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- ===================================================================
-- 4. REMOVER FUNÇÃO ANTIGA
-- ===================================================================

DROP FUNCTION IF EXISTS gerar_proximo_numero_termo(text);
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo(character varying);
DROP FUNCTION IF EXISTS gerar_proximo_numero_termo();

-- ===================================================================
-- 5. CRIAR FUNÇÃO CORRIGIDA
-- ===================================================================

CREATE OR REPLACE FUNCTION gerar_proximo_numero_termo(p_tipo_termo text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    proximo_numero integer;
    ano_atual text;
    prefixo text;
    numero_formatado text;
BEGIN
    -- Obter ano atual
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE)::text;
    
    -- Definir prefixo baseado no tipo
    CASE p_tipo_termo
        WHEN 'NOTIFICACAO' THEN prefixo := 'NT';
        WHEN 'PARALIZACAO_TECNICA' THEN prefixo := 'PT';
        WHEN 'RECOMENDACAO' THEN prefixo := 'RC';
        ELSE prefixo := 'NT'; -- Padrão
    END CASE;
    
    -- Buscar o próximo número sequencial para o tipo e ano
    SELECT COALESCE(MAX(
        CASE 
            WHEN numero_termo ~ ('^' || ano_atual || '-' || prefixo || '-[0-9]+$') 
            THEN CAST(SUBSTRING(numero_termo FROM LENGTH(ano_atual || '-' || prefixo || '-') + 1) AS integer)
            ELSE 0
        END
    ), 0) + 1
    INTO proximo_numero
    FROM termos_ambientais
    WHERE numero_termo IS NOT NULL
    AND numero_termo LIKE (ano_atual || '-' || prefixo || '-%');
    
    -- Formatar o número com zeros à esquerda
    numero_formatado := ano_atual || '-' || prefixo || '-' || LPAD(proximo_numero::text, 4, '0');
    
    RETURN numero_formatado;
END;
$$;

-- ===================================================================
-- 6. TESTAR FUNÇÃO
-- ===================================================================

SELECT 
  'TESTE FUNÇÃO' as info,
  gerar_proximo_numero_termo('NOTIFICACAO') as proximo_nt,
  gerar_proximo_numero_termo('PARALIZACAO_TECNICA') as proximo_pt,
  gerar_proximo_numero_termo('RECOMENDACAO') as proximo_rc;

-- ===================================================================
-- 7. VERIFICAR FUNÇÃO CRIADA
-- ===================================================================

SELECT 
  'FUNÇÃO CRIADA' as info,
  proname as nome_funcao,
  proargtypes::regtype[] as tipos_parametros,
  prorettype::regtype as tipo_retorno
FROM pg_proc 
WHERE proname = 'gerar_proximo_numero_termo'; 