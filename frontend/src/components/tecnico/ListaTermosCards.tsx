// ===================================================================
// COMPONENTE CARDS DOS TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/ListaTermosCards.tsx
// Módulo: Lista de termos em cards para mobile
// ===================================================================

import React from 'react';
import { Eye, Edit, Download, Trash2, MapPin, FileText, Clock, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import type { TermoAmbiental } from '../../types/termos';

// Tipo local para termos offline
type TermoAmbientalOffline = TermoAmbiental & { 
  numero_sequencial?: number | string;
  uuid?: string;
};

interface ListaTermosCardsProps {
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

export const ListaTermosCards: React.FC<ListaTermosCardsProps> = ({
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
    <div className="space-y-4 p-4">
      {termosParaExibir.map((termo) => {
        const t = termo as TermoAmbiental | TermoAmbientalOffline;
        return (
          <div key={t.id} className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(t.status) === 'clock' && <Clock className="h-4 w-4" />}
                {getStatusIcon(t.status) === 'alert-triangle' && <AlertTriangle className="h-4 w-4" />}
                {getStatusIcon(t.status) === 'check-circle' && <CheckCircle className="h-4 w-4" />}
                <span className="font-semibold text-green-900">
                  {getNumeroTermoFormatado(t.tipo_termo, t.numero_sequencial)}
                </span>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(t.tipo_termo)}`}>
                {t.tipo_termo === 'PARALIZACAO_TECNICA' ? 'Paralização' : 
                 t.tipo_termo === 'NOTIFICACAO' ? 'Notificação' : 'Recomendação'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> 
                {t.area_equipamento_atividade}
              </div>
              <span className="text-xs text-gray-500">{formatarData(t.data_termo)}</span>
            </div>
            
            <div className="text-green-900 font-medium text-base">{t.destinatario_nome}</div>
            
            {t.destinatario_empresa && (
              <div className="text-gray-500 text-sm">{t.destinatario_empresa}</div>
            )}
            
            {t.local_atividade && (
              <div className="text-gray-500 text-xs">
                {t.local_atividade.length > 60 
                  ? `${t.local_atividade.substring(0, 60)}...` 
                  : t.local_atividade}
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              {/* Indicador visual de offline/não sincronizado */}
              {(t.offline === true || t.sincronizado === false) && (
                <span 
                  className="inline-block w-3 h-3 bg-yellow-400 border border-yellow-600 rounded mr-1" 
                  title="Termo não sincronizado/offline"
                />
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                {getStatusIcon(t.status) === 'clock' && <Clock className="h-4 w-4" />}
                {getStatusIcon(t.status) === 'alert-triangle' && <AlertTriangle className="h-4 w-4" />}
                {getStatusIcon(t.status) === 'check-circle' && <CheckCircle className="h-4 w-4" />}
                <span className="ml-1">{t.status.replace('_', ' ')}</span>
              </span>
            </div>
            
            <div className="flex flex-row items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                Origem: {t.offline === true || t.sincronizado === false ? 'Offline' : 'Sincronizado'}
              </span>
            </div>
            
            <div className="flex gap-2 mt-2">
              {/* ✅ Botão de Sincronização para termos offline */}
              {(t.offline === true || t.sincronizado === false) && onSincronizarTermo && (
                <button
                  onClick={() => onSincronizarTermo(t)}
                  className="flex-1 px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs flex items-center justify-center gap-1"
                  title="Sincronizar termo offline"
                >
                  <Wifi className="h-4 w-4" /> Sincronizar
                </button>
              )}
              <button
                onClick={() => visualizarTermo(t.id!)}
                className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs flex items-center justify-center gap-1"
                title="Visualizar preview"
              >
                <Eye className="h-4 w-4" /> Preview
              </button>
              
              <button
                onClick={() => editarTermo(t)}
                className="flex-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs flex items-center justify-center gap-1"
                title="Editar termo"
              >
                <Edit className="h-4 w-4" /> Editar
              </button>
              
              <button
                onClick={() => handleGerarRelatorio({ 
                  ...t, 
                  numero_sequencial: typeof t.numero_sequencial === 'string' 
                    ? Number(t.numero_sequencial) 
                    : t.numero_sequencial 
                })}
                className="flex-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs flex items-center justify-center gap-1"
                title="Gerar PDF"
              >
                <Download className="h-4 w-4" /> PDF
              </button>
              
              <button
                onClick={() => handleExcluirTermo({ 
                  ...t, 
                  numero_sequencial: typeof t.numero_sequencial === 'string' 
                    ? Number(t.numero_sequencial) 
                    : t.numero_sequencial 
                })}
                className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs flex items-center justify-center gap-1"
                title="Excluir termo"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 