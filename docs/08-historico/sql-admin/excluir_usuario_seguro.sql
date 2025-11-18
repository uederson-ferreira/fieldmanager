-- ===================================================================
-- EXCLUIR USUÁRIO DE FORMA SEGURA - ECOFIELD SYSTEM
-- Usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR DEPENDÊNCIAS ANTES DE EXCLUIR
-- ===================================================================

-- Verificar se há registros relacionados
SELECT 
    'VERIFICAÇÃO INICIAL' as status,
    (SELECT COUNT(*) FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84') as usuarios,
    (SELECT COUNT(*) FROM public.termos_ambientais WHERE emitido_por_usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84')) as termos,
    (SELECT COUNT(*) FROM public.atividades_rotina WHERE tma_responsavel_id = (SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84')) as rotinas,
    (SELECT COUNT(*) FROM public.metas WHERE criada_por = (SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84')) as metas;

-- ===================================================================
-- 2. EXCLUIR REGISTROS RELACIONADOS (OPCIONAL)
-- ===================================================================

-- Descomente as linhas abaixo se quiser excluir os registros relacionados
-- ATENÇÃO: Isso irá excluir permanentemente os dados!

/*
-- Excluir termos ambientais
DELETE FROM public.termos_ambientais 
WHERE emitido_por_usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- Excluir atividades rotina
DELETE FROM public.atividades_rotina 
WHERE tma_responsavel_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- Excluir metas
DELETE FROM public.metas 
WHERE criada_por = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- Excluir fotos
DELETE FROM public.fotos 
WHERE usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- Excluir logs
DELETE FROM public.logs 
WHERE usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);
*/

-- ===================================================================
-- 3. TRANSFERIR REGISTROS PARA OUTRO USUÁRIO (RECOMENDADO)
-- ===================================================================

-- Descomente e ajuste o ID do usuário que receberá os registros
/*
-- Transferir termos ambientais para admin
UPDATE public.termos_ambientais 
SET emitido_por_usuario_id = (
    SELECT id FROM public.usuarios WHERE email = 'admin@ecofield.com' LIMIT 1
)
WHERE emitido_por_usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- Transferir atividades rotina para admin
UPDATE public.atividades_rotina 
SET tma_responsavel_id = (
    SELECT id FROM public.usuarios WHERE email = 'admin@ecofield.com' LIMIT 1
)
WHERE tma_responsavel_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- Transferir metas para admin
UPDATE public.metas 
SET criada_por = (
    SELECT id FROM public.usuarios WHERE email = 'admin@ecofield.com' LIMIT 1
)
WHERE criada_por = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);
*/

-- ===================================================================
-- 4. EXCLUIR USUÁRIO DA TABELA USUARIOS
-- ===================================================================

-- Excluir da tabela usuarios
DELETE FROM public.usuarios 
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- 5. VERIFICAR EXCLUSÃO
-- ===================================================================

-- Verificar se o usuário foi excluído
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    (SELECT COUNT(*) FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84') as usuarios_restantes,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84') = 0 
        THEN '✅ Usuário excluído com sucesso da tabela usuarios'
        ELSE '❌ Erro ao excluir usuário da tabela usuarios'
    END as resultado;

-- ===================================================================
-- 6. EXCLUIR DO AUTH.USERS (MANUAL)
-- ===================================================================

/*
Para excluir do auth.users:

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/auth/users
2. Encontre o usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
3. Clique em "..." → "Delete"
4. Confirme a exclusão

OU use a API do Supabase:

curl -X DELETE "https://[SEU_PROJECT_ID].supabase.co/auth/v1/admin/users/94af2236-8c8e-4c91-914b-e16fb3775d84" \
  -H "apikey: [SUA_SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SUA_SERVICE_ROLE_KEY]"
*/ 