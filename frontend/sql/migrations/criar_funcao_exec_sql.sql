-- ===================================================================
-- CRIAR FUNÇÃO PARA EXECUTAR SQL DINAMICAMENTE
-- ===================================================================

-- Função para executar SQL dinamicamente (apenas para desenvolvimento)
CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_text;
  RETURN 'SQL executado com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Erro: ' || SQLERRM;
END;
$$;

-- Comentário sobre segurança
COMMENT ON FUNCTION exec_sql(text) IS 'Função para executar SQL dinamicamente - APENAS PARA DESENVOLVIMENTO'; 