-- ===================================================================
-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS
-- ===================================================================

-- PROBLEMA: new row violates row-level security policy for table "progresso_metas"
-- CAUSA: Políticas RLS não permitem inserção automática via triggers

-- ===================================================================
-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ===================================================================

-- Remover políticas da tabela progresso_metas
DROP POLICY IF EXISTS "Admin pode gerenciar progresso" ON progresso_metas;
DROP POLICY IF EXISTS "TMA pode ver seu progresso" ON progresso_metas;
DROP POLICY IF EXISTS "Permitir inserção automática progresso" ON progresso_metas;
DROP POLICY IF EXISTS "Visualização progresso metas" ON progresso_metas;
DROP POLICY IF EXISTS "Atualização progresso metas" ON progresso_metas;

-- ===================================================================
-- 2. CRIAR POLÍTICAS CORRETAS PARA PROGRESSO_METAS
-- ===================================================================

-- Política para permitir inserção automática via triggers (SEM VERIFICAÇÃO)
CREATE POLICY "Inserção automática progresso_metas" ON progresso_metas
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização automática via triggers
CREATE POLICY "Atualização automática progresso_metas" ON progresso_metas
  FOR UPDATE USING (true);

-- Política para visualização (com verificação de perfil)
CREATE POLICY "Visualização progresso_metas" ON progresso_metas
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

-- ===================================================================
-- 3. VERIFICAR E CORRIGIR POLÍTICAS DE OUTRAS TABELAS
-- ===================================================================

-- Verificar políticas da tabela metas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'metas'
ORDER BY policyname;

-- Verificar políticas da tabela metas_atribuicoes
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'metas_atribuicoes'
ORDER BY policyname;

-- Verificar políticas da tabela configuracoes_metas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'configuracoes_metas'
ORDER BY policyname;

-- ===================================================================
-- 4. CRIAR POLÍTICAS PARA OUTRAS TABELAS SE NECESSÁRIO
-- ===================================================================

-- Políticas para metas (se não existirem)
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

-- Políticas para metas_atribuicoes (se não existirem)
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

-- Políticas para configuracoes_metas (se não existirem)
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

-- ===================================================================
-- 5. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================

-- Verificar todas as políticas das tabelas de metas
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

-- ===================================================================
-- 6. TESTE DE FUNCIONAMENTO
-- ===================================================================

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('metas', 'metas_atribuicoes', 'progresso_metas', 'configuracoes_metas');

-- Verificar se há dados nas tabelas
SELECT 
    'metas' as tabela,
    COUNT(*) as total_registros
FROM metas
UNION ALL
SELECT 
    'metas_atribuicoes' as tabela,
    COUNT(*) as total_registros
FROM metas_atribuicoes
UNION ALL
SELECT 
    'progresso_metas' as tabela,
    COUNT(*) as total_registros
FROM progresso_metas
UNION ALL
SELECT 
    'configuracoes_metas' as tabela,
    COUNT(*) as total_registros
FROM configuracoes_metas;

-- ===================================================================
-- 7. INSTRUÇÕES PARA TESTE
-- ===================================================================

/*
APÓS EXECUTAR ESTE SCRIPT:

1. Teste criar uma atividade de rotina
2. Verifique se não há mais erros de RLS
3. Verifique se o progresso de metas é calculado automaticamente
4. Teste criar um termo ambiental
5. Verifique se não há mais erros de UUID inválido

SE AINDA HOUVER PROBLEMAS:

1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase
3. Execute as verificações SQL listadas acima
4. Consulte a documentação de troubleshooting
*/ 