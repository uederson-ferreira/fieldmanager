-- ===================================================================
-- CORREÇÃO COMPLETA RLS PARA TABELAS LVs - SEGUINDO PADRÃO TERMOS_AMBIENTAIS
-- ===================================================================

-- 1. VERIFICAR STATUS ATUAL
-- ===================================================================
SELECT 
  'STATUS RLS ATUAL' as tipo,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename;

-- 2. HABILITAR RLS NAS TABELAS
-- ===================================================================
ALTER TABLE public.lvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lv_fotos ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER TODAS AS POLÍTICAS EXISTENTES (para evitar conflitos)
-- ===================================================================
-- Tabela lvs
DROP POLICY IF EXISTS "allow_select_lvs" ON public.lvs;
DROP POLICY IF EXISTS "allow_insert_lvs" ON public.lvs;
DROP POLICY IF EXISTS "allow_update_lvs" ON public.lvs;
DROP POLICY IF EXISTS "allow_delete_lvs" ON public.lvs;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias LVs" ON public.lvs;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias LVs" ON public.lvs;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias LVs" ON public.lvs;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias LVs" ON public.lvs;
DROP POLICY IF EXISTS "Admins podem ver todas as LVs" ON public.lvs;
DROP POLICY IF EXISTS "Admins podem gerenciar todas as LVs" ON public.lvs;

-- Tabela lv_avaliacoes
DROP POLICY IF EXISTS "allow_select_avaliacoes" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "allow_insert_avaliacoes" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "allow_update_avaliacoes" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "allow_delete_avaliacoes" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Usuários podem ver avaliações de suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Usuários podem inserir avaliações em suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Usuários podem atualizar avaliações de suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Usuários podem deletar avaliações de suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Admins podem ver todas as avaliações" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Admins podem gerenciar todas as avaliações" ON public.lv_avaliacoes;

-- Tabela lv_fotos
DROP POLICY IF EXISTS "allow_select_fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "allow_insert_fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "allow_update_fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "allow_delete_fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "Usuários podem ver fotos de suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Usuários podem inserir fotos em suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Usuários podem atualizar fotos de suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Usuários podem deletar fotos de suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Admins podem ver todas as fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "Admins podem gerenciar todas as fotos" ON public.lv_fotos;

-- 4. CRIAR POLÍTICAS PARA TABELA lvs (SEGUINDO PADRÃO TERMOS_AMBIENTAIS)
-- ===================================================================

-- SELECT - Usuários autenticados podem ver suas próprias LVs
CREATE POLICY "allow_select_lvs" ON public.lvs
FOR SELECT TO authenticated
USING (usuario_id = auth.uid());

-- INSERT - Usuários autenticados podem inserir suas próprias LVs
CREATE POLICY "allow_insert_lvs" ON public.lvs
FOR INSERT TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- UPDATE - Usuários autenticados podem atualizar suas próprias LVs
CREATE POLICY "allow_update_lvs" ON public.lvs
FOR UPDATE TO authenticated
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

-- DELETE - Usuários autenticados podem deletar suas próprias LVs
CREATE POLICY "allow_delete_lvs" ON public.lvs
FOR DELETE TO authenticated
USING (usuario_id = auth.uid());

-- 5. CRIAR POLÍTICAS PARA TABELA lv_avaliacoes
-- ===================================================================

-- SELECT - Usuários autenticados podem ver avaliações de suas LVs
CREATE POLICY "allow_select_avaliacoes" ON public.lv_avaliacoes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- INSERT - Usuários autenticados podem inserir avaliações em suas LVs
CREATE POLICY "allow_insert_avaliacoes" ON public.lv_avaliacoes
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- UPDATE - Usuários autenticados podem atualizar avaliações de suas LVs
CREATE POLICY "allow_update_avaliacoes" ON public.lv_avaliacoes
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- DELETE - Usuários autenticados podem deletar avaliações de suas LVs
CREATE POLICY "allow_delete_avaliacoes" ON public.lv_avaliacoes
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- 6. CRIAR POLÍTICAS PARA TABELA lv_fotos
-- ===================================================================

-- SELECT - Usuários autenticados podem ver fotos de suas LVs
CREATE POLICY "allow_select_fotos" ON public.lv_fotos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- INSERT - Usuários autenticados podem inserir fotos em suas LVs
CREATE POLICY "allow_insert_fotos" ON public.lv_fotos
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- UPDATE - Usuários autenticados podem atualizar fotos de suas LVs
CREATE POLICY "allow_update_fotos" ON public.lv_fotos
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- DELETE - Usuários autenticados podem deletar fotos de suas LVs
CREATE POLICY "allow_delete_fotos" ON public.lv_fotos
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.usuario_id = auth.uid()
  )
);

-- 7. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================
SELECT 
  'POLÍTICAS FINAIS' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
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
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename, cmd, policyname;

-- 8. VERIFICAR STATUS RLS FINAL
-- ===================================================================
SELECT 
  'STATUS RLS FINAL' as tipo,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename;

-- 9. LOG DE CONCLUSÃO
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS habilitado em todas as tabelas LVs';
  RAISE NOTICE '✅ Políticas criadas seguindo padrão termos_ambientais';
  RAISE NOTICE '✅ Usuários autenticados podem gerenciar apenas suas próprias LVs';
  RAISE NOTICE '✅ Teste o sistema agora';
END $$; 