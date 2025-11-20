-- ================================================================
-- FIELDMANAGER v2.0 - SEED MÓDULOS MULTI-DOMÍNIO
-- Expansão de templates para validar generalização
-- ================================================================

-- ================================================================
-- MÓDULO 1: NR-10 - INSTALAÇÕES ELÉTRICAS (SEGURANÇA)
-- ================================================================

INSERT INTO modulos_sistema (
  id,
  dominio_id,
  tenant_id,
  codigo,
  nome,
  descricao,
  tipo_modulo,
  configuracao,
  icone,
  ordem,
  ativo,
  template
)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid,
  (SELECT id FROM dominios WHERE codigo = 'seguranca'), -- Domínio: Segurança
  NULL,
  'nr10-instalacoes-eletricas',
  'NR-10 - Instalações Elétricas',
  'Checklist de Segurança para Trabalhos em Instalações Elétricas',
  'checklist',
  '{
    "nr": "NR-10",
    "revisao": "Portaria MTE 3.214/78 - Atualização 2023",
    "campo_aplicacao": "Instalações elétricas e serviços com eletricidade",
    "requer_assinatura": true,
    "score_minimo_aprovacao": 85
  }'::jsonb,
  'Zap',
  2,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111'
);

-- Perguntas NR-10
INSERT INTO perguntas_modulos (id, modulo_id, codigo, pergunta, tipo_resposta, obrigatoria, permite_foto, permite_observacao, categoria, subcategoria, ordem, ativo, metadados)
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.001', 'O trabalhador possui certificado NR-10 válido?', 'boolean', true, true, true, 'Capacitação', 'Treinamento', 1, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.001')
UNION ALL
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.002', 'Há sinalização de risco elétrico adequada?', 'boolean', true, true, true, 'Sinalização', 'Placas', 2, true, '{"peso": 8, "critico": false}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.002')
UNION ALL
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.003', 'Os equipamentos de proteção individual (luvas, capacete classe B) estão em uso?', 'boolean', true, true, true, 'EPI', 'Proteção Individual', 3, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.003')
UNION ALL
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.004', 'A instalação está desenergizada e bloqueada?', 'boolean', true, true, true, 'Procedimentos', 'Bloqueio', 4, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.004')
UNION ALL
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.005', 'Há teste de ausência de tensão realizado?', 'boolean', true, true, true, 'Procedimentos', 'Medição', 5, true, '{"peso": 9, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.005')
UNION ALL
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.006', 'Há aterramento temporário instalado?', 'boolean', true, true, true, 'Equipamentos', 'Aterramento', 6, true, '{"peso": 8, "critico": false}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.006')
UNION ALL
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.007', 'Há isolação da área de trabalho?', 'boolean', true, true, true, 'Ambiente', 'Isolamento', 7, true, '{"peso": 7, "critico": false}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.007')
UNION ALL
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-111111111111'::uuid, 'NR10.008', 'Existe Permissão de Trabalho (PT) aprovada?', 'boolean', true, true, true, 'Documentação', 'Autorizações', 8, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'a1b2c3d4-e5f6-7890-abcd-111111111111')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'a1b2c3d4-e5f6-7890-abcd-111111111111' AND codigo = 'NR10.008');

-- ================================================================
-- MÓDULO 2: NR-33 - ESPAÇOS CONFINADOS (SEGURANÇA)
-- ================================================================

INSERT INTO modulos_sistema (
  id,
  dominio_id,
  tenant_id,
  codigo,
  nome,
  descricao,
  tipo_modulo,
  configuracao,
  icone,
  ordem,
  ativo,
  template
)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid,
  (SELECT id FROM dominios WHERE codigo = 'seguranca'), -- Domínio: Segurança
  NULL,
  'nr33-espacos-confinados',
  'NR-33 - Espaços Confinados',
  'Checklist de Segurança para Trabalho em Espaços Confinados',
  'checklist',
  '{
    "nr": "NR-33",
    "revisao": "Portaria MTE 3.214/78 - Atualização 2023",
    "campo_aplicacao": "Trabalhos em espaços confinados",
    "requer_assinatura": true,
    "score_minimo_aprovacao": 90
  }'::jsonb,
  'Boxes',
  3,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222'
);

