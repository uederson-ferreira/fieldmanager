import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, Eye, List,
  Save, X, ArrowUp, ArrowDown, Hash
} from 'lucide-react';

import { categoriasAPI } from '../../lib/categoriasAPI';
import type { CategoriaLV } from '../../types';

const CrudCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaLV[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaLV | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    ordem: 1,
    ativa: true
  });

  // Carregar categorias
  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setLoading(true);

      const categorias = await categoriasAPI.getCategorias();
      setCategorias(categorias || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategoria) {
        // Atualizar categoria existente
        await categoriasAPI.atualizarCategoria(editingCategoria.id, {
          codigo: formData.codigo,
          nome: formData.nome,
          descricao: formData.descricao,
          ordem: formData.ordem,
          ativa: formData.ativa,
        });
      } else {
        // Criar nova categoria
        await categoriasAPI.criarCategoria({
          codigo: formData.codigo,
          nome: formData.nome,
          descricao: formData.descricao,
          ordem: formData.ordem,
        });
      }

      await carregarCategorias();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria: ' + (error as Error).message);
    }
  };

  const handleDelete = async (categoria: CategoriaLV) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    try {
      await categoriasAPI.deletarCategoria(categoria.id);
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria: ' + (error as Error).message);
    }
  };

  const alterarOrdem = async (categoria: CategoriaLV, novaOrdem: number) => {
    try {
      await categoriasAPI.atualizarCategoria(categoria.id, { ordem: novaOrdem });
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao alterar ordem:', error);
    }
  };

  const openModal = (categoria?: CategoriaLV) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        codigo: categoria.codigo,
        nome: categoria.nome,
        descricao: categoria.descricao || '',
        ordem: categoria.ordem || 1,
        ativa: categoria.ativa
      });
    } else {
      setEditingCategoria(null);
      const proximaOrdem = Math.max(...categorias.map(c => c.ordem || 0)) + 1;
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        ordem: proximaOrdem,
        ativa: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({
      codigo: '',
      nome: '',
      descricao: '',
      ordem: 1,
      ativa: true
    });
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Categorias LV</h2>
            <p className="text-gray-600">Categorias das Listas de Verificação</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{categorias.length}</p>
              </div>
              <List className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {categorias.filter(c => c.ativa).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inativas</p>
                <p className="text-2xl font-bold text-red-600">
                  {categorias.filter(c => !c.ativa).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Ordem</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.max(...categorias.map(c => c.ordem || 0))}
                </p>
              </div>
              <Hash className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
            ))
          ) : filteredCategorias.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma categoria encontrada</p>
            </div>
          ) : (
            filteredCategorias.map((categoria) => (
              <div 
                key={categoria.id} 
                className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                        {categoria.codigo}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        categoria.ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {categoria.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {categoria.nome}
                    </h3>
                    {categoria.descricao && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {categoria.descricao}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Ordem: {categoria.ordem}</span>
                      <span>
                        Criado: {new Date(categoria.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {/* Controles de Ordem */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => alterarOrdem(categoria, (categoria.ordem || 1) - 1)}
                      disabled={(categoria.ordem || 1) <= 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alterarOrdem(categoria, (categoria.ordem || 1) + 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(categoria)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(categoria)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Formulário */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
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
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: 01, 02, 10..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: RESÍDUOS, GESTÃO AMBIENTAL..."
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
                    placeholder="Descrição da categoria..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
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
                    Categoria ativa
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
                    {editingCategoria ? 'Atualizar' : 'Criar'}
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

export default CrudCategorias;
