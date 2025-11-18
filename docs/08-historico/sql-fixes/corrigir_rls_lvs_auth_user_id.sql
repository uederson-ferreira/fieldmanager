-- ===================================================================
-- CORREÇÃO RLS PARA USAR auth_user_id AO INVÉS DE usuario_id
-- Data: 2025-11-06
-- Motivo: Política estava usando usuario_id (tabela usuarios) ao invés de auth_user_id (auth.users)
-- ===================================================================

-- 1. REMOVER POLÍTICAS ANTIGAS
-- ===================================================================
DROP POLICY IF EXISTS "allow_select_lvs" ON public.lvs;
DROP POLICY IF EXISTS "allow_insert_lvs" ON public.lvs;
DROP POLICY IF EXISTS "allow_update_lvs" ON public.lvs;
DROP POLICY IF EXISTS "allow_delete_lvs" ON public.lvs;

-- 2. CRIAR POLÍTICAS CORRETAS USANDO auth_user_id
-- ===================================================================

-- SELECT - Usuários autenticados podem ver suas próprias LVs
CREATE POLICY "allow_select_lvs" ON public.lvs
FOR SELECT TO authenticated
USING (auth_user_id = auth.uid());

-- INSERT - Usuários autenticados podem inserir suas próprias LVs
CREATE POLICY "allow_insert_lvs" ON public.lvs
FOR INSERT TO authenticated
WITH CHECK (auth_user_id = auth.uid());

-- UPDATE - Usuários autenticados podem atualizar suas próprias LVs
CREATE POLICY "allow_update_lvs" ON public.lvs
FOR UPDATE TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- DELETE - Usuários autenticados podem deletar suas próprias LVs
CREATE POLICY "allow_delete_lvs" ON public.lvs
FOR DELETE TO authenticated
USING (auth_user_id = auth.uid());

-- 3. ATUALIZAR POLÍTICAS DAS TABELAS RELACIONADAS
-- ===================================================================

-- Remover políticas antigas de lv_avaliacoes
DROP POLICY IF EXISTS "allow_select_avaliacoes" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "allow_insert_avaliacoes" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "allow_update_avaliacoes" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "allow_delete_avaliacoes" ON public.lv_avaliacoes;

-- SELECT - Avaliações
CREATE POLICY "allow_select_avaliacoes" ON public.lv_avaliacoes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- INSERT - Avaliações
CREATE POLICY "allow_insert_avaliacoes" ON public.lv_avaliacoes
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- UPDATE - Avaliações
CREATE POLICY "allow_update_avaliacoes" ON public.lv_avaliacoes
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- DELETE - Avaliações
CREATE POLICY "allow_delete_avaliacoes" ON public.lv_avaliacoes
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_avaliacoes.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- Remover políticas antigas de lv_fotos
DROP POLICY IF EXISTS "allow_select_fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "allow_insert_fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "allow_update_fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "allow_delete_fotos" ON public.lv_fotos;

-- SELECT - Fotos
CREATE POLICY "allow_select_fotos" ON public.lv_fotos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- INSERT - Fotos
CREATE POLICY "allow_insert_fotos" ON public.lv_fotos
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- UPDATE - Fotos
CREATE POLICY "allow_update_fotos" ON public.lv_fotos
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- DELETE - Fotos
CREATE POLICY "allow_delete_fotos" ON public.lv_fotos
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lvs
    WHERE lvs.id = lv_fotos.lv_id
    AND lvs.auth_user_id = auth.uid()
  )
);

-- 4. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================
SELECT
  '✅ POLÍTICAS ATUALIZADAS' as status,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename, cmd, policyname;
