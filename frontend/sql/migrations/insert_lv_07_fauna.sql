-- Script para inserir perguntas da LV 07 - FAUNA
-- Lista de verificação para proteção da fauna local

-- ===================================================================
-- VERIFICAR E INSERIR CATEGORIA
-- ===================================================================

-- LV 07 - FAUNA
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categorias_lv WHERE codigo = '07') THEN
        INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
        VALUES ('07', 'FAUNA', 'Lista de verificação para proteção da fauna local', true, 7, NOW(), NOW());
        RAISE NOTICE 'Categoria 07 - FAUNA inserida';
    ELSE
        RAISE NOTICE 'Categoria 07 - FAUNA já existe';
    END IF;
END $$;

-- ===================================================================
-- VERIFICAR E INSERIR VERSÕES
-- ===================================================================

-- Verificar se existe versão "Revisão 01" para a LV
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

-- LV 07 - FAUNA
DO $$
DECLARE
    categoria_id UUID;
    versao_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO categoria_id FROM categorias_lv WHERE codigo = '07';
    SELECT id INTO versao_id FROM versoes_lv WHERE nome = 'Revisão 01' LIMIT 1;
    
    -- Deletar perguntas existentes (se houver)
    DELETE FROM perguntas_lv WHERE codigo LIKE '07.%';
    
    -- Inserir perguntas da LV 07
    INSERT INTO perguntas_lv (codigo, pergunta, categoria_id, versao_id, ordem, obrigatoria, ativa, created_at, updated_at) VALUES
    ('07.01', 'As atividades estão sendo realizadas em conformidade com as autorizações ambientais para fauna (SEMAS/PA, IBAMA)?', categoria_id, versao_id, 1, true, true, NOW(), NOW()),
    ('07.02', 'Existe sinalização adequada alertando sobre a presença de fauna silvestre nas áreas de trabalho?', categoria_id, versao_id, 2, true, true, NOW(), NOW()),
    ('07.03', 'Os trabalhadores foram treinados/orientados sobre procedimentos de proteção à fauna e como agir em caso de encontro com animais silvestres?', categoria_id, versao_id, 3, true, true, NOW(), NOW()),
    ('07.04', 'As atividades que geram ruído excessivo estão sendo realizadas nos horários permitidos e com medidas de mitigação?', categoria_id, versao_id, 4, true, true, NOW(), NOW()),
    ('07.05', 'Existe monitoramento da fauna nas áreas de influência das atividades?', categoria_id, versao_id, 5, true, true, NOW(), NOW()),
    ('07.06', 'As áreas de preservação permanente (APP) e reservas legais estão sendo respeitadas e protegidas?', categoria_id, versao_id, 6, true, true, NOW(), NOW()),
    ('07.07', 'Os corredores ecológicos e rotas de deslocamento da fauna estão sendo mantidos?', categoria_id, versao_id, 7, true, true, NOW(), NOW()),
    ('07.08', 'Em caso de encontro de fauna silvestre, os procedimentos de resgate e relocação estão sendo seguidos?', categoria_id, versao_id, 8, true, true, NOW(), NOW()),
    ('07.09', 'Existe controle de velocidade em estradas e vias internas para evitar atropelamento de animais?', categoria_id, versao_id, 9, true, true, NOW(), NOW()),
    ('07.10', 'As fontes de água utilizadas pela fauna local estão sendo preservadas e não contaminadas?', categoria_id, versao_id, 10, true, true, NOW(), NOW()),
    ('07.11', 'As atividades de supressão vegetal estão seguindo os protocolos de ahuyentamento de fauna?', categoria_id, versao_id, 11, true, true, NOW(), NOW()),
    ('07.12', 'Os resíduos orgânicos estão sendo adequadamente acondicionados para não atrair fauna indesejada?', categoria_id, versao_id, 12, true, true, NOW(), NOW()),
    ('07.13', 'Existe proibição de caça, captura, perseguição ou maus-tratos à fauna silvestre na área?', categoria_id, versao_id, 13, true, true, NOW(), NOW()),
    ('07.14', 'As instalações temporárias possuem barreiras ou dispositivos para evitar acesso de animais?', categoria_id, versao_id, 14, true, true, NOW(), NOW()),
    ('07.15', 'Em caso de acidentes envolvendo fauna, existe protocolo de comunicação aos órgãos competentes?', categoria_id, versao_id, 15, true, true, NOW(), NOW()),
    ('07.16', 'As atividades noturnas possuem iluminação adequada que não interfira no comportamento da fauna?', categoria_id, versao_id, 16, true, true, NOW(), NOW()),
    ('07.17', 'Os ninhos, tocas e abrigos naturais identificados estão sendo preservados?', categoria_id, versao_id, 17, true, true, NOW(), NOW()),
    ('07.18', 'Existe programa de educação ambiental sobre conservação da fauna para os trabalhadores?', categoria_id, versao_id, 18, true, true, NOW(), NOW()),
    ('07.19', 'As medidas compensatórias para fauna (quando aplicáveis) estão sendo implementadas?', categoria_id, versao_id, 19, true, true, NOW(), NOW()),
    ('07.20', 'O registro de ocorrências envolvendo fauna (avistamentos, resgates, acidentes) está sendo mantido atualizado?', categoria_id, versao_id, 20, true, true, NOW(), NOW());
    
    RAISE NOTICE 'Perguntas da LV 07 - FAUNA inseridas';
END $$;

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

-- Verificar categoria inserida
SELECT 
    codigo,
    nome,
    descricao,
    ativa,
    ordem
FROM categorias_lv 
WHERE codigo = '07';

-- Verificar perguntas inseridas
SELECT 
    p.codigo,
    p.pergunta,
    p.obrigatoria,
    p.ordem,
    c.nome as categoria
FROM perguntas_lv p
JOIN categorias_lv c ON p.categoria_id = c.id
WHERE p.codigo LIKE '07.%'
ORDER BY p.codigo;

-- Contar total de perguntas da LV 07
SELECT 
    SUBSTRING(p.codigo, 1, 2) as tipo_lv,
    COUNT(*) as total_perguntas
FROM perguntas_lv p
WHERE p.codigo LIKE '07.%'
GROUP BY SUBSTRING(p.codigo, 1, 2)
ORDER BY tipo_lv; 