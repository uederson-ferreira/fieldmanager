-- ===================================================================
-- SCRIPT SQL FINAL PARA INSERIR PERGUNTAS DAS LVs
-- EcoField System - Recursos Hídricos (02) e Emissões Atmosféricas (03)
-- ===================================================================

-- 1. VERIFICAR E INSERIR CATEGORIAS
-- ===================================================================

-- Verificar se categoria 02 existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '02') THEN
    INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
    VALUES ('02', 'RECURSOS HÍDRICOS', 'Gestão e proteção de recursos hídricos, controle de erosão e captação de água', true, 2, NOW(), NOW());
    RAISE NOTICE 'Categoria 02 inserida';
  ELSE
    RAISE NOTICE 'Categoria 02 já existe';
  END IF;
END $$;

-- Verificar se categoria 03 existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '03') THEN
    INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
    VALUES ('03', 'EMISSÕES ATMOSFÉRICAS', 'Controle de emissões atmosféricas, opacidade de veículos e umectação', true, 3, NOW(), NOW());
    RAISE NOTICE 'Categoria 03 inserida';
  ELSE
    RAISE NOTICE 'Categoria 03 já existe';
  END IF;
END $$;

-- 2. VERIFICAR E INSERIR VERSÃO
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

-- 3. LIMPAR E INSERIR PERGUNTAS
-- ===================================================================

-- Limpar perguntas existentes das LVs 02 e 03
DELETE FROM perguntas_lv WHERE codigo LIKE '02.%' OR codigo LIKE '03.%';

-- Limpar configurações existentes das LVs 02 e 03
DELETE FROM lv_configuracoes WHERE tipo_lv IN ('02', '03');

-- 4. INSERIR PERGUNTAS E CONFIGURAÇÕES
-- ===================================================================

DO $$
DECLARE
  cat_hidricos_id UUID;
  cat_emissoes_id UUID;
  versao_id UUID;
BEGIN
  -- Obter IDs
  SELECT id INTO cat_hidricos_id FROM categorias_lv WHERE codigo = '02';
  SELECT id INTO cat_emissoes_id FROM categorias_lv WHERE codigo = '03';
  SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 09';
  
  -- Inserir perguntas Recursos Hídricos
  INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at)
  VALUES 
    ('02.01', 'Foram implantados sistema de proteção de acordo com as necessidades do local? (Cortina de turbidez, bidim, gabião, ou outras medidas)', cat_hidricos_id, versao_id, 1, true, true, NOW(), NOW()),
    ('02.02', 'Existe a necessidade da implantação de dispositivos provisórios de contenção e direcionamento ordenado de águas pluviais para o controle de processos erosivos superficiais?', cat_hidricos_id, versao_id, 2, true, true, NOW(), NOW()),
    ('02.03', 'Há evidências do preenchimento do formulário de captação de água?', cat_hidricos_id, versao_id, 3, true, true, NOW(), NOW()),
    ('02.04', 'Há vazamento de óleo e agua na moto bomba utilizado para captação de água?', cat_hidricos_id, versao_id, 4, true, true, NOW(), NOW());
  
  RAISE NOTICE '4 perguntas Recursos Hídricos inseridas';
  
  -- Inserir perguntas Emissões Atmosféricas
  INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at)
  VALUES 
    ('03.01', 'O veículo possui selo de vistoria que demonstra utilização do laudo de opacidade do veiculo em dias?', cat_emissoes_id, versao_id, 1, true, true, NOW(), NOW()),
    ('03.02', 'Há evidencia de umectação/captação em palnilha de controle preenchida?', cat_emissoes_id, versao_id, 2, true, true, NOW(), NOW()),
    ('03.03', 'Existe emissão de material particulado (poeira) na área?', cat_emissoes_id, versao_id, 3, true, true, NOW(), NOW()),
    ('03.04', 'A umectação de vias está sendo realizada conforme necessidade?', cat_emissoes_id, versao_id, 4, true, true, NOW(), NOW());
  
  RAISE NOTICE '4 perguntas Emissões Atmosféricas inseridas';
  
  -- Inserir configurações de LV
  INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao, ativa, bucket_fotos, created_at, updated_at)
  VALUES 
    ('02', 'Recursos Hídricos', '02.Recursos Hídricos', 'Revisão 09', '2023-05-01', true, 'fotos-lvs', NOW(), NOW()),
    ('03', 'Emissões Atmosféricas', '03.Emissões Atmosféricas', 'Revisão 09', '2023-05-01', true, 'fotos-lvs', NOW(), NOW());
  
  RAISE NOTICE '2 configurações de LV inseridas';
    
END $$;

-- ===================================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ===================================================================

-- Verificar categorias
SELECT 'CATEGORIAS' as tipo, codigo, nome, ativa FROM categorias_lv WHERE codigo IN ('02', '03') ORDER BY codigo;

-- Verificar versão
SELECT 'VERSÃO' as tipo, nome, descricao, ativa FROM versoes_lv WHERE nome = 'Revisão 09';

-- Verificar perguntas
SELECT 'PERGUNTAS' as tipo, codigo, pergunta, ordem FROM perguntas_lv WHERE codigo LIKE '02.%' OR codigo LIKE '03.%' ORDER BY codigo;

-- Verificar configurações
SELECT 'CONFIGURAÇÕES' as tipo, tipo_lv, nome_lv, ativa FROM lv_configuracoes WHERE tipo_lv IN ('02', '03') ORDER BY tipo_lv;

-- ===================================================================
-- RESUMO
-- ===================================================================
-- 
-- ✅ Categorias verificadas/inseridas
-- ✅ Versão verificada/inserida  
-- ✅ 8 perguntas inseridas (4 por LV)
-- ✅ 2 configurações de LV inseridas
--
-- =================================================================== 