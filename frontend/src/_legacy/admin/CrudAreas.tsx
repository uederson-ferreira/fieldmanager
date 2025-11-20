import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, MapPin, Building,
  Save, X, Eye, Map, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';

import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { unifiedCache } from '../../lib/unifiedCache';
import { getAuthToken } from '../../utils/authUtils';
import type { Area } from '../../types/entities';

const CrudAreas: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [areas, setAreas] = useState<Area[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<Area | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    localizacao: '',
    ativa: true
  });

  // Carregar áreas
  useEffect(() => {
    carregarAreas();
  }, []);

  const carregarAreas = async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      // Usar cache unificado com fallback inteligente
      const areasData = await unifiedCache.getCachedData<Area[]>(
        'areas',
        async () => {
          const token = getAuthToken();

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/areas/areas`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          // Backend retorna array direto, não objeto com propriedade 'areas'
          return Array.isArray(result) ? result : [];
        }
      );
      
      setAreas(areasData);
      
      if (!isOnline && areasData.length === 0) {
        setErro('Modo offline: Nenhum dado em cache disponível');
      }
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
      setErro('Erro ao carregar áreas: ' + (error as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getAuthToken();

      if (editando) {
        // Atualizar área existente
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/areas/atualizar-area/${editando.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            descricao: formData.descricao,
            localizacao: formData.localizacao,
            ativa: formData.ativa,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
      } else {
        // Criar nova área
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/areas/criar-area`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            descricao: formData.descricao,
            localizacao: formData.localizacao,
            ativa: formData.ativa
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }
      }

      await carregarAreas();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar área:', error);
      alert('Erro ao salvar área: ' + (error as Error).message);
    }
  };

  const handleDelete = async (area: Area) => {
    if (!confirm(`Tem certeza que deseja excluir a área "${area.nome}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/areas/deletar-area/${area.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      await carregarAreas();
    } catch (error) {
      console.error('Erro ao excluir área:', error);
      alert('Erro ao excluir área: ' + (error as Error).message);
    }
  };

  const openModal = (area?: Area) => {
    if (area) {
      setEditando(area);
      setFormData({
        nome: area.nome,
        descricao: area.descricao || '',
        localizacao: area.localizacao || '',
        ativa: area.ativa
      });
    } else {
      setEditando(null);
      setFormData({
        nome: '',
        descricao: '',
        localizacao: '',
        ativa: true
      });
    }
    setMostrarForm(true);
  };

  const closeModal = () => {
    setMostrarForm(false);
    setEditando(null);
    setFormData({
      nome: '',
      descricao: '',
      localizacao: '',
      ativa: true
    });
  };

  const filteredAreas = areas.filter(area =>
    area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.localizacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Áreas</h1>
            
            {/* Status Online/Offline */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              isOnline
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {isOnline ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
          
          <button
            onClick={() => openModal()}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Área</span>
          </button>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{erro}</span>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Áreas</p>
                <p className="text-2xl font-bold text-blue-600">{areas.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Áreas Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {areas.filter(a => a.ativa).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Áreas Inativas</p>
                <p className="text-2xl font-bold text-red-600">
                  {areas.filter(a => !a.ativa).length}
                </p>
              </div>
              <Map className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid de Áreas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carregando ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
            ))
          ) : filteredAreas.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma área encontrada</p>
            </div>
          ) : (
            filteredAreas.map((area) => (
              <div 
                key={area.id} 
                className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        area.ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {area.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {area.nome}
                    </h3>
                    {area.descricao && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {area.descricao}
                      </p>
                    )}
                    {area.localizacao && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Map className="w-4 h-4" />
                        <span>{area.localizacao}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Criado: {new Date(area.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openModal(area)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(area)}
                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Formulário */}
        {mostrarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editando ? 'Editar Área' : 'Nova Área'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Área
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Canteiro Central, Frente Norte..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição detalhada da área..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização/Referência
                  </label>
                  <input
                    type="text"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    placeholder="Ex: KM 0+000, Setor A, Bloco 1..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativa"
                    checked={formData.ativa}
                    onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="ativa" className="text-sm text-gray-700">
                    Área ativa
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editando ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrudAreas;
