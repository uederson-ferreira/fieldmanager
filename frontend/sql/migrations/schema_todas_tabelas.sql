| table_name              | trigger_name                                | event  |
| ----------------------- | ------------------------------------------- | ------ |
| deviation_nature        | update_deviation_nature_updated_at          | UPDATE |
| encarregados            | trigger_update_encarregados_updated_at      | UPDATE |
| lv_criticality_levels   | update_lv_criticality_levels_updated_at     | UPDATE |
| lv_evaluation_options   | update_lv_evaluation_options_updated_at     | UPDATE |
| lv_inspection_types     | update_lv_inspection_types_updated_at       | UPDATE |
| metas                   | update_metas_updated_at                     | UPDATE |
| metas_atribuicoes       | trigger_sync_auth_user_id_metas_atribuicoes | UPDATE |
| metas_atribuicoes       | trigger_sync_auth_user_id_metas_atribuicoes | INSERT |
| metas_atribuicoes       | update_metas_atribuicoes_updated_at         | UPDATE |
| progresso_metas         | trigger_sync_auth_user_id_progresso_metas   | INSERT |
| progresso_metas         | trigger_sync_auth_user_id_progresso_metas   | UPDATE |
| progresso_metas         | update_progresso_metas_updated_at           | UPDATE |
| routine_activity_status | update_routine_activity_status_updated_at   | UPDATE |
| severity_levels         | update_severity_levels_updated_at           | UPDATE |
| term_status             | update_term_status_updated_at               | UPDATE |
| term_types              | update_term_types_updated_at                | UPDATE |
| termos_ambientais       | trigger_preencher_emitido_por_usuario_id    | INSERT |
| termos_ambientais       | trigger_preencher_emitido_por_usuario_id    | UPDATE |
| waste_classifications   | update_waste_classifications_updated_at     | UPDATE |




-----