-- Perguntas NR-33
INSERT INTO perguntas_modulos (id, modulo_id, codigo, pergunta, tipo_resposta, obrigatoria, permite_foto, permite_observacao, categoria, subcategoria, ordem, ativo, metadados)
SELECT gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid, 'NR33.001', 'O trabalhador possui treinamento NR-33 válido?', 'boolean', true, true, true, 'Capacitação', 'Treinamento', 1, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'b2c3d4e5-f6a7-8901-bcde-222222222222' AND codigo = 'NR33.001')
UNION ALL
SELECT gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid, 'NR33.002', 'Foi realizada análise atmosférica (O2, gases tóxicos)?', 'boolean', true, true, true, 'Medições', 'Atmosfera', 2, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'b2c3d4e5-f6a7-8901-bcde-222222222222' AND codigo = 'NR33.002')
UNION ALL
SELECT gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid, 'NR33.003', 'Há ventilação adequada no espaço confinado?', 'boolean', true, true, true, 'Ventilação', 'Ar', 3, true, '{"peso": 9, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'b2c3d4e5-f6a7-8901-bcde-222222222222' AND codigo = 'NR33.003')
UNION ALL
SELECT gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid, 'NR33.004', 'Há vigia posicionado na entrada do espaço?', 'boolean', true, true, true, 'Equipe', 'Vigia', 4, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'b2c3d4e5-f6a7-8901-bcde-222222222222' AND codigo = 'NR33.004')
UNION ALL
SELECT gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid, 'NR33.005', 'Há sistema de comunicação operante?', 'boolean', true, true, true, 'Comunicação', 'Equipamentos', 5, true, '{"peso": 8, "critico": false}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'b2c3d4e5-f6a7-8901-bcde-222222222222' AND codigo = 'NR33.005')
UNION ALL
SELECT gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid, 'NR33.006', 'Há equipamento de resgate disponível?', 'boolean', true, true, true, 'Resgate', 'Equipamentos', 6, true, '{"peso": 9, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'b2c3d4e5-f6a7-8901-bcde-222222222222' AND codigo = 'NR33.006')
UNION ALL
SELECT gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-222222222222'::uuid, 'NR33.007', 'A Permissão de Entrada e Trabalho (PET) foi emitida?', 'boolean', true, true, true, 'Documentação', 'Autorizações', 7, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'b2c3d4e5-f6a7-8901-bcde-222222222222')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'b2c3d4e5-f6a7-8901-bcde-222222222222' AND codigo = 'NR33.007');

-- ================================================================
-- MÓDULO 3: ISO 9001 - AUDITORIA INTERNA (QUALIDADE)
-- ================================================================

INSERT INTO modulos_sistema (
  id,
  dominio_id,
  tenant_id,
  codigo,
  nome,
  descricao,
  tipo_modulo,
  configuracao,
  icone,
  ordem,
  ativo,
  template
)
SELECT
  'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid,
  (SELECT id FROM dominios WHERE codigo = 'qualidade'), -- Domínio: Qualidade
  NULL,
  'iso9001-auditoria-interna',
  'ISO 9001 - Auditoria Interna',
  'Checklist de Auditoria Interna ISO 9001:2015',
  'auditoria',
  '{
    "norma": "ISO 9001:2015",
    "tipo_auditoria": "Interna",
    "clausulas": ["4", "5", "6", "7", "8", "9", "10"],
    "requer_assinatura": true
  }'::jsonb,
  'ClipboardCheck',
  1,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333'
);

