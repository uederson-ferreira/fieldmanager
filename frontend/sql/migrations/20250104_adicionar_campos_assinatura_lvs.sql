-- =====================================================
-- ADICIONAR CAMPOS DE ASSINATURA NA TABELA LVS
-- Data: 04/01/2025
-- Descrição: Adiciona campos para armazenar assinaturas digitais (base64) dos inspetores
-- =====================================================

-- Adicionar campos de assinatura do inspetor principal
ALTER TABLE public.lvs
ADD COLUMN IF NOT EXISTS assinatura_inspetor_principal TEXT NULL;

ALTER TABLE public.lvs
ADD COLUMN IF NOT EXISTS data_assinatura_inspetor_principal TIMESTAMP WITH TIME ZONE NULL;

-- Adicionar campos de assinatura do inspetor secundário
ALTER TABLE public.lvs
ADD COLUMN IF NOT EXISTS assinatura_inspetor_secundario TEXT NULL;

ALTER TABLE public.lvs
ADD COLUMN IF NOT EXISTS data_assinatura_inspetor_secundario TIMESTAMP WITH TIME ZONE NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.lvs.assinatura_inspetor_principal IS 'Assinatura digital do inspetor principal em formato base64';
COMMENT ON COLUMN public.lvs.data_assinatura_inspetor_principal IS 'Data e hora que a assinatura do inspetor principal foi registrada';
COMMENT ON COLUMN public.lvs.assinatura_inspetor_secundario IS 'Assinatura digital do inspetor secundário em formato base64';
COMMENT ON COLUMN public.lvs.data_assinatura_inspetor_secundario IS 'Data e hora que a assinatura do inspetor secundário foi registrada';

-- =====================================================
-- VALIDAÇÃO
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CAMPOS DE ASSINATURA ADICIONADOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Campos adicionados:';
  RAISE NOTICE '  • assinatura_inspetor_principal (TEXT)';
  RAISE NOTICE '  • data_assinatura_inspetor_principal (TIMESTAMP)';
  RAISE NOTICE '  • assinatura_inspetor_secundario (TEXT)';
  RAISE NOTICE '  • data_assinatura_inspetor_secundario (TIMESTAMP)';
  RAISE NOTICE '';
END $$;
