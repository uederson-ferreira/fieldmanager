-- ===================================================================
-- DIAGNÓSTICO DE AUTENTICAÇÃO E AUTH.UID()
-- ===================================================================

-- 1. Verificar se o usuário está autenticado
SELECT 
  auth.uid() as auth_uid,
  auth.role() as auth_role,
  auth.email() as auth_email;

-- 2. Verificar se o auth.uid() corresponde ao usuário logado
SELECT 
  u.id as user_id,
  u.email,
  u.nome as user_nome,
  p.nome as perfil_nome,
  p.id as perfil_id,
  CASE 
    WHEN u.id = auth.uid() THEN 'CORRESPONDE'
    ELSE 'NÃO CORRESPONDE'
  END as correspondencia
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@sistema.com';

-- 3. Testar a política diretamente
SELECT 
  EXISTS (
    SELECT 1 FROM usuarios u 
    JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome IN ('admin', 'developer', 'ADM')
  ) as politica_admin_funciona;

-- 4. Verificar se o usuário tem perfil correto
SELECT 
  u.id,
  u.email,
  u.nome,
  p.nome as perfil,
  p.nome IN ('admin', 'developer', 'ADM') as tem_perfil_admin
FROM usuarios u
JOIN perfis p ON u.perfil_id = p.id
WHERE u.email = 'admin@sistema.com';

-- 5. Teste de inserção com auth.uid() explícito
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
  'Meta de teste - auth.uid()', 
  'equipe', 
  true, 
  auth.uid()
);
*/

-- 6. Verificar se há problemas de sessão
-- Nota: Esta consulta pode não funcionar dependendo das permissões
-- SELECT 
--   session_id,
--   user_id,
--   created_at,
--   expires_at
-- FROM auth.sessions 
-- WHERE user_id = auth.uid();

-- 7. Verificar configurações do Supabase
SELECT 
  name,
  setting as value
FROM pg_settings 
WHERE name IN ('search_path', 'role', 'session_authorization');

-- 8. Teste alternativo - inserção direta (se auth.uid() não funcionar)
-- Descomente e substitua o ID correto:
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
  'Meta de teste - ID direto', 
  'equipe', 
  true, 
  '0b30c325-abfe-45a4-b1f5-a65243c0e3d8'
);
*/ 