-- Perguntas ISO 9001
INSERT INTO perguntas_modulos (id, modulo_id, codigo, pergunta, tipo_resposta, obrigatoria, permite_foto, permite_observacao, categoria, subcategoria, ordem, ativo, metadados)
SELECT gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid, 'ISO9001.4.1', 'A organização determinou questões internas e externas pertinentes?', 'boolean', true, true, true, 'Contexto', 'Cláusula 4', 1, true, '{"clausula": "4.1", "peso": 8}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'c3d4e5f6-a7b8-9012-cdef-333333333333' AND codigo = 'ISO9001.4.1')
UNION ALL
SELECT gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid, 'ISO9001.5.1', 'A alta direção demonstra liderança e comprometimento com o SGQ?', 'boolean', true, true, true, 'Liderança', 'Cláusula 5', 2, true, '{"clausula": "5.1", "peso": 9}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'c3d4e5f6-a7b8-9012-cdef-333333333333' AND codigo = 'ISO9001.5.1')
UNION ALL
SELECT gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid, 'ISO9001.6.1', 'Há ações para abordar riscos e oportunidades?', 'boolean', true, true, true, 'Planejamento', 'Cláusula 6', 3, true, '{"clausula": "6.1", "peso": 8}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'c3d4e5f6-a7b8-9012-cdef-333333333333' AND codigo = 'ISO9001.6.1')
UNION ALL
SELECT gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid, 'ISO9001.7.1', 'Os recursos necessários ao SGQ estão disponíveis?', 'boolean', true, true, true, 'Apoio', 'Cláusula 7', 4, true, '{"clausula": "7.1", "peso": 7}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'c3d4e5f6-a7b8-9012-cdef-333333333333' AND codigo = 'ISO9001.7.1')
UNION ALL
SELECT gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid, 'ISO9001.8.1', 'Os processos necessários ao SGQ estão implementados?', 'boolean', true, true, true, 'Operação', 'Cláusula 8', 5, true, '{"clausula": "8.1", "peso": 9}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'c3d4e5f6-a7b8-9012-cdef-333333333333' AND codigo = 'ISO9001.8.1')
UNION ALL
SELECT gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid, 'ISO9001.9.1', 'Há monitoramento, medição, análise e avaliação do SGQ?', 'boolean', true, true, true, 'Avaliação', 'Cláusula 9', 6, true, '{"clausula": "9.1", "peso": 8}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'c3d4e5f6-a7b8-9012-cdef-333333333333' AND codigo = 'ISO9001.9.1')
UNION ALL
SELECT gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-333333333333'::uuid, 'ISO9001.10.1', 'Há tratamento de não conformidades e ações corretivas?', 'boolean', true, true, true, 'Melhoria', 'Cláusula 10', 7, true, '{"clausula": "10.1", "peso": 9}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'c3d4e5f6-a7b8-9012-cdef-333333333333')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'c3d4e5f6-a7b8-9012-cdef-333333333333' AND codigo = 'ISO9001.10.1');

-- ================================================================
-- MÓDULO 4: 5S - CHECKLIST DE CONFORMIDADE (QUALIDADE)
-- ================================================================

INSERT INTO modulos_sistema (
  id,
  dominio_id,
  tenant_id,
  codigo,
  nome,
  descricao,
  tipo_modulo,
  configuracao,
  icone,
  ordem,
  ativo,
  template
)
SELECT
  'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid,
  (SELECT id FROM dominios WHERE codigo = 'qualidade'), -- Domínio: Qualidade
  NULL,
  '5s-checklist-conformidade',
  '5S - Checklist de Conformidade',
  'Avaliação dos 5 Sensos (Seiri, Seiton, Seiso, Seiketsu, Shitsuke)',
  'checklist',
  '{
    "metodologia": "5S",
    "sensos": ["Seiri", "Seiton", "Seiso", "Seiketsu", "Shitsuke"],
    "score_minimo_aprovacao": 75
  }'::jsonb,
  'Sparkles',
  2,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444'
);

