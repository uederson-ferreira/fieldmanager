-- CORRIGIR PERMISSÕES NO SUPABASE
-- Script específico para resolver "must be owner of table termos_ambientais"

-- 1. VERIFICAR CONFIGURAÇÃO ATUAL
SELECT 
    'CONFIGURAÇÃO ATUAL' as status,
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_ativado
FROM pg_tables 
WHERE tablename = 'termos_ambientais';

-- 2. VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT 
    'POLÍTICAS EXISTENTES' as status,
    policyname,
    cmd,
    roles,
    permissive
FROM pg_policies 
WHERE tablename = 'termos_ambientais'
ORDER BY cmd;

-- 3. CONCEDER PERMISSÕES BÁSICAS
-- Conceder permissões para o role authenticated (usuários logados)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE termos_ambientais TO authenticated;
GRANT ALL ON SEQUENCE termos_ambientais_numero_sequencial_seq TO authenticated;

-- Conceder permissões para o role anon (usuários não logados)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE termos_ambientais TO anon;
GRANT ALL ON SEQUENCE termos_ambientais_numero_sequencial_seq TO anon;

-- 4. VERIFICAR SE RLS ESTÁ ATIVADO
DO $$
DECLARE
    rls_status BOOLEAN;
BEGIN
    SELECT rowsecurity INTO rls_status
    FROM pg_tables 
    WHERE tablename = 'termos_ambientais';
    
    IF rls_status THEN
        RAISE NOTICE '✅ RLS está ativado - criando políticas...';
        
        -- Remover políticas existentes que possam estar causando conflito
        DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON termos_ambientais;
        DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON termos_ambientais;
        DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON termos_ambientais;
        DROP POLICY IF EXISTS "Permitir DELETE para usuários autenticados" ON termos_ambientais;
        
        -- Criar políticas permissivas para INSERT
        CREATE POLICY "Permitir INSERT para usuários autenticados" 
        ON termos_ambientais 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (true);
        
        -- Criar políticas permissivas para SELECT
        CREATE POLICY "Permitir SELECT para usuários autenticados" 
        ON termos_ambientais 
        FOR SELECT 
        TO authenticated 
        USING (true);
        
        -- Criar políticas permissivas para UPDATE
        CREATE POLICY "Permitir UPDATE para usuários autenticados" 
        ON termos_ambientais 
        FOR UPDATE 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
        
        -- Criar políticas permissivas para DELETE
        CREATE POLICY "Permitir DELETE para usuários autenticados" 
        ON termos_ambientais 
        FOR DELETE 
        TO authenticated 
        USING (true);
        
        RAISE NOTICE '✅ Políticas RLS criadas com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️ RLS não está ativado - ativando...';
        ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas após ativar RLS
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
        
        RAISE NOTICE '✅ RLS ativado e políticas criadas';
    END IF;
END $$;

-- 5. VERIFICAR SE O TRIGGER AINDA ESTÁ ATIVO
SELECT 
    'TRIGGER STATUS' as status,
    tgname as nome_trigger,
    CASE 
        WHEN tgenabled = 'A' THEN '✅ ATIVO'
        WHEN tgenabled = 'O' THEN '❌ DESABILITADO'
        WHEN tgenabled = 'D' THEN '❌ DESABILITADO'
        WHEN tgenabled = 'R' THEN '❌ DESABILITADO'
        ELSE '⚠️ DESCONHECIDO'
    END as status_trigger
FROM pg_trigger 
WHERE tgrelid = 'termos_ambientais'::regclass
  AND tgname = 'trigger_calcular_progresso_termos';

-- 6. REABILITAR TRIGGER SE NECESSÁRIO
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

-- 7. VERIFICAÇÃO FINAL
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    'Permissões e políticas configuradas' as resultado;

-- 8. TESTE DE INSERÇÃO (OPCIONAL - DESCOMENTE SE QUISER TESTAR)
-- INSERT INTO termos_ambientais (
--     data_termo, hora_termo, local_atividade, emitido_por_nome, 
--     destinatario_nome, area_equipamento_atividade, tipo_termo, 
--     natureza_desvio, emitido_por_usuario_id
-- ) VALUES (
--     CURRENT_DATE, CURRENT_TIME, 'TESTE PERMISSÕES', 'SISTEMA', 
--     'TESTE', 'ÁREA TESTE', 'NOTIFICACAO', 
--     'OCORRENCIA_REAL', 'abb0e395-64aa-438c-94d6-1bf4c43f151a'
-- );

-- 9. INSTRUÇÕES PARA TESTE
SELECT 
    'INSTRUÇÕES PARA TESTE' as status,
    '1. Execute este script no Supabase Dashboard SQL Editor' as passo1,
    '2. Tente criar um novo termo no frontend' as passo2,
    '3. Verifique se o progresso das metas atualiza automaticamente' as passo3; 