-- Script para inserir perguntas das LVs 21, 22 e 23
-- Baseado nas tabelas fornecidas

-- ===================================================================
-- VERIFICAR E INSERIR CATEGORIAS
-- ===================================================================

-- LV 21 - MONITORAMENTO DE FAUNA
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '21') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('21', 'MONITORAMENTO DE FAUNA', 'Programa de monitoramento de fauna', true, 21, NOW(), NOW());
        RAISE NOTICE 'Categoria 21 - MONITORAMENTO DE FAUNA inserida';
    ELSE
        RAISE NOTICE 'Categoria 21 - MONITORAMENTO DE FAUNA já existe';
    END IF;
END $$;

-- LV 22 - MONITORAMENTO DE FLORA
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '22') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('22', 'MONITORAMENTO DE FLORA', 'Programa de monitoramento de flora', true, 22, NOW(), NOW());
        RAISE NOTICE 'Categoria 22 - MONITORAMENTO DE FLORA inserida';
    ELSE
        RAISE NOTICE 'Categoria 22 - MONITORAMENTO DE FLORA já existe';
    END IF;
END $$;

-- LV 23 - MONITORAMENTO DE QUALIDADE DO AR
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '23') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('23', 'MONITORAMENTO DE QUALIDADE DO AR', 'Programa de monitoramento da qualidade do ar', true, 23, NOW(), NOW());
        RAISE NOTICE 'Categoria 23 - MONITORAMENTO DE QUALIDADE DO AR inserida';
    ELSE
        RAISE NOTICE 'Categoria 23 - MONITORAMENTO DE QUALIDADE DO AR já existe';
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

-- LV 21 - MONITORAMENTO DE FAUNA
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '21';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '21.%';
    
    -- Inserir perguntas da LV 21
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('21.01', 'As campanhas de monitoramento estão sendo executadas conforme o cronograma?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('21.02', 'Os métodos de amostragem estão sendo aplicados corretamente?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('21.03', 'Os equipamentos de campo estão calibrados e funcionando adequadamente?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('21.04', 'Os relatórios de monitoramento foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('21.05', 'Os resultados obtidos estão conforme os padrões estabelecidos?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('21.06', 'As espécies identificadas estão sendo registradas corretamente?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('21.07', 'Os pontos de amostragem estão sendo respeitados conforme o plano?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('21.08', 'Há documentação de espécies raras ou ameaçadas encontradas?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('21.09', 'As tendências populacionais estão sendo analisadas?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('21.10', 'Os dados coletados estão sendo armazenados e organizados adequadamente?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 21 - MONITORAMENTO DE FAUNA inseridas';
END $$;

-- LV 22 - MONITORAMENTO DE FLORA
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '22';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '22.%';
    
    -- Inserir perguntas da LV 22
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('22.01', 'As campanhas de monitoramento estão sendo executadas conforme o cronograma?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('22.02', 'Os métodos de amostragem estão sendo aplicados corretamente?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('22.03', 'Os equipamentos de campo estão calibrados e funcionando adequadamente?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('22.04', 'Os relatórios de monitoramento foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('22.05', 'Os resultados obtidos estão conforme os padrões estabelecidos?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('22.06', 'As espécies vegetais identificadas estão sendo registradas corretamente?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('22.07', 'Os pontos de amostragem estão sendo respeitados conforme o plano?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('22.08', 'Há documentação de espécies raras ou ameaçadas encontradas?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('22.09', 'As tendências de cobertura vegetal estão sendo analisadas?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('22.10', 'Os dados coletados estão sendo armazenados e organizados adequadamente?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 22 - MONITORAMENTO DE FLORA inseridas';
END $$;

-- LV 23 - MONITORAMENTO DE QUALIDADE DO AR
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '23';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '23.%';
    
    -- Inserir perguntas da LV 23
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('23.01', 'As campanhas de monitoramento estão sendo executadas conforme o cronograma?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('23.02', 'Os métodos de amostragem estão sendo aplicados corretamente?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('23.03', 'Os equipamentos de campo estão calibrados e funcionando adequadamente?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('23.04', 'Os relatórios de monitoramento foram recebidos e revisados?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('23.05', 'Os resultados obtidos estão conforme os padrões estabelecidos?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('23.06', 'Os parâmetros de qualidade do ar estão sendo medidos corretamente?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('23.07', 'Os pontos de amostragem estão sendo respeitados conforme o plano?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('23.08', 'Há documentação de excedências nos padrões de qualidade do ar?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('23.09', 'As tendências de qualidade do ar estão sendo analisadas?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('23.10', 'Os dados coletados estão sendo armazenados e organizados adequadamente?', categoria_id, versao_id, 10, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 23 - MONITORAMENTO DE QUALIDADE DO AR inseridas';
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
WHERE codigo IN ('21', '22', '23')
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
WHERE p.codigo LIKE '21.%' OR p.codigo LIKE '22.%' OR p.codigo LIKE '23.%'
ORDER BY p.codigo;

-- Contar total de perguntas por LV
SELECT 
    SUBSTRING(p.codigo, 1, 2) as tipo_lv,
    COUNT(*) as total_perguntas
FROM perguntas_lv p
WHERE p.codigo LIKE '21.%' OR p.codigo LIKE '22.%' OR p.codigo LIKE '23.%'
GROUP BY SUBSTRING(p.codigo, 1, 2)
ORDER BY tipo_lv; 