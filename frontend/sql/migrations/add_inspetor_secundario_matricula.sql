-- ===================================================================
-- ADICIONAR CAMPO MATRÍCULA DO INSPETOR SECUNDÁRIO
-- ===================================================================

-- 1. Adicionar campo na tabela lvs
ALTER TABLE public.lvs 
ADD COLUMN inspetor_secundario_matricula text null;

-- 2. Adicionar campo na tabela lv_residuos (estrutura antiga para compatibilidade)
ALTER TABLE public.lv_residuos 
ADD COLUMN inspetor_secundario_matricula text null;

-- 3. Criar índice para otimização
CREATE INDEX idx_lvs_inspetor_secundario_matricula ON public.lvs USING btree (inspetor_secundario_matricula);

CREATE INDEX idx_lv_residuos_inspetor_secundario_matricula ON public.lv_residuos USING btree (inspetor_secundario_matricula); 