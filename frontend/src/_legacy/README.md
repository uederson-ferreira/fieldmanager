# 📦 Código Legacy - EcoField

Esta pasta contém código descontinuado do sistema EcoField, mantido para referência e consulta futura.

**Data de Organização**: 2025-11-06
**Branch**: `feature/lvs-refatoracao`

---

## 📋 Arquivos Legacy

### 1. ModalVisualizarLV.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~550 linhas / 19 KB

**O que fazia**:
- Modal standalone para visualização de LVs (Listas de Verificação)
- Exibia informações gerais, perguntas respondidas e fotos
- Tinha capacidade de impressão e geração de PDF

**Por que foi descontinuado**:
- Sistema foi refatorado para usar `htmlFormGenerator.ts` + `window.open()`
- Nova abordagem é mais modular e reutilizável
- Nunca foi importado no código após refatoração

**O que substituiu**:
- `frontend/src/utils/htmlFormGenerator.ts` - Gera HTML para preview/PDF
- Flow atual: `LVList.tsx` → `LVContainer.tsx` → `useLV.ts` (visualizarLV) → `htmlFormGenerator.ts`

---

### 2. AdminRotinasCompleto.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~760 linhas

**O que fazia**:
- Componente monolítico (v1.0) para gerenciamento de rotinas no admin
- Incluía tabela, filtros, formulário e ações tudo em um único arquivo
- CRUD completo de atividades de rotina

**Por que foi descontinuado**:
- Refatoração v2.0 dividiu em componentes modulares
- Código difícil de manter e testar
- Nunca foi importado após migração v2.0

**O que substituiu**:
- `frontend/src/components/admin/AdminRotinas.tsx` - Container principal
- `frontend/src/components/admin/AdminRotinasTabela.tsx` - Tabela de dados
- `frontend/src/components/admin/AdminRotinasForm.tsx` - Formulário
- `frontend/src/components/admin/AdminRotinasAcoes.tsx` - Ações e botões
- `frontend/src/components/admin/AdminRotinasFiltro.tsx` - Filtros

**Arquitetura**:
```
v1.0 (LEGACY):
└── AdminRotinasCompleto.tsx (tudo em 1 arquivo)

v2.0 (ATUAL):
├── AdminRotinas.tsx (container)
├── AdminRotinasTabela.tsx
├── AdminRotinasForm.tsx
├── AdminRotinasAcoes.tsx
└── AdminRotinasFiltro.tsx
```

---

### 3. AdminTermosCompleto.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~708 linhas

**O que fazia**:
- Componente monolítico (v1.0) para gerenciamento de termos no admin
- Incluía tabela, filtros, formulário e ações tudo em um único arquivo
- CRUD completo de termos de não conformidade

**Por que foi descontinuado**:
- Refatoração v2.0 dividiu em componentes modulares
- Código difícil de manter e testar
- Nunca foi importado após migração v2.0

**O que substituiu**:
- `frontend/src/components/admin/AdminTermos.tsx` - Container principal
- `frontend/src/components/admin/AdminTermosTabela.tsx` - Tabela de dados
- `frontend/src/components/admin/AdminTermosForm.tsx` - Formulário
- `frontend/src/components/admin/AdminTermosAcoes.tsx` - Ações e botões
- `frontend/src/components/admin/AdminTermosFiltro.tsx` - Filtros

**Arquitetura**:
```
v1.0 (LEGACY):
└── AdminTermosCompleto.tsx (tudo em 1 arquivo)

v2.0 (ATUAL):
├── AdminTermos.tsx (container)
├── AdminTermosTabela.tsx
├── AdminTermosForm.tsx (ou TermoFormContainer.tsx)
├── AdminTermosAcoes.tsx
└── AdminTermosFiltro.tsx
```

---

### 4. GerenciarPerfis.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~222 linhas

**O que fazia**:
- Gerenciamento de perfis de usuário (Admin, Supervisor, Técnico)
- CRUD de perfis com permissões

**Por que foi descontinuado**:
- Funcionalidade duplicada
- `CrudPerfis.tsx` é usado atualmente no `AdminDashboard.tsx`
- Nunca foi importado no código

**O que substituiu**:
- `frontend/src/components/admin/CrudPerfis.tsx` - Versão atual em uso

---

### 5. DesignSystem.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~179 linhas

