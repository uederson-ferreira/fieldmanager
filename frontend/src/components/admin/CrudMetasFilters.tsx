// ===================================================================
// COMPONENTE FILTROS DE METAS - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetasFilters.tsx
// Módulo: Filtros e busca de metas
// ===================================================================

import React from 'react';
import { Search } from 'lucide-react';
import type { FiltrosMeta, TipoMeta, PeriodoMeta } from '../../types/metas';
import { TIPOS_META, PERIODOS_META } from '../../types/metas';

interface CrudMetasFiltersProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filtros: FiltrosMeta;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosMeta>>;
}

export const CrudMetasFilters: React.FC<CrudMetasFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filtros,
  setFiltros
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filtros.tipo_meta || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, tipo_meta: e.target.value as TipoMeta || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            {TIPOS_META.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          
          <select
            value={filtros.periodo || ''}
            onChange={(e) => setFiltros(prev => ({ ...prev, periodo: e.target.value as PeriodoMeta || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os períodos</option>
            {PERIODOS_META.map(periodo => (
              <option key={periodo.value} value={periodo.value}>{periodo.label}</option>
            ))}
          </select>
          
          <select
            value={filtros.ativa?.toString() || ''}
            onChange={(e) => setFiltros(prev => ({ 
              ...prev, 
              ativa: e.target.value === '' ? undefined : e.target.value === 'true' 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativas</option>
            <option value="false">Inativas</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 