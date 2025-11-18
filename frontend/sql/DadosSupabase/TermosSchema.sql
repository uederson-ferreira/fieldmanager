create table public.termos_ambientais (
  id uuid not null default extensions.uuid_generate_v4 (),
  numero_sequencial serial not null,
  data_termo date not null default CURRENT_DATE,
  hora_termo time without time zone not null default CURRENT_TIME,
  local_atividade text not null,
  projeto_ba character varying(100) null,
  fase_etapa_obra text null,
  emitido_por_nome character varying(255) not null,
  emitido_por_gerencia character varying(255) null,
  emitido_por_empresa character varying(255) null,
  emitido_por_usuario_id uuid null,
  destinatario_nome character varying(255) not null,
  destinatario_gerencia character varying(255) null,
  destinatario_empresa character varying(255) null,
  area_equipamento_atividade text not null,
  equipe character varying(255) null,
  atividade_especifica text null,
  tipo_termo character varying(50) not null,
  natureza_desvio character varying(50) not null,
  descricao_nc_1 text null,
  severidade_nc_1 character varying(5) null,
  descricao_nc_2 text null,
  severidade_nc_2 character varying(5) null,
  descricao_nc_3 text null,
  severidade_nc_3 character varying(5) null,
  descricao_nc_4 text null,
  severidade_nc_4 character varying(5) null,
  descricao_nc_5 text null,
  severidade_nc_5 character varying(5) null,
  descricao_nc_6 text null,
  severidade_nc_6 character varying(5) null,
  descricao_nc_7 text null,
  severidade_nc_7 character varying(5) null,
  descricao_nc_8 text null,
  severidade_nc_8 character varying(5) null,
  descricao_nc_9 text null,
  severidade_nc_9 character varying(5) null,
  descricao_nc_10 text null,
  severidade_nc_10 character varying(5) null,
  lista_verificacao_aplicada text null,
  tst_tma_responsavel character varying(255) null,
  acao_correcao_1 text null,
  prazo_acao_1 date null,
  acao_correcao_2 text null,
  prazo_acao_2 date null,
  acao_correcao_3 text null,
  prazo_acao_3 date null,
  acao_correcao_4 text null,
  prazo_acao_4 date null,
  acao_correcao_5 text null,
  prazo_acao_5 date null,
  acao_correcao_6 text null,
  prazo_acao_6 date null,
  acao_correcao_7 text null,
  prazo_acao_7 date null,
  acao_correcao_8 text null,
  prazo_acao_8 date null,
  acao_correcao_9 text null,
  prazo_acao_9 date null,
  acao_correcao_10 text null,
  prazo_acao_10 date null,
  assinatura_responsavel_area boolean null default false,
  data_assinatura_responsavel timestamp without time zone null,
  assinatura_emitente boolean null default true,
  data_assinatura_emitente timestamp without time zone null default CURRENT_TIMESTAMP,
  providencias_tomadas text null,
  observacoes text null,
  liberacao_nome character varying(255) null,
  liberacao_empresa character varying(255) null,
  liberacao_gerencia character varying(255) null,
  liberacao_data date null,
  liberacao_horario time without time zone null,
  liberacao_assinatura_carimbo boolean null default false,
  data_liberacao timestamp without time zone null,
  status character varying(50) null default 'PENDENTE'::character varying,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  precisao_gps numeric(8, 2) null,
  endereco_gps text null,
  sincronizado boolean null default true,
  offline boolean null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  numero_termo character varying(50) null,
  assinatura_responsavel_area_img text null,
  assinatura_emitente_img text null,
  auth_user_id uuid null,
  constraint termos_ambientais_pkey primary key (id),
  constraint termos_ambientais_numero_sequencial_key unique (numero_sequencial),
  constraint termos_ambientais_emitido_por_usuario_id_fkey foreign KEY (emitido_por_usuario_id) references usuarios (id),
  constraint termos_ambientais_severidade_nc_1_check check (
    (
      (severidade_nc_1)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_2_check check (
    (
      (severidade_nc_2)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_3_check check (
    (
      (severidade_nc_3)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_4_check check (
    (
      (severidade_nc_4)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_5_check check (
    (
      (severidade_nc_5)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_6_check check (
    (
      (severidade_nc_6)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_7_check check (
    (
      (severidade_nc_7)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_8_check check (
    (
      (severidade_nc_8)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_9_check check (
    (
      (severidade_nc_9)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_status_check check (
    (
      (status)::text = any (
        (
          array[
            'PENDENTE'::character varying,
            'EM_ANDAMENTO'::character varying,
            'CORRIGIDO'::character varying,
            'LIBERADO'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_tipo_termo_check check (
    (
      (tipo_termo)::text = any (
        (
          array[
            'PARALIZACAO_TECNICA'::character varying,
            'NOTIFICACAO'::character varying,
            'RECOMENDACAO'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_natureza_desvio_check check (
    (
      (natureza_desvio)::text = any (
        (
          array[
            'OCORRENCIA_REAL'::character varying,
            'QUASE_ACIDENTE_AMBIENTAL'::character varying,
            'POTENCIAL_NAO_CONFORMIDADE'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint termos_ambientais_severidade_nc_10_check check (
    (
      (severidade_nc_10)::text = any (
        (
          array[
            'MA'::character varying,
            'A'::character varying,
            'M'::character varying,
            'B'::character varying,
            'PE'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_termos_tipo_termo on public.termos_ambientais using btree (tipo_termo) TABLESPACE pg_default;

create index IF not exists idx_termos_status on public.termos_ambientais using btree (status) TABLESPACE pg_default;

create index IF not exists idx_termos_data_termo on public.termos_ambientais using btree (data_termo) TABLESPACE pg_default;

create index IF not exists idx_termos_emitido_por on public.termos_ambientais using btree (emitido_por_usuario_id) TABLESPACE pg_default;

create index IF not exists idx_termos_destinatario on public.termos_ambientais using btree (destinatario_nome) TABLESPACE pg_default;

create index IF not exists idx_termos_natureza_desvio on public.termos_ambientais using btree (natureza_desvio) TABLESPACE pg_default;

create index IF not exists idx_termos_projeto on public.termos_ambientais using btree (projeto_ba) TABLESPACE pg_default;