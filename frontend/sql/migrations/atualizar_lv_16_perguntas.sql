-- Script para atualizar as perguntas da LV 16 - PREPARAÇÃO E MOBILIZAÇÃO
-- Baseado nas novas perguntas fornecidas

-- ===================================================================
-- VERIFICAR E ATUALIZAR CATEGORIA 16
-- ===================================================================

-- Atualizar o nome da categoria 16 para "PREPARAÇÃO E MOBILIZAÇÃO"
UPDATE categorias_lv 
SET 
    nome = 'PREPARAÇÃO E MOBILIZAÇÃO',
    descricao = 'Programa de preparação e mobilização para início das atividades',
    updated_at = NOW()
WHERE codigo = '16';

-- Se não existir a categoria 16, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '16',
    'PREPARAÇÃO E MOBILIZAÇÃO',
    'Programa de preparação e mobilização para início das atividades',
    true,
    16,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '16'
);

-- ===================================================================
-- VERIFICAR E INSERIR VERSÃO
-- ===================================================================

-- Verificar se existe versão "Revisão 01"
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM versoes_lv WHERE nome = 'Revisão 01') THEN
        INSERT INTO versoes_lv (nome, descricao, ativa, created_at, updated_at)
        VALUES ('Revisão 01', 'Primeira revisão das listas de verificação', true, NOW(), NOW());
        RAISE NOTICE 'Versão "Revisão 01" inserida';
    ELSE
        RAISE NOTICE 'Versão "Revisão 01" já existe';
    END IF;
END $$;

-- ===================================================================
-- ATUALIZAR PERGUNTAS DA LV 16
-- ===================================================================

DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '16';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes da LV 16
    DELETE FROM perguntas_lv WHERE codigo LIKE '16.%';
    
    -- Inserir novas perguntas da LV 16 - PREPARAÇÃO E MOBILIZAÇÃO
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('16.01', 'As licenças e autorizações ambientais necessárias para início das atividades foram obtidas e estão válidas?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('16.02', 'O treinamento de integração ambiental foi realizado para todos os trabalhadores antes do início das atividades?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('16.03', 'As áreas ambientalmente sensíveis foram identificadas, sinalizadas e isoladas adequadamente?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('16.04', 'Os equipamentos de proteção individual (EPI) e coletiva (EPC) ambientais estão disponíveis e adequados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('16.05', 'As estruturas temporárias (canteiros, almoxarifados, refeitórios) foram instaladas em locais apropriados?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('16.06', 'O sistema de gestão de resíduos foi implementado com coletores identificados e áreas de armazenamento?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('16.07', 'As medidas de controle de erosão e sedimentação foram instaladas antes do início da movimentação de terra?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('16.08', 'O plano de comunicação com a comunidade local foi implementado e os canais de comunicação estabelecidos?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('16.09', 'Os sistemas de drenagem provisória e definitiva foram instalados nas áreas de trabalho?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('16.10', 'As rotas de acesso foram definidas e sinalizadas para minimizar impactos ambientais?', categoria_id, versao_id, 10, true, true, NOW(), NOW()),
    ('16.11', 'O controle de qualidade da água (monitoramento) foi estabelecido nos pontos definidos?', categoria_id, versao_id, 11, true, true, NOW(), NOW()),
    ('16.12', 'As áreas de estocagem de materiais foram preparadas com sistemas de contenção adequados?', categoria_id, versao_id, 12, true, true, NOW(), NOW()),
    ('16.13', 'Os procedimentos de emergência ambiental foram estabelecidos e comunicados às equipes?', categoria_id, versao_id, 13, true, true, NOW(), NOW()),
    ('16.14', 'A supressão vegetal autorizada foi iniciada seguindo os procedimentos de resgate de fauna?', categoria_id, versao_id, 14, true, true, NOW(), NOW()),
    ('16.15', 'Os equipamentos foram vistoriados e estão em condições adequadas para operação sem vazamentos?', categoria_id, versao_id, 15, true, true, NOW(), NOW()),
    ('16.16', 'O cronograma de atividades ambientais foi estabelecido e comunicado a todas as equipes?', categoria_id, versao_id, 16, true, true, NOW(), NOW()),
    ('16.17', 'As medidas de controle de ruído e vibração foram implementadas conforme o horário permitido?', categoria_id, versao_id, 17, true, true, NOW(), NOW()),
    ('16.18', 'O sistema de monitoramento ambiental (ar, água, ruído) foi instalado e está operacional?', categoria_id, versao_id, 18, true, true, NOW(), NOW()),
    ('16.19', 'As condicionantes ambientais específicas do projeto estão sendo implementadas desde o início?', categoria_id, versao_id, 19, true, true, NOW(), NOW()),
    ('16.20', 'A documentação ambiental (registros, relatórios, licenças) foi organizada e está acessível?', categoria_id, versao_id, 20, true, true, NOW(), NOW());
    
    RAISE NOTICE '20 perguntas da LV 16 - PREPARAÇÃO E MOBILIZAÇÃO inseridas/atualizadas';
END $$;

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

-- Verificar categoria atualizada
SELECT 
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '16';

-- Verificar perguntas inseridas
SELECT 
    p.codigo,
    p.pergunta,
    p.obrigatoria,
    p.ordem,
    c.nome as categoria
FROM perguntas_lv p
JOIN categorias_lv c ON p.categoria_id = c.id
WHERE p.codigo LIKE '16.%'
ORDER BY p.ordem;

-- Contar total de perguntas da LV 16
SELECT 
    COUNT(*) as total_perguntas_lv_16
FROM perguntas_lv 
WHERE codigo LIKE '16.%';

-- ===================================================================
-- RESUMO DA ATUALIZAÇÃO
-- ===================================================================
-- 
-- ✅ Categoria 16 atualizada para "PREPARAÇÃO E MOBILIZAÇÃO"
-- ✅ 20 perguntas inseridas/atualizadas (16.01 a 16.20)
-- ✅ Todas as perguntas são obrigatórias
-- ✅ Ordem sequencial de 1 a 20
-- ✅ Versão "Revisão 01" utilizada
--
-- =================================================================== 