| table_name              | column_name                     | pos | data_type                   | max_length | is_nullable | column_default                                               | constraint_type |
| ----------------------- | ------------------------------- | --- | --------------------------- | ---------- | ----------- | ------------------------------------------------------------ | --------------- |
| areas                   | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| areas                   | nome                            | 2   | text                        | null       | NO          | null                                                         |                 |
| areas                   | descricao                       | 3   | text                        | null       | YES         | null                                                         |                 |
| areas                   | localizacao                     | 4   | text                        | null       | YES         | null                                                         |                 |
| areas                   | ativa                           | 5   | boolean                     | null       | YES         | true                                                         |                 |
| areas                   | created_at                      | 6   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| areas                   | updated_at                      | 7   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| atividades_rotina       | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| atividades_rotina       | data_atividade                  | 2   | date                        | null       | NO          | null                                                         |                 |
| atividades_rotina       | hora_inicio                     | 3   | time without time zone      | null       | YES         | null                                                         |                 |
| atividades_rotina       | hora_fim                        | 4   | time without time zone      | null       | YES         | null                                                         |                 |
| atividades_rotina       | area_id                         | 5   | uuid                        | null       | NO          | null                                                         | FK              |
| atividades_rotina       | atividade                       | 6   | text                        | null       | NO          | null                                                         |                 |
| atividades_rotina       | descricao                       | 7   | text                        | null       | YES         | null                                                         |                 |
| atividades_rotina       | km_percorrido                   | 8   | numeric                     | null       | YES         | null                                                         |                 |
| atividades_rotina       | tma_responsavel_id              | 9   | uuid                        | null       | NO          | null                                                         |                 |
| atividades_rotina       | encarregado_id                  | 10  | uuid                        | null       | NO          | null                                                         | FK              |
| atividades_rotina       | empresa_contratada_id           | 11  | uuid                        | null       | YES         | null                                                         | FK              |
| atividades_rotina       | status                          | 12  | text                        | null       | YES         | 'Planejada'::text                                            |                 |
| atividades_rotina       | created_at                      | 13  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| atividades_rotina       | updated_at                      | 14  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| atividades_rotina       | latitude                        | 15  | numeric                     | null       | YES         | null                                                         |                 |
| atividades_rotina       | longitude                       | 16  | numeric                     | null       | YES         | null                                                         |                 |
| atividades_rotina       | auth_user_id                    | 17  | uuid                        | null       | YES         | null                                                         |                 |
| atividades_rotina       | emitido_por_usuario_id          | 18  | uuid                        | null       | YES         | null                                                         |                 |
| categorias_lv           | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| categorias_lv           | codigo                          | 2   | text                        | null       | NO          | null                                                         | UNIQUE          |
| categorias_lv           | nome                            | 3   | text                        | null       | NO          | null                                                         |                 |
| categorias_lv           | descricao                       | 4   | text                        | null       | YES         | null                                                         |                 |
| categorias_lv           | ativa                           | 5   | boolean                     | null       | YES         | true                                                         |                 |
| categorias_lv           | ordem                           | 6   | integer                     | null       | YES         | null                                                         |                 |
| categorias_lv           | created_at                      | 7   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| categorias_lv           | updated_at                      | 8   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| configuracoes_metas     | id                              | 1   | uuid                        | null       | NO          | gen_random_uuid()                                            | PK              |
| configuracoes_metas     | chave                           | 2   | character varying           | 100        | NO          | null                                                         | UNIQUE          |
| configuracoes_metas     | valor                           | 3   | text                        | null       | NO          | null                                                         |                 |
| configuracoes_metas     | descricao                       | 4   | text                        | null       | YES         | null                                                         |                 |
| configuracoes_metas     | tipo                            | 5   | character varying           | 50         | YES         | 'string'::character varying                                  |                 |
| configuracoes_metas     | created_at                      | 6   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| configuracoes_metas     | updated_at                      | 7   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| deviation_nature        | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| deviation_nature        | code                            | 2   | character varying           | 50         | NO          | null                                                         | UNIQUE          |
| deviation_nature        | name                            | 3   | character varying           | 100        | NO          | null                                                         |                 |
| deviation_nature        | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| deviation_nature        | color                           | 5   | character varying           | 20         | YES         | null                                                         |                 |
| deviation_nature        | icon                            | 6   | character varying           | 50         | YES         | null                                                         |                 |
| deviation_nature        | requires_investigation          | 7   | boolean                     | null       | YES         | false                                                        |                 |
| deviation_nature        | requires_root_cause_analysis    | 8   | boolean                     | null       | YES         | false                                                        |                 |
| deviation_nature        | active                          | 9   | boolean                     | null       | YES         | true                                                         |                 |
| deviation_nature        | display_order                   | 10  | integer                     | null       | YES         | 0                                                            |                 |
| deviation_nature        | created_at                      | 11  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| deviation_nature        | updated_at                      | 12  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| empresas_contratadas    | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| empresas_contratadas    | nome                            | 2   | text                        | null       | NO          | null                                                         |                 |
| empresas_contratadas    | cnpj                            | 3   | text                        | null       | YES         | null                                                         | UNIQUE          |
| empresas_contratadas    | contato                         | 4   | text                        | null       | YES         | null                                                         |                 |
| empresas_contratadas    | telefone                        | 5   | text                        | null       | YES         | null                                                         |                 |
| empresas_contratadas    | email                           | 6   | text                        | null       | YES         | null                                                         |                 |
| empresas_contratadas    | ativa                           | 7   | boolean                     | null       | YES         | true                                                         |                 |
| empresas_contratadas    | created_at                      | 8   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| empresas_contratadas    | updated_at                      | 9   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| encarregados            | id                              | 1   | uuid                        | null       | NO          | gen_random_uuid()                                            | PK              |
| encarregados            | nome_completo                   | 2   | text                        | null       | NO          | null                                                         |                 |
| encarregados            | apelido                         | 3   | text                        | null       | YES         | null                                                         |                 |
| encarregados            | telefone                        | 4   | text                        | null       | YES         | null                                                         |                 |
| encarregados            | empresa_contratada_id           | 5   | uuid                        | null       | YES         | null                                                         | FK              |
| encarregados            | ativo                           | 6   | boolean                     | null       | YES         | true                                                         |                 |
| encarregados            | created_at                      | 7   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| encarregados            | updated_at                      | 8   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| fotos_inspecao          | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| fotos_inspecao          | inspecao_id                     | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| fotos_inspecao          | pergunta_id                     | 3   | uuid                        | null       | YES         | null                                                         | FK              |
| fotos_inspecao          | nome_arquivo                    | 4   | text                        | null       | NO          | null                                                         |                 |
| fotos_inspecao          | url_arquivo                     | 5   | text                        | null       | NO          | null                                                         |                 |
| fotos_inspecao          | descricao                       | 6   | text                        | null       | YES         | null                                                         |                 |
| fotos_inspecao          | created_at                      | 7   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| fotos_rotina            | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| fotos_rotina            | atividade_id                    | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| fotos_rotina            | nome_arquivo                    | 3   | text                        | null       | NO          | null                                                         |                 |
| fotos_rotina            | url_arquivo                     | 4   | text                        | null       | NO          | null                                                         |                 |
| fotos_rotina            | descricao                       | 5   | text                        | null       | YES         | null                                                         |                 |
| fotos_rotina            | created_at                      | 6   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| fotos_rotina            | latitude                        | 7   | numeric                     | null       | YES         | null                                                         |                 |
| fotos_rotina            | longitude                       | 8   | numeric                     | null       | YES         | null                                                         |                 |
| inspecoes               | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| inspecoes               | data_inspecao                   | 2   | date                        | null       | NO          | null                                                         |                 |
| inspecoes               | area_id                         | 3   | uuid                        | null       | NO          | null                                                         | FK              |
| inspecoes               | categoria_id                    | 4   | uuid                        | null       | NO          | null                                                         | FK              |
| inspecoes               | versao_id                       | 5   | uuid                        | null       | NO          | null                                                         | FK              |
| inspecoes               | responsavel_id                  | 6   | uuid                        | null       | NO          | null                                                         |                 |
| inspecoes               | tma_contratada_id               | 7   | uuid                        | null       | YES         | null                                                         | FK              |
| inspecoes               | status                          | 8   | text                        | null       | YES         | 'Pendente'::text                                             |                 |
| inspecoes               | observacoes_gerais              | 9   | text                        | null       | YES         | null                                                         |                 |
| inspecoes               | created_at                      | 10  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| inspecoes               | updated_at                      | 11  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_avaliacoes           | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_avaliacoes           | lv_id                           | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| lv_avaliacoes           | tipo_lv                         | 3   | text                        | null       | NO          | null                                                         |                 |
| lv_avaliacoes           | item_id                         | 4   | integer                     | null       | NO          | null                                                         | UNIQUE          |
| lv_avaliacoes           | item_codigo                     | 5   | text                        | null       | NO          | null                                                         |                 |
| lv_avaliacoes           | item_pergunta                   | 6   | text                        | null       | NO          | null                                                         |                 |
| lv_avaliacoes           | avaliacao                       | 7   | text                        | null       | NO          | null                                                         |                 |
| lv_avaliacoes           | observacao                      | 8   | text                        | null       | YES         | null                                                         |                 |
| lv_avaliacoes           | created_at                      | 9   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_configuracoes        | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_configuracoes        | tipo_lv                         | 2   | text                        | null       | NO          | null                                                         | UNIQUE          |
| lv_configuracoes        | nome_lv                         | 3   | text                        | null       | NO          | null                                                         |                 |
| lv_configuracoes        | nome_completo                   | 4   | text                        | null       | NO          | null                                                         |                 |
| lv_configuracoes        | revisao                         | 5   | text                        | null       | YES         | null                                                         |                 |
| lv_configuracoes        | data_revisao                    | 6   | date                        | null       | YES         | null                                                         |                 |
| lv_configuracoes        | ativa                           | 7   | boolean                     | null       | NO          | true                                                         |                 |
| lv_configuracoes        | bucket_fotos                    | 8   | text                        | null       | NO          | 'fotos-lvs'::text                                            |                 |
| lv_configuracoes        | created_at                      | 9   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_configuracoes        | updated_at                      | 10  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_criticality_levels   | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_criticality_levels   | code                            | 2   | character varying           | 50         | NO          | null                                                         | UNIQUE          |
| lv_criticality_levels   | name                            | 3   | character varying           | 100        | NO          | null                                                         |                 |
| lv_criticality_levels   | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| lv_criticality_levels   | color                           | 5   | character varying           | 20         | YES         | null                                                         |                 |
| lv_criticality_levels   | icon                            | 6   | character varying           | 50         | YES         | null                                                         |                 |
| lv_criticality_levels   | priority                        | 7   | integer                     | null       | YES         | null                                                         |                 |
| lv_criticality_levels   | requires_immediate_action       | 8   | boolean                     | null       | YES         | false                                                        |                 |
| lv_criticality_levels   | active                          | 9   | boolean                     | null       | YES         | true                                                         |                 |
| lv_criticality_levels   | display_order                   | 10  | integer                     | null       | YES         | 0                                                            |                 |
| lv_criticality_levels   | created_at                      | 11  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lv_criticality_levels   | updated_at                      | 12  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lv_evaluation_options   | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_evaluation_options   | code                            | 2   | character varying           | 10         | NO          | null                                                         | UNIQUE          |
| lv_evaluation_options   | label                           | 3   | character varying           | 100        | NO          | null                                                         |                 |
| lv_evaluation_options   | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| lv_evaluation_options   | color                           | 5   | character varying           | 20         | YES         | null                                                         |                 |
| lv_evaluation_options   | icon                            | 6   | character varying           | 50         | YES         | null                                                         |                 |
| lv_evaluation_options   | affects_compliance              | 7   | boolean                     | null       | YES         | true                                                         |                 |
| lv_evaluation_options   | weight                          | 8   | numeric                     | null       | YES         | 1.0                                                          |                 |
| lv_evaluation_options   | active                          | 9   | boolean                     | null       | YES         | true                                                         |                 |
| lv_evaluation_options   | display_order                   | 10  | integer                     | null       | YES         | 0                                                            |                 |
| lv_evaluation_options   | created_at                      | 11  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lv_evaluation_options   | updated_at                      | 12  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lv_fotos                | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_fotos                | lv_id                           | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| lv_fotos                | tipo_lv                         | 3   | text                        | null       | NO          | null                                                         |                 |
| lv_fotos                | item_id                         | 4   | integer                     | null       | NO          | null                                                         |                 |
| lv_fotos                | nome_arquivo                    | 5   | text                        | null       | NO          | null                                                         |                 |
| lv_fotos                | url_arquivo                     | 6   | text                        | null       | NO          | null                                                         |                 |
| lv_fotos                | descricao                       | 7   | text                        | null       | YES         | null                                                         |                 |
| lv_fotos                | latitude                        | 8   | numeric                     | null       | YES         | null                                                         |                 |
| lv_fotos                | longitude                       | 9   | numeric                     | null       | YES         | null                                                         |                 |
| lv_fotos                | created_at                      | 10  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_inspection_types     | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_inspection_types     | code                            | 2   | character varying           | 50         | NO          | null                                                         | UNIQUE          |
| lv_inspection_types     | name                            | 3   | character varying           | 100        | NO          | null                                                         |                 |
| lv_inspection_types     | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| lv_inspection_types     | color                           | 5   | character varying           | 20         | YES         | null                                                         |                 |
| lv_inspection_types     | icon                            | 6   | character varying           | 50         | YES         | null                                                         |                 |
| lv_inspection_types     | requires_checklist              | 7   | boolean                     | null       | YES         | true                                                         |                 |
| lv_inspection_types     | requires_report                 | 8   | boolean                     | null       | YES         | false                                                        |                 |
| lv_inspection_types     | frequency_days                  | 9   | integer                     | null       | YES         | null                                                         |                 |
| lv_inspection_types     | active                          | 10  | boolean                     | null       | YES         | true                                                         |                 |
| lv_inspection_types     | display_order                   | 11  | integer                     | null       | YES         | 0                                                            |                 |
| lv_inspection_types     | created_at                      | 12  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lv_inspection_types     | updated_at                      | 13  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lv_residuos             | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_residuos             | lv_tipo                         | 2   | text                        | null       | NO          | '01'::text                                                   |                 |
| lv_residuos             | lv_nome                         | 3   | text                        | null       | NO          | 'Resíduos'::text                                             |                 |
| lv_residuos             | usuario_id                      | 4   | uuid                        | null       | NO          | null                                                         |                 |
| lv_residuos             | usuario_nome                    | 5   | text                        | null       | NO          | null                                                         |                 |
| lv_residuos             | usuario_matricula               | 6   | text                        | null       | YES         | null                                                         |                 |
| lv_residuos             | data_preenchimento              | 7   | timestamp with time zone    | null       | NO          | CURRENT_TIMESTAMP                                            |                 |
| lv_residuos             | area                            | 8   | text                        | null       | NO          | null                                                         |                 |
| lv_residuos             | responsavel_area                | 9   | text                        | null       | YES         | null                                                         |                 |
| lv_residuos             | inspetor_principal              | 10  | text                        | null       | NO          | null                                                         |                 |
| lv_residuos             | inspetor_secundario             | 11  | text                        | null       | YES         | null                                                         |                 |
| lv_residuos             | latitude                        | 12  | numeric                     | null       | YES         | null                                                         |                 |
| lv_residuos             | longitude                       | 13  | numeric                     | null       | YES         | null                                                         |                 |
| lv_residuos             | gps_precisao                    | 14  | numeric                     | null       | YES         | null                                                         |                 |
| lv_residuos             | endereco_gps                    | 15  | text                        | null       | YES         | null                                                         |                 |
| lv_residuos             | observacoes                     | 16  | text                        | null       | YES         | null                                                         |                 |
| lv_residuos             | total_fotos                     | 17  | integer                     | null       | YES         | 0                                                            |                 |
| lv_residuos             | total_conformes                 | 18  | integer                     | null       | YES         | 0                                                            |                 |
| lv_residuos             | total_nao_conformes             | 19  | integer                     | null       | YES         | 0                                                            |                 |
| lv_residuos             | total_nao_aplicaveis            | 20  | integer                     | null       | YES         | 0                                                            |                 |
| lv_residuos             | percentual_conformidade         | 21  | numeric                     | null       | YES         | 0                                                            |                 |
| lv_residuos             | status                          | 22  | text                        | null       | NO          | 'concluido'::text                                            |                 |
| lv_residuos             | sincronizado                    | 23  | boolean                     | null       | NO          | true                                                         |                 |
| lv_residuos             | created_at                      | 24  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_residuos             | updated_at                      | 25  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_residuos             | tipo_lv                         | 26  | text                        | null       | NO          | '01'::text                                                   |                 |
| lv_residuos             | usuario_email                   | 27  | text                        | null       | NO          | ''::text                                                     |                 |
| lv_residuos             | data_inspecao                   | 28  | date                        | null       | NO          | CURRENT_DATE                                                 |                 |
| lv_residuos             | responsavel_tecnico             | 29  | text                        | null       | NO          | ''::text                                                     |                 |
| lv_residuos             | responsavel_empresa             | 30  | text                        | null       | NO          | ''::text                                                     |                 |
| lv_residuos             | gps_latitude                    | 31  | numeric                     | null       | YES         | null                                                         |                 |
| lv_residuos             | gps_longitude                   | 32  | numeric                     | null       | YES         | null                                                         |                 |
| lv_residuos             | observacoes_gerais              | 33  | text                        | null       | YES         | null                                                         |                 |
| lv_residuos             | numero_sequencial               | 34  | integer                     | null       | NO          | nextval('lv_residuos_numero_sequencial_seq'::regclass)       |                 |
| lv_residuos             | inspetor_secundario_matricula   | 35  | text                        | null       | YES         | null                                                         |                 |
| lv_residuos             | auth_user_id                    | 36  | uuid                        | null       | YES         | null                                                         |                 |
| lv_residuos_avaliacoes  | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_residuos_avaliacoes  | lv_residuos_id                  | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| lv_residuos_avaliacoes  | item_id                         | 3   | integer                     | null       | NO          | null                                                         | UNIQUE          |
| lv_residuos_avaliacoes  | item_codigo                     | 4   | text                        | null       | NO          | null                                                         |                 |
| lv_residuos_avaliacoes  | item_pergunta                   | 5   | text                        | null       | NO          | null                                                         |                 |
| lv_residuos_avaliacoes  | avaliacao                       | 6   | text                        | null       | NO          | null                                                         |                 |
| lv_residuos_avaliacoes  | observacao                      | 7   | text                        | null       | YES         | null                                                         |                 |
| lv_residuos_avaliacoes  | created_at                      | 8   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_residuos_fotos       | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_residuos_fotos       | lv_residuos_id                  | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| lv_residuos_fotos       | item_id                         | 3   | integer                     | null       | NO          | null                                                         |                 |
| lv_residuos_fotos       | nome_arquivo                    | 4   | text                        | null       | NO          | null                                                         |                 |
| lv_residuos_fotos       | url_arquivo                     | 5   | text                        | null       | NO          | null                                                         |                 |
| lv_residuos_fotos       | descricao                       | 6   | text                        | null       | YES         | null                                                         |                 |
| lv_residuos_fotos       | latitude                        | 7   | numeric                     | null       | YES         | null                                                         |                 |
| lv_residuos_fotos       | longitude                       | 8   | numeric                     | null       | YES         | null                                                         |                 |
| lv_residuos_fotos       | created_at                      | 9   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lv_validation_rules     | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lv_validation_rules     | rule_type                       | 2   | character varying           | 50         | NO          | null                                                         |                 |
| lv_validation_rules     | entity_type                     | 3   | character varying           | 50         | YES         | null                                                         |                 |
| lv_validation_rules     | threshold_value                 | 4   | numeric                     | null       | YES         | null                                                         |                 |
| lv_validation_rules     | error_message                   | 5   | text                        | null       | NO          | null                                                         |                 |
| lv_validation_rules     | warning_message                 | 6   | text                        | null       | YES         | null                                                         |                 |
| lv_validation_rules     | is_blocking                     | 7   | boolean                     | null       | YES         | true                                                         |                 |
| lv_validation_rules     | active                          | 8   | boolean                     | null       | YES         | true                                                         |                 |
| lv_validation_rules     | created_at                      | 9   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lv_validation_rules     | updated_at                      | 10  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| lvs                     | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| lvs                     | tipo_lv                         | 2   | text                        | null       | NO          | null                                                         |                 |
| lvs                     | nome_lv                         | 3   | text                        | null       | NO          | null                                                         |                 |
| lvs                     | usuario_id                      | 4   | uuid                        | null       | NO          | null                                                         |                 |
| lvs                     | usuario_nome                    | 5   | text                        | null       | NO          | null                                                         |                 |
| lvs                     | usuario_matricula               | 6   | text                        | null       | YES         | null                                                         |                 |
| lvs                     | usuario_email                   | 7   | text                        | null       | NO          | ''::text                                                     |                 |
| lvs                     | data_inspecao                   | 8   | date                        | null       | NO          | CURRENT_DATE                                                 |                 |
| lvs                     | data_preenchimento              | 9   | timestamp with time zone    | null       | NO          | CURRENT_TIMESTAMP                                            |                 |
| lvs                     | area                            | 10  | text                        | null       | NO          | null                                                         |                 |
| lvs                     | responsavel_area                | 11  | text                        | null       | YES         | null                                                         |                 |
| lvs                     | responsavel_tecnico             | 12  | text                        | null       | NO          | ''::text                                                     |                 |
| lvs                     | responsavel_empresa             | 13  | text                        | null       | NO          | ''::text                                                     |                 |
| lvs                     | inspetor_principal              | 14  | text                        | null       | NO          | null                                                         |                 |
| lvs                     | inspetor_secundario             | 15  | text                        | null       | YES         | null                                                         |                 |
| lvs                     | latitude                        | 16  | numeric                     | null       | YES         | null                                                         |                 |
| lvs                     | longitude                       | 17  | numeric                     | null       | YES         | null                                                         |                 |
| lvs                     | gps_precisao                    | 18  | numeric                     | null       | YES         | null                                                         |                 |
| lvs                     | endereco_gps                    | 19  | text                        | null       | YES         | null                                                         |                 |
| lvs                     | observacoes                     | 20  | text                        | null       | YES         | null                                                         |                 |
| lvs                     | observacoes_gerais              | 21  | text                        | null       | YES         | null                                                         |                 |
| lvs                     | total_fotos                     | 22  | integer                     | null       | YES         | 0                                                            |                 |
| lvs                     | total_conformes                 | 23  | integer                     | null       | YES         | 0                                                            |                 |
| lvs                     | total_nao_conformes             | 24  | integer                     | null       | YES         | 0                                                            |                 |
| lvs                     | total_nao_aplicaveis            | 25  | integer                     | null       | YES         | 0                                                            |                 |
| lvs                     | percentual_conformidade         | 26  | numeric                     | null       | YES         | 0                                                            |                 |
| lvs                     | status                          | 27  | text                        | null       | NO          | 'concluido'::text                                            |                 |
| lvs                     | sincronizado                    | 28  | boolean                     | null       | NO          | true                                                         |                 |
| lvs                     | numero_sequencial               | 29  | integer                     | null       | NO          | nextval('lvs_numero_sequencial_seq'::regclass)               |                 |
| lvs                     | created_at                      | 30  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lvs                     | updated_at                      | 31  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| lvs                     | inspetor_secundario_matricula   | 32  | text                        | null       | YES         | null                                                         |                 |
| lvs                     | auth_user_id                    | 33  | uuid                        | null       | YES         | null                                                         |                 |
| metas                   | id                              | 1   | uuid                        | null       | NO          | gen_random_uuid()                                            | PK              |
| metas                   | tipo_meta                       | 2   | character varying           | 50         | NO          | null                                                         |                 |
| metas                   | categoria                       | 3   | character varying           | 100        | YES         | null                                                         |                 |
| metas                   | periodo                         | 4   | character varying           | 20         | NO          | null                                                         |                 |
| metas                   | ano                             | 5   | integer                     | null       | NO          | null                                                         |                 |
| metas                   | mes                             | 6   | integer                     | null       | YES         | null                                                         |                 |
| metas                   | semana                          | 7   | integer                     | null       | YES         | null                                                         |                 |
| metas                   | dia                             | 8   | integer                     | null       | YES         | null                                                         |                 |
| metas                   | meta_quantidade                 | 9   | integer                     | null       | NO          | null                                                         |                 |
| metas                   | meta_percentual                 | 10  | numeric                     | null       | YES         | null                                                         |                 |
| metas                   | descricao                       | 11  | text                        | null       | YES         | null                                                         |                 |
| metas                   | ativa                           | 12  | boolean                     | null       | YES         | true                                                         |                 |
| metas                   | criada_por                      | 13  | uuid                        | null       | YES         | null                                                         |                 |
| metas                   | created_at                      | 14  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| metas                   | updated_at                      | 15  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| metas                   | escopo                          | 16  | character varying           | 20         | YES         | 'equipe'::character varying                                  |                 |
| metas                   | auth_user_id                    | 17  | uuid                        | null       | YES         | null                                                         |                 |
| metas_atribuicoes       | id                              | 1   | uuid                        | null       | NO          | gen_random_uuid()                                            | PK              |
| metas_atribuicoes       | meta_id                         | 2   | uuid                        | null       | YES         | null                                                         | FK              |
| metas_atribuicoes       | tma_id                          | 3   | uuid                        | null       | YES         | null                                                         | FK              |
| metas_atribuicoes       | meta_quantidade_individual      | 4   | integer                     | null       | YES         | null                                                         |                 |
| metas_atribuicoes       | responsavel                     | 5   | boolean                     | null       | YES         | true                                                         |                 |
| metas_atribuicoes       | created_at                      | 6   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| metas_atribuicoes       | updated_at                      | 7   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| metas_atribuicoes       | auth_user_id                    | 8   | uuid                        | null       | YES         | null                                                         |                 |
| perfis                  | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| perfis                  | nome                            | 2   | text                        | null       | NO          | null                                                         | UNIQUE          |
| perfis                  | descricao                       | 3   | text                        | null       | YES         | null                                                         |                 |
| perfis                  | permissoes                      | 4   | jsonb                       | null       | YES         | '{}'::jsonb                                                  |                 |
| perfis                  | ativo                           | 5   | boolean                     | null       | YES         | true                                                         |                 |
| perfis                  | created_at                      | 6   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| perfis                  | updated_at                      | 7   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| perguntas_lv            | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| perguntas_lv            | codigo                          | 2   | text                        | null       | NO          | null                                                         | UNIQUE          |
| perguntas_lv            | pergunta                        | 3   | text                        | null       | NO          | null                                                         |                 |
| perguntas_lv            | categoria_id                    | 4   | uuid                        | null       | NO          | null                                                         | FK              |
| perguntas_lv            | versao_id                       | 5   | uuid                        | null       | NO          | null                                                         | FK              |
| perguntas_lv            | ordem                           | 6   | integer                     | null       | YES         | null                                                         |                 |
| perguntas_lv            | obrigatoria                     | 7   | boolean                     | null       | YES         | true                                                         |                 |
| perguntas_lv            | ativa                           | 8   | boolean                     | null       | YES         | true                                                         |                 |
| perguntas_lv            | created_at                      | 9   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| perguntas_lv            | updated_at                      | 10  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| progresso_metas         | id                              | 1   | uuid                        | null       | NO          | gen_random_uuid()                                            | PK              |
| progresso_metas         | meta_id                         | 2   | uuid                        | null       | YES         | null                                                         | FK              |
| progresso_metas         | periodo                         | 3   | character varying           | 20         | NO          | null                                                         | UNIQUE          |
| progresso_metas         | ano                             | 4   | integer                     | null       | NO          | null                                                         | UNIQUE          |
| progresso_metas         | mes                             | 5   | integer                     | null       | YES         | null                                                         | UNIQUE          |
| progresso_metas         | semana                          | 6   | integer                     | null       | YES         | null                                                         | UNIQUE          |
| progresso_metas         | dia                             | 7   | integer                     | null       | YES         | null                                                         | UNIQUE          |
| progresso_metas         | quantidade_atual                | 8   | integer                     | null       | YES         | 0                                                            |                 |
| progresso_metas         | percentual_atual                | 9   | numeric                     | null       | YES         | 0                                                            |                 |
| progresso_metas         | percentual_alcancado            | 10  | numeric                     | null       | YES         | 0                                                            |                 |
| progresso_metas         | status                          | 11  | character varying           | 20         | YES         | 'em_andamento'::character varying                            |                 |
| progresso_metas         | ultima_atualizacao              | 12  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| progresso_metas         | created_at                      | 13  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| progresso_metas         | updated_at                      | 14  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| progresso_metas         | tma_id                          | 15  | uuid                        | null       | YES         | null                                                         | UNIQUE          |
| progresso_metas         | auth_user_id                    | 16  | uuid                        | null       | YES         | null                                                         |                 |
| respostas_inspecao      | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| respostas_inspecao      | inspecao_id                     | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| respostas_inspecao      | pergunta_id                     | 3   | uuid                        | null       | NO          | null                                                         | FK              |
| respostas_inspecao      | resposta                        | 4   | text                        | null       | NO          | null                                                         |                 |
| respostas_inspecao      | observacao                      | 5   | text                        | null       | YES         | null                                                         |                 |
| respostas_inspecao      | created_at                      | 6   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| respostas_inspecao      | updated_at                      | 7   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| routine_activity_status | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| routine_activity_status | code                            | 2   | character varying           | 50         | NO          | null                                                         | UNIQUE          |
| routine_activity_status | name                            | 3   | character varying           | 100        | NO          | null                                                         |                 |
| routine_activity_status | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| routine_activity_status | color                           | 5   | character varying           | 20         | YES         | null                                                         |                 |
| routine_activity_status | icon                            | 6   | character varying           | 50         | YES         | null                                                         |                 |
| routine_activity_status | is_initial                      | 7   | boolean                     | null       | YES         | false                                                        |                 |
| routine_activity_status | is_final                        | 8   | boolean                     | null       | YES         | false                                                        |                 |
| routine_activity_status | allows_edit                     | 9   | boolean                     | null       | YES         | true                                                         |                 |
| routine_activity_status | allows_photos                   | 10  | boolean                     | null       | YES         | true                                                         |                 |
| routine_activity_status | requires_completion_date        | 11  | boolean                     | null       | YES         | false                                                        |                 |
| routine_activity_status | active                          | 12  | boolean                     | null       | YES         | true                                                         |                 |
| routine_activity_status | display_order                   | 13  | integer                     | null       | YES         | 0                                                            |                 |
| routine_activity_status | created_at                      | 14  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| routine_activity_status | updated_at                      | 15  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| severity_levels         | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| severity_levels         | code                            | 2   | character varying           | 10         | NO          | null                                                         | UNIQUE          |
| severity_levels         | name                            | 3   | character varying           | 100        | NO          | null                                                         |                 |
| severity_levels         | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| severity_levels         | color                           | 5   | character varying           | 20         | YES         | null                                                         |                 |
| severity_levels         | icon                            | 6   | character varying           | 50         | YES         | null                                                         |                 |
| severity_levels         | priority                        | 7   | integer                     | null       | YES         | null                                                         |                 |
| severity_levels         | requires_immediate_action       | 8   | boolean                     | null       | YES         | false                                                        |                 |
| severity_levels         | sla_hours                       | 9   | integer                     | null       | YES         | null                                                         |                 |
| severity_levels         | active                          | 10  | boolean                     | null       | YES         | true                                                         |                 |
| severity_levels         | display_order                   | 11  | integer                     | null       | YES         | 0                                                            |                 |
| severity_levels         | created_at                      | 12  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| severity_levels         | updated_at                      | 13  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| storage_logs            | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| storage_logs            | bucket_id                       | 2   | text                        | null       | NO          | null                                                         |                 |
| storage_logs            | object_name                     | 3   | text                        | null       | NO          | null                                                         |                 |
| storage_logs            | action                          | 4   | text                        | null       | NO          | null                                                         |                 |
| storage_logs            | user_id                         | 5   | uuid                        | null       | YES         | null                                                         | FK              |
| storage_logs            | metadata                        | 6   | jsonb                       | null       | YES         | null                                                         |                 |
| storage_logs            | created_at                      | 7   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| term_status             | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| term_status             | code                            | 2   | character varying           | 50         | NO          | null                                                         | UNIQUE          |
| term_status             | name                            | 3   | character varying           | 100        | NO          | null                                                         |                 |
| term_status             | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| term_status             | color                           | 5   | character varying           | 20         | YES         | null                                                         |                 |
| term_status             | icon                            | 6   | character varying           | 50         | YES         | null                                                         |                 |
| term_status             | is_initial                      | 7   | boolean                     | null       | YES         | false                                                        |                 |
| term_status             | is_final                        | 8   | boolean                     | null       | YES         | false                                                        |                 |
| term_status             | allows_edit                     | 9   | boolean                     | null       | YES         | true                                                         |                 |
| term_status             | requires_approval               | 10  | boolean                     | null       | YES         | false                                                        |                 |
| term_status             | display_order                   | 11  | integer                     | null       | YES         | 0                                                            |                 |
| term_status             | active                          | 12  | boolean                     | null       | YES         | true                                                         |                 |
| term_status             | created_at                      | 13  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| term_status             | updated_at                      | 14  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| term_status_transitions | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| term_status_transitions | from_status_id                  | 2   | uuid                        | null       | YES         | null                                                         | FK              |
| term_status_transitions | to_status_id                    | 3   | uuid                        | null       | YES         | null                                                         | FK              |
| term_status_transitions | requires_role                   | 4   | character varying           | 50         | YES         | null                                                         |                 |
| term_status_transitions | requires_comment                | 5   | boolean                     | null       | YES         | false                                                        |                 |
| term_status_transitions | active                          | 6   | boolean                     | null       | YES         | true                                                         |                 |
| term_status_transitions | created_at                      | 7   | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| term_types              | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| term_types              | code                            | 2   | character varying           | 50         | NO          | null                                                         | UNIQUE          |
| term_types              | prefix                          | 3   | character varying           | 10         | NO          | null                                                         |                 |
| term_types              | name                            | 4   | character varying           | 100        | NO          | null                                                         |                 |
| term_types              | description                     | 5   | text                        | null       | YES         | null                                                         |                 |
| term_types              | color                           | 6   | character varying           | 20         | YES         | null                                                         |                 |
| term_types              | icon                            | 7   | character varying           | 50         | YES         | null                                                         |                 |
| term_types              | requires_signature              | 8   | boolean                     | null       | YES         | true                                                         |                 |
| term_types              | requires_action_plan            | 9   | boolean                     | null       | YES         | true                                                         |                 |
| term_types              | active                          | 10  | boolean                     | null       | YES         | true                                                         |                 |
| term_types              | display_order                   | 11  | integer                     | null       | YES         | 0                                                            |                 |
| term_types              | created_at                      | 12  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| term_types              | updated_at                      | 13  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| termos_ambientais       | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| termos_ambientais       | numero_sequencial               | 2   | integer                     | null       | NO          | nextval('termos_ambientais_numero_sequencial_seq'::regclass) | UNIQUE          |
| termos_ambientais       | data_termo                      | 3   | date                        | null       | NO          | CURRENT_DATE                                                 |                 |
| termos_ambientais       | hora_termo                      | 4   | time without time zone      | null       | NO          | CURRENT_TIME                                                 |                 |
| termos_ambientais       | local_atividade                 | 5   | text                        | null       | NO          | null                                                         |                 |
| termos_ambientais       | projeto_ba                      | 6   | character varying           | 100        | YES         | null                                                         |                 |
| termos_ambientais       | fase_etapa_obra                 | 7   | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | emitido_por_nome                | 8   | character varying           | 255        | NO          | null                                                         |                 |
| termos_ambientais       | emitido_por_gerencia            | 9   | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | emitido_por_empresa             | 10  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | emitido_por_usuario_id          | 11  | uuid                        | null       | YES         | null                                                         | FK              |
| termos_ambientais       | destinatario_nome               | 12  | character varying           | 255        | NO          | null                                                         |                 |
| termos_ambientais       | destinatario_gerencia           | 13  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | destinatario_empresa            | 14  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | area_equipamento_atividade      | 15  | text                        | null       | NO          | null                                                         |                 |
| termos_ambientais       | equipe                          | 16  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | atividade_especifica            | 17  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | tipo_termo                      | 18  | character varying           | 50         | NO          | null                                                         |                 |
| termos_ambientais       | natureza_desvio                 | 19  | character varying           | 50         | NO          | null                                                         |                 |
| termos_ambientais       | descricao_nc_1                  | 20  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_1                 | 21  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_2                  | 22  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_2                 | 23  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_3                  | 24  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_3                 | 25  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_4                  | 26  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_4                 | 27  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_5                  | 28  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_5                 | 29  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_6                  | 30  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_6                 | 31  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_7                  | 32  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_7                 | 33  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_8                  | 34  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_8                 | 35  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_9                  | 36  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_9                 | 37  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | descricao_nc_10                 | 38  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | severidade_nc_10                | 39  | character varying           | 5          | YES         | null                                                         |                 |
| termos_ambientais       | lista_verificacao_aplicada      | 40  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | tst_tma_responsavel             | 41  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_1                 | 42  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_1                    | 43  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_2                 | 44  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_2                    | 45  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_3                 | 46  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_3                    | 47  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_4                 | 48  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_4                    | 49  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_5                 | 50  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_5                    | 51  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_6                 | 52  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_6                    | 53  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_7                 | 54  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_7                    | 55  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_8                 | 56  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_8                    | 57  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_9                 | 58  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_9                    | 59  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | acao_correcao_10                | 60  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | prazo_acao_10                   | 61  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | assinatura_responsavel_area     | 62  | boolean                     | null       | YES         | false                                                        |                 |
| termos_ambientais       | data_assinatura_responsavel     | 63  | timestamp without time zone | null       | YES         | null                                                         |                 |
| termos_ambientais       | assinatura_emitente             | 64  | boolean                     | null       | YES         | true                                                         |                 |
| termos_ambientais       | data_assinatura_emitente        | 65  | timestamp without time zone | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| termos_ambientais       | providencias_tomadas            | 66  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | observacoes                     | 67  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | liberacao_nome                  | 68  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | liberacao_empresa               | 69  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | liberacao_gerencia              | 70  | character varying           | 255        | YES         | null                                                         |                 |
| termos_ambientais       | liberacao_data                  | 71  | date                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | liberacao_horario               | 72  | time without time zone      | null       | YES         | null                                                         |                 |
| termos_ambientais       | liberacao_assinatura_carimbo    | 73  | boolean                     | null       | YES         | false                                                        |                 |
| termos_ambientais       | data_liberacao                  | 74  | timestamp without time zone | null       | YES         | null                                                         |                 |
| termos_ambientais       | status                          | 75  | character varying           | 50         | YES         | 'PENDENTE'::character varying                                |                 |
| termos_ambientais       | latitude                        | 76  | numeric                     | null       | YES         | null                                                         |                 |
| termos_ambientais       | longitude                       | 77  | numeric                     | null       | YES         | null                                                         |                 |
| termos_ambientais       | precisao_gps                    | 78  | numeric                     | null       | YES         | null                                                         |                 |
| termos_ambientais       | endereco_gps                    | 79  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | sincronizado                    | 80  | boolean                     | null       | YES         | true                                                         |                 |
| termos_ambientais       | offline                         | 81  | boolean                     | null       | YES         | false                                                        |                 |
| termos_ambientais       | created_at                      | 82  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| termos_ambientais       | updated_at                      | 83  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| termos_ambientais       | numero_termo                    | 84  | character varying           | 50         | YES         | null                                                         |                 |
| termos_ambientais       | assinatura_responsavel_area_img | 85  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | assinatura_emitente_img         | 86  | text                        | null       | YES         | null                                                         |                 |
| termos_ambientais       | auth_user_id                    | 87  | uuid                        | null       | YES         | null                                                         |                 |
| termos_fotos            | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| termos_fotos            | termo_id                        | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| termos_fotos            | nome_arquivo                    | 3   | character varying           | 255        | NO          | null                                                         |                 |
| termos_fotos            | url_arquivo                     | 4   | text                        | null       | NO          | null                                                         |                 |
| termos_fotos            | tamanho_bytes                   | 5   | integer                     | null       | YES         | null                                                         |                 |
| termos_fotos            | tipo_mime                       | 6   | character varying           | 100        | YES         | null                                                         |                 |
| termos_fotos            | categoria                       | 7   | character varying           | 100        | YES         | null                                                         |                 |
| termos_fotos            | descricao                       | 8   | text                        | null       | YES         | null                                                         |                 |
| termos_fotos            | latitude                        | 9   | numeric                     | null       | YES         | null                                                         |                 |
| termos_fotos            | longitude                       | 10  | numeric                     | null       | YES         | null                                                         |                 |
| termos_fotos            | precisao_gps                    | 11  | numeric                     | null       | YES         | null                                                         |                 |
| termos_fotos            | endereco                        | 12  | text                        | null       | YES         | null                                                         |                 |
| termos_fotos            | timestamp_captura               | 13  | timestamp without time zone | null       | YES         | null                                                         |                 |
| termos_fotos            | offline                         | 14  | boolean                     | null       | YES         | false                                                        |                 |
| termos_fotos            | sincronizado                    | 15  | boolean                     | null       | YES         | true                                                         |                 |
| termos_fotos            | created_at                      | 16  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| termos_historico        | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| termos_historico        | termo_id                        | 2   | uuid                        | null       | NO          | null                                                         | FK              |
| termos_historico        | tipo_acao                       | 3   | character varying           | 100        | NO          | null                                                         |                 |
| termos_historico        | descricao                       | 4   | text                        | null       | NO          | null                                                         |                 |
| termos_historico        | data_acao                       | 5   | timestamp without time zone | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| termos_historico        | usuario_id                      | 6   | uuid                        | null       | YES         | null                                                         |                 |
| termos_historico        | usuario_nome                    | 7   | character varying           | 255        | YES         | null                                                         |                 |
| termos_historico        | observacoes                     | 8   | text                        | null       | YES         | null                                                         |                 |
| termos_historico        | dados_alterados                 | 9   | jsonb                       | null       | YES         | null                                                         |                 |
| termos_historico        | created_at                      | 10  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| usuarios                | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| usuarios                | nome                            | 2   | text                        | null       | NO          | null                                                         |                 |
| usuarios                | email                           | 3   | text                        | null       | NO          | null                                                         | UNIQUE          |
| usuarios                | senha                           | 4   | text                        | null       | NO          | null                                                         |                 |
| usuarios                | matricula                       | 5   | text                        | null       | YES         | null                                                         | UNIQUE          |
| usuarios                | telefone                        | 6   | text                        | null       | YES         | null                                                         |                 |
| usuarios                | perfil_id                       | 7   | uuid                        | null       | NO          | null                                                         | FK              |
| usuarios                | empresa_id                      | 8   | uuid                        | null       | YES         | null                                                         | FK              |
| usuarios                | ativo                           | 9   | boolean                     | null       | YES         | true                                                         |                 |
| usuarios                | ultimo_login                    | 10  | timestamp with time zone    | null       | YES         | null                                                         |                 |
| usuarios                | created_at                      | 11  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| usuarios                | updated_at                      | 12  | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| usuarios                | auth_user_id                    | 13  | uuid                        | null       | YES         | null                                                         | FK              |
| versoes_lv              | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| versoes_lv              | nome                            | 2   | text                        | null       | NO          | null                                                         |                 |
| versoes_lv              | descricao                       | 3   | text                        | null       | YES         | null                                                         |                 |
| versoes_lv              | data_revisao                    | 4   | date                        | null       | YES         | null                                                         |                 |
| versoes_lv              | ativa                           | 5   | boolean                     | null       | YES         | true                                                         |                 |
| versoes_lv              | created_at                      | 6   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| versoes_lv              | updated_at                      | 7   | timestamp with time zone    | null       | YES         | CURRENT_TIMESTAMP                                            |                 |
| waste_classifications   | id                              | 1   | uuid                        | null       | NO          | uuid_generate_v4()                                           | PK              |
| waste_classifications   | code                            | 2   | character varying           | 50         | NO          | null                                                         | UNIQUE          |
| waste_classifications   | name                            | 3   | character varying           | 100        | NO          | null                                                         |                 |
| waste_classifications   | description                     | 4   | text                        | null       | YES         | null                                                         |                 |
| waste_classifications   | regulatory_reference            | 5   | character varying           | 200        | YES         | null                                                         |                 |
| waste_classifications   | color                           | 6   | character varying           | 20         | YES         | null                                                         |                 |
| waste_classifications   | icon                            | 7   | character varying           | 50         | YES         | null                                                         |                 |
| waste_classifications   | requires_special_handling       | 8   | boolean                     | null       | YES         | false                                                        |                 |
| waste_classifications   | requires_manifest               | 9   | boolean                     | null       | YES         | false                                                        |                 |
| waste_classifications   | disposal_restrictions           | 10  | text                        | null       | YES         | null                                                         |                 |
| waste_classifications   | active                          | 11  | boolean                     | null       | YES         | true                                                         |                 |
| waste_classifications   | display_order                   | 12  | integer                     | null       | YES         | 0                                                            |                 |
| waste_classifications   | created_at                      | 13  | timestamp with time zone    | null       | YES         | now()                                                        |                 |
| waste_classifications   | updated_at                      | 14  | timestamp with time zone    | null       | YES         | now()                                                        |                 |




