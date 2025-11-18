# Diagnóstico: Modal de Detalhes de Termo

**Data:** 07/11/2025
**Relatado:** "Não tenho no sistema uma tela de modal do termo, tinha antes da refatoração"

---

## ✅ **RESULTADO: MODAL EXISTE E ESTÁ ATIVO NO CÓDIGO**

O modal `ModalDetalhesTermo` **NÃO é legado** e **ESTÁ implementado e ativo**.

---

## 🔍 **Fluxo de Execução**

### **1. Usuário Clica em "Visualizar" (👁️ ícone)**

**Localização:** `ListaTermosCards.tsx:144` ou `ListaTermosTable.tsx:185`

```tsx
// ListaTermosCards.tsx:144
<button onClick={() => visualizarTermo(t.id!)}>
  <Eye className="h-4 w-4" />
</button>

// ListaTermosTable.tsx:185
<button onClick={() => visualizarTermo(t.id!)}>
  <Eye className="h-4 w-4" />
</button>
```

---

### **2. Hook `useListaTermos` Processa**

**Localização:** `useListaTermos.ts:309`

```tsx
const visualizarTermo = useCallback(async (id: string) => {
  try {
    console.log('🔍 [TERMOS] Visualizando termo:', id);

    // Buscar termo completo
    const termo = await termosAPI.buscarPorId(id);

    if (termo) {
      setTermoSelecionado(termo);
      setMostrarDetalhes(true);  // ← ABRE O MODAL
    }
  } catch (error) {
    console.error('❌ Erro ao visualizar termo:', error);
  }
}, []);
```

---

### **3. Modal é Renderizado**

**Localização:** `ListaTermosContainer.tsx:365-376`

```tsx
{mostrarDetalhes && termoSelecionado && (
  <ModalDetalhesTermo
    termo={termoSelecionado}
    fotos={termoSelecionado.fotos || []}
    assinaturas={assinaturasSelecionadas}
    aberto={mostrarDetalhes}
    onClose={() => {
      setMostrarDetalhes(false);
      setTermoSelecionado(null);
    }}
  />
)}
```

---

## 🐛 **Possíveis Causas do Problema**

Se o modal não está aparecendo, pode ser:

### **1. Variável `mostrarDetalhes` não está sendo setada**

```bash
# Verificar no console do navegador:
console.log('mostrarDetalhes:', mostrarDetalhes);
console.log('termoSelecionado:', termoSelecionado);
```

### **2. Erro na API `termosAPI.buscarPorId()`**

```tsx
// useListaTermos.ts:309
const termo = await termosAPI.buscarPorId(id);  // ← Pode estar falhando
```

**Verificar:**

- Backend retorna o termo?
- Token de autenticação está válido?
- Termo existe no banco?

### **3. Modal está renderizando mas invisível (CSS)**

```tsx
// ModalDetalhesTermo.tsx - verificar prop 'aberto'
<Modal aberto={aberto} onClose={onClose}>
```

**Verificar:**

- Prop `aberto` está chegando como `true`?
- CSS do modal está correto?
- Z-index está adequado?

### **4. JavaScript desabilitado ou erro bloqueando**

- Verificar Console do navegador (F12)
- Procurar erros em vermelho
- Verificar se clique está funcionando

---

## 🧪 **Como Testar**

### **Teste 1: Console Logs**

Adicionar logs temporários em `useListaTermos.ts:309`:

```tsx
const visualizarTermo = useCallback(async (id: string) => {
  console.log('🔍 [DEBUG] visualizarTermo chamado:', id);

  try {
    console.log('📡 [DEBUG] Buscando termo na API...');
    const termo = await termosAPI.buscarPorId(id);
    console.log('✅ [DEBUG] Termo encontrado:', termo);

    if (termo) {
      console.log('📝 [DEBUG] Setando termoSelecionado...');
      setTermoSelecionado(termo);

      console.log('🚪 [DEBUG] Abrindo modal (setMostrarDetalhes(true))...');
      setMostrarDetalhes(true);

      console.log('✅ [DEBUG] Modal deveria estar aberto agora!');
    } else {
      console.warn('⚠️ [DEBUG] Termo veio vazio/null');
    }
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao visualizar termo:', error);
  }
}, []);
```

---

### **Teste 2: Verificar Estado no React DevTools**

1. Abrir React DevTools (F12 → React tab)
2. Encontrar componente `ListaTermosContainer`
3. Verificar states:
   - `mostrarDetalhes`: deve ser `true` quando clicar
   - `termoSelecionado`: deve conter o termo completo

---

### **Teste 3: Verificar API**

Testar endpoint diretamente:

```bash
# No terminal ou Postman
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3001/api/termos/SEU_TERMO_ID
```

Deve retornar JSON com o termo completo.

