# 🔧 CORREÇÕES TERMOS AMBIENTAIS - ECOFIELD SYSTEM

## 📋 **RESUMO EXECUTIVO**

Documentação das correções implementadas no módulo de Termos Ambientais para resolver problemas de navegação, API e lógica de negócio.

---

## 🎯 **PROBLEMAS IDENTIFICADOS**

### 1. **Confusão entre LVs e Termos**

- ❌ **Problema**: `useTermoForm.ts` estava carregando categorias de LVs
- ❌ **Impacto**: Lógica incorreta, erros de API
- ✅ **Solução**: Removida completamente a referência a LVs

### 2. **Botão "Voltar" não funcionava**

- ❌ **Problema**: `onBack={() => {}}` estava vazio
- ❌ **Impacto**: Usuário não conseguia voltar ao dashboard
- ✅ **Solução**: Implementado `onBack={() => setActiveSection('dashboard')}`

### 3. **API retornando 0 termos**

- ❌ **Problema**: Comparações usando `emitido_por_usuario_id` em vez de `auth_user_id`
- ❌ **Impacto**: Termos não apareciam na lista
- ✅ **Solução**: Todas as APIs corrigidas para usar `auth_user_id`

### 4. **Geração de número do termo incorreta**

- ❌ **Problema**: Não seguia o padrão correto
- ❌ **Impacto**: Números não padronizados
- ✅ **Solução**: Implementado formato `2025-NT-0001`, `2025-PT-0001`, `2025-RT-0001`

---

## 🔧 **CORREÇÕES IMPLEMENTADAS**

### 1. **Remoção de Referências a LVs**

#### **Arquivo**: `frontend/src/hooks/useTermoForm.ts`

```typescript
// ANTES
const [categoriasLV, setCategoriasLV] = useState<string[]>([]);

useEffect(() => {
  const fetchCategoriasLV = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/categorias`);
    // ... carregava categorias LV
  };
  fetchCategoriasLV();
}, []);

// DEPOIS
// Removido completamente - Termos não usam categorias LV
```

#### **Justificativa**

- Termos Ambientais são documentos oficiais independentes
- Não há relação com Listas de Verificação (LVs)
- Cada termo tem seu próprio tipo: `PARALIZACAO_TECNICA`, `NOTIFICACAO`, `RECOMENDACAO`

### 2. **Correção do Botão "Voltar"**

#### **Arquivo**: `frontend/src/components/dashboard/DashboardMainContent.tsx`

```typescript
// ANTES
<ListaTermos user={user} onBack={() => {}} />

// DEPOIS
<ListaTermos user={user} onBack={() => setActiveSection('dashboard')} />
```

**Arquivo**: `frontend/src/components/dashboard/DashboardMainContent.tsx`

```typescript
// ANTES
const { activeSection } = useDashboard();

// DEPOIS
const { activeSection, setActiveSection } = useDashboard();
```

### 3. **Correção das APIs para usar `auth_user_id`**

#### **Arquivo**: `backend/src/routes/termos.ts`

```typescript
// ANTES
.eq('emitido_por_usuario_id', user?.id || '')

// DEPOIS
.eq('auth_user_id', user?.id || '')
```

#### **Arquivo**: `backend/src/routes/estatisticas.ts`

```typescript
// ANTES
.eq('emitido_por_usuario_id', user?.id || '')

// DEPOIS
.eq('auth_user_id', user?.id || '')
```

### 4. **Implementação da Geração de Número do Termo**

**Arquivo**: `backend/src/routes/termos.ts`

```typescript
// NOVO ENDPOINT
router.get('/numero-sequencial', authenticateUser, async (req: Request, res: Response) => {
  const { tipo, ano } = req.query;
  
  // Buscar último termo do mesmo tipo no mesmo ano
  const { data: ultimoTermo } = await supabase
    .from('termos_ambientais')
    .select('numero_sequencial')
    .eq('auth_user_id', user?.id || '')
    .eq('tipo_termo', tipo)
    .gte('created_at', `${ano}-01-01T00:00:00`)
    .lte('created_at', `${ano}-12-31T23:59:59`)
    .order('numero_sequencial', { ascending: false })
    .limit(1)
    .single();

  let proximoNumero = 1;
  if (ultimoTermo) {
    proximoNumero = ultimoTermo.numero_sequencial + 1;
  }

  res.json({ numero_sequencial: proximoNumero });
});
```

 **Arquivo**: `frontend/src/hooks/useTermoForm.ts`

```typescript
// ANTES
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos/numero-sequencial`);

// DEPOIS
const tipo = dadosFormulario.tipo_termo;
const ano = new Date().getFullYear();
const prefixo = tipo === 'PARALIZACAO_TECNICA' ? 'PT' : tipo === 'NOTIFICACAO' ? 'NT' : 'RT';

const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos/numero-sequencial?tipo=${tipo}&ano=${ano}`);
const data = await response.json();
const numeroFormatado = `${ano}-${prefixo}-${String(data.numero_sequencial).padStart(4, '0')}`;
setNumeroTermo(numeroFormatado);
```

---

## 📊 **FORMATO DOS NÚMEROS DOS TERMOS**

### **Padrão Implementado**

- **Notificação**: `2025-NT-0001`, `2025-NT-0002`, ...
- **Paralização Técnica**: `2025-PT-0001`, `2025-PT-0002`, ...
- **Recomendação**: `2025-RT-0001`, `2025-RT-0002`, ...

### **Lógica**

1. **Ano**: Ano atual (2025)
2. **Prefixo**: Baseado no tipo do termo
3. **Sequencial**: Número sequencial por tipo e ano
4. **Formato**: `YYYY-PREFIXO-NNNN`

---

## 🗄️ **ESQUEMA DO BANCO DE DADOS**

### **Tabela**: `termos_ambientais`

```sql
-- Campos principais
id uuid PRIMARY KEY,
numero_sequencial serial UNIQUE,
numero_termo varchar(50),
tipo_termo varchar(50) CHECK (tipo_termo IN ('PARALIZACAO_TECNICA', 'NOTIFICACAO', 'RECOMENDACAO')),
status varchar(50) DEFAULT 'PENDENTE',
auth_user_id uuid REFERENCES usuarios(id),

