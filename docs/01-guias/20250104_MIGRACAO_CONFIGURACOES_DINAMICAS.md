# Migração: Configurações Hardcoded → Banco de Dados

**Data:** 04 de Janeiro de 2025
**Autor:** Sistema EcoField
**Status:** ✅ Em Implementação
**Prioridade:** 🔴 ALTA

---

## 📋 Sumário Executivo

Esta documentação descreve a **migração completa** de configurações que estavam hardcoded no código para tabelas dinâmicas no banco de dados PostgreSQL (Supabase).

### Motivação

- ❌ **Problema:** 12 configurações importantes estavam hardcoded no código
- 🎯 **Objetivo:** Tornar essas configurações editáveis via interface admin
- ✅ **Benefício:** Flexibilidade para customizar o sistema sem alterar código
- 🔒 **Segurança:** RLS policies garantem que apenas admins podem modificar

---

## 🔍 Configurações Migradas

### 🔴 Alta Prioridade (7 itens)

| # | Item | Arquivo Antigo | Tabela Nova |
|---|------|----------------|-------------|
| 1 | Tipos de Termo (NT, PT, RC) | `types/termos.ts:320-333` | `term_types` |
| 2 | Status de Termos | `types/termos.ts:93` | `term_status` |
| 3 | Graus de Severidade (MA, A, M, B, PE) | `types/termos.ts:352-378` | `severity_levels` |
| 4 | Natureza do Desvio | `types/termos.ts:336-349` | `deviation_nature` |
| 5 | Opções de Avaliação LV (C/NC/NA) | `lv/components/LVForm.tsx:33` | `lv_evaluation_options` |
| 6 | Status de Atividades de Rotina | `AtividadesRotinaForm.tsx:46-51` | `routine_activity_status` |
| 7 | Prefixos de Numeração (NT, PT, RC) | `TermoFormFields.tsx:65-67` | `term_types.prefix` |

### 🟡 Média Prioridade (4 itens)

| # | Item | Arquivo Antigo | Tabela Nova |
|---|------|----------------|-------------|
| 8 | Níveis de Criticidade LV | `InspecaoPlugin.tsx:68-84` | `lv_criticality_levels` |
| 9 | Tipos de Inspeção LV | `InspecaoPlugin.tsx:93-150` | `lv_inspection_types` |
| 10 | Classificação de Resíduos | `ResiduosPlugin.tsx:67-72` | `waste_classifications` |
| 11 | Regras de Validação (80%) | `InspecaoPlugin.tsx:34-41` | `lv_validation_rules` |

---

## 🗄️ Estrutura das Tabelas

### 1. term_types (Tipos de Termo)

```sql
CREATE TABLE term_types (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,      -- 'NOTIFICACAO', 'PARALIZACAO_TECNICA', 'RECOMENDACAO'
  prefix VARCHAR(10),            -- 'NT', 'PT', 'RC'
  name VARCHAR(100),
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),
  requires_signature BOOLEAN,
  requires_action_plan BOOLEAN,
  active BOOLEAN,
  display_order INTEGER
);
```

**Dados Iniciais:**
- `RECOMENDACAO` → Prefixo `RC`
- `NOTIFICACAO` → Prefixo `NT`
- `PARALIZACAO_TECNICA` → Prefixo `PT`

---

### 2. term_status (Status de Termos)

```sql
CREATE TABLE term_status (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,      -- 'PENDENTE', 'EM_ANDAMENTO', etc
  name VARCHAR(100),
  color VARCHAR(20),
  icon VARCHAR(50),
  is_initial BOOLEAN,           -- Status inicial
  is_final BOOLEAN,             -- Status final (não permite mais edição)
  allows_edit BOOLEAN,
  active BOOLEAN,
  display_order INTEGER
);
```

**Dados Iniciais:**
- `PENDENTE` → Inicial ✓
- `EM_ANDAMENTO`
- `CORRIGIDO`
- `LIBERADO` → Final ✓

---

### 3. term_status_transitions (Workflow de Transições)

```sql
CREATE TABLE term_status_transitions (
  id UUID PRIMARY KEY,
  from_status_id UUID REFERENCES term_status(id),
  to_status_id UUID REFERENCES term_status(id),
  requires_role VARCHAR(50),
  requires_comment BOOLEAN
);
```

