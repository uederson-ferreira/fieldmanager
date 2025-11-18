-- ===================================================================
-- CORRIGIR FOREIGN KEY CONSTRAINT EM termos_ambientais
-- ===================================================================

-- 1. Verificar a constraint atual
SELECT 
  'FK Constraint Atual' as info,
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table,
  a.attname as column_name,
  af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f' 
  AND conrelid::regclass::text = 'termos_ambientais'
  AND a.attname = 'emitido_por_usuario_id';

-- 2. Verificar dados existentes que podem causar problema
SELECT 
  'Dados existentes em termos_ambientais' as info,
  COUNT(*) as total_termos,
  COUNT(DISTINCT emitido_por_usuario_id) as usuarios_distintos
FROM termos_ambientais 
WHERE emitido_por_usuario_id IS NOT NULL;

-- 3. Verificar qual tipo de ID temos nos dados
SELECT 
  'Análise dos IDs' as info,
  emitido_por_usuario_id,
  LENGTH(emitido_por_usuario_id::text) as tamanho_id,
  CASE 
    WHEN EXISTS (SELECT 1 FROM usuarios WHERE id = emitido_por_usuario_id) THEN 'É usuarios.id'
    WHEN EXISTS (SELECT 1 FROM usuarios WHERE auth_user_id = emitido_por_usuario_id) THEN 'É usuarios.auth_user_id'
    ELSE 'Não encontrado'
  END as tipo_id
FROM termos_ambientais 
WHERE emitido_por_usuario_id IS NOT NULL
GROUP BY emitido_por_usuario_id
LIMIT 10;

-- 4. Remover a FK constraint incorreta
ALTER TABLE termos_ambientais 
DROP CONSTRAINT IF EXISTS termos_ambientais_emitido_por_usuario_id_fkey;

-- 5. Corrigir dados existentes se necessário
-- Se os dados estão como auth_user_id, converter para usuarios.id
UPDATE termos_ambientais 
SET emitido_por_usuario_id = (
  SELECT id 
  FROM usuarios 
  WHERE auth_user_id = termos_ambientais.emitido_por_usuario_id
)
WHERE emitido_por_usuario_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM usuarios WHERE id = termos_ambientais.emitido_por_usuario_id
  );

-- 6. Criar FK constraint CORRETA (referenciando usuarios.id)
ALTER TABLE termos_ambientais 
ADD CONSTRAINT termos_ambientais_emitido_por_usuario_id_fkey 
FOREIGN KEY (emitido_por_usuario_id) 
REFERENCES usuarios(id);

-- 7. Verificar se a correção funcionou
SELECT 
  'Verificação pós-correção' as info,
  t.emitido_por_usuario_id,
  u.id as usuario_id,
  u.auth_user_id,
  u.nome,
  COUNT(*) as quantidade_termos
FROM termos_ambientais t
JOIN usuarios u ON t.emitido_por_usuario_id = u.id
GROUP BY t.emitido_por_usuario_id, u.id, u.auth_user_id, u.nome
ORDER BY quantidade_termos DESC;

-- 8. Verificar nova constraint
SELECT 
  'Nova FK Constraint' as info,
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table,
  a.attname as column_name,
  af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE c.contype = 'f' 
  AND conrelid::regclass::text = 'termos_ambientais'
  AND a.attname = 'emitido_por_usuario_id';

-- 9. TESTE: Agora deve funcionar com usuarios.id
INSERT INTO termos_ambientais (
    id,
    numero_termo,
    data_termo,
    tipo_termo,
    emitido_por_usuario_id,
    emitido_por_nome,
    destinatario_nome,
    local_atividade,
    area_equipamento_atividade,
    natureza_desvio,
    descricao_nc_1,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'TESTE-FK-CORRIGIDA-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS'),
    CURRENT_DATE,
    'NOTIFICACAO',
    '2d7f480e-e42d-4b80-be70-97a4123fca09', -- João Silva usuarios.id
    'João Silva',
    'Responsável Teste',
    'Local de Teste FK Corrigida',
    'Área de Teste FK',
    'OCORRENCIA_REAL',
    'Teste com FK corrigida - deve funcionar agora',
    NOW(),
    NOW()
);

-- 10. Verificar se o trigger funcionou
SELECT 
    '🎯 TESTE TRIGGER PÓS-CORREÇÃO FK' as resultado,
    pm.id,
    pm.meta_id,
    pm.tma_id,
    pm.auth_user_id,
    pm.quantidade_atual,
    pm.percentual_atual,
    u.nome,
    m.descricao as meta_descricao,
    CASE 
        WHEN pm.auth_user_id IS NOT NULL THEN '✅ auth_user_id POPULADO'
        ELSE '❌ auth_user_id NÃO POPULADO'
    END as status_auth_id,
    CASE 
        WHEN pm.auth_user_id = u.auth_user_id THEN '✅ IDs COINCIDEM'
        ELSE '❌ IDs NÃO COINCIDEM'  
    END as verificacao_ids
FROM progresso_metas pm
JOIN usuarios u ON pm.tma_id = u.id
JOIN metas m ON pm.meta_id = m.id
WHERE u.nome LIKE '%João%'
  AND pm.updated_at >= NOW() - INTERVAL '5 minutes'
ORDER BY pm.updated_at DESC
LIMIT 3; 