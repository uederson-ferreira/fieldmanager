// ===================================================================
// COMPONENTE ADMIN LVS - ECOFIELD SYSTEM
// Localização: src/components/admin/AdminLVs.tsx
// Módulo: Administração de Listas de Verificação
// Versão: 1.0 - Listagem e visualização de LVs
// ===================================================================

import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Eye, Download, FileText } from 'lucide-react';
import { lvAPI } from '../../lib/lvAPI';
import type { LV } from '../../types/lv';

const AdminLVs: React.FC = () => {
  const [lvs, setLvs] = useState<LV[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Carregar LVs
  const fetchLVs = async () => {
    try {
      setLoading(true);
      const response = await lvAPI.listarLVs();

      if (response.success && response.data) {
        setLvs(response.data);
        console.log(`✅ [Admin LVs] ${response.data.length} LVs carregadas`);
      } else {
        setMensagem('⚠️ Erro ao carregar LVs');
      }
    } catch (error) {
      console.error('❌ [Admin LVs] Erro ao buscar LVs:', error);
      setMensagem('❌ Erro ao carregar LVs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLVs();
  }, []);

  // Filtrar LVs
  const lvsFiltradas = lvs.filter(lv => {
    if (filtroTipo && lv.tipo_lv !== filtroTipo) return false;
    if (filtroStatus && lv.status !== filtroStatus) return false;
    return true;
  });

  // Estatísticas
  const stats = {
    total: lvs.length,
    concluidas: lvs.filter(lv => lv.status === 'concluido' || lv.status === 'concluida').length,
    rascunhos: lvs.filter(lv => lv.status === 'rascunho').length,
    conformidade: lvs.length > 0
      ? Math.round(lvs.reduce((acc, lv) => acc + (lv.percentual_conformidade || 0), 0) / lvs.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listas de Verificação</h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento e visualização de todas as LVs realizadas
          </p>
        </div>
        <button
          onClick={fetchLVs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total de LVs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Concluídas</p>
          <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Rascunhos</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.rascunhos}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Conformidade Média</p>
          <p className="text-2xl font-bold text-blue-600">{stats.conformidade}%</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de LV
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos os tipos</option>
              <option value="01">01 - Resíduos</option>
              <option value="02">02 - Segurança</option>
              <option value="03">03 - Água e Efluentes</option>
              <option value="04">04 - Emissões Atmosféricas</option>
              <option value="05">05 - Ruído</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos os status</option>
              <option value="concluido">Concluído</option>
              <option value="concluida">Concluída</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroTipo('');
                setFiltroStatus('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Mensagem */}
      {mensagem && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          mensagem.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' :
          mensagem.includes('⚠️') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {mensagem}
          <button
            onClick={() => setMensagem('')}
            className="ml-2 text-xs underline hover:no-underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Lista/Tabela Responsiva */}
      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Carregando LVs...</p>
          </div>
        ) : lvsFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Nenhuma LV encontrada</p>
          </div>
        ) : (
          lvsFiltradas.map((lv) => (
            <div key={lv.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    LV-{String(lv.numero_sequencial).padStart(4, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{lv.tipo_lv} - {lv.nome_lv}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  lv.status === 'concluido' || lv.status === 'concluida'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lv.status === 'concluido' || lv.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Área:</span> {lv.area}</div>
                <div><span className="text-gray-500">Responsável:</span> {lv.usuario_nome}</div>
                <div><span className="text-gray-500">Data:</span> {new Date(lv.data_inspecao).toLocaleDateString('pt-BR')}</div>
                <div>
                  <span className="text-gray-500">Conformidade:</span>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${
                          (lv.percentual_conformidade || 0) >= 90 ? 'bg-green-600' :
                          (lv.percentual_conformidade || 0) >= 70 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${lv.percentual_conformidade || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{lv.percentual_conformidade || 0}%</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button className="flex-1 text-blue-600 hover:bg-blue-50 py-2 rounded text-sm flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4" /> Ver
                </button>
                <button className="flex-1 text-purple-600 hover:bg-purple-50 py-2 rounded text-sm flex items-center justify-center gap-1">
                  <Download className="h-4 w-4" /> PDF
                </button>
                <button className="flex-1 text-red-600 hover:bg-red-50 py-2 rounded text-sm flex items-center justify-center gap-1">
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Área
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conformidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Carregando LVs...</p>
                  </td>
                </tr>
              ) : lvsFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nenhuma LV encontrada</p>
                  </td>
                </tr>
              ) : (
                lvsFiltradas.map((lv) => (
                  <tr key={lv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        LV-{String(lv.numero_sequencial).padStart(4, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lv.tipo_lv}</div>
                      <div className="text-xs text-gray-500">{lv.nome_lv}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lv.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lv.usuario_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(lv.data_inspecao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              (lv.percentual_conformidade || 0) >= 90 ? 'bg-green-600' :
                              (lv.percentual_conformidade || 0) >= 70 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${lv.percentual_conformidade || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {lv.percentual_conformidade || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lv.status === 'concluido' || lv.status === 'concluida'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lv.status === 'concluido' || lv.status === 'concluida' ? 'Concluída' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer com info */}
      <div className="text-sm text-gray-600 text-center">
        Mostrando {lvsFiltradas.length} de {lvs.length} LVs
      </div>
    </div>
  );
};

export default AdminLVs;
