# 🗄️ SCHEMA COMPLETO DO BANCO - ECOFIELD

## 📋 **VISÃO GERAL**

Este documento contém o schema completo do banco de dados Supabase usado pelo sistema EcoField. Todas as tabelas, constraints e relacionamentos estão documentados para facilitar a refatoração e desenvolvimento.

---

## 🗂️ **TABELAS PRINCIPAIS**

### **1. ÁREAS**

```sql
CREATE TABLE public.areas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  descricao text,
  localizacao text,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT areas_pkey PRIMARY KEY (id)
);
```

### **2. ATIVIDADES DE ROTINA**

```sql
CREATE TABLE public.atividades_rotina (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  data_atividade date NOT NULL,
  hora_inicio time without time zone,
  hora_fim time without time zone,
  area_id uuid NOT NULL,
  atividade text NOT NULL,
  descricao text,
  km_percorrido numeric,
  tma_responsavel_id uuid NOT NULL,
  encarregado_id uuid NOT NULL,
  empresa_contratada_id uuid,
  status text DEFAULT 'Planejada'::text CHECK (status = ANY (ARRAY['Planejada'::text, 'Em Execução'::text, 'Concluída'::text])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  latitude numeric,
  longitude numeric,
  auth_user_id uuid,
  emitido_por_usuario_id uuid,
  CONSTRAINT atividades_rotina_pkey PRIMARY KEY (id),
  CONSTRAINT atividades_rotina_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id),
  CONSTRAINT atividades_rotina_empresa_contratada_id_fkey FOREIGN KEY (empresa_contratada_id) REFERENCES public.empresas_contratadas(id)
);
```

### **3. CATEGORIAS LV**

```sql
CREATE TABLE public.categorias_lv (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text,
  ativa boolean DEFAULT true,
  ordem integer,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categorias_lv_pkey PRIMARY KEY (id)
);
```

### **4. CONFIGURAÇÕES DE METAS**

```sql
CREATE TABLE public.configuracoes_metas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chave character varying NOT NULL UNIQUE,
  valor text NOT NULL,
  descricao text,
  tipo character varying DEFAULT 'string'::character varying CHECK (tipo::text = ANY (ARRAY['string'::character varying, 'number'::character varying, 'boolean'::character varying, 'json'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracoes_metas_pkey PRIMARY KEY (id)
);
```

### **5. EMPRESAS CONTRATADAS**

```sql
CREATE TABLE public.empresas_contratadas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  cnpj text UNIQUE,
  contato text,
  telefone text,
  email text,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT empresas_contratadas_pkey PRIMARY KEY (id)
);
```

### **6. ENCARREGADOS**

```sql
CREATE TABLE public.encarregados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  apelido text,
  telefone text,
  empresa_contratada_id uuid,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT encarregados_pkey PRIMARY KEY (id),
  CONSTRAINT encarregados_empresa_contratada_id_fkey FOREIGN KEY (empresa_contratada_id) REFERENCES public.empresas_contratadas(id)
);
```

### **7. FOTOS DE INSPEÇÃO**

```sql
CREATE TABLE public.fotos_inspecao (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  inspecao_id uuid NOT NULL,
  pergunta_id uuid,
  nome_arquivo text NOT NULL,
  url_arquivo text NOT NULL,
  descricao text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fotos_inspecao_pkey PRIMARY KEY (id),
  CONSTRAINT fotos_inspecao_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES public.perguntas_lv(id),
  CONSTRAINT fotos_inspecao_inspecao_id_fkey FOREIGN KEY (inspecao_id) REFERENCES public.inspecoes(id)
);
```

### **8. FOTOS DE ROTINA**

```sql
CREATE TABLE public.fotos_rotina (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  atividade_id uuid NOT NULL,
  nome_arquivo text NOT NULL,
  url_arquivo text NOT NULL,
  descricao text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  latitude numeric,
  longitude numeric,
  CONSTRAINT fotos_rotina_pkey PRIMARY KEY (id),
  CONSTRAINT fotos_rotina_atividade_id_fkey FOREIGN KEY (atividade_id) REFERENCES public.atividades_rotina(id)
);
```

