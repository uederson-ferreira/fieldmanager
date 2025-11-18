# 🧪 Guia de Teste: Sistema Offline de Termos Ambientais

**Data:** 21/08/2025  
**Versão:** 1.0  
**Status:** 📋 Procedimentos de Teste  

## 📋 Objetivo dos Testes

Validar que o sistema consegue:

1. **📱 Detectar** quando está offline
2. **💾 Salvar** termos no IndexedDB quando offline
3. **📸 Armazenar** fotos localmente
4. **🔄 Sincronizar** automaticamente quando volta online
5. **✅ Remover** dados locais após sincronização bem-sucedida

---

## 🛠️ Preparação do Ambiente de Teste

### 1. **🌐 Ferramentas Necessárias**

#### **Chrome DevTools (Recomendado)**

- Abra DevTools (`F12`)
- Vá para aba **Network**
- Checkbox **"Offline"** para simular desconexão

#### **Firefox DevTools**

- Abra DevTools (`F12`)
- Vá para aba **Network**
- Dropdown **"No Throttling"** → **"Offline"**

#### **Simulação Manual**

- Desconecte Wi-Fi do computador
- Desabilite adaptador de rede

### 2. **📊 Monitoring Tools**

#### **Console Logs**

```javascript
// Filtre por estas palavras-chave:
- [TERMO MANAGER]
- [OFFLINE]
- [SYNC]
- [IndexedDB]
```

#### **Application Tab (Chrome)**

- **IndexedDB** → **EcoFieldDB** → Tables:
  - `termos_ambientais_offline`
  - `termos_fotos_offline`

---

## 🧪 Cenários de Teste

### **Teste 1: 📱 Detecção de Status Online/Offline**

#### **🎯 Objetivo**: Verificar se a aplicação detecta mudanças de conectividade

#### **📋 Passos:**

1. Acesse a aplicação online
2. Observe o **indicador de status** (geralmente canto superior direito)
3. Ative modo offline no DevTools
4. Observe se o indicador muda para **"Offline"**
5. Desative modo offline
6. Observe se volta para **"Online"**

#### **✅ Resultado Esperado:**

```bash
🟢 Online  → 🔴 Offline → 🟢 Online
```

#### **📊 Logs Esperados:**

```bash
🌐 [CONNECTIVITY] Status changed: offline
🌐 [CONNECTIVITY] Status changed: online
```

---

### **Teste 2: 💾 Criação de Termo Offline**

#### **🎯 Objetivo**: Verificar se termos são salvos localmente quando offline

#### *📋 Passos:*

1. **Ative modo offline** no DevTools
2. Vá para **"Termos Ambientais"**
3. Clique **"+ Novo Termo"**
4. Preencha o formulário:

   ```bash
   Tipo: Notificação
   Local: Área de Teste Offline
   Descrição: Teste de funcionalidade offline
   ```

5. **Adicione pelo menos 2 fotos**
6. Clique **"Salvar"**

#### *✅ Resultado Esperado:*

- ✅ Termo salvo com sucesso
- ✅ Mensagem: "Termo salvo offline"
- ✅ Número do termo: `2025-OFF-RC-XXX`

#### **📊 Logs Esperados:*

```bash
💾 [TERMO MANAGER] Salvando termo offline
📸 [FOTO MANAGER] X fotos salvas offline
✅ [TERMO MANAGER] Termo offline criado: offline_XXXXXXXXX
```

#### **🔍 Verificação no IndexedDB:**

1. DevTools → **Application** → **IndexedDB** → **EcoFieldDB**
2. Tabela `termos_ambientais_offline`: deve ter 1 registro
3. Tabela `termos_fotos_offline`: deve ter as fotos

---

### **Teste 3: 📱 Múltiplos Termos Offline**

#### **🎯 Objetivo**: Testar criação de vários termos offline

#### **📋 Passos:*

1. **Mantenha modo offline** ativo
2. Crie **3 termos adicionais** com dados diferentes:

   ```bash
   Termo 2: Recomendação + 1 foto
   Termo 3: Paralização Técnica + 3 fotos  
   Termo 4: Notificação + 0 fotos
   ```

#### **✅ Resultado Esperado:*

- ✅ **4 termos** salvos offline total
- ✅ Números sequenciais: `OFF-001`, `OFF-002`, `OFF-003`, `OFF-004`
- ✅ **Contador de sincronização**: "🔄 SINCRONIZAR TERMOS (4)"

#### *📊 Logs Esperados:*

```bash
📊 [SYNC STATUS] Termos pendentes: 4
💾 [TERMO MANAGER] 4 termos offline encontrados
```

---

### **Teste 4: 🔄 Sincronização Manual**

#### **🎯 Objetivo**: Testar sincronização manual dos termos offline

#### 📋 Passos:*

1. **Volte online** (desative modo offline)
2. Aguarde alguns segundos para detecção
3. Clique no botão **"🔄 SINCRONIZAR TERMOS (4)"**
4. **Acompanhe os logs** no console

#### **✅ Resultado Esperado.:**

- ✅ **Progresso da sincronização** visível
- ✅ Termos ganham **números definitivos**: `2025-RC-XXX`
- ✅ **Contador zera**: "🔄 SINCRONIZAR TERMOS (0)"
- ✅ Termos aparecem na **lista principal**

#### **📊 Logs Esperados.:**

```bash
🔄 [SYNC STATUS] Iniciando sincronização de TERMOS AMBIENTAIS...
📤 [TERMO SYNC] Sincronizando 4 termos...
✅ [TERMO SYNC] Termo offline_XXXXX sincronizado com sucesso
📸 [TERMO SYNC] Sincronizando X fotos...
✅ [TERMO SYNC] Fotos sincronizadas com sucesso
🗑️ [TERMO MANAGER] Termo removido do IndexedDB
```

