-- ===================================================================
-- LIMPAR E RECRIAR RLS NA TABELA TERMOS_FOTOS
-- ===================================================================

-- 1. HABILITAR RLS
-- ===================================================================
ALTER TABLE public.termos_fotos ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ===================================================================
DROP POLICY IF EXISTS "Users can delete their own term photos" ON public.termos_fotos;
DROP POLICY IF EXISTS "Users can insert photos to their terms" ON public.termos_fotos;
DROP POLICY IF EXISTS "Users can update their own term photos" ON public.termos_fotos;
DROP POLICY IF EXISTS "Usuário pode ver fotos dos seus próprios termos" ON public.termos_fotos;
DROP POLICY IF EXISTS "Usuários podem atualizar fotos de seus termos" ON public.termos_fotos;
DROP POLICY IF EXISTS "Usuários podem deletar fotos de seus termos" ON public.termos_fotos;
DROP POLICY IF EXISTS "Usuários podem inserir fotos em seus termos" ON public.termos_fotos;
DROP POLICY IF EXISTS "Usuários podem ver fotos de seus termos" ON public.termos_fotos;
DROP POLICY IF EXISTS "termos_fotos_delete_all" ON public.termos_fotos;
DROP POLICY IF EXISTS "termos_fotos_insert_all" ON public.termos_fotos;
DROP POLICY IF EXISTS "termos_fotos_select_all" ON public.termos_fotos;
DROP POLICY IF EXISTS "termos_fotos_update_all" ON public.termos_fotos;

-- 3. CRIAR APENAS AS POLÍTICAS NECESSÁRIAS
-- ===================================================================

-- SELECT - Usuários podem ver fotos de seus termos
CREATE POLICY "termos_fotos_select_user" ON public.termos_fotos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = termos_fotos.termo_id
    AND termos_ambientais.emitido_por_usuario_id = auth.uid()
  )
);

-- INSERT - Usuários podem inserir fotos em seus termos
CREATE POLICY "termos_fotos_insert_user" ON public.termos_fotos
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = termos_fotos.termo_id
    AND termos_ambientais.emitido_por_usuario_id = auth.uid()
  )
);

-- UPDATE - Usuários podem atualizar fotos de seus termos
CREATE POLICY "termos_fotos_update_user" ON public.termos_fotos
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = termos_fotos.termo_id
    AND termos_ambientais.emitido_por_usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = termos_fotos.termo_id
    AND termos_ambientais.emitido_por_usuario_id = auth.uid()
  )
);

-- DELETE - Usuários podem deletar fotos de seus termos
CREATE POLICY "termos_fotos_delete_user" ON public.termos_fotos
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.termos_ambientais
    WHERE termos_ambientais.id = termos_fotos.termo_id
    AND termos_ambientais.emitido_por_usuario_id = auth.uid()
  )
);

-- 4. VERIFICAR CONFIGURAÇÃO FINAL
-- ===================================================================
SELECT 
  'RLS STATUS' as tipo,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ HABILITADO'
    ELSE '❌ DESABILITADO'
  END as status
FROM pg_tables 
WHERE tablename = 'termos_fotos';

SELECT 
  'POLÍTICAS FINAIS' as tipo,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'termos_fotos'
ORDER BY cmd, policyname;

-- 5. TESTE DE INSERÇÃO (OPCIONAL - DESCOMENTE PARA TESTAR)
-- ===================================================================
/*
-- Primeiro, pegar um termo_id válido do usuário atual
DO $$
DECLARE
  termo_id_test uuid;
BEGIN
  SELECT id INTO termo_id_test 
  FROM public.termos_ambientais 
  WHERE emitido_por_usuario_id = auth.uid() 
  LIMIT 1;
  
  IF termo_id_test IS NOT NULL THEN
    RAISE NOTICE 'Testando inserção com termo_id: %', termo_id_test;
    
    INSERT INTO public.termos_fotos (
      termo_id,
      nome_arquivo,
      url_arquivo,
      tamanho_bytes,
      tipo_mime,
      categoria,
      descricao
    ) VALUES (
      termo_id_test,
      'teste_rls.jpg',
      'https://exemplo.com/teste.jpg',
      1024,
      'image/jpeg',
      'geral',
      'Teste de RLS'
    );
    
    RAISE NOTICE '✅ Inserção de teste realizada com sucesso';
    
    -- Limpar o teste
    DELETE FROM public.termos_fotos WHERE nome_arquivo = 'teste_rls.jpg';
    RAISE NOTICE '✅ Teste limpo';
  ELSE
    RAISE NOTICE '❌ Nenhum termo encontrado para o usuário atual';
  END IF;
END $$;
*/

-- 6. LOG DE CONCLUSÃO
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Todas as políticas antigas foram removidas';
  RAISE NOTICE '✅ Novas políticas RLS criadas com nomes únicos';
  RAISE NOTICE '✅ RLS configurado corretamente na tabela termos_fotos';
  RAISE NOTICE '✅ Usuários podem gerenciar fotos de seus próprios termos';
  RAISE NOTICE '✅ Teste o salvamento de fotos agora';
END $$; 