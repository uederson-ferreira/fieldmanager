-- CRIAR TRIGGERS ESPECÍFICOS PARA CADA FUNÇÃO
-- Organizar triggers por tipo de meta

-- 1. Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_insert ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_update ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos_delete ON termos_ambientais;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos_insert ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos_update ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos_delete ON lv_residuos;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs_insert ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs_update ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs_delete ON lvs;

DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas_insert ON atividades_rotina;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas_update ON atividades_rotina;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas_delete ON atividades_rotina;

-- 2. Triggers para TERMOS AMBIENTAIS
CREATE TRIGGER trigger_calcular_progresso_termos_insert
AFTER INSERT ON termos_ambientais
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_termos();

CREATE TRIGGER trigger_calcular_progresso_termos_update
AFTER UPDATE ON termos_ambientais
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_termos();

CREATE TRIGGER trigger_calcular_progresso_termos_delete
AFTER DELETE ON termos_ambientais
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_termos();

-- 3. Triggers para LVs (lv_residuos)
CREATE TRIGGER trigger_calcular_progresso_lv_residuos_insert
AFTER INSERT ON lv_residuos
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_lvs();

CREATE TRIGGER trigger_calcular_progresso_lv_residuos_update
AFTER UPDATE ON lv_residuos
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_lvs();

CREATE TRIGGER trigger_calcular_progresso_lv_residuos_delete
AFTER DELETE ON lv_residuos
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_lvs();

-- 4. Triggers para LVs (lvs)
CREATE TRIGGER trigger_calcular_progresso_lvs_insert
AFTER INSERT ON lvs
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_lvs();

CREATE TRIGGER trigger_calcular_progresso_lvs_update
AFTER UPDATE ON lvs
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_lvs();

CREATE TRIGGER trigger_calcular_progresso_lvs_delete
AFTER DELETE ON lvs
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_lvs();

-- 5. Triggers para ROTINAS
CREATE TRIGGER trigger_calcular_progresso_rotinas_insert
AFTER INSERT ON atividades_rotina
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_rotinas();

CREATE TRIGGER trigger_calcular_progresso_rotinas_update
AFTER UPDATE ON atividades_rotina
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_rotinas();

CREATE TRIGGER trigger_calcular_progresso_rotinas_delete
AFTER DELETE ON atividades_rotina
FOR EACH ROW
EXECUTE FUNCTION calcular_progresso_rotinas();

-- 6. Verificar se a tabela lvs existe, se não, criar
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lvs') THEN
        CREATE TABLE public.lvs (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            tipo_lv text NOT NULL,
            nome_lv text NOT NULL,
            usuario_id uuid NOT NULL,
            usuario_nome text NOT NULL,
            data_preenchimento timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            area text NOT NULL,
            status text NOT NULL DEFAULT 'concluido',
            sincronizado boolean NOT NULL DEFAULT true,
            created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT lvs_pkey PRIMARY KEY (id),
            CONSTRAINT lvs_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
        
        -- Criar índices para a tabela lvs
        CREATE INDEX IF NOT EXISTS idx_lvs_data ON public.lvs USING btree (data_preenchimento);
        CREATE INDEX IF NOT EXISTS idx_lvs_usuario ON public.lvs USING btree (usuario_id);
        CREATE INDEX IF NOT EXISTS idx_lvs_tipo ON public.lvs USING btree (tipo_lv);
        CREATE INDEX IF NOT EXISTS idx_lvs_status ON public.lvs USING btree (status);
        
        RAISE NOTICE 'Tabela lvs criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela lvs já existe';
    END IF;
END $$;

-- 7. Verificar todos os triggers criados
SELECT 
    'TRIGGERS ESPECÍFICOS CRIADOS' as teste,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    tgfoid::regproc as funcao,
    tgenabled as ativo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('lvs', 'lv_residuos', 'termos_ambientais', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
ORDER BY c.relname, t.tgname;

-- 8. Resumo final organizado por tipo
SELECT 
    'RESUMO POR TIPO' as teste,
    CASE 
        WHEN c.relname = 'termos_ambientais' THEN 'TERMOS'
        WHEN c.relname IN ('lvs', 'lv_residuos') THEN 'LVs'
        WHEN c.relname = 'atividades_rotina' THEN 'ROTINAS'
    END as tipo_meta,
    c.relname as tabela,
    COUNT(*) as total_triggers,
    COUNT(CASE WHEN t.tgenabled = 'O' THEN 1 END) as triggers_ativos,
    tgfoid::regproc as funcao_utilizada
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('lvs', 'lv_residuos', 'termos_ambientais', 'atividades_rotina')
  AND t.tgname LIKE '%calcular_progresso%'
GROUP BY c.relname, tgfoid::regproc
ORDER BY tipo_meta, c.relname; 