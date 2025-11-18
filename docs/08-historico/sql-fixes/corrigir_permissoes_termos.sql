-- CORRIGIR PERMISSÕES DA TABELA TERMOS_AMBIENTAIS
-- Este script resolve o erro "must be owner of table termos_ambientais"

-- 1. VERIFICAR PERMISSÕES ATUAIS
SELECT 
    'PERMISSÕES ATUAIS' as status,
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'termos_ambientais';

-- 2. VERIFICAR RLS (Row Level Security)
SELECT 
    'RLS STATUS' as status,
    schemaname,
    tablename,
    rowsecurity as rls_ativado
FROM pg_tables 
WHERE tablename = 'termos_ambientais';

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
    'POLÍTICAS RLS' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'termos_ambientais';

-- 4. CONCEDER PERMISSÕES PARA O ROLE AUTHENTICATED
GRANT ALL PRIVILEGES ON TABLE termos_ambientais TO authenticated;
GRANT ALL PRIVILEGES ON SEQUENCE termos_ambientais_numero_sequencial_seq TO authenticated;

-- 5. CONCEDER PERMISSÕES PARA O ROLE ANON (se necessário)
GRANT ALL PRIVILEGES ON TABLE termos_ambientais TO anon;
GRANT ALL PRIVILEGES ON SEQUENCE termos_ambientais_numero_sequencial_seq TO anon;

-- 6. CONCEDER PERMISSÕES PARA O ROLE SERVICE_ROLE (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT ALL PRIVILEGES ON TABLE termos_ambientais TO service_role;
        GRANT ALL PRIVILEGES ON SEQUENCE termos_ambientais_numero_sequencial_seq TO service_role;
        RAISE NOTICE '✅ Permissões concedidas para service_role';
    ELSE
        RAISE NOTICE 'ℹ️ Role service_role não encontrado';
    END IF;
END $$;

-- 7. VERIFICAR SE EXISTE POLÍTICA RLS PARA INSERT
DO $$
DECLARE
    politica_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO politica_count
    FROM pg_policies 
    WHERE tablename = 'termos_ambientais' 
      AND cmd = 'INSERT';
    
    IF politica_count = 0 THEN
        RAISE NOTICE '⚠️ Nenhuma política RLS para INSERT encontrada';
        RAISE NOTICE '   Criando política básica para INSERT...';
        
        -- Criar política básica para INSERT
        EXECUTE 'CREATE POLICY "Permitir INSERT para usuários autenticados" 
                 ON termos_ambientais 
                 FOR INSERT 
                 TO authenticated 
                 WITH CHECK (true)';
        
        RAISE NOTICE '✅ Política RLS para INSERT criada';
    ELSE
        RAISE NOTICE '✅ Política RLS para INSERT já existe';
    END IF;
END $$;

-- 8. VERIFICAR SE EXISTE POLÍTICA RLS PARA SELECT
DO $$
DECLARE
    politica_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO politica_count
    FROM pg_policies 
    WHERE tablename = 'termos_ambientais' 
      AND cmd = 'SELECT';
    
    IF politica_count = 0 THEN
        RAISE NOTICE '⚠️ Nenhuma política RLS para SELECT encontrada';
        RAISE NOTICE '   Criando política básica para SELECT...';
        
        -- Criar política básica para SELECT
        EXECUTE 'CREATE POLICY "Permitir SELECT para usuários autenticados" 
                 ON termos_ambientais 
                 FOR SELECT 
                 TO authenticated 
                 USING (true)';
        
        RAISE NOTICE '✅ Política RLS para SELECT criada';
    ELSE
        RAISE NOTICE '✅ Política RLS para SELECT já existe';
    END IF;
END $$;

-- 9. VERIFICAR SE EXISTE POLÍTICA RLS PARA UPDATE
DO $$
DECLARE
    politica_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO politica_count
    FROM pg_policies 
    WHERE tablename = 'termos_ambientais' 
      AND cmd = 'UPDATE';
    
    IF politica_count = 0 THEN
        RAISE NOTICE '⚠️ Nenhuma política RLS para UPDATE encontrada';
        RAISE NOTICE '   Criando política básica para UPDATE...';
        
        -- Criar política básica para UPDATE
        EXECUTE 'CREATE POLICY "Permitir UPDATE para usuários autenticados" 
                 ON termos_ambientais 
                 FOR UPDATE 
                 TO authenticated 
                 USING (true) 
                 WITH CHECK (true)';
        
        RAISE NOTICE '✅ Política RLS para UPDATE criada';
    ELSE
        RAISE NOTICE '✅ Política RLS para UPDATE já existe';
    END IF;
END $$;

-- 10. VERIFICAR PERMISSÕES APÓS CORREÇÃO
SELECT 
    'PERMISSÕES APÓS CORREÇÃO' as status,
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'termos_ambientais';

-- 11. VERIFICAR POLÍTICAS APÓS CORREÇÃO
SELECT 
    'POLÍTICAS APÓS CORREÇÃO' as status,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY cmd;

-- 12. INSTRUÇÕES PARA TESTE
SELECT 
    'INSTRUÇÕES PARA TESTE' as status,
    '1. Execute este script no Supabase Dashboard' as passo1,
    '2. Tente criar um novo termo no frontend' as passo2,
    '3. Se ainda houver erro, verifique as políticas RLS' as passo3; 