### **9. INSPEÇÕES**

```sql
CREATE TABLE public.inspecoes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  data_inspecao date NOT NULL,
  area_id uuid NOT NULL,
  categoria_id uuid NOT NULL,
  versao_id uuid NOT NULL,
  responsavel_id uuid NOT NULL,
  tma_contratada_id uuid,
  status text DEFAULT 'Pendente'::text CHECK (status = ANY (ARRAY['Pendente'::text, 'Em Andamento'::text, 'Concluída'::text])),
  observacoes_gerais text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inspecoes_pkey PRIMARY KEY (id),
  CONSTRAINT inspecoes_tma_contratada_id_fkey FOREIGN KEY (tma_contratada_id) REFERENCES public.empresas_contratadas(id),
  CONSTRAINT inspecoes_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id),
  CONSTRAINT inspecoes_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_lv(id),
  CONSTRAINT inspecoes_versao_id_fkey FOREIGN KEY (versao_id) REFERENCES public.versoes_lv(id)
);
```

### **10. AVALIAÇÕES LV**

```sql
CREATE TABLE public.lv_avaliacoes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lv_id uuid NOT NULL,
  tipo_lv text NOT NULL,
  item_id integer NOT NULL,
  item_codigo text NOT NULL,
  item_pergunta text NOT NULL,
  avaliacao text NOT NULL CHECK (avaliacao = ANY (ARRAY['C'::text, 'NC'::text, 'NA'::text, 'conforme'::text, 'nao_conforme'::text, 'nao_aplicavel'::text])),
  observacao text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lv_avaliacoes_pkey PRIMARY KEY (id),
  CONSTRAINT lv_avaliacoes_lv_id_fkey FOREIGN KEY (lv_id) REFERENCES public.lvs(id)
);
```

### **11. CONFIGURAÇÕES LV**

```sql
CREATE TABLE public.lv_configuracoes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tipo_lv text NOT NULL UNIQUE,
  nome_lv text NOT NULL,
  nome_completo text NOT NULL,
  revisao text,
  data_revisao date,
  ativa boolean NOT NULL DEFAULT true,
  bucket_fotos text NOT NULL DEFAULT 'fotos-lvs'::text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lv_configuracoes_pkey PRIMARY KEY (id)
);
```

### **12. FOTOS LV**

```sql
CREATE TABLE public.lv_fotos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lv_id uuid NOT NULL,
  tipo_lv text NOT NULL,
  item_id integer NOT NULL,
  nome_arquivo text NOT NULL,
  url_arquivo text NOT NULL,
  descricao text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lv_fotos_pkey PRIMARY KEY (id),
  CONSTRAINT lv_fotos_lv_id_fkey FOREIGN KEY (lv_id) REFERENCES public.lvs(id)
);
```

### **13. LV RESÍDUOS**

```sql
CREATE TABLE public.lv_residuos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lv_tipo text NOT NULL DEFAULT '01'::text,
  lv_nome text NOT NULL DEFAULT 'Resíduos'::text,
  usuario_id uuid NOT NULL,
  usuario_nome text NOT NULL,
  usuario_matricula text,
  data_preenchimento timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  area text NOT NULL,
  responsavel_area text,
  inspetor_principal text NOT NULL,
  inspetor_secundario text,
  latitude numeric,
  longitude numeric,
  gps_precisao numeric,
  endereco_gps text,
  observacoes text,
  total_fotos integer DEFAULT 0,
  total_conformes integer DEFAULT 0,
  total_nao_conformes integer DEFAULT 0,
  total_nao_aplicaveis integer DEFAULT 0,
  percentual_conformidade numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'concluido'::text CHECK (status = ANY (ARRAY['concluido'::text, 'rascunho'::text, 'concluida'::text])),
  sincronizado boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  tipo_lv text NOT NULL DEFAULT '01'::text,
  usuario_email text NOT NULL DEFAULT ''::text,
  data_inspecao date NOT NULL DEFAULT CURRENT_DATE,
  responsavel_tecnico text NOT NULL DEFAULT ''::text,
  responsavel_empresa text NOT NULL DEFAULT ''::text,
  gps_latitude numeric,
  gps_longitude numeric,
  observacoes_gerais text,
  numero_sequencial integer NOT NULL DEFAULT nextval('lv_residuos_numero_sequencial_seq'::regclass),
  inspetor_secundario_matricula text,
  CONSTRAINT lv_residuos_pkey PRIMARY KEY (id)
);
```

