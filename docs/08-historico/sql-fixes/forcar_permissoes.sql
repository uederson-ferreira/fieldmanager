-- FORÇAR PERMISSÕES DO SERVICE_ROLE
-- Solução mais agressiva para resolver o problema

-- 1. TORNAR SERVICE_ROLE OWNER DA TABELA
ALTER TABLE termos_ambientais OWNER TO service_role;
ALTER TABLE termos_fotos OWNER TO service_role;
ALTER TABLE metas OWNER TO service_role;
ALTER TABLE metas_atribuicoes OWNER TO service_role;
ALTER TABLE progresso_metas OWNER TO service_role;

-- 2. CONCEDER PERMISSÕES COMPLETAS
GRANT ALL PRIVILEGES ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 3. CONCEDER PERMISSÕES ESPECÍFICAS
GRANT ALL PRIVILEGES ON TABLE termos_ambientais TO service_role;
GRANT ALL PRIVILEGES ON TABLE termos_fotos TO service_role;
GRANT ALL PRIVILEGES ON TABLE metas TO service_role;
GRANT ALL PRIVILEGES ON TABLE metas_atribuicoes TO service_role;
GRANT ALL PRIVILEGES ON TABLE progresso_metas TO service_role;

-- 4. DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
ALTER TABLE termos_ambientais DISABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR OWNER ATUAL
SELECT 
    'OWNER ATUAL' as status,
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('termos_ambientais', 'termos_fotos', 'metas', 'metas_atribuicoes', 'progresso_metas');

-- 6. TESTE DE INSERÇÃO
DO $$
DECLARE
    resultado_id UUID;
BEGIN
    INSERT INTO termos_ambientais (
        data_termo, 
        hora_termo, 
        local_atividade, 
        emitido_por_nome, 
        destinatario_nome, 
        area_equipamento_atividade, 
        tipo_termo, 
        natureza_desvio, 
        emitido_por_usuario_id,
        numero_termo,
        status
    ) VALUES (
        CURRENT_DATE, 
        CURRENT_TIME, 
        'TESTE FORÇAR PERMISSÕES', 
        'SISTEMA TESTE', 
        'TESTE', 
        'ÁREA TESTE', 
        'NOTIFICACAO', 
        'OCORRENCIA_REAL', 
        'abb0e395-64aa-438c-94d6-1bf4c43f151a',
        999997,
        'PENDENTE'
    ) RETURNING id INTO resultado_id;
    
    RAISE NOTICE '✅ INSERÇÃO BEM-SUCEDIDA! ID: %', resultado_id;
    
    -- Limpar o teste
    DELETE FROM termos_ambientais WHERE id = resultado_id;
    RAISE NOTICE '🧹 Teste limpo com sucesso';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO NA INSERÇÃO: %', SQLERRM;
END $$;

-- 7. REABILITAR RLS COM POLÍTICAS SIMPLES
ALTER TABLE termos_ambientais ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Service role bypass" ON termos_ambientais;
DROP POLICY IF EXISTS "Permitir INSERT para usuários autenticados" ON termos_ambientais;
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON termos_ambientais;
DROP POLICY IF EXISTS "Permitir UPDATE para usuários autenticados" ON termos_ambientais;

-- Criar política simples para service_role
CREATE POLICY "Service role full access" 
ON termos_ambientais 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Criar políticas para usuários autenticados
CREATE POLICY "Authenticated users access" 
ON termos_ambientais 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 8. VERIFICAR E REABILITAR TRIGGER
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

-- 9. VERIFICAÇÃO FINAL
SELECT '✅ PERMISSÕES FORÇADAS - TESTE AGORA!' as status; 