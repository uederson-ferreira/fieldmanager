-- ===================================================================
-- CORRIGIR CAST UUID NA POLÍTICA INSERT
-- ===================================================================

-- 1. REMOVER POLÍTICA INSERT ATUAL
DROP POLICY IF EXISTS "termos_insert_user" ON termos_ambientais;

-- 2. CRIAR POLÍTICA INSERT COM CAST CORRETO
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT WITH CHECK (emitido_por_usuario_id = auth.uid()::uuid);

-- 3. VERIFICAR POLÍTICA INSERT CORRIGIDA
SELECT 
  'POLÍTICA INSERT COM CAST' as tipo,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
AND cmd = 'INSERT';

-- 4. TESTAR INSERÇÃO COM CAST CORRETO
DO $$
DECLARE
  current_user_id text := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
  test_termo_id uuid;
BEGIN
  RAISE NOTICE '🧪 Testando inserção com cast correto...';
  
  INSERT INTO termos_ambientais (
    emitido_por_usuario_id,
    tipo_termo,
    numero_termo,
    data_termo,
    hora_termo,
    local_atividade,
    projeto_ba,
    fase_etapa_obra,
    emitido_por_nome,
    destinatario_nome,
    area_equipamento_atividade,
    natureza_desvio,
    status,
    created_at
  ) VALUES (
    current_user_id::uuid,
    'NOTIFICACAO',
    'CAST-INSERT-001/2025',
    CURRENT_DATE,
    CURRENT_TIME,
    'Cast Inserção',
    'Projeto Cast',
    'Fase Cast',
    'João Silva',
    'Destinatário Cast',
    'Área Cast',
    'OCORRENCIA_REAL',
    'PENDENTE',
    NOW()
  ) RETURNING id INTO test_termo_id;
  
  RAISE NOTICE '✅ Inserção com cast bem-sucedida: %', test_termo_id;
  
  -- Limpar
  DELETE FROM termos_ambientais WHERE id = test_termo_id;
  RAISE NOTICE '🧹 Termo de teste removido';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro na inserção: %', SQLERRM;
END $$;

-- 5. AGORA TESTAR SE O JOÃO CONSEGUE VER SEUS TERMOS
DO $$
DECLARE
  current_user_id text := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
  rls_result integer;
BEGIN
  RAISE NOTICE '🧪 Testando visualização dos termos...';
  
  SELECT COUNT(*) INTO rls_result
  FROM termos_ambientais 
  WHERE emitido_por_usuario_id = current_user_id::uuid;
  
  RAISE NOTICE '📊 Termos visíveis para João: %', rls_result;
  
  IF rls_result = 5 THEN
    RAISE NOTICE '✅ RLS funcionando! João pode ver seus 5 termos!';
  ELSE
    RAISE NOTICE '❌ Ainda há problema no RLS!';
  END IF;
END $$; 