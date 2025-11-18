-- ===================================================================
-- CORREÇÃO URGENTE: Remover TODAS referências a criada_por na tabela lvs
-- Erro: column "criada_por" does not exist
-- Data: 2025-11-07
-- ===================================================================

-- PASSO 1: Desabilitar RLS temporariamente
ALTER TABLE public.lvs DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Dropar TODAS as policies existentes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT polname
        FROM pg_policy
        WHERE polrelid = 'public.lvs'::regclass
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.lvs', policy_record.polname);
        RAISE NOTICE '🗑️ Policy removida: %', policy_record.polname;
    END LOOP;
END $$;

-- PASSO 3: Recriar RLS policies SEM criada_por
-- Policy 1: Usuários podem ver apenas suas próprias LVs
CREATE POLICY "lvs_select_own"
ON public.lvs
FOR SELECT
USING (auth.uid() = auth_user_id);

-- Policy 2: Usuários podem inserir LVs
CREATE POLICY "lvs_insert_own"
ON public.lvs
FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);

-- Policy 3: Usuários podem atualizar apenas suas próprias LVs
CREATE POLICY "lvs_update_own"
ON public.lvs
FOR UPDATE
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Policy 4: Usuários podem deletar apenas suas próprias LVs
CREATE POLICY "lvs_delete_own"
ON public.lvs
FOR DELETE
USING (auth.uid() = auth_user_id);

-- PASSO 4: Reabilitar RLS
ALTER TABLE public.lvs ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Verificar policies criadas
SELECT
    '✅ POLICIES RECRIADAS' as info,
    polname as policy_name,
    polcmd as command,
    pg_get_expr(polqual, polrelid) as using_clause
FROM pg_policy
WHERE polrelid = 'public.lvs'::regclass
ORDER BY polname;

-- PASSO 6: Verificar se auth_user_id existe e está populado
SELECT
    '📊 VERIFICAÇÃO auth_user_id' as info,
    COUNT(*) as total_lvs,
    COUNT(auth_user_id) as lvs_com_auth_user_id,
    COUNT(*) - COUNT(auth_user_id) as lvs_sem_auth_user_id
FROM public.lvs;

-- PASSO 7: Popular auth_user_id se necessário
DO $$
DECLARE
    total_atualizados INTEGER := 0;
BEGIN
    -- Atualizar auth_user_id a partir de usuarios.auth_user_id
    UPDATE public.lvs l
    SET auth_user_id = u.auth_user_id
    FROM public.usuarios u
    WHERE l.usuario_id = u.id
      AND l.auth_user_id IS NULL
      AND u.auth_user_id IS NOT NULL;

    GET DIAGNOSTICS total_atualizados = ROW_COUNT;

    IF total_atualizados > 0 THEN
        RAISE NOTICE '✅ % LVs atualizadas com auth_user_id', total_atualizados;
    ELSE
        RAISE NOTICE 'ℹ️ Todas as LVs já possuem auth_user_id';
    END IF;
END $$;

-- VERIFICAÇÃO FINAL
SELECT '✅ CORREÇÃO CONCLUÍDA - LVs devem funcionar agora!' as status;
