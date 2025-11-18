# 📊 ANÁLISE DE COMPLEXIDADE DOS MÓDULOS

## 📅 **DATA**: 02/08/2025

## 🎯 **OBJETIVO**: Analisar complexidade dos módulos para priorizar refatoração

---

## 📈 **RESUMO GERAL**

### **Total de Linhas**: 17.071 linhas

### **Módulos Analisados**: 4 principais

---

## 🗂️ **ANÁLISE POR MÓDULO**

### **1. 🏢 MÓDULO ADMIN**

**Total**: 4.431 linhas (26% do total)

#### **Componentes por Complexidade**

**🔴 ALTA COMPLEXIDADE (>500 linhas)**:

- `CrudMetas.tsx` - 1.204 linhas
- `CrudUsuarios.tsx` - 552 linhas

**🟡 MÉDIA COMPLEXIDADE (200-500 linhas)**:

- `CrudCategorias.tsx` - 445 linhas
- `CrudAreas.tsx` - 418 linhas
- `EstatisticasIndividuais.tsx` - 285 linhas
- `AdminRotinas.tsx` - 255 linhas
- `GerenciarPerfis.tsx` - 222 linhas
- `Backup.tsx` - 214 linhas
- `CrudPerfis.tsx` - 211 linhas
- `CrudConfiguracoes.tsx` - 209 linhas

**🟢 BAIXA COMPLEXIDADE (<200 linhas)**:

- `Logs.tsx` - 175 linhas
- `AdminTermos.tsx` - 135 linhas
- `DashboardGerencial.tsx` - 106 linhas

#### **Análise**

- **13 componentes** no total
- **2 componentes** de alta complexidade
- **8 componentes** de média complexidade
- **3 componentes** de baixa complexidade
- **Média**: 341 linhas por componente

---

### **2. 👨‍💼 MÓDULO TÉCNICO**

**Total**: 6.242 linhas (37% do total) ✅ **JÁ REFATORADO**

#### Componentes por Complexidade**

**🔴 ALTA COMPLEXIDADE (>1000 linhas)**:

- `AtividadesRotina.tsx` - 2.323 linhas
- `TermoFormV2.tsx` - 1.743 linhas
- `ListaTermos.tsx` - 1.167 linhas

**🟡 MÉDIA COMPLEXIDADE (200-500 linhas)**:

- `ModalDetalhesTermo.tsx` - 497 linhas
- `ModalVisualizarLV.tsx` - 355 linhas

**🟢 BAIXA COMPLEXIDADE (<200 linhas)**:

- `AssinaturaDigital.tsx` - 157 linhas

#### Análise

- **6 componentes** no total
- **3 componentes** de alta complexidade
- **2 componentes** de média complexidade
- **1 componente** de baixa complexidade
- **Média**: 1.040 linhas por componente

---

### **3. 📋 MÓDULO LV**

**Total**: 2.057 linhas (12% do total)

#### Componentes por Complexidade

**🟡 MÉDIA COMPLEXIDADE (200-500 linhas)**:

- `LVForm.tsx` - 436 linhas
- `InspecaoPlugin.tsx` - 381 linhas
- `ResiduosPlugin.tsx` - 302 linhas
- `LVContainer.tsx` - 279 linhas
- `LVList.tsx` - 270 linhas
- `LVStats.tsx` - 237 linhas

**🟢 BAIXA COMPLEXIDADE (<200 linhas)**:

- `LVPhotoUpload.tsx` - 152 linhas

#### Análise2

- **7 componentes** no total
- **0 componentes** de alta complexidade
- **6 componentes** de média complexidade
- **1 componente** de baixa complexidade
- **Média**: 294 linhas por componente

---

### **4. 📊 MÓDULO DASHBOARD**

**Total**: 988 linhas (6% do total)

#### Componentes por Complexidade2

**🟡 MÉDIA COMPLEXIDADE (200-500 linhas)**:

- `DashboardMainContent.tsx` - 355 linhas
- `DashboardNavigation.tsx` - 268 linhas
- `DashboardProvider.tsx` - 192 linhas

**🟢 BAIXA COMPLEXIDADE (<200 linhas)**:

- `StatsCard.tsx` - 101 linhas
- `DashboardHeader.tsx` - 72 linhas

