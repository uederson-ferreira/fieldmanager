import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface AdminRotinasAcoesProps {
  onNovaRotina: () => void;
  onRefresh: () => Promise<void>;
  loading: boolean;
}

export const AdminRotinasAcoes: React.FC<AdminRotinasAcoesProps> = ({
  onNovaRotina,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h1 className="text-xl font-bold text-gray-900">Administração de Rotinas</h1>
      
      <div className="flex items-center space-x-2">
        {/* Botão Atualizar */}
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>

        {/* Botão Nova Rotina */}
        <button 
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={onNovaRotina}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Rotina
        </button>
      </div>
    </div>
  );
}; 