# 📊 FLUXO VISUAL DO SISTEMA DE METAS - ECOFIELD

## 🎯 **VISÃO GERAL DO SISTEMA**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE METAS ECOFIELD                   │
│                                                                 │
│  📋 ADMIN CRIA META → 👥 ATRIBUI A TMAs → 📊 PROGRESSO AUTOMÁTICO │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 **FLUXO COMPLETO DETALHADO**

### **1. CRIAÇÃO DE META (ADMIN)**

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📋 Admin      │───▶│   🗄️ Banco      │───▶│   ✅ Meta       │
│   Dashboard     │    │   de Dados      │    │   Criada        │
│                 │    │                 │    │                 │
│ • Tipo: LV      │    │ • Tabela: metas │    │ • ID único      │
│ • Quantidade: 50│    │ • Validações    │    │ • Status: ativa │
│ • Período: Mensal│   │ • Constraints   │    │ • Escopo: equipe│
│ • Escopo: Equipe│    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **2. ATRIBUIÇÃO DE META (ADMIN)**

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   👥 Admin      │───▶│   🔗 Tabela     │───▶│   👤 TMA        │
│   Atribui       │    │   atribuições   │    │   Responsável   │
│                 │    │                 │    │                 │
│ • Seleciona TMA │    │ • meta_id       │    │ • João          │
│ • Quantidade    │    │ • tma_id        │    │ • Maria         │
│   Individual    │    │ • responsável   │    │ • Pedro         │
│ • Confirma      │    │ • created_at    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **3. PROGRESSO AUTOMÁTICO (TRIGGERS)**

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📝 TMA        │───▶│   ⚡ Trigger    │───▶│   📊 Progresso  │
│   Cria Registro │    │   Automático    │    │   Atualizado    │
│                 │    │                 │    │                 │
│ • Termo         │    │ • INSERT/UPDATE │    │ • Quantidade    │
│ • LV            │    │ • Função:       │    │   Atual         │
│ • Rotina        │    │   calcular_     │    │ • Percentual    │
│                 │    │   progresso_    │    │   Alcançado     │
│                 │    │   metas()       │    │ • Status        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ **ESTRUTURA DO BANCO DE DADOS**

### **Tabelas Principais:**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                        TABELAS PRINCIPAIS                      │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   📋 METAS      │   🔗 ATRIBUIÇÕES│   📊 PROGRESSO             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • id (UUID)     │ • id (UUID)     │ • id (UUID)                │
│ • tipo_meta     │ • meta_id       │ • meta_id                  │
│ • meta_quantidade│ • tma_id       │ • tma_id (NULL=equipe)     │
│ • periodo       │ • responsavel   │ • quantidade_atual         │
│ • ano/mes       │ • created_at    │ • percentual_alcancado     │
│ • escopo        │                 │ • status                   │
│ • ativa         │                 │ • ultima_atualizacao       │
│ • criada_por    │                 │ • created_at               │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### **Tabelas de Origem (Triggers):**

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📄 TERMOS     │    │   📋 LVs        │    │   🔄 ROTINAS    │
│   AMBIENTAIS    │    │                 │    │                 │
│                 │    │                 │    │                 │
│ • emitido_por   │    │ • usuario_id    │    │ • tma_responsavel│
│ • data_termo    │    │ • data_lv       │    │ • status        │
│ • tipo          │    │ • categoria     │    │ • data_atividade│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ⚡ **TRIGGERS E FUNÇÕES**

### **Triggers Ativos:**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                        TRIGGERS ATIVOS                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   📄 TERMOS     │   📋 LVs        │   🔄 ROTINAS               │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ trigger_calcular│ trigger_calcular│ trigger_calcular           │
│ _progresso_termos│ _progresso_lvs │ _progresso_rotinas         │
│                 │                 │                             │
│ AFTER INSERT    │ AFTER INSERT    │ AFTER INSERT               │
│ AFTER UPDATE    │ AFTER UPDATE    │ AFTER UPDATE               │
│                 │                 │                             │
│ Função:         │ Função:         │ Função:                    │
│ calcular_       │ calcular_       │ calcular_                  │
│ progresso_metas │ progresso_metas │ progresso_metas            │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### **Função Unificada:**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                    FUNÇÃO: calcular_progresso_metas()          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Identifica tabela de origem (TG_TABLE_NAME)                 │
│ 2. Busca metas ativas do tipo correspondente                   │
│ 3. Calcula quantidade atual (COUNT)                            │
│ 4. Calcula percentual alcançado                                │
│ 5. Determina status (em_andamento/alcancada)                   │
│ 6. UPSERT na tabela progresso_metas                            │
│ 7. Atualiza tanto metas individuais quanto de equipe           │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 **TIPOS DE META**

