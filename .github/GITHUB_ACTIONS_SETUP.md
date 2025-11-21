# 🚀 GUIA DE SETUP - GITHUB ACTIONS

Este guia explica como configurar e usar os workflows do GitHub Actions criados para o projeto **FieldManager v2.0**.

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de que você tem:

- ✅ Repositório no GitHub
- ✅ Permissões de administrador no repositório
- ✅ Branch `main` criada

---

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Ativar GitHub Actions

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** → **Actions** → **General**
3. Em "Actions permissions", selecione:
   - ✅ **Allow all actions and reusable workflows**
4. Em "Workflow permissions", selecione:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
5. Clique em **Save**

---

### 2. Configurar Secrets

Adicione as seguintes secrets no repositório:

#### Secrets Obrigatórios

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

```bash
# Supabase (obrigatórios para build)
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

#### Como obter os valores

**VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY:**

1. Acesse seu projeto no Supabase (fieldmanager-production)
2. Vá para Settings → API
3. Copie os valores:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

---

### 3. Configurar Branch Protection (Recomendado)

Para garantir que ninguém faça merge sem passar nos checks:

1. Vá para **Settings** → **Branches**
2. Clique em **Add rule**
3. Em "Branch name pattern", digite: `main`
4. Marque as seguintes opções:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
5. Em "Status checks that are required", selecione:
   - ✅ `Type Check` (do workflow tests.yml)
   - ✅ `ESLint Check` (do workflow tests.yml)
   - ✅ `Build Application` (do workflow build.yml)
   - ✅ `ESLint` (do workflow lint.yml)
6. Clique em **Create**

---

## ✅ WORKFLOWS DISPONÍVEIS

### 1. Tests Workflow (`tests.yml`)

**Quando executa:**

- Push em `main`
- Pull Request para `main`

**O que faz:**

1. **Type Check Job**: Instala dependências e executa verificação de tipos TypeScript
2. **ESLint Check Job**: Instala dependências e executa verificação de lint
3. **Quality Gate Job**: Verifica se ambos os jobs anteriores passaram

**Duração:** ~1-2 minutos (com cache)

**Scripts executados:**

- `pnpm type-check` - Verificação de tipos TypeScript
- `pnpm lint` - Verificação de padrões de código ESLint

**Exemplo de uso:**

```bash
# Criar branch e fazer alterações
git checkout -b feature/nova-funcionalidade
# ... fazer alterações ...
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push origin feature/nova-funcionalidade

# Abrir PR no GitHub
# Os workflows executarão automaticamente
```

---

### 2. Build Workflow (`build.yml`)

**Quando executa:**

- Push em `main`
- Pull Request para `main`

**O que faz:**

1. Instala dependências
2. Executa build de produção
3. Verifica tamanho do bundle
4. Upload de artifacts (retidos por 7 dias)

**Duração:** ~2-3 minutos (com cache)

**Como baixar artifacts:**

1. Vá para **Actions** no GitHub
2. Clique no workflow "Build"
3. Clique em um run específico
4. Em "Artifacts", clique em **build-artifacts** para baixar

---

### 3. Lint Workflow (`lint.yml`)

**Quando executa:**

- Push em `main`
- Pull Request para `main`

**O que faz:**

1. Instala dependências
2. Executa ESLint em todos os arquivos
3. Falha se encontrar erros ou warnings

**Duração:** ~1 minuto (com cache)

**Como corrigir erros de lint:**

```bash
# Localmente, execute:
pnpm lint:fix

# Commit as correções:
git add .
git commit -m "fix: corrigir erros de lint"
git push
```

---

## 📊 VISUALIZAR RESULTADOS

### No Pull Request

Quando você abrir um PR, verá:

1. **Status checks** na parte inferior:
   - ✅ Type Check
   - ✅ ESLint Check
   - ✅ Quality Gate
   - ✅ Build Application
   - ✅ ESLint

### Na aba Actions

1. Vá para **Actions** no GitHub
2. Veja todos os workflows executados
3. Clique em um run para ver detalhes:
   - Logs completos
   - Duração de cada step
   - Artifacts gerados

---

## 🚨 TROUBLESHOOTING

### Problema: Workflow não executa

**Causa:** GitHub Actions desabilitado ou permissões incorretas

**Solução:**

1. Vá para **Settings** → **Actions** → **General**
2. Verifique se "Actions permissions" está habilitado
3. Verifique "Workflow permissions"

---

### Problema: Build falha com erro de secrets

**Causa:** Secrets não configurados

**Solução:**

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Re-execute o workflow

---

### Problema: Type checking falhando no CI mas passa localmente

**Causa:** Diferença de ambiente ou cache

**Solução:**

```bash
# Limpe cache local:
pnpm clean
pnpm install

# Execute type checking:
pnpm type-check