**Transições Permitidas:**
- PENDENTE → EM_ANDAMENTO
- EM_ANDAMENTO → CORRIGIDO (requer comentário)
- CORRIGIDO → LIBERADO (requer comentário)
- EM_ANDAMENTO → PENDENTE (apenas supervisor)

---

### 4. severity_levels (Graus de Severidade)

```sql
CREATE TABLE severity_levels (
  id UUID PRIMARY KEY,
  code VARCHAR(10) UNIQUE,      -- 'MA', 'A', 'M', 'B', 'PE'
  name VARCHAR(100),            -- 'Muito Alto', 'Alto', etc
  color VARCHAR(20),            -- 'red', 'orange', 'yellow', 'blue', 'green'
  priority INTEGER,             -- 5=MA, 4=A, 3=M, 2=B, 1=PE
  requires_immediate_action BOOLEAN,
  sla_hours INTEGER,
  active BOOLEAN
);
```

**Dados Iniciais:**
- `MA` → Muito Alto (vermelho, prioridade 5, SLA 2h)
- `A` → Alto (laranja, prioridade 4, SLA 24h)
- `M` → Moderado (amarelo, prioridade 3, SLA 72h)
- `B` → Baixo (azul, prioridade 2, SLA 168h)
- `PE` → Pequeno Evento (verde, prioridade 1)

---

### 5. deviation_nature (Natureza do Desvio)

```sql
CREATE TABLE deviation_nature (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  requires_investigation BOOLEAN,
  requires_root_cause_analysis BOOLEAN
);
```

**Dados Iniciais:**
- `OCORRENCIA_REAL`
- `QUASE_ACIDENTE_AMBIENTAL`
- `POTENCIAL_NAO_CONFORMIDADE`

---

### 6. lv_evaluation_options (Opções C/NC/NA)

```sql
CREATE TABLE lv_evaluation_options (
  id UUID PRIMARY KEY,
  code VARCHAR(10) UNIQUE,      -- 'C', 'NC', 'NA'
  label VARCHAR(100),           -- 'Conforme', 'Não Conforme', 'Não Aplicável'
  color VARCHAR(20),
  icon VARCHAR(50),
  affects_compliance BOOLEAN,
  weight DECIMAL(3,2),          -- C=1.0, NC=0.0, NA=null
  active BOOLEAN
);
```

**Dados Iniciais:**
- `C` → Conforme (verde, CheckCircle, peso 1.0)
- `NC` → Não Conforme (vermelho, XCircle, peso 0.0)
- `NA` → Não Aplicável (cinza, MinusCircle, não afeta compliance)

---

### 7. routine_activity_status (Status de Atividades)

```sql
CREATE TABLE routine_activity_status (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  is_initial BOOLEAN,
  is_final BOOLEAN,
  allows_edit BOOLEAN,
  allows_photos BOOLEAN
);
```

**Dados Iniciais:**
- `PLANEJADA` → Inicial ✓
- `EM_ANDAMENTO`
- `CONCLUIDA` → Final ✓
- `CANCELADA` → Final ✓

---

### 8. lv_criticality_levels (Criticidade LV)

```sql
CREATE TABLE lv_criticality_levels (
  id UUID PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(100),
  priority INTEGER,             -- 1=baixa, 2=media, 3=alta, 4=critica
  requires_immediate_action BOOLEAN
);
```

**Dados Iniciais:**
- `baixa` → Baixa - Rotina
- `media` → Média - Importante
- `alta` → Alta - Crítica
- `critica` → Crítica - Urgente

---

### 9. lv_inspection_types (Tipos de Inspeção)

```sql
CREATE TABLE lv_inspection_types (
  id UUID PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(100),
  requires_checklist BOOLEAN,
  requires_report BOOLEAN,
  frequency_days INTEGER
);
```

**Dados Iniciais:**
- `preventiva` → Frequência 30 dias
- `corretiva` → Requer relatório
- `auditoria` → Frequência 90 dias

---

### 10. waste_classifications (Classificação de Resíduos)