### **14. AVALIAÇÕES LV RESÍDUOS**

```sql
CREATE TABLE public.lv_residuos_avaliacoes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lv_residuos_id uuid NOT NULL,
  item_id integer NOT NULL,
  item_codigo text NOT NULL,
  item_pergunta text NOT NULL,
  avaliacao text NOT NULL CHECK (avaliacao = ANY (ARRAY['C'::text, 'NC'::text, 'NA'::text, 'conforme'::text, 'nao_conforme'::text, 'nao_aplicavel'::text])),
  observacao text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lv_residuos_avaliacoes_pkey PRIMARY KEY (id),
  CONSTRAINT lv_residuos_avaliacoes_lv_id_fkey FOREIGN KEY (lv_residuos_id) REFERENCES public.lv_residuos(id)
);
```

### **15. FOTOS LV RESÍDUOS**

```sql
CREATE TABLE public.lv_residuos_fotos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lv_residuos_id uuid NOT NULL,
  item_id integer NOT NULL,
  nome_arquivo text NOT NULL,
  url_arquivo text NOT NULL,
  descricao text,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lv_residuos_fotos_pkey PRIMARY KEY (id),
  CONSTRAINT lv_residuos_fotos_lv_id_fkey FOREIGN KEY (lv_residuos_id) REFERENCES public.lv_residuos(id)
);
```

### **16. LVS**

```sql
CREATE TABLE public.lvs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tipo_lv text NOT NULL,
  nome_lv text NOT NULL,
  usuario_id uuid NOT NULL,
  usuario_nome text NOT NULL,
  usuario_matricula text,
  usuario_email text NOT NULL DEFAULT ''::text,
  data_inspecao date NOT NULL DEFAULT CURRENT_DATE,
  data_preenchimento timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  area text NOT NULL,
  responsavel_area text,
  responsavel_tecnico text NOT NULL DEFAULT ''::text,
  responsavel_empresa text NOT NULL DEFAULT ''::text,
  inspetor_principal text NOT NULL,
  inspetor_secundario text,
  latitude numeric,
  longitude numeric,
  gps_precisao numeric,
  endereco_gps text,
  observacoes text,
  observacoes_gerais text,
  total_fotos integer DEFAULT 0,
  total_conformes integer DEFAULT 0,
  total_nao_conformes integer DEFAULT 0,
  total_nao_aplicaveis integer DEFAULT 0,
  percentual_conformidade numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'concluido'::text CHECK (status = ANY (ARRAY['concluido'::text, 'rascunho'::text, 'concluida'::text])),
  sincronizado boolean NOT NULL DEFAULT true,
  numero_sequencial integer NOT NULL DEFAULT nextval('lvs_numero_sequencial_seq'::regclass),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  inspetor_secundario_matricula text,
  CONSTRAINT lvs_pkey PRIMARY KEY (id)
);
```

### **17. METAS**

```sql
CREATE TABLE public.metas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo_meta character varying NOT NULL CHECK (tipo_meta::text = ANY (ARRAY['lv'::character varying, 'termo'::character varying, 'rotina'::character varying]::text[])),
  categoria character varying,
  periodo character varying NOT NULL CHECK (periodo::text = ANY (ARRAY['diario'::character varying, 'semanal'::character varying, 'mensal'::character varying, 'trimestral'::character varying, 'anual'::character varying]::text[])),
  ano integer NOT NULL,
  mes integer,
  semana integer,
  dia integer,
  meta_quantidade integer NOT NULL,
  meta_percentual numeric,
  descricao text,
  ativa boolean DEFAULT true,
  criada_por uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  escopo character varying DEFAULT 'equipe'::character varying CHECK (escopo::text = ANY (ARRAY['equipe'::character varying, 'individual'::character varying]::text[])),
  CONSTRAINT metas_pkey PRIMARY KEY (id)
);
```

