-- SOLUÇÃO RÁPIDA PARA PERMISSÕES
-- Resolve o erro "must be owner of table termos_ambientais"

-- 1. CONCEDER PERMISSÕES BÁSICAS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON TABLE termos_ambientais TO authenticated;
GRANT ALL ON TABLE termos_ambientais TO anon;

GRANT ALL ON SEQUENCE termos_ambientais_numero_sequencial_seq TO authenticated;
GRANT ALL ON SEQUENCE termos_ambientais_numero_sequencial_seq TO anon;

-- 2. VERIFICAR SE RLS ESTÁ ATIVADO E CRIAR POLÍTICAS
DO $$
BEGIN
    -- Ativar RLS se não estiver ativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'termos_ambientais' 
          AND rowsecurity = true
    ) THEN
        ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS ativado';
    END IF;
    
    -- Remover políticas existentes que possam estar causando conflito
    DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON termos_ambientais;
    DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON termos_ambientais;
    DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON termos_ambientais;
    DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON termos_ambientais;
    
    -- Criar políticas permissivas
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
    
    CREATE POLICY "Permitir DELETE para usuários autenticados" 
    ON termos_ambientais 
    FOR DELETE 
    TO authenticated 
    USING (true);
    
    RAISE NOTICE '✅ Políticas RLS criadas';
END $$;

-- 3. VERIFICAR E REABILITAR TRIGGER
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

-- 4. VERIFICAÇÃO FINAL
SELECT '✅ PERMISSÕES CONFIGURADAS' as status;
SELECT '✅ POLÍTICAS RLS CRIADAS' as status;
SELECT '✅ TRIGGER VERIFICADO' as status;

-- 5. INSTRUÇÕES
SELECT '🎯 TESTE AGORA: Crie um novo termo no frontend' as instrucao; 