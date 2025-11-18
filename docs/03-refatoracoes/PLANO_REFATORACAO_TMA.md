# 🏗️ PLANO DE REFATORAÇÃO - MÓDULO TMA (TÉCNICO)

## 📋 **VISÃO GERAL**

### 🎯 **Objetivo**

Migrar todos os componentes TMA do Supabase direto para APIs do backend, seguindo o padrão estabelecido na refatoração anterior.

### 📊 **Status Atual**

- **Componentes**: 6 componentes TMA
- **Dependências Supabase**: 4 componentes usam Supabase direto
- **APIs Backend**: 8 rotas disponíveis
- **APIs Faltantes**: 2 APIs precisam ser criadas

---

## 🗂️ **ANÁLISE MÓDULO A MÓDULO**

### ✅ **1. AtividadesRotina.tsx**

**Status**: ⚠️ **PARCIALMENTE MIGRADO**

- ✅ Usa `unifiedCache` (já migrado)
- ✅ Usa `rotinasHelpers` (nova API)
- ❌ Ainda usa `supabase` para algumas operações
- **APIs Necessárias**: `rotinasAPI` (já existe), `encarregadosAPI` (criar)
- **Dependências**: `supabase`, `unifiedCache`, `rotinasHelpers`

**Ações Necessárias**:

1. Criar `encarregadosAPI.ts` no backend
2. Migrar operações restantes para APIs
3. Manter cache unificado
4. Testar funcionalidade offline

### ✅ **2. TermoFormV2.tsx**

**Status**: ⚠️ **PARCIALMENTE MIGRADO**

- ✅ Usa `TermoManager` (já migrado)
- ✅ Usa `TermoPhotoProcessor` (já migrado)
- ❌ Ainda usa `supabase` para algumas consultas
- **APIs Necessárias**: `termosAPI` (já existe), `categoriasAPI` (criar)
- **Dependências**: `supabase`, `TermoManager`, `TermoPhotoProcessor`

**Ações Necessárias**:

1. Criar `categoriasAPI.ts` no backend
2. Migrar consultas restantes para APIs
3. Implementar cache unificado
4. Testar funcionalidade completa

### ✅ **3. ListaTermos.tsx**

**Status**: ✅ **MIGRADO**

- ✅ Usa `termosAPI` (já existe)
- ✅ Não usa `supabase` diretamente
- **APIs Necessárias**: `termosAPI` (já existe)
- **Dependências**: `termosAPI`

**Ações Necessárias**:

1. ✅ Já migrado
2. Testar funcionalidade
3. Verificar performance

### ✅ **4. ModalDetalhesTermo.tsx**

**Status**: ✅ **MIGRADO**

- ✅ Usa `termosAPI` (já existe)
- ✅ Não usa `supabase` diretamente
- **APIs Necessárias**: `termosAPI` (já existe)
- **Dependências**: `termosAPI`

**Ações Necessárias**:

1. ✅ Já migrado
2. Testar funcionalidade
3. Verificar performance

### ✅ **5. ModalVisualizarLV.tsx**

**Status**: ✅ **MIGRADO**

- ✅ Usa `lvsAPI` (já existe)
- ✅ Não usa `supabase` diretamente
- **APIs Necessárias**: `lvsAPI` (já existe)
- **Dependências**: `lvsAPI`

**Ações Necessárias**:

1. ✅ Já migrado
2. Testar funcionalidade
3. Verificar performance

### ✅ **6. AssinaturaDigital.tsx**

**Status**: ✅ **MIGRADO**

- ✅ Componente de UI puro
- ✅ Não usa `supabase` diretamente
- **APIs Necessárias**: Nenhuma
- **Dependências**: Nenhuma

**Ações Necessárias**:

1. ✅ Já migrado
2. Testar funcionalidade
3. Verificar performance

---

## 🛠️ **APIS NECESSÁRIAS NO BACKEND**

### ✅ **APIs Já Existentes**

1. `termosAPI` - ✅ Funcionando
2. `lvsAPI` - ✅ Funcionando
3. `rotinasAPI` - ✅ Funcionando
4. `estatisticasAPI` - ✅ Funcionando
5. `uploadAPI` - ✅ Funcionando

### ❌ **APIs a Criar**

1. `encarregadosAPI` - Para AtividadesRotina.tsx
2. `categoriasAPI` - Para TermoFormV2.tsx

