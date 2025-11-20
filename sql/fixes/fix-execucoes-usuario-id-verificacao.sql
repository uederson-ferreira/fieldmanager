-- ===================================================================
-- VERIFICAÇÃO: Verificar execuções com usuario_id inconsistente
-- Execute este script ANTES do fix para ver o que será corrigido
-- ===================================================================

-- 1. Verificar execuções que têm auth_user_id em vez de usuarios.id
SELECT 
  e.id,
  e.numero_documento,
  e.usuario_id as usuario_id_na_execucao,
  e.created_at,
  u.id as usuarios_id_correto,
  u.auth_user_id,
  u.nome as usuario_nome,
  CASE 
    WHEN u.id IS NULL THEN '❌ ID não encontrado na tabela usuarios'
    WHEN u.id = e.usuario_id THEN '✅ ID correto (usuarios.id)'
    WHEN u.auth_user_id = e.usuario_id THEN '⚠️ Usando auth_user_id (precisa correção)'
    ELSE '❓ Situação desconhecida'
  END as status
FROM execucoes e
LEFT JOIN usuarios u ON u.id = e.usuario_id OR u.auth_user_id = e.usuario_id
WHERE 
  -- Mostrar apenas execuções com problemas ou que usam auth_user_id
  u.id IS NULL 
  OR u.id != e.usuario_id
  OR u.auth_user_id = e.usuario_id
ORDER BY e.created_at DESC;

-- 2. Resumo por tipo de problema
SELECT 
  CASE 
    WHEN u.id IS NULL THEN 'ID não encontrado'
    WHEN u.id = e.usuario_id THEN 'ID correto'
    WHEN u.auth_user_id = e.usuario_id THEN 'Usando auth_user_id'
    ELSE 'Outro'
  END as tipo,
  COUNT(*) as quantidade
FROM execucoes e
LEFT JOIN usuarios u ON u.id = e.usuario_id OR u.auth_user_id = e.usuario_id
GROUP BY tipo
ORDER BY quantidade DESC;

-- 3. Verificar quantas execuções serão corrigidas
SELECT 
  COUNT(*) as execucoes_que_serao_corrigidas
FROM execucoes e
WHERE 
  -- O usuario_id não existe na tabela usuarios como id
  NOT EXISTS (
    SELECT 1 FROM usuarios u WHERE u.id = e.usuario_id
  )
  -- Mas existe um usuário com esse auth_user_id
  AND EXISTS (
    SELECT 1 FROM usuarios u WHERE u.auth_user_id = e.usuario_id
  );

