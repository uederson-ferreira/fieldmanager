-- Script para inserir perguntas das LVs 14, 15, 16, 17, 18, 19 e 20
-- Baseado nas imagens fornecidas

-- ===================================================================
-- VERIFICAR E INSERIR CATEGORIAS
-- ===================================================================

-- LV 14 - REVEGETAÇÃO
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '14') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('14', 'REVEGETAÇÃO', 'Programa de revegetação e recuperação de áreas', true, 14, NOW(), NOW());
        RAISE NOTICE 'Categoria 14 - REVEGETAÇÃO inserida';
    ELSE
        RAISE NOTICE 'Categoria 14 - REVEGETAÇÃO já existe';
    END IF;
END $$;

-- LV 15 - 5S
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '15') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('15', '5S', 'Programa de organização e disciplina no ambiente de trabalho', true, 15, NOW(), NOW());
        RAISE NOTICE 'Categoria 15 - 5S inserida';
    ELSE
        RAISE NOTICE 'Categoria 15 - 5S já existe';
    END IF;
END $$;

-- LV 16 - DESMOBILIZAÇÃO
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '16') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('16', 'DESMOBILIZAÇÃO', 'Programa de desmobilização e limpeza de áreas', true, 16, NOW(), NOW());
        RAISE NOTICE 'Categoria 16 - DESMOBILIZAÇÃO inserida';
    ELSE
        RAISE NOTICE 'Categoria 16 - DESMOBILIZAÇÃO já existe';
    END IF;
END $$;

-- LV 17 - DESMOBILIZAÇÃO (segunda versão)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '17') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('17', 'DESMOBILIZAÇÃO', 'Programa de desmobilização e limpeza de áreas - Versão 2', true, 17, NOW(), NOW());
        RAISE NOTICE 'Categoria 17 - DESMOBILIZAÇÃO inserida';
    ELSE
        RAISE NOTICE 'Categoria 17 - DESMOBILIZAÇÃO já existe';
    END IF;
END $$;

-- LV 18 - ASSOREAMENTO E VAZÃO
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '18') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('18', 'ASSOREAMENTO E VAZÃO', 'Programa de monitoramento de assoreamento e vazão', true, 18, NOW(), NOW());
        RAISE NOTICE 'Categoria 18 - ASSOREAMENTO E VAZÃO inserida';
    ELSE
        RAISE NOTICE 'Categoria 18 - ASSOREAMENTO E VAZÃO já existe';
    END IF;
END $$;

-- LV 19 - FEIÇÕES EROSIVAS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '19') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('19', 'FEIÇÕES EROSIVAS', 'Programa de monitoramento de feições erosivas', true, 19, NOW(), NOW());
        RAISE NOTICE 'Categoria 19 - FEIÇÕES EROSIVAS inserida';
    ELSE
        RAISE NOTICE 'Categoria 19 - FEIÇÕES EROSIVAS já existe';
    END IF;
END $$;

-- LV 20 - NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '20') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('20', 'NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO', 'Programa de monitoramento de ruído e vibração', true, 20, NOW(), NOW());
        RAISE NOTICE 'Categoria 20 - NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO inserida';
    ELSE
        RAISE NOTICE 'Categoria 20 - NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO já existe';
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

