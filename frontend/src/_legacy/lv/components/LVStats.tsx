// ===================================================================
// COMPONENTE DE ESTATÍSTICAS PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/components/LVStats.tsx
// ===================================================================

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  Camera, 
  TrendingUp,
  BarChart3,
  Target,
  AlertCircle
} from 'lucide-react';
import type { LVStats as LVStatsType } from '../types/lv';

interface LVStatsProps {
  stats: LVStatsType;
  totalItens: number;
  loading?: boolean;
  showDetails?: boolean;
  className?: string;
}

const LVStats: React.FC<LVStatsProps> = ({
  stats,
  totalItens,
  loading = false,
  showDetails = true,
  className = '',
}) => {
  const calcularPercentual = (valor: number, total: number): number => {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  };

  const getStatusColor = (percentual: number): string => {
    if (percentual >= 80) return 'text-green-600';
    if (percentual >= 60) return 'text-yellow-600';
    if (percentual >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (percentual: number) => {
    if (percentual >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (percentual >= 60) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    if (percentual >= 40) return <AlertCircle className="h-4 w-4 text-orange-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <span>Estatísticas da Verificação</span>
        </h3>
        
        {getStatusIcon(stats.percentualConformidade)}
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-xl font-bold text-green-600">
            {stats.conformes}
          </div>
          <div className="text-xs text-green-700">Conformes</div>
          <div className="text-xs text-green-600 mt-1">
            {calcularPercentual(stats.conformes, totalItens)}%
          </div>
        </div>

        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-600">
            {stats.naoConformes}
          </div>
          <div className="text-xs text-red-700">Não Conformes</div>
          <div className="text-xs text-red-600 mt-1">
            {calcularPercentual(stats.naoConformes, totalItens)}%
          </div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <MinusCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-xl font-bold text-yellow-600">
            {stats.naoAplicaveis}
          </div>
          <div className="text-xs text-yellow-700">Não Aplicáveis</div>
          <div className="text-xs text-yellow-600 mt-1">
            {calcularPercentual(stats.naoAplicaveis, totalItens)}%
          </div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Camera className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600">
            {stats.fotos}
          </div>
          <div className="text-xs text-blue-700">Fotos</div>
          <div className="text-xs text-blue-600 mt-1">
            {stats.fotos > 0 ? 'Adicionadas' : 'Nenhuma'}
          </div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div className={`text-xl font-bold ${getStatusColor(stats.percentualConformidade)}`}>
            {stats.percentualConformidade}%
          </div>
          <div className="text-xs text-purple-700">Conformidade</div>
          <div className="text-xs text-purple-600 mt-1">
            {stats.total}/{totalItens} itens
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso da Verificação</span>
          <span className="text-sm text-gray-600">
            {stats.total} de {totalItens} itens avaliados
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(stats.total / totalItens) * 100}%` }}
          />
        </div>
      </div>

      {/* Detalhes adicionais */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Detalhes</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Itens avaliados:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Itens pendentes:</span>
                <span className="font-medium">{totalItens - stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de conformidade:</span>
                <span className={`font-medium ${getStatusColor(stats.percentualConformidade)}`}>
                  {stats.percentualConformidade}%
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Fotos capturadas:</span>
                <span className="font-medium">{stats.fotos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Média por item:</span>
                <span className="font-medium">
                  {stats.total > 0 ? (stats.fotos / stats.total).toFixed(1) : '0'} fotos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status geral:</span>
                <span className={`font-medium ${getStatusColor(stats.percentualConformidade)}`}>
                  {stats.percentualConformidade >= 80 ? 'Excelente' :
                   stats.percentualConformidade >= 60 ? 'Bom' :
                   stats.percentualConformidade >= 40 ? 'Atenção' : 'Crítico'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {stats.total < totalItens && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {totalItens - stats.total} itens ainda não avaliados
            </span>
          </div>
        </div>
      )}

      {stats.percentualConformidade < 60 && stats.total > 0 && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              Taxa de conformidade baixa ({stats.percentualConformidade}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LVStats; 