### **Por Escopo:**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                        TIPOS DE META                           │
├─────────────────┬───────────────────────────────────────────────┤
│   👥 EQUIPE     │   👤 INDIVIDUAL                               │
├─────────────────┼───────────────────────────────────────────────┤
│ • Meta geral    │ • Meta específica por TMA                    │
│ • Todos TMAs    │ • Apenas TMA atribuído                       │
│ • Progresso     │ • Progresso individual                       │
│   somado        │ • Quantidade menor                           │
│ • Quantidade    │ • Atribuição obrigatória                     │
│   maior         │                                               │
└─────────────────┴───────────────────────────────────────────────┘
```

### **Por Tipo:**

```bash
┌─────────────────┬─────────────────┬─────────────────────────────┐
│   📄 TERMOS     │   📋 LVs        │   🔄 ROTINAS               │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Termos        │ • Listas de     │ • Atividades de            │
│   Ambientais    │   Verificação   │   Rotina                   │
│ • Emitidos por  │ • Criadas por   │ • Concluídas por           │
│   usuário       │   usuário       │   TMA responsável           │
│ • Contagem por  │ • Contagem por  │ • Status = "Concluída"     │
│   data_termo    │   data_lv       │ • Contagem por             │
│                 │                 │   data_atividade           │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## 📱 **INTERFACES DO FRONTEND**

### **Dashboard Admin:**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD ADMIN                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   📋 CRUD       │   👥 ATRIBUIÇÃO │   📊 MONITORAMENTO         │
│   METAS         │   DE METAS      │   DE PROGRESSO             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Criar Meta    │ • Selecionar    │ • Visualizar               │
│ • Editar Meta   │   TMAs          │   Progresso                │
│ • Deletar Meta  │ • Definir       │ • Gráficos                 │
│ • Ativar/       │   Quantidade    │ • Relatórios               │
│   Desativar     │   Individual    │ • Exportar                 │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### **Dashboard Técnico:**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD TÉCNICO                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   📊 BARRAS     │   📋 LISTA      │   🎯 DETALHES              │
│   DE PROGRESSO  │   DE METAS      │   INDIVIDUAIS              │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Visualização  │ • Metas         │ • Progresso                │
│   Gráfica       │   Atribuídas    │   Detalhado                │
│ • Percentual    │ • Status        │ • Histórico                │
│   Atual         │   Atual         │ • Tendências               │
│ • Cores por     │ • Quantidade    │ • Comparativo              │
│   Status        │   Restante      │   com Equipe               │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## 🔄 **FLUXO DE ATUALIZAÇÃO AUTOMÁTICA**

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📝 TMA        │───▶│   ⚡ TRIGGER    │───▶│   📊 PROGRESSO  │
│   Cria Termo    │    │   EXECUTA       │    │   ATUALIZADO    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   🗄️ Banco     │    │   🧮 FUNÇÃO     │    │   📱 FRONTEND   │
│   Termos        │    │   CALCULA       │    │   ATUALIZA      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📊 Tabela     │    │   📈 Percentual │    │   🎯 Dashboard  │
│   Progresso     │    │   Recalculado   │    │   Atualizado    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✅ **STATUS E VALIDAÇÕES**

### **Status de Progresso:**

```bash
┌─────────────────┬─────────────────┬─────────────────────────────┐
│   🟡 EM         │   🟢 ALCANÇADA  │   🔴 NÃO ALCANÇADA         │
│   ANDAMENTO     │                 │                             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • < 100%        │ • >= 100%       │ • < 50%                    │
│ • Cor: Amarelo  │ • Cor: Verde    │ • Cor: Vermelho            │
│ • Status:       │ • Status:       │ • Status:                  │
│   em_andamento  │   alcancada     │   nao_alcancada            │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### **Validações do Sistema:**

```bash
┌─────────────────────────────────────────────────────────────────┐
│                        VALIDAÇÕES                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   📋 META       │   👥 ATRIBUIÇÃO │   📊 PROGRESSO             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Tipo válido   │ • TMA existe    │ • Quantidade >= 0          │
│ • Quantidade > 0│ • Meta ativa    │ • Percentual <= 100        │
│ • Período válido│ • Não duplicada │ • Status válido            │
│ • Escopo válido │ • Responsável   │ • Data válida              │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## 🎯 **RESUMO DO FLUXO**

1. **📋 ADMIN** cria meta no dashboard
2. **👥 ADMIN** atribui meta aos TMAs
3. **📝 TMA** cria registros (termos, LVs, rotinas)
4. **⚡ TRIGGER** detecta mudança automaticamente
5. **🧮 FUNÇÃO** calcula novo progresso
6. **📊 PROGRESSO** é atualizado no banco
7. **📱 FRONTEND** reflete mudanças em tempo real
8. **🎯 DASHBOARD** mostra progresso atualizado

**✅ Sistema totalmente automatizado e em tempo real!**
