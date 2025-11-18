// ===================================================================
// ADMIN TERMOS COMPLETO - CRUD COMPLETO COM FUNCIONALIDADES TMA
// Localização: src/components/admin/AdminTermosCompleto.tsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, FileText, 
  Save, X, Camera, MapPin, User, Calendar,
  CheckCircle, AlertCircle, Clock, Download,
  AlertTriangle, Info, Shield
} from 'lucide-react';

import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { unifiedCache } from '../../lib/unifiedCache';
import type { TermoAmbiental } from '../../types';
import type { UserData } from '../../types/entities';

interface AdminTermosCompletoProps {
  user: UserData;
}

const AdminTermosCompleto: React.FC<AdminTermosCompletoProps> = ({ user }) => {
  const isOnline = useOnlineStatus();
  const [termos, setTermos] = useState<TermoAmbiental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTermo, setEditingTermo] = useState<TermoAmbiental | null>(null);
  const [showDetails, setShowDetails] = useState<TermoAmbiental | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    numero: '',
    tipo: '',
    descricao: '',
    local: '',
    data_emissao: '',
    data_vencimento: '',
    emitido_por_usuario_id: user.id,
    empresa_contratada_id: '',
    observacoes: '',
    status: 'pendente',
    prioridade: 'media'
  });

  // Carregar Termos
  useEffect(() => {
    carregarTermos();
  }, []);

  const carregarTermos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const termosData = await unifiedCache.getCachedData<TermoAmbiental[]>(
        'termos',
        async () => {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos/termos`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          return result.termos || [];
        }
      );
      
      setTermos(termosData);
      
      if (!isOnline && termosData.length === 0) {
        setError('Modo offline: Nenhum dado em cache disponível');
      }
    } catch (error) {
      console.error('Erro ao carregar termos:', error);
      setError('Erro ao carregar termos: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTermo) {
        // Atualizar termo existente
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos/atualizar-termo/${editingTermo.id}`, {
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
        // Criar novo termo
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos/criar-termo`, {
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

      await carregarTermos();
      closeForm();
    } catch (error) {
      console.error('Erro ao salvar termo:', error);
      alert('Erro ao salvar termo: ' + (error as Error).message);
    }
  };

  const handleDelete = async (termo: TermoAmbiental) => {
    if (!window.confirm(`Deseja realmente excluir o termo ${termo.numero}?`)) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos/deletar-termo/${termo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      await carregarTermos();
    } catch (error) {
      console.error('Erro ao deletar termo:', error);
      alert('Erro ao deletar termo: ' + (error as Error).message);
    }
  };

  const openForm = (termo?: TermoAmbiental) => {
    if (termo) {
      setEditingTermo(termo);
      setFormData({
        numero: termo.numero,
        tipo: termo.tipo,
        descricao: termo.descricao,
        local: termo.local,
        data_emissao: termo.data_emissao,
        data_vencimento: termo.data_vencimento,
        emitido_por_usuario_id: termo.emitido_por_usuario_id,
        empresa_contratada_id: termo.empresa_contratada_id || '',
        observacoes: termo.observacoes || '',
        status: termo.status,
        prioridade: termo.prioridade || 'media'
      });
    } else {
      setEditingTermo(null);
      setFormData({
        numero: '',
        tipo: '',
        descricao: '',
        local: '',
        data_emissao: '',
        data_vencimento: '',
        emitido_por_usuario_id: user.id,
        empresa_contratada_id: '',
        observacoes: '',
        status: 'pendente',
        prioridade: 'media'
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTermo(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'corrigido':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'corrigido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'media':
        return <Info className="h-4 w-4 text-yellow-600" />;
      case 'baixa':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const isVencido = (dataVencimento: string) => {
    return new Date(dataVencimento) < new Date();
  };

  const filteredTermos = termos.filter(termo => {
    const matchesSearch = termo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         termo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         termo.local.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || termo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Termos Ambientais</h1>
          <p className="text-gray-600">Termos Ambientais - CRUD Completo</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Termo</span>
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
                placeholder="Buscar por número, descrição ou local..."
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
              <option value="corrigido">Corrigido</option>
              <option value="vencido">Vencido</option>
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

      {/* Lista de Termos */}
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
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTermos.map((termo) => (
                  <tr key={termo.id} className={`hover:bg-gray-50 ${isVencido(termo.data_vencimento) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {termo.numero}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {termo.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {termo.local}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(termo.data_vencimento).toLocaleDateString('pt-BR')}
                        {isVencido(termo.data_vencimento) && (
                          <AlertTriangle className="h-4 w-4 text-red-600 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(termo.status)}`}>
                        {getStatusIcon(termo.status)}
                        <span className="ml-1 capitalize">{termo.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPrioridadeIcon(termo.prioridade || 'media')}
                        <span className="ml-1 capitalize text-sm text-gray-600">
                          {termo.prioridade || 'media'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowDetails(termo)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openForm(termo)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(termo)}
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
          
          {filteredTermos.length === 0 && !loading && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum termo encontrado</p>
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
                  {editingTermo ? 'Editar Termo' : 'Novo Termo'}
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
                      Tipo
                    </label>
                    <input
                      type="text"
                      value={formData.tipo}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
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
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local
                    </label>
                    <input
                      type="text"
                      value={formData.local}
                      onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
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
                      Data de Emissão
                    </label>
                    <input
                      type="date"
                      value={formData.data_emissao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_emissao: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      value={formData.data_vencimento}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <option value="corrigido">Corrigido</option>
                      <option value="vencido">Vencido</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
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
                    placeholder="Observações sobre o termo..."
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
                    <span>{editingTermo ? 'Atualizar' : 'Criar'}</span>
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
                  Detalhes do Termo {showDetails.numero}
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
                      <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                      <dd className="text-sm text-gray-900">{showDetails.tipo}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Local</dt>
                      <dd className="text-sm text-gray-900">{showDetails.local}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(showDetails.status)}`}>
                          {getStatusIcon(showDetails.status)}
                          <span className="ml-1 capitalize">{showDetails.status}</span>
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Prioridade</dt>
                      <dd className="text-sm">
                        <div className="flex items-center">
                          {getPrioridadeIcon(showDetails.prioridade || 'media')}
                          <span className="ml-1 capitalize">{showDetails.prioridade || 'media'}</span>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data de Emissão</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(showDetails.data_emissao).toLocaleDateString('pt-BR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Data de Vencimento</dt>
                      <dd className="text-sm text-gray-900">
                        <div className="flex items-center">
                          {new Date(showDetails.data_vencimento).toLocaleDateString('pt-BR')}
                          {isVencido(showDetails.data_vencimento) && (
                            <AlertTriangle className="h-4 w-4 text-red-600 ml-2" />
                          )}
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h3>
                <p className="text-sm text-gray-900 mb-4">{showDetails.descricao}</p>
                
                {showDetails.observacoes && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                    <p className="text-sm text-gray-900">{showDetails.observacoes}</p>
                  </>
                )}
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

export default AdminTermosCompleto; 