-- ================================================================
-- FIELDMANAGER v2.0 - MIGRATION 00: Tabelas Base
-- Cria as tabelas fundamentais do sistema
-- ================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABELA: perfis (Roles/Perfis de Usuário)
-- ================================================================

CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(50) NOT NULL UNIQUE,
  descricao TEXT,
  nivel_acesso INTEGER NOT NULL CHECK (nivel_acesso BETWEEN 1 AND 3),
  -- 1 = Técnico, 2 = Supervisor, 3 = Admin
  permissoes JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis(ativo);
CREATE INDEX IF NOT EXISTS idx_perfis_nivel ON perfis(nivel_acesso);

COMMENT ON TABLE perfis IS 'Perfis de acesso do sistema (Admin, Supervisor, Técnico)';
COMMENT ON COLUMN perfis.nivel_acesso IS '1=Técnico, 2=Supervisor, 3=Admin';

-- ================================================================
-- TABELA: usuarios (Usuários do Sistema)
-- ================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255), -- Hash bcrypt (pode ser NULL se usar apenas Supabase Auth)
  matricula VARCHAR(50) UNIQUE,
  telefone VARCHAR(20),
  perfil_id UUID NOT NULL REFERENCES perfis(id) ON DELETE RESTRICT,
  tenant_id UUID, -- NULL = usuário global/admin
  empresa_id UUID, -- Empresa contratada (se aplicável)
  ativo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMP,
  auth_user_id UUID UNIQUE, -- Referência para auth.users do Supabase
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

-- ================================================================
-- RLS (Row Level Security) - Desabilitado inicialmente
-- ================================================================

ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo para começar)
CREATE POLICY "Perfis são públicos" ON perfis FOR SELECT USING (true);
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
  FOR SELECT
  USING (auth.uid() = auth_user_id OR true); -- TODO: Ajustar após autenticação

-- ================================================================
-- TRIGGERS: Updated_at automático
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perfis_updated_at
  BEFORE UPDATE ON perfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- FIM DA MIGRATION 00
-- ================================================================
