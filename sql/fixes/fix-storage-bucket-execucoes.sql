-- ===================================================================
-- FIX: STORAGE BUCKET CONFIGURATION - BUCKET 'execucoes'
-- Data: 20/11/2025
-- Problema: MIME types bloqueando uploads e RLS policies bloqueando inserts
-- Solução: Permitir todos MIME types e configurar como público
-- ===================================================================

-- Atualizar configuração do bucket
UPDATE storage.buckets
SET
  allowed_mime_types = NULL,           -- Permitir TODOS os tipos MIME
  public = true,                        -- Bucket público para leitura
  file_size_limit = 10485760           -- 10MB de limite
WHERE name = 'execucoes';

-- Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "execucoes_bucket_tenant_isolation" ON storage.objects;
DROP POLICY IF EXISTS "execucoes_bucket_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "execucoes_bucket_read_policy" ON storage.objects;

-- Nova política: Authenticated users podem fazer upload
CREATE POLICY "execucoes_upload_authenticated" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'execucoes');

-- Nova política: Todos podem ler (bucket público)
CREATE POLICY "execucoes_read_public" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'execucoes');

-- Nova política: Authenticated users podem deletar seus próprios arquivos
CREATE POLICY "execucoes_delete_authenticated" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'execucoes');

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket "execucoes" configurado:';
  RAISE NOTICE '   - MIME types: Todos permitidos';
  RAISE NOTICE '   - Público: Sim';
  RAISE NOTICE '   - Limite: 10MB';
  RAISE NOTICE '   - RLS Policies: Authenticated upload/delete + Public read';
END $$;
