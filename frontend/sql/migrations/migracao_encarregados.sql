-- ===================================================================
-- MIGRAÇÃO PARA NOVA TABELA ENCARREGADOS - ECOFIELD SYSTEM
-- ===================================================================

-- 1. VERIFICAR ENCARREGADOS ATUAIS NA TABELA USUARIOS
SELECT 
  'ENCARREGADOS ATUAIS' as tipo,
  u.id,
  u.nome,
  u.email,
  u.telefone,
  p.nome as perfil
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.ativo = true 
  AND p.nome = 'TMA Campo'
ORDER BY u.nome;

-- 2. MIGRAR ENCARREGADOS EXISTENTES (OPCIONAL)
-- Descomente se quiser migrar dados existentes
/*
INSERT INTO public.encarregados (nome_completo, apelido, telefone, empresa)
SELECT 
  u.nome as nome_completo,
  SPLIT_PART(u.nome, ' ', 1) as apelido, -- Primeiro nome como apelido
  u.telefone,
  'Empresa não especificada' as empresa
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.ativo = true 
  AND p.nome = 'TMA Campo'
  AND NOT EXISTS (
    SELECT 1 FROM public.encarregados e 
    WHERE e.nome_completo = u.nome
  );
*/

-- 3. ATUALIZAR TABELA ATIVIDADES_ROTINA (quando implementar)
-- ALTER TABLE public.atividades_rotina 
-- ADD COLUMN encarregado_id_new UUID REFERENCES public.encarregados(id);

-- 4. VERIFICAR ESTRUTURA FINAL
SELECT 
  'ESTRUTURA FINAL' as tipo,
  COUNT(*) as total_encarregados
FROM public.encarregados;

-- 5. MOSTRAR DIFERENÇAS ENTRE TABELAS
SELECT 
  'COMPARAÇÃO' as tipo,
  'usuarios' as tabela,
  COUNT(*) as total_usuarios
FROM public.usuarios u
LEFT JOIN public.perfis p ON u.perfil_id = p.id
WHERE u.ativo = true AND p.nome = 'TMA Campo'

UNION ALL

SELECT 
  'COMPARAÇÃO' as tipo,
  'encarregados' as tabela,
  COUNT(*) as total_encarregados
FROM public.encarregados
WHERE ativo = true; 