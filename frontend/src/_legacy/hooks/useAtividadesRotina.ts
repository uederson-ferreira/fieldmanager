import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { unifiedCache } from '../lib/unifiedCache';
import { rotinasAPI } from '../lib/rotinasAPI';
import { areasAPI } from '../lib/areasAPI';
import { encarregadosAPI } from '../lib/encarregadosAPI';
import { empresasAPI } from '../lib/empresasAPI';
import { syncEncarregadosOffline, AtividadeRotinaManager } from '../lib/offline';
import { getCurrentDateLocal } from '../utils/dateUtils';
import type {
  Area,
  EmpresaContratada,
  AtividadeRotina,
  Encarregado,
} from '../types';
import type { UserData } from '../types/entities';

interface UseAtividadesRotinaReturn {
  // Estados principais
  viewMode: 'list' | 'form';
  atividades: AtividadeRotina[];
  areas: Area[];
  encarregados: Encarregado[];
  empresas: EmpresaContratada[];
  loading: boolean;
  saving: boolean;
  searchTerm: string;
  statusFilter: string;
  editingId: string | null;
  rotinasOfflineCount: number;
  isOnline: boolean;

  // Estados de formulário
  formData: {
    data_atividade: string;
    hora_inicio: string;
    hora_fim: string;
    area_id: string;
    atividade: string;
    descricao: string;
    km_percorrido: string;
    tma_responsavel_id: string;
    encarregado_id: string;
    empresa_contratada_id: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    foto: File | string | null;
  };

  // Estados de modais
  showAreaModal: boolean;
  showEncarregadoModal: boolean;
  showEmpresaModal: boolean;
  showStatusModal: boolean;
  areaForm: { nome: string; descricao: string };
  encarregadoForm: { nome: string; telefone: string; empresa: string };
  empresaForm: { nome: string; cnpj: string; telefone: string };
  statusForm: { status: string };

  // Ações principais
  setViewMode: (mode: 'list' | 'form') => void;
  handleInputChange: (field: string, value: string | File | null) => void;
  resetForm: () => void;
  handleEdit: (atividade: AtividadeRotina) => Promise<void>;
  handleSave: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  shareViaWhatsApp: (atividade: AtividadeRotina) => Promise<void>;
  handleDownloadData: () => Promise<void>;

  // Ações de modais
  openModal: (modalType: 'area' | 'encarregado' | 'empresa' | 'status') => void;
  closeModal: (modalType: 'area' | 'encarregado' | 'empresa' | 'status') => void;
  handleSaveArea: () => Promise<void>;
  handleSaveEncarregado: () => Promise<void>;
  handleSaveEmpresa: () => Promise<void>;
  handleSaveStatus: () => void;
  handleAreaFormChange: (field: string, value: string) => void;
  handleEncarregadoFormChange: (field: string, value: string) => void;
  handleEmpresaFormChange: (field: string, value: string) => void;
  handleStatusFormChange: (field: string, value: string) => void;

  // Ações de filtros
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
}

const initialFormData = {
  data_atividade: getCurrentDateLocal(),
  hora_inicio: "",
  hora_fim: "",
  area_id: "",
  atividade: "",
  descricao: "",
  km_percorrido: "",
  tma_responsavel_id: "",
  status: "Planejada" as string,
  latitude: null as number | null,
  longitude: null as number | null,
  foto: null as File | string | null,
};

