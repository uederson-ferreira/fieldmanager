-- ===================================================================
-- CRIAR METAS DE TESTE - ECOFIELD
-- ===================================================================
-- Este script cria metas de teste limpas para validar o sistema

-- 1. BUSCAR USUÁRIO ADMIN PARA CRIAR AS METAS
-- ===================================================================
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Buscar primeiro usuário admin ou qualquer usuário ativo
  SELECT id INTO admin_id 
  FROM usuarios 
  WHERE ativo = true 
  LIMIT 1;
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário ativo encontrado para criar metas';
  END IF;

  -- 2. CRIAR METAS DE EQUIPE
  -- ===================================================================
  
  -- Meta de LVs mensal para equipe
  INSERT INTO metas (
    tipo_meta, 
    periodo, 
    ano, 
    mes, 
    meta_quantidade, 
    descricao, 
    escopo, 
    ativa, 
    criada_por
  ) VALUES (
    'lv',
    'mensal',
    EXTRACT(YEAR FROM NOW()),
    EXTRACT(MONTH FROM NOW()),
    50,
    'Meta mensal de Listas de Verificação - Equipe',
    'equipe',
    true,
    admin_id
  );

  -- Meta de termos mensal para equipe
  INSERT INTO metas (
    tipo_meta, 
    periodo, 
    ano, 
    mes, 
    meta_quantidade, 
    descricao, 
    escopo, 
    ativa, 
    criada_por
  ) VALUES (
    'termo',
    'mensal',
    EXTRACT(YEAR FROM NOW()),
    EXTRACT(MONTH FROM NOW()),
    20,
    'Meta mensal de Termos Ambientais - Equipe',
    'equipe',
    true,
    admin_id
  );

  -- Meta de rotinas mensal para equipe
  INSERT INTO metas (
    tipo_meta, 
    periodo, 
    ano, 
    mes, 
    meta_quantidade, 
    descricao, 
    escopo, 
    ativa, 
    criada_por
  ) VALUES (
    'rotina',
    'mensal',
    EXTRACT(YEAR FROM NOW()),
    EXTRACT(MONTH FROM NOW()),
    100,
    'Meta mensal de Atividades de Rotina - Equipe',
    'equipe',
    true,
    admin_id
  );

  -- 3. CRIAR METAS INDIVIDUAIS
  -- ===================================================================
  
  -- Meta individual de LVs para cada TMA
  INSERT INTO metas (
    tipo_meta, 
    periodo, 
    ano, 
    mes, 
    meta_quantidade, 
    descricao, 
    escopo, 
    ativa, 
    criada_por
  ) VALUES (
    'lv',
    'mensal',
    EXTRACT(YEAR FROM NOW()),
    EXTRACT(MONTH FROM NOW()),
    10,
    'Meta individual de LVs - TMA',
    'individual',
    true,
    admin_id
  );

  -- Meta individual de termos para cada TMA
  INSERT INTO metas (
    tipo_meta, 
    periodo, 
    ano, 
    mes, 
    meta_quantidade, 
    descricao, 
    escopo, 
    ativa, 
    criada_por
  ) VALUES (
    'termo',
    'mensal',
    EXTRACT(YEAR FROM NOW()),
    EXTRACT(MONTH FROM NOW()),
    5,
    'Meta individual de Termos - TMA',
    'individual',
    true,
    admin_id
  );

  -- Meta individual de rotinas para cada TMA
  INSERT INTO metas (
    tipo_meta, 
    periodo, 
    ano, 
    mes, 
    meta_quantidade, 
    descricao, 
    escopo, 
    ativa, 
    criada_por
  ) VALUES (
    'rotina',
    'mensal',
    EXTRACT(YEAR FROM NOW()),
    EXTRACT(MONTH FROM NOW()),
    25,
    'Meta individual de Rotinas - TMA',
    'individual',
    true,
    admin_id
  );

  RAISE NOTICE '✅ Metas de teste criadas com sucesso!';
END $$;

-- 4. ATRIBUIR METAS INDIVIDUAIS A TODOS OS TMAs
-- ===================================================================
DO $$
DECLARE
  meta_record RECORD;
  tma_record RECORD;
BEGIN
  -- Para cada meta individual
  FOR meta_record IN 
    SELECT id FROM metas WHERE escopo = 'individual'
  LOOP
    -- Para cada TMA ativo
    FOR tma_record IN 
      SELECT u.id 
      FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id 
      WHERE p.nome = 'tma' AND u.ativo = true
    LOOP
      -- Atribuir meta ao TMA
      INSERT INTO metas_atribuicoes (meta_id, tma_id, responsavel)
      VALUES (meta_record.id, tma_record.id, true)
      ON CONFLICT (meta_id, tma_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '✅ Metas individuais atribuídas aos TMAs!';
END $$;

-- 5. VERIFICAR METAS CRIADAS
-- ===================================================================
SELECT '=== METAS CRIADAS ===' as info;

SELECT 
  id,
  tipo_meta,
  descricao,
  escopo,
  meta_quantidade,
  periodo,
  ano,
  mes,
  ativa
FROM metas
ORDER BY escopo, tipo_meta;

SELECT '=== ATRIBUIÇÕES ===' as info;

SELECT 
  ma.id,
  m.descricao as meta,
  m.escopo,
  u.nome as tma,
  ma.responsavel
FROM metas_atribuicoes ma
JOIN metas m ON ma.meta_id = m.id
JOIN usuarios u ON ma.tma_id = u.id
ORDER BY m.escopo, m.tipo_meta, u.nome;

-- 6. MENSAGEM FINAL
-- ===================================================================
SELECT '🎉 METAS DE TESTE CRIADAS COM SUCESSO!' as resultado;
SELECT 'Agora você pode testar o sistema criando termos, LVs e rotinas!' as instrucao; 