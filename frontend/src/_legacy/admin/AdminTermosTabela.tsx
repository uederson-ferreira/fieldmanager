import React from 'react';
import { Trash2, Eye, Edit } from 'lucide-react';
import type { TermoAmbiental } from '../../types/termos';

interface AdminTermosTabelaProps {
  termos: TermoAmbiental[];
  selecionados: string[];
  onSelecionar: (id: string) => void;
  onExcluir: (id: string) => Promise<void>;
  loading: boolean;
}

const getTipoLabel = (tipo: string) => {
  switch (tipo) {
    case 'NOTIFICACAO': return 'Notificação';
    case 'PARALIZACAO_TECNICA': return 'Paralização Técnica';
    case 'RECOMENDACAO': return 'Recomendação';
    default: return tipo;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'Pendente';
    case 'EM_ANDAMENTO': return 'Em Andamento';
    case 'CORRIGIDO': return 'Corrigido';
    case 'LIBERADO': return 'Liberado';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
    case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
    case 'CORRIGIDO': return 'bg-green-100 text-green-800';
    case 'LIBERADO': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const AdminTermosTabela: React.FC<AdminTermosTabelaProps> = ({
  termos,
  selecionados,
  onSelecionar,
  onExcluir,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando termos...</span>
      </div>
    );
  }

  if (termos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📄</div>
        <p className="text-gray-500">Nenhum termo encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={selecionados.length === termos.length && termos.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    termos.forEach(termo => onSelecionar(termo.id));
                  } else {
                    selecionados.forEach(id => onSelecionar(id));
                  }
                }}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Emitido por
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {termos.map((termo) => (
            <tr key={termo.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={selecionados.includes(termo.id)}
                  onChange={() => onSelecionar(termo.id)}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {termo.numero_termo}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {getTipoLabel(termo.tipo_termo)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(termo.status)}`}>
                  {getStatusLabel(termo.status)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {termo.emitido_por_nome}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {termo.data_emissao ? new Date(termo.data_emissao).toLocaleDateString('pt-BR') : '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* TODO: Implementar visualização */}}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {/* TODO: Implementar edição */}}
                    className="text-green-600 hover:text-green-900 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onExcluir(termo.id)}
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