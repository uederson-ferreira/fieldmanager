-- Script para inserir perguntas das LVs 24, 25, 26, 27, 28 e 29
-- Baseado nas imagens fornecidas

-- ===================================================================
-- VERIFICAR E INSERIR CATEGORIAS
-- ===================================================================

-- LV 24 - GERENCIAMENTO DE RESÍDUOS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '24') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('24', 'GERENCIAMENTO DE RESÍDUOS', 'Programa de gerenciamento de resíduos sólidos', true, 24, NOW(), NOW());
        RAISE NOTICE 'Categoria 24 - GERENCIAMENTO DE RESÍDUOS inserida';
    ELSE
        RAISE NOTICE 'Categoria 24 - GERENCIAMENTO DE RESÍDUOS já existe';
    END IF;
END $$;

-- LV 25 - PLANTIO COMPENSATÓRIO
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '25') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('25', 'PLANTIO COMPENSATÓRIO', 'Plantio compensatório de espécies ameaçadas', true, 25, NOW(), NOW());
        RAISE NOTICE 'Categoria 25 - PLANTIO COMPENSATÓRIO inserida';
    ELSE
        RAISE NOTICE 'Categoria 25 - PLANTIO COMPENSATÓRIO já existe';
    END IF;
END $$;

-- LV 26 - RECUPERAÇÃO DE APP
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '26') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('26', 'RECUPERAÇÃO DE APP', 'Recuperação de APP e recomposição da faixa de serviço', true, 26, NOW(), NOW());
        RAISE NOTICE 'Categoria 26 - RECUPERAÇÃO DE APP inserida';
    ELSE
        RAISE NOTICE 'Categoria 26 - RECUPERAÇÃO DE APP já existe';
    END IF;
END $$;

-- LV 27 - EDUCAÇÃO AMBIENTAL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '27') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('27', 'EDUCAÇÃO AMBIENTAL', 'Programa de educação ambiental', true, 27, NOW(), NOW());
        RAISE NOTICE 'Categoria 27 - EDUCAÇÃO AMBIENTAL inserida';
    ELSE
        RAISE NOTICE 'Categoria 27 - EDUCAÇÃO AMBIENTAL já existe';
    END IF;
END $$;

-- LV 28 - COMUNICAÇÃO SOCIAL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '28') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('28', 'COMUNICAÇÃO SOCIAL', 'Programa de comunicação social', true, 28, NOW(), NOW());
        RAISE NOTICE 'Categoria 28 - COMUNICAÇÃO SOCIAL inserida';
    ELSE
        RAISE NOTICE 'Categoria 28 - COMUNICAÇÃO SOCIAL já existe';
    END IF;
END $$;

-- LV 29 - QUALIDADE DAS ÁGUAS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '29') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('29', 'QUALIDADE DAS ÁGUAS', 'Qualidade das águas superficiais', true, 29, NOW(), NOW());
        RAISE NOTICE 'Categoria 29 - QUALIDADE DAS ÁGUAS inserida';
    ELSE
        RAISE NOTICE 'Categoria 29 - QUALIDADE DAS ÁGUAS já existe';
    END IF;
END $$;

-- ===================================================================
-- VERIFICAR E INSERIR VERSÕES
-- ===================================================================

-- Verificar se existe versão "Revisão 01" para as novas LVs
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
-- INSERIR PERGUNTAS
-- ===================================================================