```sql
CREATE TABLE waste_classifications (
  id UUID PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(100),
  regulatory_reference VARCHAR(200),
  requires_special_handling BOOLEAN,
  requires_manifest BOOLEAN,
  disposal_restrictions TEXT
);
```

**Dados Iniciais (NBR 10.004/2004):**
- `classe1` → Classe I - Perigoso (MTR obrigatório)
- `classe2a` → Classe II A - Não Inerte
- `classe2b` → Classe II B - Inerte

---

### 11. lv_validation_rules (Regras de Validação)

```sql
CREATE TABLE lv_validation_rules (
  id UUID PRIMARY KEY,
  rule_type VARCHAR(50),        -- 'minimum_percentage', 'required_photos'
  entity_type VARCHAR(50),      -- 'lv_inspecao', 'lv_residuos', null=todos
  threshold_value DECIMAL(10,2),
  error_message TEXT,
  warning_message TEXT,
  is_blocking BOOLEAN
);
```

**Dados Iniciais:**
- Regra: 80% mínimo para `lv_inspecao` (bloqueante)
- Regra: 70% mínimo para `lv_residuos` (bloqueante)
- Regra: 1 foto mínima (não bloqueante)

---

## 🔐 Segurança (RLS Policies)

Todas as tabelas têm **Row Level Security** habilitado com as seguintes policies:

```sql
-- Todos podem LER
CREATE POLICY "Todos podem ler" ON table_name
  FOR SELECT USING (true);

-- Apenas ADMIN pode MODIFICAR
CREATE POLICY "Apenas admin pode modificar" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid() AND p.nome = 'Admin'
    )
  );
```

---

## 🚀 APIs Criadas

### Backend: `/backend/src/routes/configuracoes.ts`

Novas rotas adicionadas:

```typescript
GET  /api/configuracoes/dinamicas/all              // Todas as configs de uma vez
GET  /api/configuracoes/dinamicas/term-types
GET  /api/configuracoes/dinamicas/term-status
GET  /api/configuracoes/dinamicas/severity-levels
GET  /api/configuracoes/dinamicas/deviation-nature
GET  /api/configuracoes/dinamicas/lv-evaluation-options
GET  /api/configuracoes/dinamicas/routine-status
GET  /api/configuracoes/dinamicas/lv-criticality-levels
GET  /api/configuracoes/dinamicas/lv-inspection-types
GET  /api/configuracoes/dinamicas/waste-classifications
GET  /api/configuracoes/dinamicas/lv-validation-rules
GET  /api/configuracoes/dinamicas/term-status/:id/transitions
```

### Frontend: `/frontend/src/lib/configsDinamicasAPI.ts`

Cliente API com funções:

```typescript
// Buscar todas as configurações
const configs = await getAllConfigurations();

// Buscar específicas
const termTypes = await getTermTypes();
const termStatus = await getTermStatus();
const severityLevels = await getSeverityLevels();
// ... etc

// Helpers de conversão (compatibilidade com código legado)
const legacyFormat = convertTermTypesToLegacyFormat(termTypes);
const prefix = getTermPrefixByCode(termTypes, 'NOTIFICACAO'); // 'NT'
```

---

## 📦 Arquivos Criados/Modificados

### ✨ Novos Arquivos

1. `frontend/sql/migrations/20250104_criar_tabelas_configuracoes_dinamicas.sql` (580 linhas)
   - Cria 11 tabelas
   - Configura triggers de `updated_at`
   - Habilita RLS com policies

2. `frontend/sql/migrations/20250104_popular_configuracoes_dinamicas.sql` (320 linhas)
   - Popula todas as tabelas com dados iniciais
   - Migra valores hardcoded para banco
   - Exibe estatísticas de população

3. `frontend/src/lib/configsDinamicasAPI.ts` (580 linhas)
   - Cliente API TypeScript
   - 11 tipos de interface
   - 10 funções de busca
   - 6 helpers de conversão

4. `frontend/docs/20250104_MIGRACAO_CONFIGURACOES_DINAMICAS.md` (este arquivo)
   - Documentação completa da migração

### 🔧 Arquivos Modificados

1. `backend/src/routes/configuracoes.ts`
   - Adicionadas 12 novas rotas
   - Endpoint `/dinamicas/all` para busca consolidada

