// ===================================================================
// ADMIN ROTINAS COMPLETO - CRUD COMPLETO COM FUNCIONALIDADES TMA
// Localização: src/components/admin/AdminRotinasCompleto.tsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, FileText, 
  Save, X, Camera, MapPin, User, Calendar,
  CheckCircle, AlertCircle, Clock, Download,
  Play, Pause, Square, Activity
} from 'lucide-react';

import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { unifiedCache } from '../../lib/unifiedCache';
import type { AtividadeRotina } from '../../types';
import type { UserData } from '../../types/entities';

interface AdminRotinasCompletoProps {
  user: UserData;
}

const AdminRotinasCompleto: React.FC<AdminRotinasCompletoProps> = ({ user }) => {
  const isOnline = useOnlineStatus();
  const [rotinas, setRotinas] = useState<AtividadeRotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRotina, setEditingRotina] = useState<AtividadeRotina | null>(null);
  const [showDetails, setShowDetails] = useState<AtividadeRotina | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    data_atividade: '',
    hora_inicio: '',
    hora_fim: '',
    area_id: '',
    atividade: '',
    descricao: '',
    km_percorrido: '',
    tma_responsavel_id: user.id,
    encarregado_id: '',
    empresa_contratada_id: '',
    status: 'pendente',
    latitude: null as number | null,
    longitude: null as number | null
  });

  // Carregar Rotinas
  useEffect(() => {
    carregarRotinas();
  }, []);

  const carregarRotinas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rotinasData = await unifiedCache.getCachedData<AtividadeRotina[]>(
        'rotinas',
        async () => {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rotinas`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          return result.rotinas || [];
        }
      );
      
      setRotinas(rotinasData);
      
      if (!isOnline && rotinasData.length === 0) {
        setError('Modo offline: Nenhum dado em cache disponível');
      }
    } catch (error) {
      console.error('Erro ao carregar rotinas:', error);
      setError('Erro ao carregar rotinas: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRotina) {
        // Atualizar rotina existente
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rotinas/atualizar-rotina/${editingRotina.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
      } else {
        // Criar nova rotina
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rotinas/criar-rotina`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
      }

      await carregarRotinas();
      closeForm();
    } catch (error) {
      console.error('Erro ao salvar rotina:', error);
      alert('Erro ao salvar rotina: ' + (error as Error).message);
    }
  };

  const handleDelete = async (rotina: AtividadeRotina) => {
    if (!window.confirm(`Deseja realmente excluir a rotina ${rotina.atividade}?`)) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rotinas/deletar-rotina/${rotina.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      await carregarRotinas();
    } catch (error) {
      console.error('Erro ao deletar rotina:', error);
      alert('Erro ao deletar rotina: ' + (error as Error).message);
    }
  };

  const openForm = (rotina?: AtividadeRotina) => {
    if (rotina) {
      setEditingRotina(rotina);
      setFormData({
        data_atividade: rotina.data_atividade,
        hora_inicio: rotina.hora_inicio || '',
        hora_fim: rotina.hora_fim || '',
        area_id: rotina.area_id || '',
        atividade: rotina.atividade,
        descricao: rotina.descricao || '',
        km_percorrido: rotina.km_percorrido?.toString() || '',
        tma_responsavel_id: rotina.tma_responsavel_id,
        encarregado_id: rotina.encarregado_id || '',
        empresa_contratada_id: rotina.empresa_contratada_id || '',
        status: rotina.status,
        latitude: rotina.latitude || null,
        longitude: rotina.longitude || null
      });
    } else {
      setEditingRotina(null);
      setFormData({
        data_atividade: '',
        hora_inicio: '',
        hora_fim: '',
        area_id: '',
        atividade: '',
        descricao: '',
        km_percorrido: '',
        tma_responsavel_id: user.id,
        encarregado_id: '',
        empresa_contratada_id: '',
        status: 'pendente',
        latitude: null,
        longitude: null
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRotina(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'em_andamento':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pausada':
        return <Pause className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'pausada':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'em_andamento':
        return 'Em Andamento';
      case 'pendente':
        return 'Pendente';
      case 'pausada':
        return 'Pausada';
      default:
        return status;
    }
  };

  const filteredRotinas = rotinas.filter(rotina => {
    const matchesSearch = rotina.atividade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rotina.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rotina.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Rotinas</h1>
          <p className="text-gray-600">Atividades de Rotina - CRUD Completo</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Rotina</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por atividade ou descrição..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="pausada">Pausada</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Lista de Rotinas */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atividade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TMA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRotinas.map((rotina) => (
                  <tr key={rotina.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {rotina.atividade}
                          </span>
                          {rotina.descricao && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {rotina.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(rotina.data_atividade).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rotina.hora_inicio && rotina.hora_fim ? (
                        `${rotina.hora_inicio} - ${rotina.hora_fim}`
                      ) : (
                        rotina.hora_inicio || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rotina.status)}`}>
                        {getStatusIcon(rotina.status)}
                        <span className="ml-1">{getStatusText(rotina.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        {rotina.tma_responsavel_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {rotina.area_id || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowDetails(rotina)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openForm(rotina)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rotina)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRotinas.length === 0 && !loading && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma rotina encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRotina ? 'Editar Rotina' : 'Nova Rotina'}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atividade
                  </label>
                  <input
                    type="text"
                    value={formData.atividade}
                    onChange={(e) => setFormData(prev => ({ ...prev, atividade: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Descrição detalhada da atividade..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Atividade
                    </label>
                    <input
                      type="date"
                      value={formData.data_atividade}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_atividade: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="pausada">Pausada</option>
                      <option value="concluida">Concluída</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Início
                    </label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, hora_inicio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora de Fim
                    </label>
                    <input
                      type="time"
                      value={formData.hora_fim}
                      onChange={(e) => setFormData(prev => ({ ...prev, hora_fim: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área
                    </label>
                    <input
                      type="text"
                      value={formData.area_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, area_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KM Percorrido
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.km_percorrido}
                      onChange={(e) => setFormData(prev => ({ ...prev, km_percorrido: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Encarregado
                    </label>
                    <input
                      type="text"
                      value={formData.encarregado_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, encarregado_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa Contratada
                    </label>
                    <input
                      type="text"
                      value={formData.empresa_contratada_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, empresa_contratada_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: -23.5505"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: -46.6333"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingRotina ? 'Atualizar' : 'Criar'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalhes da Rotina
                </h2>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Atividade</dt>
                      <dd className="text-sm text-gray-900">{showDetails.atividade}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(showDetails.data_atividade).toLocaleDateString('pt-BR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(showDetails.status)}`}>
                          {getStatusIcon(showDetails.status)}
                          <span className="ml-1">{getStatusText(showDetails.status)}</span>
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">TMA Responsável</dt>
                      <dd className="text-sm text-gray-900">{showDetails.tma_responsavel_id}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Horário</dt>
                      <dd className="text-sm text-gray-900">
                        {showDetails.hora_inicio && showDetails.hora_fim ? (
                          `${showDetails.hora_inicio} - ${showDetails.hora_fim}`
                        ) : (
                          showDetails.hora_inicio || 'Não definido'
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Área</dt>
                      <dd className="text-sm text-gray-900">{showDetails.area_id || 'Não definida'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">KM Percorrido</dt>
                      <dd className="text-sm text-gray-900">{showDetails.km_percorrido || 'Não registrado'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Encarregado</dt>
                      <dd className="text-sm text-gray-900">{showDetails.encarregado_id || 'Não definido'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {showDetails.descricao && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h3>
                  <p className="text-sm text-gray-900">{showDetails.descricao}</p>
                </div>
              )}

              {(showDetails.latitude || showDetails.longitude) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>
                  <dl className="space-y-2">
                    {showDetails.latitude && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Latitude</dt>
                        <dd className="text-sm text-gray-900">{showDetails.latitude}</dd>
                      </div>
                    )}
                    {showDetails.longitude && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Longitude</dt>
                        <dd className="text-sm text-gray-900">{showDetails.longitude}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRotinasCompleto; 