export const useAtividadesRotina = (user: UserData): UseAtividadesRotinaReturn => {
  // Hook para funcionalidade offline
  const isOnline = useOnlineStatus();

  // Estados principais
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [atividades, setAtividades] = useState<AtividadeRotina[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [encarregados, setEncarregados] = useState<Encarregado[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaContratada[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rotinasOfflineCount, setRotinasOfflineCount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    ...initialFormData,
    tma_responsavel_id: user.id,
    encarregado_id: "",
    empresa_contratada_id: "",
  });

  // Estados para modais de cadastro
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showEncarregadoModal, setShowEncarregadoModal] = useState(false);
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Estados para formulários dos modais
  const [areaForm, setAreaForm] = useState({ nome: "", descricao: "" });
  const [encarregadoForm, setEncarregadoForm] = useState({ nome: "", telefone: "", empresa: "" });
  const [empresaForm, setEmpresaForm] = useState({ nome: "", cnpj: "", telefone: "" });
  const [statusForm, setStatusForm] = useState({ status: "" });

  // Atualizar contador de rotinas offline
  const updateRotinasOfflineCount = useCallback(async () => {
    try {
      const count = await AtividadeRotinaManager.countPendentes();
      setRotinasOfflineCount(count);
      console.log(`📊 [ATIVIDADES ROTINA] Rotinas offline pendentes: ${count}`);
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao contar rotinas offline:', error);
      setRotinasOfflineCount(0);
    }
  }, []);

  // Inicializar dados
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        console.log('🔄 [ATIVIDADES ROTINA] Inicializando dados...');
        // Carregar dados usando unifiedCache (online/offline automático)
        const [areasResult, encarregadosResult, empresasResult] = await Promise.all([
          unifiedCache.getCachedData('areas', areasAPI.getAreas),
          unifiedCache.getCachedData('encarregados', encarregadosAPI.getEncarregados),
          unifiedCache.getCachedData('empresas_contratadas', empresasAPI.getEmpresas)
        ]);
        
        // Carregar rotinas diretamente (para incluir offline)
        const rotinasResult = await rotinasAPI.list();

        console.log('📊 [ATIVIDADES ROTINA] Dados recebidos via unifiedCache:', {
          areas: areasResult || [],
          encarregados: encarregadosResult || [],
          empresas: empresasResult || [],
          rotinas: rotinasResult
        });
        
        // Log detalhado da origem dos dados (online vs offline)
        console.log('🌐 [ATIVIDADES ROTINA] Origem dos dados:', {
          areas: Array.isArray(areasResult) ? `${areasResult.length} áreas` : '0 áreas',
          encarregados: Array.isArray(encarregadosResult) ? `${encarregadosResult.length} encarregados` : '0 encarregados',
          empresas: Array.isArray(empresasResult) ? `${empresasResult.length} empresas` : '0 empresas'
        });

        setAreas(Array.isArray(areasResult) ? areasResult as any : []);
        setEncarregados(Array.isArray(encarregadosResult) ? encarregadosResult as any : []);
        setEmpresas(Array.isArray(empresasResult) ? empresasResult as any : []);
        
        // Debug detalhado das rotinas
        console.log('🔍 [ATIVIDADES ROTINA] Debug das rotinas recebidas:', {
          rotinasResult,
          success: rotinasResult.success,
          isArray: Array.isArray(rotinasResult.data),
          dataLength: rotinasResult.data?.length || 0,
          data: rotinasResult.data
        });
        
        const rotinasParaSetar = rotinasResult.success && Array.isArray(rotinasResult.data) ? rotinasResult.data as any : [];
        console.log('🔍 [ATIVIDADES ROTINA] Rotinas que serão setadas:', rotinasParaSetar.length);
        
        setAtividades(rotinasParaSetar);
        
        console.log('✅ [ATIVIDADES ROTINA] Dados inicializados com sucesso');
      } catch (error) {
        console.error('❌ [ATIVIDADES ROTINA] Erro ao inicializar dados:', error);
        // Garantir que sempre seja array mesmo em caso de erro
        setAreas([]);
        setEncarregados([]);
        setEmpresas([]);
        setAtividades([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Sincronizar quando voltar online
  useEffect(() => {
    const handleOnline = async () => {
      if (isOnline) {
        try {
          console.log('🔄 [ATIVIDADES ROTINA] Voltou online, sincronizando dados...');
          
          // Sincronizar todas as entidades offline
          await Promise.all([
            syncEncarregadosOffline(),
            // TODO: Implementar syncAreasOffline() e syncEmpresasOffline() quando necessário
          ]);
          
          // Recarregar dados via unifiedCache para garantir dados atualizados
          const [areasResult, encarregadosResult, empresasResult] = await Promise.all([
            unifiedCache.getCachedData('areas', areasAPI.getAreas),
            unifiedCache.getCachedData('encarregados', encarregadosAPI.getEncarregados),
            unifiedCache.getCachedData('empresas_contratadas', empresasAPI.getEmpresas)
          ]);
          
          // Carregar rotinas diretamente (para incluir offline)
          const rotinasResult = await rotinasAPI.list();
          
          // Atualizar estados com dados sincronizados
          setAreas(Array.isArray(areasResult) ? areasResult as any : []);
          setEncarregados(Array.isArray(encarregadosResult) ? encarregadosResult as any : []);
          setEmpresas(Array.isArray(empresasResult) ? empresasResult as any : []);
          setAtividades(rotinasResult.success && Array.isArray(rotinasResult.data) ? rotinasResult.data as any : []);
          
          console.log('✅ [ATIVIDADES ROTINA] Sincronização online concluída');
        } catch (error) {
          console.error('❌ [ATIVIDADES ROTINA] Erro ao sincronizar:', error);
          // Manter dados offline em caso de erro
        }
      }
    };

    handleOnline();
  }, [isOnline]);

  // Atualizar contador de rotinas offline ao inicializar e quando houver mudanças
  useEffect(() => {
    updateRotinasOfflineCount();
  }, [updateRotinasOfflineCount, atividades]);

  // Atualizar contador quando voltar online para detectar sincronização
  useEffect(() => {
    if (isOnline) {
      // Aguardar um pouco para a sincronização acontecer
      const timer = setTimeout(() => {
        updateRotinasOfflineCount();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, updateRotinasOfflineCount]);

  // Escutar evento de sincronização de rotinas
  useEffect(() => {
    const handleRotinaSincronizada = () => {
      console.log('🔄 [ATIVIDADES ROTINA] Evento de sincronização detectado, recarregando dados...');
      // Recarregar dados após sincronização
      const recarregarDados = async () => {
        try {
          const rotinasResult = await rotinasAPI.list();
          setAtividades(rotinasResult.success && Array.isArray(rotinasResult.data) ? rotinasResult.data as any : []);
          await updateRotinasOfflineCount();
        } catch (error) {
          console.error('❌ [ATIVIDADES ROTINA] Erro ao recarregar após sincronização:', error);
        }
      };
      recarregarDados();
    };

    window.addEventListener('rotinaSincronizada', handleRotinaSincronizada);
    
    return () => {
      window.removeEventListener('rotinaSincronizada', handleRotinaSincronizada);
    };
  }, [updateRotinasOfflineCount]);

  // Ações principais
  const handleInputChange = useCallback((field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      ...initialFormData,
      tma_responsavel_id: user.id,
      encarregado_id: "",
      empresa_contratada_id: "",
    });
    setEditingId(null);
    setViewMode('list');
  }, [user.id]);

  const handleEdit = useCallback(async (atividade: AtividadeRotina) => {
    try {
      console.log('🔄 [ATIVIDADES ROTINA] Iniciando edição da atividade:', atividade.id);
      
      // Carregar foto da atividade se existir
      let fotoUrl = null;
      if (atividade.id) {
        try {
          const token = localStorage.getItem('ecofield_auth_token');
          console.log('🔑 [ATIVIDADES ROTINA] Token encontrado:', token ? 'SIM' : 'NÃO');
          
          const url = `${import.meta.env.VITE_API_URL}/api/rotinas/${atividade.id}/fotos`;
          console.log('📡 [ATIVIDADES ROTINA] Buscando fotos em:', url);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('📸 [ATIVIDADES ROTINA] Response status:', response.status);
          
          if (response.ok) {
            const fotos = await response.json();
            console.log('📸 [ATIVIDADES ROTINA] Fotos recebidas:', fotos);
            
            if (fotos && fotos.length > 0) {
              fotoUrl = fotos[0].url_arquivo;
              console.log('✅ [ATIVIDADES ROTINA] Foto carregada para edição:', fotoUrl);
            } else {
              console.log('⚠️ [ATIVIDADES ROTINA] Nenhuma foto encontrada para esta atividade');
            }
          } else {
            const errorText = await response.text();
            console.error('❌ [ATIVIDADES ROTINA] Erro HTTP ao carregar fotos:', response.status, errorText);
          }
        } catch (error) {
          console.error('❌ [ATIVIDADES ROTINA] Erro ao carregar foto:', error);
        }
      }

      const formDataToSet = {
        data_atividade: atividade.data_atividade,
        hora_inicio: atividade.hora_inicio || "",
        hora_fim: atividade.hora_fim || "",
        area_id: atividade.area_id || "",
        atividade: atividade.atividade,
        descricao: atividade.descricao || "",
        km_percorrido: atividade.km_percorrido?.toString() || "",
        tma_responsavel_id: atividade.tma_responsavel_id,
        encarregado_id: atividade.encarregado_id || "",
        empresa_contratada_id: atividade.empresa_contratada_id || "",
        status: atividade.status,
        latitude: atividade.latitude || null,
        longitude: atividade.longitude || null,
        foto: fotoUrl,
      };
      
      console.log('📋 [ATIVIDADES ROTINA] FormData sendo definido:', formDataToSet);
      console.log('📸 [ATIVIDADES ROTINA] Foto no formData:', fotoUrl);
      
      setFormData(formDataToSet);
      setEditingId(atividade.id);
      setViewMode('form');
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao editar atividade:', error);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      console.log('🔄 [ATIVIDADES ROTINA] Salvando atividade...');
      
      // Importar o saver
      const { AtividadeRotinaSaver } = await import('../utils/AtividadeRotinaSaver');
      
      // Preparar dados do formulário
      const dadosFormulario = {
        data_atividade: formData.data_atividade,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        area_id: formData.area_id,
        atividade: formData.atividade,
        descricao: formData.descricao,
        km_percorrido: formData.km_percorrido,
        tma_responsavel_id: formData.tma_responsavel_id,
        encarregado_id: formData.encarregado_id,
        empresa_contratada_id: formData.empresa_contratada_id,
        status: formData.status,
        latitude: formData.latitude,
        longitude: formData.longitude,
        foto: formData.foto
      };
      
      // Salvar atividade
      const resultado = await AtividadeRotinaSaver.salvarAtividade(dadosFormulario, user);
      
      if (resultado.success) {
        console.log('✅ [ATIVIDADES ROTINA] Atividade salva com sucesso:', resultado.atividadeId);
        
        // Recarregar dados
        const rotinasResult = await rotinasAPI.list();
        setAtividades(rotinasResult.success && Array.isArray(rotinasResult.data) ? rotinasResult.data as any : []);
        
        // Atualizar contador de rotinas offline após salvamento
        await updateRotinasOfflineCount();
        
        // Resetar formulário e voltar para lista
        resetForm();
        setViewMode('list');
      } else {
        console.error('❌ [ATIVIDADES ROTINA] Erro ao salvar:', resultado.error);
        alert(`Erro ao salvar atividade: ${resultado.error}`);
      }
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao salvar:', error);
      alert(`Erro ao salvar atividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  }, [formData, user, resetForm]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta atividade?')) return;
    
    try {
      console.log('🗑️ [ATIVIDADES ROTINA] Excluindo atividade:', id);
      
      // Excluir via API
      const resultado = await rotinasAPI.delete(id);
      
      if (resultado.success) {
        console.log('✅ [ATIVIDADES ROTINA] Atividade excluída com sucesso');
        
        // Recarregar lista após excluir
        const rotinasResult = await rotinasAPI.list();
        setAtividades(rotinasResult.success && Array.isArray(rotinasResult.data) ? rotinasResult.data as any : []);
        
        alert('Atividade excluída com sucesso!');
      } else {
        console.error('❌ [ATIVIDADES ROTINA] Erro ao excluir:', resultado.error);
        alert(`Erro ao excluir atividade: ${resultado.error}`);
      }
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao excluir:', error);
      alert(`Erro ao excluir atividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, []);

  const shareViaWhatsApp = useCallback(async (atividade: AtividadeRotina) => {
    try {
      console.log('🔄 [ATIVIDADES ROTINA] Compartilhando via WhatsApp...');
      
      // Importar o WhatsAppSharer
      const { WhatsAppSharer } = await import('../utils/WhatsAppSharer');
      
      // Formatar informações da atividade
      const dataFormatada = new Intl.DateTimeFormat('pt-BR').format(new Date(atividade.data_atividade));
      const horaInicio = atividade.hora_inicio ? ` às ${atividade.hora_inicio}` : '';
      const horaFim = atividade.hora_fim ? ` até ${atividade.hora_fim}` : '';
      
      // Buscar nomes das entidades relacionadas
      const area = areas.find(a => a.id === atividade.area_id);
      const encarregado = encarregados.find(e => e.id === atividade.encarregado_id);
      const empresa = empresas.find(e => e.id === atividade.empresa_contratada_id);
      
      // Criar mensagem
      const mensagem = `*ECOFIELD - Atividade de Rotina*

*Atividade:* ${atividade.atividade}
*Data:* ${dataFormatada}${horaInicio}${horaFim}
*Area:* ${area?.nome || 'Nao informado'}
*Encarregado:* ${encarregado?.nome_completo || encarregado?.apelido || 'Nao informado'}
*Empresa:* ${empresa?.nome || 'Nao informado'}
*Status:* ${atividade.status}

${atividade.descricao ? `*Descricao:*\n${atividade.descricao}\n\n` : ''}${atividade.km_percorrido ? `*KM Percorrido:* ${atividade.km_percorrido} km\n\n` : ''}---
*Sistema EcoField - Gestao*
Data de geracao: ${new Intl.DateTimeFormat('pt-BR', { 
  day: '2-digit', 
  month: '2-digit', 
  year: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
}).format(new Date())}`;

      // Compartilhar via WhatsApp
      const sucesso = await WhatsAppSharer.share({
        title: 'Atividade de Rotina - EcoField',
        text: mensagem
      });

      if (sucesso) {
        console.log('✅ [ATIVIDADES ROTINA] Compartilhamento realizado com sucesso');
      } else {
        console.log('⚠️ [ATIVIDADES ROTINA] Compartilhamento cancelado pelo usuário');
      }
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao compartilhar:', error);
      alert('Erro ao compartilhar atividade via WhatsApp. Tente novamente.');
    }
  }, [areas, encarregados, empresas]);

  const handleDownloadData = useCallback(async () => {
    try {
      // Implementar lógica de download
      console.log('🔄 [ATIVIDADES ROTINA] Baixando dados...');
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao baixar dados:', error);
    }
  }, []);

  // Ações de modais
  const openModal = useCallback((modalType: 'area' | 'encarregado' | 'empresa' | 'status') => {
    switch (modalType) {
      case 'area':
        setShowAreaModal(true);
        break;
      case 'encarregado':
        setShowEncarregadoModal(true);
        break;
      case 'empresa':
        setShowEmpresaModal(true);
        break;
      case 'status':
        setShowStatusModal(true);
        break;
    }
  }, []);

  const closeModal = useCallback((modalType: 'area' | 'encarregado' | 'empresa' | 'status') => {
    switch (modalType) {
      case 'area':
        setShowAreaModal(false);
        setAreaForm({ nome: "", descricao: "" });
        break;
      case 'encarregado':
        setShowEncarregadoModal(false);
        setEncarregadoForm({ nome: "", telefone: "", empresa: "" });
        break;
      case 'empresa':
        setShowEmpresaModal(false);
        setEmpresaForm({ nome: "", cnpj: "", telefone: "" });
        break;
      case 'status':
        setShowStatusModal(false);
        setStatusForm({ status: "" });
        break;
    }
  }, []);

  const handleSaveArea = useCallback(async () => {
    try {
      console.log('🔄 [ATIVIDADES ROTINA] Salvando área...', areaForm);
      
      // Validação básica
      if (!areaForm.nome.trim()) {
        alert('Nome da área é obrigatório');
        return;
      }
      
      // Preparar dados para API
      const dadosArea = {
        nome: areaForm.nome.trim(),
        descricao: areaForm.descricao.trim() || undefined,
        auth_user_id: user.id
      };
      
      // Salvar via API
      const novaArea = await areasAPI.createArea(dadosArea);
      
      if (novaArea) {
        console.log('✅ [ATIVIDADES ROTINA] Área criada com sucesso:', novaArea.id);
        
        // Atualizar cache
        await unifiedCache.refreshCache('areas');
        
        // Recarregar áreas localmente
        const areasAtualizadas = await unifiedCache.getCachedData('areas', areasAPI.getAreas);
        setAreas(Array.isArray(areasAtualizadas) ? areasAtualizadas as any : []);
        
        // Fechar modal e limpar formulário
        closeModal('area');
        
        alert('Área criada com sucesso!');
      } else {
        alert('Erro ao criar área. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao salvar área:', error);
      alert(`Erro ao salvar área: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [areaForm, user.id, closeModal]);

  const handleSaveEncarregado = useCallback(async () => {
    try {
      console.log('🔄 [ATIVIDADES ROTINA] Salvando encarregado...', encarregadoForm);
      
      // Validação básica
      if (!encarregadoForm.nome.trim()) {
        alert('Nome do encarregado é obrigatório');
        return;
      }
      
      if (!encarregadoForm.telefone.trim()) {
        alert('Telefone do encarregado é obrigatório');
        return;
      }
      
      // Preparar dados para API
      const dadosEncarregado = {
        nome_completo: encarregadoForm.nome.trim(),
        apelido: encarregadoForm.nome.trim().split(' ')[0], // Primeiro nome como apelido
        telefone: encarregadoForm.telefone.trim(),
        empresa: encarregadoForm.empresa.trim() || undefined,
        ativo: true,
        auth_user_id: user.id
      };
      
      // Salvar via API
      const novoEncarregado = await encarregadosAPI.createEncarregado(dadosEncarregado);
      
      if (novoEncarregado) {
        console.log('✅ [ATIVIDADES ROTINA] Encarregado criado com sucesso:', novoEncarregado.id);
        
        // Atualizar cache
        await unifiedCache.refreshCache('encarregados');
        
        // Recarregar encarregados localmente
        const encarregadosAtualizados = await unifiedCache.getCachedData('encarregados', encarregadosAPI.getEncarregados);
        setEncarregados(Array.isArray(encarregadosAtualizados) ? encarregadosAtualizados as any : []);
        
        // Fechar modal e limpar formulário
        closeModal('encarregado');
        
        alert('Encarregado criado com sucesso!');
      } else {
        alert('Erro ao criar encarregado. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao salvar encarregado:', error);
      alert(`Erro ao salvar encarregado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [encarregadoForm, user.id, closeModal]);

  const handleSaveEmpresa = useCallback(async () => {
    try {
      console.log('🔄 [ATIVIDADES ROTINA] Salvando empresa...', empresaForm);
      
      // Validação básica
      if (!empresaForm.nome.trim()) {
        alert('Nome da empresa é obrigatório');
        return;
      }
      
      // Preparar dados para API
      const dadosEmpresa = {
        nome: empresaForm.nome.trim(),
        cnpj: empresaForm.cnpj.trim() || '',
        telefone: empresaForm.telefone.trim() || undefined,
        ativa: true
      };
      
      // Salvar via API
      const novaEmpresa = await empresasAPI.criarEmpresa(dadosEmpresa);
      
      if (novaEmpresa) {
        console.log('✅ [ATIVIDADES ROTINA] Empresa criada com sucesso:', novaEmpresa.id);
        
        // Atualizar cache
        await unifiedCache.refreshCache('empresas_contratadas');
        
        // Recarregar empresas localmente
        const empresasAtualizadas = await unifiedCache.getCachedData('empresas_contratadas', empresasAPI.getEmpresas);
        setEmpresas(Array.isArray(empresasAtualizadas) ? empresasAtualizadas as any : []);
        
        // Fechar modal e limpar formulário
        closeModal('empresa');
        
        alert('Empresa criada com sucesso!');
      } else {
        alert('Erro ao criar empresa. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao salvar empresa:', error);
      alert(`Erro ao salvar empresa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [empresaForm, closeModal]);

  const handleSaveStatus = useCallback(() => {
    try {
      console.log('🔄 [ATIVIDADES ROTINA] Salvando status...', statusForm);
      
      // Status é apenas um gerenciamento local, não precisa persistir no backend
      // Apenas fecha o modal
      closeModal('status');
      
      console.log('✅ [ATIVIDADES ROTINA] Status atualizado');
    } catch (error) {
      console.error('❌ [ATIVIDADES ROTINA] Erro ao salvar status:', error);
    }
  }, [statusForm, closeModal]);

  // Handlers para atualização dos formulários dos modais
  const handleAreaFormChange = useCallback((field: string, value: string) => {
    setAreaForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEncarregadoFormChange = useCallback((field: string, value: string) => {
    setEncarregadoForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEmpresaFormChange = useCallback((field: string, value: string) => {
    setEmpresaForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleStatusFormChange = useCallback((field: string, value: string) => {
    setStatusForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    // Estados principais
    viewMode,
    atividades,
    areas,
    encarregados,
    empresas,
    loading,
    saving,
    rotinasOfflineCount,
    searchTerm,
    statusFilter,
    editingId,
    isOnline,

    // Estados de formulário
    formData,

    // Estados de modais
    showAreaModal,
    showEncarregadoModal,
    showEmpresaModal,
    showStatusModal,
    areaForm,
    encarregadoForm,
    empresaForm,
    statusForm,

    // Ações principais
    setViewMode,
    handleInputChange,
    resetForm,
    handleEdit,
    handleSave,
    handleDelete,
    shareViaWhatsApp,
    handleDownloadData,

    // Ações de modais
    openModal,
    closeModal,
    handleSaveArea,
    handleSaveEncarregado,
    handleSaveEmpresa,
    handleSaveStatus,
    handleAreaFormChange,
    handleEncarregadoFormChange,
    handleEmpresaFormChange,
    handleStatusFormChange,

    // Ações de filtros
    setSearchTerm,
    setStatusFilter,
  };
}; 