# Verifique lint:
pnpm lint
```

---

### Problema: Cache não está funcionando

**Causa:** Lock file alterado

**Solução:**

- O cache é invalidado quando `pnpm-lock.yaml` muda
- Commit as alterações do lock file
- Próximo run usará cache atualizado

---

## 🔄 WORKFLOW DO DIA A DIA

### Desenvolvimento Normal

```bash
# 1. Criar branch
git checkout -b feature/minha-feature

# 2. Fazer alterações
# ... código ...

# 3. Verificar localmente
pnpm type-check
pnpm lint

# 4. Commit e push
git add .
git commit -m "feat: minha nova feature"
git push origin feature/minha-feature

# 5. Abrir PR no GitHub
# Os workflows executarão automaticamente

# 6. Se falhar:
#    - Ver logs no GitHub Actions
#    - Corrigir localmente
#    - Push novamente
#    - Workflows re-executam automaticamente

# 7. Quando todos os checks passarem:
#    - Solicitar review
#    - Fazer merge
```

---

### Hotfix em Produção

```bash
# 1. Criar branch a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/corrigir-bug-critico

# 2. Corrigir o bug

# 3. Verificar localmente
pnpm type-check
pnpm lint

# 4. Commit e push
git add .
git commit -m "fix: corrigir bug crítico"
git push origin hotfix/corrigir-bug-critico

# 5. Abrir PR para main
# Workflows executam

# 6. Se todos os checks passarem:
#    - Fazer merge imediatamente
#    - Deploy automático (se configurado)
```

---

## 📈 MONITORAMENTO

### GitHub Insights

Para ver estatísticas dos workflows:

1. Vá para **Actions**
2. Selecione um workflow
3. Veja:
   - Tempo médio de execução
   - Taxa de sucesso/falha
   - Uso de minutos (GitHub Free: 2000min/mês)

---

## 🎯 QUALITY GATES

Os seguintes critérios **devem** ser atendidos para merge:

### ✅ Tests (tests.yml)

- Type checking sem erros
- ESLint sem erros ou warnings

### ✅ Build (build.yml)

- Build de produção compilando sem erros
- Bundle size dentro do limite

### ✅ Lint (lint.yml)

- Zero erros de ESLint
- Zero warnings críticos

**Se qualquer check falhar, o merge é bloqueado.**

---

## 🚀 OTIMIZAÇÕES

### Reduzir Tempo de Execução

Já implementado:

- ✅ Cache do pnpm store
- ✅ Execução paralela (jobs independentes)
- ✅ Timeouts configurados

### Reduzir Uso de Minutos

- Use `if: github.event_name == 'pull_request'` para rodar apenas em PRs
- Use `paths` filter para rodar apenas quando arquivos relevantes mudarem
- Considere self-hosted runners para projetos grandes

---

## 📚 RECURSOS ÚTEIS

### Documentação Oficial

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [pnpm Action](https://github.com/pnpm/action-setup)

### Badges do README

Atualize as badges no README.md com suas URLs reais:

```markdown
[![Tests](https://github.com/uederson-ferreira/fieldmanager/actions/workflows/tests.yml/badge.svg)](https://github.com/uederson-ferreira/fieldmanager/actions/workflows/tests.yml)
[![Build](https://github.com/uederson-ferreira/fieldmanager/actions/workflows/build.yml/badge.svg)](https://github.com/uederson-ferreira/fieldmanager/actions/workflows/build.yml)
[![Lint](https://github.com/uederson-ferreira/fieldmanager/actions/workflows/lint.yml/badge.svg)](https://github.com/uederson-ferreira/fieldmanager/actions/workflows/lint.yml)
```

---

## ✅ CHECKLIST DE SETUP

Use este checklist para validar que tudo está configurado:

- [ ] GitHub Actions habilitado no repositório
- [ ] Workflow permissions configuradas (Read and write)
- [ ] Secrets adicionados (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Branch protection configurada para `main`
- [ ] Workflows testados com um PR
- [ ] Badges do README atualizadas

---

## 🔮 PRÓXIMOS PASSOS

### Implementar Testes Automatizados (Fase 4 do PoC)

Quando os testes forem implementados, adicionar ao `tests.yml`:

```yaml
- name: Run unit tests
  run: pnpm test:run

- name: Generate coverage report
  run: pnpm test:coverage
```

E adicionar os scripts no `frontend/package.json`:

```json
"scripts": {
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

---

## 🎊 CONCLUSÃO

Com os workflows configurados, você tem:

- ✅ **Type checking automatizado** em cada push/PR
- ✅ **Lint enforcement** mantendo qualidade de código
- ✅ **Build validation** garantindo deploy seguro
- ✅ **Feedback rápido** (1-2 minutos)
- ✅ **Quality gates** bloqueando código quebrado
- ✅ **Confiança** para fazer deploy

**Próximo Passo:** Fazer um PR de teste para ver os workflows em ação!

---

**Projeto:** FieldManager v2.0
**Última atualização:** 20/11/2025
**Versão:** 2.0
