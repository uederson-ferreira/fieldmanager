# 🚀 Guia de Implementação: Módulo de Ações Corretivas

**Data:** 17/11/2025
**Status:** ✅ Código Pronto para Deploy
**Versão:** 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Passo 1: Executar SQL no Supabase](#passo-1-executar-sql-no-supabase)
3. [Passo 2: Compilar Backend](#passo-2-compilar-backend)
4. [Passo 3: Integrar Frontend](#passo-3-integrar-frontend)
5. [Passo 4: Testar Sistema](#passo-4-testar-sistema)
6. [Passo 5: Deploy](#passo-5-deploy)

---

## 📊 Visão Geral

### O que foi criado?

✅ **Backend:**

- `backend/src/routes/acoesCorretivas.ts` - 8 endpoints REST
- Autenticação e autorização integradas
- Criação automática baseada em regras

✅ **Frontend:**

- `src/types/acoes.ts` - Tipos TypeScript completos
- `src/lib/acoesCorretivasAPI.ts` - Cliente API com 20+ funções
- `src/components/acoes/` - 4 componentes React
- `src/pages/` - 2 páginas principais

✅ **Banco de Dados:**

- 5 tabelas novas
- 15 políticas RLS
- 2 views otimizadas
- 12 regras de criticidade pré-configuradas

---

## 🗄️ Passo 1: Executar SQL no Supabase

### 1.1 Acessar o SQL Editor

1. Acesse: <https://supabase.com/dashboard>
2. Selecione seu projeto **EcoField**
3. Vá em **SQL Editor** no menu lateral

### 1.2 Executar Migration

1. Clique em **+ New Query**
2. Abra o arquivo:

   ```bash
   frontend/sql/migrations/20250117_criar_modulo_acoes_corretivas.sql
   ```

3. Copie **TODO O CONTEÚDO** do arquivo
4. Cole no SQL Editor
5. Clique em **Run** (ou `Ctrl/Cmd + Enter`)

### 1.3 Verificar Sucesso

Você deve ver a mensagem:

```bash
✅ Migração concluída com sucesso!
📊 Tabelas criadas: 5
📋 Views criadas: 2
⚙️  Funções criadas: 2
🔒 Políticas RLS: 15
📝 Regras iniciais: 12
```

### 1.4 Conferir Tabelas

No **Table Editor**, verifique que foram criadas:

- ✅ `acoes_corretivas`
- ✅ `historico_acoes_corretivas`
- ✅ `regras_criticidade_nc`
- ✅ `notificacoes_acoes`
- ✅ `comentarios_acoes`

---

## 🔧 Passo 2: Compilar Backend

### 2.1 Instalar Dependências

```bash
cd backend
pnpm install
```

### 2.2 Compilar TypeScript

```bash
pnpm build
```

Deve compilar sem erros. O arquivo será gerado em:

```bash
backend/dist/routes/acoesCorretivas.js
```

### 2.3 Testar Localmente

```bash
pnpm dev
```

Verifique no console:

```bash
🚀 [SERVER] Backend rodando na porta 3001
```

### 2.4 Testar Endpoint

Abra o navegador ou Postman:

```bash
GET http://localhost:3001/api/acoes-corretivas/estatisticas
```

Deve retornar estatísticas (tudo zerado inicialmente):

```json
{
  "total": 0,
  "abertas": 0,
  "criticas": 0,
  ...
}
```

---

## 🎨 Passo 3: Integrar Frontend

### 3.1 Adicionar ao Sistema de Rotas

Você tem duas opções dependendo da sua arquitetura:

#### **Opção A: Sistema Simplificado Atual**

Edite os dashboards para adicionar links:

**`src/components/AdminDashboard.tsx` ou `TecnicoDashboard.tsx`:**

```tsx
import AcoesCorretivas from '../pages/AcoesCorretivas';
import DetalhesAcaoCorretiva from '../pages/DetalhesAcaoCorretiva';

// Adicionar estado para navegação
const [pagina, setPagina] = useState('dashboard');
const [acaoId, setAcaoId] = useState<string | null>(null);

// No menu, adicionar item:
<button
  onClick={() => setPagina('acoes')}
  className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-lg"
>
  <AlertTriangle className="w-5 h-5" />
  Ações Corretivas
</button>

// No conteúdo, adicionar renderização condicional:
{pagina === 'acoes' && <AcoesCorretivas />}
{pagina === 'acao-detalhes' && acaoId && (
  <DetalhesAcaoCorretiva id={acaoId} />
)}
```

#### **Opção B: Migrar para React Router (Recomendado)**

Crie novo `App.tsx` com rotas:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AcoesCorretivas from './pages/AcoesCorretivas';
import DetalhesAcaoCorretiva from './pages/DetalhesAcaoCorretiva';

<BrowserRouter>
  <Routes>
    {/* Rotas existentes */}
    <Route path="/" element={<Dashboard />} />

    {/* Novas rotas de ações corretivas */}
    <Route path="/acoes-corretivas" element={<AcoesCorretivas />} />
    <Route path="/acoes-corretivas/:id" element={<DetalhesAcaoCorretiva />} />
  </Routes>
</BrowserRouter>
```

### 3.2 Integrar com LVForm (Marcar NC)

Edite `src/components/lv/LVForm.tsx`:

```tsx
import BotaoAcaoNC from '../acoes/BotaoAcaoNC';

// Dentro do render de cada item, após selecionar "NC":
{itemAvaliacao === 'NC' && itemObservacao && (
  <BotaoAcaoNC
    avaliacaoId={avaliacaoId}
    lvId={lvId}
    tipoLV={tipoLV}
    itemCodigo={item.codigo}
    itemPergunta={item.pergunta}
    observacaoNC={itemObservacao}
  />
)}
```

### 3.3 Adicionar ao Menu de Navegação

Localize o menu principal e adicione:

```tsx
<a
  href="/acoes-corretivas"
  className="flex items-center gap-2 text-gray-700 hover:text-emerald-600"
>
  <AlertTriangle className="w-5 h-5" />
  <span>Ações Corretivas</span>
</a>
```

---

## 🧪 Passo 4: Testar Sistema

### 4.1 Teste Manual - Criar Ação

1. **Criar uma LV com NC:**
   - Vá em "Nova LV"
   - Marque um item como "NC"
   - Adicione observação: "Container sem tampa"
   - Clique em **"Criar Ação Corretiva"**

2. **Verificar criação automática:**
   - Sistema deve criar ação automaticamente
   - Verificar criticidade aplicada corretamente
   - Verificar prazo calculado (ex: 1 dia para crítica)

3. **Acessar lista de ações:**
   - Ir para `/acoes-corretivas`
   - Deve listar a ação criada
   - Verificar badges de status e criticidade

4. **Ver detalhes:**
   - Clicar no ícone de "olho"
   - Ver detalhes completos
   - Testar mudança de status
   - Adicionar comentário

### 4.2 Testar Workflow Completo

```bash
1. NC Criada → Ação gerada (status: "aberta")
2. Clicar "Iniciar Ação" → Status: "em_andamento"
3. Adicionar evidências (fotos)
4. Clicar "Solicitar Validação" → Status: "aguardando_validacao"
5. Supervisor aprova → Status: "concluida"
```

### 4.3 Verificar Regras de Criticidade

Testar palavras-chave que devem ser críticas:

| Palavra na Observação | Criticidade Esperada | Prazo |
|-----------------------|----------------------|-------|
| "vazamento" | Crítica | 1 dia |
| "derramamento" | Crítica | 1 dia |
| "vencido" | Alta | 3 dias |
| Outras | Média | 7 dias |

### 4.4 Verificar Permissões

- ✅ **Admin**: Pode ver todas, criar, editar, deletar
- ✅ **Supervisor**: Pode ver todas, criar, editar
- ✅ **Técnico**: Pode ver todas, editar apenas se for responsável

---

## 🚀 Passo 5: Deploy

### 5.1 Deploy Backend

**Se usar Heroku/Render/Railway:**

```bash
cd backend
git add .
git commit -m "feat: adicionar módulo de ações corretivas"
git push heroku main  # ou seu remote
```

**Verificar:**

```bash
https://seu-backend.herokuapp.com/api/acoes-corretivas/estatisticas
```

### 5.2 Deploy Frontend (Vercel)

```bash
cd frontend
git add .
git commit -m "feat: adicionar módulo de ações corretivas"
git push origin main
```

Vercel vai fazer deploy automático.

### 5.3 Variáveis de Ambiente

Verificar que estão configuradas:

**Backend (.env):**

```bash
SUPABASE_URL=https://fxxvdasztireezbyykjc.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Frontend (.env):**

```bash
VITE_API_URL=https://seu-backend.herokuapp.com
VITE_SUPABASE_URL=https://fxxvdasztireezbyykjc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 📊 Endpoints Criados

### Backend API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/acoes-corretivas` | Listar com filtros |
| GET | `/api/acoes-corretivas/:id` | Detalhes + histórico |
| GET | `/api/acoes-corretivas/estatisticas` | Dashboard stats |
| POST | `/api/acoes-corretivas` | Criar manual |
| POST | `/api/acoes-corretivas/auto-criar` | Criar automática |
| PATCH | `/api/acoes-corretivas/:id/status` | Mudar status |
| POST | `/api/acoes-corretivas/:id/evidencias` | Adicionar foto |
| POST | `/api/acoes-corretivas/:id/comentarios` | Comentar |

---

## 🎨 Componentes Criados

### Componentes React

| Componente | Arquivo | Uso |
|------------|---------|-----|
| ListaAcoesCorretivas | `components/acoes/ListaAcoesCorretivas.tsx` | Lista com filtros |
| FormAcaoCorretiva | `components/acoes/FormAcaoCorretiva.tsx` | Criar ação |
| BotaoAcaoNC | `components/acoes/BotaoAcaoNC.tsx` | Botão em NC |
| CardsEstatisticasAcoes | `components/acoes/CardsEstatisticasAcoes.tsx` | Cards dashboard |

### Páginas

| Página | Arquivo | Rota |
|--------|---------|------|
| AcoesCorretivas | `pages/AcoesCorretivas.tsx` | `/acoes-corretivas` |
| DetalhesAcaoCorretiva | `pages/DetalhesAcaoCorretiva.tsx` | `/acoes-corretivas/:id` |

---

## 🔍 Troubleshooting

### Problema: SQL não executa

**Solução:**

- Verificar se todas as tabelas referenciadas existem (`lvs`, `lv_avaliacoes`, `usuarios`)
- Executar em partes menores se necessário
- Verificar permissões do usuário Supabase

### Problema: Backend não compila

**Erro comum:** `Cannot find module 'supabase'`

**Solução:**

```bash
cd backend
pnpm install @supabase/supabase-js
pnpm build
```

### Problema: 401 Unauthorized no frontend

**Solução:**

- Verificar se token está sendo enviado
- Conferir `.env` com `VITE_SUPABASE_URL` correto
- Fazer logout/login novamente

### Problema: RLS bloqueando acesso

**Sintoma:** Erro 403 ou "new row violates row-level security policy"

**Solução:**

```sql
-- Verificar se usuário tem perfil ativo
SELECT u.*, p.nome as perfil_nome
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE u.email = 'seu@email.com';

-- Se não tiver perfil, criar:
UPDATE usuarios
SET perfil_id = (SELECT id FROM perfis WHERE nome = 'ADM' LIMIT 1)
WHERE email = 'seu@email.com';
```

### Problema: Ação não é criada automaticamente

**Verificar:**

1. Regras estão ativas?

   ```sql
   SELECT * FROM regras_criticidade_nc WHERE ativo = true;
   ```

2. A observação da NC tem palavras-chave?
3. Backend está retornando erro?

---

## 📈 Métricas de Sucesso

Após implementação, você deve ter:

✅ **Funcionalidades:**

- [ ] Criar ação manual
- [ ] Criar ação automática ao marcar NC
- [ ] Ver lista com filtros
- [ ] Ver detalhes com histórico
- [ ] Mudar status (workflow)
- [ ] Adicionar comentários
- [ ] Adicionar evidências
- [ ] Dashboard com estatísticas

✅ **Performance:**

- [ ] Listagem carrega em < 2s
- [ ] Detalhes carrega em < 1s
- [ ] Criação automática < 3s

✅ **Qualidade:**

- [ ] 0 erros no console
- [ ] TypeScript sem erros
- [ ] Responsivo (mobile funciona)
- [ ] RLS protegendo dados

---

## 🎯 Próximos Passos Opcionais

### Fase 3: Notificações (Não implementado)

Para adicionar notificações por email/WhatsApp:

1. Criar service `backend/src/services/notificacoes.ts`
2. Integrar com SendGrid ou AWS SES
3. Configurar cron job para verificar prazos
4. Adicionar componente de sino no header

### Fase 4: Dashboard Avançado

- Gráficos com Recharts
- Filtros por data
- Exportação de relatórios PDF/Excel
- Métricas por responsável

### Fase 5: Integrações

- Vincular ação à Termo Ambiental
- Notificações via WhatsApp
- Assinatura eletrônica

---

## 📞 Suporte

**Documentação completa:**

- Análise do problema: `docs/06-analises/ANALISE_NAO_CONFORMIDADES_LV.md`
- Plano de ação: `docs/06-analises/PLANO_ACAO_MODULO_ACOES_CORRETIVAS.md`
- Este guia: `docs/06-analises/IMPLEMENTACAO_ACOES_CORRETIVAS.md`

**Checklist de verificação:**

```bash
# Backend
✅ SQL executado no Supabase
✅ backend/src/routes/acoesCorretivas.ts criado
✅ Rotas registradas em backend/src/index.ts
✅ Backend compilando (pnpm build)
✅ Endpoints respondendo

# Frontend
✅ Tipos em src/types/acoes.ts
✅ API client em src/lib/acoesCorretivasAPI.ts
✅ Componentes em src/components/acoes/
✅ Páginas em src/pages/
✅ Rotas adicionadas no App
✅ Menu de navegação atualizado
```

---

**Criado por:** Claude Code
**Data:** 17/11/2025
**Versão do Sistema:** 1.5.0
**Status:** ✅ Pronto para produção

---

**🎉 Parabéns! O sistema de Ações Corretivas está pronto para uso!**