---

## 📊 **ESTATÍSTICAS DE MIGRAÇÃO**

### 🎯 **Status Geral**

- **Total de Componentes**: 6
- **✅ Já Migrados**: 4 (67%)
- **⚠️ Parcialmente Migrados**: 2 (33%)
- **❌ Não Migrados**: 0 (0%)

### 📈 **Progresso**

- **APIs Backend**: 5/7 (71%)
- **Componentes Migrados**: 4/6 (67%)
- **Cache Unificado**: 2/6 (33%)

---

## 🚀 **PLANO DE EXECUÇÃO**

### **FASE 1: APIs Faltantes (Prioridade Alta)**

1. **Criar `encarregadosAPI.ts`**
   - Endpoints: GET, POST, PUT, DELETE
   - Cache: Implementar cache unificado
   - Offline: Suporte completo

2. **Criar `categoriasAPI.ts`**
   - Endpoints: GET, POST, PUT, DELETE
   - Cache: Implementar cache unificado
   - Offline: Suporte completo

### **FASE 2: Completar Migrações Parciais (Prioridade Média)**

1. **AtividadesRotina.tsx**
   - Migrar operações CRUD restantes
   - Implementar cache unificado
   - Testar funcionalidade offline

2. **TermoFormV2.tsx**
   - Migrar consultas restantes para APIs
   - Implementar cache unificado
   - Testar funcionalidade completa

### **FASE 3: Testes e Otimizações (Prioridade Baixa)**

1. **Testes de Funcionalidade**
   - Testar todos os componentes migrados
   - Verificar performance
   - Testar funcionalidade offline

2. **Otimizações**
   - Otimizar cache
   - Melhorar performance
   - Reduzir bundle size

---

## 📋 **CHECKLIST DE MIGRAÇÃO**

### **APIs Backend**

- [ ] Criar `encarregadosAPI.ts`
- [ ] Criar `categoriasAPI.ts`
- [ ] Testar todas as APIs existentes

### **Componentes Frontend**

- [ ] Completar `AtividadesRotina.tsx`
- [ ] Completar `TermoFormV2.tsx`
- [ ] Testar componentes já migrados

### **Cache e Offline**

- [ ] Implementar cache unificado em todos os componentes
- [ ] Testar funcionalidade offline
- [ ] Otimizar performance

### **Testes**

- [ ] Testar todos os componentes migrados
- [ ] Verificar funcionalidade offline
- [ ] Testar performance

---

## 🎯 **BENEFÍCIOS ESPERADOS**

### **Performance**

- ✅ Cache unificado em todos os componentes
- ✅ Redução de requisições ao Supabase
- ✅ Melhor performance offline

### **Manutenibilidade**

- ✅ Código mais limpo e organizado
- ✅ Separação clara de responsabilidades
- ✅ Facilidade de manutenção

### **Funcionalidade**

- ✅ Suporte offline completo
- ✅ Melhor tratamento de erros
- ✅ Funcionalidades mais robustas

---

## 📝 **NOTAS IMPORTANTES**

### **Schema do Banco**

```sql
-- Tabelas principais usadas pelos componentes TMA
CREATE TABLE public.encarregados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  apelido text,
  telefone text,
  empresa_contratada_id uuid,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT encarregados_pkey PRIMARY KEY (id),
  CONSTRAINT encarregados_empresa_contratada_id_fkey FOREIGN KEY (empresa_contratada_id) REFERENCES public.empresas_contratadas(id)
);

CREATE TABLE public.categorias_lv (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text,
  ativa boolean DEFAULT true,
  ordem integer,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categorias_lv_pkey PRIMARY KEY (id)
);

-- Outras tabelas relevantes já documentadas no schema completo
```

### **Padrões a Seguir**

1. **Cache Unificado**: Usar `unifiedCache` em todos os componentes
2. **APIs Backend**: Criar APIs específicas para cada entidade
3. **Offline First**: Implementar suporte offline completo
4. **TypeScript**: Manter tipos corretos e sem erros
5. **Performance**: Otimizar carregamentos e cache

---

## 🎉 **CONCLUSÃO**

O módulo TMA está **67% migrado** e precisa de **2 APIs** e **2 componentes** para ser completamente refatorado. A migração trará benefícios significativos em performance, manutenibilidade e funcionalidade offline.
