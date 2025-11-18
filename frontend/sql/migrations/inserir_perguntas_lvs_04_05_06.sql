-- ===================================================================
-- SCRIPT SQL PARA INSERIR PERGUNTAS DAS LVs 04, 05 e 06
-- EcoField System - Produtos Químicos, Comboio e Gerador
-- ===================================================================

-- 1. VERIFICAR E INSERIR CATEGORIAS
-- ===================================================================

-- Verificar se categoria 04 (Produtos Químicos) existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '04') THEN
    INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
    VALUES ('04', 'PRODUTOS QUÍMICOS', 'Gestão e segurança de produtos químicos, FISPQ, armazenamento e emergências', true, 4, NOW(), NOW());
    RAISE NOTICE 'Categoria 04 inserida';
  ELSE
    RAISE NOTICE 'Categoria 04 já existe';
  END IF;
END $$;

-- Verificar se categoria 05 (Comboio) existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '05') THEN
    INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
    VALUES ('05', 'COMBOIO', 'Gestão de comboios, documentação, segurança e equipamentos de transporte', true, 5, NOW(), NOW());
    RAISE NOTICE 'Categoria 05 inserida';
  ELSE
    RAISE NOTICE 'Categoria 05 já existe';
  END IF;
END $$;

-- Verificar se categoria 06 (Gerador) existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '06') THEN
    INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
    VALUES ('06', 'GERADOR', 'Gestão de geradores de energia, segurança e manutenção', true, 6, NOW(), NOW());
    RAISE NOTICE 'Categoria 06 inserida';
  ELSE
    RAISE NOTICE 'Categoria 06 já existe';
  END IF;
END $$;

-- 2. VERIFICAR E INSERIR VERSÃO (se não existir)
-- ===================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM versoes_lv WHERE nome = 'Revisão 09') THEN
    INSERT INTO versoes_lv (nome, descricao, data_revisao, ativa, created_at, updated_at)
    VALUES ('Revisão 09', 'Versão atualizada das Listas de Verificação Ambiental', '2023-05-01', true, NOW(), NOW());
    RAISE NOTICE 'Versão Revisão 09 inserida';
  ELSE
    RAISE NOTICE 'Versão Revisão 09 já existe';
  END IF;
END $$;

-- 3. LIMPAR PERGUNTAS E CONFIGURAÇÕES EXISTENTES
-- ===================================================================

-- Limpar perguntas existentes das LVs 04, 05 e 06
DELETE FROM perguntas_lv WHERE codigo LIKE '04.%' OR codigo LIKE '05.%' OR codigo LIKE '06.%';

-- Limpar configurações existentes das LVs 04, 05 e 06
DELETE FROM lv_configuracoes WHERE tipo_lv IN ('04', '05', '06');

-- 4. INSERIR PERGUNTAS E CONFIGURAÇÕES
-- ===================================================================

DO $$
DECLARE
  cat_produtos_id UUID;
  cat_comboio_id UUID;
  cat_gerador_id UUID;
  versao_id UUID;
