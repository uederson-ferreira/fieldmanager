-- ===================================================================
-- FIX: Corrigir usuario_id nas execuções antigas
-- Descrição: Converte auth_user_id para usuarios.id nas execuções
-- Data: 2025-01-XX
-- ===================================================================

-- Este script corrige execuções que foram criadas com auth_user_id
-- em vez de usuarios.id, convertendo para o ID correto da tabela usuarios

BEGIN;

-- Verificar quantas execuções precisam ser corrigidas
SELECT 
  COUNT(*) as total_execucoes,
  COUNT(DISTINCT e.usuario_id) as usuarios_diferentes,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as execucoes_com_id_invalido
FROM execucoes e
LEFT JOIN usuarios u ON u.id = e.usuario_id;

-- Atualizar execuções que têm auth_user_id em vez de usuarios.id
-- Busca o usuarios.id correto baseado no auth_user_id
-- Isso corrige o caso onde o mesmo usuário tem execuções com IDs diferentes
UPDATE execucoes e
SET usuario_id = u.id
FROM usuarios u
WHERE 
  -- O usuario_id da execução não existe na tabela usuarios como id
  NOT EXISTS (
    SELECT 1 FROM usuarios u2 WHERE u2.id = e.usuario_id
  )
  -- E existe um usuário com esse auth_user_id
  AND u.auth_user_id = e.usuario_id
  -- E o usuarios.id é diferente do que está na execução (para padronizar)
  AND u.id != e.usuario_id;

-- Verificar resultado após a correção
SELECT 
  COUNT(*) as total_execucoes,
  COUNT(DISTINCT e.usuario_id) as usuarios_diferentes,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as execucoes_com_id_invalido
FROM execucoes e
LEFT JOIN usuarios u ON u.id = e.usuario_id;

-- Mostrar execuções que ainda podem ter problemas
SELECT 
  e.id,
  e.numero_documento,
  e.usuario_id as usuario_id_atual,
  u.id as usuarios_id_correto,
  u.auth_user_id,
  CASE 
    WHEN u.id IS NULL THEN '❌ ID não encontrado na tabela usuarios'
    WHEN u.id != e.usuario_id THEN '⚠️ ID diferente do esperado'
    ELSE '✅ OK'
  END as status
FROM execucoes e
LEFT JOIN usuarios u ON u.id = e.usuario_id OR u.auth_user_id = e.usuario_id
WHERE u.id IS NULL OR u.id != e.usuario_id
ORDER BY e.created_at DESC
LIMIT 20;

COMMIT;

-- ===================================================================
-- NOTAS:
-- ===================================================================
-- 1. Este script atualiza apenas execuções onde o usuario_id não existe
--    na tabela usuarios, mas existe um usuário com auth_user_id igual
--
-- 2. Execute este script com cuidado em produção
--
-- 3. Faça backup antes de executar: 
--    pg_dump -t execucoes > backup_execucoes_$(date +%Y%m%d).sql
--
-- 4. Para verificar antes de aplicar, remova o COMMIT e veja os resultados
-- ===================================================================