#### Análise3

- **5 componentes** no total
- **0 componentes** de alta complexidade
- **3 componentes** de média complexidade
- **2 componentes** de baixa complexidade
- **Média**: 198 linhas por componente

---

### **5. 🔧 COMPONENTES GERAIS**

**Total**: 3.029 linhas (18% do total)

**🔴 ALTA COMPLEXIDADE (>500 linhas)**:

- `MetasTMA.tsx` - 808 linhas

**🟡 MÉDIA COMPLEXIDADE (200-500 linhas)**:

- `Historico.tsx` - 531 linhas
- `Fotos.tsx` - 436 linhas
- `AdminDashboard.tsx` - 324 linhas
- `Login.tsx` - 312 linhas
- `ListasVerificacao.tsx` - 300 linhas

**🟢 BAIXA COMPLEXIDADE (<200 linhas)**:

- `VersionIndicator.tsx` - 98 linhas
- `PerfilRedirect.tsx` - 94 linhas
- `UpdateBanner.tsx` - 74 linhas
- `TecnicoDashboard.tsx` - 52 linhas

#### Análise4

- **10 componentes** no total
- **1 componente** de alta complexidade
- **5 componentes** de média complexidade
- **4 componentes** de baixa complexidade
- **Média**: 303 linhas por componente

---

## 🎯 **PRIORIZAÇÃO PARA REFATORAÇÃO**

### **1. 🏢 MÓDULO ADMIN** (PRIORIDADE ALTA)

**Justificativa**:

- **4.431 linhas** (26% do total)
- **2 componentes** de alta complexidade
- **13 componentes** no total
- **Média**: 341 linhas por componente

**Componentes Críticos**:

1. `CrudMetas.tsx` - 1.204 linhas
2. `CrudUsuarios.tsx` - 552 linhas
3. `CrudCategorias.tsx` - 445 linhas
4. `CrudAreas.tsx` - 418 linhas

### **2. 📋 MÓDULO LV** (PRIORIDADE MÉDIA)

**Justificativa**:

- **2.057 linhas** (12% do total)
- **0 componentes** de alta complexidade
- **7 componentes** no total
- **Média**: 294 linhas por componente

### **3. 🔧 COMPONENTES GERAIS** (PRIORIDADE MÉDIA)

**Justificativa**:

- **3.029 linhas** (18% do total)
- **1 componente** de alta complexidade
- **10 componentes** no total
- **Média**: 303 linhas por componente

### **4. 📊 MÓDULO DASHBOARD** (PRIORIDADE BAIXA)

**Justificativa**:

- **988 linhas** (6% do total)
- **0 componentes** de alta complexidade
- **5 componentes** no total
- **Média**: 198 linhas por componente

---

## 📊 **MÉTRICAS DE COMPLEXIDADE**

### **Por Módulo**

1. **Técnico**: 6.242 linhas (37%) ✅ **REFATORADO**
2. **Admin**: 4.431 linhas (26%) 🔄 **PRÓXIMO**
3. **Geral**: 3.029 linhas (18%)
4. **LV**: 2.057 linhas (12%)
5. **Dashboard**: 988 linhas (6%)

### **Por Complexidade**

- **Alta (>500 linhas)**: 6 componentes
- **Média (200-500 linhas)**: 24 componentes
- **Baixa (<200 linhas)**: 11 componentes

---

## 🚀 **RECOMENDAÇÃO**

### **PRÓXIMO MÓDULO**: **ADMIN**

**Justificativa**:

- **Maior impacto** (26% do código)
- **2 componentes críticos** (>500 linhas)
- **13 componentes** para refatorar
- **Padrão estabelecido** pelo módulo Técnico

**Estratégia**:

1. **Começar pelos componentes críticos** (CrudMetas, CrudUsuarios)
2. **Seguir padrão** do módulo Técnico
3. **Criar APIs necessárias** no backend
4. **Implementar cache unificado**

**Tempo estimado**: 3-4 horas
**Complexidade**: Média
**Risco**: Baixo

---

## ✅ **CONCLUSÃO**

O **módulo Admin** é a escolha ideal para a próxima refatoração devido ao seu tamanho, complexidade e impacto no sistema. O padrão estabelecido pelo módulo Técnico facilitará a migração.
