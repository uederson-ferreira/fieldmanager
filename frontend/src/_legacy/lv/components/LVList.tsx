// ===================================================================
// COMPONENTE DE LISTA UNIFICADA PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/components/LVList.tsx
// ===================================================================

import React, { useEffect, useState } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Calendar,
  MapPin,
  User,
  RefreshCw,
  Plus,
  AlertTriangle
} from 'lucide-react';
import type { LVBase, LVConfig } from '../types/lv';
import { lvAPI } from '../../../lib/lvAPI';

interface LVListProps {
  lvsRealizados: LVBase[];
  configuracao: LVConfig;
  loadingLvs: boolean;
  onVisualizar: (lv: LVBase) => void;
  onEditar: (lv: LVBase) => Promise<void>;
  onExcluir: (lv: LVBase) => Promise<void>;
  onGerarPDF: (lv: LVBase) => Promise<void>;
  onNovoLV: () => void;
  onRefresh: () => void;
}

const LVList: React.FC<LVListProps> = ({
  lvsRealizados,
  configuracao,
  loadingLvs,
  onVisualizar,
  onEditar,
  onExcluir,
  onGerarPDF,
  onNovoLV,
  onRefresh,
}) => {
  // Estado para armazenar contagem de NCs pendentes por LV
  const [ncsPendentes, setNcsPendentes] = useState<Record<string, number>>({});

  // Buscar contagem de NCs pendentes para cada LV
  useEffect(() => {
    const buscarNcsPendentes = async () => {
      const counts: Record<string, number> = {};

      for (const lv of lvsRealizados) {
        if (lv.id) {
          const response = await lvAPI.getNcsPendentesCount(lv.id);
          if (response.success && response.data) {
            counts[lv.id] = response.data.count;
          }
        }
      }

      setNcsPendentes(counts);
    };

    if (lvsRealizados.length > 0) {
      buscarNcsPendentes();
    }
  }, [lvsRealizados]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarNumeroLV = (numero?: number) => {
    // Se numero é 0, undefined ou null, significa que está offline aguardando sincronização
    if (!numero || numero === 0) {
      return 'Pendente';
    }
    return `LV-${numero.toString().padStart(4, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
              {configuracao.nomeCompleto}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-2">{configuracao.revisao}</p>
            <p className="text-xs sm:text-sm text-gray-500">Data da Revisão: {configuracao.dataRevisao}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={loadingLvs}
              className={`w-10 h-10 bg-green-600 text-white rounded-lg transition-colors shadow-md flex items-center justify-center ${
                loadingLvs ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Atualizar lista"
            >
              <RefreshCw className={`h-5 w-5 ${loadingLvs ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onNovoLV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Verificação</span>
            </button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {lvsRealizados.length}
            </div>
            <div className="text-xs text-blue-700">Total de LVs</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {lvsRealizados.filter(lv => lv.data_lv).length}
            </div>
            <div className="text-xs text-green-700">Com Data</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {configuracao.itens.length}
            </div>
            <div className="text-xs text-orange-700">Itens de Verificação</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {lvsRealizados.filter(lv => lv.local_atividade).length}
            </div>
            <div className="text-xs text-purple-700">Com Local</div>
          </div>
        </div>
      </div>

      {/* Lista de LVs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Verificações Realizadas
        </h3>

        {loadingLvs ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Carregando verificações...</span>
          </div>
        ) : lvsRealizados.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma verificação encontrada
            </h4>
            <p className="text-gray-600 mb-4">
              Comece criando sua primeira verificação
            </p>
            <button
              onClick={onNovoLV}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Criar Primeira Verificação</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lvsRealizados.map((lv) => {
              const isPendente = !lv.numero_sequencial || lv.numero_sequencial === 0;

              return (
              <div
                key={lv.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isPendente
                    ? 'border-yellow-300 bg-yellow-50/30'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Informações principais */}
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {formatarNumeroLV(lv.numero_sequencial)}
                      </h4>

                      {/* Badge de status offline/sincronização pendente */}
                      {(!lv.numero_sequencial || lv.numero_sequencial === 0) && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Aguardando Sincronização
                        </span>
                      )}

                      {/* Badge de data */}
                      {lv.data_lv && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatarData(lv.data_lv)}
                        </span>
                      )}

                      {/* Badge de NCs Pendentes */}
                      {lv.id && ncsPendentes[lv.id] > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1 font-medium border border-red-300">
                          <AlertTriangle className="h-3 w-3" />
                          {ncsPendentes[lv.id]} NC{ncsPendentes[lv.id] > 1 ? 's' : ''} Pendente{ncsPendentes[lv.id] > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                      {lv.local_atividade && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{lv.local_atividade}</span>
                        </div>
                      )}
                      
                      {lv.usuario_id && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>ID: {lv.usuario_id}</span>
                        </div>
                      )}
                      
                      {lv.created_at && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Criado: {formatarData(lv.created_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onVisualizar(lv)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onEditar(lv)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onGerarPDF(lv)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Gerar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onExcluir(lv)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Informações adicionais */}
                {lv.updated_at && lv.updated_at !== lv.created_at && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Atualizado: {formatarData(lv.updated_at)}</span>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LVList; 