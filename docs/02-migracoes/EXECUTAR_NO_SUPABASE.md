# Scripts para Executar no Supabase SQL Editor

## 1️⃣ Criar Tabela de Configurações

Cole este SQL no Supabase SQL Editor:

```sql
-- =====================================================
-- CRIAR TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) DEFAULT 'string',
  categoria VARCHAR(50),
  editavel BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON public.configuracoes(chave);
CREATE INDEX IF NOT EXISTS idx_configuracoes_categoria ON public.configuracoes(categoria);
CREATE INDEX IF NOT EXISTS idx_configuracoes_ativo ON public.configuracoes(ativo);

-- RLS
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem fazer tudo
CREATE POLICY "Admins podem gerenciar configurações"
  ON public.configuracoes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'ADM'
      AND usuarios.ativo = true
    )
  );

-- Política: Usuários autenticados podem ler
CREATE POLICY "Usuários autenticados podem ler configurações"
  ON public.configuracoes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Dados iniciais
INSERT INTO public.configuracoes (chave, valor, descricao, tipo, categoria, editavel) VALUES
  ('app.nome', 'EcoField', 'Nome da aplicação', 'string', 'sistema', false),
  ('app.versao', '1.4.0', 'Versão da aplicação', 'string', 'sistema', false),
  ('app.ambiente', 'development', 'Ambiente de execução', 'string', 'sistema', true),
  ('backup.automatico', 'true', 'Habilitar backup automático', 'boolean', 'sistema', true),
  ('backup.frequencia_horas', '24', 'Frequência de backup em horas', 'number', 'sistema', true)
ON CONFLICT (chave) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_configuracoes_updated_at();
```

## 2️⃣ Verificar Tabela de Perfis

Cole este SQL para verificar se há perfis:

```sql
-- Verificar perfis existentes
SELECT * FROM perfis WHERE ativo = true ORDER BY nome;

-- Se não houver perfis, criar os padrão:
INSERT INTO perfis (nome, descricao, permissoes, ativo) VALUES
  ('Administrador', 'Acesso total ao sistema', '{
    "lvs": ["read", "write", "delete"],
    "termos": ["read", "write", "delete"],
    "rotinas": ["read", "write", "delete"],
    "metas": ["read", "write", "delete"],
    "fotos": ["upload", "view", "delete"],
    "relatorios": ["view", "export", "admin"],
    "usuarios": ["view", "create", "edit", "delete"],
    "perfis": ["view", "create", "edit", "delete"],
    "sistema": ["config", "backup", "logs"],
    "admin": true,
    "demo": false
  }'::jsonb, true),
  ('Supervisor', 'Supervisão e relatórios', '{
    "lvs": ["read"],
    "termos": ["read"],
    "rotinas": ["read"],
    "metas": ["read"],
    "fotos": ["view"],
    "relatorios": ["view", "export"],
    "usuarios": ["view"],
    "perfis": [],
    "sistema": [],
    "admin": false,
    "demo": false
  }'::jsonb, true),
  ('Técnico', 'Execução de atividades', '{
    "lvs": ["read", "write"],
    "termos": ["read", "write"],
    "rotinas": ["read", "write"],
    "metas": ["read"],
    "fotos": ["upload", "view"],
    "relatorios": ["view"],
    "usuarios": [],
    "perfis": [],
    "sistema": [],
    "admin": false,
    "demo": false
  }'::jsonb, true)
ON CONFLICT (nome) DO NOTHING;
```

## 3️⃣ Verificar Políticas RLS dos Perfis

```sql
-- Ver políticas atuais da tabela perfis
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'perfis';

-- Se não houver políticas, criar:
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler perfis"
  ON public.perfis
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Permitir gerenciamento para admins
CREATE POLICY "Admins podem gerenciar perfis"
  ON public.perfis
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'ADM'
      AND usuarios.ativo = true
    )
  );
```

## 📋 Como Executar

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto EcoField
3. Vá em **SQL Editor** (ícone de query no menu lateral)
4. Clique em **New Query**
5. Cole o SQL acima (um de cada vez)
6. Clique em **Run** ou pressione `Ctrl+Enter`

## ✅ Verificação

Após executar, verifique se funcionou:

```sql
-- Deve retornar as configurações
SELECT * FROM configuracoes;

-- Deve retornar os perfis
SELECT * FROM perfis;
```

## 🔧 Troubleshooting

Se der erro de permissão:
```sql
-- Garantir que você é o dono das tabelas
ALTER TABLE configuracoes OWNER TO postgres;
ALTER TABLE perfis OWNER TO postgres;
```