BEGIN
  -- Obter IDs
  SELECT id INTO cat_produtos_id FROM categorias_lv WHERE codigo = '04';
  SELECT id INTO cat_comboio_id FROM categorias_lv WHERE codigo = '05';
  SELECT id INTO cat_gerador_id FROM categorias_lv WHERE codigo = '06';
  SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 09';
  
  -- 4.1 INSERIR PERGUNTAS PRODUTOS QUÍMICOS (04)
  INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at)
  VALUES 
    ('04.01', 'É disponibilizada FISPQ (atualizada) dos produtos armazenados?', cat_produtos_id, versao_id, 1, true, true, NOW(), NOW()),
    ('04.02', 'Existe evidência do treinamento na FISPQ dos produtos químicos?', cat_produtos_id, versao_id, 2, true, true, NOW(), NOW()),
    ('04.03', 'Existe contenção, cobertura, identificação e sinalização de risco (pictogramas) nos locais de armazenamento?', cat_produtos_id, versao_id, 3, true, true, NOW(), NOW()),
    ('04.04', 'É disponibilizado equipamentos/recursos para atendimento a emergências ambientais (kit de mitigação) e combate a incêndios no local?', cat_produtos_id, versao_id, 4, true, true, NOW(), NOW()),
    ('04.05', 'O armazenamento de produtos químicos possui identificação (carômetro) de quem é autorizado a acessar o local?', cat_produtos_id, versao_id, 5, true, true, NOW(), NOW()),
    ('04.06', 'Existe produto químico fracionado? Caso positivo, verificar se possui rotulagem secundária/e se está conforme orientações da FISPQ e com os pictogramas de perigo do GHS.', cat_produtos_id, versao_id, 6, true, true, NOW(), NOW()),
    ('04.07', 'Existe bacia de contenção com capacidade adequada para o volume armazenado com segurança contra derramamentos?', cat_produtos_id, versao_id, 7, true, true, NOW(), NOW()),
    ('04.08', 'Existem vazamentos de produtos químicos na área?', cat_produtos_id, versao_id, 8, true, true, NOW(), NOW()),
    ('04.09', 'O inventário dos produtos químicos é disponibilizado?', cat_produtos_id, versao_id, 9, true, true, NOW(), NOW());
  
  RAISE NOTICE '9 perguntas Produtos Químicos inseridas';
  
  -- 4.2 INSERIR PERGUNTAS COMBOIO (05)
  INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at)
  VALUES 
    ('05.01', 'O motorista está portando CNH, MOPP, CIPP, CIV e LO?', cat_comboio_id, versao_id, 1, true, true, NOW(), NOW()),
    ('05.02', 'O caminhão possui sinalização de Segurança (Rótulo de risco, Painel de Segurança e Pictograma)?', cat_comboio_id, versao_id, 2, true, true, NOW(), NOW()),
    ('05.03', 'O caminhão possui Kit de Emergência Ambiental?', cat_comboio_id, versao_id, 3, true, true, NOW(), NOW()),
    ('05.04', 'É disponibilizado checklist do comboio?', cat_comboio_id, versao_id, 4, true, true, NOW(), NOW()),
    ('05.05', 'É disponibilizado Ficha de Emergência para o transporte dos produtos?', cat_comboio_id, versao_id, 5, true, true, NOW(), NOW()),
    ('05.06', 'É disponibilizado Envelope Cinza/Amarelo com todos os contatos de Emergência?', cat_comboio_id, versao_id, 6, true, true, NOW(), NOW()),
    ('05.07', 'O equipamento está livre de vazamento dos produtos?', cat_comboio_id, versao_id, 7, true, true, NOW(), NOW()),
    ('05.08', 'O equipamento possui aterramento (uso na hora do abastecimento)?', cat_comboio_id, versao_id, 8, true, true, NOW(), NOW()),
    ('05.09', 'Existem placas de perigo de abastecimento e afasta-se para utilização durante o abastecimento e cones para sinalização durante o abastecimento em campo?', cat_comboio_id, versao_id, 9, true, true, NOW(), NOW());
  
  RAISE NOTICE '9 perguntas Comboio inseridas';
  
  -- 4.3 INSERIR PERGUNTAS GERADOR (06)
  INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at)
  VALUES 
    ('06.01', 'Os geradores de energia estão em área isolada e com proibição de acesso para pessoas não autorizadas?', cat_gerador_id, versao_id, 1, true, true, NOW(), NOW()),
    ('06.02', 'Existe recursos para atendimento a emergências ambientais (Kit de mitigação) no local ou próximo?', cat_gerador_id, versao_id, 2, true, true, NOW(), NOW()),
    ('06.03', 'Existe sinais de vazamento?', cat_gerador_id, versao_id, 3, true, true, NOW(), NOW()),
    ('06.04', 'Existe identificação e sinalização adequada?', cat_gerador_id, versao_id, 4, true, true, NOW(), NOW()),
    ('06.05', 'O sistema de contenção auxiliar está em bom estado e suporta o volume de óleo em utilização?', cat_gerador_id, versao_id, 5, true, true, NOW(), NOW()),
    ('06.06', 'Existe necessidade de cobertura ou o equipamento é auto-contido/blindado?', cat_gerador_id, versao_id, 6, true, true, NOW(), NOW());
  
  RAISE NOTICE '6 perguntas Gerador inseridas';
  
  -- 4.4 INSERIR CONFIGURAÇÕES DE LV
  INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao, ativa, bucket_fotos, created_at, updated_at)
  VALUES 
    ('04', 'Produtos Químicos', '04.Produtos Químicos', 'Revisão 09', '2023-05-01', true, 'fotos-lvs', NOW(), NOW()),
    ('05', 'Comboio', '05.Comboio', 'Revisão 09', '2023-05-01', true, 'fotos-lvs', NOW(), NOW()),
    ('06', 'Gerador', '06.Gerador', 'Revisão 09', '2023-05-01', true, 'fotos-lvs', NOW(), NOW());
  
  RAISE NOTICE '3 configurações de LV inseridas';
    
END $$;

-- ===================================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ===================================================================

-- Verificar categorias
SELECT 'CATEGORIAS' as tipo, codigo, nome, ativa FROM categorias_lv WHERE codigo IN ('04', '05', '06') ORDER BY codigo;

-- Verificar versão
SELECT 'VERSÃO' as tipo, nome, descricao, ativa FROM versoes_lv WHERE nome = 'Revisão 09';

-- Verificar perguntas Produtos Químicos
SELECT 'PERGUNTAS PRODUTOS QUÍMICOS' as tipo, codigo, pergunta, ordem FROM perguntas_lv WHERE codigo LIKE '04.%' ORDER BY codigo;

-- Verificar perguntas Comboio
SELECT 'PERGUNTAS COMBOIO' as tipo, codigo, pergunta, ordem FROM perguntas_lv WHERE codigo LIKE '05.%' ORDER BY codigo;

-- Verificar perguntas Gerador
SELECT 'PERGUNTAS GERADOR' as tipo, codigo, pergunta, ordem FROM perguntas_lv WHERE codigo LIKE '06.%' ORDER BY codigo;

-- Verificar configurações
SELECT 'CONFIGURAÇÕES' as tipo, tipo_lv, nome_lv, ativa FROM lv_configuracoes WHERE tipo_lv IN ('04', '05', '06') ORDER BY tipo_lv;

-- ===================================================================
-- RESUMO
-- ===================================================================
-- 
-- ✅ 3 categorias verificadas/inseridas (04, 05, 06)
-- ✅ Versão verificada/inserida  
-- ✅ 24 perguntas inseridas:
--    • 9 perguntas Produtos Químicos (04.01 a 04.09)
--    • 9 perguntas Comboio (05.01 a 05.09)
--    • 6 perguntas Gerador (06.01 a 06.06)
-- ✅ 3 configurações de LV inseridas
--
-- =================================================================== 