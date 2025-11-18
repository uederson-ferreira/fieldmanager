-- Corrigir RLS e estrutura para atividades_rotina
-- ID do João Silva: 59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028

-- 1. Verificar se a coluna auth_user_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'atividades_rotina' 
  AND column_name IN ('auth_user_id', 'tma_responsavel_id');

-- 2. Se não existir, adicionar a coluna auth_user_id
-- ALTER TABLE atividades_rotina 
-- ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- 3. Desabilitar RLS temporariamente para atividades_rotina
ALTER TABLE atividades_rotina DISABLE ROW LEVEL SECURITY;

-- 4. Verificar estrutura atual da tabela
\d atividades_rotina;

-- 5. Verificar dados existentes
SELECT 
  'Dados existentes na tabela:' as status,
  count(*) as quantidade
FROM atividades_rotina;

-- 6. Mostrar algumas atividades para verificar estrutura
SELECT 
  id,
  tma_responsavel_id,
  status,
  created_at
FROM atividades_rotina 
ORDER BY created_at DESC
LIMIT 3;

-- 7. Criar política RLS simples para atividades_rotina
ALTER TABLE atividades_rotina ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuarios podem ver suas atividades" ON atividades_rotina;
DROP POLICY IF EXISTS "Users can view their own atividades" ON atividades_rotina;

-- Criar nova política
CREATE POLICY "Acesso total as atividades do usuario" ON atividades_rotina
FOR ALL 
TO authenticated
USING (
  -- Permitir acesso se for o responsável pela atividade
  tma_responsavel_id = auth.uid()
  -- Ou se for admin
  OR EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND tipo_perfil = 'admin'
  )
)
WITH CHECK (
  -- Para inserções/atualizações
  tma_responsavel_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND tipo_perfil = 'admin'
  )
); 