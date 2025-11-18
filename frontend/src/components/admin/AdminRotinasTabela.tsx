import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { Rotina } from '../../lib/rotinasAPI';

interface AdminRotinasTabelaProps {
  rotinas: Rotina[];
  onEdit: (rotina: Rotina) => void;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'Pendente';
    case 'EM_ANDAMENTO': return 'Em Andamento';
    case 'CONCLUIDA': return 'Concluída';
    case 'CANCELADA': return 'Cancelada';
    default: return status || 'Não definido';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
    case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
    case 'CONCLUIDA': return 'bg-green-100 text-green-800';
    case 'CANCELADA': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const AdminRotinasTabela: React.FC<AdminRotinasTabelaProps> = ({
  rotinas,
  onEdit,
  onDelete,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando rotinas...</span>
      </div>
    );
  }

  if (rotinas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📋</div>
        <p className="text-gray-500">Nenhuma rotina encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Área
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Atividade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Responsável
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rotinas.map((rotina) => (
            <tr key={rotina.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {rotina.data_atividade ? new Date(rotina.data_atividade).toLocaleDateString('pt-BR') : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {rotina.area_id || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {rotina.atividade || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {rotina.tma_responsavel_id || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rotina.status || '')}`}>
                  {getStatusLabel(rotina.status || '')}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(rotina)}
                    className="text-green-600 hover:text-green-900 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(rotina.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
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
  );
}; 