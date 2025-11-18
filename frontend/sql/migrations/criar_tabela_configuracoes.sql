-- =====================================================
-- CRIAR TABELA DE CONFIGURAÇÕES DO SISTEMA
-- Data: $(date +%Y-%m-%d)
-- Descrição: Tabela genérica para configurações do sistema
-- =====================================================

CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  categoria VARCHAR(50), -- 'sistema', 'email', 'notificacoes', etc.
  editavel BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON public.configuracoes(chave);
CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria ON public.configuracoes(categoria);
CREATE INDEX IF NOT EXISTS idx_configuracoes_ativo ON public.configuracoes(ativo);

-- Comentários
COMMENT ON TABLE public.configuracoes IS 'Configurações gerais do sistema';
COMMENT ON COLUMN public.configuracoes.chave IS 'Chave única da configuração (ex: app.nome, email.smtp.host)';
COMMENT ON COLUMN public.configuracoes.valor IS 'Valor da configuração';
COMMENT ON COLUMN public.configuracoes.tipo IS 'Tipo do valor para validação';
COMMENT ON COLUMN public.configuracoes.editavel IS 'Se pode ser editado pela interface admin';

-- RLS (Row Level Security)
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem fazer tudo
-- CORRIGIDO: Usa JOIN com perfis pois usuarios.perfil_id é FK
DROP POLICY IF EXISTS "Admins podem gerenciar configurações" ON public.configuracoes;
CREATE POLICY "Admins podem gerenciar configurações"
  ON public.configuracoes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.usuarios u
      JOIN public.perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome = 'ADM'
      AND u.ativo = true
      AND p.ativo = true
    )
  );

-- Política: Usuários autenticados podem ler
DROP POLICY IF EXISTS "Usuários autenticados podem ler configurações" ON public.configuracoes;
CREATE POLICY "Usuários autenticados podem ler configurações"
  ON public.configuracoes
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor, descricao, tipo, categoria, editavel) VALUES
  ('app.nome', 'EcoField', 'Nome da aplicação', 'string', 'sistema', false),
  ('app.versao', '1.4.0', 'Versão da aplicação', 'string', 'sistema', false),
  ('app.ambiente', 'development', 'Ambiente de execução', 'string', 'sistema', true),
  ('backup.automatico', 'true', 'Habilitar backup automático', 'boolean', 'sistema', true),
  ('backup.frequencia_horas', '24', 'Frequência de backup em horas', 'number', 'sistema', true),
  ('notificacoes.email.habilitado', 'false', 'Habilitar notificações por email', 'boolean', 'notificacoes', true),
  ('notificacoes.push.habilitado', 'true', 'Habilitar notificações push', 'boolean', 'notificacoes', true)
ON CONFLICT (chave) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_configuracoes_updated_at ON public.configuracoes;
CREATE TRIGGER trigger_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_configuracoes_updated_at();

-- ✅ Tabela configuracoes criada com sucesso!
