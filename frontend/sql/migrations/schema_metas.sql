create table public.metas (
  id uuid not null default gen_random_uuid (),
  tipo_meta character varying(50) not null,
  categoria character varying(100) null,
  periodo character varying(20) not null,
  ano integer not null,
  mes integer null,
  semana integer null,
  dia integer null,
  meta_quantidade integer not null,
  meta_percentual numeric(5, 2) null,
  descricao text null,
  ativa boolean null default true,
  criada_por uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  escopo character varying(20) null default 'equipe'::character varying,
  constraint metas_pkey primary key (id),
  constraint metas_criada_por_fkey foreign KEY (criada_por) references usuarios (id),
  constraint metas_escopo_check check (
    (
      (escopo)::text = any (
        (
          array[
            'equipe'::character varying,
            'individual'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint metas_periodo_check check (
    (
      (periodo)::text = any (
        (
          array[
            'diario'::character varying,
            'semanal'::character varying,
            'mensal'::character varying,
            'trimestral'::character varying,
            'anual'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint metas_tipo_meta_check check (
    (
      (tipo_meta)::text = any (
        (
          array[
            'lv'::character varying,
            'termo'::character varying,
            'rotina'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_metas_tipo_periodo on public.metas using btree (tipo_meta, periodo, ano, mes) TABLESPACE pg_default;

create index IF not exists idx_metas_ativa on public.metas using btree (ativa) TABLESPACE pg_default;

create index IF not exists idx_metas_escopo on public.metas using btree (escopo) TABLESPACE pg_default;

------

create table public.metas_atribuicoes (
  id uuid not null default gen_random_uuid (),
  meta_id uuid null,
  tma_id uuid null,
  meta_quantidade_individual integer null,
  responsavel boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint metas_atribuicoes_pkey primary key (id),
  constraint metas_atribuicoes_meta_id_tma_id_key unique (meta_id, tma_id),
  constraint metas_atribuicoes_meta_id_fkey foreign KEY (meta_id) references metas (id) on delete CASCADE,
  constraint metas_atribuicoes_tma_id_fkey foreign KEY (tma_id) references usuarios (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_metas_atribuicoes_meta on public.metas_atribuicoes using btree (meta_id) TABLESPACE pg_default;

create index IF not exists idx_metas_atribuicoes_tma on public.metas_atribuicoes using btree (tma_id) TABLESPACE pg_default;

-----

create table public.progresso_metas (
  id uuid not null default gen_random_uuid (),
  meta_id uuid null,
  periodo character varying(20) not null,
  ano integer not null,
  mes integer null,
  semana integer null,
  dia integer null,
  quantidade_atual integer null default 0,
  percentual_atual numeric(5, 2) null default 0,
  percentual_alcancado numeric(5, 2) null default 0,
  status character varying(20) null default 'em_andamento'::character varying,
  ultima_atualizacao timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  tma_id uuid null,
  constraint progresso_metas_pkey primary key (id),
  constraint progresso_metas_meta_id_periodo_ano_mes_semana_dia_key unique (meta_id, periodo, ano, mes, semana, dia),
  constraint progresso_metas_meta_id_fkey foreign KEY (meta_id) references metas (id) on delete CASCADE,
  constraint progresso_metas_tma_id_fkey foreign KEY (tma_id) references usuarios (id) on delete CASCADE,
  constraint progresso_metas_status_check check (
    (
      (status)::text = any (
        (
          array[
            'em_andamento'::character varying,
            'alcancada'::character varying,
            'superada'::character varying,
            'nao_alcancada'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_progresso_metas_periodo on public.progresso_metas using btree (meta_id, periodo, ano, mes, semana, dia) TABLESPACE pg_default;

create index IF not exists idx_progresso_metas_status on public.progresso_metas using btree (status) TABLESPACE pg_default;