-- ===================================================================
-- SCRIPT SQL PARA INSERIR PERGUNTAS DAS LVs
-- EcoField System - Recursos Hídricos (02) e Emissões Atmosféricas (03)
-- ===================================================================

-- 1. INSERIR CATEGORIAS
-- ===================================================================

INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
VALUES 
  ('02', 'RECURSOS HÍDRICOS', 'Gestão e proteção de recursos hídricos, controle de erosão e captação de água', true, 2, NOW(), NOW()),
  ('03', 'EMISSÕES ATMOSFÉRICAS', 'Controle de emissões atmosféricas, opacidade de veículos e umectação', true, 3, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativa = EXCLUDED.ativa,
  ordem = EXCLUDED.ordem,
  updated_at = NOW();

-- 2. INSERIR VERSÃO
-- ===================================================================

INSERT INTO versoes_lv (nome, descricao, data_revisao, ativa, created_at, updated_at)
VALUES 
  ('Revisão 09', 'Versão atualizada das Listas de Verificação Ambiental', '2023-05-01', true, NOW(), NOW())
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  data_revisao = EXCLUDED.data_revisao,
  ativa = EXCLUDED.ativa,
  updated_at = NOW();

-- 3. OBTER IDs (para usar nas perguntas)
-- ===================================================================

-- Recursos Hídricos
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
  
  -- 4. INSERIR PERGUNTAS RECURSOS HÍDRICOS
  -- ===================================================================
  
  INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at)
  VALUES 
    ('02.01', 'Foram implantados sistema de proteção de acordo com as necessidades do local? (Cortina de turbidez, bidim, gabião, ou outras medidas)', cat_hidricos_id, versao_id, 1, true, true, NOW(), NOW()),
    ('02.02', 'Existe a necessidade da implantação de dispositivos provisórios de contenção e direcionamento ordenado de águas pluviais para o controle de processos erosivos superficiais?', cat_hidricos_id, versao_id, 2, true, true, NOW(), NOW()),
    ('02.03', 'Há evidências do preenchimento do formulário de captação de água?', cat_hidricos_id, versao_id, 3, true, true, NOW(), NOW()),
    ('02.04', 'Há vazamento de óleo e agua na moto bomba utilizado para captação de água?', cat_hidricos_id, versao_id, 4, true, true, NOW(), NOW())
  ON CONFLICT (codigo, versao_id) DO UPDATE SET
    pergunta = EXCLUDED.pergunta,
    categoria_id = EXCLUDED.categoria_id,
    ordem = EXCLUDED.ordem,
    obrigatoria = EXCLUDED.obrigatoria,
    ativa = EXCLUDED.ativa,
    updated_at = NOW();
  
  -- 5. INSERIR PERGUNTAS EMISSÕES ATMOSFÉRICAS
  -- ===================================================================
  
  INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at)
  VALUES 
    ('03.01', 'O veículo possui selo de vistoria que demonstra utilização do laudo de opacidade do veiculo em dias?', cat_emissoes_id, versao_id, 1, true, true, NOW(), NOW()),
    ('03.02', 'Há evidencia de umectação/captação em palnilha de controle preenchida?', cat_emissoes_id, versao_id, 2, true, true, NOW(), NOW()),
    ('03.03', 'Existe emissão de material particulado (poeira) na área?', cat_emissoes_id, versao_id, 3, true, true, NOW(), NOW()),
    ('03.04', 'A umectação de vias está sendo realizada conforme necessidade?', cat_emissoes_id, versao_id, 4, true, true, NOW(), NOW())
  ON CONFLICT (codigo, versao_id) DO UPDATE SET
    pergunta = EXCLUDED.pergunta,
    categoria_id = EXCLUDED.categoria_id,
    ordem = EXCLUDED.ordem,
    obrigatoria = EXCLUDED.obrigatoria,
    ativa = EXCLUDED.ativa,
    updated_at = NOW();
  
  -- 6. INSERIR CONFIGURAÇÕES DE LV
  -- ===================================================================
  
  INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao, ativa, bucket_fotos, created_at, updated_at)
  VALUES 
    ('02', 'Recursos Hídricos', '02.Recursos Hídricos', 'Revisão 09', '2023-05-01', true, 'fotos-lvs', NOW(), NOW()),
    ('03', 'Emissões Atmosféricas', '03.Emissões Atmosféricas', 'Revisão 09', '2023-05-01', true, 'fotos-lvs', NOW(), NOW())
  ON CONFLICT (tipo_lv) DO UPDATE SET
    nome_lv = EXCLUDED.nome_lv,
    nome_completo = EXCLUDED.nome_completo,
    revisao = EXCLUDED.revisao,
    data_revisao = EXCLUDED.data_revisao,
    ativa = EXCLUDED.ativa,
    bucket_fotos = EXCLUDED.bucket_fotos,
    updated_at = NOW();
    
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
-- ✅ 2 categorias inseridas/atualizadas
-- ✅ 1 versão inserida/atualizada  
-- ✅ 8 perguntas inseridas/atualizadas (4 por LV)
-- ✅ 2 configurações de LV inseridas/atualizadas
--
-- =================================================================== 