-- ================================================================
-- LIMPAR DADOS - FIELDMANAGER v2.0
-- Remove todos os dados do banco (mantém estrutura)
-- ================================================================

-- ATENÇÃO: Este script APAGA TODOS OS DADOS!
-- Use apenas em ambiente de desenvolvimento

-- Ordem correta: primeiro as tabelas dependentes, depois as principais

-- 1. Limpar perguntas e execuções
TRUNCATE TABLE perguntas_modulos CASCADE;
TRUNCATE TABLE execucoes_respostas CASCADE;
TRUNCATE TABLE execucoes_fotos CASCADE;
TRUNCATE TABLE execucoes CASCADE;

-- 2. Limpar módulos
TRUNCATE TABLE modulos_sistema CASCADE;

-- 3. Limpar tenants e relacionamentos
TRUNCATE TABLE tenants_dominios CASCADE;
TRUNCATE TABLE usuarios CASCADE;
TRUNCATE TABLE tenants CASCADE;

-- 4. Limpar domínios
TRUNCATE TABLE dominios CASCADE;

-- 5. Limpar perfis
TRUNCATE TABLE perfis CASCADE;

-- Verificação
SELECT
  'Perfis:' as tabela, COUNT(*) as registros FROM perfis
UNION ALL
SELECT 'Domínios:', COUNT(*) FROM dominios
UNION ALL
SELECT 'Tenants:', COUNT(*) FROM tenants
UNION ALL
SELECT 'Usuários:', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Módulos:', COUNT(*) FROM modulos_sistema
UNION ALL
SELECT 'Perguntas:', COUNT(*) FROM perguntas_modulos;

-- ✅ Banco limpo! Agora execute o seed-database.sql
