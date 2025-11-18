// ===================================================================
// COMPONENTE FILTROS DOS TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/ListaTermosFilters.tsx
// Módulo: Filtros e busca de termos
// ===================================================================

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ListaTermosFiltersProps {
  isOnline: boolean;
  filtros: {
    tipo_termo: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    busca_texto: string;
  };
  setFiltros: React.Dispatch<React.SetStateAction<{
    tipo_termo: string;
    status: string;
    data_inicio: string;
    data_fim: string;
    busca_texto: string;
  }>>;
  mostrarFiltros: boolean;
  setMostrarFiltros: React.Dispatch<React.SetStateAction<boolean>>;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
}

export const ListaTermosFilters: React.FC<ListaTermosFiltersProps> = ({
  isOnline,
  filtros,
  setFiltros,
  mostrarFiltros,
  setMostrarFiltros,
  aplicarFiltros,
  limparFiltros
}) => {
  if (!isOnline) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        
        {/* Busca */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, empresa, número do termo..."
              value={filtros.busca_texto}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca_texto: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
          
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Aplicar
          </button>
          
          <button
            onClick={limparFiltros}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {mostrarFiltros && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de Termo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Termo
              </label>
              <select
                value={filtros.tipo_termo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo_termo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="PARALIZACAO_TECNICA">Paralização Técnica</option>
                <option value="NOTIFICACAO">Notificação</option>
                <option value="RECOMENDACAO">Recomendação</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CORRIGIDO">Corrigido</option>
                <option value="LIBERADO">Liberado</option>
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 