------


| table_name              | column_name                     | data_type                   | is_nullable | column_default                                               |
| ----------------------- | ------------------------------- | --------------------------- | ----------- | ------------------------------------------------------------ |
| areas                   | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| areas                   | nome                            | text                        | NO          | null                                                         |
| areas                   | descricao                       | text                        | YES         | null                                                         |
| areas                   | localizacao                     | text                        | YES         | null                                                         |
| areas                   | ativa                           | boolean                     | YES         | true                                                         |
| areas                   | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| areas                   | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| atividades_rotina       | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| atividades_rotina       | data_atividade                  | date                        | NO          | null                                                         |
| atividades_rotina       | hora_inicio                     | time without time zone      | YES         | null                                                         |
| atividades_rotina       | hora_fim                        | time without time zone      | YES         | null                                                         |
| atividades_rotina       | area_id                         | uuid                        | NO          | null                                                         |
| atividades_rotina       | atividade                       | text                        | NO          | null                                                         |
| atividades_rotina       | descricao                       | text                        | YES         | null                                                         |
| atividades_rotina       | km_percorrido                   | numeric                     | YES         | null                                                         |
| atividades_rotina       | tma_responsavel_id              | uuid                        | NO          | null                                                         |
| atividades_rotina       | encarregado_id                  | uuid                        | NO          | null                                                         |
| atividades_rotina       | empresa_contratada_id           | uuid                        | YES         | null                                                         |
| atividades_rotina       | status                          | text                        | YES         | 'Planejada'::text                                            |
| atividades_rotina       | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| atividades_rotina       | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| atividades_rotina       | latitude                        | numeric                     | YES         | null                                                         |
| atividades_rotina       | longitude                       | numeric                     | YES         | null                                                         |
| atividades_rotina       | auth_user_id                    | uuid                        | YES         | null                                                         |
| atividades_rotina       | emitido_por_usuario_id          | uuid                        | YES         | null                                                         |
| categorias_lv           | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| categorias_lv           | codigo                          | text                        | NO          | null                                                         |
| categorias_lv           | nome                            | text                        | NO          | null                                                         |
| categorias_lv           | descricao                       | text                        | YES         | null                                                         |
| categorias_lv           | ativa                           | boolean                     | YES         | true                                                         |
| categorias_lv           | ordem                           | integer                     | YES         | null                                                         |
| categorias_lv           | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| categorias_lv           | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| configuracoes_metas     | id                              | uuid                        | NO          | gen_random_uuid()                                            |
| configuracoes_metas     | chave                           | character varying           | NO          | null                                                         |
| configuracoes_metas     | valor                           | text                        | NO          | null                                                         |
| configuracoes_metas     | descricao                       | text                        | YES         | null                                                         |
| configuracoes_metas     | tipo                            | character varying           | YES         | 'string'::character varying                                  |
| configuracoes_metas     | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| configuracoes_metas     | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| deviation_nature        | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| deviation_nature        | code                            | character varying           | NO          | null                                                         |
| deviation_nature        | name                            | character varying           | NO          | null                                                         |
| deviation_nature        | description                     | text                        | YES         | null                                                         |
| deviation_nature        | color                           | character varying           | YES         | null                                                         |
| deviation_nature        | icon                            | character varying           | YES         | null                                                         |
| deviation_nature        | requires_investigation          | boolean                     | YES         | false                                                        |
| deviation_nature        | requires_root_cause_analysis    | boolean                     | YES         | false                                                        |
| deviation_nature        | active                          | boolean                     | YES         | true                                                         |
| deviation_nature        | display_order                   | integer                     | YES         | 0                                                            |
| deviation_nature        | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| deviation_nature        | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| empresas_contratadas    | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| empresas_contratadas    | nome                            | text                        | NO          | null                                                         |
| empresas_contratadas    | cnpj                            | text                        | YES         | null                                                         |
| empresas_contratadas    | contato                         | text                        | YES         | null                                                         |
| empresas_contratadas    | telefone                        | text                        | YES         | null                                                         |
| empresas_contratadas    | email                           | text                        | YES         | null                                                         |
| empresas_contratadas    | ativa                           | boolean                     | YES         | true                                                         |
| empresas_contratadas    | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| empresas_contratadas    | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| encarregados            | id                              | uuid                        | NO          | gen_random_uuid()                                            |
| encarregados            | nome_completo                   | text                        | NO          | null                                                         |
| encarregados            | apelido                         | text                        | YES         | null                                                         |
| encarregados            | telefone                        | text                        | YES         | null                                                         |
| encarregados            | empresa_contratada_id           | uuid                        | YES         | null                                                         |
| encarregados            | ativo                           | boolean                     | YES         | true                                                         |
| encarregados            | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| encarregados            | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| fotos_inspecao          | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| fotos_inspecao          | inspecao_id                     | uuid                        | NO          | null                                                         |
| fotos_inspecao          | pergunta_id                     | uuid                        | YES         | null                                                         |
| fotos_inspecao          | nome_arquivo                    | text                        | NO          | null                                                         |
| fotos_inspecao          | url_arquivo                     | text                        | NO          | null                                                         |
| fotos_inspecao          | descricao                       | text                        | YES         | null                                                         |
| fotos_inspecao          | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| fotos_rotina            | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| fotos_rotina            | atividade_id                    | uuid                        | NO          | null                                                         |
| fotos_rotina            | nome_arquivo                    | text                        | NO          | null                                                         |
| fotos_rotina            | url_arquivo                     | text                        | NO          | null                                                         |
| fotos_rotina            | descricao                       | text                        | YES         | null                                                         |
| fotos_rotina            | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| fotos_rotina            | latitude                        | numeric                     | YES         | null                                                         |
| fotos_rotina            | longitude                       | numeric                     | YES         | null                                                         |
| inspecoes               | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| inspecoes               | data_inspecao                   | date                        | NO          | null                                                         |
| inspecoes               | area_id                         | uuid                        | NO          | null                                                         |
| inspecoes               | categoria_id                    | uuid                        | NO          | null                                                         |
| inspecoes               | versao_id                       | uuid                        | NO          | null                                                         |
| inspecoes               | responsavel_id                  | uuid                        | NO          | null                                                         |
| inspecoes               | tma_contratada_id               | uuid                        | YES         | null                                                         |
| inspecoes               | status                          | text                        | YES         | 'Pendente'::text                                             |
| inspecoes               | observacoes_gerais              | text                        | YES         | null                                                         |
| inspecoes               | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| inspecoes               | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_avaliacoes           | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_avaliacoes           | lv_id                           | uuid                        | NO          | null                                                         |
| lv_avaliacoes           | tipo_lv                         | text                        | NO          | null                                                         |
| lv_avaliacoes           | item_id                         | integer                     | NO          | null                                                         |
| lv_avaliacoes           | item_codigo                     | text                        | NO          | null                                                         |
| lv_avaliacoes           | item_pergunta                   | text                        | NO          | null                                                         |
| lv_avaliacoes           | avaliacao                       | text                        | NO          | null                                                         |
| lv_avaliacoes           | observacao                      | text                        | YES         | null                                                         |
| lv_avaliacoes           | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_configuracoes        | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_configuracoes        | tipo_lv                         | text                        | NO          | null                                                         |
| lv_configuracoes        | nome_lv                         | text                        | NO          | null                                                         |
| lv_configuracoes        | nome_completo                   | text                        | NO          | null                                                         |
| lv_configuracoes        | revisao                         | text                        | YES         | null                                                         |
| lv_configuracoes        | data_revisao                    | date                        | YES         | null                                                         |
| lv_configuracoes        | ativa                           | boolean                     | NO          | true                                                         |
| lv_configuracoes        | bucket_fotos                    | text                        | NO          | 'fotos-lvs'::text                                            |
| lv_configuracoes        | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_configuracoes        | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_criticality_levels   | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_criticality_levels   | code                            | character varying           | NO          | null                                                         |
| lv_criticality_levels   | name                            | character varying           | NO          | null                                                         |
| lv_criticality_levels   | description                     | text                        | YES         | null                                                         |
| lv_criticality_levels   | color                           | character varying           | YES         | null                                                         |
| lv_criticality_levels   | icon                            | character varying           | YES         | null                                                         |
| lv_criticality_levels   | priority                        | integer                     | YES         | null                                                         |
| lv_criticality_levels   | requires_immediate_action       | boolean                     | YES         | false                                                        |
| lv_criticality_levels   | active                          | boolean                     | YES         | true                                                         |
| lv_criticality_levels   | display_order                   | integer                     | YES         | 0                                                            |
| lv_criticality_levels   | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| lv_criticality_levels   | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| lv_evaluation_options   | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_evaluation_options   | code                            | character varying           | NO          | null                                                         |
| lv_evaluation_options   | label                           | character varying           | NO          | null                                                         |
| lv_evaluation_options   | description                     | text                        | YES         | null                                                         |
| lv_evaluation_options   | color                           | character varying           | YES         | null                                                         |
| lv_evaluation_options   | icon                            | character varying           | YES         | null                                                         |
| lv_evaluation_options   | affects_compliance              | boolean                     | YES         | true                                                         |
| lv_evaluation_options   | weight                          | numeric                     | YES         | 1.0                                                          |
| lv_evaluation_options   | active                          | boolean                     | YES         | true                                                         |
| lv_evaluation_options   | display_order                   | integer                     | YES         | 0                                                            |
| lv_evaluation_options   | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| lv_evaluation_options   | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| lv_fotos                | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_fotos                | lv_id                           | uuid                        | NO          | null                                                         |
| lv_fotos                | tipo_lv                         | text                        | NO          | null                                                         |
| lv_fotos                | item_id                         | integer                     | NO          | null                                                         |
| lv_fotos                | nome_arquivo                    | text                        | NO          | null                                                         |
| lv_fotos                | url_arquivo                     | text                        | NO          | null                                                         |
| lv_fotos                | descricao                       | text                        | YES         | null                                                         |
| lv_fotos                | latitude                        | numeric                     | YES         | null                                                         |
| lv_fotos                | longitude                       | numeric                     | YES         | null                                                         |
| lv_fotos                | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_inspection_types     | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_inspection_types     | code                            | character varying           | NO          | null                                                         |
| lv_inspection_types     | name                            | character varying           | NO          | null                                                         |
| lv_inspection_types     | description                     | text                        | YES         | null                                                         |
| lv_inspection_types     | color                           | character varying           | YES         | null                                                         |
| lv_inspection_types     | icon                            | character varying           | YES         | null                                                         |
| lv_inspection_types     | requires_checklist              | boolean                     | YES         | true                                                         |
| lv_inspection_types     | requires_report                 | boolean                     | YES         | false                                                        |
| lv_inspection_types     | frequency_days                  | integer                     | YES         | null                                                         |
| lv_inspection_types     | active                          | boolean                     | YES         | true                                                         |
| lv_inspection_types     | display_order                   | integer                     | YES         | 0                                                            |
| lv_inspection_types     | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| lv_inspection_types     | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| lv_residuos             | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_residuos             | lv_tipo                         | text                        | NO          | '01'::text                                                   |
| lv_residuos             | lv_nome                         | text                        | NO          | 'Resíduos'::text                                             |
| lv_residuos             | usuario_id                      | uuid                        | NO          | null                                                         |
| lv_residuos             | usuario_nome                    | text                        | NO          | null                                                         |
| lv_residuos             | usuario_matricula               | text                        | YES         | null                                                         |
| lv_residuos             | data_preenchimento              | timestamp with time zone    | NO          | CURRENT_TIMESTAMP                                            |
| lv_residuos             | area                            | text                        | NO          | null                                                         |
| lv_residuos             | responsavel_area                | text                        | YES         | null                                                         |
| lv_residuos             | inspetor_principal              | text                        | NO          | null                                                         |
| lv_residuos             | inspetor_secundario             | text                        | YES         | null                                                         |
| lv_residuos             | latitude                        | numeric                     | YES         | null                                                         |
| lv_residuos             | longitude                       | numeric                     | YES         | null                                                         |
| lv_residuos             | gps_precisao                    | numeric                     | YES         | null                                                         |
| lv_residuos             | endereco_gps                    | text                        | YES         | null                                                         |
| lv_residuos             | observacoes                     | text                        | YES         | null                                                         |
| lv_residuos             | total_fotos                     | integer                     | YES         | 0                                                            |
| lv_residuos             | total_conformes                 | integer                     | YES         | 0                                                            |
| lv_residuos             | total_nao_conformes             | integer                     | YES         | 0                                                            |
| lv_residuos             | total_nao_aplicaveis            | integer                     | YES         | 0                                                            |
| lv_residuos             | percentual_conformidade         | numeric                     | YES         | 0                                                            |
| lv_residuos             | status                          | text                        | NO          | 'concluido'::text                                            |
| lv_residuos             | sincronizado                    | boolean                     | NO          | true                                                         |
| lv_residuos             | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_residuos             | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_residuos             | tipo_lv                         | text                        | NO          | '01'::text                                                   |
| lv_residuos             | usuario_email                   | text                        | NO          | ''::text                                                     |
| lv_residuos             | data_inspecao                   | date                        | NO          | CURRENT_DATE                                                 |
| lv_residuos             | responsavel_tecnico             | text                        | NO          | ''::text                                                     |
| lv_residuos             | responsavel_empresa             | text                        | NO          | ''::text                                                     |
| lv_residuos             | gps_latitude                    | numeric                     | YES         | null                                                         |
| lv_residuos             | gps_longitude                   | numeric                     | YES         | null                                                         |
| lv_residuos             | observacoes_gerais              | text                        | YES         | null                                                         |
| lv_residuos             | numero_sequencial               | integer                     | NO          | nextval('lv_residuos_numero_sequencial_seq'::regclass)       |
| lv_residuos             | inspetor_secundario_matricula   | text                        | YES         | null                                                         |
| lv_residuos             | auth_user_id                    | uuid                        | YES         | null                                                         |
| lv_residuos_avaliacoes  | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_residuos_avaliacoes  | lv_residuos_id                  | uuid                        | NO          | null                                                         |
| lv_residuos_avaliacoes  | item_id                         | integer                     | NO          | null                                                         |
| lv_residuos_avaliacoes  | item_codigo                     | text                        | NO          | null                                                         |
| lv_residuos_avaliacoes  | item_pergunta                   | text                        | NO          | null                                                         |
| lv_residuos_avaliacoes  | avaliacao                       | text                        | NO          | null                                                         |
| lv_residuos_avaliacoes  | observacao                      | text                        | YES         | null                                                         |
| lv_residuos_avaliacoes  | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_residuos_fotos       | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_residuos_fotos       | lv_residuos_id                  | uuid                        | NO          | null                                                         |
| lv_residuos_fotos       | item_id                         | integer                     | NO          | null                                                         |
| lv_residuos_fotos       | nome_arquivo                    | text                        | NO          | null                                                         |
| lv_residuos_fotos       | url_arquivo                     | text                        | NO          | null                                                         |
| lv_residuos_fotos       | descricao                       | text                        | YES         | null                                                         |
| lv_residuos_fotos       | latitude                        | numeric                     | YES         | null                                                         |
| lv_residuos_fotos       | longitude                       | numeric                     | YES         | null                                                         |
| lv_residuos_fotos       | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lv_validation_rules     | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lv_validation_rules     | rule_type                       | character varying           | NO          | null                                                         |
| lv_validation_rules     | entity_type                     | character varying           | YES         | null                                                         |
| lv_validation_rules     | threshold_value                 | numeric                     | YES         | null                                                         |
| lv_validation_rules     | error_message                   | text                        | NO          | null                                                         |
| lv_validation_rules     | warning_message                 | text                        | YES         | null                                                         |
| lv_validation_rules     | is_blocking                     | boolean                     | YES         | true                                                         |
| lv_validation_rules     | active                          | boolean                     | YES         | true                                                         |
| lv_validation_rules     | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| lv_validation_rules     | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| lvs                     | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| lvs                     | tipo_lv                         | text                        | NO          | null                                                         |
| lvs                     | nome_lv                         | text                        | NO          | null                                                         |
| lvs                     | usuario_id                      | uuid                        | NO          | null                                                         |
| lvs                     | usuario_nome                    | text                        | NO          | null                                                         |
| lvs                     | usuario_matricula               | text                        | YES         | null                                                         |
| lvs                     | usuario_email                   | text                        | NO          | ''::text                                                     |
| lvs                     | data_inspecao                   | date                        | NO          | CURRENT_DATE                                                 |
| lvs                     | data_preenchimento              | timestamp with time zone    | NO          | CURRENT_TIMESTAMP                                            |
| lvs                     | area                            | text                        | NO          | null                                                         |
| lvs                     | responsavel_area                | text                        | YES         | null                                                         |
| lvs                     | responsavel_tecnico             | text                        | NO          | ''::text                                                     |
| lvs                     | responsavel_empresa             | text                        | NO          | ''::text                                                     |
| lvs                     | inspetor_principal              | text                        | NO          | null                                                         |
| lvs                     | inspetor_secundario             | text                        | YES         | null                                                         |
| lvs                     | latitude                        | numeric                     | YES         | null                                                         |
| lvs                     | longitude                       | numeric                     | YES         | null                                                         |
| lvs                     | gps_precisao                    | numeric                     | YES         | null                                                         |
| lvs                     | endereco_gps                    | text                        | YES         | null                                                         |
| lvs                     | observacoes                     | text                        | YES         | null                                                         |
| lvs                     | observacoes_gerais              | text                        | YES         | null                                                         |
| lvs                     | total_fotos                     | integer                     | YES         | 0                                                            |
| lvs                     | total_conformes                 | integer                     | YES         | 0                                                            |
| lvs                     | total_nao_conformes             | integer                     | YES         | 0                                                            |
| lvs                     | total_nao_aplicaveis            | integer                     | YES         | 0                                                            |
| lvs                     | percentual_conformidade         | numeric                     | YES         | 0                                                            |
| lvs                     | status                          | text                        | NO          | 'concluido'::text                                            |
| lvs                     | sincronizado                    | boolean                     | NO          | true                                                         |
| lvs                     | numero_sequencial               | integer                     | NO          | nextval('lvs_numero_sequencial_seq'::regclass)               |
| lvs                     | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lvs                     | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| lvs                     | inspetor_secundario_matricula   | text                        | YES         | null                                                         |
| lvs                     | auth_user_id                    | uuid                        | YES         | null                                                         |
| metas                   | id                              | uuid                        | NO          | gen_random_uuid()                                            |
| metas                   | tipo_meta                       | character varying           | NO          | null                                                         |
| metas                   | categoria                       | character varying           | YES         | null                                                         |
| metas                   | periodo                         | character varying           | NO          | null                                                         |
| metas                   | ano                             | integer                     | NO          | null                                                         |
| metas                   | mes                             | integer                     | YES         | null                                                         |
| metas                   | semana                          | integer                     | YES         | null                                                         |
| metas                   | dia                             | integer                     | YES         | null                                                         |
| metas                   | meta_quantidade                 | integer                     | NO          | null                                                         |
| metas                   | meta_percentual                 | numeric                     | YES         | null                                                         |
| metas                   | descricao                       | text                        | YES         | null                                                         |
| metas                   | ativa                           | boolean                     | YES         | true                                                         |
| metas                   | criada_por                      | uuid                        | YES         | null                                                         |
| metas                   | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| metas                   | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| metas                   | escopo                          | character varying           | YES         | 'equipe'::character varying                                  |
| metas                   | auth_user_id                    | uuid                        | YES         | null                                                         |
| metas_atribuicoes       | id                              | uuid                        | NO          | gen_random_uuid()                                            |
| metas_atribuicoes       | meta_id                         | uuid                        | YES         | null                                                         |
| metas_atribuicoes       | tma_id                          | uuid                        | YES         | null                                                         |
| metas_atribuicoes       | meta_quantidade_individual      | integer                     | YES         | null                                                         |
| metas_atribuicoes       | responsavel                     | boolean                     | YES         | true                                                         |
| metas_atribuicoes       | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| metas_atribuicoes       | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| metas_atribuicoes       | auth_user_id                    | uuid                        | YES         | null                                                         |
| perfis                  | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| perfis                  | nome                            | text                        | NO          | null                                                         |
| perfis                  | descricao                       | text                        | YES         | null                                                         |
| perfis                  | permissoes                      | jsonb                       | YES         | '{}'::jsonb                                                  |
| perfis                  | ativo                           | boolean                     | YES         | true                                                         |
| perfis                  | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| perfis                  | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| perguntas_lv            | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| perguntas_lv            | codigo                          | text                        | NO          | null                                                         |
| perguntas_lv            | pergunta                        | text                        | NO          | null                                                         |
| perguntas_lv            | categoria_id                    | uuid                        | NO          | null                                                         |
| perguntas_lv            | versao_id                       | uuid                        | NO          | null                                                         |
| perguntas_lv            | ordem                           | integer                     | YES         | null                                                         |
| perguntas_lv            | obrigatoria                     | boolean                     | YES         | true                                                         |
| perguntas_lv            | ativa                           | boolean                     | YES         | true                                                         |
| perguntas_lv            | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| perguntas_lv            | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| progresso_metas         | id                              | uuid                        | NO          | gen_random_uuid()                                            |
| progresso_metas         | meta_id                         | uuid                        | YES         | null                                                         |
| progresso_metas         | periodo                         | character varying           | NO          | null                                                         |
| progresso_metas         | ano                             | integer                     | NO          | null                                                         |
| progresso_metas         | mes                             | integer                     | YES         | null                                                         |
| progresso_metas         | semana                          | integer                     | YES         | null                                                         |
| progresso_metas         | dia                             | integer                     | YES         | null                                                         |
| progresso_metas         | quantidade_atual                | integer                     | YES         | 0                                                            |
| progresso_metas         | percentual_atual                | numeric                     | YES         | 0                                                            |
| progresso_metas         | percentual_alcancado            | numeric                     | YES         | 0                                                            |
| progresso_metas         | status                          | character varying           | YES         | 'em_andamento'::character varying                            |
| progresso_metas         | ultima_atualizacao              | timestamp with time zone    | YES         | now()                                                        |
| progresso_metas         | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| progresso_metas         | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| progresso_metas         | tma_id                          | uuid                        | YES         | null                                                         |
| progresso_metas         | auth_user_id                    | uuid                        | YES         | null                                                         |
| respostas_inspecao      | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| respostas_inspecao      | inspecao_id                     | uuid                        | NO          | null                                                         |
| respostas_inspecao      | pergunta_id                     | uuid                        | NO          | null                                                         |
| respostas_inspecao      | resposta                        | text                        | NO          | null                                                         |
| respostas_inspecao      | observacao                      | text                        | YES         | null                                                         |
| respostas_inspecao      | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| respostas_inspecao      | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| routine_activity_status | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| routine_activity_status | code                            | character varying           | NO          | null                                                         |
| routine_activity_status | name                            | character varying           | NO          | null                                                         |
| routine_activity_status | description                     | text                        | YES         | null                                                         |
| routine_activity_status | color                           | character varying           | YES         | null                                                         |
| routine_activity_status | icon                            | character varying           | YES         | null                                                         |
| routine_activity_status | is_initial                      | boolean                     | YES         | false                                                        |
| routine_activity_status | is_final                        | boolean                     | YES         | false                                                        |
| routine_activity_status | allows_edit                     | boolean                     | YES         | true                                                         |
| routine_activity_status | allows_photos                   | boolean                     | YES         | true                                                         |
| routine_activity_status | requires_completion_date        | boolean                     | YES         | false                                                        |
| routine_activity_status | active                          | boolean                     | YES         | true                                                         |
| routine_activity_status | display_order                   | integer                     | YES         | 0                                                            |
| routine_activity_status | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| routine_activity_status | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| severity_levels         | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| severity_levels         | code                            | character varying           | NO          | null                                                         |
| severity_levels         | name                            | character varying           | NO          | null                                                         |
| severity_levels         | description                     | text                        | YES         | null                                                         |
| severity_levels         | color                           | character varying           | YES         | null                                                         |
| severity_levels         | icon                            | character varying           | YES         | null                                                         |
| severity_levels         | priority                        | integer                     | YES         | null                                                         |
| severity_levels         | requires_immediate_action       | boolean                     | YES         | false                                                        |
| severity_levels         | sla_hours                       | integer                     | YES         | null                                                         |
| severity_levels         | active                          | boolean                     | YES         | true                                                         |
| severity_levels         | display_order                   | integer                     | YES         | 0                                                            |
| severity_levels         | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| severity_levels         | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| storage_logs            | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| storage_logs            | bucket_id                       | text                        | NO          | null                                                         |
| storage_logs            | object_name                     | text                        | NO          | null                                                         |
| storage_logs            | action                          | text                        | NO          | null                                                         |
| storage_logs            | user_id                         | uuid                        | YES         | null                                                         |
| storage_logs            | metadata                        | jsonb                       | YES         | null                                                         |
| storage_logs            | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| term_status             | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| term_status             | code                            | character varying           | NO          | null                                                         |
| term_status             | name                            | character varying           | NO          | null                                                         |
| term_status             | description                     | text                        | YES         | null                                                         |
| term_status             | color                           | character varying           | YES         | null                                                         |
| term_status             | icon                            | character varying           | YES         | null                                                         |
| term_status             | is_initial                      | boolean                     | YES         | false                                                        |
| term_status             | is_final                        | boolean                     | YES         | false                                                        |
| term_status             | allows_edit                     | boolean                     | YES         | true                                                         |
| term_status             | requires_approval               | boolean                     | YES         | false                                                        |
| term_status             | display_order                   | integer                     | YES         | 0                                                            |
| term_status             | active                          | boolean                     | YES         | true                                                         |
| term_status             | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| term_status             | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| term_status_transitions | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| term_status_transitions | from_status_id                  | uuid                        | YES         | null                                                         |
| term_status_transitions | to_status_id                    | uuid                        | YES         | null                                                         |
| term_status_transitions | requires_role                   | character varying           | YES         | null                                                         |
| term_status_transitions | requires_comment                | boolean                     | YES         | false                                                        |
| term_status_transitions | active                          | boolean                     | YES         | true                                                         |
| term_status_transitions | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| term_types              | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| term_types              | code                            | character varying           | NO          | null                                                         |
| term_types              | prefix                          | character varying           | NO          | null                                                         |
| term_types              | name                            | character varying           | NO          | null                                                         |
| term_types              | description                     | text                        | YES         | null                                                         |
| term_types              | color                           | character varying           | YES         | null                                                         |
| term_types              | icon                            | character varying           | YES         | null                                                         |
| term_types              | requires_signature              | boolean                     | YES         | true                                                         |
| term_types              | requires_action_plan            | boolean                     | YES         | true                                                         |
| term_types              | active                          | boolean                     | YES         | true                                                         |
| term_types              | display_order                   | integer                     | YES         | 0                                                            |
| term_types              | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| term_types              | updated_at                      | timestamp with time zone    | YES         | now()                                                        |
| termos_ambientais       | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| termos_ambientais       | numero_sequencial               | integer                     | NO          | nextval('termos_ambientais_numero_sequencial_seq'::regclass) |
| termos_ambientais       | data_termo                      | date                        | NO          | CURRENT_DATE                                                 |
| termos_ambientais       | hora_termo                      | time without time zone      | NO          | CURRENT_TIME                                                 |
| termos_ambientais       | local_atividade                 | text                        | NO          | null                                                         |
| termos_ambientais       | projeto_ba                      | character varying           | YES         | null                                                         |
| termos_ambientais       | fase_etapa_obra                 | text                        | YES         | null                                                         |
| termos_ambientais       | emitido_por_nome                | character varying           | NO          | null                                                         |
| termos_ambientais       | emitido_por_gerencia            | character varying           | YES         | null                                                         |
| termos_ambientais       | emitido_por_empresa             | character varying           | YES         | null                                                         |
| termos_ambientais       | emitido_por_usuario_id          | uuid                        | YES         | null                                                         |
| termos_ambientais       | destinatario_nome               | character varying           | NO          | null                                                         |
| termos_ambientais       | destinatario_gerencia           | character varying           | YES         | null                                                         |
| termos_ambientais       | destinatario_empresa            | character varying           | YES         | null                                                         |
| termos_ambientais       | area_equipamento_atividade      | text                        | NO          | null                                                         |
| termos_ambientais       | equipe                          | character varying           | YES         | null                                                         |
| termos_ambientais       | atividade_especifica            | text                        | YES         | null                                                         |
| termos_ambientais       | tipo_termo                      | character varying           | NO          | null                                                         |
| termos_ambientais       | natureza_desvio                 | character varying           | NO          | null                                                         |
| termos_ambientais       | descricao_nc_1                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_1                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_2                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_2                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_3                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_3                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_4                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_4                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_5                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_5                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_6                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_6                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_7                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_7                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_8                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_8                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_9                  | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_9                 | character varying           | YES         | null                                                         |
| termos_ambientais       | descricao_nc_10                 | text                        | YES         | null                                                         |
| termos_ambientais       | severidade_nc_10                | character varying           | YES         | null                                                         |
| termos_ambientais       | lista_verificacao_aplicada      | text                        | YES         | null                                                         |
| termos_ambientais       | tst_tma_responsavel             | character varying           | YES         | null                                                         |
| termos_ambientais       | acao_correcao_1                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_1                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_2                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_2                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_3                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_3                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_4                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_4                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_5                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_5                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_6                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_6                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_7                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_7                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_8                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_8                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_9                 | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_9                    | date                        | YES         | null                                                         |
| termos_ambientais       | acao_correcao_10                | text                        | YES         | null                                                         |
| termos_ambientais       | prazo_acao_10                   | date                        | YES         | null                                                         |
| termos_ambientais       | assinatura_responsavel_area     | boolean                     | YES         | false                                                        |
| termos_ambientais       | data_assinatura_responsavel     | timestamp without time zone | YES         | null                                                         |
| termos_ambientais       | assinatura_emitente             | boolean                     | YES         | true                                                         |
| termos_ambientais       | data_assinatura_emitente        | timestamp without time zone | YES         | CURRENT_TIMESTAMP                                            |
| termos_ambientais       | providencias_tomadas            | text                        | YES         | null                                                         |
| termos_ambientais       | observacoes                     | text                        | YES         | null                                                         |
| termos_ambientais       | liberacao_nome                  | character varying           | YES         | null                                                         |
| termos_ambientais       | liberacao_empresa               | character varying           | YES         | null                                                         |
| termos_ambientais       | liberacao_gerencia              | character varying           | YES         | null                                                         |
| termos_ambientais       | liberacao_data                  | date                        | YES         | null                                                         |
| termos_ambientais       | liberacao_horario               | time without time zone      | YES         | null                                                         |
| termos_ambientais       | liberacao_assinatura_carimbo    | boolean                     | YES         | false                                                        |
| termos_ambientais       | data_liberacao                  | timestamp without time zone | YES         | null                                                         |
| termos_ambientais       | status                          | character varying           | YES         | 'PENDENTE'::character varying                                |
| termos_ambientais       | latitude                        | numeric                     | YES         | null                                                         |
| termos_ambientais       | longitude                       | numeric                     | YES         | null                                                         |
| termos_ambientais       | precisao_gps                    | numeric                     | YES         | null                                                         |
| termos_ambientais       | endereco_gps                    | text                        | YES         | null                                                         |
| termos_ambientais       | sincronizado                    | boolean                     | YES         | true                                                         |
| termos_ambientais       | offline                         | boolean                     | YES         | false                                                        |
| termos_ambientais       | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| termos_ambientais       | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| termos_ambientais       | numero_termo                    | character varying           | YES         | null                                                         |
| termos_ambientais       | assinatura_responsavel_area_img | text                        | YES         | null                                                         |
| termos_ambientais       | assinatura_emitente_img         | text                        | YES         | null                                                         |
| termos_ambientais       | auth_user_id                    | uuid                        | YES         | null                                                         |
| termos_fotos            | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| termos_fotos            | termo_id                        | uuid                        | NO          | null                                                         |
| termos_fotos            | nome_arquivo                    | character varying           | NO          | null                                                         |
| termos_fotos            | url_arquivo                     | text                        | NO          | null                                                         |
| termos_fotos            | tamanho_bytes                   | integer                     | YES         | null                                                         |
| termos_fotos            | tipo_mime                       | character varying           | YES         | null                                                         |
| termos_fotos            | categoria                       | character varying           | YES         | null                                                         |
| termos_fotos            | descricao                       | text                        | YES         | null                                                         |
| termos_fotos            | latitude                        | numeric                     | YES         | null                                                         |
| termos_fotos            | longitude                       | numeric                     | YES         | null                                                         |
| termos_fotos            | precisao_gps                    | numeric                     | YES         | null                                                         |
| termos_fotos            | endereco                        | text                        | YES         | null                                                         |
| termos_fotos            | timestamp_captura               | timestamp without time zone | YES         | null                                                         |
| termos_fotos            | offline                         | boolean                     | YES         | false                                                        |
| termos_fotos            | sincronizado                    | boolean                     | YES         | true                                                         |
| termos_fotos            | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| termos_historico        | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| termos_historico        | termo_id                        | uuid                        | NO          | null                                                         |
| termos_historico        | tipo_acao                       | character varying           | NO          | null                                                         |
| termos_historico        | descricao                       | text                        | NO          | null                                                         |
| termos_historico        | data_acao                       | timestamp without time zone | YES         | CURRENT_TIMESTAMP                                            |
| termos_historico        | usuario_id                      | uuid                        | YES         | null                                                         |
| termos_historico        | usuario_nome                    | character varying           | YES         | null                                                         |
| termos_historico        | observacoes                     | text                        | YES         | null                                                         |
| termos_historico        | dados_alterados                 | jsonb                       | YES         | null                                                         |
| termos_historico        | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| usuarios                | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| usuarios                | nome                            | text                        | NO          | null                                                         |
| usuarios                | email                           | text                        | NO          | null                                                         |
| usuarios                | senha                           | text                        | NO          | null                                                         |
| usuarios                | matricula                       | text                        | YES         | null                                                         |
| usuarios                | telefone                        | text                        | YES         | null                                                         |
| usuarios                | perfil_id                       | uuid                        | NO          | null                                                         |
| usuarios                | empresa_id                      | uuid                        | YES         | null                                                         |
| usuarios                | ativo                           | boolean                     | YES         | true                                                         |
| usuarios                | ultimo_login                    | timestamp with time zone    | YES         | null                                                         |
| usuarios                | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| usuarios                | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| usuarios                | auth_user_id                    | uuid                        | YES         | null                                                         |
| versoes_lv              | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| versoes_lv              | nome                            | text                        | NO          | null                                                         |
| versoes_lv              | descricao                       | text                        | YES         | null                                                         |
| versoes_lv              | data_revisao                    | date                        | YES         | null                                                         |
| versoes_lv              | ativa                           | boolean                     | YES         | true                                                         |
| versoes_lv              | created_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| versoes_lv              | updated_at                      | timestamp with time zone    | YES         | CURRENT_TIMESTAMP                                            |
| waste_classifications   | id                              | uuid                        | NO          | uuid_generate_v4()                                           |
| waste_classifications   | code                            | character varying           | NO          | null                                                         |
| waste_classifications   | name                            | character varying           | NO          | null                                                         |
| waste_classifications   | description                     | text                        | YES         | null                                                         |
| waste_classifications   | regulatory_reference            | character varying           | YES         | null                                                         |
| waste_classifications   | color                           | character varying           | YES         | null                                                         |
| waste_classifications   | icon                            | character varying           | YES         | null                                                         |
| waste_classifications   | requires_special_handling       | boolean                     | YES         | false                                                        |
| waste_classifications   | requires_manifest               | boolean                     | YES         | false                                                        |
| waste_classifications   | disposal_restrictions           | text                        | YES         | null                                                         |
| waste_classifications   | active                          | boolean                     | YES         | true                                                         |
| waste_classifications   | display_order                   | integer                     | YES         | 0                                                            |
| waste_classifications   | created_at                      | timestamp with time zone    | YES         | now()                                                        |
| waste_classifications   | updated_at                      | timestamp with time zone    | YES         | now()                                                        |


