-- ================================================================
-- FIELDMANAGER - POPULAÇÃO DE DADOS INICIAIS
-- Data: 2025-11-18
-- Projeto: ysvyfdzczfxwhuyajzre (fieldmanager-production)
-- ================================================================
--
-- Este script popula:
-- - 6 domínios padrão (Ambiental, Segurança, Qualidade, Saúde, Manutenção, Auditoria)
-- - 1 tenant padrão (FieldManager - Sistema Principal)
-- - 1 módulo exemplo (NR-35 - Trabalho em Altura)
-- - 20 perguntas do módulo NR-35
--
-- ================================================================

-- ================================================================
-- DOMÍNIOS PADRÃO
-- ================================================================
INSERT INTO dominios (codigo, nome, descricao, icone, cor_primaria, cor_secundaria, ordem) VALUES
('ambiental', 'Meio Ambiente', 'Gestão Ambiental, Resíduos, Efluentes e Emissões', 'Leaf', '#10b981', '#059669', 1),
('seguranca', 'Segurança do Trabalho', 'NRs, EPIs, Prevenção de Acidentes, DDS', 'HardHat', '#f59e0b', '#d97706', 2),
('qualidade', 'Gestão da Qualidade', 'ISO 9001, Auditorias, 5S, Processos', 'Award', '#3b82f6', '#2563eb', 3),
('saude', 'Saúde Ocupacional', 'PCMSO, ASO, Exames, Ergonomia', 'Stethoscope', '#ef4444', '#dc2626', 4),
('manutencao', 'Manutenção', 'TPM, Preventiva, Preditiva, Ordens', 'Wrench', '#8b5cf6', '#7c3aed', 5),
('auditoria', 'Auditorias & Compliance', 'Certificações, Regulamentações, Conformidade', 'ClipboardCheck', '#ec4899', '#db2777', 6)
ON CONFLICT (codigo) DO NOTHING;

-- ================================================================
-- TENANT PADRÃO (Para sistema atual)
-- ================================================================
INSERT INTO tenants (nome_empresa, plano, max_usuarios, max_storage_gb, ativo)
VALUES ('FieldManager - Sistema Principal', 'enterprise', 999, 999, true)
ON CONFLICT DO NOTHING;

-- ================================================================
-- ATIVAR DOMÍNIOS PARA TENANT PADRÃO
-- ================================================================
DO $$
DECLARE
  tenant_padrao_id UUID;
  dominio_ambiental_id UUID;
  dominio_seguranca_id UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO tenant_padrao_id FROM tenants WHERE nome_empresa = 'FieldManager - Sistema Principal';
  SELECT id INTO dominio_ambiental_id FROM dominios WHERE codigo = 'ambiental';
  SELECT id INTO dominio_seguranca_id FROM dominios WHERE codigo = 'seguranca';

  -- Ativar domínio ambiental para tenant padrão
  INSERT INTO tenant_dominios (tenant_id, dominio_id, ativo)
  VALUES (tenant_padrao_id, dominio_ambiental_id, true)
  ON CONFLICT (tenant_id, dominio_id) DO NOTHING;

  -- Ativar domínio segurança para tenant padrão (PoC)
  INSERT INTO tenant_dominios (tenant_id, dominio_id, ativo)
  VALUES (tenant_padrao_id, dominio_seguranca_id, true)
  ON CONFLICT (tenant_id, dominio_id) DO NOTHING;
END $$;

-- ================================================================
-- MÓDULO EXEMPLO: NR-35 Trabalho em Altura
-- ================================================================
DO $$
DECLARE
  dominio_seg_id UUID;
  modulo_nr35_id UUID;
