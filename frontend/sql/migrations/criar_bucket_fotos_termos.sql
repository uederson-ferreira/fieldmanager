-- ===================================================================
-- CRIAR BUCKET FOTOS-TERMOS NO SUPABASE STORAGE
-- ===================================================================

-- 1. CRIAR BUCKET FOTOS-TERMOS
-- ===================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-termos',
  'fotos-termos',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. CRIAR POLÍTICAS RLS PARA O BUCKET
-- ===================================================================

-- Política para permitir upload de fotos de termos
CREATE POLICY "Usuários autenticados podem fazer upload de fotos de termos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'fotos-termos' AND
  (storage.foldername(name))[1] = 'termos'
);

-- Política para permitir visualização de fotos de termos
CREATE POLICY "Usuários autenticados podem visualizar fotos de termos" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'fotos-termos' AND
  (storage.foldername(name))[1] = 'termos'
);

-- Política para permitir atualização de fotos de termos
CREATE POLICY "Usuários autenticados podem atualizar fotos de termos" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'fotos-termos' AND
  (storage.foldername(name))[1] = 'termos'
)
WITH CHECK (
  bucket_id = 'fotos-termos' AND
  (storage.foldername(name))[1] = 'termos'
);

-- Política para permitir exclusão de fotos de termos
CREATE POLICY "Usuários autenticados podem deletar fotos de termos" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'fotos-termos' AND
  (storage.foldername(name))[1] = 'termos'
);

-- 3. VERIFICAR SE O BUCKET FOI CRIADO
-- ===================================================================
SELECT 
  'BUCKET STATUS' as tipo,
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE id = 'fotos-termos';

-- 4. VERIFICAR POLÍTICAS CRIADAS
-- ===================================================================
SELECT 
  'POLÍTICAS STORAGE' as tipo,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%termos%'
ORDER BY policyname;

-- 5. LOG DE CONCLUSÃO
-- ===================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Bucket fotos-termos criado/verificado';
  RAISE NOTICE '✅ Políticas RLS configuradas para fotos de termos';
  RAISE NOTICE '✅ Usuários autenticados podem gerenciar fotos de termos';
  RAISE NOTICE '✅ Teste o upload de fotos agora';
END $$; 