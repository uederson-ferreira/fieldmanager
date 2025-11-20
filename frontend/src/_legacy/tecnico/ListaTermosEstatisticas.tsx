// ===================================================================
// COMPONENTE ESTATÍSTICAS DOS TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/ListaTermosEstatisticas.tsx
// Módulo: Estatísticas e cards de resumo dos termos
// ===================================================================

import React from 'react';
import { FileText, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface ListaTermosEstatisticasProps {
  estatisticas: any | null;
}

export const ListaTermosEstatisticas: React.FC<ListaTermosEstatisticasProps> = ({
  estatisticas
}) => {
  if (!estatisticas) return null;

  return (
    <>
      {/* Primeira fila de estatísticas */}
      <div className="bg-green-50 p-4 sm:p-6 rounded-lg shadow-sm border border-green-100 overflow-x-hidden mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center">
          <div className="w-8 h-8 mr-3 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="h-5 w-5 text-white" />
          </div>
          Estatísticas dos Termos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total</p>
                <p className="text-2xl font-bold text-green-800">{estatisticas?.total_termos}</p>
                <p className="text-xs text-gray-500 mt-1">Termos no sistema</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Recomendações</p>
                <p className="text-2xl font-bold text-green-800">{estatisticas?.total_recomendacoes}</p>
                <p className="text-xs text-gray-500 mt-1">Termos de recomendação</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Notificações</p>
                <p className="text-2xl font-bold text-green-800">{estatisticas?.total_notificacoes}</p>
                <p className="text-xs text-gray-500 mt-1">Termos de notificação</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Paralizações</p>
                <p className="text-2xl font-bold text-green-800">{estatisticas?.total_paralizacoes}</p>
                <p className="text-xs text-gray-500 mt-1">Termos de paralização</p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Segunda fila de estatísticas */}
      <div className="bg-green-50 p-4 sm:p-6 rounded-lg shadow-sm border border-green-100 overflow-x-hidden mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center">
          <div className="w-8 h-8 mr-3 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
            <Clock className="h-5 w-5 text-white" />
          </div>
          Status dos Termos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Pendentes</p>
                <p className="text-2xl font-bold text-green-800">{estatisticas?.pendentes}</p>
                <p className="text-xs text-gray-500 mt-1">Aguardando correção</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Corrigidos</p>
                <p className="text-2xl font-bold text-green-800">{estatisticas?.corrigidos}</p>
                <p className="text-xs text-gray-500 mt-1">Problemas resolvidos</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Liberados</p>
                <p className="text-2xl font-bold text-green-800">{estatisticas?.liberados}</p>
                <p className="text-xs text-gray-500 mt-1">Termos liberados</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <XCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 