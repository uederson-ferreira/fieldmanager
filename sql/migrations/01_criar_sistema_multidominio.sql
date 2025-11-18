-- ================================================================
-- FIELDMANAGER - MIGRAÇÃO: Sistema Multi-Domínio
-- Data: 2025-11-18
-- Projeto: ysvyfdzczfxwhuyajzre (fieldmanager-production)
-- ================================================================
--
-- Esta migração cria toda a estrutura multi-domínio/multi-tenant
--
-- Tabelas criadas:
-- - tenants (empresas/clientes)
-- - dominios (áreas de atuação)
-- - tenant_dominios (domínios ativos por tenant)
-- - modulos_sistema (checklists/formulários configuráveis)
-- - perguntas_modulos (itens de verificação genéricos)
-- - execucoes (registros de inspeções)
-- - execucoes_respostas (respostas das perguntas)
-- - execucoes_fotos (fotos das execuções)
--
-- ================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABELA: tenants (Empresas/Clientes)
-- ================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_empresa VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  razao_social VARCHAR(255),
  segmento VARCHAR(100), -- 'industria', 'construcao', 'logistica', etc.
  plano VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'professional', 'enterprise'
  max_usuarios INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP, -- Para controle de assinatura
  configuracoes JSONB DEFAULT '{}', -- Config específicas do tenant
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tenants_ativo ON tenants(ativo);
CREATE INDEX IF NOT EXISTS idx_tenants_plano ON tenants(plano);

-- ================================================================
-- TABELA: dominios (Áreas de Atuação)
-- ================================================================
CREATE TABLE IF NOT EXISTS dominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL, -- 'ambiental', 'seguranca', 'qualidade'
  nome VARCHAR(100) NOT NULL, -- 'Meio Ambiente', 'Segurança do Trabalho'
  descricao TEXT,
  icone VARCHAR(100), -- Nome do ícone Lucide React
  cor_primaria VARCHAR(20) DEFAULT '#10b981', -- Hex color
  cor_secundaria VARCHAR(20),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dominios_codigo ON dominios(codigo);
CREATE INDEX IF NOT EXISTS idx_dominios_ativo ON dominios(ativo);
CREATE INDEX IF NOT EXISTS idx_dominios_ordem ON dominios(ordem);

