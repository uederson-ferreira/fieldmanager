-- ===================================================================
-- MIGRAÇÃO PARA ARQUITETURA HÍBRIDA - ECOFIELD
-- Localização: sql/migracao_auth_hibrida.sql
-- ===================================================================

-- Este script implementa a arquitetura híbrida recomendada:
-- - Mantém todas as FKs existentes apontando para usuarios.id
-- - Adiciona mapeamento para auth.users via auth_user_id
-- - Preserva dados de negócio na tabela usuarios
-- - Usa autenticação segura do Supabase

-- ===================================================================
-- 1. ADICIONAR CAMPO DE MAPEAMENTO
-- ===================================================================

-- Adicionar coluna para mapear auth.users
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON public.usuarios(auth_user_id);

-- ===================================================================
-- 2. POPULAR O MAPEAMENTO EXISTENTE
-- ===================================================================

-- Mapear usuários existentes por email
UPDATE public.usuarios 
SET auth_user_id = au.id 
FROM auth.users au 
WHERE usuarios.email = au.email
AND usuarios.auth_user_id IS NULL;

-- ===================================================================
-- 3. VERIFICAR MAPEAMENTO
-- ===================================================================

-- Verificar quantos usuários foram mapeados
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(auth_user_id) as usuarios_mapeados,
    COUNT(*) - COUNT(auth_user_id) as usuarios_sem_mapeamento
FROM public.usuarios;

-- Listar usuários sem mapeamento
SELECT 
    id,
    nome,
    email,
    matricula,
    auth_user_id
FROM public.usuarios 
WHERE auth_user_id IS NULL;

-- ===================================================================
-- 4. AJUSTAR POLÍTICAS RLS PARA USAR MAPEAMENTO
-- ===================================================================

-- Política para termos ambientais
DROP POLICY IF EXISTS "termos_select_user_admin" ON public.termos_ambientais;

CREATE POLICY "termos_select_user_admin" ON public.termos_ambientais
FOR SELECT USING (
  -- Mapear via auth_user_id
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = emitido_por_usuario_id
    AND u.auth_user_id = auth.uid()
  ) OR
  -- Admin check
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE u.auth_user_id = auth.uid()
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM', 'DESENVOLVEDOR'])
  )
);

-- Política para inserção de termos
DROP POLICY IF EXISTS "termos_insert_user" ON public.termos_ambientais;

CREATE POLICY "termos_insert_user" ON public.termos_ambientais
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.auth_user_id = auth.uid()
  )
);

-- Política para atualização de termos
DROP POLICY IF EXISTS "termos_update_user" ON public.termos_ambientais;

CREATE POLICY "termos_update_user" ON public.termos_ambientais
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = emitido_por_usuario_id
    AND u.auth_user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE u.auth_user_id = auth.uid()
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM', 'DESENVOLVEDOR'])
  )
);

-- ===================================================================
-- 5. POLÍTICAS PARA ATIVIDADES ROTINA
-- ===================================================================

-- Política para seleção de atividades
DROP POLICY IF EXISTS "atividades_select_user" ON public.atividades_rotina;

CREATE POLICY "atividades_select_user" ON public.atividades_rotina
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE (u.id = tma_responsavel_id OR u.id = encarregado_id)
    AND u.auth_user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE u.auth_user_id = auth.uid()
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM', 'DESENVOLVEDOR'])
  )
);

-- Política para inserção de atividades
DROP POLICY IF EXISTS "atividades_insert_user" ON public.atividades_rotina;

CREATE POLICY "atividades_insert_user" ON public.atividades_rotina
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.auth_user_id = auth.uid()
  )
);

-- ===================================================================
-- 6. POLÍTICAS PARA LVs
-- ===================================================================

-- Política para seleção de LVs
DROP POLICY IF EXISTS "lvs_select_user" ON public.lv_residuos;

CREATE POLICY "lvs_select_user" ON public.lv_residuos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = usuario_id
    AND u.auth_user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE u.auth_user_id = auth.uid()
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM', 'DESENVOLVEDOR'])
  )
);

-- Política para inserção de LVs
DROP POLICY IF EXISTS "lvs_insert_user" ON public.lv_residuos;

CREATE POLICY "lvs_insert_user" ON public.lv_residuos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.auth_user_id = auth.uid()
  )
);

-- ===================================================================
-- 7. POLÍTICAS PARA METAS
-- ===================================================================

-- Política para seleção de metas
DROP POLICY IF EXISTS "metas_select_user" ON public.metas;

CREATE POLICY "metas_select_user" ON public.metas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE u.auth_user_id = auth.uid()
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM', 'DESENVOLVEDOR'])
  )
);

-- Política para inserção de metas
DROP POLICY IF EXISTS "metas_insert_user" ON public.metas;

CREATE POLICY "metas_insert_user" ON public.metas
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id 
    WHERE u.auth_user_id = auth.uid()
    AND p.nome = ANY(ARRAY['admin', 'developer', 'ADM', 'DESENVOLVEDOR'])
  )
);

-- ===================================================================
-- 8. VERIFICAR RESULTADO
-- ===================================================================

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('termos_ambientais', 'atividades_rotina', 'lv_residuos', 'metas')
ORDER BY tablename, policyname;

-- Verificar estrutura da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'usuarios'
ORDER BY ordinal_position; 