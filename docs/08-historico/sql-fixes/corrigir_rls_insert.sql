-- ===================================================================
-- CORREÇÃO ESPECÍFICA PARA INSERT NA TABELA lvs
-- ===================================================================

-- 1. VERIFICAR POLÍTICAS ATUAIS DE INSERT
-- ===================================================================
SELECT 
  'POLÍTICAS INSERT ATUAIS' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'lvs' AND cmd = 'INSERT'
ORDER BY policyname;

-- 2. REMOVER POLÍTICAS DE INSERT PROBLEMÁTICAS
-- ===================================================================
DROP POLICY IF EXISTS "Inserção LVs por usuário" ON public.lvs;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias LVs" ON public.lvs;

-- 3. CRIAR POLÍTICA DE INSERT CORRETA
-- ===================================================================
CREATE POLICY "Usuários podem inserir suas próprias LVs" ON public.lvs
FOR INSERT WITH CHECK (
  usuario_id = auth.uid()
);

-- 4. CRIAR POLÍTICA DE INSERT PARA ADMINISTRADORES
-- ===================================================================
CREATE POLICY "Admins podem inserir LVs" ON public.lvs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM'])
  )
);

-- 5. VERIFICAR SE RLS ESTÁ HABILITADO
-- ===================================================================
SELECT 
  'STATUS RLS' as tipo,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'lvs';

-- 6. VERIFICAR POLÍTICAS FINAIS
-- ===================================================================
SELECT 
  'POLÍTICAS FINAIS' as tipo,
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || LEFT(qual, 50) || '...'
    ELSE 'Sem qual'
  END as qual_resumo,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || LEFT(with_check, 50) || '...'
    ELSE 'Sem with_check'
  END as with_check_resumo
FROM pg_policies 
WHERE tablename = 'lvs'
ORDER BY cmd, policyname;

-- 7. TESTE DE INSERT (comentado - descomente para testar)
-- ===================================================================
/*
-- Teste de INSERT (substitua pelo ID de um usuário real)
INSERT INTO lvs (
  tipo_lv,
  nome_lv,
  usuario_id,
  usuario_nome,
  usuario_email,
  data_inspecao,
  area,
  responsavel_tecnico,
  inspetor_principal,
  status
) VALUES (
  '01',
  'Resíduos Teste',
  'ID_DO_USUARIO_AQUI', -- Substitua pelo ID real
  'Usuário Teste',
  'teste@teste.com',
  CURRENT_DATE,
  'Área Teste',
  'Responsável Teste',
  'Inspetor Teste',
  'concluido'
);
*/

-- 8. LOG DE CONCLUSÃO
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas de INSERT corrigidas para tabela lvs';
  RAISE NOTICE '✅ Usuários podem inserir apenas suas próprias LVs';
  RAISE NOTICE '✅ Administradores podem inserir qualquer LV';
  RAISE NOTICE '✅ Teste o sistema agora';
END $$; 