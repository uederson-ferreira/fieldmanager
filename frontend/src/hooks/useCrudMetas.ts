// ===================================================================
// HOOK CUSTOMIZADO - CRUD METAS - ECOFIELD SYSTEM
// Localização: src/hooks/useCrudMetas.ts
// Módulo: Lógica principal do CRUD de metas
// ===================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { metasAPI } from '../lib/metasAPI';
import { unifiedCache } from '../lib/unifiedCache';
import type {
  Meta as MetaType,
  MetaComProgresso,
  DashboardMetas,
  FiltrosMeta,
  MetaAtribuicao
} from '../types/metas';
import type { UserData } from '../types/entities';

// Tipo específico para usuários com perfis
interface UsuarioComPerfil {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfis: { nome: string }[];
}

interface UseCrudMetasProps {
  user: UserData;
}

interface UseCrudMetasReturn {
  // Estados principais
  metas: MetaType[];
  loading: boolean;
  saving: boolean;
  showForm: boolean;
  showDashboard: boolean;
  editId: string | null;

  // Estados para filtros
  filtros: FiltrosMeta;
  searchTerm: string;

  // Estados para estatísticas
  dashboard: DashboardMetas | null;

  // Estados para atribuição individual
  showAtribuicaoModal: boolean;
  metaSelecionada: MetaComProgressoIndividual | null;
  tmasDisponiveis: UsuarioComPerfil[];
  atribuicoesSelecionadas: string[];

  // Estados para filtros de usuários
  filtroUsuario: string;
  filtroPerfil: string;
  perfisDisponiveis: string[];

  // Estado do formulário
  form: Record<string, any>;
  formAtribuicao: {
    meta_quantidade_individual: number;
    responsavel: boolean;
  };

  // Ações principais
  carregarDados: () => Promise<void>;
  openForm: (meta?: MetaComProgresso) => void;
  closeForm: () => void;
  handleSave: (e: React.FormEvent) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleToggleStatus: (id: string, ativa: boolean) => Promise<void>;
  handleCalcularProgresso: (id: string) => Promise<void>;

  // Ações de atribuição
  openAtribuicaoModal: (meta: MetaComProgresso) => void;
  handleAtribuirMeta: () => Promise<void>;
  handleAtribuirATodosTMAs: (metaId: string) => Promise<void>;
  handleSelecionarTodos: () => void;
  handleDesselecionarTodos: () => void;
  handleToggleUsuario: (usuarioId: string) => void;
  openEditarAtribuicao: (meta: MetaType, atribuicao: MetaAtribuicao) => void;
  closeEditarAtribuicao: () => void;
  handleSalvarAtribuicao: () => Promise<void>;
  handleRemoverAtribuicao: (metaId: string, atribuicaoId: string) => Promise<void>;

  // Setters
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosMeta>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setShowDashboard: React.Dispatch<React.SetStateAction<boolean>>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setFiltroUsuario: React.Dispatch<React.SetStateAction<string>>;
  setFiltroPerfil: React.Dispatch<React.SetStateAction<string>>;
  setShowAtribuicaoModal: React.Dispatch<React.SetStateAction<boolean>>;
  setFormAtribuicao: React.Dispatch<React.SetStateAction<{
    meta_quantidade_individual: number;
    responsavel: boolean;
  }>>;

  // Utilitários
  getPercentualColor: (percentual: number) => string;
  getStatusIcon: (status: string) => string;
  metasFiltradas: MetaType[];
  showEditarAtribuicaoModal: boolean;
  atribuicaoEmEdicao: { meta: MetaType; atribuicao: MetaAtribuicao } | null;
  savingAtribuicao: boolean;
}

const buildDefaultForm = (): Record<string, any> => {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    tipo_meta: 'lv',
    titulo: '',
    descricao: '',
    quantidade_meta: 10,
    escopo: 'equipe',
    periodo: 'mensal',
    ano: now.getFullYear(),
    mes: now.getMonth() + 1,
    categoria: '',
    status: 'EM_ANDAMENTO',
    data_inicio: now.toISOString().split('T')[0],
    data_fim: thirtyDaysLater.toISOString().split('T')[0]
  };
};

