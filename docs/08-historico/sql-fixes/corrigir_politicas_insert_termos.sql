-- ===================================================================
-- CORRIGIR POLÍTICAS INSERT TERMOS AMBIENTAIS
-- ===================================================================

-- 1. REMOVER POLÍTICAS INSERT PROBLEMÁTICAS
DROP POLICY IF EXISTS "termos_insert_user" ON termos_ambientais;
DROP POLICY IF EXISTS "termos_insert_user_debug" ON termos_ambientais;

-- 2. CRIAR POLÍTICA INSERT CORRETA
CREATE POLICY "termos_insert_user" ON termos_ambientais
FOR INSERT WITH CHECK (emitido_por_usuario_id = auth.uid()::uuid);

-- 3. VERIFICAR POLÍTICA INSERT
SELECT 
  'POLÍTICA INSERT CORRIGIDA' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
AND cmd = 'INSERT';

-- 4. TESTAR INSERÇÃO COM O JOÃO
DO $$
DECLARE
  current_user_id text := 'abb0e395-64aa-438c-94d6-1bf4c43f151a';
  test_termo_id uuid;
BEGIN
  RAISE NOTICE '🧪 Testando inserção com política corrigida...';
  RAISE NOTICE '👤 Usuário: %', current_user_id;
  
  -- Tentar inserir um termo de teste
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
    'TEST-INSERT-001/2025',
    CURRENT_DATE,
    CURRENT_TIME,
    'Teste Inserção',
    'Projeto Teste',
    'Fase Teste',
    'João Silva',
    'Destinatário Teste',
    'Área Teste',
    'OCORRENCIA_REAL',
    'PENDENTE',
    NOW()
  ) RETURNING id INTO test_termo_id;
  
  RAISE NOTICE '✅ Termo inserido com sucesso: %', test_termo_id;
  
  -- Limpar termo de teste
  DELETE FROM termos_ambientais WHERE id = test_termo_id;
  RAISE NOTICE '🧹 Termo de teste removido';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro na inserção: %', SQLERRM;
END $$; 