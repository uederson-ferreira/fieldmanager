// ===================================================================
// COMPONENTE DASHBOARD DE METAS - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetasDashboard.tsx
// Módulo: Dashboard com estatísticas e metas em destaque
// ===================================================================

import React from 'react';
import { Target, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import type { DashboardMetas } from '../../types/metas';

interface CrudMetasDashboardProps {
  dashboard: DashboardMetas;
  getStatusIcon: (status: string) => string;
  getPercentualColor: (percentual: number) => string;
  getTipoMetaLabel: (tipo: string) => string;
  getPeriodoLabel: (periodo: string) => string;
}

export const CrudMetasDashboard: React.FC<CrudMetasDashboardProps> = ({
  dashboard,
  getStatusIcon,
  getPercentualColor,
  getTipoMetaLabel,
  getPeriodoLabel
}) => {
  return (
    <div className="mb-8 space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total de Metas</p>
              <p className="text-2xl font-bold text-green-900">{dashboard.resumo_geral.total_metas}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {dashboard.resumo_geral.metas_alcancadas} alcançadas
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">% Alcançamento</p>
              <p className="text-2xl font-bold text-blue-900">
                {dashboard.resumo_geral.percentual_geral.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Meta geral do sistema
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Vencendo</p>
              <p className="text-2xl font-bold text-yellow-900">{dashboard.metas_vencendo.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Próximas do prazo
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Atrasadas</p>
              <p className="text-2xl font-bold text-red-900">{dashboard.metas_atrasadas.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Fora do prazo
            </p>
          </div>
        </div>
      </div>

      {/* Metas em Destaque */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Metas em Destaque</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dashboard.metas_destaque.map((meta) => (
              <div key={meta.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                                     <div className="flex items-center gap-2">
                     <div className={`h-4 w-4 bg-${getStatusIcon(meta.ativa ? 'em_andamento' : 'nao_alcancada')}-500 rounded-full`} />
                     <h4 className="font-medium text-gray-900">{meta.descricao}</h4>
                    <span className="text-sm text-gray-500">
                      ({getTipoMetaLabel(meta.tipo_meta)})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {meta.meta_quantidade} unidades • {getPeriodoLabel(meta.periodo)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getPercentualColor(meta.percentual_alcancado || 0)}`}>
                    {(meta.percentual_alcancado || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {meta.quantidade_atual || 0} / {meta.meta_quantidade}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 