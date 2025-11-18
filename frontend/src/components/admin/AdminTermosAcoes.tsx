import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

interface AdminTermosAcoesProps {
  selecionados: string[];
  onExcluirLote: () => Promise<void>;
  onRefresh: () => Promise<void>;
  loading: boolean;
}

export const AdminTermosAcoes: React.FC<AdminTermosAcoesProps> = ({
  selecionados,
  onExcluirLote,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h1 className="text-xl font-bold text-gray-900">Administração de Termos Ambientais</h1>
      
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

        {/* Botão Excluir Selecionados */}
        <button 
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          onClick={onExcluirLote}
          disabled={selecionados.length === 0 || loading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir {selecionados.length > 0 ? `(${selecionados.length})` : ''}
        </button>
      </div>
    </div>
  );
}; 