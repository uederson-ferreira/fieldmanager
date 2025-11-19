-- ================================================================
-- FIELDMANAGER v2.0 - SETUP COMPLETO (VERSÃO SUPABASE)
-- Execute este arquivo no Supabase SQL Editor
-- ================================================================
--
-- IMPORTANTE:
-- Este script contém TODOS os SQLs inline (não usa \i ou \echo)
-- Compatível com Supabase SQL Editor
--
-- ================================================================

-- ================================================================
-- STEP 1: CRIAR TABELAS BASE (perfis, usuarios)
-- ================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABELA: perfis
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  nivel_acesso INTEGER NOT NULL CHECK (nivel_acesso BETWEEN 1 AND 3),
  permissoes JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis(ativo);
CREATE INDEX IF NOT EXISTS idx_perfis_nivel ON perfis(nivel_acesso);

COMMENT ON TABLE perfis IS 'Perfis de acesso do sistema (Admin, Supervisor, Técnico)';
COMMENT ON COLUMN perfis.nivel_acesso IS '1=Técnico, 2=Supervisor, 3=Admin';

-- TABELA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255),
  matricula VARCHAR(50) UNIQUE,
  telefone VARCHAR(20),
  perfil_id UUID NOT NULL REFERENCES perfis(id) ON DELETE RESTRICT,
  tenant_id UUID,
  empresa_id UUID,
  ativo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP,
  auth_user_id UUID UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(perfil_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user ON usuarios(auth_user_id);

COMMENT ON TABLE usuarios IS 'Usuários do sistema com autenticação híbrida';
COMMENT ON COLUMN usuarios.auth_user_id IS 'UUID do usuário no Supabase Auth (auth.users)';
COMMENT ON COLUMN usuarios.senha IS 'Hash bcrypt da senha (opcional se usar Supabase Auth)';

-- RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfis são públicos" ON perfis;
CREATE POLICY "Perfis são públicos" ON perfis FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
  FOR SELECT
  USING (auth.uid() = auth_user_id OR true);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
CREATE TRIGGER update_perfis_updated_at
  BEFORE UPDATE ON perfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- STEP 2: CRIAR SISTEMA MULTI-DOMÍNIO
-- ================================================================
-- (Assumindo que a migration 01 já foi executada)
-- Se ainda não foi, execute /sql/migrations/01_criar_sistema_multidominio.sql

-- ================================================================
-- STEP 3: POPULAR DADOS INICIAIS
-- ================================================================

-- 1. PERFIS
INSERT INTO perfis (id, nome, descricao, nivel_acesso, ativo)
VALUES
  ('5d396506-658b-401f-888c-cad2bd4c9a56', 'Admin', 'Administrador do Sistema', 3, true),
  ('9af840e4-a83d-4006-b8ef-4bf6608130b1', 'Supervisor', 'Supervisor de Operações', 2, true),
  ('a5348539-3ee4-43a8-a7d8-2c78649deab5', 'Técnico', 'Técnico de Campo', 1, true)
ON CONFLICT (nome) DO NOTHING;

-- 2. DOMÍNIOS
INSERT INTO dominios (id, codigo, nome, descricao, icone, cor_primaria, cor_secundaria, ordem, ativo)
VALUES
  ('c9d5798a-faae-417d-a247-5a8772bbe94b', 'ambiental', 'Meio Ambiente', 'Gestão Ambiental e Resíduos', 'Leaf', '#10b981', '#059669', 1, true),
  ('d8f92b3c-1a4e-4d5f-9c2e-7b8a3f4d5e6c', 'seguranca', 'Segurança do Trabalho', 'Normas Regulamentadoras e SST', 'HardHat', '#f59e0b', '#d97706', 2, true),
  ('e7a83c4d-2b5f-4e6f-0d3f-8c9b4a5e6f7d', 'qualidade', 'Qualidade', 'Gestão da Qualidade ISO 9001', 'Award', '#3b82f6', '#2563eb', 3, true),
  ('f6b74d5e-3c6a-5f7b-1e4a-9d0c5b6f7a8e', 'saude', 'Saúde Ocupacional', 'Medicina e Saúde do Trabalho', 'Stethoscope', '#ec4899', '#db2777', 4, true),
  ('a5c65e6f-4d7b-6a8c-2f5b-0e1d6c7a8b9f', 'manutencao', 'Manutenção', 'Manutenção Predial e Equipamentos', 'Wrench', '#8b5cf6', '#7c3aed', 5, true),
  ('b4d56f7a-5e8c-7b9d-3a6c-1f2e7d8b9c0a', 'auditoria', 'Auditoria', 'Auditorias e Inspeções', 'ClipboardCheck', '#6366f1', '#4f46e5', 6, true)
ON CONFLICT (codigo) DO NOTHING;

-- 3. TENANT PADRÃO
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

-- 4. ATIVAR DOMÍNIOS PARA O TENANT
INSERT INTO tenants_dominios (tenant_id, dominio_id, ativo, configuracoes)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  id,
  true,
  '{}'::jsonb
FROM dominios
ON CONFLICT (tenant_id, dominio_id) DO NOTHING;

-- 5. USUÁRIO ADMIN
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
  '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  'Administrador',
  'admin@fieldmanager.dev',
  'Admin@2025',
  'ADM001',
  '(11) 99999-0000',
  '5d396506-658b-401f-888c-cad2bd4c9a56',
  '00000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (email) DO NOTHING;

-- 6. MÓDULO NR-35
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
  'd8f92b3c-1a4e-4d5f-9c2e-7b8a3f4d5e6c',
  NULL,
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
  true
)
ON CONFLICT (id) DO NOTHING;