BEGIN
  -- Buscar domínio segurança
  SELECT id INTO dominio_seg_id FROM dominios WHERE codigo = 'seguranca';

  -- Criar módulo NR-35
  INSERT INTO modulos_sistema (
    dominio_id,
    codigo,
    nome,
    descricao,
    tipo_modulo,
    configuracao,
    icone,
    ordem,
    ativo,
    template
  ) VALUES (
    dominio_seg_id,
    'nr35-trabalho-altura',
    'NR-35 - Trabalho em Altura',
    'Checklist de segurança para trabalhos realizados acima de 2 metros de altura',
    'checklist',
    '{
      "nr": "NR-35",
      "revisao": "Portaria 3.214/78 - Atualização 2023",
      "campo_aplicacao": "Trabalhos acima de 2m de altura",
      "periodicidade": "Diária antes do início dos trabalhos",
      "responsavel": "Técnico de Segurança",
      "validade_horas": 8
    }'::jsonb,
    'HardHat',
    1,
    true,
    true
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO modulo_nr35_id;

  -- Se o módulo já existia, buscar o ID
  IF modulo_nr35_id IS NULL THEN
    SELECT id INTO modulo_nr35_id FROM modulos_sistema
    WHERE codigo = 'nr35-trabalho-altura' AND dominio_id = dominio_seg_id;
  END IF;

  -- Inserir perguntas NR-35 (apenas se não existirem)
  INSERT INTO perguntas_modulos (modulo_id, codigo, pergunta, tipo_resposta, categoria, obrigatoria, ordem) VALUES
  -- Categoria: EPIs e Equipamentos
  (modulo_nr35_id, 'NR35.001', 'O trabalhador está usando cinto de segurança tipo paraquedista?', 'boolean', 'EPIs', true, 1),
  (modulo_nr35_id, 'NR35.002', 'O cinto está fixado ao ponto de ancoragem adequado?', 'boolean', 'EPIs', true, 2),
  (modulo_nr35_id, 'NR35.003', 'O capacete está com jugular fixada?', 'boolean', 'EPIs', true, 3),
  (modulo_nr35_id, 'NR35.004', 'O trava-quedas está instalado corretamente?', 'boolean', 'Equipamentos', true, 4),
  (modulo_nr35_id, 'NR35.005', 'A linha de vida está instalada e sinalizada?', 'boolean', 'Equipamentos', true, 5),

  -- Categoria: Documentação
  (modulo_nr35_id, 'NR35.006', 'O trabalhador possui treinamento NR-35 válido (até 2 anos)?', 'boolean', 'Documentação', true, 6),
  (modulo_nr35_id, 'NR35.007', 'Foi emitida a Permissão de Trabalho em Altura (PTA)?', 'boolean', 'Documentação', true, 7),
  (modulo_nr35_id, 'NR35.008', 'A APR (Análise Preliminar de Risco) foi preenchida?', 'boolean', 'Documentação', true, 8),
  (modulo_nr35_id, 'NR35.009', 'O ASO (Atestado de Saúde Ocupacional) está válido?', 'boolean', 'Documentação', true, 9),

  -- Categoria: Área de Trabalho
  (modulo_nr35_id, 'NR35.010', 'A área está isolada e sinalizada?', 'boolean', 'Área de Trabalho', true, 10),
  (modulo_nr35_id, 'NR35.011', 'Há proteção contra queda de objetos?', 'boolean', 'Área de Trabalho', true, 11),
  (modulo_nr35_id, 'NR35.012', 'O piso está livre de obstáculos e nivelado?', 'boolean', 'Área de Trabalho', true, 12),
  (modulo_nr35_id, 'NR35.013', 'As condições climáticas são adequadas (sem chuva/vento forte)?', 'boolean', 'Área de Trabalho', false, 13),

  -- Categoria: Supervisão e Equipe
  (modulo_nr35_id, 'NR35.014', 'Há supervisor de segurança designado no local?', 'boolean', 'Supervisão', true, 14),
  (modulo_nr35_id, 'NR35.015', 'A equipe de resgate está disponível e preparada?', 'boolean', 'Supervisão', true, 15),
  (modulo_nr35_id, 'NR35.016', 'Há comunicação eficaz entre trabalhador e equipe de apoio?', 'boolean', 'Supervisão', false, 16),

  -- Categoria: Equipamentos de Acesso
  (modulo_nr35_id, 'NR35.017', 'Escadas/andaimes estão em boas condições?', 'boolean', 'Equipamentos de Acesso', true, 17),
  (modulo_nr35_id, 'NR35.018', 'Plataformas elevatórias possuem certificado de inspeção válido?', 'boolean', 'Equipamentos de Acesso', false, 18),

  -- Categoria: Emergência
  (modulo_nr35_id, 'NR35.019', 'Existe plano de emergência e resgate definido?', 'boolean', 'Emergência', true, 19),
  (modulo_nr35_id, 'NR35.020', 'Kit de primeiros socorros está disponível no local?', 'boolean', 'Emergência', true, 20)
  ON CONFLICT DO NOTHING;

  -- Atualizar metadados do módulo
  UPDATE modulos_sistema
  SET metadata = jsonb_build_object(
    'total_perguntas', 20,
    'perguntas_obrigatorias', 17,
    'categorias', ARRAY['EPIs', 'Equipamentos', 'Documentação', 'Área de Trabalho', 'Supervisão', 'Equipamentos de Acesso', 'Emergência'],
    'tempo_estimado_minutos', 15
  )
  WHERE id = modulo_nr35_id;
END $$;

-- ================================================================
-- FIM DA POPULAÇÃO DE DADOS
-- ================================================================

-- Verificar dados inseridos
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'RESUMO DA POPULAÇÃO DE DADOS';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Domínios criados: %', (SELECT COUNT(*) FROM dominios);
  RAISE NOTICE 'Tenants criados: %', (SELECT COUNT(*) FROM tenants);
  RAISE NOTICE 'Domínios ativos (tenant_dominios): %', (SELECT COUNT(*) FROM tenant_dominios WHERE ativo = true);
  RAISE NOTICE 'Módulos criados: %', (SELECT COUNT(*) FROM modulos_sistema);
  RAISE NOTICE 'Perguntas criadas: %', (SELECT COUNT(*) FROM perguntas_modulos);
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
END $$;
