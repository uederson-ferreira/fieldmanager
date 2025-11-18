-- Reabilitar RLS com política correta para termos_ambientais
-- ID do João Silva: 59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028

-- 1. Reabilitar RLS
ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas que podem estar causando problemas
DROP POLICY IF EXISTS "Usuarios podem ver seus proprios termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Users can view their own termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Enable read access for own termos" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_select_policy" ON termos_ambientais;

-- 3. Criar política simples e funcional
CREATE POLICY "Acesso total aos termos do usuario" ON termos_ambientais
FOR ALL 
TO authenticated
USING (
  -- Permitir acesso se for o usuário que emitiu o termo
  auth_user_id = auth.uid() 
  OR emitido_por_usuario_id = auth.uid()
  -- Ou se for admin
  OR EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND tipo_perfil = 'admin'
  )
)
WITH CHECK (
  -- Para inserções/atualizações, usar a mesma lógica
  auth_user_id = auth.uid() 
  OR emitido_por_usuario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios 
    WHERE auth_user_id = auth.uid() 
    AND tipo_perfil = 'admin'
  )
);

-- 4. Verificar se a política foi criada
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
  AND policyname = 'Acesso total aos termos do usuario';

-- 5. Testar a política (deve retornar os 5 termos)
SELECT 
  'Teste COM RLS (nova política):' as status,
  count(*) as quantidade
FROM termos_ambientais; 