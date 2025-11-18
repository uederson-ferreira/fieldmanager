-- ===================================================================
-- RESOLVER PROBLEMA DE EXCLUSÃO DO USUÁRIO
-- Usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR O PROBLEMA
-- ===================================================================

-- Verificar se o usuário existe e tem dependências
SELECT 
    'PROBLEMA IDENTIFICADO' as status,
    'O usuário não pode ser excluído porque tem registros relacionados' as motivo,
    (SELECT COUNT(*) FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84') as usuarios,
    (SELECT COUNT(*) FROM public.termos_ambientais WHERE emitido_por_usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84')) as termos,
    (SELECT COUNT(*) FROM public.atividades_rotina WHERE tma_responsavel_id = (SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84')) as rotinas;

-- ===================================================================
-- 2. SOLUÇÃO: TRANSFERIR REGISTROS PARA ADMIN
-- ===================================================================

-- Transferir todos os registros para o usuário admin
UPDATE public.termos_ambientais 
SET emitido_por_usuario_id = (
    SELECT id FROM public.usuarios WHERE email = 'admin@ecofield.com' LIMIT 1
)
WHERE emitido_por_usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

UPDATE public.atividades_rotina 
SET tma_responsavel_id = (
    SELECT id FROM public.usuarios WHERE email = 'admin@ecofield.com' LIMIT 1
)
WHERE tma_responsavel_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

UPDATE public.metas 
SET criada_por = (
    SELECT id FROM public.usuarios WHERE email = 'admin@ecofield.com' LIMIT 1
)
WHERE criada_por = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- ===================================================================
-- 3. EXCLUIR USUÁRIO DA TABELA USUARIOS
-- ===================================================================

DELETE FROM public.usuarios 
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- 4. VERIFICAR RESULTADO
-- ===================================================================

SELECT 
    'RESULTADO' as status,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84') = 0 
        THEN '✅ Usuário excluído com sucesso!'
        ELSE '❌ Erro ao excluir usuário'
    END as resultado,
    'Agora você pode excluir do Supabase Auth' as proximo_passo;

-- ===================================================================
-- 5. PRÓXIMO PASSO: EXCLUIR DO AUTH.USERS
-- ===================================================================

/*
Agora você pode excluir o usuário do Supabase Auth:

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/auth/users
2. Encontre o usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
3. Clique em "..." → "Delete"
4. Confirme a exclusão

O usuário agora pode ser excluído sem erro!
*/ 