-- Perguntas 5S
INSERT INTO perguntas_modulos (id, modulo_id, codigo, pergunta, tipo_resposta, obrigatoria, permite_foto, permite_observacao, categoria, subcategoria, ordem, ativo, metadados)
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SEIRI.001', 'A área está livre de itens desnecessários?', 'boolean', true, true, true, 'Seiri', 'Senso de Utilização', 1, true, '{"senso": 1, "peso": 10}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SEIRI.001')
UNION ALL
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SEIRI.002', 'Materiais e ferramentas são utilizados regularmente?', 'boolean', true, true, true, 'Seiri', 'Senso de Utilização', 2, true, '{"senso": 1, "peso": 8}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SEIRI.002')
UNION ALL
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SEITON.001', 'Tudo tem um lugar definido e identificado?', 'boolean', true, true, true, 'Seiton', 'Senso de Ordenação', 3, true, '{"senso": 2, "peso": 10}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SEITON.001')
UNION ALL
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SEITON.002', 'Itens de uso frequente estão de fácil acesso?', 'boolean', true, true, true, 'Seiton', 'Senso de Ordenação', 4, true, '{"senso": 2, "peso": 8}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SEITON.002')
UNION ALL
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SEISO.001', 'A área de trabalho está limpa e organizada?', 'boolean', true, true, true, 'Seiso', 'Senso de Limpeza', 5, true, '{"senso": 3, "peso": 10}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SEISO.001')
UNION ALL
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SEISO.002', 'Equipamentos estão limpos e em bom estado?', 'boolean', true, true, true, 'Seiso', 'Senso de Limpeza', 6, true, '{"senso": 3, "peso": 9}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SEISO.002')
UNION ALL
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SEIKETSU.001', 'Há padrões visuais estabelecidos (cores, etiquetas)?', 'boolean', true, true, true, 'Seiketsu', 'Senso de Padronização', 7, true, '{"senso": 4, "peso": 8}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SEIKETSU.001')
UNION ALL
SELECT gen_random_uuid(), 'd4e5f6a7-b8c9-0123-def0-444444444444'::uuid, '5S.SHITSUKE.001', 'Os 4 primeiros sensos são praticados regularmente?', 'boolean', true, true, true, 'Shitsuke', 'Senso de Disciplina', 8, true, '{"senso": 5, "peso": 10}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'd4e5f6a7-b8c9-0123-def0-444444444444')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'd4e5f6a7-b8c9-0123-def0-444444444444' AND codigo = '5S.SHITSUKE.001');

-- ================================================================
-- MÓDULO 5: PCMSO - CONTROLE DE ASO (SAÚDE)
-- ================================================================

INSERT INTO modulos_sistema (
  id,
  dominio_id,
  tenant_id,
  codigo,
  nome,
  descricao,
  tipo_modulo,
  configuracao,
  icone,
  ordem,
  ativo,
  template
)
SELECT
  'e5f6a7b8-c9d0-1234-efa1-555555555555'::uuid,
  (SELECT id FROM dominios WHERE codigo = 'saude'), -- Domínio: Saúde
  NULL,
  'pcmso-controle-aso',
  'PCMSO - Controle de ASO',
  'Checklist de Controle de Atestados de Saúde Ocupacional',
  'formulario',
  '{
    "nr": "NR-7",
    "tipo_exame": ["Admissional", "Periódico", "Retorno ao Trabalho", "Mudança de Função", "Demissional"],
    "validade_meses": 12
  }'::jsonb,
  'Stethoscope',
  1,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM modulos_sistema WHERE id = 'e5f6a7b8-c9d0-1234-efa1-555555555555'
);

