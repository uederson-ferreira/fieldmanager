-- Script para atualizar os nomes das LVs conforme especificado
-- Seguindo o padrão da LV 12 - SUPRESSÃO VEGETAL

-- ===================================================================
-- LV 04 - PRODUTOS QUÍMICOS
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '04' OR nome ILIKE '%produtos%' OR nome ILIKE '%químicos%';

-- Atualizar o nome da LV 04 para "PRODUTOS QUÍMICOS"
UPDATE categorias_lv 
SET 
    nome = 'PRODUTOS QUÍMICOS',
    descricao = 'Gestão e controle de produtos químicos',
    updated_at = NOW()
WHERE codigo = '04';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '04';

-- Se não existir a categoria 04, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '04',
    'PRODUTOS QUÍMICOS',
    'Gestão e controle de produtos químicos',
    true,
    4,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '04'
);

-- ===================================================================
-- LV 05 - COMBOIO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '05' OR nome ILIKE '%comboio%';

-- Atualizar o nome da LV 05 para "COMBOIO"
UPDATE categorias_lv 
SET 
    nome = 'COMBOIO',
    descricao = 'Gestão de comboios, documentação, segurança e equipamentos de transporte',
    updated_at = NOW()
WHERE codigo = '05';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '05';

-- Se não existir a categoria 05, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '05',
    'COMBOIO',
    'Gestão de comboios, documentação, segurança e equipamentos de transporte',
    true,
    5,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '05'
);

-- ===================================================================
-- LV 06 - GERADOR.BOMBA
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '06' OR nome ILIKE '%gerador%' OR nome ILIKE '%bomba%';

-- Atualizar o nome da LV 06 para "GERADOR.BOMBA"
UPDATE categorias_lv 
SET 
    nome = 'GERADOR.BOMBA',
    descricao = 'Gestão de geradores e bombas',
    updated_at = NOW()
WHERE codigo = '06';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '06';

-- Se não existir a categoria 06, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '06',
    'GERADOR.BOMBA',
    'Gestão de geradores e bombas',
    true,
    6,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '06'
);

-- ===================================================================
-- LV 08 - CONCRETO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '08' OR nome ILIKE '%concreto%';

-- Atualizar o nome da LV 08 para "CONCRETO"
UPDATE categorias_lv 
SET 
    nome = 'CONCRETO',
    descricao = 'Gestão de resíduos de concreto e atividades de concretagem',
    updated_at = NOW()
WHERE codigo = '08';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '08';

-- Se não existir a categoria 08, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '08',
    'CONCRETO',
    'Gestão de resíduos de concreto e atividades de concretagem',
    true,
    8,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '08'
);

-- ===================================================================
-- LV 09 - BANHEIRO QUÍMICO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '09' OR nome ILIKE '%banheiro%' OR nome ILIKE '%químico%';

-- Atualizar o nome da LV 09 para "BANHEIRO QUÍMICO"
UPDATE categorias_lv 
SET 
    nome = 'BANHEIRO QUÍMICO',
    descricao = 'Gestão de banheiros químicos e higiene',
    updated_at = NOW()
WHERE codigo = '09';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '09';

-- Se não existir a categoria 09, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '09',
    'BANHEIRO QUÍMICO',
    'Gestão de banheiros químicos e higiene',
    true,
    9,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '09'
);

-- ===================================================================
-- LV 11 - PROTEÇÕES AMBIENTAIS
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '11' OR nome ILIKE '%proteções%' OR nome ILIKE '%ambientais%';

-- Atualizar o nome da LV 11 para "PROTEÇÕES AMBIENTAIS"
UPDATE categorias_lv 
SET 
    nome = 'PROTEÇÕES AMBIENTAIS',
    descricao = 'Proteções ambientais e controle de erosão',
    updated_at = NOW()
WHERE codigo = '11';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '11';

-- Se não existir a categoria 11, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '11',
    'PROTEÇÕES AMBIENTAIS',
    'Proteções ambientais e controle de erosão',
    true,
    11,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '11'
);

-- ===================================================================
-- LV 13 - EQUIPAMENTOS
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '13' OR nome ILIKE '%equipamentos%';

-- Atualizar o nome da LV 13 para "EQUIPAMENTOS"
UPDATE categorias_lv 
SET 
    nome = 'EQUIPAMENTOS',
    descricao = 'Gestão e manutenção de equipamentos',
    updated_at = NOW()
WHERE codigo = '13';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '13';

-- Se não existir a categoria 13, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '13',
    'EQUIPAMENTOS',
    'Gestão e manutenção de equipamentos',
    true,
    13,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '13'
);

-- ===================================================================
-- LV 14 - REVEGETAÇÃO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '14' OR nome ILIKE '%revegetação%';

