# Migração: item_id de integer para UUID

## 📋 Resumo

Alteração do tipo do campo `item_id` de `integer` para `uuid` nas tabelas `lv_avaliacoes` e `lv_fotos` para referenciar diretamente `perguntas_lv.id`, garantindo integridade referencial.

## ✅ Vantagens da Mudança

1. **Consistência**: Alinha com o padrão UUID usado em todo o sistema
2. **Integridade Referencial**: Permite criar FK real para `perguntas_lv.id`
3. **Robustez**: Não depende mais de `ordem` (pode ser null) ou dedução de código
4. **Manutenibilidade**: Se uma pergunta mudar, a referência permanece válida

## 📝 Arquivos Alterados

### Backend
- `backend/src/routes/lvs.ts`: Atualizado para usar UUID diretamente

### Frontend
- `frontend/src/components/lv/hooks/useLV.ts`: Simplificado para usar `item.id` (UUID) diretamente
- `frontend/src/types/lv.ts`: `item_id` alterado de `number` para `string`
- `frontend/src/components/lv/types/lv.ts`: `item_id` alterado de `number` para `string`
- `frontend/src/types/index.ts`: `item_id` alterado de `number` para `string`
- `frontend/src/lib/lvAPI.ts`: Tipos atualizados
- `frontend/src/components/tecnico/ModalVisualizarLV.tsx`: Tipos atualizados
- `frontend/src/lib/fotosAPI.ts`: Tipos atualizados

### SQL
- `frontend/sql/migrations/20250106_alterar_item_id_para_uuid.sql`: Migration criada

## 🚀 Como Aplicar a Migration

1. **Fazer backup do banco de dados** (recomendado)

2. **Executar a migration no Supabase**:
   ```sql
   -- Execute o arquivo:
   frontend/sql/migrations/20250106_alterar_item_id_para_uuid.sql
   ```

3. **Verificar se há dados existentes**:
   - A migration tenta mapear dados existentes baseado em `item_codigo`
   - Se houver registros sem mapeamento, será necessário ajuste manual

4. **Validar integridade**:
   - A migration inclui validação automática
   - Verificar logs por avisos de registros sem correspondência

## ⚠️ Pontos de Atenção

1. **Dados existentes**: Se houver avaliações/fotos salvas, a migration tenta mapeá-las automaticamente
2. **lv_fotos**: Se `lv_fotos` não tiver `item_codigo`, pode ser necessário mapeamento manual baseado na LV
3. **lv_residuos**: Não foi alterado nesta migration (pode ser feito em outra se necessário)

## 🔄 Rollback (se necessário)

Em caso de problemas, os dados originais estão em:
- `lv_avaliacoes_backup`
- `lv_fotos_backup`

Para reverter:
```sql
-- Restaurar dados originais
DROP TABLE IF EXISTS lv_avaliacoes;
ALTER TABLE lv_avaliacoes_backup RENAME TO lv_avaliacoes;

DROP TABLE IF EXISTS lv_fotos;
ALTER TABLE lv_fotos_backup RENAME TO lv_fotos;
```

## 📊 Testes Recomendados

1. ✅ Criar nova LV e salvar avaliações
2. ✅ Editar LV existente
3. ✅ Verificar integridade referencial
4. ✅ Testar consultas de avaliações por item

