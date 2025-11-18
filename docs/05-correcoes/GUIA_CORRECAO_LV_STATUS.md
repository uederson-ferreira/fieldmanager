# Guia de Correção - Constraint lvs_status_check

## Problema

Erro ao criar Listas de Verificação (LVs): `"violates check constraint lvs_status_check"`

## Causa Raiz

O backend está inserindo `status: 'ativo'` na tabela `lvs`, mas o constraint permite apenas: `['concluido', 'rascunho', 'concluida']`

**Arquivo**: `/Users/uedersonferreira/MeusProjetos/ecofield/backend/src/routes/lvs.ts`
**Linha**: 133

## Solução

### 1. Abrir o arquivo

```bash
nano backend/src/routes/lvs.ts
```

### 2. Localizar a linha problemática

Procure pela linha 133 onde está:

```typescript
const novaLV = {
  ...lvDataClean,
  nome_lv: lvDataClean.nome_lv || titulo,
  auth_user_id: user?.id || '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'ativo',              // ← ESSA LINHA
  sincronizado: true
};
```

### 3. Aplicar a correção

Alterar:

```typescripte
status: 'ativo',
```

Para:

```typescript
status: 'concluido',
```

## Resultado Final

```typescript
const novaLV = {
  ...lvDataClean,
  nome_lv: lvDataClean.nome_lv || titulo,
  auth_user_id: user?.id || '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'concluido',          // ✅ CORRIGIDO
  sincronizado: true
};
```

## Validação

Após a correção, testar:

1. Criar uma nova LV no frontend
2. Confirmar que a LV é criada com sucesso
3. Verificar que avaliações podem ser salvas
4. Verificar que fotos podem ser carregadas

## Impacto

- **Código alterado**: 1 linha
- **Testes necessários**: Nenhum (é uma correção de bug)
- **Breaking changes**: Nenhum
- **Dependências afetadas**: Nenhuma

## Alternativa (Mais Flexível)

Se você quiser que o frontend possa controlar o status, alterar para:

```typescript
status: lvDataClean.status || 'concluido',
```

Isso permitiria enviar um status do frontend caso necessário.

## Referência

- Schema da tabela: `migracao_estrutura_unificada.sql` (linhas 43-45)
- Valores válidos: `'concluido'`, `'rascunho'`, `'concluida'`
- Padrão do banco: `'concluido'`

## Commit

Após alterar, fazer commit:

```bash
git add backend/src/routes/lvs.ts
git commit -m "fix: corrigir status inválido ao criar LVs

- Alterar status de 'ativo' para 'concluido'
- Status 'ativo' não é permitido pelo constraint lvs_status_check
- Permite criar LVs com status válido"
```

---

**Documento gerado**: 2025-11-05
**Status**: Pronto para implementação
