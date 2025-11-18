# 🔧 Correção: Sincronização de Rotinas Offline

**Data:** 30/08/2025  
**Problema:** Fotos de rotinas offline não eram sincronizadas corretamente  
**Status:** ✅ Resolvido

## 🔍 Problemas Identificados

### ❌ **Situação Inicial**

1. **URL Incorreta:** Frontend chamando `/api/fotos-rotina` (endpoint inexistente)
2. **Fotos não iam para bucket:** Upload para bucket `fotos-rotina` não acontecia
3. **Metadados não salvos:** Falha na inserção na tabela `fotos_rotina`
4. **Token incorreto:** Usando `authToken` em vez de `ecofield_auth_token`

### 📊 **Fluxo Incorreto Anterior**

```
Frontend → /api/fotos-rotina (❌ 404) → Falha total
```

## 🔧 **Soluções Implementadas**

### **1. Correção da URL e Fluxo de Fotos**

**Arquivo:** `frontend/src/lib/offline/sync/syncers/AtividadeRotinaSync.ts`

#### **✅ Novo Fluxo Correto:**

```typescript
// 1. Upload da foto para bucket fotos-rotina
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData // file + entityType: 'rotina' + entityId
});

// 2. Salvar metadados na tabela fotos_rotina
const response = await fetch(`/api/rotinas/${atividadeId}/fotos`, {
  method: 'POST',
  body: JSON.stringify({ fotos: [...] })
});
```

#### **🔄 Processo Completo:**

1. **Dados de texto** → `POST /api/rotinas` → Tabela `atividades_rotina`
2. **Fotos** → `POST /api/upload` → Bucket `fotos-rotina`
3. **Metadados** → `POST /api/rotinas/:id/fotos` → Tabela `fotos_rotina`

### **2. Correção do Token de Autenticação**

```typescript
// ❌ Antes
const token = localStorage.getItem('authToken');

// ✅ Depois
const token = localStorage.getItem('ecofield_auth_token');
```

### **3. Remoção do ID Offline**

```typescript
// ✅ REMOVER ID OFFLINE - O Supabase vai gerar um novo UUID
delete (dados as any).id;
```

### **4. Garantia do Campo auth_user_id**

```typescript
// ✅ Garantir que auth_user_id está presente
if (!(dados as any).auth_user_id) {
  console.warn(`⚠️ auth_user_id não encontrado, usando tma_responsavel_id`);
  (dados as any).auth_user_id = dados.tma_responsavel_id;
}
```

## 📊 **Resultado Final**

### **✅ Fluxo Correto Implementado:**

1. **Dados de Texto:**
   - ✅ Vão para tabela `atividades_rotina` do Supabase
   - ✅ Endpoint: `POST /api/rotinas`

2. **Fotos:**
   - ✅ Vão para bucket `fotos-rotina` do Supabase
   - ✅ Endpoint: `POST /api/upload` (entityType: 'rotina')

3. **Metadados das Fotos:**
   - ✅ Vão para tabela `fotos_rotina` do Supabase
   - ✅ Endpoint: `POST /api/rotinas/:id/fotos`

## 🎯 **Benefícios**

- ✅ **Sincronização completa** de rotinas offline
- ✅ **Fotos preservadas** no bucket correto
- ✅ **Metadados salvos** na tabela correta
- ✅ **Autenticação correta** com token adequado
- ✅ **Logs detalhados** para debug

## 🚀 **Como Testar**

1. Criar rotina offline com foto
2. Clicar em "Sincronizar (X)"
3. Verificar logs no console
4. Confirmar que dados aparecem no Supabase
5. Verificar que foto está no bucket `fotos-rotina`

## 📝 **Logs Esperados**

```bash
🔄 [ATIVIDADE ROTINA SYNC] Sincronizando atividade: offline_123
✅ [ATIVIDADE ROTINA SYNC] Dados enviados com sucesso para backend
📤 [ATIVIDADE ROTINA SYNC] Uploading foto foto.jpg para bucket fotos-rotina...
✅ [ATIVIDADE ROTINA SYNC] Foto foto.jpg enviada para bucket: https://...
✅ [ATIVIDADE ROTINA SYNC] Metadados da foto foto.jpg salvos na tabela fotos_rotina
✅ [ATIVIDADE ROTINA SYNC] Atividade offline_123 removida do IndexedDB
```