-- Atualizar o nome da LV 14 para "REVEGETAÇÃO"
UPDATE categorias_lv 
SET 
    nome = 'REVEGETAÇÃO',
    descricao = 'Atividades de revegetação e recuperação ambiental',
    updated_at = NOW()
WHERE codigo = '14';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '14';

-- Se não existir a categoria 14, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '14',
    'REVEGETAÇÃO',
    'Atividades de revegetação e recuperação ambiental',
    true,
    14,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '14'
);

-- ===================================================================
-- LV 15 - 5S
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '15' OR nome ILIKE '%5s%';

-- Atualizar o nome da LV 15 para "5S"
UPDATE categorias_lv 
SET 
    nome = '5S',
    descricao = 'Programa 5S - organização e limpeza',
    updated_at = NOW()
WHERE codigo = '15';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '15';

-- Se não existir a categoria 15, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '15',
    '5S',
    'Programa 5S - organização e limpeza',
    true,
    15,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '15'
);

-- ===================================================================
-- LV 16 - DESMOBILIZAÇÃO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '16' OR nome ILIKE '%desmobilização%';

-- Atualizar o nome da LV 16 para "DESMOBILIZAÇÃO"
UPDATE categorias_lv 
SET 
    nome = 'DESMOBILIZAÇÃO',
    descricao = 'Processo de desmobilização de obras',
    updated_at = NOW()
WHERE codigo = '16';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '16';

-- Se não existir a categoria 16, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '16',
    'DESMOBILIZAÇÃO',
    'Processo de desmobilização de obras',
    true,
    16,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '16'
);

-- ===================================================================
-- LV 17 - DESMOBILIZAÇÃO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '17' OR nome ILIKE '%desmobilização%';

-- Atualizar o nome da LV 17 para "DESMOBILIZAÇÃO"
UPDATE categorias_lv 
SET 
    nome = 'DESMOBILIZAÇÃO',
    descricao = 'Processo de desmobilização de obras',
    updated_at = NOW()
WHERE codigo = '17';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '17';

-- Se não existir a categoria 17, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '17',
    'DESMOBILIZAÇÃO',
    'Processo de desmobilização de obras',
    true,
    17,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '17'
);

-- ===================================================================
-- LV 18 - ASSOREAMENTO E VAZÃO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '18' OR nome ILIKE '%assoreamento%' OR nome ILIKE '%vazão%';

-- Atualizar o nome da LV 18 para "ASSOREAMENTO E VAZÃO"
UPDATE categorias_lv 
SET 
    nome = 'ASSOREAMENTO E VAZÃO',
    descricao = 'Controle de assoreamento e monitoramento de vazão',
    updated_at = NOW()
WHERE codigo = '18';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '18';

-- Se não existir a categoria 18, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '18',
    'ASSOREAMENTO E VAZÃO',
    'Controle de assoreamento e monitoramento de vazão',
    true,
    18,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '18'
);

-- ===================================================================
-- LV 19 - FEIÇÕES EROSIVAS
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '19' OR nome ILIKE '%feições%' OR nome ILIKE '%erosivas%';

-- Atualizar o nome da LV 19 para "FEIÇÕES EROSIVAS"
UPDATE categorias_lv 
SET 
    nome = 'FEIÇÕES EROSIVAS',
    descricao = 'Monitoramento e controle de feições erosivas',
    updated_at = NOW()
WHERE codigo = '19';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '19';

-- Se não existir a categoria 19, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '19',
    'FEIÇÕES EROSIVAS',
    'Monitoramento e controle de feições erosivas',
    true,
    19,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '19'
);

-- ===================================================================
-- LV 20 - NÍVEIS DE PRESSÃO SONORA E V
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '20' OR nome ILIKE '%pressão%' OR nome ILIKE '%sonora%';

-- Atualizar o nome da LV 20 para "NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO"
UPDATE categorias_lv 
SET 
    nome = 'NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO',
    descricao = 'Monitoramento de níveis de pressão sonora e vibração',
    updated_at = NOW()
WHERE codigo = '20';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '20';

-- Se não existir a categoria 20, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '20',
    'NÍVEIS DE PRESSÃO SONORA E VIBRAÇÃO',
    'Monitoramento de níveis de pressão sonora e vibração',
    true,
    20,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '20'
);

-- ===================================================================
-- LV 21 - EMISSÕES ATMOSFÉRICAS
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '21' OR nome ILIKE '%emissões%' OR nome ILIKE '%atmosféricas%';

-- Atualizar o nome da LV 21 para "EMISSÕES ATMOSFÉRICAS"
UPDATE categorias_lv 
SET 
    nome = 'EMISSÕES ATMOSFÉRICAS',
    descricao = 'Controle e monitoramento de emissões atmosféricas',
    updated_at = NOW()
WHERE codigo = '21';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '21';

-- Se não existir a categoria 21, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '21',
    'EMISSÕES ATMOSFÉRICAS',
    'Controle e monitoramento de emissões atmosféricas',
    true,
    21,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '21'
);

