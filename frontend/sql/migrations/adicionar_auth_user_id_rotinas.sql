-- Adicionar coluna auth_user_id na tabela atividades_rotina
-- ID do João Silva: 59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028

-- 1. Adicionar a coluna auth_user_id
ALTER TABLE atividades_rotina 
ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- 2. Atualizar registros existentes copiando de tma_responsavel_id
UPDATE atividades_rotina 
SET auth_user_id = tma_responsavel_id 
WHERE auth_user_id IS NULL;

-- 3. Verificar a atualização
SELECT 
  'Registros atualizados:' as status,
  count(*) as quantidade
FROM atividades_rotina 
WHERE auth_user_id IS NOT NULL;

-- 4. Mostrar alguns registros para verificar
SELECT 
  id,
  tma_responsavel_id,
  auth_user_id,
  atividade,
  status,
  created_at
FROM atividades_rotina 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Criar política RLS unificada
ALTER TABLE atividades_rotina ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuarios podem ver suas atividades" ON atividades_rotina;
DROP POLICY IF EXISTS "Users can view their own atividades" ON atividades_rotina;
DROP POLICY IF EXISTS "Acesso total as atividades do usuario" ON atividades_rotina;

-- Criar política unificada (igual às outras tabelas)
CREATE POLICY "Acesso total as rotinas do usuario" ON atividades_rotina
FOR ALL 
TO authenticated
USING (
  -- Permitir acesso se for o usuário (usando ambos os campos para compatibilidade)
  auth_user_id = auth.uid() 
  OR tma_responsavel_id = auth.uid()
  -- Ou se for admin
  OR EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND tipo_perfil = 'admin'
  )
)
WITH CHECK (
  -- Para inserções/atualizações
  auth_user_id = auth.uid()
  OR tma_responsavel_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND tipo_perfil = 'admin'
  )
);

-- 6. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'atividades_rotina'
  AND policyname = 'Acesso total as rotinas do usuario'; 