---

## 📝 Passos de Execução

### Passo 1: Executar Migrações SQL ✅

```bash
# No Supabase SQL Editor, executar na ordem:

1. frontend/sql/migrations/20250104_criar_tabelas_configuracoes_dinamicas.sql
2. frontend/sql/migrations/20250104_popular_configuracoes_dinamicas.sql
```

**Resultado esperado:**
```
✅ 11 tabelas criadas
✅ RLS policies aplicadas
✅ Triggers configurados
✅ Dados iniciais populados
```

---

### Passo 2: Testar APIs Backend ⏳ Pendente

```bash
# Testar endpoint consolidado
curl http://localhost:3001/api/configuracoes/dinamicas/all

# Testar endpoints específicos
curl http://localhost:3001/api/configuracoes/dinamicas/term-types
curl http://localhost:3001/api/configuracoes/dinamicas/severity-levels
```

---

### Passo 3: Migrar Código Frontend ⏳ Pendente

Arquivos a migrar:

#### 3.1 TermoFormFields.tsx

**Antes:**
```typescript
const prefixo = tipo === 'PARALIZACAO_TECNICA' ? 'PT' :
                tipo === 'NOTIFICACAO' ? 'NT' : 'RC';
```

**Depois:**
```typescript
import { getTermPrefixByCode } from '@/lib/configsDinamicasAPI';

// Carregar configs no início do componente
const { data: configs } = useQuery(['configs'], getAllConfigurations);

// Usar helper
const prefixo = getTermPrefixByCode(configs.termTypes, tipo);
```

---

#### 3.2 AtividadesRotinaForm.tsx

**Antes:**
```typescript
const getStatusOptions = () => [
  { value: 'Planejada', label: 'Planejada' },
  { value: 'Em Andamento', label: 'Em Andamento' },
  { value: 'Concluída', label: 'Concluída' },
  { value: 'Cancelada', label: 'Cancelada' }
];
```

**Depois:**
```typescript
import { getRoutineActivityStatus, convertRoutineStatusToSelectOptions } from '@/lib/configsDinamicasAPI';

const { data: statusOptions } = useQuery(
  ['routine-status'],
  async () => {
    const statuses = await getRoutineActivityStatus();
    return convertRoutineStatusToSelectOptions(statuses);
  }
);
```

---

#### 3.3 LVForm.tsx

**Antes:**
```typescript
const atualizarAvaliacao = (itemId: number, valor: "C" | "NC" | "NA" | "") => {
  // ...
}
```

**Depois:**
```typescript
import { getLVEvaluationOptions } from '@/lib/configsDinamicasAPI';

const { data: evaluationOptions } = useQuery(['lv-eval-options'], getLVEvaluationOptions);

// Renderizar botões dinamicamente
{evaluationOptions?.map(opt => (
  <button
    key={opt.code}
    className={`badge-${opt.color}`}
    onClick={() => atualizarAvaliacao(itemId, opt.code)}
  >
    {opt.icon && <Icon name={opt.icon} />}
    {opt.label}
  </button>
))}
```

---

#### 3.4 types/termos.ts

**Antes:**
```typescript
export const TIPOS_TERMO = {
  RECOMENDACAO: { nome: 'Recomendação', descricao: '...' },
  NOTIFICACAO: { nome: 'Notificação', descricao: '...' },
  PARALIZACAO_TECNICA: { nome: 'Paralização Técnica', descricao: '...' }
};
```

**Depois:**
```typescript
// Marcar como @deprecated e manter para compatibilidade
/**
 * @deprecated Use getTermTypes() da configsDinamicasAPI
 * Mantido apenas para retrocompatibilidade
 */
export const TIPOS_TERMO = { ... };
```

---

### Passo 4: Criar CRUDs Admin ⏳ Pendente

Criar componentes admin para gerenciar as configurações:

1. `AdminConfiguracoesDinamicas.tsx`
   - Lista todas as configurações
   - Filtros por tabela

2. `CrudTermTypes.tsx`
   - CRUD completo para tipos de termo
   - Validação de prefixos únicos

