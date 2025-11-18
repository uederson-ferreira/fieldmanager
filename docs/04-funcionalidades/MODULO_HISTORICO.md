# 📋 Módulo de Histórico - EcoField System

## 🎯 **Visão Geral**

O módulo de **Histórico** permite aos técnicos visualizar todas as suas atividades realizadas no sistema, incluindo Termos Ambientais, Listas de Verificação (LVs) e Rotinas.

## ✨ **Funcionalidades Principais**

### 🔍 **Busca e Filtros**

- **Busca por texto**: Pesquisa em título, descrição e local
- **Filtro por tipo**: Termos, LVs, LVs Resíduos, Rotinas
- **Filtro por status**: Concluída, Em Andamento, Pendente, Emitido
- **Filtro por data**: Hoje, Ontem, Última semana, Último mês
- **Ordenação**: Por data (mais recente) ou por tipo

### 📊 **Visualização de Dados**

- **Lista cronológica**: Atividades ordenadas por data de criação
- **Ícones diferenciados**: Cada tipo de atividade tem seu ícone
- **Cores por tipo**: Sistema de cores para identificação rápida
- **Status visual**: Badges coloridos para status das atividades
- **Detalhes expandíveis**: Clique para ver observações e ações

### 📈 **Estatísticas**

- **Total de atividades**: Contador geral
- **Por tipo**: Separação por Termos, LVs e Rotinas
- **Resumo visual**: Cards com números e descrições

## 🎨 **Interface do Usuário**

### **Header**

- Botão de voltar ao dashboard
- Título e descrição do módulo
- Botão de atualizar dados

### **Filtros**

- Campo de busca com ícone
- Dropdowns para tipo, status, data e ordenação
- Layout responsivo (grid adaptativo)

### **Lista de Atividades**

- Cards individuais para cada atividade
- Ícones coloridos por tipo
- Informações principais: título, status, data, local
- Botão para expandir detalhes
- Hover effects para melhor UX

### **Detalhes Expandidos**

- Observações da atividade
- Botões de ação (Ver detalhes, Exportar)
- Informações adicionais quando disponíveis

## 🔧 **Tipos de Atividades Suportadas**

### **1. Termos Ambientais**

- **Ícone**: Shield (escudo)
- **Cor**: Azul
- **Dados**: Tipo do termo, descrição, local, observações
- **Status**: Emitido, Pendente, etc.

### **2. Listas de Verificação (LVs)**

- **Ícone**: FileText (documento)
- **Cor**: Verde
- **Dados**: Tipo da LV, local de inspeção, observações
- **Status**: Concluída, Em Andamento, etc.

### **3. LVs de Resíduos**

- **Ícone**: FileText (documento)
- **Cor**: Verde esmeralda
- **Dados**: Local de inspeção, observações específicas
- **Status**: Concluída, Em Andamento, etc.

### **4. Rotinas**

- **Ícone**: Clock (relógio)
- **Cor**: Roxo
- **Dados**: Título, descrição, local da atividade
- **Status**: Concluída, Em Andamento, Pendente

## 📱 **Responsividade**

### **Desktop (lg+)**

- Navegação horizontal completa
- Grid de filtros em 5 colunas
- Cards de atividades em largura total

### **Tablet (sm-md)**

- Grid de filtros em 2 colunas
- Layout adaptativo para telas médias

### **Mobile (xs)**

- Grid de filtros em 1 coluna
- Cards empilhados verticalmente
- Botões e textos otimizados para touch

## 🎯 **Fluxo de Uso**

### **1. Acesso ao Módulo**

```bash
Dashboard → Clique em "Histórico" na navegação
```

### **2. Visualização Inicial**

- Carregamento automático das atividades
- Lista ordenada por data (mais recente primeiro)
- Estatísticas no rodapé

### **3. Filtragem e Busca**

- Use o campo de busca para encontrar atividades específicas
- Aplique filtros por tipo, status ou data
- Altere a ordenação conforme necessário

### **4. Visualização de Detalhes**

- Clique no ícone de seta para expandir detalhes
- Visualize observações e informações adicionais
- Use os botões de ação quando disponíveis

### **5. Atualização**

- Clique em "Atualizar" para recarregar dados
- Os filtros são mantidos após atualização

## 🔄 **Integração com Banco de Dados**

### **Tabelas Consultadas**

- `termos_ambientais` - Termos emitidos pelo usuário
- `lvs` - Listas de verificação gerais
- `lv_residuos` - Listas de verificação de resíduos
- `atividades_rotina` - Atividades de rotina

### **Campos Utilizados**

- **Identificação**: `id`, `usuario_id`, `emitido_por_usuario_id`, `tma_responsavel_id`
- **Conteúdo**: `titulo`, `descricao`, `observacoes`
- **Metadados**: `created_at`, `status`
- **Localização**: `local_ocorrencia`, `local_inspecao`, `local_atividade`

## 🎨 **Sistema de Cores**

### **Tipos de Atividade**

- **Termos**: `bg-blue-100 text-blue-700 border-blue-200`
- **LVs**: `bg-green-100 text-green-700 border-green-200`
- **LVs Resíduos**: `bg-emerald-100 text-emerald-700 border-emerald-200`
- **Rotinas**: `bg-purple-100 text-purple-700 border-purple-200`

### **Status**

- **Concluída/Finalizado/Emitido**: `bg-green-100 text-green-700`
- **Em Andamento/Pendente**: `bg-yellow-100 text-yellow-700`
- **Cancelado/Suspenso**: `bg-red-100 text-red-700`
- **Outros**: `bg-gray-100 text-gray-700`

## 🚀 **Próximas Melhorias**

### **Funcionalidades Planejadas**

- [ ] Exportação de relatórios em PDF
- [ ] Filtros avançados por período customizado
- [ ] Visualização em calendário
- [ ] Gráficos de produtividade
- [ ] Comparação entre períodos
- [ ] Notificações de atividades recentes

### **Melhorias de UX**

- [ ] Paginação para grandes volumes de dados
- [ ] Busca avançada com operadores
- [ ] Favoritos e marcadores
- [ ] Modo offline com cache
- [ ] Compartilhamento de relatórios

---

**Status**: ✅ **Implementado e Funcional**
**Versão**: 1.0.0
**Última atualização**: Janeiro 2025
