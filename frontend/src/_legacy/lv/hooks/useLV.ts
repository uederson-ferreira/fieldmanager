// ===================================================================
// HOOK PRINCIPAL UNIFICADO PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/hooks/useLV.ts
// ===================================================================

import { useState, useCallback, useEffect } from 'react';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { lvAPI } from '../../../lib/lvAPI';
import { generateLVPDF, generateHTMLForm, convertPhotosToBase64 } from '../../../utils/htmlFormGenerator';
import type { HTMLFormData } from '../../../utils/htmlFormGenerator';
// import { getLVConfig } from '../../../types/lv'; // Removido - agora usa API
import type { 
  LVBase, 
  LVFormData, 
  LVConfig, 
  LVState, 
  LVActions,
  LVContainerProps 
} from '../types/lv';
import type { LVAtualizacao, LVCriacao, LV, LVAvaliacao, LVFoto } from '../../../types/lv';
import { LVManager, LVAvaliacaoManager, LVFotoManager } from '../../../lib/offline/entities/managers/LVManager';

// Função auxiliar para converter File para base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useLV = ({ user, tipo_lv }: LVContainerProps): [LVState, LVActions] => {
  const isOnline = useOnlineStatus();

  // Estado principal
  const [state, setState] = useState<LVState>({
    tela: "inicio",
    modoEdicao: false,
    lvEmEdicao: null,
    itemFotoAtual: null,
    carregando: true, // ✅ Inicia como true para mostrar loading enquanto carrega configuração
    loadingLvs: true,
    lvsRealizados: [],
    dadosFormulario: {
      area: "",
      areaCustomizada: "",
      usarAreaCustomizada: false,
      data_inspecao: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
      inspetor_principal: user.nome || "",
      inspetor_principal_matricula: user.matricula || "",
      responsavel_tecnico: "",
      responsavelArea: "",
      responsavelEmpresa: "",
      inspetor2Nome: "",
      inspetor2Matricula: "",
      observacoes: "",
      assinatura_inspetor_principal: null,
      data_assinatura_inspetor_principal: null,
      assinatura_inspetor_secundario: null,
      data_assinatura_inspetor_secundario: null,
      observacoesIndividuais: {},
      avaliacoes: {},
      fotos: {},
      latitude: null,
      longitude: null,
      gpsAccuracy: null,
      enderecoGPS: "",
    },
    configuracao: null,
  });

  // Setters para estado
  const setTela = useCallback((tela: "inicio" | "formulario") => {
    setState(prev => ({ ...prev, tela }));
  }, []);

  const setModoEdicao = useCallback((modo: boolean) => {
    setState(prev => ({ ...prev, modoEdicao: modo }));
  }, []);

  const setLvEmEdicao = useCallback((lv: LVBase | null) => {
    setState(prev => ({ ...prev, lvEmEdicao: lv }));
  }, []);

  const setItemFotoAtual = useCallback((itemId: string | null) => {
    setState(prev => ({ ...prev, itemFotoAtual: itemId }));
  }, []);

  const setCarregando = useCallback((carregando: boolean) => {
    setState(prev => ({ ...prev, carregando }));
  }, []);

  const setLoadingLvs = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loadingLvs: loading }));
  }, []);

  const setLvsRealizados = useCallback((lvs: LVBase[]) => {
    setState(prev => ({ ...prev, lvsRealizados: lvs }));
  }, []);

  const setDadosFormulario = useCallback((dados: LVFormData | ((prev: LVFormData) => LVFormData)) => {
    setState(prev => ({ 
      ...prev, 
      dadosFormulario: typeof dados === 'function' ? dados(prev.dadosFormulario) : dados 
    }));
  }, []);

  const setConfiguracao = useCallback((config: LVConfig | null) => {
    setState(prev => ({ ...prev, configuracao: config }));
  }, []);

  // Carregar configuração da LV do banco de dados
  const carregarConfiguracao = useCallback(async () => {
    try {
      const response = await lvAPI.buscarConfiguracaoLV(tipo_lv);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao carregar configuração');
      }

      const config = response.data;

      // Converter dados da API para LVConfig
      const lvConfig: LVConfig = {
        codigo: config.tipo_lv,
        nome: config.nome_lv,
        nomeCompleto: config.nome_completo,
        numero_lv: config.tipo_lv,
        titulo_lv: config.nome_lv,
        revisao: config.revisao || '1.0',
        dataRevisao: config.data_revisao || new Date().toISOString(),
        itens: config.itens.map((item: any) => ({
          id: item.id,
          codigo: item.codigo || '',
          pergunta: item.pergunta || '',
          descricao: item.pergunta || item.descricao, // Alias para compatibilidade
          categoria: item.categoria,
          obrigatorio: item.obrigatorio !== undefined ? item.obrigatorio : true,
          ordem: item.ordem,
          subcategoria: undefined,
          observacao: undefined
        }))
      };

      setConfiguracao(lvConfig);
      console.log(`✅ [useLV] Configuração carregada do banco: ${lvConfig.itens.length} itens`);
    } catch (error) {
      console.error('❌ [useLV] Erro ao carregar configuração do banco:', error);
      setConfiguracao(null);
    } finally {
      // ✅ Sempre desliga o loading após carregar (sucesso ou erro)
      setCarregando(false);
    }
  }, [tipo_lv, setConfiguracao, setCarregando]);

  // Carregar LVs realizados
  const carregarLvsRealizados = useCallback(async () => {
    try {
      setLoadingLvs(true);
      
      if (isOnline) {
        const response = await lvAPI.listarLVs({ tipo_lv, usuario_id: user.id });
        if (response.success && response.data) {
          // Converter LV[] para LVBase[]
          const lvsConvertidos: LVBase[] = response.data.map(lv => ({
            id: lv.id,
            numero_sequencial: lv.numero_sequencial,
            numero_lv: lv.nome_lv,
            tipo_lv: lv.tipo_lv,
            lv_tipo: lv.tipo_lv,
            lv_nome: lv.nome_lv,
            data_lv: lv.data_inspecao,
            local_atividade: lv.area,
            usuario_id: lv.usuario_id,
            created_at: lv.created_at,
            updated_at: lv.updated_at,
            customFields: {},
            metadata: {}
          }));
          setLvsRealizados(lvsConvertidos);
        } else {
          setLvsRealizados([]);
        }
      } else {
        // Carregar do IndexedDB quando offline
        try {
          const lvsOffline = await LVManager.getByTipo(tipo_lv);
          const lvsConvertidos: LVBase[] = lvsOffline.map(lv => ({
            id: lv.id,
            numero_sequencial: lv.numero_sequencial,
            numero_lv: lv.nome_lv,
            tipo_lv: lv.tipo_lv,
            lv_tipo: lv.tipo_lv,
            lv_nome: lv.nome_lv,
            data_lv: lv.data_inspecao,
            local_atividade: lv.area,
            usuario_id: lv.usuario_id,
            created_at: lv.created_at,
            updated_at: lv.updated_at,
            customFields: {},
            metadata: {}
          }));
          setLvsRealizados(lvsConvertidos);
          console.log(`✅ [useLV] ${lvsConvertidos.length} LVs carregadas do IndexedDB`);
        } catch (error) {
          console.error('❌ [useLV] Erro ao carregar LVs offline:', error);
          setLvsRealizados([]);
        }
      }
    } catch (error) {
      console.error('❌ [useLV] Erro ao carregar LVs:', error);
      setLvsRealizados([]);
    } finally {
      setLoadingLvs(false);
    }
  }, [isOnline, tipo_lv, user.id, setLoadingLvs, setLvsRealizados]);

  // Salvar avaliações
  const salvarAvaliacoes = useCallback(async (lvId: string) => {
    try {
      const { avaliacoes, observacoesIndividuais } = state.dadosFormulario;

      if (!state.configuracao) return;

      // Converter objeto de avaliações para array
      // item_id agora é UUID (referência direta a perguntas_lv.id)
      const avaliacoesArray = state.configuracao.itens
        .filter(item => avaliacoes[item.id]) // Apenas itens avaliados
        .map((item) => ({
          item_id: item.id, // UUID da pergunta (perguntas_lv.id)
          item_codigo: item.codigo || '',
          item_pergunta: item.pergunta || item.descricao || '',
          avaliacao: avaliacoes[item.id],
          observacao: observacoesIndividuais[item.id] || undefined
        }));

      if (avaliacoesArray.length > 0) {
        if (isOnline) {
          // Online: salvar via API
          const response = await lvAPI.salvarAvaliacoes(lvId, avaliacoesArray);
          if (response.success) {
            console.log(`✅ [useLV] ${avaliacoesArray.length} avaliações salvas`);
          } else {
            console.error('❌ [useLV] Erro ao salvar avaliações:', response.error);
          }
        } else {
          // Offline: salvar no IndexedDB
          for (const avaliacao of avaliacoesArray) {
            const avaliacaoOffline: LVAvaliacao = {
              id: crypto.randomUUID(),
              lv_id: lvId,
              tipo_lv,
              item_id: avaliacao.item_id,
              item_codigo: avaliacao.item_codigo,
              item_pergunta: avaliacao.item_pergunta,
              avaliacao: avaliacao.avaliacao,
              observacao: avaliacao.observacao,
              created_at: new Date().toISOString()
            };
            await LVAvaliacaoManager.save(avaliacaoOffline);
          }
          console.log(`✅ [useLV] ${avaliacoesArray.length} avaliações salvas offline`);
        }
      }
    } catch (error) {
      console.error('❌ [useLV] Erro ao salvar avaliações:', error);
    }
  }, [state.dadosFormulario, state.configuracao, tipo_lv, isOnline]);

  // Salvar fotos
  const salvarFotos = useCallback(async (lvId: string) => {
    try {
      const { fotos } = state.dadosFormulario;

      // Coletar fotos com seus item_id correspondentes
      // item_id agora é UUID (referência direta a perguntas_lv.id)
      const fotosComItemId: Array<{ arquivo: File; item_id: string }> = [];
      Object.entries(fotos).forEach(([itemUuid, fotosItem]) => {
        fotosItem.forEach((foto: any) => {
          if (foto.arquivo && foto.arquivo instanceof File) {
            fotosComItemId.push({
              arquivo: foto.arquivo,
              item_id: itemUuid  // UUID da pergunta (perguntas_lv.id)
            });
          }
        });
      });

      if (fotosComItemId.length > 0) {
        if (isOnline) {
          // Online: enviar via API
          const response = await lvAPI.salvarFotosLV(lvId, fotosComItemId);
          if (response.success) {
            console.log(`✅ [useLV] ${fotosComItemId.length} fotos enviadas`);
          } else {
            console.error('❌ [useLV] Erro ao salvar fotos:', response.error);
          }
        } else {
          // Offline: converter para base64 e salvar no IndexedDB
          for (const fotoData of fotosComItemId) {
            try {
              const base64 = await fileToBase64(fotoData.arquivo);
              const fotoOffline: LVFoto = {
                id: crypto.randomUUID(),
                lv_id: lvId,
                tipo_lv,
                item_id: fotoData.item_id,
                nome_arquivo: fotoData.arquivo.name,
                url_arquivo: base64, // Salvar como base64 offline
                descricao: undefined,
                latitude: state.dadosFormulario.latitude || undefined,
                longitude: state.dadosFormulario.longitude || undefined,
                created_at: new Date().toISOString(),
                sincronizado: false,
                offline: true
              };
              await LVFotoManager.save(fotoOffline);
              console.log(`✅ [useLV] Foto ${fotoData.arquivo.name} salva offline`);
            } catch (error) {
              console.error(`❌ [useLV] Erro ao salvar foto offline:`, error);
            }
          }
          console.log(`✅ [useLV] ${fotosComItemId.length} fotos salvas offline`);
        }
      }
    } catch (error) {
      console.error('❌ [useLV] Erro ao salvar fotos:', error);
    }
  }, [state.dadosFormulario, tipo_lv, isOnline]);

  // Resetar formulário
  const resetarFormulario = useCallback(() => {
    setDadosFormulario({
      area: "",
      areaCustomizada: "",
      usarAreaCustomizada: false,
      data_inspecao: new Date().toISOString().split('T')[0],
      inspetor_principal: user.nome || "",
      inspetor_principal_matricula: user.matricula || "",
      responsavel_tecnico: "",
      responsavelArea: "",
      responsavelEmpresa: "",
      inspetor2Nome: "",
      inspetor2Matricula: "",
      observacoes: "",
      assinatura_inspetor_principal: null,
      data_assinatura_inspetor_principal: null,
      assinatura_inspetor_secundario: null,
      data_assinatura_inspetor_secundario: null,
      observacoesIndividuais: {},
      avaliacoes: {},
      fotos: {},
      latitude: null,
      longitude: null,
      gpsAccuracy: null,
      enderecoGPS: "",
    });
    setModoEdicao(false);
    setLvEmEdicao(null);
  }, [setDadosFormulario, setModoEdicao, setLvEmEdicao, user.nome, user.matricula]);

  // Salvar formulário
  const salvarFormulario = useCallback(async () => {
    try {
      setCarregando(true);
      
      if (!state.configuracao) {
        throw new Error('Configuração não carregada');
      }

      // Calcular estatísticas das avaliações
      const avaliacoes = state.dadosFormulario.avaliacoes;
      const totalConformes = Object.values(avaliacoes).filter(a => a === 'C' || a === 'conforme').length;
      const totalNaoConformes = Object.values(avaliacoes).filter(a => a === 'NC' || a === 'nao_conforme').length;
      const totalNaoAplicaveis = Object.values(avaliacoes).filter(a => a === 'NA' || a === 'nao_aplicavel').length;
      const totalAvaliados = Object.keys(avaliacoes).length;
      const percentualConformidade = totalAvaliados > 0 
        ? Math.round((totalConformes / totalAvaliados) * 100) 
        : 0;
      
      // Calcular total de fotos
      const totalFotos = Object.values(state.dadosFormulario.fotos).reduce(
        (acc, fotosItem) => acc + fotosItem.length, 
        0
      );

      if (state.modoEdicao && state.lvEmEdicao?.id) {
        // Modo edição
        if (isOnline) {
          // Online: atualizar via API
          const dadosAtualizacao: LVAtualizacao = {
            id: state.lvEmEdicao.id,
            tipo_lv,
            nome_lv: state.configuracao.nome,
            usuario_id: user.id,
            usuario_nome: user.nome,
            usuario_email: user.email,
            data_inspecao: state.dadosFormulario.data_inspecao || new Date().toISOString(),
            area: state.dadosFormulario.area,
            responsavel_area: state.dadosFormulario.responsavelArea,
            responsavel_tecnico: state.dadosFormulario.responsavel_tecnico,
            responsavel_empresa: state.dadosFormulario.responsavelEmpresa,
            inspetor_principal: state.dadosFormulario.inspetor_principal,
            inspetor_secundario: state.dadosFormulario.inspetor2Nome,
            inspetor_secundario_matricula: state.dadosFormulario.inspetor2Matricula,
            latitude: state.dadosFormulario.latitude || undefined,
            longitude: state.dadosFormulario.longitude || undefined,
            gps_precisao: state.dadosFormulario.gpsAccuracy || undefined,
            endereco_gps: state.dadosFormulario.enderecoGPS,
            observacoes_gerais: state.dadosFormulario.observacoes,
            // Assinaturas digitais
            assinatura_inspetor_principal: state.dadosFormulario.assinatura_inspetor_principal || undefined,
            data_assinatura_inspetor_principal: state.dadosFormulario.data_assinatura_inspetor_principal || undefined,
            assinatura_inspetor_secundario: state.dadosFormulario.assinatura_inspetor_secundario || undefined,
            data_assinatura_inspetor_secundario: state.dadosFormulario.data_assinatura_inspetor_secundario || undefined,
          };
          await lvAPI.atualizarLV(state.lvEmEdicao.id, dadosAtualizacao);
          await salvarAvaliacoes(state.lvEmEdicao.id);
          await salvarFotos(state.lvEmEdicao.id);
        } else {
          // Offline: atualizar no IndexedDB
          const lvExistente = await LVManager.getById(state.lvEmEdicao.id);
          if (lvExistente) {
            const lvAtualizado: LV = {
              ...lvExistente,
              nome_lv: state.configuracao.nome,
              data_inspecao: state.dadosFormulario.data_inspecao || new Date().toISOString(),
              area: state.dadosFormulario.area,
              responsavel_area: state.dadosFormulario.responsavelArea,
              responsavel_tecnico: state.dadosFormulario.responsavel_tecnico,
              responsavel_empresa: state.dadosFormulario.responsavelEmpresa,
              inspetor_principal: state.dadosFormulario.inspetor_principal,
              inspetor_secundario: state.dadosFormulario.inspetor2Nome,
              inspetor_secundario_matricula: state.dadosFormulario.inspetor2Matricula,
              latitude: state.dadosFormulario.latitude,
              longitude: state.dadosFormulario.longitude,
              gps_precisao: state.dadosFormulario.gpsAccuracy,
              endereco_gps: state.dadosFormulario.enderecoGPS,
              observacoes_gerais: state.dadosFormulario.observacoes,
              total_fotos: totalFotos,
              total_conformes: totalConformes,
              total_nao_conformes: totalNaoConformes,
              total_nao_aplicaveis: totalNaoAplicaveis,
              percentual_conformidade: percentualConformidade,
              sincronizado: false,
              offline: true,
              updated_at: new Date().toISOString()
            };
            await LVManager.update(lvAtualizado);
            await salvarAvaliacoes(state.lvEmEdicao.id);
            await salvarFotos(state.lvEmEdicao.id);
            console.log('✅ [useLV] LV atualizada offline');
          }
        }
      } else {
        // Modo criação
        const lvId = isOnline ? undefined : crypto.randomUUID();
        
        if (isOnline) {
          // Online: criar via API
          const dadosCriacao: LVCriacao = {
            tipo_lv,
            titulo: state.configuracao.nomeCompleto,
            nome_lv: state.configuracao.nome,
            usuario_id: user.id,
            usuario_nome: user.nome,
            usuario_email: user.email,
            data_inspecao: state.dadosFormulario.data_inspecao || new Date().toISOString(),
            area: state.dadosFormulario.area,
            responsavel_area: state.dadosFormulario.responsavelArea,
            responsavel_tecnico: state.dadosFormulario.responsavel_tecnico,
            responsavel_empresa: state.dadosFormulario.responsavelEmpresa,
            inspetor_principal: state.dadosFormulario.inspetor_principal,
            inspetor_secundario: state.dadosFormulario.inspetor2Nome,
            inspetor_secundario_matricula: state.dadosFormulario.inspetor2Matricula,
            latitude: state.dadosFormulario.latitude || undefined,
            longitude: state.dadosFormulario.longitude || undefined,
            gps_precisao: state.dadosFormulario.gpsAccuracy || undefined,
            endereco_gps: state.dadosFormulario.enderecoGPS,
            observacoes_gerais: state.dadosFormulario.observacoes,
            // Assinaturas digitais
            assinatura_inspetor_principal: state.dadosFormulario.assinatura_inspetor_principal || undefined,
            data_assinatura_inspetor_principal: state.dadosFormulario.data_assinatura_inspetor_principal || undefined,
            assinatura_inspetor_secundario: state.dadosFormulario.assinatura_inspetor_secundario || undefined,
            data_assinatura_inspetor_secundario: state.dadosFormulario.data_assinatura_inspetor_secundario || undefined,
          };
          const response = await lvAPI.criarLV(dadosCriacao);
          if (response.success && response.data?.id) {
            const lvId = response.data.id;
            await salvarAvaliacoes(lvId);
            await salvarFotos(lvId);

            // DETECTAR NCs - Agora fazemos isso APÓS salvar as avaliações
            const ncResponse = await lvAPI.detectarNCs(lvId);

            if (ncResponse.success && ncResponse.data) {
              const ncsDetectadas = ncResponse.data.ncs_detectadas || 0;
              const ncs = ncResponse.data.ncs || [];
              const tipoLV = ncResponse.data.tipo_lv;

              if (ncsDetectadas > 0) {
                console.log(`🚨 [useLV] ${ncsDetectadas} NC(s) detectada(s)!`);
                // Resetar e voltar, mas retornar informações sobre NCs
                await carregarLvsRealizados();
                resetarFormulario();
                setTela("inicio");
                setCarregando(false);

                // Retornar NCs para o componente decidir se abre modal
                return {
                  success: true,
                  lvId,
                  ncsDetectadas,
                  ncs,
                  tipoLV
                };
              }
            }
          }
        } else {
          // Offline: criar no IndexedDB
          const lvOffline: LV = {
            id: lvId,
            tipo_lv,
            nome_lv: state.configuracao.nome,
            usuario_id: user.id,
            usuario_nome: user.nome,
            usuario_matricula: user.matricula,
            usuario_email: user.email,
            data_inspecao: state.dadosFormulario.data_inspecao || new Date().toISOString(),
            data_preenchimento: new Date().toISOString(),
            area: state.dadosFormulario.area,
            responsavel_area: state.dadosFormulario.responsavelArea,
            responsavel_tecnico: state.dadosFormulario.responsavel_tecnico,
            responsavel_empresa: state.dadosFormulario.responsavelEmpresa,
            inspetor_principal: state.dadosFormulario.inspetor_principal,
            inspetor_secundario: state.dadosFormulario.inspetor2Nome,
            inspetor_secundario_matricula: state.dadosFormulario.inspetor2Matricula,
            latitude: state.dadosFormulario.latitude,
            longitude: state.dadosFormulario.longitude,
            gps_precisao: state.dadosFormulario.gpsAccuracy,
            endereco_gps: state.dadosFormulario.enderecoGPS,
            observacoes_gerais: state.dadosFormulario.observacoes,
            total_fotos: totalFotos,
            total_conformes: totalConformes,
            total_nao_conformes: totalNaoConformes,
            total_nao_aplicaveis: totalNaoAplicaveis,
            percentual_conformidade: percentualConformidade,
            status: 'rascunho',
            sincronizado: false,
            numero_sequencial: 0, // Será atribuído pelo backend na sincronização
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),

            offline: true
          };
          await LVManager.save(lvOffline);
          await salvarAvaliacoes(lvId);
          await salvarFotos(lvId);
          console.log('✅ [useLV] LV criada offline:', lvId);
        }
      }

      // Recarregar lista
      await carregarLvsRealizados();

      // Resetar e voltar para início
      resetarFormulario();
      setTela("inicio");

      // Retornar null indicando que não há NCs (ou LV foi criada offline)
      return null;

    } catch (error) {
      console.error('❌ [useLV] Erro ao salvar formulário:', error);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [state, tipo_lv, user, isOnline, setCarregando, carregarLvsRealizados, resetarFormulario, setTela, salvarAvaliacoes, salvarFotos]);

  // Visualizar LV
  const visualizarLV = useCallback(async (lv: LVBase) => {
    try {
      if (!lv.id) {
        console.error('❌ [useLV] LV sem ID');
        return;
      }

      console.log('👁️ [useLV] Visualizando LV:', lv.id);
      setCarregando(true);

      // Buscar dados completos do LV
      const lvResponse = await lvAPI.buscarLV(lv.id);
      if (!lvResponse.success || !lvResponse.data) {
        throw new Error('LV não encontrado');
      }

      const lvData = lvResponse.data;

      // Buscar avaliações
      const avaliacoesResponse = await lvAPI.buscarAvaliacoes(lv.id);
      
      // Buscar fotos
      const fotosResponse = await lvAPI.buscarFotos(lv.id);

      // Converter fotos para base64
      const photoUrls = fotosResponse.success ? fotosResponse.data?.map(f => f.url_arquivo) || [] : [];
      const convertedPhotos = await convertPhotosToBase64(photoUrls);

      // Ordenar avaliações por item_codigo
      const avaliacoesOrdenadas = avaliacoesResponse.success && avaliacoesResponse.data 
        ? [...avaliacoesResponse.data].sort((a, b) => {
            return (a.item_codigo || '').localeCompare(b.item_codigo || '');
          })
        : [];

      const formData: HTMLFormData = {
        title: `LV ${lvData.tipo_lv?.toUpperCase() || 'LV'} #${lvData.numero_sequencial || 'N/A'} - ${lvData.area || 'Área não especificada'}`,
        subtitle: `Inspeção realizada em ${lvData.data_inspecao ? new Date(lvData.data_inspecao).toLocaleDateString('pt-BR') : 'N/A'}`,
        data: {
          ...lvData,
          tipo: lvData.tipo_lv || tipo_lv,
          avaliacoes: avaliacoesOrdenadas
        },
        photos: convertedPhotos
      };

      // Usar generateHTMLForm que já abre a janela automaticamente
      await generateHTMLForm(formData);

      console.log('✅ [useLV] Preview aberto com sucesso');
    } catch (error) {
      console.error('❌ [useLV] Erro ao visualizar LV:', error);
      alert(`Erro ao abrir preview: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setCarregando(false);
    }
  }, [tipo_lv, setCarregando]);

  // Editar LV
  const editarLV = useCallback(async (lv: LVBase) => {
    try {
      setCarregando(true);
      
      // Buscar dados completos do LV
      const response = await lvAPI.buscarLV(lv.id!);
      if (!response.success || !response.data) {
        throw new Error('LV não encontrado');
      }
      
      const lvCompleto = response.data;
      
      // Preparar dados do formulário
      const dadosFormulario: LVFormData = {
        area: lvCompleto.area || "",
        areaCustomizada: "",
        usarAreaCustomizada: false,
        data_inspecao: lvCompleto.data_inspecao || new Date().toISOString().split('T')[0],
        inspetor_principal: lvCompleto.inspetor_principal || "",
        inspetor_principal_matricula: user.matricula || "",
        responsavel_tecnico: lvCompleto.responsavel_tecnico || "",
        responsavelArea: lvCompleto.responsavel_area || "",
        responsavelEmpresa: lvCompleto.responsavel_empresa || "",
        inspetor2Nome: lvCompleto.inspetor_secundario || "",
        inspetor2Matricula: lvCompleto.inspetor_secundario_matricula || "",
        observacoes: lvCompleto.observacoes_gerais || "",
        assinatura_inspetor_principal: (lvCompleto as any).assinatura_inspetor_principal || null,
        data_assinatura_inspetor_principal: (lvCompleto as any).data_assinatura_inspetor_principal || null,
        assinatura_inspetor_secundario: (lvCompleto as any).assinatura_inspetor_secundario || null,
        data_assinatura_inspetor_secundario: (lvCompleto as any).data_assinatura_inspetor_secundario || null,
        observacoesIndividuais: {},
        avaliacoes: {},
        fotos: {},
        latitude: lvCompleto.latitude || null,
        longitude: lvCompleto.longitude || null,
        gpsAccuracy: lvCompleto.gps_precisao || null,
        enderecoGPS: lvCompleto.endereco_gps || "",
      };

      // Buscar e processar avaliações
      const avaliacoesResponse = await lvAPI.buscarAvaliacoes(lv.id);
      if (avaliacoesResponse.success && avaliacoesResponse.data) {
        avaliacoesResponse.data.forEach(av => {
          dadosFormulario.avaliacoes[av.item_id] = av.avaliacao as "C" | "NC" | "NA" | "";
          if (av.observacao) {
            dadosFormulario.observacoesIndividuais[av.item_id] = av.observacao;
          }
        });
      }

      // Buscar e processar fotos
      const fotosResponse = await lvAPI.buscarFotos(lv.id);
      if (fotosResponse.success && fotosResponse.data) {
        fotosResponse.data.forEach(foto => {
          if (!dadosFormulario.fotos[foto.item_id]) {
            dadosFormulario.fotos[foto.item_id] = [];
          }
          dadosFormulario.fotos[foto.item_id].push(foto);
        });
      }

      setDadosFormulario(dadosFormulario);
      setLvEmEdicao(lv);
      setModoEdicao(true);
      setTela("formulario");
      
    } catch (error) {
      console.error('❌ [useLV] Erro ao editar LV:', error);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [setCarregando, setDadosFormulario, setLvEmEdicao, setModoEdicao, setTela]);

  // Excluir LV
  const excluirLV = useCallback(async (lv: LVBase, excluirFotos: boolean = true) => {
    try {
      if (!lv.id) return;
      
      setCarregando(true);
      await lvAPI.excluirLV(lv.id, excluirFotos);
      await carregarLvsRealizados();
      
    } catch (error) {
      console.error('❌ [useLV] Erro ao excluir LV:', error);
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [setCarregando, carregarLvsRealizados]);

  // Gerar PDF
  const gerarPDF = useCallback(async (lv: LVBase) => {
    try {
      if (!lv.id) {
        throw new Error('ID do LV não encontrado');
      }
      
      await generateLVPDF(lv.id, tipo_lv);
      
    } catch (error) {
      console.error('❌ [useLV] Erro ao gerar PDF:', error);
      throw error;
    }
  }, [tipo_lv]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarConfiguracao();
    carregarLvsRealizados();
  }, [carregarConfiguracao, carregarLvsRealizados]);

  // Ações
  const actions: LVActions = {
    setTela,
    setModoEdicao,
    setLvEmEdicao,
    setItemFotoAtual,
    setCarregando,
    setLoadingLvs,
    setLvsRealizados,
    setDadosFormulario,
    setConfiguracao,
    resetarFormulario,
    salvarFormulario,
    visualizarLV,
    editarLV,
    excluirLV,
    gerarPDF,
    carregarLvsRealizados,
  };

  return [state, actions];
}; 