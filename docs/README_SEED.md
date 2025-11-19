# 🌱 Seed Database - FieldManager v2.0

## O que este script faz?

Popula o banco de dados **fieldmanager-production** com dados iniciais para desenvolvimento:

- ✅ **3 Perfis** (Admin, Supervisor, Técnico)
- ✅ **6 Domínios** (Ambiental, Segurança, Qualidade, Saúde, Manutenção, Auditoria)
- ✅ **1 Tenant** de desenvolvimento
- ✅ **1 Usuário Admin** de teste
- ✅ **1 Módulo** de exemplo (NR-35 - Trabalho em Altura)
- ✅ **10 Perguntas** para o módulo NR-35

---

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard

```bash
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### 2. Abra o SQL Editor

- No menu lateral: **SQL Editor** → **New Query**

### 3. Execute o Setup Completo

**IMPORTANTE**: Use o arquivo **`00_EXECUTAR_TUDO_SUPABASE.sql`** (compatível com Supabase)

```bash
# Copie TODO o conteúdo deste arquivo:
/sql/00_EXECUTAR_TUDO_SUPABASE.sql
```

**NÃO use** `00_EXECUTAR_TUDO.sql` (esse é para psql local, usa comandos `\i` e `\echo`)

### 4. Execute o Script

- Cole o conteúdo no SQL Editor
- Clique em **Run** (ou pressione `Ctrl+Enter`)
- Aguarde a execução (deve levar ~5 segundos)

### 5. Verifique os Resultados

Você deve ver no final:

```bash
Perfis criados: 3
Domínios criados: 6
Tenants criados: 1
Usuários criados: 1
Módulos criados: 1
Perguntas criadas: 10
```

---

## 🔑 Credenciais de Acesso

Após executar o seed, use estas credenciais para login:

```bash
Email: admin@fieldmanager.dev
Senha: Admin@2025
```

**IMPORTANTE**: Você ainda precisa criar este usuário no **Supabase Auth**:

### Criar Usuário no Supabase Auth

1. Vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create a new user**
3. Preencha:
   - **Email**: `admin@fieldmanager.dev`
   - **Password**: `Admin@2025`
   - **Auto Confirm User**: ✅ Marque esta opção
4. Clique em **Create User**
5. **Copie o UUID** gerado (auth_user_id)
6. Atualize a tabela usuarios:

```sql
UPDATE usuarios
SET auth_user_id = 'SEU_UUID_AQUI'
WHERE email = 'admin@fieldmanager.dev';
```

---

## 🎯 Dados Criados

### Domínios

| Código | Nome | Cor | Ícone |
|--------|------|-----|-------|
| `ambiental` | Meio Ambiente | 🟢 Verde | Leaf |
| `seguranca` | Segurança do Trabalho | 🟡 Amarelo | HardHat |
| `qualidade` | Qualidade | 🔵 Azul | Award |
| `saude` | Saúde Ocupacional | 🌸 Rosa | Stethoscope |
| `manutencao` | Manutenção | 🟣 Roxo | Wrench |
| `auditoria` | Auditoria | 🔷 Índigo | ClipboardCheck |

### Módulo de Exemplo

#### **NR-35 - Trabalho em Altura**

- Tipo: Checklist
- Domínio: Segurança do Trabalho
- 10 perguntas categorizadas
- Template global (pode ser clonado por tenants)

---

## ⚠️ Notas Importantes

1. **Senhas em Produção**: Em produção, use bcrypt para hash de senhas
2. **UUIDs Fixos**: Os IDs são fixos para facilitar desenvolvimento
3. **Template vs Tenant**: O módulo NR-35 é um template (tenant_id = NULL)
4. **Multitenancy**: O sistema suporta múltiplos tenants, mas o seed cria apenas 1

---

## 🔄 Para Limpar e Reexecutar

Se precisar resetar o banco de dados, você tem **duas opções**:

### Opção 1: Executar setup novamente (recomendado)

O setup agora **ignora registros duplicados**. Basta executar novamente:

```bash
# No Supabase SQL Editor, copie o conteúdo de:
/sql/00_EXECUTAR_TUDO_SUPABASE.sql
```

Os registros que já existem serão ignorados (ON CONFLICT DO NOTHING).

### Opção 2: Limpar tudo e começar do zero

Use o script de limpeza:

```bash
# No Supabase SQL Editor:
/sql/limpar-dados.sql
```

Ou limpe manualmente:

```sql
-- CUIDADO: Isso apaga TODOS os dados!
TRUNCATE TABLE perguntas_modulos CASCADE;
TRUNCATE TABLE execucoes_respostas CASCADE;
TRUNCATE TABLE execucoes_fotos CASCADE;
TRUNCATE TABLE execucoes CASCADE;
TRUNCATE TABLE modulos_sistema CASCADE;
TRUNCATE TABLE tenants_dominios CASCADE;
TRUNCATE TABLE usuarios CASCADE;
TRUNCATE TABLE tenants CASCADE;
TRUNCATE TABLE dominios CASCADE;
TRUNCATE TABLE perfis CASCADE;
```

Depois execute o setup completo:

```bash
# No Supabase SQL Editor:
/sql/00_EXECUTAR_TUDO.sql
```

---

## 📞 Suporte

Se encontrar erros:

1. Verifique se as tabelas existem (migrations foram executadas?)
2. Verifique se há dados conflitantes (execute o TRUNCATE acima)
3. Verifique os logs do Supabase

**Bom desenvolvimento! 🚀**
