-- ===================================================================
-- SCRIPT SQL PARA INSERIR LVs 08, 09, 11, 12, 13
-- Concreto, Banheiro Químico, Proteções Ambientais, Supressão Vegetal, Equipamentos
-- ===================================================================

-- Verificar se as categorias já existem
DO $$
BEGIN
    -- LV 08 - Concreto
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '08') THEN
        INSERT INTO categorias_lv (id, codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '08',
            'CONCRETO',
            'Atividades de concretagem e gestão de resíduos de concreto',
            true,
            8,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Categoria 08 - CONCRETO inserida';
    ELSE
        RAISE NOTICE 'Categoria 08 - CONCRETO já existe';
    END IF;

    -- LV 09 - Banheiro Químico
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '09') THEN
        INSERT INTO categorias_lv (id, codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '09',
            'BANHEIRO QUÍMICO',
            'Gestão e manutenção de banheiros químicos',
            true,
            9,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Categoria 09 - BANHEIRO QUÍMICO inserida';
    ELSE
        RAISE NOTICE 'Categoria 09 - BANHEIRO QUÍMICO já existe';
    END IF;

    -- LV 11 - Proteções Ambientais
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '11') THEN
        INSERT INTO categorias_lv (id, codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '11',
            'PROTEÇÕES AMBIENTAIS',
            'Proteções ambientais e controle de erosão',
            true,
            11,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Categoria 11 - PROTEÇÕES AMBIENTAIS inserida';
    ELSE
        RAISE NOTICE 'Categoria 11 - PROTEÇÕES AMBIENTAIS já existe';
    END IF;

    -- LV 12 - Supressão Vegetal
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '12') THEN
        INSERT INTO categorias_lv (id, codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '12',
            'SUPRESSÃO VEGETAL',
            'Supressão vegetal e gestão de resíduos florestais',
            true,
            12,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Categoria 12 - SUPRESSÃO VEGETAL inserida';
    ELSE
        RAISE NOTICE 'Categoria 12 - SUPRESSÃO VEGETAL já existe';
    END IF;

    -- LV 13 - Equipamentos
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '13') THEN
        INSERT INTO categorias_lv (id, codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '13',
            'EQUIPAMENTOS',
            'Gestão ambiental de equipamentos e maquinários',
            true,
            13,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Categoria 13 - EQUIPAMENTOS inserida';
    ELSE
        RAISE NOTICE 'Categoria 13 - EQUIPAMENTOS já existe';
    END IF;
END $$;

-- Obter IDs das categorias
DO $$
DECLARE
    categoria_08_id UUID;
    categoria_09_id UUID;
    categoria_11_id UUID;
    categoria_12_id UUID;
    categoria_13_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs das categorias
    SELECT id INTO categoria_08_id FROM categorias_lv WHERE codigo = '08';
    SELECT id INTO categoria_09_id FROM categorias_lv WHERE codigo = '09';
    SELECT id INTO categoria_11_id FROM categorias_lv WHERE codigo = '11';
    SELECT id INTO categoria_12_id FROM categorias_lv WHERE codigo = '12';
    SELECT id INTO categoria_13_id FROM categorias_lv WHERE codigo = '13';

    -- Verificar se a versão já existe
    IF NOT EXISTS (SELECT 1 FROM versoes_lv WHERE nome = 'Revisão 01') THEN
        INSERT INTO versoes_lv (id, nome, descricao, data_revisao, ativa, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Revisão 01',
            'Primeira revisão das LVs',
            '2024-01-01',
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Versão Revisão 01 inserida';
    END IF;

    -- Obter ID da versão
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01';

    -- ===================================================================
    -- LV 08 - CONCRETO
    -- ===================================================================
    
    -- Deletar perguntas existentes da categoria 08
    DELETE FROM perguntas_lv WHERE categoria_id = categoria_08_id;
    
    -- Inserir perguntas da LV 08
    INSERT INTO perguntas_lv (id, codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    (gen_random_uuid(), '08.01', 'O resíduo da atividade de concretagem está sendo descartado em local contido de forma ordenada e sem exceder o limite de capacidade de armazenamento?', categoria_08_id, versao_id, 1, true, true, NOW(), NOW()),
    (gen_random_uuid(), '08.02', 'A área de abastecimento do concreto possui drenos para bacia de disposição temporária de concreto residual?', categoria_08_id, versao_id, 2, true, true, NOW(), NOW()),
    (gen_random_uuid(), '08.03', 'A água utilizada na fabricação de concreto é de origem autorizada/legal?', categoria_08_id, versao_id, 3, true, true, NOW(), NOW()),
    (gen_random_uuid(), '08.04', 'O local de lavagem do caminhão betoneira está distante de corpos hídricos?', categoria_08_id, versao_id, 4, true, true, NOW(), NOW()),
    (gen_random_uuid(), '08.05', 'O efluente da lavagem do caminhão betoneira está sendo despejada em local correto (bacia de disposição temporária de concreto residual)?', categoria_08_id, versao_id, 5, true, true, NOW(), NOW());

    RAISE NOTICE 'Perguntas da LV 08 - CONCRETO inseridas';

    -- ===================================================================
    -- LV 09 - BANHEIRO QUÍMICO
    -- ===================================================================
    
    -- Deletar perguntas existentes da categoria 09
    DELETE FROM perguntas_lv WHERE categoria_id = categoria_09_id;
    
    -- Inserir perguntas da LV 09
    INSERT INTO perguntas_lv (id, codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    (gen_random_uuid(), '09.01', 'As condições de higiene dos banheiros estão satisfatórias?', categoria_09_id, versao_id, 1, true, true, NOW(), NOW()),
    (gen_random_uuid(), '09.02', 'Os banheiros possuem cronograma de limpeza atualizados e assinados?', categoria_09_id, versao_id, 2, true, true, NOW(), NOW()),
    (gen_random_uuid(), '09.03', 'Existe itens de higiene pessoal nos banheiros quimicos? (papel higiênico, papel toalha, sabão liquido,água)?', categoria_09_id, versao_id, 3, true, true, NOW(), NOW()),
    (gen_random_uuid(), '09.04', 'Existe procedimento de limpeza dos banheiros químicos, e está disponível?', categoria_09_id, versao_id, 4, true, true, NOW(), NOW()),
    (gen_random_uuid(), '09.05', 'Os banheiros possuem fácil acesso para realização de limpeza?', categoria_09_id, versao_id, 5, true, true, NOW(), NOW()),
    (gen_random_uuid(), '09.06', 'Os banheiros possuem cobertura adequada?', categoria_09_id, versao_id, 6, true, true, NOW(), NOW());

    RAISE NOTICE 'Perguntas da LV 09 - BANHEIRO QUÍMICO inseridas';

    -- ===================================================================
    -- LV 11 - PROTEÇÕES AMBIENTAIS
    -- ===================================================================
    
    -- Deletar perguntas existentes da categoria 11
    DELETE FROM perguntas_lv WHERE categoria_id = categoria_11_id;
    
    -- Inserir perguntas da LV 11
    INSERT INTO perguntas_lv (id, codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    (gen_random_uuid(), '11.01', 'A proteção ambiental está atendendo de forma eficiente?', categoria_11_id, versao_id, 1, true, true, NOW(), NOW()),
    (gen_random_uuid(), '11.02', 'O material utilizado para fixar os bidins suportam a água em caso de chuva intensa?', categoria_11_id, versao_id, 2, true, true, NOW(), NOW()),
    (gen_random_uuid(), '11.03', 'Existem sulcos (erosão) realizadas pela passagem da água pluvial?', categoria_11_id, versao_id, 3, true, true, NOW(), NOW()),
    (gen_random_uuid(), '11.04', 'Existe acúmulo de água que comprometa a estabilidade da proteção ambiental?', categoria_11_id, versao_id, 4, true, true, NOW(), NOW()),
    (gen_random_uuid(), '11.05', 'A área que foi instalada a proteção ambiental permite a passagem de água de modo que não cause novas feições erosivas?', categoria_11_id, versao_id, 5, true, true, NOW(), NOW()),
    (gen_random_uuid(), '11.06', 'Existem danos no bidim que causem a passagem de material para o curso d''água?', categoria_11_id, versao_id, 6, true, true, NOW(), NOW()),
    (gen_random_uuid(), '11.07', 'A marca do nível d''água no bidim demonstra que houve transbordo?', categoria_11_id, versao_id, 7, true, true, NOW(), NOW());

    RAISE NOTICE 'Perguntas da LV 11 - PROTEÇÕES AMBIENTAIS inseridas';

    -- ===================================================================
    -- LV 12 - SUPRESSÃO VEGETAL
    -- ===================================================================
    
    -- Deletar perguntas existentes da categoria 12
    DELETE FROM perguntas_lv WHERE categoria_id = categoria_12_id;
    
    -- Inserir perguntas da LV 12
    INSERT INTO perguntas_lv (id, codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    (gen_random_uuid(), '12.01', 'O resgate de Germoplasma foi realizado?', categoria_12_id, versao_id, 1, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.02', 'Foi realizado a limpeza da área conforme a ASV emitida pela SEMAS/PA?', categoria_12_id, versao_id, 2, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.03', 'Foi realizado o armazenamento em pátios conforme a ASV emitida pela SEMAS/PA e POS da HYDRO?', categoria_12_id, versao_id, 3, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.04', 'O empilhamento da madeira por DAP está de acordo com o POS da HYDRO?', categoria_12_id, versao_id, 4, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.05', 'O traçamento, arraste e transporte da madeira estão sendo realizados conforme o POS da HYDRO?', categoria_12_id, versao_id, 5, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.06', 'A remoção de indivíduo de porte arbóreo por classe esta sendo executada?', categoria_12_id, versao_id, 6, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.07', 'Está havendo o cumprimento das recomendações da ASV emitida pela SEMAS/PA?', categoria_12_id, versao_id, 7, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.08', 'A captura, coleta, resgate, transporte e soltura de animais esta sendo realizado de acordo com a AU emitida pela SEMAS/PA?', categoria_12_id, versao_id, 8, true, true, NOW(), NOW()),
    (gen_random_uuid(), '12.09', 'A cubagem e/ou romaneio está ocorrendo conforme o POS da HYDRO?', categoria_12_id, versao_id, 9, true, true, NOW(), NOW());

    RAISE NOTICE 'Perguntas da LV 12 - SUPRESSÃO VEGETAL inseridas';

    -- ===================================================================
    -- LV 13 - EQUIPAMENTOS
    -- ===================================================================
    
    -- Deletar perguntas existentes da categoria 13
    DELETE FROM perguntas_lv WHERE categoria_id = categoria_13_id;
    
    -- Inserir perguntas da LV 13
    INSERT INTO perguntas_lv (id, codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    (gen_random_uuid(), '13.01', 'Existe algum tipo de vazamento (óleo hidráulico, combustível, graxa, etc)?', categoria_13_id, versao_id, 1, true, true, NOW(), NOW()),
    (gen_random_uuid(), '13.02', 'Existe kit de mitigação ambiental na frente de serviço do equipamento?', categoria_13_id, versao_id, 2, true, true, NOW(), NOW()),
    (gen_random_uuid(), '13.03', 'Os operadores sabem o que fazer quando acontecer alguma ocorrência ambiental?', categoria_13_id, versao_id, 3, true, true, NOW(), NOW()),
    (gen_random_uuid(), '13.04', 'O equipamento está livre de resíduos?', categoria_13_id, versao_id, 4, true, true, NOW(), NOW()),
    (gen_random_uuid(), '13.05', 'As mangueiras e conexões estão em bom estado?', categoria_13_id, versao_id, 5, true, true, NOW(), NOW());

    RAISE NOTICE 'Perguntas da LV 13 - EQUIPAMENTOS inseridas';

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
WHERE codigo IN ('08', '09', '11', '12', '13')
ORDER BY codigo;

-- Verificar perguntas inseridas
SELECT 
    c.codigo as categoria_codigo,
    c.nome as categoria_nome,
    p.codigo as pergunta_codigo,
    p.pergunta,
    p.ordem,
    p.obrigatoria
FROM perguntas_lv p
JOIN categorias_lv c ON p.categoria_id = c.id
WHERE c.codigo IN ('08', '09', '11', '12', '13')
ORDER BY c.codigo, p.ordem;

-- Contar total de perguntas por categoria
SELECT 
    c.codigo,
    c.nome,
    COUNT(p.id) as total_perguntas
FROM categorias_lv c
LEFT JOIN perguntas_lv p ON c.id = p.categoria_id
WHERE c.codigo IN ('08', '09', '11', '12', '13')
GROUP BY c.codigo, c.nome
ORDER BY c.codigo; 