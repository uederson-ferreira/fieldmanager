-- Script para criar o usuário admin na tabela usuarios
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se o usuário já existe
SELECT * FROM usuarios WHERE email = 'admin@ecofield.com';

-- Se não existir, vamos criar
INSERT INTO usuarios (
  auth_user_id,
  nome,
  email,
  matricula,
  perfil_id,
  ativo,
  created_at,
  updated_at
) VALUES (
  '09782e1c-ec01-4769-8de7-f1608df9868a', -- ID do usuário no Auth
  'Administrador EcoField',
  'admin@ecofield.com',
  'ADM001',
  '5d396506-658b-401f-888c-cad2bd4c9a56', -- ID do perfil ADM
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verificar se foi criado
SELECT * FROM usuarios WHERE email = 'admin@ecofield.com'; 