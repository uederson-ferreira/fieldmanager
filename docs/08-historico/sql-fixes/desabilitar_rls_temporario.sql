-- ===================================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
-- ===================================================================
-- ⚠️ ATENÇÃO: Este script desabilita o RLS temporariamente para teste
-- Execute apenas em ambiente de desenvolvimento

-- 1. Desabilitar RLS nas tabelas de metas
ALTER TABLE metas DISABLE ROW LEVEL SECURITY;
ALTER TABLE metas_atribuicoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_metas DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_metas DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('metas', 'metas_atribuicoes', 'progresso_metas', 'configuracoes_metas');

-- 3. Teste de inserção
INSERT INTO metas (tipo_meta, categoria, periodo, ano, mes, meta_quantidade, descricao, escopo, ativa, criada_por)
VALUES ('lv', 'teste', 'mensal', 2025, 2, 10, 'Meta de teste - RLS desabilitado', 'equipe', true, '0b30c325-abfe-45a4-b1f5-a65243c0e3d8');

-- 4. Verificar inserção
SELECT * FROM metas WHERE descricao LIKE '%teste%';

-- 5. Limpar teste
DELETE FROM metas WHERE descricao LIKE '%teste%';

-- ===================================================================
-- PARA REABILITAR O RLS (execute após os testes):
-- ===================================================================
/*
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_atribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_metas ENABLE ROW LEVEL SECURITY;
*/ 