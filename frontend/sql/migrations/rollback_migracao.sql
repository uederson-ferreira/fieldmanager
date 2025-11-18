-- ===================================================================
-- ROLLBACK DA MIGRAÇÃO - ESTRUTURA UNIFICADA
-- ===================================================================
-- EXECUTAR APENAS SE A MIGRAÇÃO FALHAR E FOR NECESSÁRIO REVERTER
-- ===================================================================

-- 1. Verificar se as tabelas unificadas existem
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lvs') THEN
        RAISE NOTICE 'Tabelas unificadas encontradas. Iniciando rollback...';
    ELSE
        RAISE NOTICE 'Tabelas unificadas não encontradas. Rollback não necessário.';
        RETURN;
    END IF;
END $$;

-- 2. Restaurar dados das tabelas de backup (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_lv_residuos') THEN
        -- Limpar tabelas atuais
        DELETE FROM public.lv_residuos_avaliacoes;
        DELETE FROM public.lv_residuos_fotos;
        DELETE FROM public.lv_residuos;
        
        -- Restaurar dados do backup
        INSERT INTO public.lv_residuos SELECT * FROM backup_lv_residuos;
        INSERT INTO public.lv_residuos_avaliacoes SELECT * FROM backup_lv_residuos_avaliacoes;
        INSERT INTO public.lv_residuos_fotos SELECT * FROM backup_lv_residuos_fotos;
        
        RAISE NOTICE 'Dados restaurados com sucesso do backup.';
    ELSE
        RAISE NOTICE 'Tabelas de backup não encontradas. Rollback manual necessário.';
    END IF;
END $$;

-- 3. Remover tabelas unificadas (se existirem)
DROP TABLE IF EXISTS public.lv_fotos CASCADE;
DROP TABLE IF EXISTS public.lv_avaliacoes CASCADE;
DROP TABLE IF EXISTS public.lvs CASCADE;
DROP TABLE IF EXISTS public.lv_configuracoes CASCADE;

-- 4. Remover bucket unificado (se existir)
DELETE FROM storage.buckets WHERE id = 'fotos-lvs';

-- 5. Remover funções e triggers (se existirem)
DROP FUNCTION IF EXISTS trigger_atualizar_estatisticas_lv() CASCADE;
DROP FUNCTION IF EXISTS atualizar_estatisticas_lv(uuid) CASCADE;

-- 6. Remover índices (se existirem)
DROP INDEX IF EXISTS idx_lvs_tipo_lv;
DROP INDEX IF EXISTS idx_lvs_usuario_id;
DROP INDEX IF EXISTS idx_lvs_data_inspecao;
DROP INDEX IF EXISTS idx_lvs_status;
DROP INDEX IF EXISTS idx_lvs_coordinates;
DROP INDEX IF EXISTS idx_lvs_numero_sequencial;
DROP INDEX IF EXISTS idx_lv_avaliacoes_lv_id;
DROP INDEX IF EXISTS idx_lv_avaliacoes_tipo_lv;
DROP INDEX IF EXISTS idx_lv_avaliacoes_item_id;
DROP INDEX IF EXISTS idx_lv_avaliacoes_avaliacao;
DROP INDEX IF EXISTS idx_lv_fotos_lv_id;
DROP INDEX IF EXISTS idx_lv_fotos_tipo_lv;
DROP INDEX IF EXISTS idx_lv_fotos_item_id;
DROP INDEX IF EXISTS idx_lv_fotos_coordinates;

-- 7. Verificar se o rollback foi bem-sucedido
SELECT 
  'Verificação pós-rollback' as tipo,
  COUNT(*) as total_lvs_restauradas
FROM public.lv_residuos;

-- ===================================================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ===================================================================
-- Se o SELECT acima retornou dados, o rollback foi bem-sucedido
-- O sistema voltou ao estado anterior à migração
-- =================================================================== 