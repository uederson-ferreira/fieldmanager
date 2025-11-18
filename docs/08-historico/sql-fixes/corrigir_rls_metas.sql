-- ===================================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA SISTEMA DE METAS
-- ===================================================================

-- Corrigir políticas para incluir perfil 'ADM'

-- Políticas para metas
DROP POLICY IF EXISTS "Admin pode gerenciar metas" ON metas;
CREATE POLICY "Admin pode gerenciar metas" ON metas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode visualizar metas" ON metas;
CREATE POLICY "TMA pode visualizar metas" ON metas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('tma', 'admin', 'developer', 'ADM')
    )
  );

-- Políticas para metas_atribuicoes
DROP POLICY IF EXISTS "Admin pode gerenciar atribuições" ON metas_atribuicoes;
CREATE POLICY "Admin pode gerenciar atribuições" ON metas_atribuicoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode ver suas atribuições" ON metas_atribuicoes;
CREATE POLICY "TMA pode ver suas atribuições" ON metas_atribuicoes
  FOR SELECT USING (
    tma_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Políticas para progresso_metas
DROP POLICY IF EXISTS "Admin pode gerenciar progresso" ON progresso_metas;
CREATE POLICY "Admin pode gerenciar progresso" ON progresso_metas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode ver seu progresso" ON progresso_metas;
CREATE POLICY "TMA pode ver seu progresso" ON progresso_metas
  FOR SELECT USING (
    tma_id = auth.uid() OR
    tma_id IS NULL OR -- Progresso da equipe
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Políticas para configuracoes_metas
DROP POLICY IF EXISTS "Admin pode gerenciar configurações" ON configuracoes_metas;
CREATE POLICY "Admin pode gerenciar configurações" ON configuracoes_metas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

DROP POLICY IF EXISTS "TMA pode visualizar configurações" ON configuracoes_metas;
CREATE POLICY "TMA pode visualizar configurações" ON configuracoes_metas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('tma', 'admin', 'developer', 'ADM')
    )
  );

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('metas', 'metas_atribuicoes', 'progresso_metas', 'configuracoes_metas')
ORDER BY tablename, policyname; 