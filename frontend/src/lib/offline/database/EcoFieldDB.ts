// ===================================================================
// ECOFIELD DATABASE - ECOFIELD SYSTEM
// Localização: src/lib/offline/database/EcoFieldDB.ts
// Módulo: Classe principal do banco de dados offline
// ===================================================================

import Dexie, { Table } from 'dexie';

// ✅ Importar interfaces unificadas
import type {
  TermoAmbientalOffline,
  TermoFotoOffline,
  InspecaoOffline,
  RespostaInspecaoOffline,
  FotoInspecaoOffline,
  AtividadeRotinaOffline,
  FotoRotinaOffline,
  EncarregadoOffline
  // ❌ REMOVIDO: LVResiduosOffline, LVResiduosAvaliacaoOffline, LVResiduosFotoOffline
  // ✅ UNIFICAÇÃO: Usar LVOffline, LVAvaliacaoOffline, LVFotoOffline
} from '../../../types/offline';

import { 
  Area, 
  Usuario, 
  EmpresaContratada, 
  CategoriaLV, 
  Perfil, 
  VersaoLV, 
  PerguntaLV
} from '../../../types';
import { LV, LVAvaliacao, LVFoto } from '../../../types/lv';
import type { LVOffline, LVAvaliacaoOffline, LVFotoOffline } from '../../../types/offline';

// ===================================================================
// INTERFACE DA FILA DE SINCRONIZAÇÃO (P1 #2)
// ===================================================================

export interface SyncQueueItem {
  id: string;                                    // UUID do item na fila
  entity_type: 'termo' | 'lv' | 'rotina' | 'inspecao' | 'encarregado'; // Tipo de entidade
  entity_id: string;                             // ID da entidade a sincronizar
  operation: 'create' | 'update' | 'delete';     // Operação a realizar
  priority: number;                              // Prioridade (0=máxima, maior=menor)
  retries: number;                               // Número de tentativas já feitas
  max_retries: number;                           // Máximo de tentativas permitidas
  last_error?: string;                           // Último erro ocorrido
  last_attempt_at?: string;                      // Timestamp da última tentativa
  created_at: string;                            // Timestamp de criação
  scheduled_for?: string;                        // Agendar para timestamp específico
  payload?: any;                                 // Dados adicionais (opcional)
}

// ===================================================================
// CLASSE PRINCIPAL DO BANCO DE DADOS
// ===================================================================

export class EcoFieldDB extends Dexie {
  // Tabelas de configuração e cadastros
  areas!: Table<Area, string>;
  atividades_rotina!: Table<AtividadeRotinaOffline, string>;
  categorias_lv!: Table<CategoriaLV, string>;
  encarregados!: Table<EncarregadoOffline, string>;
  empresas_contratadas!: Table<EmpresaContratada, string>;
  fotos_inspecao!: Table<FotoInspecaoOffline, string>;
  fotos_rotina!: Table<FotoRotinaOffline, string>;
  inspecoes!: Table<InspecaoOffline, string>;
  // ❌ REMOVIDO: lv_residuos, lv_residuos_avaliacoes, lv_residuos_fotos (versão 3+)
  perfis!: Table<Perfil, string>;
  perguntas_lv!: Table<PerguntaLV, string>;
  respostas_inspecao!: Table<RespostaInspecaoOffline, string>;
  usuarios!: Table<Usuario, string>;
  versoes_lv!: Table<VersaoLV, string>;

  // Tabelas para termos ambientais offline
  termos_ambientais!: Table<TermoAmbientalOffline, string>;
  termos_fotos!: Table<TermoFotoOffline, string>;
  inspecoes_lv!: Table<InspecaoOffline, string>;
  respostas_inspecao_lv!: Table<RespostaInspecaoOffline, string>;
  fotos_inspecao_lv!: Table<FotoInspecaoOffline, string>;

  // ✅ Tabelas unificadas para LVs (incluindo resíduos com tipo_lv='residuos')
  lvs!: Table<LVOffline, string>;
  lv_avaliacoes!: Table<LVAvaliacaoOffline, string>;
  lv_fotos!: Table<LVFotoOffline, string>;

  // ✅ P1 #2: Fila de sincronização persistente (versão 4+)
  sync_queue!: Table<SyncQueueItem, string>;

