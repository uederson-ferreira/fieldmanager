# 🔄 EM ANDAMENTO - Correção da Edição de Termos

**Data:** 04/08/2025  
**Status:** 🔄 EM PROGRESSO - Aguardando Teste  
**Última Atualização:** 04/08/2025 - 23:45

## 🎯 Problema Identificado

**Usuário reportou:** "na edicao o termo foi duplicado ao salvar a edicao criou outro termo em vez de sobrecrever"

### **Causa Raiz:**

- O sistema sempre usava `termoManager.salvarTermo()` que chama `POST /api/termos` (criação)
- Não havia diferenciação entre modo de **criação** e **edição**
- Sempre criava um novo termo, mesmo na edição

## ✅ Correções Implementadas

### **1. Detecção de Modo de Edição**

**Arquivo:** `frontend/src/hooks/useTermoForm.ts`

```typescript
// ✅ VERIFICAR SE É MODO DE EDIÇÃO OU CRIAÇÃO
if (modoEdicao && termoParaEditar?.id) {
  console.log('✏️ [TERMO FORM] Modo de edição - atualizando termo:', termoParaEditar.id);
  
  // ✅ USAR API DE ATUALIZAÇÃO
  const result = await termosAPI.atualizarTermo(termoParaEditar.id, termoData);
  
  if (result.success) {
    console.log('✅ [TERMO FORM] Termo atualizado com sucesso');
    onSalvar?.();
  } else {
    console.error('❌ [TERMO FORM] Erro ao atualizar termo:', result.error);
  }
} else {
  console.log('🆕 [TERMO FORM] Modo de criação - salvando novo termo');
  
  // ✅ USAR API DE CRIAÇÃO
  const result = await termoManager.salvarTermo(termoData);
  
  if (result.success) {
    console.log('✅ [TERMO FORM] Termo salvo com sucesso');
    onSalvar?.();
  } else {
    console.error('❌ [TERMO FORM] Erro ao salvar termo:', result.error);
  }
}
```

### **2. Import do termosAPI**

**Arquivo:** `frontend/src/hooks/useTermoForm.ts`

```typescript
import { termosAPI } from '../lib/termosAPI';
```

### **3. Correção do Carregamento de Fotos**

**Problema anterior:** Fotos carregadas na edição tinham arquivos vazios
**Solução:** Download real das fotos do Supabase

```typescript
// ✅ BAIXAR foto real do Supabase
const fotoResponse = await fetch(foto.url_arquivo);
const fotoBlob = await fotoResponse.blob();
const arquivo = new File([fotoBlob], nomeArquivo, { type: tipoMime });
```

## 🎯 Como Testar Amanhã

### **Teste 1: Edição de Termo Existente**

1. **Acesse** a lista de termos
2. **Clique em "Editar"** em um termo existente
3. **Modifique** algum campo (ex: local da atividade)
4. **Clique em "Salvar"**
5. **Verifique:** O termo deve ser atualizado, não duplicado

### **Logs Esperados:**

```javascript
✏️ [TERMO FORM] Modo de edição - atualizando termo: aad2de2b-f21b-4736-b435-27e364f180f8
✅ [TERMO FORM] Termo atualizado com sucesso
```

### **Teste 2: Criação de Novo Termo**

1. **Acesse** a lista de termos
2. **Clique em "Novo Termo"**
3. **Preencha** os dados obrigatórios
4. **Clique em "Salvar"**
5. **Verifique:** Um novo termo deve ser criado

### *Logs Esperados:**

```javascript
🆕 [TERMO FORM] Modo de criação - salvando novo termo
✅ [TERMO FORM] Termo salvo com sucesso
```

### **Teste 3: Carregamento de Fotos na Edição**

1. **Edite** um termo que tenha fotos
2. **Verifique:** As fotos devem carregar corretamente
3. **Verifique:** Não deve dar erro "Tipo de arquivo não suportado"

### **Logs Esperados:*

```javascript
📥 [TERMO FORM] Baixando foto: https://.../termos/.../foto.jpg
✅ [TERMO FORM] Foto baixada com sucesso: {nome: 'foto.jpg', tamanho: 287, tipo: 'image/jpeg'}
```

## 🔍 Pontos de Atenção

### **1. Verificar Backend**

- Confirmar se a rota `PUT /api/termos/{id}` está funcionando
- Verificar se o backend aceita todos os campos enviados

### **2. Verificar Fotos**

- Se o download de fotos falhar, há fallback para arquivo placeholder
- Verificar se as URLs das fotos estão acessíveis

### **3. Verificar Logs**

- Monitorar logs do console para identificar problemas
- Verificar se as APIs estão sendo chamadas corretamente

## 🚨 Possíveis Problemas

### **1. Erro de API**

- Se `termosAPI.atualizarTermo()` falhar
- Verificar se o token está válido
- Verificar se o ID do termo existe

### **2. Erro de Fotos**

- Se o download de fotos falhar
- Verificar se as URLs estão corretas
- Verificar se o Supabase está acessível

### **3. Erro de Validação**

- Se os dados enviados não passarem na validação
- Verificar se todos os campos obrigatórios estão preenchidos

## 📋 Checklist para Amanhã

- [ ] **Testar edição de termo** - Verificar se não duplica
- [ ] **Testar criação de termo** - Verificar se funciona normalmente
- [ ] **Testar carregamento de fotos** - Verificar se carregam corretamente
- [ ] **Verificar logs** - Confirmar que as APIs corretas são chamadas
- [ ] **Testar cenários de erro** - Verificar tratamento de erros

## 🔧 Arquivos Modificados

1. **`frontend/src/hooks/useTermoForm.ts`**
   - Adicionado import do `termosAPI`
   - Implementada lógica de detecção de modo edição/criação
   - Corrigido carregamento de fotos na edição

2. **`frontend/src/lib/termosAPI.ts`**
   - Método `atualizarTermo()` já existia e está funcionando

## 🎯 Próximos Passos

1. **Testar** as correções implementadas
2. **Documentar** qualquer problema encontrado
3. **Implementar** melhorias se necessário
4. **Finalizar** a funcionalidade de edição

---

**Responsável:** Assistente AI  
**Data de Criação:** 04/08/2025  
**Status:** 🔄 Aguardando Teste do Usuário