-- ================================================================
-- TABELA: tenant_dominios (Módulos Ativos por Tenant)
-- ================================================================
CREATE TABLE IF NOT EXISTS tenant_dominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dominio_id UUID NOT NULL REFERENCES dominios(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  data_ativacao TIMESTAMP DEFAULT NOW(),
  data_desativacao TIMESTAMP,
  configuracoes_especificas JSONB DEFAULT '{}', -- Customizações do módulo
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, dominio_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tenant_dominios_tenant ON tenant_dominios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_dominios_dominio ON tenant_dominios(dominio_id);
CREATE INDEX IF NOT EXISTS idx_tenant_dominios_ativo ON tenant_dominios(ativo);

-- ================================================================
-- TABELA: modulos_sistema (Checklists/Formulários Configuráveis)
-- ================================================================
CREATE TABLE IF NOT EXISTS modulos_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dominio_id UUID NOT NULL REFERENCES dominios(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = template do sistema
  codigo VARCHAR(100) NOT NULL, -- 'lv-residuos', 'nr35-trabalho-altura'
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  tipo_modulo VARCHAR(50) DEFAULT 'checklist', -- 'checklist', 'formulario', 'inspecao', 'auditoria'
  configuracao JSONB DEFAULT '{}', -- Estrutura flexível (número LV, revisão, etc.)
  icone VARCHAR(100),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  template BOOLEAN DEFAULT false, -- Se é template padrão do sistema
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_modulos_dominio ON modulos_sistema(dominio_id);
CREATE INDEX IF NOT EXISTS idx_modulos_tenant ON modulos_sistema(tenant_id);
CREATE INDEX IF NOT EXISTS idx_modulos_template ON modulos_sistema(template);
CREATE INDEX IF NOT EXISTS idx_modulos_ativo ON modulos_sistema(ativo);

-- Índice único considerando tenant_id (NULL para templates do sistema)
CREATE UNIQUE INDEX IF NOT EXISTS idx_modulos_codigo_unique
ON modulos_sistema(dominio_id, codigo, COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- ================================================================
-- TABELA: perguntas_modulos (Itens de Verificação Genéricos)
-- ================================================================
CREATE TABLE IF NOT EXISTS perguntas_modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID NOT NULL REFERENCES modulos_sistema(id) ON DELETE CASCADE,
  codigo VARCHAR(50) NOT NULL, -- '01.001', 'NR35.001'
  pergunta TEXT NOT NULL,
  tipo_resposta VARCHAR(50) DEFAULT 'boolean', -- 'boolean', 'text', 'multiple_choice', 'numeric', 'date'
  opcoes_resposta JSONB, -- Para multiple_choice: ['C', 'NC', 'NA']
  valor_padrao TEXT,
  obrigatoria BOOLEAN DEFAULT false,
  permite_foto BOOLEAN DEFAULT true,
  permite_observacao BOOLEAN DEFAULT true,
  categoria VARCHAR(100), -- 'EPI', 'Procedimentos', 'Documentação'
  subcategoria VARCHAR(100),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  metadados JSONB DEFAULT '{}', -- Campos extras configuráveis
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_perguntas_modulo ON perguntas_modulos(modulo_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_ativo ON perguntas_modulos(ativo);
CREATE INDEX IF NOT EXISTS idx_perguntas_ordem ON perguntas_modulos(ordem);

-- ================================================================
-- TABELA: execucoes (Substitui lvs - Genérico)
-- ================================================================
CREATE TABLE IF NOT EXISTS execucoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES modulos_sistema(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  numero_sequencial SERIAL,
  numero_documento VARCHAR(100), -- Gerado automaticamente
  data_execucao TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'concluido', -- 'rascunho', 'concluido', 'cancelado'

  -- Dados do executor
  executor_nome VARCHAR(255),
  executor_matricula VARCHAR(50),
  executor_funcao VARCHAR(100),

  -- Dados adicionais
  area_id UUID,
  area_nome VARCHAR(255),
  local_atividade TEXT,

  -- Responsáveis/Inspetores
  responsavel_tecnico VARCHAR(255),
  inspetor_secundario VARCHAR(255),
  inspetor_secundario_matricula VARCHAR(50),

  -- Observações gerais
  observacoes TEXT,

  -- Assinaturas
  assinatura_principal TEXT, -- Base64
  data_assinatura_principal TIMESTAMP,
  assinatura_secundaria TEXT,
  data_assinatura_secundaria TIMESTAMP,

  -- Localização
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  gps_accuracy DECIMAL(10, 2),
  endereco_gps TEXT,

  -- Estatísticas calculadas
  total_itens INTEGER DEFAULT 0,
  total_conformes INTEGER DEFAULT 0,
  total_nao_conformes INTEGER DEFAULT 0,
  total_nao_aplicaveis INTEGER DEFAULT 0,
  percentual_conformidade DECIMAL(5, 2),

  -- Campos customizados (JSON flexível)
  campos_customizados JSONB DEFAULT '{}',

  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_execucoes_tenant ON execucoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_execucoes_modulo ON execucoes(modulo_id);
CREATE INDEX IF NOT EXISTS idx_execucoes_usuario ON execucoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_execucoes_data ON execucoes(data_execucao);
CREATE INDEX IF NOT EXISTS idx_execucoes_status ON execucoes(status);

-- ================================================================
-- TABELA: execucoes_respostas (Substitui lv_avaliacoes)
-- ================================================================
CREATE TABLE IF NOT EXISTS execucoes_respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execucao_id UUID NOT NULL REFERENCES execucoes(id) ON DELETE CASCADE,
  pergunta_id UUID NOT NULL REFERENCES perguntas_modulos(id) ON DELETE CASCADE,
  pergunta_codigo VARCHAR(50),
  resposta TEXT, -- 'C', 'NC', 'NA', ou texto livre, ou número
  resposta_booleana BOOLEAN, -- Para tipo_resposta = 'boolean'
  observacao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(execucao_id, pergunta_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_respostas_execucao ON execucoes_respostas(execucao_id);
CREATE INDEX IF NOT EXISTS idx_respostas_pergunta ON execucoes_respostas(pergunta_id);

-- ================================================================
-- TABELA: execucoes_fotos (Substitui lv_fotos)
-- ================================================================
CREATE TABLE IF NOT EXISTS execucoes_fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execucao_id UUID NOT NULL REFERENCES execucoes(id) ON DELETE CASCADE,
  pergunta_id UUID REFERENCES perguntas_modulos(id) ON DELETE SET NULL,
  pergunta_codigo VARCHAR(50),
  nome_arquivo VARCHAR(255) NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_bytes BIGINT,
  tipo_mime VARCHAR(100),
  categoria VARCHAR(50) DEFAULT 'evidencia', -- 'evidencia', 'nao_conformidade'
  descricao TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp_captura TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fotos_execucao ON execucoes_fotos(execucao_id);
CREATE INDEX IF NOT EXISTS idx_fotos_pergunta ON execucoes_fotos(pergunta_id);

-- ================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dominios_updated_at ON dominios;
CREATE TRIGGER update_dominios_updated_at BEFORE UPDATE ON dominios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_dominios_updated_at ON tenant_dominios;
CREATE TRIGGER update_tenant_dominios_updated_at BEFORE UPDATE ON tenant_dominios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modulos_sistema_updated_at ON modulos_sistema;
CREATE TRIGGER update_modulos_sistema_updated_at BEFORE UPDATE ON modulos_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_perguntas_modulos_updated_at ON perguntas_modulos;
CREATE TRIGGER update_perguntas_modulos_updated_at BEFORE UPDATE ON perguntas_modulos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_execucoes_updated_at ON execucoes;
CREATE TRIGGER update_execucoes_updated_at BEFORE UPDATE ON execucoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- FUNCTION: Gerar número de documento automaticamente
-- ================================================================
CREATE OR REPLACE FUNCTION gerar_numero_documento()
RETURNS TRIGGER AS $$
DECLARE
  modulo_codigo VARCHAR(50);
  ano_atual VARCHAR(4);
  seq_numero INTEGER;
BEGIN
  -- Buscar código do módulo
  SELECT codigo INTO modulo_codigo FROM modulos_sistema WHERE id = NEW.modulo_id;

  -- Ano atual
  ano_atual := TO_CHAR(NOW(), 'YYYY');

  -- Número sequencial
  seq_numero := NEW.numero_sequencial;

  -- Gerar número: CODIGO-AAAA-NNNN (ex: NR35-2025-0001)
  NEW.numero_documento := UPPER(modulo_codigo) || '-' || ano_atual || '-' || LPAD(seq_numero::TEXT, 4, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gerar_numero_documento ON execucoes;
CREATE TRIGGER trigger_gerar_numero_documento
BEFORE INSERT ON execucoes
FOR EACH ROW EXECUTE FUNCTION gerar_numero_documento();

-- ================================================================
-- FIM DA MIGRAÇÃO - ESTRUTURA CRIADA
-- ================================================================
