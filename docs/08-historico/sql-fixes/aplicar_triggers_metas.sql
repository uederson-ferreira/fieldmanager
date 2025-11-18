-- ===================================================================
-- APLICAR TRIGGERS PARA CONTABILIZAÇÃO AUTOMÁTICA DE METAS
-- ===================================================================

-- Verificar se a função existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calcular_progresso_metas') THEN
        RAISE EXCEPTION 'Função calcular_progresso_metas não encontrada. Execute primeiro o script sistema_metas_com_atribuicao.sql';
    END IF;
END $$;

-- ===================================================================
-- TRIGGER PARA LVs (tabela lvs)
-- ===================================================================

-- Remover trigger se existir
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;

-- Criar trigger para LVs
CREATE TRIGGER trigger_calcular_progresso_lvs
AFTER INSERT OR UPDATE ON lvs
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_metas();

-- ===================================================================
-- TRIGGER PARA TERMOS AMBIENTAIS (tabela termos_ambientais)
-- ===================================================================

-- Remover trigger se existir
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;

-- Criar trigger para Termos
CREATE TRIGGER trigger_calcular_progresso_termos
AFTER INSERT OR UPDATE ON termos_ambientais
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_metas();

-- ===================================================================
-- TRIGGER PARA ATIVIDADES DE ROTINA (tabela atividades_rotina)
-- ===================================================================

-- Remover trigger se existir
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- Criar trigger para Rotinas
CREATE TRIGGER trigger_calcular_progresso_rotinas
AFTER INSERT OR UPDATE ON atividades_rotina
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_metas();

-- ===================================================================
-- TRIGGER PARA LVs RESÍDUOS (tabela lv_residuos) - LEGADO
-- ===================================================================

-- Remover trigger se existir
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;

-- Criar trigger para LVs Resíduos (legado)
CREATE TRIGGER trigger_calcular_progresso_lv_residuos
AFTER INSERT OR UPDATE ON lv_residuos
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_metas();

-- ===================================================================
-- VERIFICAÇÃO DOS TRIGGERS CRIADOS
-- ===================================================================

-- Listar todos os triggers criados
SELECT 
    t.tgname as trigger_name,
    t.tgrelid::regclass as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname LIKE '%calcular_progresso%'
ORDER BY table_name;

-- ===================================================================
-- TESTE DOS TRIGGERS
-- ===================================================================

-- Verificar se há metas ativas
SELECT 
    'Metas ativas encontradas:' as info,
    COUNT(*) as total_metas
FROM metas m
WHERE m.ativa = true;

-- Verificar progresso atual
SELECT 
    'Progresso atual:' as info,
    COUNT(*) as total_progressos
FROM progresso_metas pm;

-- ===================================================================
-- INSTRUÇÕES DE USO
-- ===================================================================

/*
INSTRUÇÕES:

1. Execute este script no seu banco de dados Supabase
2. Os triggers serão aplicados automaticamente
3. Agora quando você criar:
   - LVs (tabela lvs)
   - Termos (tabela termos_ambientais)  
   - Rotinas (tabela atividades_rotina)
   - LVs Resíduos (tabela lv_residuos - legado)

4. O progresso das metas será atualizado automaticamente

5. Para testar:
   - Crie uma meta de termos no painel admin
   - Gere um termo no sistema
   - Verifique se o progresso foi atualizado

6. Se não funcionar, verifique:
   - Se há metas ativas configuradas
   - Se o período da meta corresponde ao período atual
   - Se o usuário tem atribuições de metas
*/ 