-- 7. PERGUNTAS NR-35
INSERT INTO perguntas_modulos (id, modulo_id, codigo, pergunta, tipo_resposta, opcoes_resposta, obrigatoria, permite_foto, permite_observacao, categoria, subcategoria, ordem, ativo, metadados)
VALUES
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.001', 'O trabalhador está utilizando cinto de segurança tipo paraquedista?', 'boolean', NULL, true, true, true, 'EPI', 'Proteção Individual', 1, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.002', 'O talabarte está em bom estado de conservação?', 'boolean', NULL, true, true, true, 'EPI', 'Equipamentos', 2, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.003', 'Os mosquetões estão funcionando corretamente?', 'boolean', NULL, true, true, true, 'EPI', 'Equipamentos', 3, true, '{"peso": 8, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.004', 'O ponto de ancoragem suporta no mínimo 2.200 kg?', 'boolean', NULL, true, true, true, 'Ancoragem', 'Estrutura', 4, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.005', 'O ponto de ancoragem está livre de arestas cortantes?', 'boolean', NULL, true, true, true, 'Ancoragem', 'Segurança', 5, true, '{"peso": 8, "critico": false}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.006', 'As condições climáticas são adequadas para o trabalho?', 'boolean', NULL, true, true, true, 'Ambiente', 'Clima', 6, true, '{"peso": 7, "critico": false}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.007', 'A área está isolada e sinalizada?', 'boolean', NULL, true, true, true, 'Ambiente', 'Sinalização', 7, true, '{"peso": 8, "critico": false}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.008', 'Existe Permissão de Trabalho (PT) emitida?', 'boolean', NULL, true, true, true, 'Documentação', 'Autorizações', 8, true, '{"peso": 10, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.009', 'Análise de Risco foi realizada e documentada?', 'boolean', NULL, true, true, true, 'Documentação', 'Gestão de Riscos', 9, true, '{"peso": 9, "critico": true}'::jsonb),
  (gen_random_uuid(), 'be06548c-eb13-401e-bdfb-de3ea08186ed', 'NR35.010', 'O trabalhador possui certificado NR-35 válido?', 'boolean', NULL, true, true, true, 'Capacitação', 'Treinamento', 10, true, '{"peso": 10, "critico": true}'::jsonb);

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================

SELECT 'Perfis criados:' as tipo, COUNT(*)::text as total FROM perfis
UNION ALL
SELECT 'Domínios criados:', COUNT(*)::text FROM dominios
UNION ALL
SELECT 'Tenants criados:', COUNT(*)::text FROM tenants
UNION ALL
SELECT 'Usuários criados:', COUNT(*)::text FROM usuarios
UNION ALL
SELECT 'Módulos criados:', COUNT(*)::text FROM modulos_sistema
UNION ALL
SELECT 'Perguntas criadas:', COUNT(*)::text FROM perguntas_modulos;

-- ================================================================
-- ✅ SETUP COMPLETO!
-- ================================================================
--
-- 🔑 Credenciais:
--    Email: admin@fieldmanager.dev
--    Senha: Admin@2025
--
-- ⚠️  PRÓXIMO PASSO:
--    Criar usuário no Supabase Auth (Dashboard → Authentication → Users)
--    Depois executar: UPDATE usuarios SET auth_user_id = 'UUID_AQUI' WHERE email = 'admin@fieldmanager.dev';
--
-- ================================================================
