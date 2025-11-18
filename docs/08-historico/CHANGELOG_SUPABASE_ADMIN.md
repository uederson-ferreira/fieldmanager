# Changelog: Migração para Supabase Admin

## ✅ Arquivos Alterados

### 1. `src/routes/termos.ts`

- ✅ Adicionado import `supabaseAdmin`
- ✅ Substituído `supabase` por `supabaseAdmin` em todas as operações
- ✅ Adicionada verificação `if (!supabaseAdmin)` antes de cada uso

### 2. `src/routes/categorias.ts`

- ✅ Adicionado import `supabaseAdmin`
- ✅ Substituído `supabase` por `supabaseAdmin`
- ✅ Adicionada verificação de segurança

### 3. `src/routes/upload.ts`

- ✅ Adicionado import `supabaseAdmin`
- ✅ Substituído `supabase.storage` por `supabaseAdmin.storage`
- ✅ Adicionada verificação de segurança

## ⚠️ Arquivos que NÃO devem ser alterados

### 1. `src/middleware/auth.ts`

- ❌ DEVE continuar usando `supabase` normal
- ❌ Precisa verificar tokens de usuário
- ❌ Não pode usar service role key

### 2. `src/routes/auth.ts`

- ❌ DEVE continuar usando `supabase` normal
- ❌ Precisa fazer login/logout de usuários
- ❌ Não pode usar service role key

## 🔄 Próximos arquivos para alterar

- [ ] `src/routes/backup.ts`
- [ ] `src/routes/rotinas.ts`
- [ ] `src/routes/usuarios.ts`
- [ ] `src/routes/perfis.ts`
- [ ] `src/routes/configuracoes.ts`
- [ ] `src/routes/metas.ts`
- [ ] `src/routes/logs.ts`
- [ ] `src/routes/lvs.ts`
- [ ] `src/routes/estatisticas.ts`
- [ ] `src/routes/historico.ts`
- [ ] `src/routes/fotos.ts`
- [ ] `src/routes/sync.ts`

## 🚨 IMPORTANTE

1. **Configurar SUPABASE_SERVICE_KEY** no Railway
2. **Testar todas as rotas** após as alterações
3. **Verificar se auth.ts e middleware/auth.ts** continuam funcionando
4. **Fazer deploy** após todas as alterações

## 🎯 Benefícios

- ✅ Resolve problemas de RLS
- ✅ Permite operações administrativas
- ✅ Mantém segurança através do middleware
- ✅ Simplifica operações de dados
