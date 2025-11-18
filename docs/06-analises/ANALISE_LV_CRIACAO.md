# ANÁLISE COMPLETA DO FLUXO DE CRIAÇÃO DE LVs - ECOFIELD

## 1. VISÃO GERAL DO PROBLEMA

O constraint `lvs_status_check` está falhando ao criar LVs porque o status está sendo enviado com um valor que não está na lista branca de valores permitidos.

---

## 2. SCHEMA COMPLETO DA TABELA LVs

### Definição da Tabela

```sql
CREATE TABLE public.lvs (
  id uuid not null default extensions.uuid_generate_v4(),
  tipo_lv text not null,
  nome_lv text not null,
  usuario_id uuid not null,
  usuario_nome text not null,
  usuario_matricula text null,
  usuario_email text not null default '',
  data_inspecao date not null default CURRENT_DATE,
  data_preenchimento timestamp with time zone not null default CURRENT_TIMESTAMP,
  area text not null,
  responsavel_area text null,
  responsavel_tecnico text not null default '',
  responsavel_empresa text not null default '',
  inspetor_principal text not null,
  inspetor_secundario text null,
  inspetor_secundario_matricula text null,  ← CAMPO IMPORTANTE
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  gps_precisao numeric(10, 2) null,
  endereco_gps text null,
  observacoes text null,
  observacoes_gerais text null,
  total_fotos integer null default 0,
  total_conformes integer null default 0,
  total_nao_conformes integer null default 0,
  total_nao_aplicaveis integer null default 0,
  percentual_conformidade numeric(5, 2) null default 0,
  status text not null default 'concluido',
  sincronizado boolean not null default true,
  numero_sequencial serial not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  auth_user_id uuid,  ← CAMPO IMPORTANTE
  
  constraint lvs_pkey primary key (id),
  constraint lvs_usuario_id_fkey foreign key (usuario_id) references usuarios (id),
  
  ✗ CONSTRAINT PROBLEMÁTICO:
  constraint lvs_status_check check (
    status = any (array['concluido', 'rascunho', 'concluida'])
  )
);
```

### Constraint lvs_status_check

```b
Valores permitidos: 'concluido', 'rascunho', 'concluida'
Tipo: CHECK constraint
Padrão: 'concluido'
Problema: Backend está enviando outro valor
```

---

## 3. FLUXO COMPLETO DE DADOS

### 3.1 FRONTEND - Preparação de Dados (useLV.ts)

**Local:** `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/components/lv/hooks/useLV.ts`

**Função:** `salvarFormulario()` (linhas 272-361)

**Objeto enviado (LVCriacao):**

```typescript
const dadosCriacao: LVCriacao = {
  tipo_lv,                                           // string (ex: '01')
  titulo: state.configuracao.nomeCompleto,           // string
  nome_lv: state.configuracao.nome,                  // string
  usuario_id: user.id,                               // uuid
  usuario_nome: user.nome,                           // string
  usuario_email: user.email,                         // string
  data_inspecao: state.dadosFormulario.data_inspecao, // YYYY-MM-DD
  area: state.dadosFormulario.area,                  // string
  responsavel_area: state.dadosFormulario.responsavelArea,        // string
  responsavel_tecnico: state.dadosFormulario.responsavel_tecnico, // string
  responsavel_empresa: state.dadosFormulario.responsavelEmpresa,  // string
  inspetor_principal: state.dadosFormulario.inspetor_principal,   // string
  inspetor_secundario: state.dadosFormulario.inspetor2Nome,       // string
  inspetor_secundario_matricula: state.dadosFormulario.inspetor2Matricula, // ← ENVIADO
  latitude: state.dadosFormulario.latitude || undefined,          // number
  longitude: state.dadosFormulario.longitude || undefined,        // number
  gps_precisao: state.dadosFormulario.gpsAccuracy || undefined,   // number
  endereco_gps: state.dadosFormulario.enderecoGPS,                // string
  observacoes_gerais: state.dadosFormulario.observacoes,          // string
  assinatura_inspetor_principal: ...,                // string (base64)
  data_assinatura_inspetor_principal: ...,           // date
  assinatura_inspetor_secundario: ...,               // string (base64)
  data_assinatura_inspetor_secundario: ...,          // date
}
```

### 3.2 FRONTEND - API Client (lvAPI.ts)