-- ===================================================================
-- LV 22 - TRANSPOSIÇÃO DOS TALVEGUES
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '22' OR nome ILIKE '%transposição%' OR nome ILIKE '%talvegues%';

-- Atualizar o nome da LV 22 para "TRANSPOSIÇÃO DOS TALVEGUES"
UPDATE categorias_lv 
SET 
    nome = 'TRANSPOSIÇÃO DOS TALVEGUES',
    descricao = 'Transposição de talvegues e cursos d''água',
    updated_at = NOW()
WHERE codigo = '22';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '22';

-- Se não existir a categoria 22, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '22',
    'TRANSPOSIÇÃO DOS TALVEGUES',
    'Transposição de talvegues e cursos d''água',
    true,
    22,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '22'
);

-- ===================================================================
-- LV 23 - EFLUENTES
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '23' OR nome ILIKE '%efluentes%';

-- Atualizar o nome da LV 23 para "EFLUENTES"
UPDATE categorias_lv 
SET 
    nome = 'EFLUENTES',
    descricao = 'Gestão e tratamento de efluentes',
    updated_at = NOW()
WHERE codigo = '23';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '23';

-- Se não existir a categoria 23, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '23',
    'EFLUENTES',
    'Gestão e tratamento de efluentes',
    true,
    23,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '23'
);

-- ===================================================================
-- LV 24 - GERENCIAMENTO DE RESÍDUOS
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '24' OR nome ILIKE '%gerenciamento%' OR nome ILIKE '%resíduos%';

-- Atualizar o nome da LV 24 para "GERENCIAMENTO DE RESÍDUOS"
UPDATE categorias_lv 
SET 
    nome = 'GERENCIAMENTO DE RESÍDUOS',
    descricao = 'Gerenciamento integrado de resíduos',
    updated_at = NOW()
WHERE codigo = '24';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '24';

-- Se não existir a categoria 24, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '24',
    'GERENCIAMENTO DE RESÍDUOS',
    'Gerenciamento integrado de resíduos',
    true,
    24,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '24'
);

-- ===================================================================
-- LV 25 - PLANTIO COMPENSATÓRIO
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '25' OR nome ILIKE '%plantio%' OR nome ILIKE '%compensatório%';

-- Atualizar o nome da LV 25 para "PLANTIO COMPENSATÓRIO"
UPDATE categorias_lv 
SET 
    nome = 'PLANTIO COMPENSATÓRIO',
    descricao = 'Atividades de plantio compensatório',
    updated_at = NOW()
WHERE codigo = '25';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '25';

-- Se não existir a categoria 25, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '25',
    'PLANTIO COMPENSATÓRIO',
    'Atividades de plantio compensatório',
    true,
    25,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '25'
);

-- ===================================================================
-- LV 26 - RECUPERAÇÃO DE APP
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '26' OR nome ILIKE '%recuperação%' OR nome ILIKE '%app%';

-- Atualizar o nome da LV 26 para "RECUPERAÇÃO DE APP"
UPDATE categorias_lv 
SET 
    nome = 'RECUPERAÇÃO DE APP',
    descricao = 'Recuperação de Áreas de Preservação Permanente',
    updated_at = NOW()
WHERE codigo = '26';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '26';

-- Se não existir a categoria 26, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '26',
    'RECUPERAÇÃO DE APP',
    'Recuperação de Áreas de Preservação Permanente',
    true,
    26,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '26'
);

-- ===================================================================
-- LV 27 - EDUCAÇÃO AMBIENTAL
-- ===================================================================

-- Verificar se existe categoria com nome incorreto
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '27' OR nome ILIKE '%educação%' OR nome ILIKE '%ambiental%';

-- Atualizar o nome da LV 27 para "EDUCAÇÃO AMBIENTAL"
UPDATE categorias_lv 
SET 
    nome = 'EDUCAÇÃO AMBIENTAL',
    descricao = 'Programas de educação ambiental',
    updated_at = NOW()
WHERE codigo = '27';

-- Verificar se a atualização foi feita corretamente
SELECT 
    id,
    codigo,
    nome,
    descricao,
    ativa,
    ordem,
    created_at,
    updated_at
FROM categorias_lv 
WHERE codigo = '27';

-- Se não existir a categoria 27, inserir
INSERT INTO categorias_lv (codigo, nome, descricao, ativa, ordem, created_at, updated_at)
SELECT 
    '27',
    'EDUCAÇÃO AMBIENTAL',
    'Programas de educação ambiental',
    true,
    27,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_lv WHERE codigo = '27'
);

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

-- Verificar resultado final de todas as categorias
SELECT 
    codigo,
    nome,
    descricao,
    ativa,
    ordem
FROM categorias_lv 
ORDER BY ordem; 