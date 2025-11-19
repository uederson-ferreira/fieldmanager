# 📁 SQL - FieldManager v2.0

Estrutura organizada de scripts SQL para setup e manutenção do banco de dados.

## 📂 Estrutura

```
sql/
├── 00_SETUP_COMPLETO.sql       # ⭐ SCRIPT PRINCIPAL - Execute este para setup completo
├── migrations/                  # Migrações de schema (DDL)
│   ├── 00_criar_tabelas_base.sql
│   └── 01_criar_sistema_multidominio.sql
├── seeds/                       # Dados iniciais (DML)
│   └── 01_dados_iniciais.sql
├── scripts/                     # Utilitários de manutenção
│   ├── limpar-dados.sql
│   └── verificar-estado.sql
├── setup/                       # Configurações adicionais
│   └── 01_criar_buckets_storage.sql
└── README.md                    # Este arquivo
```

---

## 🚀 Quick Start

### Setup Inicial (Banco Novo)

**Execute no Supabase SQL Editor:**

```sql
-- Copie e execute TODO o conteúdo de:
/sql/00_SETUP_COMPLETO.sql
```

Este script executa:
1. ✅ Cria todas as tabelas (migrations)
2. ✅ Popula dados iniciais (seeds)
3. ✅ Mostra verificação final

**Resultado esperado:**
```
Perfis criados: 3
Domínios criados: 6
Tenants criados: 1
Usuários criados: 1
Módulos criados: 1
Perguntas criadas: 10
```

---

## 📖 Detalhamento

### `migrations/` - Schema do Banco

Arquivos que criam a estrutura das tabelas (DDL).

**Ordem de execução:**
1. `00_criar_tabelas_base.sql` - Cria `perfis` e `usuarios`
2. `01_criar_sistema_multidominio.sql` - Cria sistema multi-tenant/multi-domínio

**Tabelas criadas:**
- `perfis`, `usuarios`
- `tenants`, `dominios`, `tenant_dominios`
- `modulos_sistema`, `perguntas_modulos`
- `execucoes`, `execucoes_respostas`, `execucoes_fotos`

### `seeds/` - Dados Iniciais

Arquivos que populam o banco com dados de desenvolvimento (DML).

**`01_dados_iniciais.sql`** - Popula:
- ✅ 3 Perfis (Admin, Supervisor, Técnico)
- ✅ 6 Domínios (Ambiental, Segurança, Qualidade, Saúde, Manutenção, Auditoria)
- ✅ 1 Tenant de desenvolvimento
- ✅ 1 Usuário admin (`admin@fieldmanager.dev`)
- ✅ 1 Módulo NR-35 com 10 perguntas

**Características:**
- Ignora duplicados automaticamente (`ON CONFLICT DO NOTHING`)
- Pode ser executado múltiplas vezes
- UUIDs fixos para facilitar desenvolvimento

### `scripts/` - Utilitários

Scripts auxiliares para manutenção.

**`limpar-dados.sql`** - Remove todos os dados do banco
- ⚠️ **CUIDADO:** Apaga TUDO!
- Mantém a estrutura (tabelas permanecem)
- Ordem correta para respeitar foreign keys

**`verificar-estado.sql`** - Verifica estado atual
- Lista tabelas existentes
- Conta registros em cada tabela
- Mostra dados cadastrados
- Lista índices únicos

### `setup/` - Configurações Adicionais

**`01_criar_buckets_storage.sql`** - Cria buckets no Supabase Storage
- Buckets para execuções, termos, documentos, etc.
- Políticas de acesso RLS
- Execute após o setup principal

---

## 🔑 Credenciais Padrão

```
Email: admin@fieldmanager.dev
Senha: Admin@2025
```

**⚠️ IMPORTANTE:** Após executar o seed, você deve:

1. Criar usuário no **Supabase Auth**:
   - Dashboard → Authentication → Users
   - Add User → Create a new user
   - Email: `admin@fieldmanager.dev`
   - Password: `Admin@2025`
   - ✅ Auto Confirm User

2. Linkar com tabela `usuarios`:
   ```sql
   UPDATE usuarios 
   SET auth_user_id = 'UUID_DO_AUTH_USER' 
   WHERE email = 'admin@fieldmanager.dev';
   ```

---

## 🔄 Workflows Comuns

### Resetar Banco (Limpar e Repopular)

```sql
-- 1. Limpar dados
-- Execute: /sql/scripts/limpar-dados.sql

-- 2. Popular novamente
-- Execute: /sql/seeds/01_dados_iniciais.sql
```

### Verificar Estado Atual

```sql
-- Execute: /sql/scripts/verificar-estado.sql
```

### Adicionar Nova Migration

1. Criar arquivo em `migrations/` com numeração sequencial
2. Atualizar `00_SETUP_COMPLETO.sql` para incluir novo arquivo
3. Documentar mudanças neste README

### Adicionar Novo Seed

1. Criar arquivo em `seeds/` com numeração sequencial
2. Usar `ON CONFLICT DO NOTHING` para segurança
3. Atualizar `00_SETUP_COMPLETO.sql`

---

## 📝 Notas Importantes

### Diferença entre Arquivos

- **Migrations** = Estrutura (CREATE TABLE, ALTER TABLE)
- **Seeds** = Dados (INSERT, UPDATE)
- **Scripts** = Manutenção (TRUNCATE, SELECT)

### Comandos psql vs Supabase SQL Editor

❌ **NÃO funcionam no Supabase:**
- `\i arquivo.sql` (include)
- `\echo mensagem` (echo)
- Outros meta-comandos `\`

✅ **Funcionam:**
- Qualquer SQL padrão (DDL, DML, DCL)
- Múltiplos statements separados por `;`

### UUIDs Fixos

Os seeds usam UUIDs fixos para facilitar desenvolvimento:
- Perfis, domínios, tenant: sempre os mesmos IDs
- Facilita testes e referências
- **Em produção:** considere UUIDs dinâmicos

---

## 🆘 Troubleshooting

### Erro: "relation does not exist"
**Causa:** Migrations não foram executadas  
**Solução:** Execute `00_SETUP_COMPLETO.sql` completo

### Erro: "duplicate key value"
**Causa:** Tentando inserir ID que já existe  
**Solução:** Use `limpar-dados.sql` ou ajuste seed para usar `ON CONFLICT`

### Erro: "column does not exist"
**Causa:** Schema desatualizado  
**Solução:** Verifique se migrations estão atualizadas

---

## 📞 Suporte

- **Projeto:** FieldManager v2.0
- **Database:** Supabase PostgreSQL
- **Project ID:** ysvyfdzczfxwhuyajzre

Para mais informações, consulte `/docs/README_SEED.md`
