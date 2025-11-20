import React from 'react';

interface FiltrosTermos {
  tipo_termo: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  emitido_por: string;
  area: string;
}

interface AdminTermosFiltroProps {
  filtros: FiltrosTermos;
  onFiltrosChange: (filtros: Partial<FiltrosTermos>) => void;
  onLimparFiltros: () => void;
}

const tipos = [
  { value: '', label: 'Todos' },
  { value: 'NOTIFICACAO', label: 'Notificação' },
  { value: 'PARALIZACAO_TECNICA', label: 'Paralização Técnica' },
  { value: 'RECOMENDACAO', label: 'Recomendação' },
];

const statusList = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'CORRIGIDO', label: 'Corrigido' },
  { value: 'LIBERADO', label: 'Liberado' },
];

export const AdminTermosFiltro: React.FC<AdminTermosFiltroProps> = ({
  filtros,
  onFiltrosChange,
  onLimparFiltros
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
      {/* Tipo de Termo */}
      <select 
        className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={filtros.tipo_termo} 
        onChange={e => onFiltrosChange({ tipo_termo: e.target.value })}
      >
        {tipos.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Status */}
      <select 
        className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={filtros.status} 
        onChange={e => onFiltrosChange({ status: e.target.value })}
      >
        {statusList.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Data Início */}
      <input 
        type="date" 
        className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={filtros.data_inicio} 
        onChange={e => onFiltrosChange({ data_inicio: e.target.value })} 
        placeholder="Data início"
      />

      {/* Data Fim */}
      <input 
        type="date" 
        className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={filtros.data_fim} 
        onChange={e => onFiltrosChange({ data_fim: e.target.value })} 
        placeholder="Data fim"
      />

      {/* Emitido por */}
      <input 
        type="text" 
        placeholder="Emitido por" 
        className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={filtros.emitido_por} 
        onChange={e => onFiltrosChange({ emitido_por: e.target.value })} 
      />

      {/* Área */}
      <input 
        type="text" 
        placeholder="Área" 
        className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={filtros.area} 
        onChange={e => onFiltrosChange({ area: e.target.value })} 
      />

      {/* Botão Limpar */}
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm transition-colors"
        onClick={onLimparFiltros}
      >
        Limpar Filtros
      </button>
    </div>
  );
}; 