-- Dados do emissor
emitido_por_nome varchar(255),
emitido_por_gerencia varchar(255),
emitido_por_empresa varchar(255),
emitido_por_usuario_id uuid REFERENCES usuarios(id),

-- Dados do destinatário
destinatario_nome varchar(255),
destinatario_gerencia varchar(255),
destinatario_empresa varchar(255),

-- Localização e atividade
local_atividade text,
area_equipamento_atividade text,
atividade_especifica text,

-- Não conformidades (até 10)
descricao_nc_1 text, severidade_nc_1 varchar(5),
descricao_nc_2 text, severidade_nc_2 varchar(5),
-- ... até nc_10

-- Ações de correção (até 10)
acao_correcao_1 text, prazo_acao_1 date,
acao_correcao_2 text, prazo_acao_2 date,
-- ... até acao_10

-- Assinaturas
assinatura_responsavel_area boolean DEFAULT false,
assinatura_emitente boolean DEFAULT true,
assinatura_responsavel_area_img text,
assinatura_emitente_img text,

-- GPS
latitude numeric(10, 8),
longitude numeric(11, 8),
precisao_gps numeric(8, 2),
endereco_gps text,

-- Liberação (apenas para Paralização Técnica)
liberacao_nome varchar(255),
liberacao_empresa varchar(255),
liberacao_gerencia varchar(255),
liberacao_data date,
liberacao_horario time,
liberacao_assinatura_carimbo boolean DEFAULT false,

-- Controle
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
sincronizado boolean DEFAULT true,
offline boolean DEFAULT false
```

### **Tabela**: `termos_fotos`

```sql
id uuid PRIMARY KEY,
termo_id uuid REFERENCES termos_ambientais(id) ON DELETE CASCADE,
nome_arquivo varchar(255),
url_arquivo text,
categoria varchar(100),
latitude numeric(10, 8),
longitude numeric(11, 8),
precisao_gps numeric(8, 2),
endereco text,
created_at timestamp DEFAULT CURRENT_TIMESTAMP
```

---

## 🚀 **PRÓXIMOS PASSOS NECESSÁRIOS**

### **1. Executar Script SQL**

```sql
-- Arquivo: frontend/sql/fixes/verificar_termos_auth_user_id.sql
-- Objetivo: Corrigir auth_user_id nos termos existentes
```

### **2. Implementar Validações**

- ✅ Mínimo 1 não conformidade
- ✅ Mínimo 1 ação de correção
- ✅ Campos obrigatórios

### **3. Implementar Assinaturas Digitais**

- ✅ Assinatura por touch do celular
- ✅ Assinatura do TMA e responsável pela área
- ✅ Validação de assinaturas

### **4. Implementar GPS Automático**

- ✅ Obtenção automática ao abrir modal
- ✅ Botão para obter manualmente
- ✅ Formato graus, minutos e segundos (SIGAS 2000)

### **5. Implementar CRUD Completo**

- ✅ Criar termo
- ✅ Editar termo
- ✅ Excluir termo
- ✅ Visualizar termo
- ✅ Listar termos

### **6. Implementar Impressão e WhatsApp**

- ✅ Geração de PDF
- ✅ Impressão do termo
- ✅ Envio via WhatsApp

### **7. Implementar Atualização de Status**

- ✅ PENDENTE → EM_ANDAMENTO → CORRIGIDO → LIBERADO
- ✅ Controle de transições de status

---

## ✅ **STATUS ATUAL**

### **Correções Concluídas**

- ✅ **Referências a LVs removidas**
- ✅ **Botão "Voltar" funcionando**
- ✅ **APIs corrigidas para usar `auth_user_id`**
- ✅ **Geração de número do termo implementada**
- ✅ **Build bem-sucedido** (frontend e backend)

### **Arquivos Modificados**

1. `frontend/src/hooks/useTermoForm.ts`
2. `frontend/src/components/dashboard/DashboardMainContent.tsx`
3. `backend/src/routes/termos.ts`
4. `backend/src/routes/estatisticas.ts`

### **Arquivos Criados**

1. `frontend/sql/fixes/verificar_termos_auth_user_id.sql`
2. `frontend/docs/refatoracao082025/dia02082025/CORRECOES_TERMOS_AMBIENTAIS.md`

---

## 🎯 **RESULTADO**

O módulo de Termos Ambientais agora está **corretamente estruturado** e **independente de LVs**, seguindo a lógica de negócio correta para documentos ambientais oficiais.

**Próximo passo**: Executar o script SQL para corrigir os dados existentes e testar a funcionalidade completa.