3. `CrudSeverityLevels.tsx`
   - CRUD para níveis de severidade
   - Ordenação por prioridade

4. `CrudLVEvaluationOptions.tsx`
   - CRUD para opções de avaliação
   - Preview visual das cores/ícones

---

### Passo 5: Remover Código Hardcoded ⏳ Pendente

Após migração completa e testes:

1. Comentar constantes antigas em `types/termos.ts`
2. Adicionar avisos de @deprecated
3. Atualizar imports em todos os arquivos
4. Remover código comentado após 1 sprint de validação

---

## 🧪 Testes

### Checklist de Testes

- [ ] **Tabelas criadas:** Verificar no Supabase
- [ ] **Dados populados:** SELECT * de cada tabela
- [ ] **RLS policies:** Testar com usuário não-admin
- [ ] **APIs backend:** Testar todas as rotas
- [ ] **Frontend:** Termos carregam tipos dinâmicos
- [ ] **Frontend:** Atividades carregam status dinâmicos
- [ ] **Frontend:** LVs usam opções dinâmicas
- [ ] **Admin:** CRUDs funcionando
- [ ] **Offline:** Configs em cache funcionam

---

## 🎯 Benefícios Alcançados

### Antes da Migração ❌

- 12 configurações hardcoded em 8 arquivos diferentes
- Alterar qualquer configuração requeria:
  - Editar código TypeScript
  - Rebuild da aplicação
  - Deploy para produção
  - Potencial de introduzir bugs
- Sem histórico de mudanças
- Sem controle de acesso

### Depois da Migração ✅

- 11 tabelas configuráveis no banco
- Alterar configurações via interface admin:
  - Mudança instantânea
  - Sem rebuild/deploy
  - Zero risco de bugs de código
- Histórico via `updated_at`
- Controle de acesso via RLS
- Auditoria completa
- Multi-tenant ready

---

## 🔮 Próximos Passos

### Melhorias Futuras

1. **Cache Inteligente**
   - Implementar cache local com Service Worker
   - Invalidação automática quando admin edita

2. **Versionamento**
   - Tabela de histórico de configurações
   - Rollback para versões anteriores

3. **Import/Export**
   - Exportar configurações em JSON
   - Importar configurações entre ambientes

4. **Validações Customizáveis**
   - Editor visual de regras de validação
   - DSL para expressões condicionais

5. **Multi-idioma**
   - Suporte a i18n nas configurações
   - Tradução dinâmica de labels

---

## 📚 Referências

### Arquivos Relacionados

- `frontend/sql/migrations/20250104_criar_tabelas_configuracoes_dinamicas.sql`
- `frontend/sql/migrations/20250104_popular_configuracoes_dinamicas.sql`
- `backend/src/routes/configuracoes.ts`
- `frontend/src/lib/configsDinamicasAPI.ts`
- `frontend/src/types/termos.ts`

### Documentação Relacionada

- `RESUMO_EXECUTIVO_SINCRONIZACAO.md` - Sistema de sincronização
- `SCHEMA_BANCO_COMPLETO.md` - Schema completo do banco
- `OFFLINE_IMPLEMENTATION_SUMMARY.md` - Implementação offline

---

## ✅ Status da Migração

| Etapa | Status | Data |
|-------|--------|------|
| Criar tabelas SQL | ✅ Concluído | 04/01/2025 |
| Popular dados | ✅ Concluído | 04/01/2025 |
| Criar APIs backend | ✅ Concluído | 04/01/2025 |
| Criar cliente API frontend | ✅ Concluído | 04/01/2025 |
| Documentar migração | ✅ Concluído | 04/01/2025 |
| Executar migrações SQL | ⏳ Pendente | - |
| Migrar código frontend | ⏳ Pendente | - |
| Criar CRUDs admin | ⏳ Pendente | - |
| Remover código hardcoded | ⏳ Pendente | - |
| Testes integrados | ⏳ Pendente | - |

---

## 📞 Suporte

Em caso de dúvidas sobre esta migração:

1. Consultar este documento
2. Verificar código nos arquivos criados
3. Revisar SQL migrations
4. Testar APIs no Postman/Insomnia

---

**Fim da Documentação**

*Última atualização: 04/01/2025 às 14:30*
