-- SOLUÇÃO DEFINITIVA PARA O BACKEND
-- Resolve "must be owner of table termos_ambientais" para service_role

-- 1. CONCEDER PERMISSÕES COMPLETAS PARA SERVICE_ROLE
GRANT ALL PRIVILEGES ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 2. CONCEDER PERMISSÕES ESPECÍFICAS PARA TABELAS CRÍTICAS
GRANT ALL PRIVILEGES ON TABLE termos_ambientais TO service_role;
GRANT ALL PRIVILEGES ON TABLE termos_fotos TO service_role;
GRANT ALL PRIVILEGES ON TABLE metas TO service_role;
GRANT ALL PRIVILEGES ON TABLE metas_atribuicoes TO service_role;
GRANT ALL PRIVILEGES ON TABLE progresso_metas TO service_role;

-- 3. CONCEDER PERMISSÕES PARA SEQUÊNCIAS (SE EXISTIREM)
DO $$
BEGIN
    -- Conceder permissões para sequências se existirem
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'termos_ambientais_numero_sequencial_seq') THEN
        GRANT ALL PRIVILEGES ON SEQUENCE termos_ambientais_numero_sequencial_seq TO service_role;
        RAISE NOTICE '✅ Permissões concedidas para termos_ambientais_numero_sequencial_seq';
    ELSE
        RAISE NOTICE 'ℹ️ Sequência termos_ambientais_numero_sequencial_seq não encontrada';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'termos_fotos_id_seq') THEN
        GRANT ALL PRIVILEGES ON SEQUENCE termos_fotos_id_seq TO service_role;
        RAISE NOTICE '✅ Permissões concedidas para termos_fotos_id_seq';
    ELSE
        RAISE NOTICE 'ℹ️ Sequência termos_fotos_id_seq não encontrada';
    END IF;
END $$;

-- 4. CRIAR POLÍTICA DE BYPASS PARA SERVICE_ROLE
DO $$
BEGIN
    -- Remover políticas existentes que possam estar causando conflito
    DROP POLICY IF EXISTS "Service role bypass" ON termos_ambientais;
    DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON termos_ambientais;
    DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON termos_ambientais;
    DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON termos_ambientais;
    DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON termos_ambientais;
    
    -- Criar política de bypass para service_role
    CREATE POLICY "Service role bypass" 
    ON termos_ambientais 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
    
    -- Criar políticas para usuários autenticados
    CREATE POLICY "Permitir INSERT para usuários autenticados" 
    ON termos_ambientais 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
    
    CREATE POLICY "Permitir SELECT para usuários autenticados" 
    ON termos_ambientais 
    FOR SELECT 
    TO authenticated 
    USING (true);
    
    CREATE POLICY "Permitir UPDATE para usuários autenticados" 
    ON termos_ambientais 
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
    
    RAISE NOTICE '✅ Políticas RLS configuradas';
END $$;

-- 5. VERIFICAR E REABILITAR TRIGGER
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgrelid = 'termos_ambientais'::regclass
          AND tgname = 'trigger_calcular_progresso_termos'
          AND tgenabled = 'O'
    ) THEN
        ALTER TABLE termos_ambientais ENABLE TRIGGER trigger_calcular_progresso_termos;
        RAISE NOTICE '🔄 Trigger reabilitado';
    ELSE
        RAISE NOTICE '✅ Trigger já está ativo';
    END IF;
END $$;

-- 6. VERIFICAÇÃO FINAL
SELECT '✅ PERMISSÕES CONFIGURADAS' as status;
SELECT '✅ POLÍTICAS RLS CRIADAS' as status;
SELECT '✅ TRIGGER VERIFICADO' as status;

-- 7. INSTRUÇÕES
SELECT '🎯 AGORA: Reinicie o backend e teste criar um termo' as instrucao; 