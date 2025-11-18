# 🔍 VERIFICAÇÃO DE APIS EXISTENTES - 02/08/2025

## 📋 **OBJETIVO**: Verificar se as APIs necessárias já existem antes de criar

---

## ✅ **APIS JÁ EXISTENTES NO BACKEND**

### **1. ✅ `encarregados.ts` - EXISTE**

- **Localização**: `../backend/src/routes/encarregados.ts`
- **Endpoint**: `/api/encarregados`
- **Status**: ✅ **JÁ CONFIGURADO** no `index.ts`
- **Funcionalidades**:
  - GET `/encarregados-completos`
  - POST `/criar-encarregado`
  - PUT `/atualizar-encarregado/:id`
  - DELETE `/deletar-encarregado/:id`

### **2. ❌ `empresas.ts` - NÃO EXISTE**

- **Localização**: Não existe
- **Endpoint**: Não configurado
- **Status**: ❌ **PRECISA CRIAR**
- **Tabela**: `empresas_contratadas`

### **3. ❌ `categorias.ts` - NÃO EXISTE**

- **Localização**: Não existe
- **Endpoint**: Não configurado
- **Status**: ❌ **PRECISA CRIAR**
- **Tabela**: `categorias_lv`

---

## 🔍 **ANÁLISE DOS COMPONENTES FRONTEND**

### **AtividadesRotina.tsx**

- ✅ **Encarregados**: Já usa API backend (`/api/encarregados/encarregados-completos`)
- ❌ **Empresas**: Ainda usa Supabase diretamente
- ✅ **Cache**: Já implementado com `unifiedCache`

### **TermoFormV2.tsx**

- ❌ **Categorias**: Ainda usa Supabase diretamente
- ✅ **Outros**: Já migrado para APIs

---

## 🛠️ **APIS NECESSÁRIAS A CRIAR**

### **1. `empresasAPI.ts` (Frontend)**

- **Backend**: Criar `empresas.ts`
- **Frontend**: Criar `empresasAPI.ts`
- **Uso**: `AtividadesRotina.tsx`

### **2. `categoriasAPI.ts` (Frontend)**

- **Backend**: Criar `categorias.ts`
- **Frontend**: Criar `categoriasAPI.ts`
- **Uso**: `TermoFormV2.tsx`

---

## 📊 **STATUS ATUALIZADO**

### **APIs Backend**

- ✅ **Já existem**: 1 (`encarregados`)
- ❌ **Precisam criar**: 2 (`empresas`, `categorias`)

### **APIs Frontend**

- ❌ **Precisam criar**: 2 (`empresasAPI`, `categoriasAPI`)

### **Componentes**

- ✅ **AtividadesRotina.tsx**: 50% migrado (encarregados OK, empresas pendente)
- ⚠️ **TermoFormV2.tsx**: 90% migrado (categorias pendente)

---

## 🎯 **PRÓXIMOS PASSOS**

### **PRIORIDADE ALTA**

1. **Criar `empresas.ts` no backend**
2. **Criar `categorias.ts` no backend**
3. **Criar `empresasAPI.ts` no frontend**
4. **Criar `categoriasAPI.ts` no frontend**
5. **Migrar componentes para usar as novas APIs**

### **PRIORIDADE MÉDIA**

1. **Testar APIs criadas**
2. **Implementar cache unificado**
3. **Testar funcionalidade offline**

---

## ✅ **CONCLUSÃO**

**APIs necessárias**: 2 (empresas, categorias)
**Tempo estimado**: 1-2 horas
**Complexidade**: Baixa
**Risco**: Muito baixo

O módulo TMA está mais próximo da finalização do que inicialmente estimado!