**O que fazia**:
- Componente de demonstração/referência de design
- Showcase de cores, tipografia, botões, formulários
- Usado apenas para desenvolvimento/documentação

**Por que foi descontinuado**:
- Componente de demonstração, não faz parte da aplicação de produção
- Nunca foi importado no código principal
- Design system está implementado via TailwindCSS

**O que substituiu**:
- TailwindCSS configuration em `tailwind.config.js`
- Componentes reais já implementam o design system

---

### 6. AdminLVs.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~570 linhas

**O que fazia**:
- Interface administrativa para gerenciar Listas de Verificação
- Visualização, edição e exclusão de LVs
- Estatísticas e filtros

**Por que foi descontinuado**:
- Funcionalidade nunca foi integrada ao dashboard administrativo
- Possivelmente planejada mas não finalizada
- Nunca foi importada no código

**Nota**:
Se esta funcionalidade for necessária no futuro, considere usar os componentes atuais em `components/lv/` como base.

---

### 7. EstatisticasIndividuais.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~284 linhas

**O que fazia**:
- Visualização de estatísticas individuais de técnicos
- Gráficos e métricas de desempenho
- Dashboard específico por usuário

**Por que foi descontinuado**:
- Funcionalidade nunca foi integrada ao dashboard administrativo
- Possivelmente planejada mas não finalizada
- Nunca foi importada no código

**Funcionalidade Similar Atual**:
- `frontend/src/components/admin/DashboardGerencial.tsx` - Dashboard com estatísticas gerais

**Nota**:
Se estatísticas individuais forem necessárias, considere integrar ao `DashboardGerencial.tsx`.

---

### 8. Logs.tsx
**Movido em**: 2025-11-06
**Tamanho**: ~175 linhas

**O que fazia**:
- Visualizador de logs do sistema
- Filtros por tipo, data, usuário
- Exibição de eventos e ações

**Por que foi descontinuado**:
- Funcionalidade nunca foi integrada ao dashboard administrativo
- Possivelmente planejada mas não finalizada
- Nunca foi importada no código

**Nota**:
Se visualização de logs for necessária, considere implementar usando APIs de logging atuais.

---

## 📊 Resumo

### Estatísticas
- **Total de arquivos**: 8
- **Linhas de código**: ~3,500 linhas
- **Tamanho total**: ~150 KB
- **Data de migração**: 2025-11-06

### Categorias
- **Componentes monolíticos v1.0**: 2 arquivos (AdminRotinasCompleto, AdminTermosCompleto)
- **Componentes duplicados**: 2 arquivos (GerenciarPerfis, ModalVisualizarLV)
- **Funcionalidades não integradas**: 3 arquivos (AdminLVs, EstatisticasIndividuais, Logs)
- **Ferramentas de desenvolvimento**: 1 arquivo (DesignSystem)

### Padrão de Refatoração
O projeto passou por uma clara migração de arquitetura:

**v1.0 (Legacy)**: Componentes monolíticos com toda lógica em um arquivo
**v2.0 (Atual)**: Componentes modulares separados por responsabilidade

---

## ⚠️ Avisos

1. **Não deletar sem consulta**: Estes arquivos podem conter lógica ou referências úteis
2. **Git history preservado**: Arquivos foram movidos com `git mv` para manter histórico
3. **Imports removidos**: Nenhum arquivo legacy está sendo importado no código atual
4. **Testes**: Se houver testes referenciando estes arquivos, também precisam ser atualizados

---

## 🔗 Referências

- **Documentação de Qualidade**: `frontend/docs/Qualidade.md`
- **Resumo de Correções LV**: `frontend/docs/RESUMO_CORRECOES_LV.md`
- **Branch**: `feature/lvs-refatoracao`
- **Commit de Organização**: (pendente - aguardando solicitação do usuário)

---

## 📝 Notas para Desenvolvedores Futuros

Se você está considerando restaurar algum deste código legacy:

1. **Verifique a versão atual primeiro**: A funcionalidade pode já existir de forma modular
2. **Considere a arquitetura v2.0**: Se precisar da lógica, extraia e modularize
3. **Não restaure diretamente**: Use como referência, mas reescreva seguindo padrões atuais
4. **Consulte a documentação**: `CLAUDE.md` tem guidelines de arquitetura atual

---

**Última atualização**: 2025-11-06
