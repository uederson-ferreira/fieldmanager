-- ===================================================================
-- VERIFICAR DEPENDÊNCIAS DO USUÁRIO ANTES DE EXCLUIR
-- Usuário: 94af2236-8c8e-4c91-914b-e16fb3775d84
-- ===================================================================

-- ===================================================================
-- 1. VERIFICAR USUÁRIO NO AUTH.USERS
-- ===================================================================

SELECT 
    'AUTH USERS' as tabela,
    id,
    email,
    created_at,
    updated_at
FROM auth.users 
WHERE id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- 2. VERIFICAR DEPENDÊNCIAS NA TABELA USUARIOS
-- ===================================================================

SELECT 
    'USUARIOS' as tabela,
    COUNT(*) as total_registros
FROM public.usuarios 
WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84';

-- ===================================================================
-- 3. VERIFICAR DEPENDÊNCIAS EM TERMOS AMBIENTAIS
-- ===================================================================

SELECT 
    'TERMOS AMBIENTAIS' as tabela,
    COUNT(*) as total_registros
FROM public.termos_ambientais 
WHERE emitido_por_usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- ===================================================================
-- 4. VERIFICAR DEPENDÊNCIAS EM ATIVIDADES ROTINA
-- ===================================================================

SELECT 
    'ATIVIDADES ROTINA' as tabela,
    COUNT(*) as total_registros
FROM public.atividades_rotina 
WHERE tma_responsavel_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- ===================================================================
-- 5. VERIFICAR DEPENDÊNCIAS EM METAS
-- ===================================================================

SELECT 
    'METAS' as tabela,
    COUNT(*) as total_registros
FROM public.metas 
WHERE criada_por = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- ===================================================================
-- 6. VERIFICAR DEPENDÊNCIAS EM FOTOS
-- ===================================================================

SELECT 
    'FOTOS' as tabela,
    COUNT(*) as total_registros
FROM public.fotos 
WHERE usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- ===================================================================
-- 7. VERIFICAR DEPENDÊNCIAS EM LOGS
-- ===================================================================

SELECT 
    'LOGS' as tabela,
    COUNT(*) as total_registros
FROM public.logs 
WHERE usuario_id = (
    SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'
);

-- ===================================================================
-- 8. RESUMO DE DEPENDÊNCIAS
-- ===================================================================

SELECT 
    'RESUMO' as info,
    'Para excluir o usuário, você precisa:' as acao,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84') 
        THEN '1. Excluir registro da tabela usuarios'
        ELSE '1. Usuário não encontrado na tabela usuarios'
    END as passo1,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.termos_ambientais WHERE emitido_por_usuario_id = (SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'))
        THEN '2. Excluir ou transferir termos ambientais'
        ELSE '2. Nenhum termo ambiental encontrado'
    END as passo2,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.atividades_rotina WHERE tma_responsavel_id = (SELECT id FROM public.usuarios WHERE auth_user_id = '94af2236-8c8e-4c91-914b-e16fb3775d84'))
        THEN '3. Excluir ou transferir atividades rotina'
        ELSE '3. Nenhuma atividade rotina encontrada'
    END as passo3; 