  constructor() {
    super('EcoFieldDB');

    this.version(1).stores({
      areas: 'id, nome, ativa',
      atividades_rotina: 'id, data_atividade, area_id, tma_responsavel_id, encarregado_id, empresa_contratada_id',
      categorias_lv: 'id, codigo, nome, ativa',
      encarregados: 'id, nome_completo, apelido',
      empresas_contratadas: 'id, nome, cnpj, ativa',
      fotos_inspecao: 'id, inspecao_id, pergunta_id',
      fotos_rotina: 'id, atividade_id',
      inspecoes: 'id, data_inspecao, area_id, categoria_id, versao_id, responsavel_id, tma_contratada_id',
      lv_residuos: 'id, usuario_id, area, status, sincronizado, numero_sequencial, statusSync',
      lv_residuos_avaliacoes: 'id, lv_residuos_id, item_id, item_codigo',
      lv_residuos_fotos: 'id, lv_residuos_id, item_id, nome_arquivo',
      perfis: 'id, nome, ativo',
      perguntas_lv: 'id, codigo, categoria_id, versao_id',
      respostas_inspecao: 'id, inspecao_id, pergunta_id',
      usuarios: 'id, nome, email, perfil, ativo',
      versoes_lv: 'id, nome, ativa',
      termos_ambientais: 'id, numero_sequencial, tipo_termo, emitido_por_usuario_id, status, sincronizado, offline',
      termos_fotos: 'id, termo_id, categoria',
      inspecoes_lv: 'id, data_inspecao, area_id, categoria_id, responsavel_id, status, sincronizado, offline',
      respostas_inspecao_lv: 'id, inspecao_id, pergunta_id',
      fotos_inspecao_lv: 'id, inspecao_id, pergunta_id',
      // Tabelas unificadas para LVs
      lvs: 'id, tipo_lv, usuario_id, area, data_inspecao, status, sincronizado',
      lv_avaliacoes: 'id, lv_id, tipo_lv, item_id',
      lv_fotos: 'id, lv_id, tipo_lv, item_id'
    });

    // Versão 2: Adicionar campos faltantes nas tabelas LVs para compatibilidade com online
    this.version(2).stores({
      areas: 'id, nome, ativa',
      atividades_rotina: 'id, data_atividade, area_id, tma_responsavel_id, encarregado_id, empresa_contratada_id',
      categorias_lv: 'id, codigo, nome, ativa',
      encarregados: 'id, nome_completo, apelido',
      empresas_contratadas: 'id, nome, cnpj, ativa',
      fotos_inspecao: 'id, inspecao_id, pergunta_id',
      fotos_rotina: 'id, atividade_id',
      inspecoes: 'id, data_inspecao, area_id, categoria_id, versao_id, responsavel_id, tma_contratada_id',
      lv_residuos: 'id, usuario_id, area, status, sincronizado, numero_sequencial, statusSync',
      lv_residuos_avaliacoes: 'id, lv_residuos_id, item_id, item_codigo',
      lv_residuos_fotos: 'id, lv_residuos_id, item_id, nome_arquivo',
      perfis: 'id, nome, ativo',
      perguntas_lv: 'id, codigo, categoria_id, versao_id',
      respostas_inspecao: 'id, inspecao_id, pergunta_id',
      usuarios: 'id, nome, email, perfil, ativo',
      versoes_lv: 'id, nome, ativa',
      termos_ambientais: 'id, numero_sequencial, tipo_termo, emitido_por_usuario_id, status, sincronizado, offline',
      termos_fotos: 'id, termo_id, categoria',
      inspecoes_lv: 'id, data_inspecao, area_id, categoria_id, responsavel_id, status, sincronizado, offline',
      respostas_inspecao_lv: 'id, inspecao_id, pergunta_id',
      fotos_inspecao_lv: 'id, inspecao_id, pergunta_id',
      // Tabelas unificadas para LVs - ATUALIZADAS com todos os campos
      lvs: 'id, tipo_lv, numero_lv, nome_lv, usuario_id, usuario_nome, usuario_matricula, usuario_email, data_inspecao, data_preenchimento, area, responsavel_area, responsavel_tecnico, responsavel_empresa, inspetor_principal, inspetor_secundario, inspetor_secundario_matricula, status, auth_user_id, sincronizado, offline, created_at, updated_at',
      lv_avaliacoes: 'id, lv_id, tipo_lv, item_id, item_codigo, item_pergunta, avaliacao, observacao, sincronizado, offline, created_at',
      lv_fotos: 'id, lv_id, tipo_lv, item_id, item_codigo, nome_arquivo, url_foto, sincronizado, offline, created_at'
    });

    // ✅ Versão 3: UNIFICAÇÃO DE LVs - Remover tabelas lv_residuos separadas
    this.version(3).stores({
      areas: 'id, nome, ativa',
      atividades_rotina: 'id, data_atividade, area_id, tma_responsavel_id, encarregado_id, empresa_contratada_id',
      categorias_lv: 'id, codigo, nome, ativa',
      encarregados: 'id, nome_completo, apelido',
      empresas_contratadas: 'id, nome, cnpj, ativa',
      fotos_inspecao: 'id, inspecao_id, pergunta_id',
      fotos_rotina: 'id, atividade_id',
      inspecoes: 'id, data_inspecao, area_id, categoria_id, versao_id, responsavel_id, tma_contratada_id',
      // ❌ REMOVIDO: lv_residuos, lv_residuos_avaliacoes, lv_residuos_fotos
      // Agora tudo vai para tabelas unificadas: lvs, lv_avaliacoes, lv_fotos
      perfis: 'id, nome, ativo',
      perguntas_lv: 'id, codigo, categoria_id, versao_id',
      respostas_inspecao: 'id, inspecao_id, pergunta_id',
      usuarios: 'id, nome, email, perfil, ativo',
      versoes_lv: 'id, nome, ativa',
      termos_ambientais: 'id, numero_sequencial, tipo_termo, emitido_por_usuario_id, status, sincronizado, offline',
      termos_fotos: 'id, termo_id, categoria',
      inspecoes_lv: 'id, data_inspecao, area_id, categoria_id, responsavel_id, status, sincronizado, offline',
      respostas_inspecao_lv: 'id, inspecao_id, pergunta_id',
      fotos_inspecao_lv: 'id, inspecao_id, pergunta_id',
      // Tabelas unificadas para TODAS as LVs (incluindo resíduos)
      lvs: 'id, tipo_lv, numero_lv, nome_lv, usuario_id, usuario_nome, usuario_matricula, usuario_email, data_inspecao, data_preenchimento, area, responsavel_area, responsavel_tecnico, responsavel_empresa, inspetor_principal, inspetor_secundario, inspetor_secundario_matricula, status, auth_user_id, sincronizado, offline, created_at, updated_at, numero_sequencial',
      lv_avaliacoes: 'id, lv_id, tipo_lv, item_id, item_codigo, item_pergunta, avaliacao, observacao, sincronizado, offline, created_at',
      lv_fotos: 'id, lv_id, tipo_lv, item_id, item_codigo, nome_arquivo, url_foto, sincronizado, offline, created_at'
    }).upgrade(async tx => {
      // ✅ MIGRAÇÃO AUTOMÁTICA: Mover dados de lv_residuos para lvs
      console.log('🔄 [MIGRATION] Iniciando migração de LVs de resíduos para tabela unificada...');

      try {
        // 1. Migrar LV Resíduos → LVs
        const lvResiduos = await tx.table('lv_residuos').toArray();
        console.log(`📦 [MIGRATION] Encontrados ${lvResiduos.length} LVs de resíduos para migrar`);

        for (const lvResiduo of lvResiduos) {
          const lvUnificada: any = {
            id: lvResiduo.id,
            tipo_lv: 'residuos', // ✅ Identificar como LV de resíduos
            numero_lv: lvResiduo.numero_lv || `RES-${lvResiduo.numero_sequencial}`,
            nome_lv: lvResiduo.nome_lv || 'Lista de Verificação de Resíduos',
            usuario_id: lvResiduo.usuario_id,
            usuario_nome: lvResiduo.usuario_nome,
            usuario_matricula: lvResiduo.usuario_matricula,
            usuario_email: lvResiduo.usuario_email,
            data_inspecao: lvResiduo.data_criacao || lvResiduo.created_at,
            data_preenchimento: lvResiduo.data_preenchimento,
            area: lvResiduo.area,
            responsavel_area: lvResiduo.responsavel_area,
            responsavel_tecnico: lvResiduo.responsavel_tecnico,
            responsavel_empresa: lvResiduo.responsavel_empresa,
            inspetor_principal: lvResiduo.inspetor_principal,
            inspetor_secundario: lvResiduo.inspetor_secundario,
            status: lvResiduo.status,
            auth_user_id: lvResiduo.auth_user_id || lvResiduo.usuario_id,
            sincronizado: lvResiduo.sincronizado,
            offline: lvResiduo.offline ?? true,
            created_at: lvResiduo.created_at,
            updated_at: lvResiduo.updated_at,
            numero_sequencial: lvResiduo.numero_sequencial
          };

          await tx.table('lvs').put(lvUnificada);
        }

        // 2. Migrar LV Resíduos Avaliações → LV Avaliações
        const avaliacoes = await tx.table('lv_residuos_avaliacoes').toArray();
        console.log(`📦 [MIGRATION] Encontradas ${avaliacoes.length} avaliações para migrar`);

        for (const avaliacao of avaliacoes) {
          const avaliacaoUnificada: any = {
            id: avaliacao.id,
            lv_id: avaliacao.lv_residuos_id, // Mapear para lv_id
            tipo_lv: 'residuos',
            item_id: avaliacao.item_id,
            item_codigo: avaliacao.item_codigo,
            item_pergunta: avaliacao.item_pergunta || avaliacao.item_codigo,
            avaliacao: avaliacao.avaliacao,
            observacao: avaliacao.observacao,
            sincronizado: avaliacao.sincronizado,
            offline: avaliacao.offline ?? true,
            created_at: avaliacao.created_at
          };

          await tx.table('lv_avaliacoes').put(avaliacaoUnificada);
        }

        // 3. Migrar LV Resíduos Fotos → LV Fotos
        const fotos = await tx.table('lv_residuos_fotos').toArray();
        console.log(`📦 [MIGRATION] Encontradas ${fotos.length} fotos para migrar`);

        for (const foto of fotos) {
          const fotoUnificada: any = {
            id: foto.id,
            lv_id: foto.lv_residuos_id, // Mapear para lv_id
            tipo_lv: 'residuos',
            item_id: foto.item_id,
            item_codigo: foto.item_codigo,
            nome_arquivo: foto.nome_arquivo,
            url_foto: foto.url_foto || foto.url_arquivo,
            sincronizado: foto.sincronizado,
            offline: foto.offline ?? true,
            created_at: foto.created_at
          };

          await tx.table('lv_fotos').put(fotoUnificada);
        }

        console.log('✅ [MIGRATION] Migração concluída com sucesso!');
        console.log(`   - ${lvResiduos.length} LVs migradas`);
        console.log(`   - ${avaliacoes.length} avaliações migradas`);
        console.log(`   - ${fotos.length} fotos migradas`);

      } catch (error) {
        console.error('❌ [MIGRATION] Erro na migração:', error);
        throw error; // Rollback automático se der erro
      }
    });

    // ===================================================================
    // ✅ Versão 4: P1 #2 - ADICIONAR SYNC QUEUE PERSISTENTE
    // ===================================================================
    this.version(4).stores({
      areas: 'id, nome, ativa',
      atividades_rotina: 'id, data_atividade, area_id, tma_responsavel_id, encarregado_id, empresa_contratada_id',
      categorias_lv: 'id, codigo, nome, ativa',
      encarregados: 'id, nome_completo, apelido',
      empresas_contratadas: 'id, nome, cnpj, ativa',
      fotos_inspecao: 'id, inspecao_id, pergunta_id',
      fotos_rotina: 'id, atividade_id',
      inspecoes: 'id, data_inspecao, area_id, categoria_id, versao_id, responsavel_id, tma_contratada_id',
      perfis: 'id, nome, ativo',
      perguntas_lv: 'id, codigo, categoria_id, versao_id',
      respostas_inspecao: 'id, inspecao_id, pergunta_id',
      usuarios: 'id, nome, email, perfil, ativo',
      versoes_lv: 'id, nome, ativa',
      termos_ambientais: 'id, numero_sequencial, tipo_termo, emitido_por_usuario_id, status, sincronizado, offline',
      termos_fotos: 'id, termo_id, categoria',
      inspecoes_lv: 'id, data_inspecao, area_id, categoria_id, responsavel_id, status, sincronizado, offline',
      respostas_inspecao_lv: 'id, inspecao_id, pergunta_id',
      fotos_inspecao_lv: 'id, inspecao_id, pergunta_id',
      lvs: 'id, tipo_lv, numero_lv, nome_lv, usuario_id, usuario_nome, usuario_matricula, usuario_email, data_inspecao, data_preenchimento, area, responsavel_area, responsavel_tecnico, responsavel_empresa, inspetor_principal, inspetor_secundario, inspetor_secundario_matricula, status, auth_user_id, sincronizado, offline, created_at, updated_at, numero_sequencial',
      lv_avaliacoes: 'id, lv_id, tipo_lv, item_id, item_codigo, item_pergunta, avaliacao, observacao, sincronizado, offline, created_at',
      lv_fotos: 'id, lv_id, tipo_lv, item_id, item_codigo, nome_arquivo, url_foto, sincronizado, offline, created_at',
      // ✅ NOVA TABELA: Fila de sincronização persistente (P1 #2)
      // Índices: priority para ordenação, entity_type+entity_id para deduplicação
      sync_queue: 'id, [entity_type+entity_id], priority, retries, created_at, scheduled_for'
    });
  }

  // Método para verificar se tabelas de metas existem (sempre retorna false)
  async temCacheMetas(): Promise<boolean> {
    return false;
  }

  // Método para limpar cache de metas (não faz nada pois não existem as tabelas)
  async limparCacheMetas(): Promise<void> {
    return;
  }
}

export const offlineDB = new EcoFieldDB();