-- LV 24 - GERENCIAMENTO DE RESÍDUOS
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '24';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '24.%';
    
    -- Inserir perguntas da LV 24
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('24.01', 'As inspeções mensais estão sendo realizadas conforme o cronograma?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('24.02', 'A segregação dos resíduos está sendo feita adequadamente conforme as categorias?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('24.03', 'Os resíduos estão sendo coletados e armazenados corretamente?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('24.04', 'Os relatórios mensais de gerenciamento de resíduos foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('24.05', 'Os resultados obtidos estão conforme os padrões regulamentares?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('24.06', 'Os resíduos estão sendo encaminhados para os destinos finais corretos?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('24.07', 'Os procedimentos de gestão de resíduos estão sendo seguidos?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('24.08', 'As inspeções de campo estão sendo realizadas conforme programado?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('24.09', 'Há documentação de não conformidades encontradas?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('24.10', 'As medidas corretivas aplicadas são eficazes?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 24 - GERENCIAMENTO DE RESÍDUOS inseridas';
END $$;

-- LV 25 - PLANTIO COMPENSATÓRIO
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '25';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '25.%';
    
    -- Inserir perguntas da LV 25
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('25.01', 'As evidências da empresa executora foram recebidas e revisadas?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('25.02', 'O plantio está sendo executado conforme o plano aprovado?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('25.03', 'As espécies plantadas estão corretamente identificadas?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('25.04', 'As áreas plantadas estão sendo mantidas e monitoradas corretamente?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('25.05', 'Os relatórios de progresso do plantio foram recebidos e revisados?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('25.06', 'Os resultados obtidos estão conforme os objetivos do plano compensatório?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('25.07', 'As técnicas de plantio estão sendo aplicadas corretamente?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('25.08', 'A sobrevivência das espécies plantadas está sendo verificada?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('25.09', 'Há documentação de falhas ou sucessos no plantio?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('25.10', 'As medidas de manutenção aplicadas são eficazes?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 25 - PLANTIO COMPENSATÓRIO inseridas';
END $$;

-- LV 26 - RECUPERAÇÃO DE APP
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '26';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '26.%';
    
    -- Inserir perguntas da LV 26
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('26.01', 'As visitas mensais estão sendo realizadas conforme o cronograma?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('26.02', 'As atividades de recuperação estão sendo executadas conforme o plano aprovado?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('26.03', 'As áreas de APP estão corretamente identificadas?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('26.04', 'Os relatórios mensais de recuperação foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('26.05', 'Os resultados obtidos estão conforme os objetivos do plano de recuperação?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('26.06', 'As técnicas de recomposição estão sendo aplicadas corretamente?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('26.07', 'As áreas recuperadas estão conformes com os padrões estabelecidos?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('26.08', 'Há documentação de falhas ou sucessos na recuperação?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('26.09', 'As áreas recuperadas estão sendo mantidas corretamente?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('26.10', 'As medidas de recomposição aplicadas são eficazes?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 26 - RECUPERAÇÃO DE APP inseridas';
END $$;

-- LV 27 - EDUCAÇÃO AMBIENTAL
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '27';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '27.%';
    
    -- Inserir perguntas da LV 27
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('27.01', 'As visitas prévias às comunidades estão sendo realizadas?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('27.02', 'As atividades de educação ambiental estão sendo executadas conforme o plano?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('27.03', 'As comunidades estão participando das atividades programadas?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('27.04', 'Os relatórios de educação ambiental foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('27.05', 'Os resultados obtidos estão conforme os objetivos do programa?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('27.06', 'Os materiais educativos estão sendo utilizados conforme o planejado?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('27.07', 'Os métodos de educação ambiental estão sendo seguidos corretamente?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('27.08', 'Há documentação dos feedbacks das comunidades?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('27.09', 'As campanhas de conscientização estão sendo realizadas?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('27.10', 'As atividades educativas aplicadas são eficazes?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 27 - EDUCAÇÃO AMBIENTAL inseridas';
END $$;

-- LV 28 - COMUNICAÇÃO SOCIAL
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '28';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '28.%';
    
    -- Inserir perguntas da LV 28
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('28.01', 'As informações do SACS foram recebidas e revisadas até o dia 10 de cada mês?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('28.02', 'As reuniões e consultas com a comunidade local estão sendo realizadas?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('28.03', 'As informações relevantes sobre o projeto estão sendo divulgadas?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('28.04', 'Os feedbacks da comunidade estão sendo avaliados e respondidos?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('28.05', 'As atividades de comunicação social estão documentadas?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('28.06', 'As comunidades estão participando das reuniões?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('28.07', 'Os materiais informativos estão sendo distribuídos?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('28.08', 'Os métodos de comunicação estão sendo seguidos corretamente?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('28.09', 'Os resultados obtidos estão conforme os objetivos do programa?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('28.10', 'As atividades de comunicação aplicadas são eficazes?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 28 - COMUNICAÇÃO SOCIAL inseridas';
END $$;

-- LV 29 - QUALIDADE DAS ÁGUAS
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '29';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '29.%';
    
    -- Inserir perguntas da LV 29
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('29.01', 'As amostragens estão sendo executadas conforme o cronograma bimestral?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('29.02', 'Os equipamentos de amostragem de água estão calibrados?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('29.03', 'As amostras de água superficial estão sendo coletadas corretamente?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('29.04', 'Os relatórios de qualidade da água foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('29.05', 'Os resultados obtidos estão conforme os limites regulamentares?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('29.06', 'Os pontos de amostragem estão corretamente identificados?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('29.07', 'As amostras estão sendo transportadas com integridade?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('29.08', 'As análises laboratoriais estão sendo realizadas conforme os padrões?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('29.09', 'Há documentação de excedências nos parâmetros de qualidade da água?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('29.10', 'Os relatórios de tendência estão sendo revisados bimestralmente?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 29 - QUALIDADE DAS ÁGUAS inseridas';
END $$;

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

-- Verificar categorias inseridas
SELECT 
    codigo,
    nome,
    descricao,
    ativa,
    ordem
FROM categorias_lv 
WHERE codigo IN ('24', '25', '26', '27', '28', '29')
ORDER BY codigo;

-- Verificar perguntas inseridas
SELECT 
    p.codigo,
    p.pergunta,
    p.obrigatoria,
    p.ordem,
    c.nome as categoria
FROM perguntas_lv p
JOIN categorias_lv c ON p.categoria_id = c.id
WHERE p.codigo LIKE '24.%' OR p.codigo LIKE '25.%' OR p.codigo LIKE '26.%' OR p.codigo LIKE '27.%' OR p.codigo LIKE '28.%' OR p.codigo LIKE '29.%'
ORDER BY p.codigo;

-- Contar total de perguntas por LV
SELECT 
    SUBSTRING(p.codigo, 1, 2) as tipo_lv,
    COUNT(*) as total_perguntas
FROM perguntas_lv p
WHERE p.codigo LIKE '24.%' OR p.codigo LIKE '25.%' OR p.codigo LIKE '26.%' OR p.codigo LIKE '27.%' OR p.codigo LIKE '28.%' OR p.codigo LIKE '29.%'
GROUP BY SUBSTRING(p.codigo, 1, 2)
ORDER BY tipo_lv; 