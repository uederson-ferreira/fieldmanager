-- ===================================================================
-- INSERIR DADOS DE EXEMPLO PARA SISTEMA FUNCIONAR
-- ===================================================================

-- 1. Inserir metas de exemplo se não existirem
INSERT INTO metas (
  id,
  tipo_meta,
  categoria,
  periodo,
  ano,
  mes,
  meta_quantidade,
  descricao,
  ativa,
  escopo,
  created_at,
  updated_at
) VALUES 
-- Meta mensal de LVs
(
  gen_random_uuid(),
  'lv',
  'lv_residuos',
  'mensal',
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  EXTRACT(MONTH FROM CURRENT_DATE)::integer,
  15,
  'Meta mensal de 15 Listas de Verificação de Resíduos',
  true,
  'individual',
  NOW(),
  NOW()
),
-- Meta mensal de Termos
(
  gen_random_uuid(),
  'termo',
  'notificacao',
  'mensal',
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  EXTRACT(MONTH FROM CURRENT_DATE)::integer,
  8,
  'Meta mensal de 8 Termos Ambientais (Notificações)',
  true,
  'individual',
  NOW(),
  NOW()
),
-- Meta semanal de Rotinas
(
  gen_random_uuid(),
  'rotina',
  'atividades_campo',
  'semanal',
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer,
  12,
  'Meta semanal de 12 Atividades de Rotina',
  true,
  'individual',
  NOW(),
  NOW()
),
-- Meta de equipe - LVs
(
  gen_random_uuid(),
  'lv',
  'todas',
  'mensal',
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  EXTRACT(MONTH FROM CURRENT_DATE)::integer,
  50,
  'Meta de equipe: 50 LVs por mês',
  true,
  'equipe',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2. Atribuir metas a usuários ativos (apenas se não houver atribuições)
INSERT INTO metas_atribuicoes (
  id,
  meta_id,
  tma_id,
  meta_quantidade_individual,
  responsavel,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  m.id,
  u.id,
  CASE 
    WHEN m.escopo = 'individual' THEN m.meta_quantidade
    ELSE m.meta_quantidade / (SELECT COUNT(*) FROM usuarios WHERE ativo = true AND perfil_id IN (
      SELECT id FROM perfis WHERE nome ILIKE '%tma%'
    ))
  END,
  true,
  NOW(),
  NOW()
FROM metas m
CROSS JOIN usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE m.ativa = true 
  AND u.ativo = true 
  AND p.nome ILIKE '%tma%'
  AND NOT EXISTS (
    SELECT 1 FROM metas_atribuicoes ma 
    WHERE ma.meta_id = m.id AND ma.tma_id = u.id
  );

-- 3. Criar progresso inicial para as metas atribuídas
INSERT INTO progresso_metas (
  id,
  meta_id,
  tma_id,
  periodo,
  ano,
  mes,
  semana,
  dia,
  quantidade_atual,
  percentual_atual,
  status,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  ma.meta_id,
  ma.tma_id,
  m.periodo,
  m.ano,
  m.mes,
  CASE WHEN m.periodo = 'semanal' THEN EXTRACT(WEEK FROM CURRENT_DATE)::integer ELSE NULL END,
  CASE WHEN m.periodo = 'diario' THEN EXTRACT(DAY FROM CURRENT_DATE)::integer ELSE NULL END,
  FLOOR(RANDOM() * (ma.meta_quantidade_individual / 2))::integer, -- Progresso aleatório até metade da meta
  0, -- Será calculado por trigger
  'em_andamento',
  NOW(),
  NOW()
FROM metas_atribuicoes ma
JOIN metas m ON ma.meta_id = m.id
WHERE NOT EXISTS (
  SELECT 1 FROM progresso_metas pm 
  WHERE pm.meta_id = ma.meta_id 
    AND pm.tma_id = ma.tma_id
    AND pm.ano = m.ano
    AND (pm.mes = m.mes OR m.mes IS NULL)
);

-- 4. Inserir algumas atividades de rotina de exemplo se não houver nenhuma
INSERT INTO atividades_rotina (
  id,
  data_atividade,
  hora_inicio,
  hora_fim,
  area_id,
  atividade,
  descricao,
  km_percorrido,
  tma_responsavel_id,
  encarregado_id,
  status,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  CURRENT_DATE - (RANDOM() * 30)::integer, -- Últimos 30 dias
  '08:00'::time,
  '12:00'::time,
  (SELECT id FROM areas LIMIT 1), -- Primeira área disponível
  'Inspeção de rotina ' || (ROW_NUMBER() OVER ()),
  'Atividade de exemplo para demonstração do sistema',
  ROUND((RANDOM() * 20 + 5)::numeric, 1), -- 5 a 25 km
  u.id,
  (SELECT id FROM encarregados LIMIT 1), -- Primeiro encarregado disponível
  CASE 
    WHEN RANDOM() < 0.7 THEN 'Concluída'
    WHEN RANDOM() < 0.9 THEN 'Em Execução'
    ELSE 'Planejada'
  END,
  NOW(),
  NOW()
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE u.ativo = true 
  AND p.nome ILIKE '%tma%'
  AND NOT EXISTS (SELECT 1 FROM atividades_rotina LIMIT 1)
LIMIT 10; -- Criar 10 atividades de exemplo

-- 5. Verificar resultados
SELECT 'Metas criadas' as item, COUNT(*) as quantidade FROM metas WHERE ativa = true
UNION ALL
SELECT 'Atribuições criadas', COUNT(*) FROM metas_atribuicoes
UNION ALL
SELECT 'Progresso criado', COUNT(*) FROM progresso_metas
UNION ALL
SELECT 'Rotinas criadas', COUNT(*) FROM atividades_rotina
UNION ALL
SELECT 'Usuários TMA ativos', COUNT(*) FROM usuarios u JOIN perfis p ON u.perfil_id = p.id WHERE u.ativo = true AND p.nome ILIKE '%tma%'; 