----



create table public.areas (
  id uuid not null default extensions.uuid_generate_v4 (),
  nome text not null,
  descricao text null,
  localizacao text null,
  ativa boolean null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint areas_pkey primary key (id)
) TABLESPACE pg_default;


--

create table public.atividades_rotina (
  id uuid not null default extensions.uuid_generate_v4 (),
  data_atividade date not null,
  hora_inicio time without time zone null,
  hora_fim time without time zone null,
  area_id uuid not null,
  atividade text not null,
  descricao text null,
  km_percorrido numeric(10, 2) null,
  tma_responsavel_id uuid not null,
  encarregado_id uuid not null,
  empresa_contratada_id uuid null,
  status text null default 'Planejada'::text,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  auth_user_id uuid null,
  emitido_por_usuario_id uuid null,
  constraint atividades_rotina_pkey primary key (id),
  constraint atividades_rotina_area_id_fkey foreign KEY (area_id) references areas (id),
  constraint atividades_rotina_empresa_contratada_id_fkey foreign KEY (empresa_contratada_id) references empresas_contratadas (id),
  constraint atividades_rotina_encarregado_id_fkey foreign KEY (encarregado_id) references encarregados (id),
  constraint atividades_rotina_status_check check (
    (
      status = any (
        array[
          'Planejada'::text,
          'Em Execução'::text,
          'Concluída'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_atividades_data on public.atividades_rotina using btree (data_atividade) TABLESPACE pg_default;

create index IF not exists idx_atividades_area on public.atividades_rotina using btree (area_id) TABLESPACE pg_default;

create index IF not exists idx_atividades_tma on public.atividades_rotina using btree (tma_responsavel_id) TABLESPACE pg_default;

create index IF not exists idx_atividades_rotina_coordinates on public.atividades_rotina using btree (latitude, longitude) TABLESPACE pg_default;

--

create table public.categorias_lv (
  id uuid not null default extensions.uuid_generate_v4 (),
  codigo text not null,
  nome text not null,
  descricao text null,
  ativa boolean null default true,
  ordem integer null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint categorias_lv_pkey primary key (id),
  constraint categorias_lv_codigo_key unique (codigo)
) TABLESPACE pg_default;

--

create table public.configuracoes_metas (
  id uuid not null default gen_random_uuid (),
  chave character varying(100) not null,
  valor text not null,
  descricao text null,
  tipo character varying(50) null default 'string'::character varying,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint configuracoes_metas_pkey primary key (id),
  constraint configuracoes_metas_chave_key unique (chave),
  constraint configuracoes_metas_tipo_check check (
    (
      (tipo)::text = any (
        (
          array[
            'string'::character varying,
            'number'::character varying,
            'boolean'::character varying,
            'json'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

--

create table public.deviation_nature (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(50) not null,
  name character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  requires_investigation boolean null default false,
  requires_root_cause_analysis boolean null default false,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint deviation_nature_pkey primary key (id),
  constraint deviation_nature_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_deviation_nature_code on public.deviation_nature using btree (code) TABLESPACE pg_default;

create trigger update_deviation_nature_updated_at BEFORE
update on deviation_nature for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.empresas_contratadas (
  id uuid not null default extensions.uuid_generate_v4 (),
  nome text not null,
  cnpj text null,
  contato text null,
  telefone text null,
  email text null,
  ativa boolean null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint empresas_contratadas_pkey primary key (id),
  constraint empresas_contratadas_cnpj_key unique (cnpj)
) TABLESPACE pg_default;

--

create table public.encarregados (
  id uuid not null default gen_random_uuid (),
  nome_completo text not null,
  apelido text null,
  telefone text null,
  empresa_contratada_id uuid null,
  ativo boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint encarregados_pkey primary key (id),
  constraint encarregados_empresa_contratada_id_fkey foreign KEY (empresa_contratada_id) references empresas_contratadas (id)
) TABLESPACE pg_default;

create index IF not exists idx_encarregados_ativo on public.encarregados using btree (ativo) TABLESPACE pg_default;

create index IF not exists idx_encarregados_nome on public.encarregados using btree (nome_completo) TABLESPACE pg_default;

create index IF not exists idx_encarregados_empresa on public.encarregados using btree (empresa_contratada_id) TABLESPACE pg_default;

create trigger trigger_update_encarregados_updated_at BEFORE
update on encarregados for EACH row
execute FUNCTION update_encarregados_updated_at ();

--

create table public.fotos_inspecao (
  id uuid not null default extensions.uuid_generate_v4 (),
  inspecao_id uuid not null,
  pergunta_id uuid null,
  nome_arquivo text not null,
  url_arquivo text not null,
  descricao text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint fotos_inspecao_pkey primary key (id),
  constraint fotos_inspecao_inspecao_id_fkey foreign KEY (inspecao_id) references inspecoes (id) on delete CASCADE,
  constraint fotos_inspecao_pergunta_id_fkey foreign KEY (pergunta_id) references perguntas_lv (id)
) TABLESPACE pg_default;

--

create table public.fotos_rotina (
  id uuid not null default extensions.uuid_generate_v4 (),
  atividade_id uuid not null,
  nome_arquivo text not null,
  url_arquivo text not null,
  descricao text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  constraint fotos_rotina_pkey primary key (id),
  constraint fotos_rotina_atividade_id_fkey foreign KEY (atividade_id) references atividades_rotina (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_fotos_rotina_coordinates on public.fotos_rotina using btree (latitude, longitude) TABLESPACE pg_default;

--

create table public.inspecoes (
  id uuid not null default extensions.uuid_generate_v4 (),
  data_inspecao date not null,
  area_id uuid not null,
  categoria_id uuid not null,
  versao_id uuid not null,
  responsavel_id uuid not null,
  tma_contratada_id uuid null,
  status text null default 'Pendente'::text,
  observacoes_gerais text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint inspecoes_pkey primary key (id),
  constraint inspecoes_area_id_fkey foreign KEY (area_id) references areas (id),
  constraint inspecoes_categoria_id_fkey foreign KEY (categoria_id) references categorias_lv (id),
  constraint inspecoes_tma_contratada_id_fkey foreign KEY (tma_contratada_id) references empresas_contratadas (id),
  constraint inspecoes_versao_id_fkey foreign KEY (versao_id) references versoes_lv (id),
  constraint inspecoes_status_check check (
    (
      status = any (
        array[
          'Pendente'::text,
          'Em Andamento'::text,
          'Concluída'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_inspecoes_data on public.inspecoes using btree (data_inspecao) TABLESPACE pg_default;

create index IF not exists idx_inspecoes_area on public.inspecoes using btree (area_id) TABLESPACE pg_default;

create index IF not exists idx_inspecoes_responsavel on public.inspecoes using btree (responsavel_id) TABLESPACE pg_default;

create index IF not exists idx_inspecoes_status on public.inspecoes using btree (status) TABLESPACE pg_default;

--

create table public.lv_avaliacoes (
  id uuid not null default extensions.uuid_generate_v4 (),
  lv_id uuid not null,
  tipo_lv text not null,
  item_codigo text not null,
  item_pergunta text not null,
  avaliacao text not null,
  observacao text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  item_id uuid not null,
  constraint lv_avaliacoes_pkey primary key (id),
  constraint lv_avaliacoes_lv_item_unique unique (lv_id, item_id),
  constraint lv_avaliacoes_item_id_fkey foreign KEY (item_id) references perguntas_lv (id) on delete RESTRICT,
  constraint lv_avaliacoes_lv_id_fkey foreign KEY (lv_id) references lvs (id) on delete CASCADE,
  constraint lv_avaliacoes_avaliacao_check check (
    (
      avaliacao = any (
        array[
          'C'::text,
          'NC'::text,
          'NA'::text,
          'conforme'::text,
          'nao_conforme'::text,
          'nao_aplicavel'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_lv_avaliacoes_lv_id on public.lv_avaliacoes using btree (lv_id) TABLESPACE pg_default;

create index IF not exists idx_lv_avaliacoes_tipo_lv on public.lv_avaliacoes using btree (tipo_lv) TABLESPACE pg_default;

create index IF not exists idx_lv_avaliacoes_avaliacao on public.lv_avaliacoes using btree (avaliacao) TABLESPACE pg_default;

create index IF not exists idx_lv_avaliacoes_item_id on public.lv_avaliacoes using btree (item_id) TABLESPACE pg_default;

--

create table public.lv_configuracoes (
  id uuid not null default extensions.uuid_generate_v4 (),
  tipo_lv text not null,
  nome_lv text not null,
  nome_completo text not null,
  revisao text null,
  data_revisao date null,
  ativa boolean not null default true,
  bucket_fotos text not null default 'fotos-lvs'::text,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint lv_configuracoes_pkey primary key (id),
  constraint lv_configuracoes_tipo_lv_key unique (tipo_lv)
) TABLESPACE pg_default;

--

create table public.lv_criticality_levels (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(50) not null,
  name character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  priority integer null,
  requires_immediate_action boolean null default false,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint lv_criticality_levels_pkey primary key (id),
  constraint lv_criticality_levels_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_lv_criticality_levels_code on public.lv_criticality_levels using btree (code) TABLESPACE pg_default;

create trigger update_lv_criticality_levels_updated_at BEFORE
update on lv_criticality_levels for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.lv_evaluation_options (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(10) not null,
  label character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  affects_compliance boolean null default true,
  weight numeric(3, 2) null default 1.0,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint lv_evaluation_options_pkey primary key (id),
  constraint lv_evaluation_options_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_lv_evaluation_options_code on public.lv_evaluation_options using btree (code) TABLESPACE pg_default;

create trigger update_lv_evaluation_options_updated_at BEFORE
update on lv_evaluation_options for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.lv_fotos (
  id uuid not null default extensions.uuid_generate_v4 (),
  lv_id uuid not null,
  tipo_lv text not null,
  nome_arquivo text not null,
  url_arquivo text not null,
  descricao text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  item_id uuid not null,
  constraint lv_fotos_pkey primary key (id),
  constraint lv_fotos_item_id_fkey foreign KEY (item_id) references perguntas_lv (id) on delete RESTRICT,
  constraint lv_fotos_lv_id_fkey foreign KEY (lv_id) references lvs (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_lv_fotos_lv_id on public.lv_fotos using btree (lv_id) TABLESPACE pg_default;

create index IF not exists idx_lv_fotos_tipo_lv on public.lv_fotos using btree (tipo_lv) TABLESPACE pg_default;

create index IF not exists idx_lv_fotos_coordinates on public.lv_fotos using btree (latitude, longitude) TABLESPACE pg_default;

create index IF not exists idx_lv_fotos_item_id on public.lv_fotos using btree (item_id) TABLESPACE pg_default;

--

create table public.lv_inspection_types (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(50) not null,
  name character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  requires_checklist boolean null default true,
  requires_report boolean null default false,
  frequency_days integer null,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint lv_inspection_types_pkey primary key (id),
  constraint lv_inspection_types_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_lv_inspection_types_code on public.lv_inspection_types using btree (code) TABLESPACE pg_default;

create trigger update_lv_inspection_types_updated_at BEFORE
update on lv_inspection_types for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.lv_residuos (
  id uuid not null default extensions.uuid_generate_v4 (),
  lv_tipo text not null default '01'::text,
  lv_nome text not null default 'Resíduos'::text,
  usuario_id uuid not null,
  usuario_nome text not null,
  usuario_matricula text null,
  data_preenchimento timestamp with time zone not null default CURRENT_TIMESTAMP,
  area text not null,
  responsavel_area text null,
  inspetor_principal text not null,
  inspetor_secundario text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  gps_precisao numeric(10, 2) null,
  endereco_gps text null,
  observacoes text null,
  total_fotos integer null default 0,
  total_conformes integer null default 0,
  total_nao_conformes integer null default 0,
  total_nao_aplicaveis integer null default 0,
  percentual_conformidade numeric(5, 2) null default 0,
  status text not null default 'concluido'::text,
  sincronizado boolean not null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  tipo_lv text not null default '01'::text,
  usuario_email text not null default ''::text,
  data_inspecao date not null default CURRENT_DATE,
  responsavel_tecnico text not null default ''::text,
  responsavel_empresa text not null default ''::text,
  gps_latitude numeric(10, 8) null,
  gps_longitude numeric(11, 8) null,
  observacoes_gerais text null,
  numero_sequencial serial not null,
  inspetor_secundario_matricula text null,
  auth_user_id uuid null,
  constraint lv_residuos_pkey primary key (id),
  constraint lv_residuos_status_check check (
    (
      status = any (
        array[
          'concluido'::text,
          'rascunho'::text,
          'concluida'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_data on public.lv_residuos using btree (data_preenchimento) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_usuario on public.lv_residuos using btree (usuario_id) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_area on public.lv_residuos using btree (area) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_status on public.lv_residuos using btree (status) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_coordinates on public.lv_residuos using btree (latitude, longitude) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_data_inspecao on public.lv_residuos using btree (data_inspecao) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_usuario_email on public.lv_residuos using btree (usuario_email) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_gps_coordinates on public.lv_residuos using btree (gps_latitude, gps_longitude) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_responsavel_tecnico on public.lv_residuos using btree (responsavel_tecnico) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_tipo_lv on public.lv_residuos using btree (tipo_lv) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_numero_sequencial on public.lv_residuos using btree (numero_sequencial) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_inspetor_secundario_matricula on public.lv_residuos using btree (inspetor_secundario_matricula) TABLESPACE pg_default;

--

create table public.lv_residuos_avaliacoes (
  id uuid not null default extensions.uuid_generate_v4 (),
  lv_residuos_id uuid not null,
  item_id integer not null,
  item_codigo text not null,
  item_pergunta text not null,
  avaliacao text not null,
  observacao text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint lv_residuos_avaliacoes_pkey primary key (id),
  constraint lv_residuos_avaliacoes_lv_item_unique unique (lv_residuos_id, item_id),
  constraint lv_residuos_avaliacoes_lv_id_fkey foreign KEY (lv_residuos_id) references lv_residuos (id) on delete CASCADE,
  constraint lv_residuos_avaliacoes_avaliacao_check check (
    (
      avaliacao = any (
        array[
          'C'::text,
          'NC'::text,
          'NA'::text,
          'conforme'::text,
          'nao_conforme'::text,
          'nao_aplicavel'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_avaliacoes_lv_id on public.lv_residuos_avaliacoes using btree (lv_residuos_id) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_avaliacoes_item on public.lv_residuos_avaliacoes using btree (item_id) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_avaliacoes_avaliacao on public.lv_residuos_avaliacoes using btree (avaliacao) TABLESPACE pg_default;

--

create table public.lv_residuos_fotos (
  id uuid not null default extensions.uuid_generate_v4 (),
  lv_residuos_id uuid not null,
  item_id integer not null,
  nome_arquivo text not null,
  url_arquivo text not null,
  descricao text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint lv_residuos_fotos_pkey primary key (id),
  constraint lv_residuos_fotos_lv_id_fkey foreign KEY (lv_residuos_id) references lv_residuos (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_fotos_lv_id on public.lv_residuos_fotos using btree (lv_residuos_id) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_fotos_item on public.lv_residuos_fotos using btree (item_id) TABLESPACE pg_default;

create index IF not exists idx_lv_residuos_fotos_coordinates on public.lv_residuos_fotos using btree (latitude, longitude) TABLESPACE pg_default;

--

create table public.lv_validation_rules (
  id uuid not null default extensions.uuid_generate_v4 (),
  rule_type character varying(50) not null,
  entity_type character varying(50) null,
  threshold_value numeric(10, 2) null,
  error_message text not null,
  warning_message text null,
  is_blocking boolean null default true,
  active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint lv_validation_rules_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_lv_validation_rules_type on public.lv_validation_rules using btree (rule_type) TABLESPACE pg_default;

create index IF not exists idx_lv_validation_rules_entity on public.lv_validation_rules using btree (entity_type) TABLESPACE pg_default;

--

create table public.lvs (
  id uuid not null default extensions.uuid_generate_v4 (),
  tipo_lv text not null,
  nome_lv text not null,
  usuario_id uuid not null,
  usuario_nome text not null,
  usuario_matricula text null,
  usuario_email text not null default ''::text,
  data_inspecao date not null default CURRENT_DATE,
  data_preenchimento timestamp with time zone not null default CURRENT_TIMESTAMP,
  area text not null,
  responsavel_area text null,
  responsavel_tecnico text not null default ''::text,
  responsavel_empresa text not null default ''::text,
  inspetor_principal text not null,
  inspetor_secundario text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  gps_precisao numeric(10, 2) null,
  endereco_gps text null,
  observacoes text null,
  observacoes_gerais text null,
  total_fotos integer null default 0,
  total_conformes integer null default 0,
  total_nao_conformes integer null default 0,
  total_nao_aplicaveis integer null default 0,
  percentual_conformidade numeric(5, 2) null default 0,
  status text not null default 'concluido'::text,
  sincronizado boolean not null default true,
  numero_sequencial serial not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  inspetor_secundario_matricula text null,
  auth_user_id uuid null,
  assinatura_inspetor_principal text null,
  data_assinatura_inspetor_principal timestamp with time zone null,
  assinatura_inspetor_secundario text null,
  data_assinatura_inspetor_secundario timestamp with time zone null,
  constraint lvs_pkey primary key (id),
  constraint lvs_status_check check (
    (
      status = any (
        array[
          'concluido'::text,
          'rascunho'::text,
          'concluida'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_lvs_tipo_lv on public.lvs using btree (tipo_lv) TABLESPACE pg_default;

create index IF not exists idx_lvs_usuario_id on public.lvs using btree (usuario_id) TABLESPACE pg_default;

create index IF not exists idx_lvs_data_inspecao on public.lvs using btree (data_inspecao) TABLESPACE pg_default;

create index IF not exists idx_lvs_status on public.lvs using btree (status) TABLESPACE pg_default;

create index IF not exists idx_lvs_coordinates on public.lvs using btree (latitude, longitude) TABLESPACE pg_default;

create index IF not exists idx_lvs_numero_sequencial on public.lvs using btree (numero_sequencial) TABLESPACE pg_default;

create index IF not exists idx_lvs_inspetor_secundario_matricula on public.lvs using btree (inspetor_secundario_matricula) TABLESPACE pg_default;

--

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
  auth_user_id uuid null,
  constraint metas_pkey primary key (id),
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

create trigger update_metas_updated_at BEFORE
update on metas for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.metas_atribuicoes (
  id uuid not null default gen_random_uuid (),
  meta_id uuid null,
  tma_id uuid null,
  meta_quantidade_individual integer null,
  responsavel boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  auth_user_id uuid null,
  constraint metas_atribuicoes_pkey primary key (id),
  constraint metas_atribuicoes_meta_id_tma_id_key unique (meta_id, tma_id),
  constraint metas_atribuicoes_meta_id_fkey foreign KEY (meta_id) references metas (id) on delete CASCADE,
  constraint metas_atribuicoes_tma_id_fkey foreign KEY (tma_id) references usuarios (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_metas_atribuicoes_auth_user_id on public.metas_atribuicoes using btree (auth_user_id) TABLESPACE pg_default;

create index IF not exists idx_metas_atribuicoes_meta on public.metas_atribuicoes using btree (meta_id) TABLESPACE pg_default;

create index IF not exists idx_metas_atribuicoes_tma on public.metas_atribuicoes using btree (tma_id) TABLESPACE pg_default;

create trigger trigger_sync_auth_user_id_metas_atribuicoes BEFORE INSERT
or
update on metas_atribuicoes for EACH row
execute FUNCTION sync_auth_user_id_metas_atribuicoes ();

create trigger update_metas_atribuicoes_updated_at BEFORE
update on metas_atribuicoes for EACH row
execute FUNCTION update_metas_atribuicoes_updated_at ();

--

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
  auth_user_id uuid null,
  constraint progresso_metas_pkey primary key (id),
  constraint progresso_metas_meta_id_periodo_ano_mes_semana_dia_tma_key unique (meta_id, periodo, ano, mes, semana, dia, tma_id),
  constraint progresso_metas_meta_id_fkey foreign KEY (meta_id) references metas (id) on delete CASCADE,
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

create index IF not exists idx_progresso_metas_auth_user_id on public.progresso_metas using btree (auth_user_id) TABLESPACE pg_default;

create index IF not exists idx_progresso_metas_auth_user_meta on public.progresso_metas using btree (auth_user_id, meta_id) TABLESPACE pg_default;

create index IF not exists idx_progresso_metas_periodo on public.progresso_metas using btree (meta_id, periodo, ano, mes, semana, dia) TABLESPACE pg_default;

create index IF not exists idx_progresso_metas_status on public.progresso_metas using btree (status) TABLESPACE pg_default;

create index IF not exists idx_progresso_metas_tma on public.progresso_metas using btree (tma_id) TABLESPACE pg_default;

create trigger trigger_sync_auth_user_id_progresso_metas BEFORE INSERT
or
update on progresso_metas for EACH row
execute FUNCTION sync_auth_user_id_progresso_metas ();

create trigger update_progresso_metas_updated_at BEFORE
update on progresso_metas for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.respostas_inspecao (
  id uuid not null default extensions.uuid_generate_v4 (),
  inspecao_id uuid not null,
  pergunta_id uuid not null,
  resposta text not null,
  observacao text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint respostas_inspecao_pkey primary key (id),
  constraint respostas_inspecao_inspecao_id_pergunta_id_key unique (inspecao_id, pergunta_id),
  constraint respostas_inspecao_inspecao_id_fkey foreign KEY (inspecao_id) references inspecoes (id) on delete CASCADE,
  constraint respostas_inspecao_pergunta_id_fkey foreign KEY (pergunta_id) references perguntas_lv (id),
  constraint respostas_inspecao_resposta_check check (
    (
      resposta = any (array['C'::text, 'NC'::text, 'NA'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_respostas_inspecao on public.respostas_inspecao using btree (inspecao_id) TABLESPACE pg_default;

create index IF not exists idx_respostas_pergunta on public.respostas_inspecao using btree (pergunta_id) TABLESPACE pg_default;

--

create table public.routine_activity_status (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(50) not null,
  name character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  is_initial boolean null default false,
  is_final boolean null default false,
  allows_edit boolean null default true,
  allows_photos boolean null default true,
  requires_completion_date boolean null default false,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint routine_activity_status_pkey primary key (id),
  constraint routine_activity_status_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_routine_activity_status_code on public.routine_activity_status using btree (code) TABLESPACE pg_default;

create trigger update_routine_activity_status_updated_at BEFORE
update on routine_activity_status for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.severity_levels (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(10) not null,
  name character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  priority integer null,
  requires_immediate_action boolean null default false,
  sla_hours integer null,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint severity_levels_pkey primary key (id),
  constraint severity_levels_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_severity_levels_code on public.severity_levels using btree (code) TABLESPACE pg_default;

create index IF not exists idx_severity_levels_priority on public.severity_levels using btree (priority desc) TABLESPACE pg_default;

create trigger update_severity_levels_updated_at BEFORE
update on severity_levels for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.storage_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  bucket_id text not null,
  object_name text not null,
  action text not null,
  user_id uuid null,
  metadata jsonb null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint storage_logs_pkey primary key (id),
  constraint storage_logs_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

--

create table public.term_status (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(50) not null,
  name character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  is_initial boolean null default false,
  is_final boolean null default false,
  allows_edit boolean null default true,
  requires_approval boolean null default false,
  display_order integer null default 0,
  active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint term_status_pkey primary key (id),
  constraint term_status_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_term_status_code on public.term_status using btree (code) TABLESPACE pg_default;

create index IF not exists idx_term_status_active on public.term_status using btree (active) TABLESPACE pg_default;

create trigger update_term_status_updated_at BEFORE
update on term_status for EACH row
execute FUNCTION update_updated_at_column ();

--

create table public.term_status_transitions (
  id uuid not null default extensions.uuid_generate_v4 (),
  from_status_id uuid null,
  to_status_id uuid null,
  requires_role character varying(50) null,
  requires_comment boolean null default false,
  active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint term_status_transitions_pkey primary key (id),
  constraint term_status_transitions_from_status_id_to_status_id_key unique (from_status_id, to_status_id),
  constraint term_status_transitions_from_status_id_fkey foreign KEY (from_status_id) references term_status (id) on delete CASCADE,
  constraint term_status_transitions_to_status_id_fkey foreign KEY (to_status_id) references term_status (id) on delete CASCADE
) TABLESPACE pg_default;

--

create table public.term_types (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(50) not null,
  prefix character varying(10) not null,
  name character varying(100) not null,
  description text null,
  color character varying(20) null,
  icon character varying(50) null,
  requires_signature boolean null default true,
  requires_action_plan boolean null default true,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint term_types_pkey primary key (id),
  constraint term_types_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_term_types_code on public.term_types using btree (code) TABLESPACE pg_default;

create index IF not exists idx_term_types_active on public.term_types using btree (active) TABLESPACE pg_default;

create trigger update_term_types_updated_at BEFORE
update on term_types for EACH row
execute FUNCTION update_updated_at_column ();

--

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

create trigger trigger_preencher_emitido_por_usuario_id BEFORE INSERT
or
update on termos_ambientais for EACH row
execute FUNCTION preencher_emitido_por_usuario_id ();

--

create table public.termos_fotos (
  id uuid not null default extensions.uuid_generate_v4 (),
  termo_id uuid not null,
  nome_arquivo character varying(255) not null,
  url_arquivo text not null,
  tamanho_bytes integer null,
  tipo_mime character varying(100) null,
  categoria character varying(100) null,
  descricao text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  precisao_gps numeric(8, 2) null,
  endereco text null,
  timestamp_captura timestamp without time zone null,
  offline boolean null default false,
  sincronizado boolean null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint termos_fotos_pkey primary key (id),
  constraint termos_fotos_termo_id_fkey foreign KEY (termo_id) references termos_ambientais (id) on delete CASCADE
) TABLESPACE pg_default;

--

create table public.termos_historico (
  id uuid not null default extensions.uuid_generate_v4 (),
  termo_id uuid not null,
  tipo_acao character varying(100) not null,
  descricao text not null,
  data_acao timestamp without time zone null default CURRENT_TIMESTAMP,
  usuario_id uuid null,
  usuario_nome character varying(255) null,
  observacoes text null,
  dados_alterados jsonb null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint termos_historico_pkey primary key (id),
  constraint termos_historico_termo_id_fkey foreign KEY (termo_id) references termos_ambientais (id) on delete CASCADE
) TABLESPACE pg_default;

--

create table public.usuarios (
  id uuid not null default extensions.uuid_generate_v4 (),
  nome text not null,
  email text not null,
  senha text not null,
  matricula text null,
  telefone text null,
  perfil_id uuid not null,
  empresa_id uuid null,
  ativo boolean null default true,
  ultimo_login timestamp with time zone null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  auth_user_id uuid null,
  constraint usuarios_pkey primary key (id),
  constraint usuarios_matricula_key unique (matricula),
  constraint usuarios_email_key unique (email),
  constraint usuarios_auth_user_id_unique unique (auth_user_id),
  constraint usuarios_empresa_id_fkey foreign KEY (empresa_id) references empresas_contratadas (id),
  constraint usuarios_auth_user_id_fkey foreign KEY (auth_user_id) references auth.users (id),
  constraint usuarios_perfil_id_fkey foreign KEY (perfil_id) references perfis (id)
) TABLESPACE pg_default;

create index IF not exists idx_usuarios_auth_user_id on public.usuarios using btree (auth_user_id) TABLESPACE pg_default;

create index IF not exists idx_usuarios_email on public.usuarios using btree (email) TABLESPACE pg_default;

create index IF not exists idx_usuarios_matricula on public.usuarios using btree (matricula) TABLESPACE pg_default;

create index IF not exists idx_usuarios_perfil on public.usuarios using btree (perfil_id) TABLESPACE pg_default;

create index IF not exists idx_usuarios_ativo on public.usuarios using btree (ativo) TABLESPACE pg_default;

--

create table public.versoes_lv (
  id uuid not null default extensions.uuid_generate_v4 (),
  nome text not null,
  descricao text null,
  data_revisao date null,
  ativa boolean null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint versoes_lv_pkey primary key (id)
) TABLESPACE pg_default;

--

create table public.waste_classifications (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(50) not null,
  name character varying(100) not null,
  description text null,
  regulatory_reference character varying(200) null,
  color character varying(20) null,
  icon character varying(50) null,
  requires_special_handling boolean null default false,
  requires_manifest boolean null default false,
  disposal_restrictions text null,
  active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint waste_classifications_pkey primary key (id),
  constraint waste_classifications_code_key unique (code)
) TABLESPACE pg_default;

create index IF not exists idx_waste_classifications_code on public.waste_classifications using btree (code) TABLESPACE pg_default;

create trigger update_waste_classifications_updated_at BEFORE
update on waste_classifications for EACH row
execute FUNCTION update_updated_at_column ();

--

Buckets:

fotos-lvs

Public
0

50 MB

image/jpeg, image/png, image/webp

View files

--


fotos-termos

Public
5

50 MB

image/jpeg, image/png, image/webp, image/gif

View files


--


fotos-lv-residuos

Public
4

Unset (50 MB)

Any

View files


--


fotos-rotina

Public
4

Unset (50 MB)

Any

View files



-----=====-----

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
  CONSTRAINT atividades_rotina_empresa_contratada_id_fkey FOREIGN KEY (empresa_contratada_id) REFERENCES public.empresas_contratadas(id),
  CONSTRAINT atividades_rotina_encarregado_id_fkey FOREIGN KEY (encarregado_id) REFERENCES public.encarregados(id)
);
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
CREATE TABLE public.deviation_nature (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  requires_investigation boolean DEFAULT false,
  requires_root_cause_analysis boolean DEFAULT false,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deviation_nature_pkey PRIMARY KEY (id)
);
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
CREATE TABLE public.fotos_inspecao (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  inspecao_id uuid NOT NULL,
  pergunta_id uuid,
  nome_arquivo text NOT NULL,
  url_arquivo text NOT NULL,
  descricao text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fotos_inspecao_pkey PRIMARY KEY (id),
  CONSTRAINT fotos_inspecao_inspecao_id_fkey FOREIGN KEY (inspecao_id) REFERENCES public.inspecoes(id),
  CONSTRAINT fotos_inspecao_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES public.perguntas_lv(id)
);
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
  CONSTRAINT inspecoes_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id),
  CONSTRAINT inspecoes_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_lv(id),
  CONSTRAINT inspecoes_versao_id_fkey FOREIGN KEY (versao_id) REFERENCES public.versoes_lv(id),
  CONSTRAINT inspecoes_tma_contratada_id_fkey FOREIGN KEY (tma_contratada_id) REFERENCES public.empresas_contratadas(id)
);
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
CREATE TABLE public.lv_criticality_levels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  priority integer,
  requires_immediate_action boolean DEFAULT false,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lv_criticality_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lv_evaluation_options (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  label character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  affects_compliance boolean DEFAULT true,
  weight numeric DEFAULT 1.0,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lv_evaluation_options_pkey PRIMARY KEY (id)
);
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
CREATE TABLE public.lv_inspection_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  requires_checklist boolean DEFAULT true,
  requires_report boolean DEFAULT false,
  frequency_days integer,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lv_inspection_types_pkey PRIMARY KEY (id)
);
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
  auth_user_id uuid,
  CONSTRAINT lv_residuos_pkey PRIMARY KEY (id)
);
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
CREATE TABLE public.lv_validation_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  rule_type character varying NOT NULL,
  entity_type character varying,
  threshold_value numeric,
  error_message text NOT NULL,
  warning_message text,
  is_blocking boolean DEFAULT true,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lv_validation_rules_pkey PRIMARY KEY (id)
);
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
  auth_user_id uuid,
  CONSTRAINT lvs_pkey PRIMARY KEY (id)
);
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
  auth_user_id uuid,
  CONSTRAINT metas_pkey PRIMARY KEY (id)
);
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
  CONSTRAINT metas_atribuicoes_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.metas(id),
  CONSTRAINT metas_atribuicoes_tma_id_fkey FOREIGN KEY (tma_id) REFERENCES public.usuarios(id)
);
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
  CONSTRAINT perguntas_lv_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_lv(id),
  CONSTRAINT perguntas_lv_versao_id_fkey FOREIGN KEY (versao_id) REFERENCES public.versoes_lv(id)
);
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
CREATE TABLE public.respostas_inspecao (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  inspecao_id uuid NOT NULL,
  pergunta_id uuid NOT NULL,
  resposta text NOT NULL CHECK (resposta = ANY (ARRAY['C'::text, 'NC'::text, 'NA'::text])),
  observacao text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT respostas_inspecao_pkey PRIMARY KEY (id),
  CONSTRAINT respostas_inspecao_inspecao_id_fkey FOREIGN KEY (inspecao_id) REFERENCES public.inspecoes(id),
  CONSTRAINT respostas_inspecao_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES public.perguntas_lv(id)
);
CREATE TABLE public.routine_activity_status (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  is_initial boolean DEFAULT false,
  is_final boolean DEFAULT false,
  allows_edit boolean DEFAULT true,
  allows_photos boolean DEFAULT true,
  requires_completion_date boolean DEFAULT false,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT routine_activity_status_pkey PRIMARY KEY (id)
);
CREATE TABLE public.severity_levels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  priority integer,
  requires_immediate_action boolean DEFAULT false,
  sla_hours integer,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT severity_levels_pkey PRIMARY KEY (id)
);
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
CREATE TABLE public.term_status (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  is_initial boolean DEFAULT false,
  is_final boolean DEFAULT false,
  allows_edit boolean DEFAULT true,
  requires_approval boolean DEFAULT false,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT term_status_pkey PRIMARY KEY (id)
);
CREATE TABLE public.term_status_transitions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  from_status_id uuid,
  to_status_id uuid,
  requires_role character varying,
  requires_comment boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT term_status_transitions_pkey PRIMARY KEY (id),
  CONSTRAINT term_status_transitions_from_status_id_fkey FOREIGN KEY (from_status_id) REFERENCES public.term_status(id),
  CONSTRAINT term_status_transitions_to_status_id_fkey FOREIGN KEY (to_status_id) REFERENCES public.term_status(id)
);
CREATE TABLE public.term_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  prefix character varying NOT NULL,
  name character varying NOT NULL,
  description text,
  color character varying,
  icon character varying,
  requires_signature boolean DEFAULT true,
  requires_action_plan boolean DEFAULT true,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT term_types_pkey PRIMARY KEY (id)
);
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
  CONSTRAINT usuarios_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfis(id),
  CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas_contratadas(id),
  CONSTRAINT usuarios_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
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
CREATE TABLE public.waste_classifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  regulatory_reference character varying,
  color character varying,
  icon character varying,
  requires_special_handling boolean DEFAULT false,
  requires_manifest boolean DEFAULT false,
  disposal_restrictions text,
  active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT waste_classifications_pkey PRIMARY KEY (id)
);