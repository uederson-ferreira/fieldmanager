-- ===================================================================
-- CORREÇÃO RLS TERMOS_AMBIENTAIS - ECOFIELD SYSTEM
-- ===================================================================

-- PROBLEMA: TMA está vendo todos os termos de todos os usuários
-- SOLUÇÃO: Aplicar RLS para filtrar por emitido_por_usuario_id

-- ===================================================================
-- 1. VERIFICAR POLÍTICAS ATUAIS
-- ===================================================================

SELECT 
    'POLÍTICAS ATUAIS' as status,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY policyname;

-- ===================================================================
-- 2. VERIFICAR SE RLS ESTÁ ATIVO
-- ===================================================================

SELECT 
    'RLS STATUS' as status,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE tablename = 'termos_ambientais';

-- ===================================================================
-- 3. REMOVER POLÍTICAS EXISTENTES
-- ===================================================================

DROP POLICY IF EXISTS "Admin pode gerenciar termos" ON termos_ambientais;
DROP POLICY IF EXISTS "TMA pode ver seus termos" ON termos_ambientais;
DROP POLICY IF EXISTS "Política funcional para termos_ambientais" ON termos_ambientais;
DROP POLICY IF EXISTS "Política temporária para admin" ON termos_ambientais;
DROP POLICY IF EXISTS "Política simples por email" ON termos_ambientais;
DROP POLICY IF EXISTS "Política permissiva para desenvolvimento" ON termos_ambientais;
DROP POLICY IF EXISTS "Acesso completo para usuários autenticados" ON termos_ambientais;

-- ===================================================================
-- 4. ATIVAR RLS
-- ===================================================================

ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 5. CRIAR POLÍTICAS CORRETAS
-- ===================================================================

-- Política para SELECT (visualização) - Usuário vê apenas seus próprios termos
CREATE POLICY "Visualização termos por usuário" ON termos_ambientais
  FOR SELECT USING (
    emitido_por_usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Política para INSERT (criação) - Usuário pode criar apenas seus próprios termos
CREATE POLICY "Criação termos por usuário" ON termos_ambientais
  FOR INSERT WITH CHECK (
    emitido_por_usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Política para UPDATE (atualização) - Usuário pode atualizar apenas seus próprios termos
CREATE POLICY "Atualização termos por usuário" ON termos_ambientais
  FOR UPDATE USING (
    emitido_por_usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Política para DELETE (exclusão) - Apenas admin pode excluir
CREATE POLICY "Exclusão termos apenas admin" ON termos_ambientais
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- ===================================================================
-- 6. VERIFICAR POLÍTICAS APLICADAS
-- ===================================================================

SELECT 
    'POLÍTICAS APLICADAS' as status,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY policyname;

-- ===================================================================
-- 7. VERIFICAR DADOS EXISTENTES
-- ===================================================================

SELECT 
    'DADOS EXISTENTES' as info,
    COUNT(*) as total_termos,
    COUNT(DISTINCT emitido_por_usuario_id) as usuarios_diferentes
FROM termos_ambientais;

-- Listar termos por usuário
SELECT 
    'TERMOS POR USUÁRIO' as info,
    emitido_por_usuario_id,
    emitido_por_nome,
    COUNT(*) as total_termos
FROM termos_ambientais
GROUP BY emitido_por_usuario_id, emitido_por_nome
ORDER BY total_termos DESC;

-- ===================================================================
-- 8. TESTE DE FUNCIONAMENTO
-- ===================================================================

-- Verificar se há termos sem emitido_por_usuario_id
SELECT 
    'TERMOS SEM USUÁRIO' as info,
    COUNT(*) as total_sem_usuario
FROM termos_ambientais
WHERE emitido_por_usuario_id IS NULL;

-- Verificar usuários que emitiram termos
SELECT 
    'USUÁRIOS COM TERMOS' as info,
    u.id,
    u.nome,
    u.email,
    COUNT(ta.id) as total_termos
FROM usuarios u
LEFT JOIN termos_ambientais ta ON u.id = ta.emitido_por_usuario_id
WHERE ta.id IS NOT NULL
GROUP BY u.id, u.nome, u.email
ORDER BY total_termos DESC;

-- ===================================================================
-- 9. CORREÇÃO DE DADOS (SE NECESSÁRIO)
-- ===================================================================

-- Se houver termos sem emitido_por_usuario_id, atribuir ao primeiro usuário TMA
-- (DESCOMENTAR APENAS SE NECESSÁRIO)

/*
UPDATE termos_ambientais 
SET emitido_por_usuario_id = (
    SELECT u.id 
    FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE p.nome = 'tma' 
    LIMIT 1
)
WHERE emitido_por_usuario_id IS NULL;
*/

-- ===================================================================
-- 10. VERIFICAÇÃO FINAL
-- ===================================================================

-- Verificar se RLS está ativo
SELECT 
    'RLS STATUS FINAL' as status,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE tablename = 'termos_ambientais';

-- Verificar se todas as políticas estão ativas
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    COUNT(*) as total_policies,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies 
WHERE tablename = 'termos_ambientais';

-- ===================================================================
-- INSTRUÇÕES PARA O FRONTEND
-- ===================================================================

/*
PROBLEMA IDENTIFICADO: TMA está vendo todos os termos de todos os usuários

SOLUÇÃO APLICADA:
1. ✅ RLS ativado na tabela termos_ambientais
2. ✅ Políticas RLS criadas para filtrar por emitido_por_usuario_id
3. ✅ Frontend modificado para passar o usuário como prop
4. ✅ Funções getTermos e getEstatisticas filtram por usuário
5. ✅ Componente ListaTermos recebe usuário como prop

TESTE NO FRONTEND:
1. Execute este script SQL no Supabase
2. Faça login com diferentes usuários TMA
3. Verifique se cada usuário vê apenas seus próprios termos
4. Verifique se as estatísticas são específicas por usuário

SEGURANÇA:
- Cada TMA vê apenas seus próprios termos
- Admins podem ver todos os termos
- Políticas RLS garantem segurança no nível do banco
- Frontend também filtra por usuário como camada adicional
*/ 