# 🔍 Análise: Não Conformidades em LVs - Estado Atual

**Data:** 16/11/2025
**Versão:** 1.0
**Autor:** Análise técnica do sistema

---

## 📋 Pergunta

> Quando tenho uma LV que tem não conformidade, essa não conformidade gera algum procedimento ou plano de ação?

---

## ✅ Resposta Direta

**NÃO**, atualmente o sistema **não gera automaticamente** nenhum procedimento ou plano de ação quando uma não conformidade (NC) é registrada em uma Lista de Verificação (LV).

---

## 📊 Estado Atual do Sistema

### 1. **O que acontece quando há uma NC?**

Quando um técnico marca um item como **"NC" (Não Conforme)** em uma LV:

1. ✅ A avaliação é **registrada** no banco de dados
2. ✅ Pode adicionar **observação específica** para o item
3. ✅ Pode adicionar **fotos** relacionadas ao item
4. ✅ As **estatísticas** são calculadas automaticamente:
   - Total de itens conformes (C)
   - Total de não conformes (NC)
   - Total de não aplicáveis (NA)
   - Percentual de conformidade

5. ❌ **NÃO gera** automaticamente:
   - Plano de ação
   - Procedimento corretivo
   - Atribuição de responsável
   - Prazo para correção
   - Follow-up da correção
   - Notificações

---

## 🗄️ Estrutura de Dados Atual

### Tabela `lv_avaliacoes`

```sql
CREATE TABLE lv_avaliacoes (
  id uuid PRIMARY KEY,
  lv_id uuid NOT NULL,
  tipo_lv text NOT NULL,
  item_id uuid NOT NULL,
  item_codigo text NOT NULL,
  item_pergunta text NOT NULL,
  avaliacao text NOT NULL CHECK (avaliacao IN ('C', 'NC', 'NA')),
  observacao text,  -- ← Campo para observações (opcional)
  created_at timestamp
);
```

**Campos existentes:**

- ✅ `avaliacao` - Conforme (C), Não Conforme (NC) ou Não Aplicável (NA)
- ✅ `observacao` - Texto livre para descrever o problema
- ❌ **Não possui**: ação corretiva, responsável, prazo, status

---

### Tabela `lvs` (Lista de Verificação Principal)

```sql
CREATE TABLE lvs (
  id uuid PRIMARY KEY,
  tipo_lv text NOT NULL,
  nome_lv text NOT NULL,
  usuario_id uuid NOT NULL,
  data_inspecao date NOT NULL,
  area text NOT NULL,
  responsavel_tecnico text,
  observacoes text,  -- ← Observações gerais da LV
  total_itens integer,
  itens_conformes integer,
  itens_nao_conformes integer,
  percentual_conformidade numeric,
  -- ...outros campos
);
```

**Campos calculados:**

- ✅ `itens_nao_conformes` - Quantidade de NCs
- ✅ `percentual_conformidade` - Percentual calculado
- ❌ **Não possui**: plano de ação, ações corretivas

---

## 💡 Fluxo Atual de Trabalho

```bash
┌─────────────────────────────────────────────────────────┐
│  TÉCNICO PREENCHE LV                                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Para cada item, marca: C, NC ou NA                     │
│  - Se NC: pode adicionar observação                     │
│  - Se NC: pode adicionar fotos                          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  SISTEMA SALVA NO BANCO                                 │
│  - Calcula estatísticas                                 │
│  - Percentual de conformidade                           │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  FIM - Nenhuma ação automática gerada                   │
│  ❌ Não cria plano de ação                              │
│  ❌ Não notifica responsáveis                           │
│  ❌ Não gera procedimento                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Interface do Usuário

### Formulário de LV (`LVForm.tsx`)

**Opções para cada item:**

```tsx
[C]  Conforme      - Botão verde
[NC] Não Conforme  - Botão vermelho
[NA] Não Aplicável - Botão amarelo
```

**Campos disponíveis para NC:**

1. **Observação individual** - Campo de texto livre
2. **Fotos** - Upload de imagens do problema
3. **Observações gerais** - Campo de observações gerais da LV

**Exemplo:**

```bash
Item: 05.02 - Resíduos Classe I armazenados adequadamente?
Avaliação: [NC] ← Marcado como Não Conforme