-- LV 14 - REVEGETAÇÃO
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '14';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '14.%';
    
    -- Inserir perguntas da LV 14
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('14.01', 'A empresa apresentou à FISCALIZAÇÃO o mix de sementes (gramíneas e/ou leguminosas) para aprovação antes do início do plantio?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('14.02', 'Os dispositivos de drenagem encontram-se desobstruídos com a remoção dos materiais provenientes do preparo dos taludes?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('14.03', 'Foram medidas a area plantada em talude sobre a sua superfície, fornecendo dimensões efetivas, e não suas projeções na horizontal?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('14.04', 'A germinação das areas plantadas foi completa?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('14.05', 'Existem falhas na plantadas que necessitem o repasse da hidrossemeadura?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('14.06', 'Foi realizada adubação de cobertura?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('14.07', 'A germinação das areas plantadas está isenta de especies de pragas e doenças?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('14.08', 'Foi realizada irrigação das areas plantadas da semeadura ate seu fechamento?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('14.09', 'Alguma area plantadas não teve pegamento por falta de irrigação?', categoria_id, versao_id, 9, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 14 - REVEGETAÇÃO inseridas';
END $$;

-- LV 15 - 5S
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '15';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '15.%';
    
    -- Inserir perguntas da LV 15
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('15.01', 'UTILIZAÇÃO - 1.1. Utilização dos recursos: Armazenamento de resíduos inadequado; reaproveitamento de embalagem de produto químicos; falta de rotulagem secundária, garrafas para água em local impróprio;', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('15.02', 'UTILIZAÇÃO - 1.2. Estado e controle de conservação de instalações e recursos: áreas de vivência sem proteção contra animais; malões e suportes danificados;', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('15.03', 'ORDENAÇÃO - 2.1. Identificações e Sinalizações: Existe placas informando - forma correta de segregação; perigo de felinos ou animais peçonhentos; riscos de afogamento, informativo e educação ambiental...?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('15.04', 'ORDENAÇÃO - 2.2. Definição e Adequação de locais para a guarda de recursos: Existe kit ambiental na frente de serviço; bacia de contenção, armazenamento de produtos químicos correto?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('15.05', 'ORDENAÇÃO - 2.3. Ordem dos recursos: acesso aos materiais está seguro e sem risco de acidente; o local é adequado ao armazenamento?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('15.06', 'LIMPEZA - 3.1. Nível de limpeza: existem resíduos e materiais espalhados pela área?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('15.07', 'LIMPEZA - 3.2. Sistemática de Limpeza: existe acumulo de resíduos, os banheiros químicos estão limpos?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('15.08', 'LIMPEZA - 3.4. Coletores de resíduos sólidos: coletores suficientes e de acordo com geração; e em bom estado?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('15.09', 'PADRONIZAÇÃO E SAÚDE - 4.1. Padronização: as placas de identificação estão legíveis e de fácil compreensão?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('15.10', 'PADRONIZAÇÃO E SAÚDE - 4.2. Higiene e Saúde: Há problema que afeta a saúde no ambiente de trabalho (garrafas térmicas higienizadas, protetor solar no prazo de validade); existe alimentos guardados de forma errada?', categoria_id, versao_id, 10, true, true, NOW(), NOW()),
    ('15.11', 'PADRONIZAÇÃO E SAÚDE - 4.3. Estruturação dos documentos: quadro de gestão está atualizado? Os documentos licença da obra, PROs, FISPQs, estão de fácil acesso?', categoria_id, versao_id, 11, true, true, NOW(), NOW()),
    ('15.12', 'AUTO DISCIPLINA - 5.1. Autodisciplina na prática do 5S: possui identificações na área; armazenamentos de resíduos; fumódromo; kit ambiental; não há resíduos espalhados e nem misturados?', categoria_id, versao_id, 12, true, true, NOW(), NOW()),
    ('15.13', 'AUTO DISCIPLINA - 5.2. Autodisciplina no cumprimento de regras, normas e PROs: Os colaboradores conhecem os procedimentos / regras ambientais?', categoria_id, versao_id, 13, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 15 - 5S inseridas';
END $$;

-- LV 16 - DESMOBILIZAÇÃO
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '16';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '16.%';
    
    -- Inserir perguntas da LV 16
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('16.01', 'Foram identificados estruturas não desmobilizadas na área?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('16.02', 'Foram identificados placas ou outros dispositivos de sinalização da contratada na área?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('16.03', 'Foram identificados resíduos sem destinação na área?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('16.04', 'Foram identificadas sobras de materiais ou insumos na área?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('16.05', 'Foram identificadas caixas coletoras de efluentes ou cabines sanitárias não desmobilizadas na área?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('16.06', 'Foi identificado visualmente na área alguma contaminação do solo ou cursos dágua?', categoria_id, versao_id, 6, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 16 - DESMOBILIZAÇÃO inseridas';
END $$;

-- LV 17 - DESMOBILIZAÇÃO (segunda versão)
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '17';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '17.%';
    
    -- Inserir perguntas da LV 17
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('17.01', 'Foram identificados estruturas não desmobilizadas na área?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('17.02', 'Foram identificados placas ou outros dispositivos de sinalização da contratada na área?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('17.03', 'Foram identificados resíduos sem destinação na área?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('17.04', 'Foram identificadas sobras de materiais ou insumos na área?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('17.05', 'Foram identificadas caixas coletoras de efluentes ou cabines sanitárias não desmobilizadas na área?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('17.06', 'Foi identificado visualmente na área alguma contaminação do solo ou cursos dágua?', categoria_id, versao_id, 6, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 17 - DESMOBILIZAÇÃO inseridas';
END $$;

-- LV 18 - ASSOREAMENTO E VAZÃO
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '18';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '18.%';
    
    -- Inserir perguntas da LV 18
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('18.01', 'O monitoramento nas drenagens estão sendo executadas conforme o cronograma quinzenal?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('18.02', 'Os equipamentos de medição de vazão estão calibrados?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('18.03', 'As amostras de sedimentos estão sendo coletadas corretamente?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('18.04', 'Os procedimentos de amostragem estão sendo seguidos corretamente (Conforme procedimento da empresa)?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('18.05', 'Os relatórios quinzenais de drenagem foram recebidos e revisados?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('18.06', 'Os resultados obtidos estão conforme os limites regulamentares?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('18.07', 'As áreas de amostragem estão corretamente demarcadas?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('18.08', 'As amostras estão sendo transportadas com integridade ao laboratório?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('18.09', 'As análises laboratoriais estão sendo realizadas conforme os padrões?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('18.10', 'Os relatórios de vazão estão sendo revisados mensalmente?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 18 - ASSOREAMENTO E VAZÃO inseridas';
END $$;

-- LV 19 - FEIÇÕES EROSIVAS
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '19';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '19.%';
    
    -- Inserir perguntas da LV 19
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('19.01', 'Os levantamentos de feições erosivas estão sendo executados conforme o cronograma?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('19.02', 'Os equipamentos utilizados nos levantamentos estão calibrados?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('19.03', 'Os métodos de medição de erosão estão sendo seguidos corretamente (Conforme procedimento da empresa)?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('19.04', 'Os relatórios quinzenais de feições erosivas foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('19.05', 'As medidas de controle de erosão estão sendo implementadas?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('19.06', 'Os resultados estão conformes com os padrões estabelecidos?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('19.07', 'As áreas de amostragem estão corretamente identificadas?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('19.08', 'As inspeções de campo estão sendo realizadas conforme programado?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('19.09', 'Há documentação de novas ocorrências de feições erosivas?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('19.10', 'As medidas de mitigação aplicadas são eficazes?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 19 - FEIÇÕES EROSIVAS inseridas';
END $$;

-- LV 20 - NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '20';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '20.%';
    
    -- Inserir perguntas da LV 20
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('20.01', 'Os levantamentos diurnos e noturnos estão sendo executados conforme o cronograma semanal?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('20.02', 'Os equipamentos de medição de ruído e vibração estão calibrados?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('20.03', 'Os dados de pressão sonora e vibração estão sendo coletados corretamente (Conforme procedimento da empresa)?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('20.04', 'Os relatórios semanais de ruído e vibração foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('20.05', 'Os resultados obtidos estão conforme os limites regulamentares?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('20.06', 'Os pontos de medição estão corretamente localizados?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('20.07', 'Os dados coletados estão sendo transportados com integridade?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('20.08', 'As análises de dados estão sendo realizadas conforme os padrões?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('20.09', 'Há documentação de excedências nos níveis de ruído e vibração?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('20.10', 'Os relatórios de tendência estão sendo revisados mensalmente?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 20 - NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO inseridas';
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
WHERE codigo IN ('14', '15', '16', '17', '18', '19', '20')
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
WHERE p.codigo LIKE '14.%' OR p.codigo LIKE '15.%' OR p.codigo LIKE '16.%' OR p.codigo LIKE '17.%' OR p.codigo LIKE '18.%' OR p.codigo LIKE '19.%' OR p.codigo LIKE '20.%'
ORDER BY p.codigo;

-- Contar total de perguntas por LV
SELECT 
    SUBSTRING(p.codigo, 1, 2) as tipo_lv,
    COUNT(*) as total_perguntas
FROM perguntas_lv p
WHERE p.codigo LIKE '14.%' OR p.codigo LIKE '15.%' OR p.codigo LIKE '16.%' OR p.codigo LIKE '17.%' OR p.codigo LIKE '18.%' OR p.codigo LIKE '19.%' OR p.codigo LIKE '20.%'
GROUP BY SUBSTRING(p.codigo, 1, 2)
ORDER BY tipo_lv; 