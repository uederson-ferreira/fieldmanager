-- ===================================================================
-- MIGRAÇÃO PARA ESTRUTURA UNIFICADA DE LVs
-- ===================================================================

-- FASE 1: CRIAR ESTRUTURA UNIFICADA
-- ===================================================================

-- 1. Tabela principal unificada de LVs
CREATE TABLE public.lvs (
  id uuid not null default extensions.uuid_generate_v4(),
  tipo_lv text not null, -- '01'=Resíduos, '02'=Segurança, '03'=Água, etc.
  nome_lv text not null, -- 'Resíduos', 'Segurança', 'Água', etc.
  usuario_id uuid not null,
  usuario_nome text not null,
  usuario_matricula text null,
  usuario_email text not null default '',
  data_inspecao date not null default CURRENT_DATE,
  data_preenchimento timestamp with time zone not null default CURRENT_TIMESTAMP,
  area text not null,
  responsavel_area text null,
  responsavel_tecnico text not null default '',
  responsavel_empresa text not null default '',
  inspetor_principal text not null,
  inspetor_secundario text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  gps_precisao numeric(10, 2) null,
  endereco_gps text null,
  observacoes text null, -- Campo legado para compatibilidade
  observacoes_gerais text null,
  total_fotos integer null default 0,
  total_conformes integer null default 0,
  total_nao_conformes integer null default 0,
  total_nao_aplicaveis integer null default 0,
  percentual_conformidade numeric(5, 2) null default 0,
  status text not null default 'concluido',
  sincronizado boolean not null default true,
  numero_sequencial serial not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint lvs_pkey primary key (id),
  constraint lvs_usuario_id_fkey foreign key (usuario_id) references usuarios (id),
  constraint lvs_status_check check (
    status = any (array['concluido', 'rascunho', 'concluida'])
  )
);

-- 2. Tabela unificada de avaliações
CREATE TABLE public.lv_avaliacoes (
  id uuid not null default extensions.uuid_generate_v4(),
  lv_id uuid not null,
  tipo_lv text not null, -- Para otimização de consultas
  item_id integer not null,
  item_codigo text not null,
  item_pergunta text not null,
  avaliacao text not null,
  observacao text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint lv_avaliacoes_pkey primary key (id),
  constraint lv_avaliacoes_lv_id_fkey foreign key (lv_id) references lvs (id) on delete CASCADE,
  constraint lv_avaliacoes_lv_item_unique unique (lv_id, item_id),
  constraint lv_avaliacoes_avaliacao_check check (
    avaliacao = any (array['C', 'NC', 'NA', 'conforme', 'nao_conforme', 'nao_aplicavel'])
  )
);

-- 3. Tabela unificada de fotos
CREATE TABLE public.lv_fotos (
  id uuid not null default extensions.uuid_generate_v4(),
  lv_id uuid not null,
  tipo_lv text not null, -- Para otimização de consultas
  item_id integer not null,
  nome_arquivo text not null,
  url_arquivo text not null,
  descricao text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint lv_fotos_pkey primary key (id),
  constraint lv_fotos_lv_id_fkey foreign key (lv_id) references lvs (id) on delete CASCADE
);

-- ===================================================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- ===================================================================

-- Índices para tabela lvs
CREATE INDEX idx_lvs_tipo_lv ON public.lvs USING btree (tipo_lv);
CREATE INDEX idx_lvs_usuario_id ON public.lvs USING btree (usuario_id);
CREATE INDEX idx_lvs_data_inspecao ON public.lvs USING btree (data_inspecao);
CREATE INDEX idx_lvs_status ON public.lvs USING btree (status);
CREATE INDEX idx_lvs_coordinates ON public.lvs USING btree (latitude, longitude);
CREATE INDEX idx_lvs_numero_sequencial ON public.lvs USING btree (numero_sequencial);

