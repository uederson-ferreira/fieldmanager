-- CORRIGIR PERMISSÕES DO SERVICE_ROLE
-- Este script resolve o erro "must be owner of table termos_ambientais" para o backend

-- 1. VERIFICAR SE O SERVICE_ROLE EXISTE
SELECT 
    'VERIFICAR SERVICE_ROLE' as status,
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname = 'service_role';

-- 2. CONCEDER TODAS AS PERMISSÕES PARA O SERVICE_ROLE
-- O service_role deve ter permissões de administrador
GRANT ALL PRIVILEGES ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 3. CONCEDER PERMISSÕES ESPECÍFICAS PARA TERMOS_AMBIENTAIS
GRANT ALL PRIVILEGES ON TABLE termos_ambientais TO service_role;
GRANT ALL PRIVILEGES ON SEQUENCE termos_ambientais_numero_sequencial_seq TO service_role;
GRANT ALL PRIVILEGES ON TABLE termos_fotos TO service_role;
GRANT ALL PRIVILEGES ON SEQUENCE termos_fotos_id_seq TO service_role;

-- 4. CONCEDER PERMISSÕES PARA TABELAS DE METAS
GRANT ALL PRIVILEGES ON TABLE metas TO service_role;
GRANT ALL PRIVILEGES ON TABLE metas_atribuicoes TO service_role;
GRANT ALL PRIVILEGES ON TABLE progresso_metas TO service_role;
GRANT ALL PRIVILEGES ON TABLE configuracoes_metas TO service_role;

-- 5. CONCEDER PERMISSÕES PARA OUTRAS TABELAS IMPORTANTES
GRANT ALL PRIVILEGES ON TABLE usuarios TO service_role;
GRANT ALL PRIVILEGES ON TABLE perfis TO service_role;
GRANT ALL PRIVILEGES ON TABLE categorias_lv TO service_role;
GRANT ALL PRIVILEGES ON TABLE lv_residuos TO service_role;
GRANT ALL PRIVILEGES ON TABLE inspecoes TO service_role;
GRANT ALL PRIVILEGES ON TABLE atividades_rotina TO service_role;

-- 6. CONCEDER PERMISSÕES PARA FUNÇÕES
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION gerar_proximo_numero_termo(text) TO service_role;
GRANT EXECUTE ON FUNCTION calcular_progresso_metas() TO service_role;

-- 7. VERIFICAR SE RLS ESTÁ CONFIGURADO CORRETAMENTE
DO $$
BEGIN
    -- Verificar se RLS está ativo na tabela termos_ambientais
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'termos_ambientais' 
          AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS está ativo em termos_ambientais';
        
        -- Criar política específica para service_role (bypass RLS)
        DROP POLICY IF EXISTS "Service role bypass" ON termos_ambientais;
        CREATE POLICY "Service role bypass" 
        ON termos_ambientais 
        FOR ALL 
        TO service_role 
        USING (true) 
        WITH CHECK (true);
        
        RAISE NOTICE '✅ Política de bypass criada para service_role';
    ELSE
        RAISE NOTICE 'ℹ️ RLS não está ativo em termos_ambientais';
    END IF;
END $$;

-- 8. VERIFICAR SE O TRIGGER ESTÁ ATIVO
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

-- 9. REABILITAR TRIGGER SE NECESSÁRIO
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

-- 10. TESTE DE INSERÇÃO COM SERVICE_ROLE (OPCIONAL)
-- Este teste pode ser executado se você quiser verificar se as permissões estão funcionando
-- Descomente as linhas abaixo para testar:

/*
DO $$
BEGIN
    -- Simular inserção como service_role
    INSERT INTO termos_ambientais (
        data_termo, hora_termo, local_atividade, emitido_por_nome, 
        destinatario_nome, area_equipamento_atividade, tipo_termo, 
        natureza_desvio, emitido_por_usuario_id, numero_termo
    ) VALUES (
        CURRENT_DATE, CURRENT_TIME, 'TESTE SERVICE ROLE', 'SISTEMA', 
        'TESTE', 'ÁREA TESTE', 'NOTIFICACAO', 
        'OCORRENCIA_REAL', 'abb0e395-64aa-438c-94d6-1bf4c43f151a', 999999
    );
    
    RAISE NOTICE '✅ Teste de inserção com service_role bem-sucedido';
    
    -- Limpar o teste
    DELETE FROM termos_ambientais WHERE numero_termo = 999999;
    RAISE NOTICE '🧹 Teste limpo';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;
*/

-- 11. VERIFICAÇÃO FINAL
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    'Permissões do service_role configuradas' as resultado;

-- 12. INSTRUÇÕES PARA TESTE
SELECT 
    'INSTRUÇÕES PARA TESTE' as status,
    '1. Execute este script no Supabase Dashboard SQL Editor' as passo1,
    '2. Reinicie o backend (se estiver rodando)' as passo2,
    '3. Tente criar um novo termo no frontend' as passo3,
    '4. Verifique se o progresso das metas atualiza automaticamente' as passo4; 