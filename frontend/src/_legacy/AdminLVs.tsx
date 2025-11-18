// ===================================================================
// ADMIN LVs - CRUD COMPLETO COM FUNCIONALIDADES TMA
// Localização: src/components/admin/AdminLVs.tsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, FileText, 
  Save, X, Camera, MapPin, User, Calendar,
  CheckCircle, AlertCircle, Clock, Download
} from 'lucide-react';

import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { unifiedCache } from '../../lib/unifiedCache';
import type { LV, LVAvaliacao, LVFoto } from '../../types/lv';
import type { UserData } from '../../types/entities';

interface AdminLVsProps {
  user: UserData;
}

const AdminLVs: React.FC<AdminLVsProps> = ({ user }) => {
  const isOnline = useOnlineStatus();
  const [lvs, setLvs] = useState<LV[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingLV, setEditingLV] = useState<LV | null>(null);
  const [showDetails, setShowDetails] = useState<LV | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    numero: '',
    versao_lv_id: '',
    area_id: '',
    data_inspecao: '',
    tma_responsavel_id: user.id,
    observacoes: '',
    status: 'pendente'
  });

  // Carregar LVs
  useEffect(() => {
    carregarLVs();
  }, []);

  const carregarLVs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const lvsData = await unifiedCache.getCachedData<LV[]>(
        'lvs',
        async () => {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lvs/lvs`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          return result.lvs || [];
        }
      );
      
      setLvs(lvsData);
      
      if (!isOnline && lvsData.length === 0) {
        setError('Modo offline: Nenhum dado em cache disponível');
      }
    } catch (error) {
      console.error('Erro ao carregar LVs:', error);
      setError('Erro ao carregar LVs: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLV) {
        // Atualizar LV existente
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lvs/atualizar-lv/${editingLV.id}`, {
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
        // Criar nova LV
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lvs/criar-lv`, {
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

      await carregarLVs();
      closeForm();
    } catch (error) {
      console.error('Erro ao salvar LV:', error);
      alert('Erro ao salvar LV: ' + (error as Error).message);
    }
  };

  const handleDelete = async (lv: LV) => {
    if (!window.confirm(`Deseja realmente excluir a LV ${lv.numero}?`)) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lvs/deletar-lv/${lv.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      await carregarLVs();
    } catch (error) {
      console.error('Erro ao deletar LV:', error);
      alert('Erro ao deletar LV: ' + (error as Error).message);
    }
  };

  const openForm = (lv?: LV) => {
    if (lv) {
      setEditingLV(lv);
      setFormData({
        numero: lv.numero,
        versao_lv_id: lv.versao_lv_id,
        area_id: lv.area_id,
        data_inspecao: lv.data_inspecao,
        tma_responsavel_id: lv.tma_responsavel_id,
        observacoes: lv.observacoes || '',
        status: lv.status
      });
    } else {
      setEditingLV(null);
      setFormData({
        numero: '',
        versao_lv_id: '',
        area_id: '',
        data_inspecao: '',
        tma_responsavel_id: user.id,
        observacoes: '',
        status: 'pendente'
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLV(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conforme':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'nao_conforme':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conforme':
        return 'bg-green-100 text-green-800';
      case 'nao_conforme':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLVs = lvs.filter(lv => {
    const matchesSearch = lv.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lv.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar LVs</h1>
          <p className="text-gray-600">Listas de Verificação - CRUD Completo</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova LV</span>
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
                placeholder="Buscar por número ou observações..."
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
              <option value="conforme">Conforme</option>
              <option value="nao_conforme">Não Conforme</option>
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

      {/* Lista de LVs */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TMA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observações
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLVs.map((lv) => (
                  <tr key={lv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {lv.numero}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lv.data_inspecao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lv.status)}`}>
                        {getStatusIcon(lv.status)}
                        <span className="ml-1 capitalize">{lv.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        {lv.tma_responsavel_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {lv.observacoes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowDetails(lv)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openForm(lv)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lv)}
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
          
          {filteredLVs.length === 0 && !loading && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma LV encontrada</p>
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
                  {editingLV ? 'Editar LV' : 'Nova LV'}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Inspeção
                    </label>
                    <input
                      type="date"
                      value={formData.data_inspecao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_inspecao: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Versão LV
                    </label>
                    <input
                      type="text"
                      value={formData.versao_lv_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, versao_lv_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área
                    </label>
                    <input
                      type="text"
                      value={formData.area_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, area_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
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
                    <option value="conforme">Conforme</option>
                    <option value="nao_conforme">Não Conforme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Observações sobre a LV..."
                  />
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
                    <span>{editingLV ? 'Atualizar' : 'Criar'}</span>
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
                  Detalhes da LV {showDetails.numero}
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
                      <dt className="text-sm font-medium text-gray-500">Número</dt>
                      <dd className="text-sm text-gray-900">{showDetails.numero}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data de Inspeção</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(showDetails.data_inspecao).toLocaleDateString('pt-BR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(showDetails.status)}`}>
                          {getStatusIcon(showDetails.status)}
                          <span className="ml-1 capitalize">{showDetails.status.replace('_', ' ')}</span>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                  <p className="text-sm text-gray-900">
                    {showDetails.observacoes || 'Nenhuma observação registrada.'}
                  </p>
                </div>
              </div>

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

export default AdminLVs; 