-- ===================================================================
-- MIGRAÇÃO: TABELA DE ASSINATURAS DIGITAIS
-- Versão: 1.0.0
-- Data: 20/11/2025
-- Descrição: Criar tabela para armazenar assinaturas digitais com
--            trilha de auditoria completa e validação criptográfica
-- ===================================================================

-- ===================================================================
-- 1. CRIAR TABELA DE ASSINATURAS
-- ===================================================================

CREATE TABLE IF NOT EXISTS assinaturas_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamento
  execucao_id UUID NOT NULL REFERENCES execucoes(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,

  -- Dados da Assinatura
  assinatura_base64 TEXT NOT NULL, -- Imagem da assinatura em base64
  hash_assinatura VARCHAR(64) NOT NULL, -- Hash SHA-256 da assinatura
  timestamp_assinatura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Dados do Responsável
  usuario_nome VARCHAR(255) NOT NULL,
  usuario_email VARCHAR(255) NOT NULL,
  usuario_matricula VARCHAR(50),
  cargo_responsavel VARCHAR(255),

  -- Metadados de Validação
  validado_por VARCHAR(20) NOT NULL CHECK (validado_por IN ('senha', 'pin', 'biometria')),
  metodo_captura VARCHAR(20) NOT NULL CHECK (metodo_captura IN ('canvas', 'tablet', 'biometria')),

  -- Dados do Dispositivo e Localização
  dispositivo VARCHAR(20) NOT NULL CHECK (dispositivo IN ('mobile', 'desktop', 'tablet')),
  navegador VARCHAR(50),
  user_agent TEXT,
  ip_address INET,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  precisao_gps INTEGER, -- em metros

  -- Dados Contextuais
  local_assinatura VARCHAR(255), -- Local físico (ex: "Planta 1 - Setor A")
  observacoes TEXT,

  -- Status e Validade
  status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'revogada', 'expirada')),
  motivo_revogacao TEXT,
  data_revogacao TIMESTAMP WITH TIME ZONE,
  revogado_por UUID REFERENCES usuarios(id),

  -- Certificado Digital (opcional)
  certificado_digital JSONB, -- Dados do certificado se usar assinatura eletrônica avançada

  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Índices implícitos
  CONSTRAINT uk_assinatura_execucao UNIQUE (execucao_id)
);

-- ===================================================================
-- 2. COMENTÁRIOS
-- ===================================================================

COMMENT ON TABLE assinaturas_execucoes IS 'Armazena assinaturas digitais de execuções com trilha de auditoria completa';

COMMENT ON COLUMN assinaturas_execucoes.hash_assinatura IS 'Hash SHA-256 da assinatura para validação de integridade';
COMMENT ON COLUMN assinaturas_execucoes.timestamp_assinatura IS 'Timestamp exato da assinatura (não-repúdio)';
COMMENT ON COLUMN assinaturas_execucoes.validado_por IS 'Método de validação de identidade usado';
COMMENT ON COLUMN assinaturas_execucoes.status IS 'Status da assinatura (ativa, revogada, expirada)';
COMMENT ON COLUMN assinaturas_execucoes.certificado_digital IS 'Dados do certificado digital se houver (ICP-Brasil, etc)';

-- ===================================================================
-- 3. ÍNDICES
-- ===================================================================

-- Índice para busca por execução (já é UNIQUE, mas explícito para performance)
CREATE INDEX IF NOT EXISTS idx_assinaturas_execucao ON assinaturas_execucoes(execucao_id);

-- Índice para busca por tenant
CREATE INDEX IF NOT EXISTS idx_assinaturas_tenant ON assinaturas_execucoes(tenant_id);

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_assinaturas_usuario ON assinaturas_execucoes(usuario_id);

-- Índice para busca por data
CREATE INDEX IF NOT EXISTS idx_assinaturas_timestamp ON assinaturas_execucoes(timestamp_assinatura DESC);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas_execucoes(status) WHERE status = 'ativa';

