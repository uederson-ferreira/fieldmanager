// ===================================================================
// COMPONENTE DE FILTROS DE EXECUÇÕES - FIELDMANAGER v2.0
// Localização: src/components/common/FiltrosExecucoes.tsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Search, Filter, X, Calendar, FileText, CheckCircle,
  FileX, SlidersHorizontal, Download, ChevronDown, ChevronUp
} from 'lucide-react';

// ===================================================================
// INTERFACES
// ===================================================================

export interface FiltrosState {
  busca: string;
  dataInicio: string;
  dataFim: string;
  status: 'todos' | 'rascunho' | 'concluido';
  moduloId: string;
  dominioId: string;
  ordenacao: 'data_desc' | 'data_asc' | 'conformidade_desc' | 'conformidade_asc' | 'modulo_asc';
}

interface FiltrosExecucoesProps {
  filtros: FiltrosState;
  onFiltrosChange: (filtros: FiltrosState) => void;
  modulos: Array<{ id: string; nome: string }>;
  dominios: Array<{ id: string; nome: string; icone: string }>;
  totalExecucoes: number;
  execucoesVisiveis: number;
  onExportar?: () => void;
}

// Presets de período
const PRESETS_PERIODO = [
  { label: 'Hoje', dias: 0 },
  { label: 'Últimos 7 dias', dias: 7 },
  { label: 'Últimos 30 dias', dias: 30 },
  { label: 'Últimos 90 dias', dias: 90 },
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function FiltrosExecucoes({
  filtros,
  onFiltrosChange,
  modulos,
  dominios,
  totalExecucoes,
  execucoesVisiveis,
  onExportar
}: FiltrosExecucoesProps) {
  const [expandido, setExpandido] = useState(false);
  const [buscaLocal, setBuscaLocal] = useState(filtros.busca);

  // Debounce da busca (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (buscaLocal !== filtros.busca) {
        onFiltrosChange({ ...filtros, busca: buscaLocal });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [buscaLocal]);

  // Atualizar filtro
  const atualizarFiltro = (campo: keyof FiltrosState, valor: string) => {
    onFiltrosChange({ ...filtros, [campo]: valor });
  };

  // Aplicar preset de período
  const aplicarPreset = (dias: number) => {
    const hoje = new Date();
    const dataFim = hoje.toISOString().split('T')[0];

    let dataInicio: string;
    if (dias === 0) {
      dataInicio = dataFim;
    } else {
      const inicio = new Date();
      inicio.setDate(inicio.getDate() - dias);
      dataInicio = inicio.toISOString().split('T')[0];
    }

    onFiltrosChange({ ...filtros, dataInicio, dataFim });
  };

  // Limpar todos os filtros
  const limparFiltros = () => {
    setBuscaLocal('');
    onFiltrosChange({
      busca: '',
      dataInicio: '',
      dataFim: '',
      status: 'todos',
      moduloId: '',
      dominioId: '',
      ordenacao: 'data_desc'
    });
  };

  // Contar filtros ativos
  const contarFiltrosAtivos = (): number => {
    let count = 0;
    if (filtros.busca) count++;
    if (filtros.dataInicio || filtros.dataFim) count++;
    if (filtros.status !== 'todos') count++;
    if (filtros.moduloId) count++;
    if (filtros.dominioId) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header Compacto */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Busca */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por local, responsável, observações..."
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
                className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {buscaLocal && (
                <button
                  onClick={() => setBuscaLocal('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2">
            {/* Botão Expandir Filtros */}
            <button
              onClick={() => setExpandido(!expandido)}
              className={`
                px-4 py-2 rounded-lg border transition-colors flex items-center gap-2
                ${filtrosAtivos > 0
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros</span>
              {filtrosAtivos > 0 && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                  {filtrosAtivos}
                </span>
              )}
              {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Botão Exportar */}
            {onExportar && (
              <button
                onClick={onExportar}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                title="Exportar para CSV"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            )}
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mt-3 text-sm text-gray-600">
          Mostrando <span className="font-semibold text-gray-900">{execucoesVisiveis}</span> de{' '}
          <span className="font-semibold text-gray-900">{totalExecucoes}</span> execuções
          {filtrosAtivos > 0 && (
            <button
              onClick={limparFiltros}
              className="ml-3 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Filtros Expandidos */}
      {expandido && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro de Período - Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Período Rápido
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS_PERIODO.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => aplicarPreset(preset.dias)}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Período - Customizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => atualizarFiltro('dataInicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => atualizarFiltro('dataFim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filtro de Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) => atualizarFiltro('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todos">Todos os status</option>
                <option value="concluido">✅ Concluído</option>
                <option value="rascunho">📝 Rascunho</option>
              </select>
            </div>

            {/* Filtro de Domínio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SlidersHorizontal className="h-4 w-4 inline mr-1" />
                Domínio
              </label>
              <select
                value={filtros.dominioId}
                onChange={(e) => atualizarFiltro('dominioId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos os domínios</option>
                {dominios.map((dominio) => (
                  <option key={dominio.id} value={dominio.id}>
                    {dominio.icone} {dominio.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Módulo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Módulo
              </label>
              <select
                value={filtros.moduloId}
                onChange={(e) => atualizarFiltro('moduloId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos os módulos</option>
                {modulos.map((modulo) => (
                  <option key={modulo.id} value={modulo.id}>
                    {modulo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => atualizarFiltro('ordenacao', 'data_desc')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    filtros.ordenacao === 'data_desc'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📅 Mais Recentes
                </button>
                <button
                  onClick={() => atualizarFiltro('ordenacao', 'data_asc')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    filtros.ordenacao === 'data_asc'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📅 Mais Antigas
                </button>
                <button
                  onClick={() => atualizarFiltro('ordenacao', 'conformidade_desc')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    filtros.ordenacao === 'conformidade_desc'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ✅ Maior Conformidade
                </button>
                <button
                  onClick={() => atualizarFiltro('ordenacao', 'conformidade_asc')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    filtros.ordenacao === 'conformidade_asc'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ⚠️ Menor Conformidade
                </button>
                <button
                  onClick={() => atualizarFiltro('ordenacao', 'modulo_asc')}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    filtros.ordenacao === 'modulo_asc'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📋 Módulo (A-Z)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