Observação: "Container sem tampa, resíduos expostos à chuva"
Fotos: [foto1.jpg] [foto2.jpg]
```

---

## 🎯 Estatísticas Calculadas

Após preencher todos os itens, o sistema calcula:

```typescript
{
  totalItens: 30,
  itensAvaliados: 28,      // Apenas C, NC ou NA
  conformes: 25,            // C
  naoConformes: 2,          // NC ← Aqui ficam as NCs
  naoAplicaveis: 1,         // NA
  percentualConformidade: 89,  // (25/28) * 100
  fotos: 5
}
```

---

## ⚠️ Limitações Atuais

### O que NÃO existe hoje

1. ❌ **Tabela de Ações Corretivas** - Não há estrutura para registrar ações
2. ❌ **Atribuição de Responsável** - NC não é atribuída a ninguém
3. ❌ **Prazo para Correção** - Não há controle de deadline
4. ❌ **Status de Tratativa** - Não rastreia se foi resolvido
5. ❌ **Notificações** - Sistema não avisa gestores sobre NCs
6. ❌ **Follow-up** - Não há como marcar NC como resolvida
7. ❌ **Histórico de Correções** - Não registra ações tomadas
8. ❌ **Workflow de Aprovação** - NC não passa por aprovação
9. ❌ **Integração com Termos** - NC não gera termo automaticamente
10. ❌ **Relatórios de NCs** - Não há dashboard específico de NCs

---

## 📈 Como os Dados São Usados Atualmente

### 1. **Relatórios/Dashboards**

- Supervisor pode ver LVs com baixa conformidade
- Listagem de LVs mostra percentual de conformidade
- Possível filtrar LVs por conformidade

### 2. **Metas**

- Sistema de metas pode contar LVs realizadas
- **MAS**: Não considera a qualidade (% de conformidade)

### 3. **Registro Histórico**

- LVs ficam registradas no banco
- Possível consultar LVs antigas
- **MAS**: Não rastreia se NCs foram corrigidas

---

## 💼 Processo Manual Atual

Como não há sistema automático, a tratativa provavelmente funciona assim:

1. **Técnico** preenche LV e marca NC com observação
2. **Técnico** tira fotos do problema
3. **Supervisor** visualiza LV no sistema
4. **Supervisor** vê itens NC e observações
5. **Supervisor** (externamente ao sistema):
   - Cria plano de ação em planilha/documento
   - Atribui responsável
   - Define prazo
   - Acompanha correção
6. **Técnico** corrige o problema (sem registro no sistema)
7. **Nova LV** é feita posteriormente para verificar correção

---

## 🚀 Oportunidades de Melhoria

### 1. **Plano de Ação Automático** (Baixo Esforço)

Adicionar campos à tabela `lv_avaliacoes`:

```sql
ALTER TABLE lv_avaliacoes ADD COLUMN requer_acao boolean DEFAULT false;
ALTER TABLE lv_avaliacoes ADD COLUMN responsavel_acao text;
ALTER TABLE lv_avaliacoes ADD COLUMN prazo_acao date;
ALTER TABLE lv_avaliacoes ADD COLUMN status_acao text DEFAULT 'pendente';
  -- pendente, em_andamento, concluida, cancelada
```

### 2. **Tabela de Ações Corretivas** (Médio Esforço)

```sql
CREATE TABLE acoes_corretivas (
  id uuid PRIMARY KEY,
  lv_id uuid REFERENCES lvs(id),
  item_id uuid REFERENCES lv_avaliacoes(id),
  descricao_nc text NOT NULL,
  acao_proposta text NOT NULL,
  responsavel_id uuid REFERENCES usuarios(id),
  prazo date NOT NULL,
  status text DEFAULT 'aberta',
  data_conclusao date,
  evidencias_correcao text[], -- URLs de fotos
  observacoes_conclusao text,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);
```

### 3. **Workflow Completo** (Alto Esforço)

```bash
NC Detectada
    ↓
Criar Ação Corretiva Automática
    ↓
Atribuir Responsável (baseado em área/tipo)
    ↓
Definir Prazo (baseado em criticidade)
    ↓
Notificar Responsável (email/push)
    ↓
Acompanhar Status
    ↓
Validar Correção (nova LV ou fotos)
    ↓