**Local:** `/Users/uedersonferreira/MeusProjetos/ecofield/frontend/src/lib/lvAPI.ts`

**Função:** `criarLV()` (linhas 145-195)

**O que faz:**

```typescript
// 1. Busca token de autenticação
const token = getAuthToken();

// 2. Log dos dados (para debug)
console.log('📤 [LV API] Enviando dados para API:', {
  url: `${API_URL}/api/lvs`,
  method: 'POST',
  dadosKeys: Object.keys(dados),  // Mostra TODOS os campos
  sample: {
    tipo_lv: dados.tipo_lv,
    titulo: dados.titulo,
    data_inspecao: dados.data_inspecao,
    area: dados.area,
  }
});

// 3. Envia JSON para backend
const response = await fetch(`${API_URL}/api/lvs`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(dados)  // ← TODOS OS CAMPOS SÃO ENVIADOS
});
```

**Campos enviados pelo API client:**

- ✅ Envia TODOS os campos sem filtrar
- ✅ Envia `inspetor_secundario_matricula` corretamente

### 3.3 BACKEND - Rota de Criação (lvs.ts)

**Local:** `/Users/uedersonferreira/MeusProjetos/ecofield/backend/src/routes/lvs.ts`

**Função:** POST `/api/lvs` (linhas 98-168)

**O que faz:**

```typescript
// 1. Recebe dados do frontend
const lvData: Record<string, unknown> = req.body;

// 2. REMOVER CAMPOS NÃO-SUPORTADOS
const { offline, titulo, ...lvDataClean } = lvData;

// 3. PREPARAR DADOS PARA INSERÇÃO
const novaLV = {
  ...lvDataClean,                      // ← SPREAD de TODOS os campos
  nome_lv: lvDataClean.nome_lv || titulo,
  auth_user_id: user?.id || '',        // ← ADICIONA auth_user_id
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'ativo',                     // ← PROBLEMA! Status sendo definido como 'ativo'
  sincronizado: true
};

// 4. INSERIR NO SUPABASE
const { data, error } = await supabase
  .from('lvs')
  .insert(novaLV)
  .select()
  .single();
```

---

## 4. IDENTIFICAÇÃO DO PROBLEMA

### O Constraint está falhando porque

**Status válidos no DB:** `['concluido', 'rascunho', 'concluida']`

**Status sendo enviado pelo backend:** `'ativo'` (linha 133 do lvs.ts)

### Por que o backend está fazendo isso

Na linha 133 do `backend/src/routes/lvs.ts`:

```typescript
status: 'ativo',  // ✗ NÃO está na lista de valores permitidos!
```

Isso sobrescreve qualquer valor de `status` que venha do frontend.

### Cenários possíveis

1. **Se frontend não enviar status**: O backend insere `'ativo'` → FALHA
2. **Se frontend enviar status válido**: O backend SOBRESCREVE com `'ativo'` → FALHA
3. **Se frontend enviar status inválido**: O backend SOBRESCREVE com `'ativo'` → FALHA

---

## 5. CAMPOS QUE ESTÃO SENDO ENVIADOS

### Do Frontend (useLV.ts) → Para o Backend (lvAPI.ts)

| Campo | Tipo | Enviado? | Observação |
|-------|------|----------|-----------|
| tipo_lv | string | ✅ Sim | Obrigatório |
| titulo | string | ✅ Sim | Mapeado para nome_lv no backend |
| nome_lv | string | ✅ Sim | |
| usuario_id | uuid | ✅ Sim | |
| usuario_nome | string | ✅ Sim | |
| usuario_email | string | ✅ Sim | |
| data_inspecao | date | ✅ Sim | |
| area | string | ✅ Sim | Obrigatório |
| responsavel_area | string | ✅ Sim | |
| responsavel_tecnico | string | ✅ Sim | |
| responsavel_empresa | string | ✅ Sim | |
| inspetor_principal | string | ✅ Sim | Obrigatório |
| inspetor_secundario | string | ✅ Sim | |
| **inspetor_secundario_matricula** | string | ✅ Sim | Campo IMPORTANTE - estava faltando |
| latitude | number | ✅ Sim (optional) | |
| longitude | number | ✅ Sim (optional) | |
| gps_precisao | number | ✅ Sim (optional) | |
| endereco_gps | string | ✅ Sim | |
| observacoes_gerais | string | ✅ Sim | |
| assinatura_inspetor_principal | base64 | ✅ Sim (optional) | |
| data_assinatura_inspetor_principal | date | ✅ Sim (optional) | |
| assinatura_inspetor_secundario | base64 | ✅ Sim (optional) | |
| data_assinatura_inspetor_secundario | date | ✅ Sim (optional) | |

