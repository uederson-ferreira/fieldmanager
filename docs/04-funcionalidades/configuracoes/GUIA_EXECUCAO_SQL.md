# 📘 Guia de Execução SQL no Supabase

## 🎯 Objetivo
Criar a tabela de configurações e validar perfis no banco de dados Supabase.

## 📋 Pré-requisitos
- Acesso ao Dashboard do Supabase
- Permissões de admin no projeto

---

## 🚀 Passo a Passo

### 1️⃣ Acessar o SQL Editor

1. Acesse: https://supabase.com/dashboard/project/fxxvdasztireezbyykjc/sql
2. Faça login se necessário
3. Clique em **"New Query"**

---

### 2️⃣ Criar Tabela de Configurações

**Cole este SQL e clique em RUN (ou Ctrl+Enter):**

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

-- Comentários
COMMENT ON TABLE public.configuracoes IS 'Configurações gerais do sistema';
COMMENT ON COLUMN public.configuracoes.chave IS 'Chave única da configuração';
COMMENT ON COLUMN public.configuracoes.valor IS 'Valor da configuração';

-- RLS (Row Level Security)
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem fazer tudo
DROP POLICY IF EXISTS "Admins podem gerenciar configurações" ON public.configuracoes;
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
DROP POLICY IF EXISTS "Usuários autenticados podem ler configurações" ON public.configuracoes;
CREATE POLICY "Usuários autenticados podem ler configurações"
  ON public.configuracoes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

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
```

**✅ Resultado esperado:**
```
Success. No rows returned
```

---

### 3️⃣ Verificar Tabela Criada

**Cole este SQL em uma nova query:**

```sql
-- Verificar se a tabela foi criada
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'configuracoes'
ORDER BY ordinal_position;

-- Ver os dados inseridos
SELECT * FROM public.configuracoes ORDER BY chave;
```

**✅ Resultado esperado:**
- Deve mostrar 10 colunas (id, chave, valor, descricao, tipo, categoria, editavel, ativo, created_at, updated_at)
- Deve mostrar 7 registros de configuração

---

### 4️⃣ Verificar Perfis Existentes

```sql
-- Listar todos os perfis ativos
SELECT
  id,
  nome,
  descricao,
  ativo,
  created_at
FROM public.perfis
WHERE ativo = true
ORDER BY nome;
```

**📊 Status Atual:**
Você já tem **9 perfis ativos**:
- ADM
- Desenvolvedor
- DESENVOLVEDOR (duplicado)
- Encarregado
- TMA Campo
- TMA_CAMPO (duplicado)
- TMA Contratada
- TMA_GESTAO (duplicado)
- TMA Gestão

---

### 5️⃣ (Opcional) Limpar Perfis Duplicados

Se quiser remover os perfis duplicados:

```sql
-- Ver perfis duplicados
SELECT nome, COUNT(*) as quantidade
FROM public.perfis
GROUP BY nome
HAVING COUNT(*) > 1;

-- Desativar perfis duplicados (mantenha apenas os com underscore)
UPDATE public.perfis
SET ativo = false
WHERE nome IN ('TMA Campo', 'TMA Gestão', 'Desenvolvedor')
AND ativo = true;
```

---

### 6️⃣ Verificar Políticas RLS

```sql
-- Ver todas as políticas de segurança
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN qual IS NULL THEN 'N/A'
    ELSE LEFT(qual::text, 50) || '...'
  END as condition
FROM pg_policies
WHERE tablename IN ('configuracoes', 'perfis', 'areas', 'categorias_lv')
ORDER BY tablename, policyname;
```

---

## 🎯 Verificação Final

Execute este SQL para validar tudo:

```sql
-- Resumo do banco de dados
SELECT
  'Configurações' as tabela,
  COUNT(*) as registros
FROM public.configuracoes
UNION ALL
SELECT
  'Perfis Ativos',
  COUNT(*)
FROM public.perfis
WHERE ativo = true
UNION ALL
SELECT
  'Áreas',
  COUNT(*)
FROM public.areas
WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'areas' AND column_name = 'ativo')
  AND ativo = true
UNION ALL
SELECT
  'Categorias LV',
  COUNT(*)
FROM public.categorias_lv
WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categorias_lv' AND column_name = 'ativo')
  AND ativo = true;
```

---

## ✅ Checklist de Conclusão

- [ ] Tabela `configuracoes` criada
- [ ] 7 registros de configuração inseridos
- [ ] Políticas RLS configuradas
- [ ] Trigger de `updated_at` funcionando
- [ ] Perfis verificados e validados

---

## 🆘 Troubleshooting

### Erro: "relation already exists"
- **Solução**: A tabela já existe. Use `DROP TABLE IF EXISTS configuracoes CASCADE;` antes de criar novamente.

### Erro: "permission denied"
- **Solução**: Você precisa estar logado como o owner do projeto no Supabase.

### Erro: "policy already exists"
- **Solução**: Use `DROP POLICY IF EXISTS` antes de criar (já incluído no script).

---

## 📞 Próximos Passos

Após executar com sucesso:

1. Teste a API backend para buscar configurações
2. Valide que o frontend consegue ler as configurações
3. Configure o backup automático

---

**Autor**: Claude Code
**Data**: 2025-11-16
**Versão**: 1.0
