-- ===================================================================
-- RESTAURAR FOREIGN KEY TERMOS_AMBIENTAIS -> USUARIOS
-- Localização: sql/restaurar_fk_termos_usuarios.sql
-- ===================================================================

-- Este script restaura a foreign key que aponta para a tabela usuarios
-- necessária para a arquitetura híbrida

-- 1. VERIFICAR SE A FK EXISTE
-- ===================================================================
SELECT 
    'VERIFICANDO FK' as info,
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'termos_ambientais'
    AND ccu.table_name = 'usuarios';

-- 2. RESTAURAR A FOREIGN KEY SE NÃO EXISTIR
-- ===================================================================
DO $$
BEGIN
    -- Verificar se a constraint existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'termos_ambientais_emitido_por_usuario_id_fkey'
        AND table_name = 'termos_ambientais'
    ) THEN
        -- Adicionar a foreign key
        ALTER TABLE termos_ambientais 
        ADD CONSTRAINT termos_ambientais_emitido_por_usuario_id_fkey 
        FOREIGN KEY (emitido_por_usuario_id) REFERENCES usuarios (id);
        
        RAISE NOTICE '✅ Foreign key restaurada com sucesso';
    ELSE
        RAISE NOTICE 'ℹ️ Foreign key já existe';
    END IF;
END $$;

-- 3. VERIFICAR SE FOI RESTAURADA
-- ===================================================================
SELECT 
    'VERIFICAÇÃO FINAL' as info,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ FK RESTAURADA COM SUCESSO'
        ELSE '❌ FK AINDA NÃO EXISTE'
    END as status
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'termos_ambientais'
    AND ccu.table_name = 'usuarios';

-- 4. VERIFICAR ESTRUTURA FINAL
-- ===================================================================
SELECT 
    'ESTRUTURA FINAL' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'termos_ambientais'
AND column_name = 'emitido_por_usuario_id'
ORDER BY ordinal_position; 