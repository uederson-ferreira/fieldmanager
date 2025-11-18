// ===================================================================
// HOOK CUSTOMIZADO - TERMO FORM - ECOFIELD SYSTEM
// Localização: src/hooks/useTermoForm.ts
// Módulo: Lógica principal do formulário de termos
// ===================================================================

import React, { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';
import { TermoManager, TermoPhotoProcessor } from '../utils/termos';
import { getCurrentDateTimeLocal } from '../utils/dateUtils';
import { getAuthToken } from '../utils/authUtils';
import { termosAPI } from '../lib/termosAPI';
import { TermoSaver } from '../utils/TermoSaver';
import { TermoPhotoUploader } from '../utils/TermoPhotoUploader';
import type { TermoFormData, TermoLiberacao, TermoAmbiental } from '../types/termos';
import type { ProcessedPhotoData } from '../utils/TermoPhotoProcessor';

// Instância do gerenciador modular
const termoManager = new TermoManager({ autoGPS: true, validarAntes: true, salvarFotos: true });

interface UseTermoFormProps {
  modoEdicao?: boolean;
  termoParaEditar?: TermoAmbiental;
  onSalvar?: () => void;
  onCancelar?: () => void;
}

interface UseTermoFormReturn {
  // Estado principal
  dadosFormulario: TermoFormData;
  fotos: { [categoria: string]: ProcessedPhotoData[] };
  numeroTermo: string;
  salvando: boolean;
  gpsCarregando: boolean;
  gpsObtidoAutomaticamente: boolean;
  categoriasLV: string[];
  
  // Ações principais
  setDadosFormulario: React.Dispatch<React.SetStateAction<TermoFormData>>;
  salvarTermo: () => Promise<void>;
  limparCampos: () => void;
  obterLocalizacaoGPS: (automatico?: boolean) => Promise<void>;
  
  // Ações de fotos
  adicionarFoto: (categoria: string) => Promise<void>;
  removerFoto: (categoria: string, index: number) => void;
  
  // Ações de não conformidades
  adicionarNC: () => void;
  removerNC: (index: number) => void;
  atualizarNC: (index: number, campo: string, valor: string) => void;
  
  // Ações de correção
  adicionarAcao: () => void;
  removerAcao: (index: number) => void;
  atualizarAcao: (index: number, campo: string, valor: string) => void;
  
  // Ações de liberação
  atualizarLiberacao: (updater: (prev: TermoLiberacao) => TermoLiberacao) => void;
  
  // Utilitários
  gerarNumeroTermo: () => Promise<void>;
  carregarFotosExistentes: (termoId: string) => Promise<void>;

  //EXCLUIR DEPOIS
  preencherFormularioTeste: () => Promise<void>;
}

// Função para converter TermoAmbiental para TermoFormData
function converterTermoParaFormData(termo: TermoAmbiental): TermoFormData {
  // Converter não conformidades
  const naoConformidades = [];
  for (let i = 1; i <= 10; i++) {
    const descricao = (termo as any)[`descricao_nc_${i}`];
    const severidade = (termo as any)[`severidade_nc_${i}`];
    if (descricao) {
      naoConformidades.push({ descricao, severidade });
    }
  }

  // Converter ações de correção
  const acoesCorrecao = [];
  for (let i = 1; i <= 10; i++) {
    const acao = (termo as any)[`acao_correcao_${i}`];
    const prazo = (termo as any)[`prazo_acao_${i}`];
    if (acao) {
      acoesCorrecao.push({ descricao: acao, prazo: prazo || '' });
    }
  }

  // Converter liberação
  const liberacao: TermoLiberacao = {};
  if (termo.liberacao_nome) {
    liberacao.nome = termo.liberacao_nome;
    liberacao.empresa = termo.liberacao_empresa || '';
    liberacao.gerencia = termo.liberacao_gerencia || '';
    liberacao.data = termo.liberacao_data || '';
    liberacao.horario = termo.liberacao_horario || '';
    liberacao.assinatura_carimbo = termo.liberacao_assinatura_carimbo || false;
  }

  return {
    destinatario_cpf: '', // Campo obrigatório
    emitido_por_matricula: '', // Campo obrigatório
    emitido_por_cargo: '', // Campo obrigatório
    // ✅ INCLUIR numero_termo na conversão
    numero_termo: termo.numero_termo,
    data_termo: termo.data_termo,
    hora_termo: termo.hora_termo,
    local_atividade: termo.local_atividade,
    projeto_ba: termo.projeto_ba || '',
    fase_etapa_obra: termo.fase_etapa_obra || '',
    emitido_por_nome: termo.emitido_por_nome,
    emitido_por_gerencia: termo.emitido_por_gerencia || '',
    emitido_por_empresa: termo.emitido_por_empresa || '',
    emitido_por_usuario_id: termo.emitido_por_usuario_id,
    destinatario_nome: termo.destinatario_nome,
    destinatario_gerencia: termo.destinatario_gerencia || '',
    destinatario_empresa: termo.destinatario_empresa || '',
    area_equipamento_atividade: termo.area_equipamento_atividade,
    equipe: termo.equipe || '',
    atividade_especifica: termo.atividade_especifica || '',
    tipo_termo: termo.tipo_termo,
    natureza_desvio: termo.natureza_desvio,
    nao_conformidades: naoConformidades,
    lista_verificacao_aplicada: termo.lista_verificacao_aplicada || '',
    tst_tma_responsavel: termo.tst_tma_responsavel || '',
    acoes_correcao: acoesCorrecao,
    assinatura_responsavel_area: termo.assinatura_responsavel_area || false,
    assinatura_emitente: termo.assinatura_emitente || false,
    assinatura_responsavel_area_img: termo.assinatura_responsavel_area_img,
    assinatura_emitente_img: termo.assinatura_emitente_img,
    providencias_tomadas: termo.providencias_tomadas || '',
    observacoes: termo.observacoes || '',
    liberacao: Object.keys(liberacao).length > 0 ? liberacao : undefined,
    usarGpsAtual: false,
    latitude: termo.latitude,
    longitude: termo.longitude,
    precisao_gps: termo.precisao_gps,
    endereco_gps: termo.endereco_gps || '',
    fotos: {},
    status: termo.status
  };
}

// Função para criar dados padrão do formulário
function criarTermoFormDataPadrao(user: { nome?: string; id?: string } | null): TermoFormData {
  const { data, hora } = getCurrentDateTimeLocal();
  
  return {
    destinatario_cpf: '', // Campo obrigatório
    emitido_por_matricula: '', // Campo obrigatório
    emitido_por_cargo: '', // Campo obrigatório
    data_termo: data,
    hora_termo: hora,
    local_atividade: '',
    projeto_ba: '',
    fase_etapa_obra: '',
    emitido_por_nome: user?.nome || '',
    emitido_por_gerencia: '',
    emitido_por_empresa: '',
    emitido_por_usuario_id: user?.id || '',
    destinatario_nome: '',
    destinatario_gerencia: '',
    destinatario_empresa: '',
    area_equipamento_atividade: '',
    equipe: '',
    atividade_especifica: '',
    tipo_termo: 'RECOMENDACAO',
    natureza_desvio: 'OCORRENCIA_REAL',
    nao_conformidades: [],
    lista_verificacao_aplicada: '',
    tst_tma_responsavel: '',
    acoes_correcao: [],
    assinatura_responsavel_area: false,
    data_assinatura_responsavel: new Date().toISOString().split('T')[0], // ✅ Sempre definir data do dia
    assinatura_emitente: false,
    data_assinatura_emitente: new Date().toISOString().split('T')[0], // ✅ Sempre definir data do dia
    assinatura_responsavel_area_img: undefined,
    assinatura_emitente_img: undefined,
    providencias_tomadas: '',
    observacoes: '',
    liberacao: undefined,
    usarGpsAtual: false,
    latitude: undefined,
    longitude: undefined,
    precisao_gps: undefined,
    endereco_gps: '',
    fotos: {},
    status: 'PENDENTE'
  };
}

export const useTermoForm = ({ 
  modoEdicao = false, 
  termoParaEditar, 
  onSalvar, 
  onCancelar: _onCancelar 
}: UseTermoFormProps): UseTermoFormReturn => {
  const { user } = useAuth();
  
  // Estado principal
  const [dadosFormulario, setDadosFormulario] = useState<TermoFormData>(() => {
    if (modoEdicao && termoParaEditar) {
      console.log('📝 [TERMO FORM] Convertendo termo para edição:', termoParaEditar);
      const dadosConvertidos = converterTermoParaFormData(termoParaEditar);
      console.log('📝 [TERMO FORM] Dados convertidos:', dadosConvertidos);
      return dadosConvertidos;
    }
    return criarTermoFormDataPadrao(user);
  });
  
  const [fotos, setFotos] = useState<{ [categoria: string]: ProcessedPhotoData[] }>({});
  const [numeroTermo, setNumeroTermo] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  const [gpsCarregando, setGpsCarregando] = useState(false);
  const [gpsObtidoAutomaticamente, setGpsObtidoAutomaticamente] = useState(false);
  const [categoriasLV, setCategoriasLV] = useState<string[]>([]);

  // Carregar categorias LV e obter GPS automaticamente
  useEffect(() => {
    // ✅ SEMPRE carregar categorias LV (tanto para criação quanto edição)
    carregarCategoriasLV();
    
    if (!modoEdicao) {
      gerarNumeroTermo();
      obterLocalizacaoGPS(true); // Obter GPS automaticamente
    } else if (termoParaEditar?.numero_termo) {
      // ✅ MODO EDIÇÃO: Usar o número do termo existente
      setNumeroTermo(termoParaEditar.numero_termo);
    }
  }, [modoEdicao, termoParaEditar?.numero_termo]);

  // ✅ LISTENER para mudanças no status online/offline
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      if (!modoEdicao) {
        console.log('🌐 [TERMO FORM] Status de conexão alterado, regenerando número...');
        // Chamar gerarNumeroTermo apenas se estiver definido
        if (typeof gerarNumeroTermo === 'function') {
          gerarNumeroTermo();
        }
      }
    };

    // Adicionar listeners para mudanças de status online/offline
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Cleanup dos listeners
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [modoEdicao]); // Remover gerarNumeroTermo das dependências para evitar referência circular

  // ✅ DEFINIR numeroTermo quando em modo de edição
  useEffect(() => {
    if (modoEdicao && termoParaEditar?.numero_termo) {
      console.log('📝 [TERMO FORM] Definindo numeroTermo para edição:', termoParaEditar.numero_termo);
      
      // Extrair o número sequencial do numero_termo formatado
      // Exemplo: "2025-RT-232" -> "232"
      const match = termoParaEditar.numero_termo.match(/-(\d+)$/);
      if (match) {
        const numeroSequencial = match[1];
        console.log('✅ [TERMO FORM] Número sequencial extraído:', numeroSequencial);
        setNumeroTermo(numeroSequencial);
      } else {
        console.warn('⚠️ [TERMO FORM] Não foi possível extrair número sequencial de:', termoParaEditar.numero_termo);
        setNumeroTermo('');
      }
    }
  }, [modoEdicao, termoParaEditar?.numero_termo]);

  // Carregar categorias LV do Supabase
  const carregarCategoriasLV = useCallback(async () => {
    try {
      console.log('🔍 [TERMO FORM] Carregando categorias LV...');
      const token = getAuthToken();
      
      if (!token) {
        console.error('❌ [TERMO FORM] Token de autenticação não encontrado');
        setCategoriasLV([]);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/lv`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 [TERMO FORM] Status da resposta:', response.status);
      
      if (response.ok) {
        const categorias = await response.json();
        console.log('✅ [TERMO FORM] Categorias recebidas:', categorias);
        
        // ✅ Formatar como "codigo-nome" (exemplo: "09-BANHEIRO QUÍMICO")
        const categoriasFormatadas = categorias.map((cat: any) => `${cat.codigo}-${cat.nome}`);
        console.log('🎯 [TERMO FORM] Categorias formatadas:', categoriasFormatadas);
        
        setCategoriasLV(categoriasFormatadas);
      } else {
        const errorData = await response.json();
        console.error('❌ [TERMO FORM] Erro na resposta:', errorData);
        setCategoriasLV([]);
      }
    } catch (error) {
      console.error('❌ [TERMO FORM] Erro ao carregar categorias LV:', error);
      setCategoriasLV([]);
    }
  }, []);

  // Gerar número sequencial baseado no tipo
  const gerarNumeroTermo = useCallback(async () => {
    try {
      const tipo = dadosFormulario.tipo_termo;
      if (!tipo) return;

      // Verificar se está offline
      if (!navigator.onLine) {
        console.log('📱 [TERMO FORM] Modo offline detectado, gerando ID único...');
        
        // Gerar ID único diretamente
        const idUnico = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('✅ [TERMO FORM] ID único gerado:', idUnico);
        
        // Para offline, usar o ID único como número do termo
        setNumeroTermo(idUnico);
        return;
      }

      const ano = new Date().getFullYear();
      
      // Buscar termos existentes para calcular o próximo número sequencial
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ecofield_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const termos = await response.json();
        
        // Filtrar termos do mesmo tipo e ano
        const termosDoTipo = termos.filter((termo: any) => 
          termo.tipo_termo === tipo && 
          new Date(termo.created_at).getFullYear() === ano
        );
        
        // Encontrar o maior número sequencial
        const maiorNumero = termosDoTipo.reduce((max: number, termo: any) => {
          return Math.max(max, termo.numero_sequencial || 0);
        }, 0);
        
        const proximoNumero = maiorNumero + 1;
        
        // ✅ GERAR número formatado para exibição no formulário
        const prefixo = tipo === 'PARALIZACAO_TECNICA' ? 'PT' : tipo === 'NOTIFICACAO' ? 'NT' : 'RC';
        const numeroFormatado = `${ano}-${prefixo}-${String(proximoNumero).padStart(3, '0')}`;
        
        console.log('✅ [TERMO FORM] Número sequencial gerado:', proximoNumero, `(formatado: ${numeroFormatado})`);
        setNumeroTermo(proximoNumero.toString()); // ✅ Guardar apenas o sequencial para formatação
      }
    } catch (error) {
      console.error('❌ [TERMO FORM] Erro ao gerar número do termo:', error);
      
      // Em caso de erro, gerar ID único como fallback
      try {
        console.log('📱 [TERMO FORM] Gerando ID único como fallback devido ao erro...');
        const idUnico = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('✅ [TERMO FORM] ID único gerado como fallback:', idUnico);
        setNumeroTermo(idUnico);
      } catch (offlineError) {
        console.error('❌ [TERMO FORM] Erro ao gerar ID único de fallback:', offlineError);
        setNumeroTermo(`offline_${Date.now()}_fallback`);
      }
    }
  }, [dadosFormulario.tipo_termo]);

  // Preencher formulário com dados de teste
  const preencherFormularioTeste = useCallback(async () => {
    try {
      console.log('🧪 [TERMO FORM] Preenchendo formulário com dados de teste...');
      
      // Dados básicos do formulário
      setDadosFormulario(prev => ({
        ...prev,
        destinatario_cpf: '123.456.789-00',
        emitido_por_matricula: 'TEC001',
        emitido_por_cargo: 'Técnico de Campo',
        data_termo: new Date().toISOString().split('T')[0],
        hora_termo: new Date().toTimeString().slice(0, 5),
        local_atividade: 'Área de Produção - Setor A',
        projeto_ba: 'PROJ-2025-001',
        fase_etapa_obra: 'Execução',
        emitido_por_nome: 'João Silva',
        emitido_por_gerencia: 'Técnica',
        emitido_por_empresa: 'EcoField Ltda',
        destinatario_nome: 'Maria Santos',
        destinatario_gerencia: 'Operacional',
        destinatario_empresa: 'EcoField Ltda',
        area_equipamento_atividade: 'Equipamento de Processamento',
        equipe: 'Equipe Alpha',
        atividade_especifica: 'Manutenção Preventiva',
        tipo_termo: 'RECOMENDACAO',
        natureza_desvio: 'POTENCIAL_NAO_CONFORMIDADE',
        nao_conformidades: [
          { descricao: 'Vazamento detectado no sistema de refrigeração', severidade: 'A' },
          { descricao: 'Ruído excessivo no compressor principal', severidade: 'M' }
        ],
        lista_verificacao_aplicada: 'Lista de Verificação',
        tst_tma_responsavel: 'Carlos Oliveira',
        acoes_correcao: [
          { descricao: 'Realizar manutenção do sistema de refrigeração', prazo: '2025-02-15' },
          { descricao: 'Substituir isolamento acústico do compressor', prazo: '2025-02-20' }
        ],
        assinatura_responsavel_area: true,
        assinatura_emitente: true,
        providencias_tomadas: 'Isolamento da área e notificação imediata',
        observacoes: 'Manutenção programada para próxima semana',
        latitude: -23.5505,
        longitude: -46.6333,
        precisao_gps: 5,
        endereco_gps: 'São Paulo, SP, Brasil'
      }));

      // Adicionar fotos de teste
      const fotosTeste: { [categoria: string]: ProcessedPhotoData[] } = {
        geral: [],
        nc_0: [],
        nc_1: [],
        acao_0: [],
        acao_1: []
      };

      // Função para criar foto de teste
      const criarFotoTeste = (nome: string, categoria: string): ProcessedPhotoData => {
        // Base64 de uma imagem 1x1 pixel JPEG (cinza)
        const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k=';
        
        // Criar um blob a partir do base64
        const byteCharacters = atob(base64Image.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        
        return {
          arquivo: new File([blob], nome, { type: 'image/jpeg' }),
          base64Data: base64Image,
          preview: base64Image,
          nome: nome,
          itemId: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 5,
          endereco: 'São Paulo, SP, Brasil',
          tamanho: blob.size,
          tipo: 'image/jpeg',
          offline: false,
          sincronizado: true
        };
      };

      // Adicionar 2 fotos gerais
      fotosTeste.geral.push(criarFotoTeste('foto_geral_1.jpg', 'geral'));
      fotosTeste.geral.push(criarFotoTeste('foto_geral_2.jpg', 'geral'));

      // Adicionar 2 fotos para cada NC
      fotosTeste.nc_0.push(criarFotoTeste('foto_nc_0_1.jpg', 'nc_0'));
      fotosTeste.nc_0.push(criarFotoTeste('foto_nc_0_2.jpg', 'nc_0'));
      fotosTeste.nc_1.push(criarFotoTeste('foto_nc_1_1.jpg', 'nc_1'));
      fotosTeste.nc_1.push(criarFotoTeste('foto_nc_1_2.jpg', 'nc_1'));

      // Adicionar 2 fotos para cada ação
      fotosTeste.acao_0.push(criarFotoTeste('foto_acao_0_1.jpg', 'acao_0'));
      fotosTeste.acao_0.push(criarFotoTeste('foto_acao_0_2.jpg', 'acao_0'));
      fotosTeste.acao_1.push(criarFotoTeste('foto_acao_1_1.jpg', 'acao_1'));
      fotosTeste.acao_1.push(criarFotoTeste('foto_acao_1_2.jpg', 'acao_1'));

      setFotos(fotosTeste);
      console.log('✅ [TERMO FORM] Formulário preenchido com dados de teste!');
    } catch (error) {
      console.error('❌ [TERMO FORM] Erro ao preencher formulário de teste:', error);
    }
  }, []);

  // Carregar fotos existentes
  const carregarFotosExistentes = useCallback(async (termoId: string) => {
    try {
      console.log('📸 [TERMO FORM] Carregando fotos para termo:', termoId);
      const url = `${import.meta.env.VITE_API_URL}/api/termos/${termoId}/fotos`;
      console.log('📸 [TERMO FORM] URL para buscar fotos:', url);
      
      // Obter token de autenticação
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [TERMO FORM] Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('📸 [TERMO FORM] Status da resposta:', response.status);
      
      if (response.ok) {
        const fotosData = await response.json();
        console.log('📸 [TERMO FORM] Fotos recebidas:', fotosData);
        
        const fotosAgrupadas: { [categoria: string]: ProcessedPhotoData[] } = {};
        
        // ✅ PROCESSAR fotos de forma assíncrona
        for (const foto of fotosData) {
          const categoria = foto.categoria || 'geral';
          if (!fotosAgrupadas[categoria]) {
            fotosAgrupadas[categoria] = [];
          }
          
          // ✅ BAIXAR foto real do Supabase
          const tipoMime = foto.tipo_mime || 'image/jpeg';
          const nomeArquivo = foto.nome_arquivo || 'foto_existente.jpg';
          
          try {
            console.log('📥 [TERMO FORM] Baixando foto:', foto.url_arquivo);
            
            // Fazer download da foto do Supabase
            const fotoResponse = await fetch(foto.url_arquivo);
            if (!fotoResponse.ok) {
              throw new Error(`Erro ao baixar foto: ${fotoResponse.status}`);
            }
            
            const fotoBlob = await fotoResponse.blob();
            const arquivo = new File([fotoBlob], nomeArquivo, { type: tipoMime });
            
            console.log('✅ [TERMO FORM] Foto baixada com sucesso:', {
              nome: nomeArquivo,
              tamanho: arquivo.size,
              tipo: tipoMime
            });
            
            const fotoProcessada: ProcessedPhotoData = {
              arquivo: arquivo,
              base64Data: foto.url_arquivo,
              preview: URL.createObjectURL(arquivo), // ✅ CORRETO: Criar preview do arquivo baixado
              nome: nomeArquivo,
              itemId: Date.now() + Math.random(), // ✅ ID único
              timestamp: foto.created_at || new Date().toISOString(),
              latitude: foto.latitude,
              longitude: foto.longitude,
              accuracy: foto.precisao_gps,
              endereco: foto.endereco || '',
              tamanho: foto.tamanho_bytes || arquivo.size,
              tipo: tipoMime,
              offline: false,
              sincronizado: true
            };
            
            fotosAgrupadas[categoria].push(fotoProcessada);
          } catch (error) {
            console.error('❌ [TERMO FORM] Erro ao baixar foto:', error);
            console.log('⚠️ [TERMO FORM] Criando foto placeholder para:', nomeArquivo);
            
            // Fallback: criar arquivo válido se download falhar
            const dadosMinimos = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // Header JPEG mínimo
            const arquivo = new File([dadosMinimos], nomeArquivo, { type: tipoMime });
            
            const fotoProcessada: ProcessedPhotoData = {
              arquivo: arquivo,
              base64Data: foto.url_arquivo,
              preview: URL.createObjectURL(arquivo), // ✅ CORRETO: Criar preview do arquivo placeholder
              nome: nomeArquivo,
              itemId: Date.now() + Math.random(),
              timestamp: foto.created_at || new Date().toISOString(),
              latitude: foto.latitude,
              longitude: foto.longitude,
              accuracy: foto.precisao_gps,
              endereco: foto.endereco || '',
              tamanho: foto.tamanho_bytes || arquivo.size,
              tipo: tipoMime,
              offline: false,
              sincronizado: true
            };
            
            fotosAgrupadas[categoria].push(fotoProcessada);
          }
        }
        
        console.log('📸 [TERMO FORM] Fotos agrupadas:', fotosAgrupadas);
        console.log('📸 [TERMO FORM] Total de categorias:', Object.keys(fotosAgrupadas).length);
        console.log('📸 [TERMO FORM] Total de fotos:', Object.values(fotosAgrupadas).reduce((total, fotos) => total + fotos.length, 0));
        setFotos(fotosAgrupadas);
      } else {
        console.error('❌ [TERMO FORM] Erro na resposta:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ [TERMO FORM] Detalhes do erro:', errorText);
      }
    } catch (error) {
      console.error('❌ [TERMO FORM] Erro ao carregar fotos existentes:', error);
    }
  }, []);

  // Adicionar foto
  const adicionarFoto = useCallback(async (categoria: string) => {
    try {
      console.log('📸 [TERMO FORM] Iniciando adição de foto para categoria:', categoria);
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      
      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (!files) {
          console.log('❌ [TERMO FORM] Nenhum arquivo selecionado');
          return;
        }
        
        console.log('📸 [TERMO FORM] Arquivos selecionados:', files.length);
        
        const novasFotos: ProcessedPhotoData[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`📸 [TERMO FORM] Processando arquivo ${i + 1}:`, file.name);
          
          const processedPhoto = await TermoPhotoProcessor.processarFoto(file, categoria);
          console.log(`✅ [TERMO FORM] Foto processada:`, {
            nome: processedPhoto.nome,
            categoria,
            tamanho: processedPhoto.tamanho
          });
          
          novasFotos.push(processedPhoto);
        }
        
        console.log('📸 [TERMO FORM] Adicionando fotos ao estado:', {
          categoria,
          novasFotos: novasFotos.length,
          totalFotos: Object.values(fotos).reduce((total, fotos) => total + fotos.length, 0) + novasFotos.length
        });
        
        setFotos(prev => {
          const novoEstado = {
            ...prev,
            [categoria]: [...(prev[categoria] || []), ...novasFotos]
          };
          
          console.log('📸 [TERMO FORM] Estado de fotos atualizado:', {
            categorias: Object.keys(novoEstado),
            totalFotos: Object.values(novoEstado).reduce((total, fotos) => total + fotos.length, 0)
          });
          
          return novoEstado;
        });
      };
      
      input.click();
    } catch (error) {
      console.error('❌ [TERMO FORM] Erro ao adicionar foto:', error);
    }
  }, [fotos]);

  // Remover foto
  const removerFoto = useCallback((categoria: string, index: number) => {
    setFotos(prev => ({
      ...prev,
      [categoria]: prev[categoria]?.filter((_, i) => i !== index) || []
    }));
  }, []);

  // Obter localização GPS
  const obterLocalizacaoGPS = useCallback(async (automatico = false) => {
    setGpsCarregando(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      setDadosFormulario(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        precisao_gps: position.coords.accuracy
      }));
      
      setGpsObtidoAutomaticamente(automatico);
    } catch (error) {
      console.error('❌ [TERMO FORM] Erro ao obter GPS:', error);
    } finally {
      setGpsCarregando(false);
    }
  }, []);

  // Salvar termo
  const salvarTermo = useCallback(async () => {
    setSalvando(true);
    try {
      console.log('🔄 [TERMO FORM] Salvando termo...');
      
      // ✅ GERAR numero_termo formatado para envio
      const ano = new Date().getFullYear();
      const prefixo = dadosFormulario.tipo_termo === 'PARALIZACAO_TECNICA' ? 'PT' : 
                     dadosFormulario.tipo_termo === 'NOTIFICACAO' ? 'NT' : 'RC';
      const numeroFormatado = `${ano}-${prefixo}-${String(parseInt(numeroTermo)).padStart(3, '0')}`;
      
      console.log('🔍 [TERMO FORM] Gerando numero_termo:', {
        ano,
        prefixo,
        numeroTermo,
        numeroFormatado
      });

      const termoData = {
        ...dadosFormulario,
        // ✅ REMOVER numero_sequencial - deixar o banco gerar automaticamente
        numero_termo: numeroFormatado, // ✅ ENVIAR numero_termo formatado
        fotos: fotos
      };
      
      // ✅ DEBUG: Verificar se as datas de assinatura estão sendo enviadas
      console.log('🔍 [TERMO FORM] Dados sendo enviados:', {
        numero_termo: termoData.numero_termo,
        data_assinatura_responsavel: termoData.data_assinatura_responsavel,
        data_assinatura_emitente: termoData.data_assinatura_emitente,
        assinatura_responsavel_area: termoData.assinatura_responsavel_area,
        assinatura_emitente: termoData.assinatura_emitente
      });
      
      // ✅ DEBUG: Verificar dadosFormulario completo
      console.log('🔍 [TERMO FORM] dadosFormulario completo:', {
        assinatura_responsavel_area: dadosFormulario.assinatura_responsavel_area,
        data_assinatura_responsavel: dadosFormulario.data_assinatura_responsavel,
        assinatura_emitente: dadosFormulario.assinatura_emitente,
        data_assinatura_emitente: dadosFormulario.data_assinatura_emitente
      });
      
      // ✅ DEBUG: Verificar se as datas estão sendo definidas
      console.log('🔍 [TERMO FORM] Verificação detalhada das datas:', {
        'checkbox_responsavel_marcado': dadosFormulario.assinatura_responsavel_area,
        'data_responsavel_definida': !!dadosFormulario.data_assinatura_responsavel,
        'data_responsavel_valor': dadosFormulario.data_assinatura_responsavel,
        'checkbox_emitente_marcado': dadosFormulario.assinatura_emitente,
        'data_emitente_definida': !!dadosFormulario.data_assinatura_emitente,
        'data_emitente_valor': dadosFormulario.data_assinatura_emitente
      });
      
      // ✅ DEBUG: Verificar numeroTermo
      console.log('🔍 [TERMO FORM] numeroTermo:', numeroTermo);
      console.log('🔍 [TERMO FORM] numeroFormatado:', numeroFormatado);
      
      // ✅ SINCRONIZAR FOTOS DO ESTADO LOCAL COM O TERMO MANAGER
      console.log('🔍 [TERMO FORM] Sincronizando fotos com termoManager:', {
        totalFotos: Object.values(fotos).reduce((total, fotos) => total + fotos.length, 0),
        categorias: Object.keys(fotos),
        fotosDetalhadas: Object.entries(fotos).map(([cat, fotos]) => ({
          categoria: cat,
          quantidade: fotos.length,
          nomes: fotos.map(f => f.nome)
        }))
      });
      
      // Limpar fotos do termoManager e adicionar as do estado local
      console.log('🧹 [TERMO FORM] Limpando estado do termoManager...');
      termoManager.limparEstado();
      
      // Adicionar cada foto ao termoManager
      let fotosAdicionadas = 0;
      for (const [categoria, fotosCategoria] of Object.entries(fotos)) {
        console.log(`📸 [TERMO FORM] Adicionando ${fotosCategoria.length} fotos da categoria ${categoria} ao termoManager`);
        
        for (const foto of fotosCategoria) {
          console.log(`📸 [TERMO FORM] Adicionando foto ao termoManager:`, {
            nome: foto.nome,
            categoria,
            tamanho: foto.tamanho
          });
          
          await termoManager.adicionarFoto(foto.arquivo, categoria);
          fotosAdicionadas++;
        }
      }
      
      console.log(`✅ [TERMO FORM] ${fotosAdicionadas} fotos sincronizadas com termoManager`);
      
      // ✅ VERIFICAR SE É MODO DE EDIÇÃO OU CRIAÇÃO
      if (modoEdicao && termoParaEditar?.id) {
        console.log('✏️ [TERMO FORM] Modo de edição - atualizando termo:', termoParaEditar.id);
        
        // ✅ PREPARAR DADOS CORRETAMENTE PARA ATUALIZAÇÃO
        const dadosParaAtualizar = TermoSaver.prepararDadosTermo(termoData);
        console.log('🔍 [TERMO FORM] Dados preparados para atualização:', dadosParaAtualizar);
        console.log('🔍 [TERMO FORM] Campos específicos:', {
          numero_termo: dadosParaAtualizar.numero_termo,
          local_atividade: dadosParaAtualizar.local_atividade,
          descricao_nc_1: dadosParaAtualizar.descricao_nc_1,
          acao_correcao_1: dadosParaAtualizar.acao_correcao_1,
          total_campos: Object.keys(dadosParaAtualizar).length
        });
        
        // ✅ USAR API DE ATUALIZAÇÃO
        const result = await termosAPI.atualizarTermo(termoParaEditar.id, dadosParaAtualizar);
        
        if (result.success) {
          console.log('✅ [TERMO FORM] Termo atualizado com sucesso');

          // Disparar evento para atualizar metas no dashboard
          window.dispatchEvent(new CustomEvent('meta:atualizar'));
          console.log('🔔 [TERMO FORM] Evento meta:atualizar disparado');

          // ✅ SALVAR FOTOS APÓS ATUALIZAR O TERMO (CRUD INTELIGENTE)
          if (Object.keys(fotos).length > 0) {
            console.log('📸 [TERMO FORM] Processando fotos após atualização...');
            
            try {
              // ✅ COMPARAR fotos atuais com fotos originais
              const fotosModificadas = await TermoPhotoUploader.compararFotos(
                fotos,
                termoParaEditar.id
              );
              
              if (fotosModificadas.temModificacoes) {
                console.log('📸 [TERMO FORM] Fotos modificadas detectadas:', {
                  adicionadas: fotosModificadas.adicionadas.length,
                  removidas: fotosModificadas.removidas.length,
                  mantidas: fotosModificadas.mantidas.length
                });
                
                // ✅ REMOVER fotos deletadas
                if (fotosModificadas.removidas.length > 0) {
                  console.log('🗑️ [TERMO FORM] Removendo fotos deletadas...');
                  await TermoPhotoUploader.removerFotosEspecificas(
                    termoParaEditar.id,
                    fotosModificadas.removidas
                  );
                }
                
                // ✅ ADICIONAR novas fotos
                const totalAdicionadas = Object.values(fotosModificadas.adicionadas).reduce((total, fotos) => total + fotos.length, 0);
                if (totalAdicionadas > 0) {
                  console.log('📤 [TERMO FORM] Adicionando novas fotos...');
                  const uploadResult = await TermoPhotoUploader.uploadFotosEmLote(
                    fotosModificadas.adicionadas,
                    termoParaEditar.id
                  );
                  
                  if (uploadResult.success) {
                    console.log('✅ [TERMO FORM] Novas fotos salvas:', uploadResult.fotosSalvas);
                    
                    // ✅ Salvar metadados das novas fotos
                    const metadadosResult = await TermoPhotoUploader.salvarMetadadosFotos(
                      termoParaEditar.id,
                      fotosModificadas.adicionadas,
                      uploadResult.resultados
                    );
                    
                    if (metadadosResult.success) {
                      console.log('✅ [TERMO FORM] Metadados das novas fotos salvos');
                    } else {
                      console.error('❌ [TERMO FORM] Erro ao salvar metadados:', metadadosResult.error);
                    }
                  } else {
                    console.error('❌ [TERMO FORM] Erro ao fazer upload das novas fotos:', uploadResult.erros);
                  }
                }
              } else {
                console.log('✅ [TERMO FORM] Nenhuma modificação nas fotos detectada');
              }
            } catch (error) {
              console.error('❌ [TERMO FORM] Erro ao processar fotos:', error);
            }
          } else {
            console.log('✅ [TERMO FORM] Nenhuma foto para processar');
          }
          
          onSalvar?.();
        } else {
          console.error('❌ [TERMO FORM] Erro ao atualizar termo:', result.error);
        }
      } else {
        console.log('🆕 [TERMO FORM] Modo de criação - salvando novo termo');
        
        // ✅ USAR API DE CRIAÇÃO
        const result = await termoManager.salvarTermo(termoData, user);
        
        if (result.success) {
          console.log('✅ [TERMO FORM] Termo salvo com sucesso');

          // Disparar evento para atualizar metas no dashboard
          window.dispatchEvent(new CustomEvent('meta:atualizar'));
          console.log('🔔 [TERMO FORM] Evento meta:atualizar disparado');

          onSalvar?.();
        } else {
          console.error('❌ [TERMO FORM] Erro ao salvar termo:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ [TERMO FORM] Erro ao salvar termo:', error);
    } finally {
      setSalvando(false);
    }
  }, [dadosFormulario, numeroTermo, fotos, onSalvar]);

  // Limpar campos
  const limparCampos = useCallback(() => {
    setDadosFormulario(criarTermoFormDataPadrao(user));
    setFotos({});
    setNumeroTermo('');
    termoManager.limparEstado();
  }, [user]);

  // Ações de não conformidades
  const adicionarNC = useCallback(() => {
    setDadosFormulario(prev => ({
      ...prev,
      nao_conformidades: [...prev.nao_conformidades, { descricao: '', severidade: 'M' }]
    }));
  }, []);

  const removerNC = useCallback((index: number) => {
    setDadosFormulario(prev => ({
      ...prev,
      nao_conformidades: prev.nao_conformidades.filter((_, i) => i !== index)
    }));
  }, []);

  const atualizarNC = useCallback((index: number, campo: string, valor: string) => {
    setDadosFormulario(prev => ({
      ...prev,
      nao_conformidades: prev.nao_conformidades.map((nc, i) => 
        i === index ? { ...nc, [campo]: valor } : nc
      )
    }));
  }, []);

  // Ações de correção
  const adicionarAcao = useCallback(() => {
    setDadosFormulario(prev => ({
      ...prev,
      acoes_correcao: [...prev.acoes_correcao, { descricao: '', prazo: '' }]
    }));
  }, []);

  const removerAcao = useCallback((index: number) => {
    setDadosFormulario(prev => ({
      ...prev,
      acoes_correcao: prev.acoes_correcao.filter((_, i) => i !== index)
    }));
  }, []);

  const atualizarAcao = useCallback((index: number, campo: string, valor: string) => {
    setDadosFormulario(prev => ({
      ...prev,
      acoes_correcao: prev.acoes_correcao.map((acao, i) => 
        i === index ? { ...acao, [campo]: valor } : acao
      )
    }));
  }, []);

  // Ações de liberação
  const atualizarLiberacao = useCallback((updater: (prev: TermoLiberacao) => TermoLiberacao) => {
    setDadosFormulario(prev => ({
      ...prev,
      liberacao: updater(prev.liberacao || {})
    }));
  }, []);

  // Gerar número do termo na inicialização
  useEffect(() => {
    if (!modoEdicao) {
      // Chamar gerarNumeroTermo apenas se estiver definido
      if (typeof gerarNumeroTermo === 'function') {
        gerarNumeroTermo();
      }
    }
  }, [modoEdicao]); // Remover gerarNumeroTermo das dependências para evitar referência circular

  // Carregar fotos existentes se em modo edição
  useEffect(() => {
    if (modoEdicao && termoParaEditar?.id) {
      console.log('📸 [TERMO FORM] useEffect - Carregando fotos para edição:', termoParaEditar.id);
      carregarFotosExistentes(termoParaEditar.id);
    }
  }, [modoEdicao, termoParaEditar?.id, carregarFotosExistentes]);

  return {
    // Estado
    dadosFormulario,
    fotos,
    numeroTermo,
    salvando,
    gpsCarregando,
    gpsObtidoAutomaticamente,
    categoriasLV,
    
    // Ações principais
    setDadosFormulario,
    salvarTermo,
    limparCampos,
    obterLocalizacaoGPS,
    
    // Ações de fotos
    adicionarFoto,
    removerFoto,
    
    // Ações de não conformidades
    adicionarNC,
    removerNC,
    atualizarNC,
    
    // Ações de correção
    adicionarAcao,
    removerAcao,
    atualizarAcao,
    
    // Ações de liberação
    atualizarLiberacao,
    
    // Utilitários
    gerarNumeroTermo,
    carregarFotosExistentes,
    preencherFormularioTeste
  };
}; 