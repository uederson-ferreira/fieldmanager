-- ===================================================================
-- CORREÇÃO FINAL DE RLS PARA TABELAS DE LVs
-- ===================================================================

-- FASE 1: HABILITAR RLS NAS TABELAS
-- ===================================================================

-- Habilitar RLS na tabela lv_avaliacoes
ALTER TABLE public.lv_avaliacoes ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela lv_fotos  
ALTER TABLE public.lv_fotos ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- FASE 2: REMOVER POLÍTICAS DUPLICADAS
-- ===================================================================

-- Remover políticas duplicadas de lv_avaliacoes
DROP POLICY IF EXISTS "Usuários podem ver avaliações de suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Usuários podem inserir avaliações em suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Usuários podem atualizar avaliações de suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Usuários podem deletar avaliações de suas LVs" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Admins podem ver todas as avaliações" ON public.lv_avaliacoes;
DROP POLICY IF EXISTS "Admins podem gerenciar todas as avaliações" ON public.lv_avaliacoes;

-- Remover políticas duplicadas de lv_fotos
DROP POLICY IF EXISTS "Usuários podem ver fotos de suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Usuários podem inserir fotos em suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Usuários podem atualizar fotos de suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Usuários podem deletar fotos de suas LVs" ON public.lv_fotos;
DROP POLICY IF EXISTS "Admins podem ver todas as fotos" ON public.lv_fotos;
DROP POLICY IF EXISTS "Admins podem gerenciar todas as fotos" ON public.lv_fotos;

-- ===================================================================
-- FASE 3: CRIAR POLÍTICAS CORRETAS PARA lv_avaliacoes
-- ===================================================================

-- Política para SELECT (visualização)
CREATE POLICY "Usuários podem ver avaliações de suas LVs" ON public.lv_avaliacoes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_avaliacoes.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem inserir avaliações em suas LVs" ON public.lv_avaliacoes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_avaliacoes.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar avaliações de suas LVs" ON public.lv_avaliacoes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_avaliacoes.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem deletar avaliações de suas LVs" ON public.lv_avaliacoes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_avaliacoes.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- ===================================================================
-- FASE 4: CRIAR POLÍTICAS CORRETAS PARA lv_fotos
-- ===================================================================

-- Política para SELECT (visualização)
CREATE POLICY "Usuários podem ver fotos de suas LVs" ON public.lv_fotos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_fotos.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- Política para INSERT (inserção)
CREATE POLICY "Usuários podem inserir fotos em suas LVs" ON public.lv_fotos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_fotos.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- Política para UPDATE (atualização)
CREATE POLICY "Usuários podem atualizar fotos de suas LVs" ON public.lv_fotos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_fotos.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- Política para DELETE (exclusão)
CREATE POLICY "Usuários podem deletar fotos de suas LVs" ON public.lv_fotos
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM lvs 
    WHERE lvs.id = lv_fotos.lv_id 
    AND lvs.usuario_id = auth.uid()
  )
);

-- ===================================================================
-- FASE 5: POLÍTICAS ESPECIAIS PARA ADMINISTRADORES
-- ===================================================================

-- Política para administradores verem todas as avaliações
CREATE POLICY "Admins podem ver todas as avaliações" ON public.lv_avaliacoes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM'])
  )
);

-- Política para administradores gerenciarem todas as avaliações
CREATE POLICY "Admins podem gerenciar todas as avaliações" ON public.lv_avaliacoes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM'])
  )
);

-- Política para administradores verem todas as fotos
CREATE POLICY "Admins podem ver todas as fotos" ON public.lv_fotos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM'])
  )
);

-- Política para administradores gerenciarem todas as fotos
CREATE POLICY "Admins podem gerenciar todas as fotos" ON public.lv_fotos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM'])
  )
);

-- ===================================================================
-- FASE 6: VERIFICAÇÃO FINAL
-- ===================================================================

-- Verificar se RLS está habilitado
SELECT 
  'STATUS RLS' as tipo,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
  'POLÍTICAS CRIADAS' as tipo,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('lvs', 'lv_avaliacoes', 'lv_fotos')
ORDER BY tablename, cmd, policyname;

-- ===================================================================
-- FASE 7: LOG DE CONCLUSÃO
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS habilitado com sucesso nas tabelas lv_avaliacoes e lv_fotos';
  RAISE NOTICE '✅ Políticas criadas para usuários e administradores';
  RAISE NOTICE '✅ Usuários só podem acessar dados de suas próprias LVs';
  RAISE NOTICE '✅ Administradores podem acessar todos os dados';
END $$; 