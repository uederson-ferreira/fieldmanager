-- ===================================================================
-- CRIAR BUCKET PARA EVIDÊNCIAS DE AÇÕES CORRETIVAS
-- ===================================================================
-- Script: 20250117_criar_bucket_acoes.sql
-- Descrição: Cria o bucket de armazenamento para evidências de ações corretivas
-- Data: 2025-01-17
-- ===================================================================

-- Verificar se o bucket já existe
-- Se não existir, este comando irá criá-lo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  'fotos-acoes',
  'fotos-acoes',
  true,  -- Público (acesso via URL pública)
  10485760,  -- 10MB limite por arquivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'fotos-acoes'
);

-- Política de leitura pública para o bucket
DROP POLICY IF EXISTS "Leitura pública de evidências de ações" ON storage.objects;
CREATE POLICY "Leitura pública de evidências de ações"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotos-acoes');

-- Política de upload (apenas usuários autenticados)
DROP POLICY IF EXISTS "Upload de evidências autenticado" ON storage.objects;
CREATE POLICY "Upload de evidências autenticado"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fotos-acoes'
  AND auth.role() = 'authenticated'
);

-- Política de atualização (apenas usuários autenticados)
DROP POLICY IF EXISTS "Atualização de evidências autenticado" ON storage.objects;
CREATE POLICY "Atualização de evidências autenticado"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fotos-acoes'
  AND auth.role() = 'authenticated'
);

-- Política de exclusão (apenas usuários autenticados)
DROP POLICY IF EXISTS "Exclusão de evidências autenticado" ON storage.objects;
CREATE POLICY "Exclusão de evidências autenticado"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fotos-acoes'
  AND auth.role() = 'authenticated'
);

-- Verificar resultado
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'fotos-acoes';
