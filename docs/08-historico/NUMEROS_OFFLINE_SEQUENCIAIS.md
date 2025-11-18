# 🔢 Sistema de Números Offline Sequenciais - EcoField

**Data:** 05/08/2025  
**Status:** ✅ Implementado e Funcionando  
**Última Atualização:** 05/08/2025

## 🎯 Visão Geral

O sistema agora gera e exibe números sequenciais offline no formato `2025-OFF-NT-001` diretamente no formulário, permitindo que o usuário veja o número do termo mesmo quando está offline.

## 📱 Funcionalidades Implementadas

### **1. Geração Automática de Números Offline**

- ✅ **Detecção automática** de status online/offline
- ✅ **Sequência sequencial** por tipo de termo e ano
- ✅ **Formato padronizado:** `ANO-OFF-PREFIXO-XXX`
- ✅ **Persistência local** no IndexedDB

### **2. Exibição no Formulário**

- ✅ **Campo sempre preenchido** (não mais "Gerando...")
- ✅ **Atualização automática** quando conexão é restaurada
- ✅ **Formato visual consistente** com números online

## 🔄 Fluxo de Funcionamento

### **A) Quando Está Offline:**

```typescript
// 1. DETECÇÃO AUTOMÁTICA
if (!navigator.onLine) {
  console.log('📱 [TERMO FORM] Modo offline detectado, gerando número offline...');
  
  // 2. GERAÇÃO DO NÚMERO OFFLINE
  const numeroOffline = await termoManager.gerarNumeroOffline(tipo);
  // Resultado: "2025-OFF-NT-001"
  
  // 3. EXIBIÇÃO NO FORMULÁRIO
  setNumeroTermo(numeroOffline);
}
```

### **B) Formato dos Números Offline:**

| **Tipo de Termo** | **Formato** | **Exemplo** |
|-------------------|-------------|-------------|
| **Notificação** | `ANO-OFF-NT-XXX` | `2025-OFF-NT-001` |
| **Paralização Técnica** | `ANO-OFF-PT-XXX` | `2025-OFF-PT-001` |
| **Recomendação** | `ANO-OFF-RC-XXX` | `2025-OFF-RC-001` |

### **C) Sequência Sequencial:**

```typescript
// ✅ BUSCAR TERMOS OFFLINE EXISTENTES
const termosOffline = await db.termos_ambientais
  .where('tipo_termo')
  .equals(tipoTermo)
  .and(termo => termo.numero_termo?.includes(`${ano}-OFF-`))
  .toArray();

// ✅ EXTRAIR NÚMEROS SEQUENCIAIS
const numerosExistentes = termosOffline
  .map(termo => {
    const match = termo.numero_termo?.match(/-OFF-[A-Z]+-(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  })
  .filter(num => !isNaN(num));

// ✅ CALCULAR PRÓXIMO NÚMERO
const maiorNumero = numerosExistentes.length > 0 ? Math.max(...numerosExistentes) : 0;
const proximoNumero = maiorNumero + 1;
```

## 🛠️ Arquivos Modificados

### **1. `TermoSaver.ts`**

- ✅ **`gerarNumeroOffline()`** - Gera números sequenciais offline
- ✅ **`obterProximoNumeroOffline()`** - Calcula próximo número da sequência

### **2. `TermoManager.ts`**

- ✅ **`gerarNumeroOffline()`** - Interface para o formulário
- ✅ **Integração com IndexedDB** para persistência

### **3. `useTermoForm.ts`**

- ✅ **Detecção automática** de status offline
- ✅ **Geração automática** de números offline
- ✅ **Listeners** para mudanças de conexão

### **4. `TermoFormFields.tsx`**

- ✅ **`formatarNumeroTermo()`** - Suporte a números offline
- ✅ **Exibição consistente** no formulário

## 📊 Exemplos de Uso

### **Cenário 1: Primeiro Termo Offline**

```typescript
// Usuário cria termo offline do tipo NOTIFICACAO
// Sistema gera: "2025-OFF-NT-001"
// Formulário exibe: "2025-OFF-NT-001"
```

### **Cenário 2: Múltiplos Termos Offline**

```typescript
// Termo 1: "2025-OFF-NT-001" ✅
// Termo 2: "2025-OFF-NT-002" ✅
// Termo 3: "2025-OFF-NT-003" ✅
// Próximo: "2025-OFF-NT-004" ✅
```

### **Cenário 3: Diferentes Tipos**

```typescript
// Notificação: "2025-OFF-NT-001" ✅
// Paralização: "2025-OFF-PT-001" ✅
// Recomendação: "2025-OFF-RC-001" ✅
```

## 🔍 Como Testar

### **1. Teste Offline Simples:**

```typescript
// No console do navegador
const termoManager = new TermoManager();
const numero = await termoManager.gerarNumeroOffline('NOTIFICACAO');
console.log(numero); // "2025-OFF-NT-001"
```

### **2. Teste de Sequência:**

```typescript
// Gerar múltiplos números
const numeros = [];
for (let i = 0; i < 5; i++) {
  const numero = await termoManager.gerarNumeroOffline('NOTIFICACAO');
  numeros.push(numero);
}
console.log(numeros); // ["2025-OFF-NT-001", "2025-OFF-NT-002", ...]
```

### **3. Teste de Diferentes Tipos:**

```typescript
const tipos = ['NOTIFICACAO', 'PARALIZACAO_TECNICA', 'RECOMENDACAO'];
for (const tipo of tipos) {
  const numero = await termoManager.gerarNumeroOffline(tipo);
  console.log(`${tipo}: ${numero}`);
}
```

## 🚀 Benefícios da Implementação

### **1. Experiência do Usuário**

- ✅ **Sempre sabe o número** do termo que está criando
- ✅ **Formato consistente** com números online
- ✅ **Sequência lógica** e previsível

### **2. Funcionalidade Técnica**

- ✅ **Persistência local** no IndexedDB
- ✅ **Sincronização automática** quando online
- ✅ **Fallback robusto** em caso de erros

### **3. Manutenibilidade**

- ✅ **Código limpo** e bem documentado
- ✅ **Tratamento de erros** abrangente
- ✅ **Logs detalhados** para debug

## 🔮 Próximos Passos

### **1. Melhorias Futuras**

- [ ] **Cache de números** para melhor performance
- [ ] **Validação de unicidade** mais robusta
- [ ] **Interface de administração** para números offline

### **2. Testes Adicionais**

- [ ] **Testes unitários** para todas as funções
- [ ] **Testes de integração** com IndexedDB
- [ ] **Testes de performance** com muitos termos

### **3. Documentação**

- [ ] **Guia do usuário** para funcionalidade offline
- [ ] **Vídeos tutoriais** de uso
- [ ] **FAQ** sobre números offline

---

**Status:** ✅ **IMPLEMENTAÇÃO COMPLETA E FUNCIONANDO**  
**Próxima Revisão:** 12/08/2025
