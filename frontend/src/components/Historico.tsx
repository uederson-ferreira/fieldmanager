// ===================================================================
// COMPONENTE HISTÓRICO - ECOFIELD SYSTEM
// Localização: src/components/Historico.tsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import type { UserData } from '../types/entities';
import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

interface HistoricoProps {
  user: UserData;
  onBack: () => void;
}

interface HistoricoItem {
  id: string;
  tipo: 'termo' | 'lv' | 'rotina' | 'lv_residuos';
  titulo: string;
  descricao: string;
  data_criacao: string;
  status: string;
  local?: string;
  observacoes?: string;
  arquivos?: string[];
}

const Historico: React.FC<HistoricoProps> = ({ user, onBack }) => {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroData, setFiltroData] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'data' | 'tipo'>('data');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Carregar histórico
  const carregarHistorico = async () => {
    setLoading(true);
    try {
      console.log('🔍 [HISTÓRICO] Carregando histórico para usuário:', user.id);
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ [HISTÓRICO] Token de autenticação não encontrado');
        setLoading(false);
        return;
      }
      
      // Buscar histórico via API do backend
      const response = await fetch(`${API_URL}/api/historico/usuario/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [HISTÓRICO] Erro na API:', response.status, errorData);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('✅ [HISTÓRICO] Histórico carregado:', data.historico?.length || 0, 'itens');
      
      setHistorico(data.historico || []);
    } catch (error) {
      console.error('💥 [HISTÓRICO] Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, [user.id]);

  // Filtrar histórico
  const historicoFiltrado = historico.filter(item => {
    // Filtro por tipo
    if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) {
      return false;
    }
    
    // Filtro por status
    if (filtroStatus !== 'todos' && item.status !== filtroStatus) {
      return false;
    }
    
    // Filtro por busca
    if (busca && !item.titulo.toLowerCase().includes(busca.toLowerCase()) && 
        !item.descricao.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Ordenar histórico
  const historicoOrdenado = [...historicoFiltrado].sort((a, b) => {
    if (ordenacao === 'data') {
      return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
    } else {
      return a.tipo.localeCompare(b.tipo);
    }
  });

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'termo':
        return '📄';
      case 'lv':
        return '✅';
      case 'lv_residuos':
        return '♻️';
      case 'rotina':
        return '🔄';
      default:
        return '📋';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'termo':
        return 'bg-blue-100 text-blue-800';
      case 'lv':
        return 'bg-green-100 text-green-800';
      case 'lv_residuos':
        return 'bg-yellow-100 text-yellow-800';
      case 'rotina':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluída':
      case 'emitido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'corrigido':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando histórico...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
              <p className="text-gray-600">Atividades e documentos do usuário</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="termo">Termos</option>
                <option value="lv">LVs</option>
                <option value="lv_residuos">LVs Resíduos</option>
                <option value="rotina">Rotinas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="Concluída">Concluída</option>
                <option value="Emitido">Emitido</option>
                <option value="Pendente">Pendente</option>
                <option value="Corrigido">Corrigido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar</label>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as 'data' | 'tipo')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="data">Por Data</option>
                <option value="tipo">Por Tipo</option>
              </select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {historico.filter(item => item.tipo === 'termo').length}
              </div>
              <div className="text-sm text-blue-600">Termos</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {historico.filter(item => item.tipo === 'lv').length}
              </div>
              <div className="text-sm text-green-600">LVs</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {historico.filter(item => item.tipo === 'lv_residuos').length}
              </div>
              <div className="text-sm text-yellow-600">LVs Resíduos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {historico.filter(item => item.tipo === 'rotina').length}
              </div>
              <div className="text-sm text-purple-600">Rotinas</div>
            </div>
          </div>
        </div>

        {/* Lista de Histórico */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {historicoOrdenado.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-600">Não há histórico para exibir com os filtros atuais.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historicoOrdenado.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTipoIcon(item.tipo)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.titulo}</h3>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTipoColor(item.tipo)}`}>
                            {item.tipo.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatarData(item.data_criacao)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedItems.has(item.id) ? '▼' : '▶'}
                    </button>
                  </div>

                  {expandedItems.has(item.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {item.local && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Local:</span>
                          <span className="ml-2 text-gray-600">{item.local}</span>
                        </div>
                      )}
                      {item.observacoes && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Observações:</span>
                          <span className="ml-2 text-gray-600">{item.observacoes}</span>
                        </div>
                      )}
                      {item.arquivos && item.arquivos.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Arquivos:</span>
                          <div className="mt-1 space-y-1">
                            {item.arquivos.map((arquivo, index) => (
                              <div key={index} className="text-sm text-blue-600 hover:text-blue-800">
                                📎 {arquivo}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historico; 