-- ===================================================================
-- ADICIONAR auth_user_id NA TABELA progresso_metas
-- ===================================================================

-- 1. Verificar estrutura atual da tabela
SELECT 
  'Estrutura atual progresso_metas' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'progresso_metas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna auth_user_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progresso_metas' 
      AND column_name = 'auth_user_id'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE progresso_metas 
    ADD COLUMN auth_user_id UUID;
    
    -- Adicionar comentário explicativo
    COMMENT ON COLUMN progresso_metas.auth_user_id IS 'ID do usuário no Supabase Auth - facilita consultas diretas do frontend';
    
    RAISE NOTICE '✅ Coluna auth_user_id adicionada em progresso_metas!';
  ELSE
    RAISE NOTICE '⚠️ Coluna auth_user_id já existe em progresso_metas!';
  END IF;
END $$;

-- 3. Preencher a coluna auth_user_id com base no tma_id
UPDATE progresso_metas 
SET auth_user_id = (
  SELECT u.auth_user_id 
  FROM usuarios u 
  WHERE u.id = progresso_metas.tma_id
)
WHERE auth_user_id IS NULL;

-- 4. Verificar o preenchimento
SELECT 
  'Verificação após preenchimento' as info,
  COUNT(*) as total_progresso,
  COUNT(auth_user_id) as com_auth_user_id,
  COUNT(*) - COUNT(auth_user_id) as sem_auth_user_id
FROM progresso_metas;

-- 5. Mostrar dados de exemplo do João Silva
SELECT 
  'Progresso João Silva' as info,
  pm.id,
  pm.tma_id,
  pm.auth_user_id,
  pm.meta_id,
  pm.quantidade_atual,
  pm.percentual_atual,
  pm.status,
  u.nome,
  u.email,
  m.descricao as meta_descricao
FROM progresso_metas pm
JOIN usuarios u ON pm.tma_id = u.id
JOIN metas m ON pm.meta_id = m.id
WHERE u.nome LIKE '%João%'
ORDER BY pm.created_at DESC;

-- 6. Criar índice para melhorar performance das consultas por auth_user_id
CREATE INDEX IF NOT EXISTS idx_progresso_metas_auth_user_id 
ON progresso_metas(auth_user_id);

-- 7. Criar índice composto para consultas por auth_user_id + meta_id
CREATE INDEX IF NOT EXISTS idx_progresso_metas_auth_user_meta 
ON progresso_metas(auth_user_id, meta_id);

-- 8. Criar trigger para manter auth_user_id sincronizado automaticamente
CREATE OR REPLACE FUNCTION sync_auth_user_id_progresso_metas()
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
DROP TRIGGER IF EXISTS trigger_sync_auth_user_id_progresso_metas ON progresso_metas;
CREATE TRIGGER trigger_sync_auth_user_id_progresso_metas
  BEFORE INSERT OR UPDATE ON progresso_metas
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_id_progresso_metas();

-- 9. Teste do trigger - inserir um progresso novo
INSERT INTO progresso_metas (
  id,
  meta_id,
  tma_id,
  periodo,
  ano,
  mes,
  quantidade_atual,
  percentual_atual,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM metas WHERE ativa = true LIMIT 1),
  '2d7f480e-e42d-4b80-be70-97a4123fca09', -- ID do João Silva
  'mensal',
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  EXTRACT(MONTH FROM CURRENT_DATE)::integer,
  5, -- 5 itens concluídos
  0, -- Será calculado por trigger
  'em_andamento',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 10. Verificar se o trigger funcionou
SELECT 
  'Teste do trigger progresso_metas' as info,
  pm.id,
  pm.tma_id,
  pm.auth_user_id,
  pm.quantidade_atual,
  u.nome,
  CASE 
    WHEN pm.auth_user_id = u.auth_user_id THEN '✅ Sincronizado'
    ELSE '❌ Não sincronizado'
  END as status_sync
FROM progresso_metas pm
JOIN usuarios u ON pm.tma_id = u.id
WHERE u.nome LIKE '%João%'
ORDER BY pm.created_at DESC
LIMIT 3;

-- 11. Estrutura final da tabela
SELECT 
  'Estrutura final progresso_metas' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'progresso_metas' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 12. COMPARAÇÃO: Consulta antiga vs nova
-- Consulta ANTIGA (com JOIN):
EXPLAIN (ANALYZE, BUFFERS) 
SELECT pm.* 
FROM progresso_metas pm
JOIN usuarios u ON pm.tma_id = u.id
WHERE u.auth_user_id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028';

-- Consulta NOVA (direta):
EXPLAIN (ANALYZE, BUFFERS)
SELECT pm.* 
FROM progresso_metas pm
WHERE pm.auth_user_id = '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028'; 