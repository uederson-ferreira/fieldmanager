// ===================================================================
// COMPONENTE TABELA DOS TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/ListaTermosTable.tsx
// Módulo: Tabela de termos para desktop
// ===================================================================

import React from 'react';
import { Eye, Edit, Download, Trash2, MapPin, FileText, Clock, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import type { TermoAmbiental } from '../../types/termos';

// Tipo local para termos offline
type TermoAmbientalOffline = TermoAmbiental & { 
  numero_sequencial?: number | string;
  uuid?: string;
};

interface ListaTermosTableProps {
  termosParaExibir: (TermoAmbiental | TermoAmbientalOffline)[];
  carregando: boolean;
  visualizarTermo: (id: string) => Promise<void>;
  editarTermo: (termo: TermoAmbiental | TermoAmbientalOffline) => void;
  handleGerarRelatorio: (termo: TermoAmbiental) => Promise<void>;
  handleExcluirTermo: (termo: TermoAmbiental) => Promise<void>;
  onSincronizarTermo?: (termo: TermoAmbiental | TermoAmbientalOffline) => Promise<void>;
  getStatusIcon: (status: string) => string;
  getStatusColor: (status: string) => string;
  getTipoColor: (tipo: string) => string;
  formatarData: (data: string) => string;
  getNumeroTermoFormatado: (tipo: string, numero?: number | string) => string;
}

export const ListaTermosTable: React.FC<ListaTermosTableProps> = ({
  termosParaExibir,
  carregando,
  visualizarTermo,
  editarTermo,
  handleGerarRelatorio,
  handleExcluirTermo,
  onSincronizarTermo,
  getStatusIcon,
  getStatusColor,
  getTipoColor,
  formatarData,
  getNumeroTermoFormatado
}) => {
  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando termos...</span>
      </div>
    );
  }

  if (termosParaExibir.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Nenhum termo encontrado</p>
        <p className="text-sm text-gray-400 mt-2">
          Tente ajustar os filtros de busca
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número do Termo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo + Sequêncial
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destinatário
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Local
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Origem
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {termosParaExibir.map((termo) => {
            const t = termo as TermoAmbiental | TermoAmbientalOffline;
            return (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-900">{t.numero_termo || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(t.status) === 'clock' && <Clock className="h-4 w-4" />}
                        {getStatusIcon(t.status) === 'alert-triangle' && <AlertTriangle className="h-4 w-4" />}
                        {getStatusIcon(t.status) === 'check-circle' && <CheckCircle className="h-4 w-4" />}
                      </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-green-900">
                        {getNumeroTermoFormatado(t.tipo_termo, t.numero_sequencial)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(t.tipo_termo)}`}>
                          {t.tipo_termo === 'PARALIZACAO_TECNICA' ? 'Paralização' : 
                           t.tipo_termo === 'NOTIFICACAO' ? 'Notificação' : 'Recomendação'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatarData(t.data_termo)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-900">{t.destinatario_nome}</div>
                  {t.destinatario_empresa && (
                    <div className="text-sm text-gray-500">{t.destinatario_empresa}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-green-900">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                    {t.area_equipamento_atividade}
                  </div>
                  {t.local_atividade && (
                    <div className="text-sm text-gray-500 mt-1">
                      {t.local_atividade.length > 30 
                        ? `${t.local_atividade.substring(0, 30)}...`
                        : t.local_atividade}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                    {getStatusIcon(t.status) === 'clock' && <Clock className="h-4 w-4" />}
                    {getStatusIcon(t.status) === 'alert-triangle' && <AlertTriangle className="h-4 w-4" />}
                    {getStatusIcon(t.status) === 'check-circle' && <CheckCircle className="h-4 w-4" />}
                    <span className="ml-1">
                      {t.status.replace('_', ' ')}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {(t.offline === true || t.sincronizado === false) ? (
                    <div className="flex items-center">
                      <WifiOff className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-yellow-700 font-medium">Offline</span>
                      <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                        Aguardando sincronização
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-700 font-medium">Sincronizado</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* ✅ Botão de Sincronização para termos offline */}
                    {(t.offline === true || t.sincronizado === false) && onSincronizarTermo && (
                      <button
                        onClick={() => onSincronizarTermo(t)}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="Sincronizar termo offline"
                      >
                        <Wifi className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => visualizarTermo(t.id!)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizar preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => editarTermo(t)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Editar termo"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleGerarRelatorio({ 
                        ...t, 
                        numero_sequencial: typeof t.numero_sequencial === 'string' 
                          ? Number(t.numero_sequencial) 
                          : t.numero_sequencial 
                      })}
                      className="text-green-600 hover:text-green-900"
                      title="Gerar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleExcluirTermo({ 
                        ...t, 
                        numero_sequencial: typeof t.numero_sequencial === 'string' 
                          ? Number(t.numero_sequencial) 
                          : t.numero_sequencial 
                      })}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir termo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 