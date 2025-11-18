-- ===================================================================
-- MIGRATION: Alterar item_id de integer para uuid nas tabelas LV
-- Data: 2025-01-06
-- Descrição: Altera item_id de integer para uuid para referenciar
--            diretamente perguntas_lv.id, garantindo integridade referencial
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. BACKUP: Criar tabelas temporárias para backup dos dados
-- ===================================================================

CREATE TABLE IF NOT EXISTS lv_avaliacoes_backup AS 
SELECT * FROM lv_avaliacoes;

CREATE TABLE IF NOT EXISTS lv_fotos_backup AS 
SELECT * FROM lv_fotos;

-- ===================================================================
-- 2. ADICIONAR COLUNA TEMPORÁRIA item_id_uuid
-- ===================================================================

-- Adicionar coluna temporária para item_id como UUID
ALTER TABLE lv_avaliacoes 
ADD COLUMN IF NOT EXISTS item_id_uuid uuid;

ALTER TABLE lv_fotos 
ADD COLUMN IF NOT EXISTS item_id_uuid uuid;

-- ===================================================================
-- 3. MIGRAR DADOS: Mapear integer/código para UUID
-- ===================================================================

-- Para lv_avaliacoes: mapear item_codigo para perguntas_lv.id
UPDATE lv_avaliacoes av
SET item_id_uuid = (
  SELECT p.id 
  FROM perguntas_lv p 
  WHERE p.codigo = av.item_codigo 
  LIMIT 1
)
WHERE item_id_uuid IS NULL;

-- Para lv_fotos: mapear baseado no item_codigo através da LV
-- (Nota: lv_fotos não tem item_codigo diretamente, então precisamos
--  usar o tipo_lv e tentar encontrar pela ordem ou criar um mapeamento)
-- Por enquanto, vamos deixar NULL e preencher manualmente ou via script
-- Se houver dados, pode ser necessário um script específico

-- ===================================================================
-- 4. VALIDAR: Verificar se há registros sem UUID mapeado
-- ===================================================================

DO $$
DECLARE
  av_sem_uuid integer;
BEGIN
  SELECT COUNT(*) INTO av_sem_uuid
  FROM lv_avaliacoes
  WHERE item_id_uuid IS NULL;
  
  IF av_sem_uuid > 0 THEN
    RAISE NOTICE 'ATENÇÃO: % avaliações sem UUID mapeado. Verifique antes de continuar.', av_sem_uuid;
  END IF;
END $$;

-- ===================================================================
-- 5. REMOVER CONSTRAINTS E ÍNDICES ANTIGOS
-- ===================================================================

-- Remover constraint unique que usa item_id (integer)
ALTER TABLE lv_avaliacoes 
DROP CONSTRAINT IF EXISTS lv_avaliacoes_lv_item_unique;

-- Remover índices antigos
DROP INDEX IF EXISTS idx_lv_avaliacoes_item_id;
DROP INDEX IF EXISTS idx_lv_fotos_item_id;

-- ===================================================================
-- 6. ALTERAR TIPO DA COLUNA item_id
-- ===================================================================

-- Remover coluna antiga e renomear a nova
ALTER TABLE lv_avaliacoes 
DROP COLUMN IF EXISTS item_id CASCADE;

ALTER TABLE lv_avaliacoes 
RENAME COLUMN item_id_uuid TO item_id;

ALTER TABLE lv_avaliacoes 
ALTER COLUMN item_id SET NOT NULL;

-- Repetir para lv_fotos
ALTER TABLE lv_fotos 
DROP COLUMN IF EXISTS item_id CASCADE;

ALTER TABLE lv_fotos 
RENAME COLUMN item_id_uuid TO item_id;

-- Para lv_fotos, item_id pode ser NULL temporariamente se não houver mapeamento
-- Mas depois deve ser NOT NULL
ALTER TABLE lv_fotos 
ALTER COLUMN item_id SET NOT NULL;

-- ===================================================================
-- 7. ADICIONAR FOREIGN KEY CONSTRAINT
-- ===================================================================

-- Adicionar FK para perguntas_lv
ALTER TABLE lv_avaliacoes
ADD CONSTRAINT lv_avaliacoes_item_id_fkey 
FOREIGN KEY (item_id) 
REFERENCES perguntas_lv(id) 
ON DELETE RESTRICT;

ALTER TABLE lv_fotos
ADD CONSTRAINT lv_fotos_item_id_fkey 
FOREIGN KEY (item_id) 
REFERENCES perguntas_lv(id) 
ON DELETE RESTRICT;

-- ===================================================================
-- 8. RECRIAR CONSTRAINTS E ÍNDICES
-- ===================================================================

-- Recriar constraint unique com UUID
ALTER TABLE lv_avaliacoes
ADD CONSTRAINT lv_avaliacoes_lv_item_unique 
UNIQUE (lv_id, item_id);

-- Recriar índices
CREATE INDEX IF NOT EXISTS idx_lv_avaliacoes_item_id 
ON lv_avaliacoes USING btree (item_id);

CREATE INDEX IF NOT EXISTS idx_lv_fotos_item_id 
ON lv_fotos USING btree (item_id);

-- ===================================================================
-- 9. COMENTÁRIOS NA ESTRUTURA
-- ===================================================================

COMMENT ON COLUMN lv_avaliacoes.item_id IS 'Referência direta ao id da pergunta em perguntas_lv (UUID)';
COMMENT ON COLUMN lv_fotos.item_id IS 'Referência direta ao id da pergunta em perguntas_lv (UUID)';

COMMIT;

-- ===================================================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- ===================================================================

-- Verificar integridade
DO $$
DECLARE
  av_invalidas integer;
  fotos_invalidas integer;
BEGIN
  -- Verificar avaliações sem correspondência
  SELECT COUNT(*) INTO av_invalidas
  FROM lv_avaliacoes av
  WHERE NOT EXISTS (
    SELECT 1 FROM perguntas_lv p WHERE p.id = av.item_id
  );
  
  -- Verificar fotos sem correspondência
  SELECT COUNT(*) INTO fotos_invalidas
  FROM lv_fotos f
  WHERE NOT EXISTS (
    SELECT 1 FROM perguntas_lv p WHERE p.id = f.item_id
  );
  
  IF av_invalidas > 0 OR fotos_invalidas > 0 THEN
    RAISE WARNING 'Encontrados registros sem correspondência: % avaliações, % fotos', av_invalidas, fotos_invalidas;
  ELSE
    RAISE NOTICE '✅ Migração concluída com sucesso! Todas as referências estão válidas.';
  END IF;
END $$;