---

### **Teste 4: Forçar Modal Aberto**

Temporariamente forçar estado no `ListaTermosContainer.tsx:365`:

```tsx
{/* TESTE: Forçar modal sempre aberto */}
{(true || mostrarDetalhes) && termoSelecionado && (
  <ModalDetalhesTermo
    termo={termoSelecionado}
    // ...
  />
)}
```

Se modal aparecer, problema está na lógica de `setMostrarDetalhes`.

---

## 🔧 **Correções Rápidas**

### **Correção 1: Garantir que API retorna dados**

Verificar backend `/backend/src/routes/termos.ts`:

```tsx
router.get('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;

  console.log('📡 [TERMOS API] Buscando termo:', id);

  const { data, error } = await supabase
    .from('termos_ambientais')
    .select('*, fotos(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ [TERMOS API] Erro:', error);
    return res.status(404).json({ error: 'Termo não encontrado' });
  }

  console.log('✅ [TERMOS API] Termo encontrado:', data);
  res.json(data);
});
```

---

### **Correção 2: Adicionar Fallback de Cache**

Em `useListaTermos.ts`, adicionar cache local:

```tsx
const visualizarTermo = useCallback(async (id: string) => {
  try {
    // Primeiro tentar buscar da lista local (cache)
    const termoCache = termos.find(t => t.id === id);

    if (termoCache) {
      console.log('✅ [TERMOS] Usando termo do cache local');
      setTermoSelecionado(termoCache);
      setMostrarDetalhes(true);
      return;
    }

    // Se não estiver no cache, buscar da API
    const termo = await termosAPI.buscarPorId(id);

    if (termo) {
      setTermoSelecionado(termo);
      setMostrarDetalhes(true);
    }
  } catch (error) {
    console.error('❌ Erro ao visualizar termo:', error);
  }
}, [termos]);
```

---

### **Correção 3: Verificar Botão de Visualizar**

Garantir que botão está ativo em `ListaTermosCards.tsx:144`:

```tsx
<button
  onClick={(e) => {
    e.stopPropagation();  // Prevenir propagação
    console.log('🖱️ [DEBUG] Botão visualizar clicado! ID:', t.id);
    visualizarTermo(t.id!);
  }}
  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
  title="Visualizar detalhes"
>
  <Eye className="h-4 w-4" />
</button>
```

---

## 📊 **Checklist de Diagnóstico**

Execute em ordem:

- [ ] **1.** Abrir console do navegador (F12)
- [ ] **2.** Clicar no botão de visualizar (👁️)
- [ ] **3.** Verificar se aparece log: `"🔍 [TERMOS] Visualizando termo"`
- [ ] **4.** Verificar se há erros em vermelho no console
- [ ] **5.** Verificar no React DevTools:
  - [ ] `mostrarDetalhes` mudou para `true`?
  - [ ] `termoSelecionado` está preenchido?
- [ ] **6.** Verificar Network tab (F12 → Network):
  - [ ] Request para `/api/termos/:id` foi feito?
  - [ ] Status code é 200?
  - [ ] Response contém dados do termo?
- [ ] **7.** Verificar se modal está renderizando:
  - [ ] Inspecionar DOM (F12 → Elements)
  - [ ] Procurar por `ModalDetalhesTermo` ou classe do modal
  - [ ] Verificar CSS (display, visibility, opacity, z-index)

---

## 🎯 **Próximos Passos**

1. **Executar checklist acima**
2. **Enviar logs do console** quando clicar em visualizar
3. **Verificar Network tab** para ver se API está retornando dados
4. **Tirar screenshot** da tela quando clicar no botão

Com essas informações, posso identificar exatamente onde está o problema!

---

## 📝 **Informações Adicionais**

### **Arquivos Envolvidos:**

- `ListaTermosCards.tsx:144` - Botão de visualizar (cards)
- `ListaTermosTable.tsx:185` - Botão de visualizar (tabela)
- `useListaTermos.ts:309` - Função `visualizarTermo`
- `ListaTermosContainer.tsx:365` - Renderização do modal
- `ModalDetalhesTermo.tsx:45` - Componente do modal (1.167 linhas)
- `/backend/src/routes/termos.ts` - API backend

### **Estados Críticos:**

- `mostrarDetalhes`: `boolean` - Controla visibilidade do modal
- `termoSelecionado`: `TermoAmbiental | null` - Dados do termo a exibir

### **Condição de Renderização:**

```tsx
mostrarDetalhes === true
&&
termoSelecionado !== null
```

Ambas condições **DEVEM** ser verdadeiras para o modal aparecer.

---

**Status:** Modal está implementado e ativo no código ✅
**Problema:** Não está aparecendo na interface (possível bug)
**Próximo passo:** Executar checklist de diagnóstico acima
