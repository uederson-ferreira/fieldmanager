-- =====================================================
-- POPULAR LVs FALTANTES
-- Data: 04/01/2025
-- Descrição: Popular lv_configuracoes com as 24 LVs faltantes
-- Baseado em: categorias_lv_rows.sql (30 categorias)
-- Existentes: 6 LVs (01, 02, 03, 04, 05, 06)
-- Faltantes: 24 LVs (07 a 30)
-- =====================================================

-- LV 07 - Fauna
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('07', 'Fauna', '07.Fauna', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 08 - Concreto
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('08', 'Concreto', '08.Concreto', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 09 - Banheiro Químico
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('09', 'Banheiro Químico', '09.Banheiro Químico', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 10 - Gestão Ambiental
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('10', 'Gestão Ambiental', '10.Gestão Ambiental', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 11 - Proteções Ambientais
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('11', 'Proteções Ambientais', '11.Proteções Ambientais', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 12 - Supressão Vegetal
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('12', 'Supressão Vegetal', '12.Supressão Vegetal', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 13 - Equipamentos
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('13', 'Equipamentos', '13.Equipamentos', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 14 - Revegetação
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('14', 'Revegetação', '14.Revegetação', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 15 - 5S
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('15', '5S', '15.5S', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 16 - Preparação e Mobilização
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('16', 'Preparação e Mobilização', '16.Preparação e Mobilização', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 17 - Desmobilização
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('17', 'Desmobilização', '17.Desmobilização', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 18 - Assoreamento e Vazão
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('18', 'Assoreamento e Vazão', '18.Assoreamento e Vazão', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 19 - Feições Erosivas
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('19', 'Feições Erosivas', '19.Feições Erosivas', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 20 - Níveis de Pressão Sonora e Vibração
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('20', 'Níveis de Pressão Sonora e Vibração', '20.Níveis de Pressão Sonora e Vibração', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 21 - Emissões Atmosféricas (categoria 21)
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('21', 'Emissões Atmosféricas', '21.Emissões Atmosféricas', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 22 - Transposição dos Talvegues
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('22', 'Transposição dos Talvegues', '22.Transposição dos Talvegues', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 23 - Efluentes
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('23', 'Efluentes', '23.Efluentes', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 24 - Gerenciamento de Resíduos
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('24', 'Gerenciamento de Resíduos', '24.Gerenciamento de Resíduos', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 25 - Plantio Compensatório
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('25', 'Plantio Compensatório', '25.Plantio Compensatório', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 26 - Recuperação de APP
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('26', 'Recuperação de APP', '26.Recuperação de APP', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 27 - Educação Ambiental
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('27', 'Educação Ambiental', '27.Educação Ambiental', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 28 - Comunicação Social
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('28', 'Comunicação Social', '28.Comunicação Social', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 29 - Qualidade das Águas Superficiais
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('29', 'Qualidade das Águas Superficiais', '29.Qualidade das Águas Superficiais', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- LV 30 - Inspeção em Cozinha Industrial
INSERT INTO lv_configuracoes (tipo_lv, nome_lv, nome_completo, revisao, data_revisao)
VALUES ('30', 'Inspeção em Cozinha Industrial', '30.Inspeção em Cozinha Industrial', 'Revisão 09', '2023-05-01')
ON CONFLICT (tipo_lv) DO NOTHING;

-- =====================================================
-- VALIDAÇÃO
-- =====================================================
DO $$
DECLARE
  v_total INT;
  v_antes INT := 6;
  v_adicionadas INT;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO v_total FROM lv_configuracoes;
  v_adicionadas := v_total - v_antes;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ POPULAÇÃO DE LVs CONCLUÍDA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Estatísticas:';
  RAISE NOTICE '  • LVs antes: %', v_antes;
  RAISE NOTICE '  • LVs adicionadas: %', v_adicionadas;
  RAISE NOTICE '  • Total de LVs agora: %', v_total;
  RAISE NOTICE '';

  IF v_total = 30 THEN
    RAISE NOTICE '🎉 SUCESSO! Todas as 30 LVs foram populadas!';
  ELSE
    RAISE NOTICE '⚠️ Atenção: Esperado 30 LVs, encontradas %', v_total;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '📋 Lista de LVs configuradas:';

  FOR rec IN
    SELECT tipo_lv, nome_lv
    FROM lv_configuracoes
    ORDER BY tipo_lv
  LOOP
    RAISE NOTICE '  • LV % - %', rec.tipo_lv, rec.nome_lv;
  END LOOP;

  RAISE NOTICE '';
END $$;