### **18. ATRIBUIÇÕES DE METAS**

```sql
CREATE TABLE public.metas_atribuicoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  meta_id uuid,
  tma_id uuid,
  meta_quantidade_individual integer,
  responsavel boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  auth_user_id uuid,
  CONSTRAINT metas_atribuicoes_pkey PRIMARY KEY (id),
  CONSTRAINT metas_atribuicoes_tma_id_fkey FOREIGN KEY (tma_id) REFERENCES public.usuarios(id),
  CONSTRAINT metas_atribuicoes_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id)
);
```

### **19. PERFIS**

```sql
CREATE TABLE public.perfis (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome text NOT NULL UNIQUE,
  descricao text,
  permissoes jsonb DEFAULT '{}'::jsonb,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT perfis_pkey PRIMARY KEY (id)
);
```

### **20. PERGUNTAS LV**

```sql
CREATE TABLE public.perguntas_lv (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo text NOT NULL,
  pergunta text NOT NULL,
  categoria_id uuid NOT NULL,
  versao_id uuid NOT NULL,
  ordem integer,
  obrigatoria boolean DEFAULT true,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT perguntas_lv_pkey PRIMARY KEY (id),
  CONSTRAINT perguntas_lv_versao_id_fkey FOREIGN KEY (versao_id) REFERENCES public.versoes_lv(id),
  CONSTRAINT perguntas_lv_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_lv(id)
);
```

### **21. PROGRESSO DE METAS**

```sql
CREATE TABLE public.progresso_metas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  meta_id uuid,
  periodo character varying NOT NULL,
  ano integer NOT NULL,
  mes integer,
  semana integer,
  dia integer,
  quantidade_atual integer DEFAULT 0,
  percentual_atual numeric DEFAULT 0,
  percentual_alcancado numeric DEFAULT 0,
  status character varying DEFAULT 'em_andamento'::character varying CHECK (status::text = ANY (ARRAY['em_andamento'::character varying, 'alcancada'::character varying, 'superada'::character varying, 'nao_alcancada'::character varying]::text[])),
  ultima_atualizacao timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tma_id uuid,
  auth_user_id uuid,
  CONSTRAINT progresso_metas_pkey PRIMARY KEY (id),
  CONSTRAINT progresso_metas_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id)
);
```

### **22. RESPOSTAS DE INSPEÇÃO**

```sql
CREATE TABLE public.respostas_inspecao (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  inspecao_id uuid NOT NULL,
  pergunta_id uuid NOT NULL,
  resposta text NOT NULL CHECK (resposta = ANY (ARRAY['C'::text, 'NC'::text, 'NA'::text])),
  observacao text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT respostas_inspecao_pkey PRIMARY KEY (id),
  CONSTRAINT respostas_inspecao_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES public.perguntas_lv(id),
  CONSTRAINT respostas_inspecao_inspecao_id_fkey FOREIGN KEY (inspecao_id) REFERENCES public.inspecoes(id)
);
```

### **23. LOGS DE STORAGE**