#### **🔍 Verificação Pós-Sincronização:**

1. **IndexedDB**: Tabelas devem estar **vazias**
2. **Lista de Termos**: Deve mostrar os **4 novos termos**
3. **Contador**: Deve mostrar **"(0)"**

---

### **Teste 5: 🚨 Teste de Falha na Sincronização**

#### **🎯 Objetivo**: Verificar comportamento quando sincronização falha

#### **📋 Passos.:**

1. Crie **1 termo offline**
2. **Volte online**
3. **Pare o backend** (`Ctrl+C` no terminal do backend)
4. Tente **sincronizar**

#### **✅ Resultado Esperado..:**

- ❌ **Erro de sincronização** mostrado
- ✅ Termo **permanece offline** para nova tentativa
- ✅ Número muda para: `2025-SINC-RC-XXX` (marcado como tentativa)

#### **📊 Logs Esperados..:**

```bash
❌ [TERMO SYNC] Erro ao sincronizar termo: Network Error
🔄 [TERMO SYNC] Implementando fallback...
✅ [TERMO SYNC] Termo marcado como SINC para re-tentativa
```

---

### **Teste 6: 📸 Teste Específico de Fotos**

#### **🎯 Objetivo**: Validar armazenamento e sincronização de fotos

#### **📋 Passos..:**

1. **Offline**: Crie termo com **5 fotos diferentes**
2. Verifique **preview offline** (fotos devem aparecer)
3. **Online**: Sincronize
4. Verifique **preview online** (fotos devem continuar aparecendo)

#### ✅ Resultado Esperado

- ✅ **Offline**: Fotos em base64 no IndexedDB
- ✅ **Preview offline**: Fotos visíveis
- ✅ **Sincronização**: Upload para Supabase Storage
- ✅ **Preview online**: Fotos via URLs públicas

#### **📊 Logs Esperados...:**

```bash
📸 [FOTO MANAGER] 5 fotos salvas em base64
📤 [TERMO SYNC] Fazendo upload de foto: XXXXX.jpg  
✅ [TERMO SYNC] Foto uploaded com sucesso: https://supabase.co/...
```

---

## 🔧 Troubleshooting

### **❌ Problemas Comuns**

#### **1. Termo não salva offline**

**Possíveis causas:**

- IndexedDB bloqueado pelo navegador
- Erro de validação no formulário
- Problema na detecção de conectividade

**Debugging:**

```javascript
// Verificar se IndexedDB está disponível
console.log('IndexedDB:', window.indexedDB);

// Verificar status de conectividade
console.log('Navigator Online:', navigator.onLine);
```

#### **2. Sincronização não inicia**

**Possíveis causas:**

- Backend não rodando
- Token de autenticação expirado
- Erro de rede

**Debugging:**

```javascript
// Verificar token
console.log('Token:', localStorage.getItem('ecofield_auth_token'));

// Testar conectividade com backend
fetch('http://localhost:3001/api/version')
  .then(r => r.json())
  .then(console.log);
```

#### **3. Fotos não aparecem após sincronização**

**Possíveis causas:**

- Erro no upload para Supabase
- URL pública não gerada
- Permissões do bucket

**Debugging:**

```javascript
// Verificar URLs das fotos
console.log('Fotos do termo:', termo.termos_fotos);
```

---

## 📊 Checklist de Validação

### **✅ Funcionalidades Offline**

- [ ] Detecção de status online/offline
- [ ] Criação de termos offline
- [ ] Armazenamento de fotos em base64
- [ ] Numeração sequencial offline (`OFF-XXX`)
- [ ] Preview de termos offline
- [ ] Contador de termos pendentes

### **✅ Funcionalidades de Sincronização**

- [ ] Sincronização manual via botão
- [ ] Upload de dados para backend
- [ ] Upload de fotos para Supabase Storage
- [ ] Conversão de números (`OFF-XXX` → `RC-XXX`)
- [ ] Remoção de dados locais após sucesso
- [ ] Atualização da lista principal

### **✅ Tratamento de Erros**

- [ ] Fallback para falhas de sincronização
- [ ] Retenção de dados para re-tentativa
- [ ] Logs de erro informativos
- [ ] Notificações de erro para usuário

---

## 🎯 Resultados Esperados

### **📈 Métricas de Sucesso**

1. **Criação Offline**: 100% dos termos salvos localmente
2. **Sincronização**: >95% de sucesso em condições normais
3. **Integridade de Dados**: 0% de perda após sincronização
4. **Performance**: Sincronização <30s para 10 termos+fotos
5. **UX**: Indicadores visuais claros em todas as etapas

### **🎉 Critérios de Aceitação**

- ✅ **Usuário pode trabalhar** completamente offline
- ✅ **Dados são preservados** até a sincronização
- ✅ **Sincronização é confiável** e transparente  
- ✅ **Erros são tratados** graciosamente
- ✅ **Performance é adequada** para uso real

---

## 📚 Recursos Adicionais

### **🔗 Arquivos Relevantes**

- **Offline Storage**: `frontend/src/lib/offline/database/`
- **Sync Logic**: `frontend/src/lib/offline/sync/syncers/`
- **Term Manager**: `frontend/src/utils/TermoManager.ts`
- **Connectivity**: `frontend/src/hooks/useOnlineStatus.ts`

### **📊 Comandos Úteis**

```bash
# Limpar IndexedDB (Console)
indexedDB.deleteDatabase('EcoFieldDB');

# Verificar storage usado
navigator.storage.estimate().then(console.log);

# Forçar reload sem cache
Ctrl+Shift+R (Chrome/Firefox)
```

---

Guia criado em 21/08/2025 - Sistema EcoField v1.0
