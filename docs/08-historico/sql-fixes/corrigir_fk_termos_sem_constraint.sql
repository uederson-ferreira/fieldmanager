-- ===================================================================
-- CORRIGIR FK TERMOS SEM CONSTRAINT - ECOFIELD
-- Localização: sql/corrigir_fk_termos_sem_constraint.sql
-- ===================================================================

-- Este script corrige o problema da FK sem constraint única

-- ===================================================================
-- 1. VERIFICAR CONSTRAINT ATUAL
-- ===================================================================

SELECT 
  'CONSTRAINT ATUAL' as info,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'usuarios'
AND kcu.column_name = 'auth_user_id';

-- ===================================================================
-- 2. VERIFICAR SE AUTH_USER_ID É ÚNICO
-- ===================================================================

SELECT 
  'VERIFICAÇÃO UNICIDADE' as info,
  COUNT(*) as total_usuarios,
  COUNT(DISTINCT auth_user_id) as auth_ids_unicos,
  CASE 
    WHEN COUNT(*) = COUNT(DISTINCT auth_user_id) THEN '✅ ÚNICO'
    ELSE '❌ DUPLICADO'
  END as status
FROM usuarios
WHERE auth_user_id IS NOT NULL;

-- ===================================================================
-- 3. VERIFICAR DADOS DUPLICADOS (SE HOUVER)
-- ===================================================================

SELECT 
  'DADOS DUPLICADOS' as info,
  auth_user_id,
  COUNT(*) as quantidade
FROM usuarios
WHERE auth_user_id IS NOT NULL
GROUP BY auth_user_id
HAVING COUNT(*) > 1;

-- ===================================================================
-- 4. ADICIONAR CONSTRAINT ÚNICA
-- ===================================================================

-- Adicionar constraint única para auth_user_id
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_auth_user_id_unique 
UNIQUE (auth_user_id);

-- ===================================================================
-- 5. VERIFICAR CONSTRAINT CRIADA
-- ===================================================================

SELECT 
  'CONSTRAINT CRIADA' as info,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'usuarios'
AND kcu.column_name = 'auth_user_id';

-- ===================================================================
-- 6. CORRIGIR FK
-- ===================================================================

-- Remover FK atual (se existir)
ALTER TABLE termos_ambientais DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- Adicionar nova FK que referencia auth_user_id
ALTER TABLE termos_ambientais 
ADD CONSTRAINT termos_ambientais_emitido_por_usuario_id_fkey 
FOREIGN KEY (emitido_por_usuario_id) 
REFERENCES usuarios(auth_user_id);

-- ===================================================================
-- 7. VERIFICAR FK CRIADA
-- ===================================================================

SELECT 
  'FK CRIADA' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'termos_ambientais'
AND kcu.column_name = 'emitido_por_usuario_id';

-- ===================================================================
-- 8. TESTAR INSERÇÃO
-- ===================================================================

-- Tentar inserir um termo de teste
INSERT INTO termos_ambientais (
  tipo_termo,
  numero_termo,
  data_termo,
  hora_termo,
  emitido_por_usuario_id,
  emitido_por_nome,
  destinatario_nome,
  local_atividade,
  area_equipamento_atividade,
  natureza_desvio,
  projeto_ba,
  fase_etapa_obra,
  atividade_especifica,
  observacoes,
  status,
  created_at,
  updated_at
) VALUES (
  'NOTIFICACAO',
  '2025-NT-TESTE-004',
  CURRENT_DATE,
  CURRENT_TIME,
  '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028',
  'João Silva',
  'Teste de Inserção',
  'Local de Teste',
  'Área de Teste',
  'OCORRENCIA_REAL',
  'Projeto Teste',
  'Fase Teste',
  'Atividade de teste para verificar FK',
  'Teste de inserção via SQL',
  'PENDENTE',
  NOW(),
  NOW()
) RETURNING id, numero_termo, created_at; 