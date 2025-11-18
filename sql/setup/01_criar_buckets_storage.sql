-- ===================================================================
-- FIELDMANAGER - CRIAÇÃO DE BUCKETS DE STORAGE
-- Data: 2025-11-18
-- Projeto: ysvyfdzczfxwhuyajzre (fieldmanager-production)
-- ===================================================================
--
-- Este script cria os buckets de storage no Supabase
-- Executar no SQL Editor do Supabase Dashboard
--
-- ===================================================================

-- ===================================================================
-- 1. CRIAR BUCKETS
-- ===================================================================

-- Bucket para execuções de módulos (checklists, inspeções, auditorias)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'execucoes',
  'execucoes',
  true,  -- Público para permitir acesso direto às fotos
  5242880,  -- 5MB por arquivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para termos ambientais/regulatórios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'termos',
  'termos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para ações corretivas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'acoes-corretivas',
  'acoes-corretivas',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos gerais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  true,
  10485760,  -- 10MB para PDFs
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 2. POLÍTICAS DE ACESSO (RLS)
-- ===================================================================

-- Habilitar RLS nos buckets
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- Política: Usuários autenticados podem fazer upload
-- ===================================================================

-- Execuções
CREATE POLICY "Usuários autenticados podem fazer upload em execucoes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'execucoes');

CREATE POLICY "Todos podem visualizar fotos de execucoes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'execucoes');

CREATE POLICY "Usuários podem deletar suas próprias fotos em execucoes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'execucoes');

-- Termos
CREATE POLICY "Usuários autenticados podem fazer upload em termos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'termos');

CREATE POLICY "Todos podem visualizar fotos de termos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'termos');

CREATE POLICY "Usuários podem deletar suas próprias fotos em termos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'termos');

-- Ações Corretivas
CREATE POLICY "Usuários autenticados podem fazer upload em acoes-corretivas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'acoes-corretivas');

CREATE POLICY "Todos podem visualizar fotos de acoes-corretivas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'acoes-corretivas');

CREATE POLICY "Usuários podem deletar suas próprias fotos em acoes-corretivas"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'acoes-corretivas');

-- Documentos
CREATE POLICY "Usuários autenticados podem fazer upload em documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Todos podem visualizar documentos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentos');

CREATE POLICY "Usuários podem deletar seus próprios documentos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos');

-- ===================================================================
-- 3. VERIFICAR CRIAÇÃO
-- ===================================================================

-- Listar todos os buckets criados
SELECT
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as "max_size_mb",
  array_length(allowed_mime_types, 1) as "tipos_permitidos",
  created_at
FROM storage.buckets
WHERE name IN ('execucoes', 'termos', 'acoes-corretivas', 'documentos')
ORDER BY name;

-- ===================================================================
-- RESULTADO ESPERADO:
-- ===================================================================
-- id                  | name              | public | max_size_mb | tipos_permitidos | created_at
-- --------------------+-------------------+--------+-------------+------------------+------------
-- acoes-corretivas    | acoes-corretivas  | true   | 5           | 4                | 2025-11-18
-- documentos          | documentos        | true   | 10          | 5                | 2025-11-18
-- execucoes           | execucoes         | true   | 5           | 4                | 2025-11-18
-- termos              | termos            | true   | 5           | 4                | 2025-11-18
-- ===================================================================