### Do Backend para o Supabase

| Campo | Enviado? | Fonte | Observação |
|-------|----------|-------|-----------|
| ...lvDataClean | ✅ Sim | Frontend | Spread de todos os campos |
| auth_user_id | ✅ Sim | user?.id | ADICIONADO pelo backend |
| created_at | ✅ Sim | Server | Data atual |
| updated_at | ✅ Sim | Server | Data atual |
| **status** | ✅ Sim | Backend | ✗ HARDCODED como 'ativo' → PROBLEMA! |
| sincronizado | ✅ Sim | Backend | true |

---

## 6. MAPEO DE CAMPOS

```bash
Frontend (useLV.ts)           Frontend (lvAPI)           Backend (lvs.ts)        Database (lvs)
─────────────────────────────────────────────────────────────────────────────────────────────
tipo_lv                   →   tipo_lv              →   tipo_lv              →  tipo_lv
titulo                    →   titulo               →   (removido)           →  (não entra)
nome_lv                   →   nome_lv              →   nome_lv              →  nome_lv
usuario_id                →   usuario_id           →   usuario_id           →  usuario_id
usuario_nome              →   usuario_nome         →   usuario_nome         →  usuario_nome
usuario_email             →   usuario_email        →   usuario_email        →  usuario_email
data_inspecao             →   data_inspecao        →   data_inspecao        →  data_inspecao
area                      →   area                 →   area                 →  area
responsavel_area          →   responsavel_area     →   responsavel_area     →  responsavel_area
responsavel_tecnico       →   responsavel_tecnico  →   responsavel_tecnico  →  responsavel_tecnico
responsavel_empresa       →   responsavel_empresa  →   responsavel_empresa  →  responsavel_empresa
inspetor_principal        →   inspetor_principal   →   inspetor_principal   →  inspetor_principal
inspetor2Nome             →   inspetor_secundario  →   inspetor_secundario  →  inspetor_secundario
inspetor2Matricula        →   inspetor_secundario_matricula  →  inspetor_secundario_matricula  →  inspetor_secundario_matricula
latitude                  →   latitude             →   latitude             →  latitude
longitude                 →   longitude            →   longitude            →  longitude
gpsAccuracy               →   gps_precisao         →   gps_precisao         →  gps_precisao
enderecoGPS               →   endereco_gps         →   endereco_gps         →  endereco_gps
observacoes               →   observacoes_gerais   →   observacoes_gerais   →  observacoes_gerais
(assinaturas)             →   (assinaturas)        →   (assinaturas)        →  (assinaturas)
                                                   →   auth_user_id         →  auth_user_id
                                                   →   status: 'ativo'      →  status ✗ ERRO!
                                                   →   sincronizado: true   →  sincronizado
```

---

## 7. RAIZ DO PROBLEMA

### Código Problemático (backend/src/routes/lvs.ts, linha 133)

```typescript
const novaLV = {
  ...lvDataClean,
  nome_lv: lvDataClean.nome_lv || titulo,
  auth_user_id: user?.id || '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'ativo',                    // ✗ PROBLEMA: 'ativo' não está na lista branca!
  sincronizado: true
};
```

### Error Esperado do Supabase

```json
{
  "code": "23514",
  "message": "new row for relation \"lvs\" violates check constraint \"lvs_status_check\"",
  "details": "Failing row contains (uuid, '01', 'Resíduos', ..., 'ativo', true, created_at, updated_at).",
  "hint": "status must be one of: 'concluido', 'rascunho', 'concluida'"
}
```

---

## 8. SOLUÇÃO

### Opção 1: Corrigir o Status no Backend (RECOMENDADO)

**Arquivo:** `backend/src/routes/lvs.ts`, linha 133

**De:**

```typescript
status: 'ativo',
```

**Para:**

```typescript
status: 'concluido',  // Valor padrão válido
```

**Ou aceitar o status do frontend:**