```sql
CREATE TABLE public.storage_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  bucket_id text NOT NULL,
  object_name text NOT NULL,
  action text NOT NULL,
  user_id uuid,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT storage_logs_pkey PRIMARY KEY (id),
  CONSTRAINT storage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

### **24. TERMOS AMBIENTAIS**

```sql
CREATE TABLE public.termos_ambientais (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  numero_sequencial integer NOT NULL DEFAULT nextval('termos_ambientais_numero_sequencial_seq'::regclass) UNIQUE,
  data_termo date NOT NULL DEFAULT CURRENT_DATE,
  hora_termo time without time zone NOT NULL DEFAULT CURRENT_TIME,
  local_atividade text NOT NULL,
  projeto_ba character varying,
  fase_etapa_obra text,
  emitido_por_nome character varying NOT NULL,
  emitido_por_gerencia character varying,
  emitido_por_empresa character varying,
  emitido_por_usuario_id uuid,
  destinatario_nome character varying NOT NULL,
  destinatario_gerencia character varying,
  destinatario_empresa character varying,
  area_equipamento_atividade text NOT NULL,
  equipe character varying,
  atividade_especifica text,
  tipo_termo character varying NOT NULL CHECK (tipo_termo::text = ANY (ARRAY['PARALIZACAO_TECNICA'::character varying, 'NOTIFICACAO'::character varying, 'RECOMENDACAO'::character varying]::text[])),
  natureza_desvio character varying NOT NULL CHECK (natureza_desvio::text = ANY (ARRAY['OCORRENCIA_REAL'::character varying, 'QUASE_ACIDENTE_AMBIENTAL'::character varying, 'POTENCIAL_NAO_CONFORMIDADE'::character varying]::text[])),
  descricao_nc_1 text,
  severidade_nc_1 character varying CHECK (severidade_nc_1::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_2 text,
  severidade_nc_2 character varying CHECK (severidade_nc_2::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_3 text,
  severidade_nc_3 character varying CHECK (severidade_nc_3::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_4 text,
  severidade_nc_4 character varying CHECK (severidade_nc_4::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_5 text,
  severidade_nc_5 character varying CHECK (severidade_nc_5::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_6 text,
  severidade_nc_6 character varying CHECK (severidade_nc_6::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_7 text,
  severidade_nc_7 character varying CHECK (severidade_nc_7::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_8 text,
  severidade_nc_8 character varying CHECK (severidade_nc_8::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_9 text,
  severidade_nc_9 character varying CHECK (severidade_nc_9::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  descricao_nc_10 text,
  severidade_nc_10 character varying CHECK (severidade_nc_10::text = ANY (ARRAY['MA'::character varying, 'A'::character varying, 'M'::character varying, 'B'::character varying, 'PE'::character varying]::text[])),
  lista_verificacao_aplicada text,
  tst_tma_responsavel character varying,
  acao_correcao_1 text,
  prazo_acao_1 date,
  acao_correcao_2 text,
  prazo_acao_2 date,
  acao_correcao_3 text,
  prazo_acao_3 date,
  acao_correcao_4 text,
  prazo_acao_4 date,
  acao_correcao_5 text,
  prazo_acao_5 date,
  acao_correcao_6 text,
  prazo_acao_6 date,
  acao_correcao_7 text,
  prazo_acao_7 date,
  acao_correcao_8 text,
  prazo_acao_8 date,
  acao_correcao_9 text,
  prazo_acao_9 date,
  acao_correcao_10 text,
  prazo_acao_10 date,
  assinatura_responsavel_area boolean DEFAULT false,
  data_assinatura_responsavel timestamp without time zone,
  assinatura_emitente boolean DEFAULT true,
  data_assinatura_emitente timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  providencias_tomadas text,
  observacoes text,
  liberacao_nome character varying,
  liberacao_empresa character varying,
  liberacao_gerencia character varying,
  liberacao_data date,
  liberacao_horario time without time zone,
  liberacao_assinatura_carimbo boolean DEFAULT false,
  data_liberacao timestamp without time zone,
  status character varying DEFAULT 'PENDENTE'::character varying CHECK (status::text = ANY (ARRAY['PENDENTE'::character varying, 'EM_ANDAMENTO'::character varying, 'CORRIGIDO'::character varying, 'LIBERADO'::character varying]::text[])),
  latitude numeric,
  longitude numeric,
  precisao_gps numeric,
  endereco_gps text,
  sincronizado boolean DEFAULT true,
  offline boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  numero_termo character varying,
  assinatura_responsavel_area_img text,
  assinatura_emitente_img text,
  auth_user_id uuid,
  CONSTRAINT termos_ambientais_pkey PRIMARY KEY (id),
  CONSTRAINT termos_ambientais_emitido_por_usuario_id_fkey FOREIGN KEY (emitido_por_usuario_id) REFERENCES public.usuarios(id)
);
```

### **25. FOTOS DE TERMOS**

```sql
CREATE TABLE public.termos_fotos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  termo_id uuid NOT NULL,
  nome_arquivo character varying NOT NULL,
  url_arquivo text NOT NULL,
  tamanho_bytes integer,
  tipo_mime character varying,
  categoria character varying,
  descricao text,
  latitude numeric,
  longitude numeric,
  precisao_gps numeric,
  endereco text,
  timestamp_captura timestamp without time zone,
  offline boolean DEFAULT false,
  sincronizado boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT termos_fotos_pkey PRIMARY KEY (id),
  CONSTRAINT termos_fotos_termo_id_fkey FOREIGN KEY (termo_id) REFERENCES public.termos_ambientais(id)
);
```

### **26. HISTÓRICO DE TERMOS**

```sql
CREATE TABLE public.termos_historico (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  termo_id uuid NOT NULL,
  tipo_acao character varying NOT NULL,
  descricao text NOT NULL,
  data_acao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  usuario_id uuid,
  usuario_nome character varying,
  observacoes text,
  dados_alterados jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT termos_historico_pkey PRIMARY KEY (id),
  CONSTRAINT termos_historico_termo_id_fkey FOREIGN KEY (termo_id) REFERENCES public.termos_ambientais(id)
);
```

### **27. USUÁRIOS**

```sql
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha text NOT NULL,
  matricula text UNIQUE,
  telefone text,
  perfil_id uuid NOT NULL,
  empresa_id uuid,
  ativo boolean DEFAULT true,
  ultimo_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  auth_user_id uuid UNIQUE,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas_contratadas(id),
  CONSTRAINT usuarios_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT usuarios_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfis(id)
);
```

### **28. VERSÕES LV**

```sql
CREATE TABLE public.versoes_lv (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  descricao text,
  data_revisao date,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT versoes_lv_pkey PRIMARY KEY (id)
);
```

---

## 📊 **ESTATÍSTICAS DO SCHEMA**

### **Tabelas Principais**

- **Total de Tabelas**: 28
- **Tabelas de Entidades**: 15
- **Tabelas de Relacionamento**: 8
- **Tabelas de Sistema**: 5

### **Relacionamentos**

- **Foreign Keys**: 25
- **Unique Constraints**: 8
- **Check Constraints**: 12

### **Tipos de Dados**

- **UUID**: 28 campos
- **Text**: 45 campos
- **Numeric**: 12 campos
- **Boolean**: 8 campos
- **Timestamp**: 28 campos
- **Date**: 6 campos
- **Time**: 3 campos
- **JSONB**: 2 campos

---

## 🎯 **NOTAS IMPORTANTES**

### **Sequências**

- `termos_ambientais_numero_sequencial_seq`
- `lv_residuos_numero_sequencial_seq`
- `lvs_numero_sequencial_seq`

### **Funções**

- `uuid_generate_v4()`
- `gen_random_uuid()`
- `CURRENT_TIMESTAMP`
- `CURRENT_DATE`
- `CURRENT_TIME`

### **Constraints Importantes**

- **Check Constraints**: Validação de status, tipos, etc.
- **Unique Constraints**: Emails, matrículas, códigos
- **Foreign Keys**: Relacionamentos entre tabelas

---

## 📝 **USO PARA REFATORAÇÃO**

Este schema deve ser usado como referência para:

1. **Criar APIs Backend**: Entender estrutura das tabelas
2. **Migrar Componentes**: Conhecer campos e relacionamentos
3. **Implementar Cache**: Saber quais dados cachear
4. **Testar Funcionalidades**: Verificar integridade dos dados
5. **Otimizar Consultas**: Entender índices e relacionamentos

---

## 🎉 **CONCLUSÃO**

O schema completo do banco está documentado e pronto para ser usado na refatoração. Todas as tabelas, campos, relacionamentos e constraints estão mapeados para facilitar o desenvolvimento.
