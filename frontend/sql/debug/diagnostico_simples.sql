-- ===================================================================
-- DIAGNÓSTICO SIMPLES DE AUTENTICAÇÃO
-- ===================================================================

-- 1. Verificar se o usuário está autenticado
SELECT 
  auth.uid() as auth_uid,
  auth.role() as auth_role,
  auth.email() as auth_email;

-- 2. Verificar dados do usuário admin
SELECT 
  u.id as user_id,
  u.email,
  u.nome as user_nome,
  p.nome as perfil_nome,
  p.id as perfil_id
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@sistema.com';

-- 3. Verificar se auth.uid() corresponde ao usuário
SELECT 
  CASE 
    WHEN u.id = auth.uid() THEN 'CORRESPONDE'
    ELSE 'NÃO CORRESPONDE'
  END as correspondencia,
  u.id as user_id,
  auth.uid() as auth_uid
FROM usuarios u
WHERE u.email = 'admin@sistema.com';

-- 4. Testar se a política funciona
SELECT 
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome IN ('admin', 'developer', 'ADM')
  ) as politica_admin_funciona;

-- 5. Verificar se o perfil está correto
SELECT 
  u.email,
  p.nome as perfil,
  p.nome IN ('admin', 'developer', 'ADM') as tem_perfil_admin
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@sistema.com';

-- 6. Teste de inserção simples
-- Descomente para testar:
/*
INSERT INTO metas (
  tipo_meta, 
  categoria, 
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
  'teste', 
  'mensal', 
  2025, 
  2, 
  10, 
  'Meta de teste - diagnóstico', 
  'equipe', 
  true, 
  auth.uid()
);
*/ 