// ===================================================================
// COMPONENTE ATRIBUIÇÃO INDIVIDUAL DE METAS - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetasAtribuicao.tsx
// Módulo: Modal para atribuir metas individualmente
// ===================================================================

import React from 'react';
import { Check } from 'lucide-react';
import Modal from '../common/Modal';
import type { MetaComProgresso } from '../../types/metas';
import { getTipoMetaLabel, formatarPeriodo } from '../../types/metas';

interface UsuarioComPerfil {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfis: { nome: string }[];
}

interface CrudMetasAtribuicaoProps {
  showAtribuicaoModal: boolean;
  setShowAtribuicaoModal: React.Dispatch<React.SetStateAction<boolean>>;
  metaSelecionada: MetaComProgresso | null;
  tmasDisponiveis: UsuarioComPerfil[];
  atribuicoesSelecionadas: string[];
  filtroUsuario: string;
  setFiltroUsuario: React.Dispatch<React.SetStateAction<string>>;
  filtroPerfil: string;
  setFiltroPerfil: React.Dispatch<React.SetStateAction<string>>;
  perfisDisponiveis: string[];
  handleAtribuirMeta: () => Promise<void>;
  handleSelecionarTodos: () => void;
  handleDesselecionarTodos: () => void;
  handleToggleUsuario: (usuarioId: string) => void;
}

export const CrudMetasAtribuicao: React.FC<CrudMetasAtribuicaoProps> = ({
  showAtribuicaoModal,
  setShowAtribuicaoModal,
  metaSelecionada,
  tmasDisponiveis,
  atribuicoesSelecionadas,
  filtroUsuario,
  setFiltroUsuario,
  filtroPerfil,
  setFiltroPerfil,
  perfisDisponiveis,
  handleAtribuirMeta,
  handleSelecionarTodos,
  handleDesselecionarTodos,
  handleToggleUsuario
}) => {
  if (!metaSelecionada) return null;

  const metaTitulo = metaSelecionada.descricao
    || metaSelecionada.categoria
    || getTipoMetaLabel(metaSelecionada.tipo_meta);

  const periodoLabel = formatarPeriodo(metaSelecionada);

  const usuariosFiltrados = tmasDisponiveis.filter(tma => {
    const matchUsuario = !filtroUsuario || 
      tma.nome.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
      tma.email.toLowerCase().includes(filtroUsuario.toLowerCase());
    
    const matchPerfil = !filtroPerfil || 
      tma.perfis.some(perfil => perfil.nome === filtroPerfil);
    
    return matchUsuario && matchPerfil;
  });

  return (
    <Modal
      isOpen={showAtribuicaoModal}
      onClose={() => setShowAtribuicaoModal(false)}
      title="Atribuir Meta Individualmente"
      subtitle={`Atribuir meta "${metaTitulo}" aos TMAs selecionados`}
      size="xl"
      showCloseButton={true}
      headerClassName="bg-gradient-to-r from-purple-600 to-purple-700"
    >
      <div className="p-6 space-y-6">
        {/* Informações da Meta */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Meta Selecionada</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Título:</span>
              <p className="font-medium">{metaTitulo}</p>
            </div>
            <div>
              <span className="text-gray-500">Tipo:</span>
              <p className="font-medium">{getTipoMetaLabel(metaSelecionada.tipo_meta)}</p>
            </div>
            <div>
              <span className="text-gray-500">Quantidade:</span>
              <p className="font-medium">{metaSelecionada.meta_quantidade} unidades</p>
            </div>
            <div>
              <span className="text-gray-500">Período:</span>
              <p className="font-medium">{periodoLabel}</p>
            </div>
          </div>
        </div>

        {/* Filtros de Usuários */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Filtrar TMAs</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por nome/email
              </label>
              <input
                type="text"
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                placeholder="Digite para filtrar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por perfil
              </label>
              <select
                value={filtroPerfil}
                onChange={(e) => setFiltroPerfil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos os perfis</option>
                {perfisDisponiveis.map(perfil => (
                  <option key={perfil} value={perfil}>{perfil}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ações em Lote */}
        <div className="flex gap-2">
          <button
            onClick={handleSelecionarTodos}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          >
            Selecionar Todos
          </button>
          <button
            onClick={handleDesselecionarTodos}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Desselecionar Todos
          </button>
        </div>

        {/* Lista de TMAs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              TMAs Disponíveis ({usuariosFiltrados.length})
            </h4>
            <span className="text-sm text-gray-500">
              {atribuicoesSelecionadas.length} selecionados
            </span>
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {usuariosFiltrados.map((tma) => {
              const isSelected = atribuicoesSelecionadas.includes(tma.id);
              return (
                <div
                  key={tma.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleUsuario(tma.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tma.nome}</p>
                      <p className="text-sm text-gray-500">{tma.email}</p>
                      <div className="flex gap-1 mt-1">
                        {tma.perfis.map((perfil, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {perfil.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tma.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tma.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAtribuicaoModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAtribuirMeta}
            disabled={atribuicoesSelecionadas.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Atribuir a {atribuicoesSelecionadas.length} TMA{atribuicoesSelecionadas.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
}; 