```typescript
const novaLV = {
  ...lvDataClean,
  nome_lv: lvDataClean.nome_lv || titulo,
  auth_user_id: user?.id || '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: lvDataClean.status || 'concluido',  // Usa frontend ou padrão
  sincronizado: true
};
```

### Opção 2: Atualizar o Constraint do DB

Adicionar `'ativo'` à lista de valores permitidos:

```sql
ALTER TABLE public.lvs
DROP CONSTRAINT lvs_status_check,
ADD CONSTRAINT lvs_status_check CHECK (
  status = ANY (ARRAY['concluido', 'rascunho', 'concluida', 'ativo'])
);
```

**Não recomendado** - Mantém inconsistência no código

### Opção 3: Adicionar Status ao Frontend

Se o frontend deve controlar o status, adicionar campo ao `LVCriacao`:

```typescript
export interface LVCriacao {
  // ... outros campos ...
  status?: 'concluido' | 'rascunho' | 'concluida';
}
```

---

## 9. CAMPOS QUE PODERIAM ESTAR FALTANDO

### Campos adicionados pelo backend automaticamente

- ✅ **auth_user_id**: Adicionado corretamente (user?.id)
- ✅ **created_at**: Gerado no backend
- ✅ **updated_at**: Gerado no backend
- ✅ **sincronizado**: Definido como true

### Campos não faltando

- ✅ **inspetor_secundario_matricula**: Está sendo enviado do frontend corretamente
- ✅ **usuario_matricula**: Está sendo enviado
- ✅ Todos os campos do formulário estão sendo enviados

---

## 10. FLUXO VISUAL COMPLETO

```bash
┌─────────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND - useLV.ts (salvarFormulario)                          │
│    Prepara objeto LVCriacao com todos os campos                    │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND - lvAPI.ts (criarLV)                                   │
│    Envia JSON via POST /api/lvs                                    │
│    - Adiciona Authorization header com token                       │
│    - Envia TODOS os campos sem filtro                              │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. BACKEND - lvs.ts (POST /)                                       │
│    Recebe req.body (lvData)                                        │
│    │                                                                │
│    ├─ Autenticação ✅                                               │
│    ├─ Validação obrigatórios ✅                                     │
│    │                                                                │
│    ├─ Remove: offline, titulo                                      │
│    ├─ Adiciona: auth_user_id, created_at, updated_at              │
│    ├─ Sobrescreve: status = 'ativo' ✗ AQUI É O ERRO!             │
│    ├─ Define: sincronizado = true                                 │
│    │                                                                │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. SUPABASE - Valida constraints                                   │
│    ├─ lvs_pkey (PRIMARY KEY) ✅                                      │
│    ├─ lvs_usuario_id_fkey (FOREIGN KEY) ✅                         │
│    ├─ lvs_status_check (CHECK) ✗ FALHA!                           │
│    │   ✗ status='ativo' ∉ ['concluido', 'rascunho', 'concluida'] │
│    │                                                                │
│    └─ Retorna erro: "violates check constraint"                   │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. BACKEND - Retorna erro 500 para frontend                        │
│    Error: "Erro ao criar LV"                                       │
│    Details: "violates check constraint lvs_status_check"           │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND - Exibe erro ao usuário                                │
│    "Erro ao criar LV: violates check constraint"                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. RESUMO EXECUTIVO

| Aspecto | Situação | Detalhes |
|---------|----------|----------|
| **Frontend** | ✅ OK | Envia todos os campos corretos, incluindo `inspetor_secundario_matricula` |
| **API Client** | ✅ OK | Faz POST correto sem filtrar campos |
| **Backend** | ✗ ERRO | Sobrescreve status com valor inválido `'ativo'` |
| **Database** | ✅ OK | Constraint está correto e funcionando |
| **Root Cause** | Linha 133 | `status: 'ativo'` deveria ser `status: 'concluido'` |
| **Solução** | 1 linha | Alterar backend/src/routes/lvs.ts linha 133 |

---

## 12. RECOMENDAÇÕES

1. **Imediato**: Alterar linha 133 do `backend/src/routes/lvs.ts` de `'ativo'` para `'concluido'`
2. **Curto Prazo**: Adicionar testes unitários para validar status em POST de LVs
3. **Médio Prazo**: Considerar aceitar status do frontend para mais flexibilidade
4. **Longo Prazo**: Documentar os valores válidos de status em um arquivo de constantes