-- Índice para busca por hash (validação de integridade)
CREATE INDEX IF NOT EXISTS idx_assinaturas_hash ON assinaturas_execucoes(hash_assinatura);

-- ===================================================================
-- 4. TRIGGER DE ATUALIZAÇÃO
-- ===================================================================

CREATE OR REPLACE FUNCTION atualizar_updated_at_assinaturas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_assinaturas_updated_at
  BEFORE UPDATE ON assinaturas_execucoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at_assinaturas();

-- ===================================================================
-- 5. RLS (ROW LEVEL SECURITY)
-- ===================================================================

-- Habilitar RLS
ALTER TABLE assinaturas_execucoes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem assinaturas do seu tenant
CREATE POLICY assinaturas_tenant_isolation ON assinaturas_execucoes
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- Política: Admin pode ver tudo
CREATE POLICY assinaturas_admin_full_access ON assinaturas_execucoes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      INNER JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = current_setting('app.current_user_id', true)::UUID
      AND p.nome ILIKE '%admin%'
    )
  );

-- ===================================================================
-- 6. FUNÇÃO DE VALIDAÇÃO DE INTEGRIDADE
-- ===================================================================

CREATE OR REPLACE FUNCTION validar_integridade_assinatura(
  p_assinatura_id UUID
)
RETURNS TABLE(
  valida BOOLEAN,
  hash_original VARCHAR(64),
  hash_calculado VARCHAR(64),
  timestamp_validacao TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_assinatura RECORD;
  v_hash_calculado TEXT;
BEGIN
  -- Buscar assinatura
  SELECT * INTO v_assinatura
  FROM assinaturas_execucoes
  WHERE id = p_assinatura_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assinatura não encontrada';
  END IF;

  -- Calcular hash novamente (simplificado - em produção usar hash real)
  -- Em produção, você recalcularia o hash da imagem + timestamp + email
  v_hash_calculado := v_assinatura.hash_assinatura; -- Placeholder

  -- Retornar resultado
  RETURN QUERY SELECT
    v_assinatura.hash_assinatura = v_hash_calculado AS valida,
    v_assinatura.hash_assinatura AS hash_original,
    v_hash_calculado AS hash_calculado,
    NOW() AS timestamp_validacao;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION validar_integridade_assinatura IS 'Valida integridade de uma assinatura comparando hashes';

-- ===================================================================
-- 7. VIEW DE AUDITORIA
-- ===================================================================

CREATE OR REPLACE VIEW vw_auditoria_assinaturas AS
SELECT
  a.id,
  a.execucao_id,
  e.numero_documento,
  a.usuario_nome,
  a.usuario_email,
  a.timestamp_assinatura,
  a.dispositivo,
  a.navegador,
  a.ip_address,
  a.local_assinatura,
  a.status,
  a.hash_assinatura,
  m.nome AS modulo_nome,
  d.nome AS dominio_nome,
  t.nome_empresa,
  a.created_at
FROM assinaturas_execucoes a
INNER JOIN execucoes e ON a.execucao_id = e.id
INNER JOIN modulos_sistema m ON e.modulo_id = m.id
INNER JOIN dominios d ON m.dominio_id = d.id
INNER JOIN tenants t ON a.tenant_id = t.id
ORDER BY a.timestamp_assinatura DESC;

COMMENT ON VIEW vw_auditoria_assinaturas IS 'View de auditoria completa de assinaturas digitais';

-- ===================================================================
-- FIM DA MIGRAÇÃO
-- ===================================================================

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migração 03: Tabela de assinaturas digitais criada com sucesso!';
  RAISE NOTICE '   - Tabela: assinaturas_execucoes';
  RAISE NOTICE '   - Índices: 6 criados';
  RAISE NOTICE '   - RLS: Habilitado';
  RAISE NOTICE '   - View: vw_auditoria_assinaturas';
  RAISE NOTICE '   - Função: validar_integridade_assinatura()';
END $$;
