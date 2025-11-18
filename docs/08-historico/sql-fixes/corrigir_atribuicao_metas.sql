-- ===================================================================
-- CORREÇÃO ATRIBUIÇÃO METAS - SOLUÇÃO COMPLETA
-- ===================================================================

-- 1. Verificar e corrigir RLS
ALTER TABLE metas_atribuicoes ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas conflitantes
DROP POLICY IF EXISTS "Admin pode gerenciar atribuições" ON metas_atribuicoes;
DROP POLICY IF EXISTS "TMA pode ver suas atribuições" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política funcional para metas_atribuicoes" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política temporária para admin" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política simples por email" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Política permissiva para desenvolvimento" ON metas_atribuicoes;
DROP POLICY IF EXISTS "Acesso completo para usuários autenticados" ON metas_atribuicoes;

-- 3. Criar política correta
CREATE POLICY "Política de atribuição de metas" ON metas_atribuicoes
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      -- Admin pode fazer tudo
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id::text = auth.uid()::text 
        AND perfis @> '[{"nome": "admin"}]'
      )
      OR
      -- TMA pode ver suas próprias atribuições
      tma_id::text = auth.uid()::text
    )
  );

-- 4. Verificar e corrigir constraints
ALTER TABLE metas_atribuicoes DROP CONSTRAINT IF EXISTS metas_atribuicoes_meta_id_tma_id_key;
ALTER TABLE metas_atribuicoes ADD CONSTRAINT metas_atribuicoes_meta_id_tma_id_key 
  UNIQUE (meta_id, tma_id);

-- 5. Verificar foreign keys
ALTER TABLE metas_atribuicoes DROP CONSTRAINT IF EXISTS metas_atribuicoes_meta_id_fkey;
ALTER TABLE metas_atribuicoes ADD CONSTRAINT metas_atribuicoes_meta_id_fkey 
  FOREIGN KEY (meta_id) REFERENCES metas (id) ON DELETE CASCADE;

ALTER TABLE metas_atribuicoes DROP CONSTRAINT IF EXISTS metas_atribuicoes_tma_id_fkey;
ALTER TABLE metas_atribuicoes ADD CONSTRAINT metas_atribuicoes_tma_id_fkey 
  FOREIGN KEY (tma_id) REFERENCES usuarios (id) ON DELETE CASCADE;

-- 6. Garantir que as colunas necessárias existem
DO $$ 
BEGIN
  -- Adicionar coluna created_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'metas_atribuicoes' AND column_name = 'created_at') THEN
    ALTER TABLE metas_atribuicoes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Adicionar coluna updated_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'metas_atribuicoes' AND column_name = 'updated_at') THEN
    ALTER TABLE metas_atribuicoes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Adicionar coluna responsavel se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'metas_atribuicoes' AND column_name = 'responsavel') THEN
    ALTER TABLE metas_atribuicoes ADD COLUMN responsavel BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 7. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_metas_atribuicoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_metas_atribuicoes_updated_at ON metas_atribuicoes;
CREATE TRIGGER update_metas_atribuicoes_updated_at
  BEFORE UPDATE ON metas_atribuicoes
  FOR EACH ROW
  EXECUTE FUNCTION update_metas_atribuicoes_updated_at();

-- 8. Garantir permissões
GRANT ALL PRIVILEGES ON TABLE metas_atribuicoes TO authenticated;
GRANT ALL PRIVILEGES ON TABLE metas_atribuicoes TO service_role;

-- 9. Verificar resultado
SELECT 
  'CORREÇÃO APLICADA' as status,
  'metas_atribuicoes' as tabela,
  COUNT(*) as total_registros
FROM metas_atribuicoes;

-- 10. Verificar políticas ativas
SELECT 
  'POLÍTICAS ATIVAS' as status,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'metas_atribuicoes'; 