-- Índices para tabela lv_avaliacoes
CREATE INDEX idx_lv_avaliacoes_lv_id ON public.lv_avaliacoes USING btree (lv_id);
CREATE INDEX idx_lv_avaliacoes_tipo_lv ON public.lv_avaliacoes USING btree (tipo_lv);
CREATE INDEX idx_lv_avaliacoes_item_id ON public.lv_avaliacoes USING btree (item_id);
CREATE INDEX idx_lv_avaliacoes_avaliacao ON public.lv_avaliacoes USING btree (avaliacao);

-- Índices para tabela lv_fotos
CREATE INDEX idx_lv_fotos_lv_id ON public.lv_fotos USING btree (lv_id);
CREATE INDEX idx_lv_fotos_tipo_lv ON public.lv_fotos USING btree (tipo_lv);
CREATE INDEX idx_lv_fotos_item_id ON public.lv_fotos USING btree (item_id);
CREATE INDEX idx_lv_fotos_coordinates ON public.lv_fotos USING btree (latitude, longitude);

-- ===================================================================
-- FASE 2: MIGRAR DADOS EXISTENTES
-- ===================================================================

-- Migrar dados de lv_residuos para lvs
INSERT INTO public.lvs (
  id, tipo_lv, nome_lv, usuario_id, usuario_nome, usuario_matricula, usuario_email,
  data_inspecao, data_preenchimento, area, responsavel_area, responsavel_tecnico,
  responsavel_empresa, inspetor_principal, inspetor_secundario, latitude, longitude,
  gps_precisao, endereco_gps, observacoes, observacoes_gerais, total_fotos,
  total_conformes, total_nao_conformes, total_nao_aplicaveis, percentual_conformidade,
  status, sincronizado, numero_sequencial, created_at, updated_at
)
SELECT 
  id, tipo_lv, lv_nome, usuario_id, usuario_nome, usuario_matricula, usuario_email,
  data_inspecao, data_preenchimento, area, responsavel_area, responsavel_tecnico,
  responsavel_empresa, inspetor_principal, inspetor_secundario, latitude, longitude,
  gps_precisao, endereco_gps, observacoes, observacoes_gerais, total_fotos,
  total_conformes, total_nao_conformes, total_nao_aplicaveis, percentual_conformidade,
  status, sincronizado, numero_sequencial, created_at, updated_at
FROM public.lv_residuos;

-- Migrar avaliações
INSERT INTO public.lv_avaliacoes (
  id, lv_id, tipo_lv, item_id, item_codigo, item_pergunta, avaliacao, observacao, created_at
)
SELECT 
  id, lv_residuos_id, '01', item_id, item_codigo, item_pergunta, avaliacao, observacao, created_at
FROM public.lv_residuos_avaliacoes;

-- Migrar fotos
INSERT INTO public.lv_fotos (
  id, lv_id, tipo_lv, item_id, nome_arquivo, url_arquivo, descricao, latitude, longitude, created_at
)
SELECT 
  id, lv_residuos_id, '01', item_id, nome_arquivo, url_arquivo, descricao, latitude, longitude, created_at
FROM public.lv_residuos_fotos;

-- ===================================================================
-- FASE 3: CRIAR BUCKET UNIFICADO
-- ===================================================================

-- Criar bucket unificado para todas as LVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-lvs',
  'fotos-lvs',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ===================================================================
-- FASE 4: CONFIGURAÇÕES DE LV
-- ===================================================================

-- Tabela de configuração das LVs
CREATE TABLE public.lv_configuracoes (
  id uuid not null default extensions.uuid_generate_v4(),
  tipo_lv text not null,
  nome_lv text not null,
  nome_completo text not null,
  revisao text null,
  data_revisao date null,
  ativa boolean not null default true,
  bucket_fotos text not null default 'fotos-lvs',
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint lv_configuracoes_pkey primary key (id),
  constraint lv_configuracoes_tipo_lv_key unique (tipo_lv)
);

