-- ================================================================
-- SEED DATABASE - FIELDMANAGER v2.0
-- Popula banco de dados com dados iniciais para desenvolvimento
-- ================================================================

-- ================================================================
-- 1. PERFIS DE USUÁRIO
-- ================================================================

INSERT INTO perfis (id, nome, descricao, nivel_acesso, ativo)
VALUES
  ('5d396506-658b-401f-888c-cad2bd4c9a56', 'Admin', 'Administrador do Sistema', 3, true),
  ('9af840e4-a83d-4006-b8ef-4bf6608130b1', 'Supervisor', 'Supervisor de Operações', 2, true),
  ('a5348539-3ee4-43a8-a7d8-2c78649deab5', 'Técnico', 'Técnico de Campo', 1, true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 2. DOMÍNIOS DO SISTEMA
-- ================================================================

INSERT INTO dominios (id, codigo, nome, descricao, icone, cor_primaria, cor_secundaria, ordem, ativo)
VALUES
  ('c9d5798a-faae-417d-a247-5a8772bbe94b', 'ambiental', 'Meio Ambiente', 'Gestão Ambiental e Resíduos', 'Leaf', '#10b981', '#059669', 1, true),
  ('d8f92b3c-1a4e-4d5f-9c2e-7b8a3f4d5e6c', 'seguranca', 'Segurança do Trabalho', 'Normas Regulamentadoras e SST', 'HardHat', '#f59e0b', '#d97706', 2, true),
  ('e7a83c4d-2b5f-4e6g-0d3f-8c9b4g5e6f7d', 'qualidade', 'Qualidade', 'Gestão da Qualidade ISO 9001', 'Award', '#3b82f6', '#2563eb', 3, true),
  ('f6b74d5e-3c6g-5f7h-1e4g-9d0c5h6f7g8e', 'saude', 'Saúde Ocupacional', 'Medicina e Saúde do Trabalho', 'Stethoscope', '#ec4899', '#db2777', 4, true),
  ('a5c65e6f-4d7h-6g8i-2f5h-0e1d6i7g8h9f', 'manutencao', 'Manutenção', 'Manutenção Predial e Equipamentos', 'Wrench', '#8b5cf6', '#7c3aed', 5, true),
  ('b4d56f7g-5e8i-7h9j-3g6i-1f2e7j8h9i0g', 'auditoria', 'Auditoria', 'Auditorias e Inspeções', 'ClipboardCheck', '#6366f1', '#4f46e5', 6, true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 3. TENANT PADRÃO (Organização de Desenvolvimento)
-- ================================================================

INSERT INTO tenants (id, nome, razao_social, cnpj, ativo, configuracoes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'FieldManager Dev',
  'FieldManager Desenvolvimento Ltda',
  '00.000.000/0001-00',
  true,
  '{
    "modulos_habilitados": ["ambiental", "seguranca", "qualidade", "saude", "manutencao", "auditoria"],
    "max_usuarios": 999,
    "storage_limit_mb": 10240
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 4. ATIVAR TODOS OS DOMÍNIOS PARA O TENANT
-- ================================================================

INSERT INTO tenants_dominios (tenant_id, dominio_id, ativo, configuracoes)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  true,
  '{}'::jsonb
FROM dominios
ON CONFLICT (tenant_id, dominio_id) DO NOTHING;

-- ================================================================
-- 5. USUÁRIO ADMIN DE TESTE
-- ================================================================

-- Primeiro criar no Supabase Auth (você terá que fazer isso manualmente ou via dashboard)
-- Email: admin@fieldmanager.dev
-- Senha: Admin@2025

-- Depois inserir na tabela usuarios (assumindo que o auth_user_id será criado)
INSERT INTO usuarios (
  id,
  nome,
  email,
  senha,
  matricula,
  telefone,
  perfil_id,
  tenant_id,
  ativo
)
VALUES (
  '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  'Administrador',
  'admin@fieldmanager.dev',
  'Admin@2025', -- Em produção, isso deve ser um hash bcrypt
  'ADM001',
  '(11) 99999-0000',
  '5d396506-658b-401f-888c-cad2bd4c9a56', -- Perfil Admin
  '00000000-0000-0000-0000-000000000001', -- Tenant Dev
  true
)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 6. MÓDULO DE EXEMPLO - NR-35 (Trabalho em Altura)
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
VALUES (
  'be06548c-eb13-401e-bdfb-de3ea08186ed',
  'd8f92b3c-1a4e-4d5f-9c2e-7b8a3f4d5e6c', -- Domínio: Segurança
  NULL, -- Template global (não específico de tenant)
  'nr35-trabalho-altura',
  'NR-35 - Trabalho em Altura',
  'Checklist de Segurança para Trabalho em Altura conforme NR-35',
  'checklist',
  '{
    "requer_assinatura": true,
    "permite_observacoes": true,
    "notificar_nao_conformidades": true,
    "score_minimo_aprovacao": 80
  }'::jsonb,
  'HardHat',
  1,
  true,
  true -- É um template
)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 7. PERGUNTAS DO MÓDULO NR-35
-- ================================================================

INSERT INTO perguntas_modulos (id, modulo_id, codigo, pergunta, tipo_resposta, opcoes_resposta, obrigatoria, permite_foto, permite_observacao, categoria, subcategoria, ordem, ativo, metadados)
VALUES
  -- EPI e Equipamentos
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.001', 'O trabalhador está utilizando cinto de segurança tipo paraquedista?', 'boolean', NULL, true, true, true, 'EPI', 'Proteção Individual', 1, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.002', 'O talabarte está em bom estado de conservação?', 'boolean', NULL, true, true, true, 'EPI', 'Equipamentos', 2, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.003', 'Os mosquetões estão funcionando corretamente?', 'boolean', NULL, true, true, true, 'EPI', 'Equipamentos', 3, true, '{"peso": 8, "critico": true}'::jsonb),

  -- Ponto de Ancoragem
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.004', 'O ponto de ancoragem suporta no mínimo 2.200 kg?', 'boolean', NULL, true, true, true, 'Ancoragem', 'Estrutura', 4, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.005', 'O ponto de ancoragem está livre de arestas cortantes?', 'boolean', NULL, true, true, true, 'Ancoragem', 'Segurança', 5, true, '{"peso": 8, "critico": false}'::jsonb),

  -- Condições Ambientais
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.006', 'As condições climáticas são adequadas para o trabalho?', 'boolean', NULL, true, true, true, 'Ambiente', 'Clima', 6, true, '{"peso": 7, "critico": false}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.007', 'A área está isolada e sinalizada?', 'boolean', NULL, true, true, true, 'Ambiente', 'Sinalização', 7, true, '{"peso": 8, "critico": false}'::jsonb),

  -- Documentação
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.008', 'Existe Permissão de Trabalho (PT) emitida?', 'boolean', NULL, true, true, true, 'Documentação', 'Autorizações', 8, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.009', 'Análise de Risco foi realizada e documentada?', 'boolean', NULL, true, true, true, 'Documentação', 'Gestão de Riscos', 9, true, '{"peso": 9, "critico": true}'::jsonb),

  -- Treinamento
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.010', 'O trabalhador possui certificado NR-35 válido?', 'boolean', NULL, true, true, true, 'Capacitação', 'Treinamento', 10, true, '{"peso": 10, "critico": true}'::jsonb);

-- ================================================================
-- FIM DO SEED
-- ================================================================

-- Resumo do que foi criado:
SELECT
  'Perfis criados: ' || COUNT(*) FROM perfis
UNION ALL
SELECT 'Domínios criados: ' || COUNT(*) FROM dominios
UNION ALL
SELECT 'Tenants criados: ' || COUNT(*) FROM tenants
UNION ALL
SELECT 'Usuários criados: ' || COUNT(*) FROM usuarios
UNION ALL
SELECT 'Módulos criados: ' || COUNT(*) FROM modulos_sistema
UNION ALL
SELECT 'Perguntas criadas: ' || COUNT(*) FROM perguntas_modulos;
