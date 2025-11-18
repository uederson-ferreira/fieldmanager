-- ===================================================================
-- SCRIPT PARA CRIAR PERFIS PADRÃO - ECOFIELD SYSTEM
-- Localização: sql/criar_perfis_padrao.sql
-- ===================================================================

-- Limpar perfis existentes (opcional)
-- DELETE FROM public.perfis;

-- Inserir perfis padrão
INSERT INTO public.perfis (nome, descricao, permissoes, ativo) VALUES
(
  'ADM',
  'Administrador do sistema com acesso total',
  '{
    "lvs": ["read", "write", "delete", "admin"],
    "termos": ["read", "write", "delete", "admin"],
    "rotinas": ["read", "write", "delete", "admin"],
    "metas": ["read", "write", "delete", "admin"],
    "fotos": ["upload", "view", "delete", "admin"],
    "relatorios": ["view", "export", "admin"],
    "usuarios": ["view", "create", "edit", "delete"],
    "perfis": ["view", "create", "edit", "delete"],
    "sistema": ["config", "backup", "logs"],
    "admin": true,
    "demo": false
  }'::jsonb,
  true
),
(
  'TMA_GESTAO',
  'Gestor de equipe técnica',
  '{
    "lvs": ["read", "write", "admin"],
    "termos": ["read", "write", "admin"],
    "rotinas": ["read", "write", "admin"],
    "metas": ["read", "write", "admin"],
    "fotos": ["upload", "view", "delete"],
    "relatorios": ["view", "export"],
    "usuarios": ["view", "create", "edit"],
    "perfis": ["view"],
    "sistema": ["config"],
    "admin": false,
    "demo": false
  }'::jsonb,
  true
),
(
  'TMA_CAMPO',
  'Técnico de campo',
  '{
    "lvs": ["read", "write"],
    "termos": ["read", "write"],
    "rotinas": ["read", "write"],
    "metas": ["read"],
    "fotos": ["upload", "view"],
    "relatorios": ["view"],
    "usuarios": ["view"],
    "perfis": [],
    "sistema": [],
    "admin": false,
    "demo": false
  }'::jsonb,
  true
),
(
  'DESENVOLVEDOR',
  'Desenvolvedor do sistema',
  '{
    "lvs": ["read", "write", "delete", "admin"],
    "termos": ["read", "write", "delete", "admin"],
    "rotinas": ["read", "write", "delete", "admin"],
    "metas": ["read", "write", "delete", "admin"],
    "fotos": ["upload", "view", "delete", "admin"],
    "relatorios": ["view", "export", "admin"],
    "usuarios": ["view", "create", "edit", "delete"],
    "perfis": ["view", "create", "edit", "delete"],
    "sistema": ["config", "backup", "logs"],
    "admin": true,
    "demo": false
  }'::jsonb,
  true
)
ON CONFLICT (nome) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  permissoes = EXCLUDED.permissoes,
  ativo = EXCLUDED.ativo,
  updated_at = CURRENT_TIMESTAMP;

-- Verificar perfis criados
SELECT 
  id,
  nome,
  descricao,
  ativo,
  created_at,
  updated_at
FROM public.perfis 
ORDER BY nome; 