-- Inserir configuração da LV Resíduos
INSERT INTO public.lv_configuracoes (
  tipo_lv, nome_lv, nome_completo, revisao, data_revisao, bucket_fotos
) VALUES (
  '01', 'Resíduos', '01.Resíduos', 'Revisão 09', '2023-05-01', 'fotos-lvs'
);

-- ===================================================================
-- FASE 5: FUNÇÕES AUXILIARES
-- ===================================================================

-- Função para atualizar estatísticas da LV
CREATE OR REPLACE FUNCTION atualizar_estatisticas_lv(lv_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.lvs 
  SET 
    total_fotos = (
      SELECT COUNT(*) FROM public.lv_fotos WHERE lv_id = lv_uuid
    ),
    total_conformes = (
      SELECT COUNT(*) FROM public.lv_avaliacoes 
      WHERE lv_id = lv_uuid AND avaliacao IN ('C', 'conforme')
    ),
    total_nao_conformes = (
      SELECT COUNT(*) FROM public.lv_avaliacoes 
      WHERE lv_id = lv_uuid AND avaliacao IN ('NC', 'nao_conforme')
    ),
    total_nao_aplicaveis = (
      SELECT COUNT(*) FROM public.lv_avaliacoes 
      WHERE lv_id = lv_uuid AND avaliacao IN ('NA', 'nao_aplicavel')
    ),
    percentual_conformidade = (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(
            (COUNT(*) FILTER (WHERE avaliacao IN ('C', 'conforme')) * 100.0 / COUNT(*))::numeric, 2
          )
        END
      FROM public.lv_avaliacoes WHERE lv_id = lv_uuid
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = lv_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas automaticamente
CREATE OR REPLACE FUNCTION trigger_atualizar_estatisticas_lv()
RETURNS trigger AS $$
BEGIN
  PERFORM atualizar_estatisticas_lv(NEW.lv_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_estatisticas_avaliacoes
  AFTER INSERT OR UPDATE OR DELETE ON public.lv_avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_estatisticas_lv();

CREATE TRIGGER trigger_atualizar_estatisticas_fotos
  AFTER INSERT OR UPDATE OR DELETE ON public.lv_fotos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_estatisticas_lv();

-- ===================================================================
-- FASE 6: POLÍTICAS RLS
-- ===================================================================

-- Políticas para tabela lvs
ALTER TABLE public.lvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias LVs" ON public.lvs
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem inserir suas próprias LVs" ON public.lvs
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias LVs" ON public.lvs
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias LVs" ON public.lvs
  FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para tabela lv_avaliacoes
ALTER TABLE public.lv_avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver avaliações de suas LVs" ON public.lv_avaliacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lvs 
      WHERE lvs.id = lv_avaliacoes.lv_id 
      AND lvs.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar avaliações de suas LVs" ON public.lv_avaliacoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lvs 
      WHERE lvs.id = lv_avaliacoes.lv_id 
      AND lvs.usuario_id = auth.uid()
    )
  );

-- Políticas para tabela lv_fotos
ALTER TABLE public.lv_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver fotos de suas LVs" ON public.lv_fotos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lvs 
      WHERE lvs.id = lv_fotos.lv_id 
      AND lvs.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar fotos de suas LVs" ON public.lv_fotos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lvs 
      WHERE lvs.id = lv_fotos.lv_id 
      AND lvs.usuario_id = auth.uid()
    )
  );

-- ===================================================================
-- VERIFICAÇÃO FINAL
-- ===================================================================

-- Verificar se a migração foi bem-sucedida
SELECT 
  'lvs' as tabela,
  COUNT(*) as total_registros
FROM public.lvs
UNION ALL
SELECT 
  'lv_avaliacoes' as tabela,
  COUNT(*) as total_registros
FROM public.lv_avaliacoes
UNION ALL
SELECT 
  'lv_fotos' as tabela,
  COUNT(*) as total_registros
FROM public.lv_fotos;

-- Verificar configurações
SELECT * FROM public.lv_configuracoes; 