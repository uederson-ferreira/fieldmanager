-- ===================================================================
-- ADICIONAR auth_user_id NA TABELA metas_atribuicoes
-- ===================================================================

-- 1. Verificar estrutura atual da tabela
SELECT 
  'Estrutura atual' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'metas_atribuicoes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna auth_user_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'metas_atribuicoes' 
      AND column_name = 'auth_user_id'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE metas_atribuicoes 
    ADD COLUMN auth_user_id UUID;
    
    -- Adicionar comentário explicativo
    COMMENT ON COLUMN metas_atribuicoes.auth_user_id IS 'ID do usuário no Supabase Auth - facilita consultas diretas do frontend';
    
    RAISE NOTICE '✅ Coluna auth_user_id adicionada com sucesso!';
  ELSE
    RAISE NOTICE '⚠️ Coluna auth_user_id já existe!';
  END IF;
END $$;

-- 3. Preencher a coluna auth_user_id com base no tma_id
UPDATE metas_atribuicoes 
SET auth_user_id = (
  SELECT u.auth_user_id 
  FROM usuarios u 
  WHERE u.id = metas_atribuicoes.tma_id
)
WHERE auth_user_id IS NULL;

-- 4. Verificar o preenchimento
SELECT 
  'Verificação após preenchimento' as info,
  COUNT(*) as total_atribuicoes,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id
FROM metas_atribuicoes;

-- 5. Mostrar dados de exemplo do João Silva
SELECT 
  'Dados João Silva' as info,
  ma.id,
  ma.tma_id,
  ma.auth_user_id,
  u.nome,
  u.email,
  m.descricao as meta_descricao
FROM metas_atribuicoes ma
JOIN usuarios u ON ma.tma_id = u.id
JOIN metas m ON ma.meta_id = m.id
WHERE u.nome LIKE '%João%'
ORDER BY ma.created_at DESC;

-- 6. Criar índice para melhorar performance das consultas por auth_user_id
CREATE INDEX IF NOT EXISTS idx_metas_atribuicoes_auth_user_id 
ON metas_atribuicoes(auth_user_id);

-- 7. Criar trigger para manter auth_user_id sincronizado automaticamente
CREATE OR REPLACE FUNCTION sync_auth_user_id_metas_atribuicoes()
RETURNS TRIGGER AS $$
BEGIN
  -- Em INSERT ou UPDATE do tma_id, buscar o auth_user_id correspondente
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.tma_id IS DISTINCT FROM NEW.tma_id) THEN
    SELECT auth_user_id INTO NEW.auth_user_id
    FROM usuarios 
    WHERE id = NEW.tma_id;
    
    IF NEW.auth_user_id IS NULL THEN
      RAISE WARNING 'auth_user_id não encontrado para tma_id: %', NEW.tma_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger
DROP TRIGGER IF EXISTS trigger_sync_auth_user_id_metas_atribuicoes ON metas_atribuicoes;
CREATE TRIGGER trigger_sync_auth_user_id_metas_atribuicoes
  BEFORE INSERT OR UPDATE ON metas_atribuicoes
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_metas_atribuicoes();

-- 8. Teste do trigger - inserir uma atribuição nova
INSERT INTO metas_atribuicoes (
  id,
  meta_id,
  tma_id,
  responsavel,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM metas WHERE ativa = true LIMIT 1),
  '2d7f480e-e42d-4b80-be70-97a4123fca09', -- ID do João Silva
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 9. Verificar se o trigger funcionou
SELECT 
  'Teste do trigger' as info,
  ma.id,
  ma.tma_id,
  ma.auth_user_id,
  u.nome,
  CASE 
    WHEN ma.auth_user_id = u.auth_user_id THEN '✅ Sincronizado'
    ELSE '❌ Não sincronizado'
  END as status_sync
FROM metas_atribuicoes ma
JOIN usuarios u ON ma.tma_id = u.id
WHERE u.nome LIKE '%João%'
ORDER BY ma.created_at DESC
LIMIT 3;

-- 10. Estrutura final da tabela
SELECT 
  'Estrutura final' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'metas_atribuicoes' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 