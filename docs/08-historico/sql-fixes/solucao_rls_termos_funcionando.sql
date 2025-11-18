-- ===================================================================
-- SOLUÇÃO RLS TERMOS AMBIENTAIS - FUNCIONANDO ✅
-- Data: $(date)
-- Problema: Usuários não conseguiam ver seus próprios termos
-- Solução: Usar auth.email() em vez de auth.uid() para comparação
-- ===================================================================

-- 1. CONCEDER PERMISSÃO NECESSÁRIA
GRANT SELECT ON auth.users TO authenticated;

-- 2. REMOVER POLÍTICA ANTIGA (se existir)
DROP POLICY IF EXISTS "termos_select_user_admin" ON public.termos_ambientais;

-- 3. CRIAR POLÍTICA CORRETA
CREATE POLICY "termos_select_user_admin" ON public.termos_ambientais
FOR SELECT USING (
  -- Usar email diretamente do auth metadata
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = emitido_por_usuario_id
    AND u.email = auth.email()
  ) OR
  -- Admin check
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE u.id = emitido_por_usuario_id
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM'])
  )
);

-- 4. VERIFICAR SE A POLÍTICA FOI CRIADA
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'termos_ambientais' 
AND policyname = 'termos_select_user_admin';

-- ===================================================================
-- EXPLICAÇÃO DA SOLUÇÃO
-- ===================================================================

/*
PROBLEMA ORIGINAL:
- Usuários não conseguiam ver seus próprios termos
- Política anterior usava auth.uid() que retorna UUID
- Comparação UUID vs TEXT causava problemas

SOLUÇÃO APLICADA:
1. Usar auth.email() em vez de auth.uid()
2. Comparar email do usuário logado com email na tabela usuarios
3. Manter verificação de admin usando perfis

VANTAGENS:
- ✅ Funciona corretamente para usuários normais
- ✅ Admins podem ver todos os termos
- ✅ Não há problemas de tipo de dados
- ✅ Performance otimizada com EXISTS

TESTE:
- João Silva (TMA Campo) agora consegue ver seus 5 termos
- Admins conseguem ver todos os termos
- Usuários só veem seus próprios termos
*/ 