-- Perguntas PCMSO
INSERT INTO perguntas_modulos (id, modulo_id, codigo, pergunta, tipo_resposta, obrigatoria, permite_foto, permite_observacao, categoria, subcategoria, ordem, ativo, metadados)
SELECT gen_random_uuid(), 'e5f6a7b8-c9d0-1234-efa1-555555555555'::uuid, 'PCMSO.001', 'O trabalhador possui ASO válido?', 'boolean', true, true, true, 'Documentação', 'ASO', 1, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'e5f6a7b8-c9d0-1234-efa1-555555555555')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'e5f6a7b8-c9d0-1234-efa1-555555555555' AND codigo = 'PCMSO.001')
UNION ALL
SELECT gen_random_uuid(), 'e5f6a7b8-c9d0-1234-efa1-555555555555'::uuid, 'PCMSO.002', 'O ASO foi emitido por médico do trabalho?', 'boolean', true, true, true, 'Documentação', 'Validade', 2, true, '{"peso": 9, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'e5f6a7b8-c9d0-1234-efa1-555555555555')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'e5f6a7b8-c9d0-1234-efa1-555555555555' AND codigo = 'PCMSO.002')
UNION ALL
SELECT gen_random_uuid(), 'e5f6a7b8-c9d0-1234-efa1-555555555555'::uuid, 'PCMSO.003', 'Todos os exames complementares foram realizados?', 'boolean', true, true, true, 'Exames', 'Complementares', 3, true, '{"peso": 8, "critico": false}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'e5f6a7b8-c9d0-1234-efa1-555555555555')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'e5f6a7b8-c9d0-1234-efa1-555555555555' AND codigo = 'PCMSO.003')
UNION ALL
SELECT gen_random_uuid(), 'e5f6a7b8-c9d0-1234-efa1-555555555555'::uuid, 'PCMSO.004', 'Há indicação de aptidão para a função?', 'boolean', true, true, true, 'Conclusão', 'Aptidão', 4, true, '{"peso": 10, "critico": true}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'e5f6a7b8-c9d0-1234-efa1-555555555555')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'e5f6a7b8-c9d0-1234-efa1-555555555555' AND codigo = 'PCMSO.004')
UNION ALL
SELECT gen_random_uuid(), 'e5f6a7b8-c9d0-1234-efa1-555555555555'::uuid, 'PCMSO.005', 'Há restrições médicas documentadas?', 'boolean', false, true, true, 'Restrições', 'Limitações', 5, true, '{"peso": 7, "critico": false}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'e5f6a7b8-c9d0-1234-efa1-555555555555')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'e5f6a7b8-c9d0-1234-efa1-555555555555' AND codigo = 'PCMSO.005')
UNION ALL
SELECT gen_random_uuid(), 'e5f6a7b8-c9d0-1234-efa1-555555555555'::uuid, 'PCMSO.006', 'O trabalhador foi orientado sobre os riscos ocupacionais?', 'boolean', true, true, true, 'Orientação', 'Riscos', 6, true, '{"peso": 8, "critico": false}'::jsonb
WHERE EXISTS (SELECT 1 FROM modulos_sistema WHERE id = 'e5f6a7b8-c9d0-1234-efa1-555555555555')
  AND NOT EXISTS (SELECT 1 FROM perguntas_modulos WHERE modulo_id = 'e5f6a7b8-c9d0-1234-efa1-555555555555' AND codigo = 'PCMSO.006');

-- ================================================================
-- VERIFICAÇÃO
-- ================================================================

SELECT
  '📊 RESUMO DE MÓDULOS MULTI-DOMÍNIO' as info,
  '' as modulo,
  0::bigint as total_perguntas
UNION ALL
SELECT
  '',
  codigo as modulo,
  (SELECT COUNT(*) FROM perguntas_modulos WHERE modulo_id = ms.id) as total_perguntas
FROM modulos_sistema ms
WHERE ms.template = true
ORDER BY total_perguntas DESC;

-- ================================================================
-- ✅ SEED COMPLETO!
-- ================================================================
--
-- 🎯 5 NOVOS MÓDULOS CRIADOS:
--
-- 1. NR-10 - Instalações Elétricas (Segurança) - 8 perguntas
-- 2. NR-33 - Espaços Confinados (Segurança) - 7 perguntas
-- 3. ISO 9001 - Auditoria Interna (Qualidade) - 7 perguntas
-- 4. 5S - Checklist de Conformidade (Qualidade) - 8 perguntas
-- 5. PCMSO - Controle de ASO (Saúde) - 6 perguntas
--
-- TOTAL: 36 perguntas + NR-35 (10 perguntas) = 46 perguntas
-- TOTAL DE MÓDULOS: 6 (1 já existia + 5 novos)
--
-- ✅ Validação da Generalização Multi-Domínio COMPLETA!
-- ================================================================
