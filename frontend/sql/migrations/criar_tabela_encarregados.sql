-- ===================================================================
-- CRIAÇÃO DA TABELA ENCARREGADOS - ECOFIELD SYSTEM
-- ===================================================================

-- 1. CRIAR TABELA ENCARREGADOS
CREATE TABLE IF NOT EXISTS public.encarregados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  apelido TEXT,
  telefone TEXT,
  empresa_contratada_id UUID REFERENCES public.empresas_contratadas(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_encarregados_ativo ON public.encarregados(ativo);
CREATE INDEX IF NOT EXISTS idx_encarregados_nome ON public.encarregados(nome_completo);
CREATE INDEX IF NOT EXISTS idx_encarregados_empresa ON public.encarregados(empresa_contratada_id);

-- 3. CRIAR TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_encarregados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_encarregados_updated_at
  BEFORE UPDATE ON public.encarregados
  FOR EACH ROW
  EXECUTE FUNCTION update_encarregados_updated_at();

-- 4. CONFIGURAR RLS (ROW LEVEL SECURITY)
ALTER TABLE public.encarregados ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ver encarregados ativos
CREATE POLICY "Usuários podem ver encarregados ativos" ON public.encarregados
  FOR SELECT USING (ativo = true);

-- Política: Usuários autenticados podem inserir encarregados
CREATE POLICY "Usuários podem inserir encarregados" ON public.encarregados
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política: Usuários autenticados podem atualizar encarregados
CREATE POLICY "Usuários podem atualizar encarregados" ON public.encarregados
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política: Usuários autenticados podem deletar encarregados
CREATE POLICY "Usuários podem deletar encarregados" ON public.encarregados
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- Primeiro, verificar se existem empresas para referenciar
INSERT INTO public.encarregados (nome_completo, apelido, telefone, empresa_contratada_id) 
SELECT 
  'João Silva Santos', 
  'João', 
  '(11) 99999-9999', 
  id
FROM public.empresas_contratadas 
WHERE nome LIKE '%ABC%' 
LIMIT 1;

INSERT INTO public.encarregados (nome_completo, apelido, telefone, empresa_contratada_id) 
SELECT 
  'Maria Oliveira Costa', 
  'Maria', 
  '(11) 88888-8888', 
  id
FROM public.empresas_contratadas 
WHERE nome LIKE '%XYZ%' 
LIMIT 1;

INSERT INTO public.encarregados (nome_completo, apelido, telefone, empresa_contratada_id) 
SELECT 
  'Carlos Ferreira Lima', 
  'Carlos', 
  '(11) 77777-7777', 
  id
FROM public.empresas_contratadas 
WHERE nome LIKE '%DEF%' 
LIMIT 1;

-- 6. VERIFICAR CRIAÇÃO
SELECT 
  'TABELA CRIADA' as status,
  COUNT(*) as total_encarregados
FROM public.encarregados;

-- 7. MOSTRAR ESTRUTURA
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'encarregados' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 