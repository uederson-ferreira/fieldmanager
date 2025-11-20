# 🔧 SQL Fixes - FieldManager

Scripts SQL para correção de problemas no banco de dados.

## 📋 Scripts Disponíveis

### `fix-rls-assinaturas-storage.sql`

**Problema**: Políticas RLS (Row-Level Security) bloqueando:

- Upload de fotos para o bucket `execucoes`
- Criação de assinaturas na tabela `assinaturas_execucoes`

**Erro observado**:

```bash
StorageApiError: new row violates row-level security policy
```

**Solução**:

- Remove políticas RLS complexas que usam `current_setting()`
- Cria políticas simples para usuários autenticados
- Configura bucket `execucoes` para aceitar todos os tipos MIME

**Como aplicar**:

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `fix-rls-assinaturas-storage.sql`
4. Execute o script
5. Verifique os logs de sucesso no final

**Resultado esperado**:

- ✅ Uploads de fotos funcionando
- ✅ Criação de assinaturas funcionando
- ✅ Bucket configurado corretamente

---

### `fix-execucoes-usuario-id-verificacao.sql`

**Problema**: Verificar execuções com `usuario_id` inconsistente.

**Descrição**: Script de verificação que mostra:
- Execuções que usam `auth_user_id` em vez de `usuarios.id`
- Execuções com IDs não encontrados na tabela `usuarios`
- Resumo por tipo de problema

**Como usar**:

1. Execute este script **ANTES** do fix para ver o que será corrigido
2. Revise os resultados
3. Se estiver tudo certo, execute o script de correção

---

### `fix-execucoes-usuario-id.sql`

**Problema**: Execuções criadas com `auth_user_id` em vez de `usuarios.id`.

**Causa**: O backend não estava convertendo `auth_user_id` para `usuarios.id` ao criar execuções, resultando em IDs inconsistentes.

**Erro observado**:
- Dashboard mostra apenas parte das execuções do usuário
- Execuções com `usuario_id` que não existe na tabela `usuarios`
- Algumas execuções usam `auth_user_id`, outras usam `usuarios.id`

**Solução**:
- Atualiza execuções que têm `auth_user_id` para usar o `usuarios.id` correto
- Busca o `usuarios.id` baseado no `auth_user_id` correspondente

**Como aplicar**:

1. **Primeiro**, execute `fix-execucoes-usuario-id-verificacao.sql` para ver o que será corrigido
2. Faça backup da tabela `execucoes`:
   ```sql
   -- No Supabase SQL Editor
   SELECT * FROM execucoes;
   -- Exporte os resultados ou use pg_dump
   ```
3. Execute o script `fix-execucoes-usuario-id.sql` no **Supabase SQL Editor**
4. Verifique os resultados no final do script

**Resultado esperado**:
- ✅ Todas as execuções usando `usuarios.id` correto
- ✅ Dashboard mostrando todas as execuções do usuário
- ✅ Estatísticas corretas

**Nota**: Este script só atualiza execuções onde:
- O `usuario_id` não existe na tabela `usuarios` como `id`
- Mas existe um usuário com `auth_user_id` igual ao `usuario_id` da execução

---

## ⚠️ Importante

- Execute os scripts no **Supabase SQL Editor**
- Faça backup antes de executar scripts que alteram dados ou políticas RLS
- Teste em ambiente de desenvolvimento primeiro
- Execute sempre o script de verificação antes do script de correção