const buildFormFromMeta = (meta: MetaType | MetaComProgresso): Record<string, any> => {
  const defaults = buildDefaultForm();

  return {
    ...defaults,
    tipo_meta: meta.tipo_meta,
    titulo: (meta as any).titulo ?? meta.descricao ?? defaults.titulo,
    descricao: meta.descricao ?? defaults.descricao,
    quantidade_meta: meta.meta_quantidade ?? defaults.quantidade_meta,
    escopo: meta.escopo ?? defaults.escopo,
    periodo: meta.periodo ?? defaults.periodo,
    ano: meta.ano ?? defaults.ano,
    mes: meta.periodo === 'anual' ? undefined : meta.mes ?? defaults.mes,
    categoria: meta.categoria ?? '',
    status: (meta as any).status ?? defaults.status,
    data_inicio: (meta as any).data_inicio ?? defaults.data_inicio,
    data_fim: (meta as any).data_fim ?? defaults.data_fim
  };
};

export const useCrudMetas = ({ user }: UseCrudMetasProps): UseCrudMetasReturn => {
  // Estados principais
  const [metas, setMetas] = useState<MetaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosMeta>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para estatísticas
  const [dashboard, setDashboard] = useState<DashboardMetas | null>(null);
  
  // Estados para atribuição individual
  const [showAtribuicaoModal, setShowAtribuicaoModal] = useState(false);
  const [metaSelecionada, setMetaSelecionada] = useState<MetaComProgresso | null>(null);
  const [tmasDisponiveis, setTmasDisponiveis] = useState<UsuarioComPerfil[]>([]);
  const [atribuicoesSelecionadas, setAtribuicoesSelecionadas] = useState<string[]>([]);
  
  // Estados para filtros de usuários
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [perfisDisponiveis, setPerfisDisponiveis] = useState<string[]>([]);
  
  // Estado do formulário
  const [form, setForm] = useState<Record<string, any>>(() => buildDefaultForm());
  const [formAtribuicao, setFormAtribuicao] = useState<{
    meta_quantidade_individual: number;
    responsavel: boolean;
  }>({
    meta_quantidade_individual: 0,
    responsavel: true
  });

  const [showEditarAtribuicaoModal, setShowEditarAtribuicaoModal] = useState(false);
  const [atribuicaoEmEdicao, setAtribuicaoEmEdicao] = useState<{ meta: MetaType; atribuicao: MetaAtribuicao } | null>(null);
  const [savingAtribuicao, setSavingAtribuicao] = useState(false);

  // Carregar dados iniciais
  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [metasData, dashboardData, usuariosData] = await Promise.all([
        metasAPI.listarMetas(),
        metasAPI.buscarDashboard(),
        unifiedCache.getCachedData('usuarios_tma', async () => {
          const token = localStorage.getItem('ecofield_auth_token');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/usuarios-tma`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
      ]);
      
      if (metasData.success && metasData.data) {
        setMetas(metasData.data as unknown as MetaType[]);
      }
      if (dashboardData.success && dashboardData.data) {
        setDashboard(dashboardData.data);
      }
      
      // Processar usuários para atribuição
      if (usuariosData) {
        const normalizados = (usuariosData as Record<string, any>[]).map(usuario => {
          const perfisOrigem = usuario.perfis;
          const perfisArray = Array.isArray(perfisOrigem)
            ? perfisOrigem
            : perfisOrigem
              ? [perfisOrigem]
              : [];

          return {
            ...usuario,
            ativo: usuario.ativo !== undefined ? usuario.ativo : true,
            perfis: perfisArray.filter((perfil: Record<string, any> | null | undefined) => !!perfil)
          } as UsuarioComPerfil & Record<string, any>;
        });

        const tmas = normalizados.filter(usuario =>
          usuario.perfis.some(perfil => perfil.nome?.toUpperCase().includes('TMA'))
        );

        setTmasDisponiveis(tmas);

        const perfis = new Set<string>();
        normalizados.forEach(usuario => {
          usuario.perfis.forEach(perfil => {
            if (perfil?.nome) {
              perfis.add(perfil.nome);
            }
          });
        });
        setPerfisDisponiveis(Array.from(perfis));
      }
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Abrir formulário
  const openForm = useCallback(async (meta?: MetaComProgresso) => {
    if (meta) {
      try {
        const resposta = await metasAPI.buscarMeta(meta.id);
        const metaDetalhada = resposta.data ?? meta;
        setForm(buildFormFromMeta(metaDetalhada as MetaType));
        setEditId(metaDetalhada.id);
      } catch (error) {
        console.error('❌ [CRUD METAS] Erro ao carregar meta para edição:', error);
        setForm(buildFormFromMeta(meta));
        setEditId(meta.id);
      }
    } else {
      setForm(buildDefaultForm());
      setEditId(null);
    }
    setShowForm(true);
  }, []);

  // Fechar formulário
  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditId(null);
    setForm(buildDefaultForm());
  }, []);

  // Salvar meta
  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await metasAPI.atualizarMeta(editId, form);
      } else {
        await metasAPI.criarMeta(form as any);
      }
      await carregarDados();
      closeForm();
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao salvar meta:', error);
    } finally {
      setSaving(false);
    }
  }, [editId, form, carregarDados, closeForm]);

  // Excluir meta
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta meta?')) return;
    try {
      await metasAPI.deletarMeta(id);
      await carregarDados();
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao excluir meta:', error);
    }
  }, [carregarDados]);

  // Toggle status
  const handleToggleStatus = useCallback(async (id: string, _ativa: boolean) => {
    try {
      await metasAPI.toggleMeta(id);
      await carregarDados();
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao alterar status:', error);
    }
  }, [carregarDados]);

  // Calcular progresso
  const handleCalcularProgresso = useCallback(async (id: string) => {
    try {
      await metasAPI.calcularProgresso(id);
      await carregarDados();
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao calcular progresso:', error);
    }
  }, [carregarDados]);

  // Abrir modal de atribuição
  const openAtribuicaoModal = useCallback((meta: MetaComProgresso) => {
    const usuarioId = meta.metas_atribuicoes?.[0]?.tma_id;
    const progresso =
      meta.progresso_individual ||
      meta.progresso_metas?.find(item => usuarioId && item.tma_id === usuarioId) ||
      meta.progresso_metas?.[0] ||
      null;

    const selecionada: MetaComProgresso = {
      ...meta,
      progresso_individual: progresso || undefined
    };

    setMetaSelecionada(selecionada);
    setAtribuicoesSelecionadas(meta.metas_atribuicoes?.map(atribuicao => atribuicao.tma_id) || []);
    setShowAtribuicaoModal(true);
  }, []);

  // Atribuir meta
  const handleAtribuirMeta = useCallback(async () => {
    if (!metaSelecionada || atribuicoesSelecionadas.length === 0) return;

    try {
      await metasAPI.atribuirMeta(metaSelecionada.id, atribuicoesSelecionadas, {
        meta_quantidade_individual: metaSelecionada.meta_quantidade
      });
      setShowAtribuicaoModal(false);
      setMetaSelecionada(null);
      setAtribuicoesSelecionadas([]);
      await carregarDados();
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao atribuir meta:', error);
    }
  }, [metaSelecionada, atribuicoesSelecionadas, carregarDados]);

  // Atribuir a todos TMAs
  const handleAtribuirATodosTMAs = useCallback(async (metaId: string) => {
    try {
      const tmaIds = tmasDisponiveis
        .filter(tma => tma.ativo)
        .map(tma => tma.id);

      if (tmaIds.length === 0) return;

      await metasAPI.atribuirMeta(metaId, tmaIds);
      await carregarDados();
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao atribuir a todos TMAs:', error);
    }
  }, [tmasDisponiveis, carregarDados]);

  // Selecionar todos usuários
  const handleSelecionarTodos = useCallback(() => {
    const usuariosFiltrados = tmasDisponiveis.filter(tma => {
      const matchUsuario = !filtroUsuario || 
        tma.nome.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
        tma.email.toLowerCase().includes(filtroUsuario.toLowerCase());
      
      const matchPerfil = !filtroPerfil || 
        tma.perfis.some(perfil => perfil.nome === filtroPerfil);
      
      return matchUsuario && matchPerfil;
    });
    
    setAtribuicoesSelecionadas(usuariosFiltrados.map(tma => tma.id));
  }, [tmasDisponiveis, filtroUsuario, filtroPerfil]);

  // Desselecionar todos usuários
  const handleDesselecionarTodos = useCallback(() => {
    setAtribuicoesSelecionadas([]);
  }, []);

  // Toggle usuário
  const handleToggleUsuario = useCallback((usuarioId: string) => {
    setAtribuicoesSelecionadas(prev => 
      prev.includes(usuarioId)
        ? prev.filter(id => id !== usuarioId)
        : [...prev, usuarioId]
    );
  }, []);

  const openEditarAtribuicao = useCallback((meta: MetaType, atribuicao: MetaAtribuicao) => {
    setAtribuicaoEmEdicao({ meta, atribuicao });
    setFormAtribuicao({
      meta_quantidade_individual:
        atribuicao.meta_quantidade_individual ??
        meta.meta_quantidade ??
        0,
      responsavel: atribuicao.responsavel ?? true
    });
    setShowEditarAtribuicaoModal(true);
  }, []);

  const closeEditarAtribuicao = useCallback(() => {
    setShowEditarAtribuicaoModal(false);
    setAtribuicaoEmEdicao(null);
  }, []);

  const handleSalvarAtribuicao = useCallback(async () => {
    if (!atribuicaoEmEdicao) return;
    setSavingAtribuicao(true);
    try {
      await metasAPI.atribuirMeta(
        atribuicaoEmEdicao.meta.id,
        [atribuicaoEmEdicao.atribuicao.tma_id],
        {
          meta_quantidade_individual: formAtribuicao.meta_quantidade_individual,
          responsavel: formAtribuicao.responsavel
        }
      );
      await carregarDados();
      closeEditarAtribuicao();
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao salvar atribuição:', error);
    } finally {
      setSavingAtribuicao(false);
    }
  }, [atribuicaoEmEdicao, formAtribuicao, carregarDados, closeEditarAtribuicao]);

  const handleRemoverAtribuicao = useCallback(async (metaId: string, atribuicaoId: string) => {
    if (!window.confirm('Deseja realmente remover esta atribuição da meta?')) return;
    try {
      await metasAPI.removerAtribuicao(metaId, atribuicaoId);
      await carregarDados();
      if (
        atribuicaoEmEdicao &&
        atribuicaoEmEdicao.meta.id === metaId &&
        atribuicaoEmEdicao.atribuicao.id === atribuicaoId
      ) {
        closeEditarAtribuicao();
      }
    } catch (error) {
      console.error('❌ [CRUD METAS] Erro ao remover atribuição:', error);
    }
  }, [carregarDados, atribuicaoEmEdicao, closeEditarAtribuicao]);

  // Utilitários
  const getPercentualColor = useCallback((percentual: number) => {
    if (percentual >= 100) return 'text-green-600';
    if (percentual >= 80) return 'text-yellow-600';
    if (percentual >= 50) return 'text-orange-600';
    return 'text-red-600';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'blue';
      case 'alcancada':
        return 'green';
      case 'superada':
        return 'purple';
      case 'nao_alcancada':
        return 'red';
      default:
        return 'gray';
    }
  }, []);

  // Filtrar metas
  const metasFiltradas = metas.filter(meta => {
    const matchSearch = !searchTerm || 
      meta.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meta.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = !filtros.tipo_meta || meta.tipo_meta === filtros.tipo_meta;
    const matchPeriodo = !filtros.periodo || meta.periodo === filtros.periodo;
    const matchStatus = filtros.ativa === undefined || meta.ativa === filtros.ativa;
    
    return matchSearch && matchTipo && matchPeriodo && matchStatus;
  });

  // Carregar dados na inicialização
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    // Estados
    metas,
    loading,
    saving,
    showForm,
    showDashboard,
    editId,
    filtros,
    searchTerm,
    dashboard,
    showAtribuicaoModal,
    metaSelecionada,
    tmasDisponiveis,
    atribuicoesSelecionadas,
    filtroUsuario,
    filtroPerfil,
    perfisDisponiveis,
    form,
    
    // Ações
    carregarDados,
    openForm,
    closeForm,
    handleSave,
    handleDelete,
    handleToggleStatus,
    handleCalcularProgresso,
    openAtribuicaoModal,
    handleAtribuirMeta,
    handleAtribuirATodosTMAs,
    handleSelecionarTodos,
    handleDesselecionarTodos,
    handleToggleUsuario,
    
    // Setters
    setFiltros,
    setSearchTerm,
    setShowDashboard,
    setForm,
    setFiltroUsuario,
    setFiltroPerfil,
    setShowAtribuicaoModal,
    setFormAtribuicao,
    
    // Utilitários
    getPercentualColor,
    getStatusIcon,
    metasFiltradas,
    openEditarAtribuicao,
    closeEditarAtribuicao,
    handleSalvarAtribuicao,
    handleRemoverAtribuicao,
    showEditarAtribuicaoModal,
    atribuicaoEmEdicao,
    formAtribuicao,
    savingAtribuicao
  };
}; 