Fechar Ação
```

### 4. **Integrações**

- **Com Termos Ambientais**: NC grave gera termo automaticamente
- **Com Metas**: Medir % de NCs resolvidas no prazo
- **Com Notificações**: Avisar gestores de NCs críticas
- **Com Dashboard**: Painel de NCs abertas/atrasadas

---

## 📊 Tabelas Relacionadas que Poderiam Ser Usadas

### 1. **lv_criticality_levels** (Já existe!)

```sql
CREATE TABLE lv_criticality_levels (
  code varchar NOT NULL,
  name varchar NOT NULL,
  requires_immediate_action boolean DEFAULT false,  -- ← Útil para NCs
  active boolean DEFAULT true
);
```

**Uso potencial:**

- Associar cada pergunta a um nível de criticidade
- NCs em itens críticos geram ação automática
- NCs em itens não críticos ficam para follow-up

### 2. **termos_ambientais** (Já existe!)

```sql
CREATE TABLE termos_ambientais (
  id uuid PRIMARY KEY,
  tipo text NOT NULL,
  numero text NOT NULL,
  descricao text,
  status text,
  -- ...
);
```

**Uso potencial:**

- NC grave pode gerar Termo de Não Conformidade
- Vincular LV → Termo → Ação Corretiva

---

## 📝 Exemplo Prático

### Cenário Atual

**LV:** Gestão de Resíduos (Tipo 01)
**Item 05.02:** Resíduos Classe I armazenados adequadamente?
**Avaliação:** NC
**Observação:** "Container sem tampa, resíduos expostos à chuva"
**Fotos:** 2 fotos anexadas

**O que acontece:**

- ✅ Dados salvos no banco
- ✅ Percentual de conformidade da LV cai para 89%
- ✅ Supervisor pode ver a NC na listagem
- ❌ **Nenhuma ação automática é gerada**
- ❌ **Responsável não é notificado**
- ❌ **Não há prazo para correção**

### Cenário Ideal (com melhorias)

**LV:** Gestão de Resíduos (Tipo 01)
**Item 05.02:** Resíduos Classe I armazenados adequadamente?
**Avaliação:** NC
**Observação:** "Container sem tampa, resíduos expostos à chuva"
**Fotos:** 2 fotos anexadas

**O que aconteceria:**

- ✅ Dados salvos no banco
- ✅ **Sistema detecta NC em item crítico**
- ✅ **Cria ação corretiva automaticamente:**
  - Descrição: "Providenciar tampa para container de Classe I"
  - Responsável: João Silva (encarregado da área)
  - Prazo: 3 dias (baseado em criticidade)
  - Status: Aberta
- ✅ **Notifica por email/WhatsApp:**
  - João Silva (responsável)
  - Gestor ambiental (supervisor)
- ✅ **Dashboard atualizado:**
  - +1 ação corretiva aberta
  - Alerta de NC em resíduos perigosos
- ✅ **Follow-up automático:**
  - Lembrete 1 dia antes do prazo
  - Solicitação de evidências de correção

---

## 🎯 Recomendações

### Curto Prazo (Melhoria Rápida)

1. **Adicionar campo de observações obrigatório para NCs**
2. **Criar relatório específico de NCs**
3. **Dashboard com NCs por área/período**

### Médio Prazo (Funcionalidade Nova)

1. **Implementar tabela de ações corretivas**
2. **Permitir atribuição de responsável**
3. **Definir prazos para correção**
4. **Sistema de notificações**

### Longo Prazo (Workflow Completo)

1. **Workflow de tratativa de NCs**
2. **Integração com termos ambientais**
3. **Validação de correções com fotos**
4. **Métricas de efetividade (tempo médio de correção)**

---

## 📌 Conclusão

**Resposta à pergunta original:**

> ❌ **NÃO**, atualmente o sistema **não gera** nenhum procedimento ou plano de ação automático quando uma LV tem não conformidade.

**O que o sistema faz:**

- ✅ Registra a NC
- ✅ Permite adicionar observações e fotos
- ✅ Calcula estatísticas
- ✅ Exibe nos relatórios

**O que o sistema NÃO faz:**

- ❌ Criar ação corretiva
- ❌ Atribuir responsável
- ❌ Definir prazo
- ❌ Notificar gestores
- ❌ Acompanhar resolução

**Recomendação:**

Se a gestão de não conformidades é importante para o negócio, **recomendo fortemente** implementar um módulo de **Ações Corretivas** para fechar esse gap funcional.

---

**Quer que eu crie uma proposta de implementação para o módulo de Ações Corretivas?** 🚀

---

**Documentado por:** Claude Code
**Data:** 16/11/2025
**Versão do Sistema:** 1.4.0
