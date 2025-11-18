# 📊 ANÁLISE DETALHADA - PASTA /types

## 📈 ESTATÍSTICAS GERAIS

- **Total de arquivos**: 5
- **Total de linhas**: 1.980
- **Total de interfaces**: 89
- **Total de tipos**: 11
- **Total de constantes**: 22

## 🚨 DUPLICAÇÕES IDENTIFICADAS

### 1. UserData (3 definições)

- **auth.ts**: Linha 8 (108 linhas)
- **index.ts**: Linha 6 (17 linhas)
- **termos.ts**: Linha 26 (10 linhas)

### 2. Area (2 definições)

- **index.ts**: Linha 93 (8 linhas)
- **termos.ts**: Linha 7 (8 linhas)

### 3. EmpresaContratada (2 definições)

- **index.ts**: Linha 66 (10 linhas)
- **termos.ts**: Linha 37 (10 linhas)

### 4. Usuario (2 definições)

- **index.ts**: Linha 47 (19 linhas)
- **termos.ts**: Linha 15 (10 linhas)

### 5. FotoData (2 definições)

- **index.ts**: Linha 446 (15 linhas)
- **termos.ts**: Linha 318 (15 linhas)

## 📊 ANÁLISE POR ARQUIVO

### auth.ts (107 linhas)

- **Interfaces**: 6 (UserData, CreateUserData, UpdateUserData, UserMetadata, AuthState, LoginCredentials)
- **Tipos**: 1 (AuthMode)
- **Constantes**: 2 (funções helper)
- **Foco**: Autenticação e usuários

### index.ts (483 linhas)

- **Interfaces**: 35 (MISTURA TUDO)
- **Tipos**: 1
- **Constantes**: 0
- **Problema**: Arquivo muito grande e desorganizado
- **Conteúdo**: UserData, Area, EmpresaContratada, Usuario, LVResiduosData, AtividadeRotina, etc.

### lv.ts (628 linhas)

- **Interfaces**: 16 (LV, LVAvaliacao, LVFoto, LVConfiguracao, etc.)
- **Tipos**: 3 (LVStatus, LVAcao, LVModo)
- **Constantes**: 5 (LV_CONFIGS, funções helper)
- **Foco**: Listas de Verificação unificadas

### metas.ts (308 linhas)

- **Interfaces**: 18 (Meta, MetaCriacao, ProgressoMeta, etc.)
- **Tipos**: 5 (TipoMeta, PeriodoMeta, StatusProgresso, etc.)
- **Constantes**: 10 (PERIODOS_META, TIPOS_META, etc.)
- **Foco**: Sistema de metas e progresso

### termos.ts (454 linhas)

- **Interfaces**: 14 (TermoAmbiental, TermoFoto, TermoFormData, etc.)
- **Tipos**: 1
- **Constantes**: 5 (TIPOS_TERMO, NATUREZA_DESVIO, etc.)
- **Foco**: Termos ambientais
- **Problema**: Duplica UserData, Area, EmpresaContratada

## 🎯 INTERFACES BASE IDENTIFICADAS

### Entidades Principais (para entities.ts)

- **UserData**: Interface mais completa (auth.ts)
- **Area**: Interface mais completa (index.ts)
- **EmpresaContratada**: Interface mais completa (index.ts)
- **Usuario**: Interface mais completa (index.ts)
- **FotoData**: Interface mais completa (termos.ts)

## 📋 PADRÕES DE USO IDENTIFICADOS

### Imports de UserData

- **auth.ts**: 4 arquivos importam
- **index.ts**: 2 arquivos importam
- **termos.ts**: 1 arquivo importa

### Imports de Area

- **index.ts**: 3 arquivos importam
- **termos.ts**: 2 arquivos importam

## ✅ RECOMENDAÇÕES

### 1. Criar entities.ts

- Mover UserData de auth.ts
- Mover Area de index.ts
- Mover EmpresaContratada de index.ts
- Mover Usuario de index.ts
- Mover FotoData de termos.ts

### 2. Limpar index.ts

- Remover interfaces duplicadas
- Manter apenas tipos específicos
- Transformar em re-exports

### 3. Atualizar imports

- Todos importam de entities.ts
- Padronizar padrão de import
- Verificar compatibilidade
