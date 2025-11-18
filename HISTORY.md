# História do Projeto FieldManager

## 🎯 Origem

**Data de Criação**: 18 de Novembro de 2025

O **FieldManager** foi criado como uma evolução do projeto [EcoField](https://github.com/uedersonferreira/ecofield), transformando um sistema focado em gestão ambiental em uma **plataforma multi-domínio generalista**.

---

## 🔄 Por que foi criado?

### Problema Original
O EcoField era um sistema excelente, mas limitado a **apenas meio ambiente**:
- 29 checklists ambientais (LVs)
- Termos ambientais
- Rotinas de campo
- **Limitação**: Não atendia outros domínios (Segurança, Qualidade, Saúde, etc.)

### Solução Proposta
Criar uma **nova plataforma** que:
- ✅ Atenda múltiplos domínios (Segurança, Qualidade, Saúde, Manutenção, Auditorias)
- ✅ Seja **multi-tenant** (várias empresas isoladas)
- ✅ Tenha módulos **configuráveis dinamicamente**
- ✅ Use templates reutilizáveis
- ✅ Escale facilmente (adicionar novo módulo em 2h, não 40h)

---

## 📋 Decisões Técnicas

### Nome: FieldManager
- **Sugestões consideradas**: SmartCheck, Mindful, IntelliCheck, FlexCheck, ComplianceHub
- **Escolha final**: **FieldManager**
- **Motivo**: Profissional, descritivo, fácil de lembrar, remete a inteligência de gestão

### Estratégia de Criação
- **Opção escolhida**: Cópia independente (não fork do GitHub)
- **Motivo**: Criar produto totalmente separado, sem vínculo com EcoField
- **Benefício**: Dois produtos diferentes no mercado

### Versão Inicial
- **EcoField**: v1.4.0 (estável)
- **FieldManager**: v2.0.0 (nova era)

### Cores e Identidade
- **EcoField**: Verde #10b981 (natureza/ambiental)
- **FieldManager**: Azul #3b82f6 (profissional/multi-domínio)

---

## 🏗️ Arquitetura Proposta

### Multi-Domínio
Ao invés de ter código hard-coded para cada tipo de checklist, o FieldManager usa:

```
Domínios (6):
├── Meio Ambiente (verde)
├── Segurança do Trabalho (laranja)
├── Qualidade (azul)
├── Saúde Ocupacional (vermelho)
├── Manutenção (roxo)
└── Auditorias (rosa)

Cada domínio tem:
└── Módulos (checklists, formulários, inspeções)
    └── Perguntas (itens configuráveis)
```

### Multi-Tenant
Cada empresa (tenant) tem:
- Domínios ativos (pode ativar os que quiser)
- Módulos próprios (além dos templates)
- Dados isolados (RLS no Supabase)

### Banco de Dados
Novas tabelas principais:
- `tenants` - Empresas/clientes
- `dominios` - 6 domínios disponíveis
- `tenant_dominios` - Quais domínios cada tenant tem ativo
- `modulos_sistema` - Checklists configuráveis
- `perguntas_modulos` - Itens de verificação genéricos
- `execucoes` - Registros de inspeções (substitui `lvs`)

---

## 📂 Estrutura do Projeto

```
fieldmanager/
├── frontend/           # React + TypeScript + Vite
├── backend/            # Express + TypeScript
├── docs/
│   ├── ESTRATEGIA_GENERALIZACAO_MULTIDOMINIO.md    # Visão estratégica
│   ├── ARQUITETURA_MULTIDOMINIO_DIAGRAMA.md        # Diagramas técnicos
│   └── POC_IMPLEMENTACAO_PRATICA.md                # Código SQL + APIs
├── README.md           # Documentação principal
├── CLAUDE.md           # Instruções para Claude Code
└── HISTORY.md          # Este arquivo (contexto histórico)
```

---

## 🎯 Modelo de Negócio Proposto

### Planos SaaS
- **Free**: 1 domínio, 3 módulos, 5 usuários
- **Starter**: R$ 199/mês - 2 domínios, 10 módulos, 20 usuários
- **Professional**: R$ 499/mês - 4 domínios, todos módulos, 50 usuários
- **Enterprise**: Sob consulta - Ilimitado + SLA + Suporte

### Add-ons
- Domínio extra: R$ 99/mês
- Módulo customizado: R$ 299 (setup único)
- Integração API: R$ 499 (setup) + R$ 99/mês

---

## 📅 Linha do Tempo

### 18/11/2025 - Criação Inicial
1. ✅ Análise da arquitetura EcoField
2. ✅ Proposta de estratégia multi-domínio
3. ✅ Criação de 3 documentos técnicos completos
4. ✅ Cópia do EcoField → FieldManager
5. ✅ Renomeação completa do projeto
6. ✅ Atualização de package.json (v2.0.0)
7. ✅ Atualização de manifest.json (tema azul)
8. ✅ Criação de README novo
9. ✅ Commit inicial: `ffeecd9`

### Estado Atual: PoC Pendente
O projeto está **pronto para desenvolvimento**, mas ainda precisa:
- [ ] Criar projeto novo no Supabase
- [ ] Executar migrações multi-domínio
- [ ] Implementar DominioContext (frontend)
- [ ] Implementar APIs de domínios (backend)
- [ ] Criar componente ModuloContainer genérico
- [ ] Testar com 2 domínios (Ambiental + Segurança NR-35)

---

## 🚀 Próximos Passos Sugeridos

### 1. Setup Inicial (1 dia)
```bash
# Criar projeto Supabase novo
# Nome: fieldmanager-production

# Configurar .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Editar com credenciais do novo Supabase

# Instalar dependências
cd frontend && pnpm install
cd backend && pnpm install
```

### 2. Executar Migrações (1 dia)
No SQL Editor do Supabase, executar:
1. `docs/POC_IMPLEMENTACAO_PRATICA.md` - Seção "Código SQL Completo"
2. Criar tabelas: tenants, dominios, modulos_sistema, etc.
3. Popular dados iniciais (6 domínios + NR-35)

### 3. Implementar PoC (1 semana)
Seguir guia em `docs/POC_IMPLEMENTACAO_PRATICA.md`:
- DominioContext + DominioProvider
- APIs /api/dominios
- Componente ModuloContainer
- Testar com Ambiental + Segurança

---

## 📖 Documentação Essencial

Antes de começar a desenvolver, leia:

1. **README.md** - Visão geral do projeto
2. **docs/ESTRATEGIA_GENERALIZACAO_MULTIDOMINIO.md** - Entenda a estratégia
3. **docs/ARQUITETURA_MULTIDOMINIO_DIAGRAMA.md** - Veja os diagramas
4. **docs/POC_IMPLEMENTACAO_PRATICA.md** - Código pronto para implementar
5. **CLAUDE.md** - Instruções de desenvolvimento

---

## 💡 Conceitos Importantes

### 1. Domínio
Área de atuação (ex: Segurança do Trabalho, Qualidade)
- Tem cor, ícone, nome
- Pode ter N módulos

### 2. Módulo
Checklist, formulário ou inspeção configurável
- Exemplo: "NR-35 - Trabalho em Altura"
- Pertence a um domínio
- Pode ser template (sistema) ou customizado (tenant)

### 3. Pergunta
Item de verificação dentro de um módulo
- Exemplo: "O trabalhador está usando cinto paraquedista?"
- Tipo de resposta: boolean, text, multiple_choice, etc.
- Pode ter foto, observação, categoria

### 4. Execução
Registro de uma inspeção realizada
- Substitui a tabela `lvs` do EcoField
- Armazena todas as respostas + fotos
- Vinculada a um módulo e um tenant

### 5. Tenant
Empresa/cliente do sistema
- Tem domínios ativos
- Pode ter módulos customizados
- Dados isolados (RLS)

---

## 🔍 Diferenças: EcoField vs FieldManager

| Aspecto | EcoField | FieldManager |
|---------|----------|--------------|
| **Foco** | Meio Ambiente | Multi-Domínio |
| **Arquitetura** | Mono-domínio | Multi-tenant |
| **Checklists** | Hard-coded (29 LVs) | Dinâmicos (100+ templates) |
| **Escalabilidade** | Baixa (código duplicado) | Alta (configurável) |
| **Público** | Empresas ambientais | Qualquer indústria |
| **Tempo p/ novo módulo** | 40 horas | 2 horas |
| **Cor** | Verde #10b981 | Azul #3b82f6 |
| **Versão** | 1.4.0 | 2.0.0 |

---

## 🤝 Contribuindo

Se você é um desenvolvedor pegando este projeto:

1. **Leia este arquivo inteiro** (você está aqui!)
2. **Leia o README.md** para entender funcionalidades
3. **Leia os 3 documentos técnicos** em `docs/`
4. **Configure ambiente local** (Supabase + .env)
5. **Execute migrações** antes de rodar
6. **Siga o guia do PoC** para primeiras implementações

---

## 📞 Contato

- **Autor Original**: Uederson Ferreira
- **Projeto Base**: [EcoField](https://github.com/uedersonferreira/ecofield)
- **Este Projeto**: FieldManager v2.0.0
- **Criado em**: 18/11/2025

---

## 🎓 Lições Aprendidas

### Por que não migrar o EcoField?
- EcoField tem clientes/usuários ativos
- Migração arriscaria quebrar sistema funcionando
- Melhor ter 2 produtos: um especialista (EcoField) e um generalista (FieldManager)

### Por que não fork do GitHub?
- Não queremos vínculo visível entre projetos
- São produtos independentes com posicionamentos diferentes
- Evita confusão de marca/identidade

### Por que multi-tenant?
- Permite vender como SaaS (modelo recorrente)
- Escalabilidade infinita (cada cliente isolado)
- Reduz custos de infraestrutura (banco único)

---

**Última atualização**: 18/11/2025 - Commit inicial `ffeecd9`
