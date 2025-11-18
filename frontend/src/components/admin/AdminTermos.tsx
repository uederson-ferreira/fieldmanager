// ===================================================================
// COMPONENTE ADMIN TERMOS - ECOFIELD SYSTEM
// Localização: src/components/admin/AdminTermos.tsx
// Módulo: Administração de Termos Ambientais
// Versão: 2.0 - Refatorado com subcomponentes modulares
// ===================================================================

import React, { useMemo } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAdminTermos } from '../../hooks/useAdminTermos';
import { AdminTermosAcoes } from './AdminTermosAcoes';
import { AdminTermosFiltro } from './AdminTermosFiltro';
import { AdminTermosTabela } from './AdminTermosTabela';

const AdminTermos: React.FC = () => {
  const {
    // Estado
    termos,
    loading,
    selecionados,
    mensagem,
    filtros,

    // Ações
    fetchTermos,
    handleSelecionar,
    handleExcluir,
    handleExcluirLote,
    setFiltros,
    limparFiltros,
    limparMensagem
  } = useAdminTermos();

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = termos.length;
    const notificacoes = termos.filter(t => t.tipo_termo === 'notificacao').length;
    const paralizacoes = termos.filter(t => t.tipo_termo === 'paralizacao').length;
    const recomendacoes = termos.filter(t => t.tipo_termo === 'recomendacao').length;
    const pendentes = termos.filter(t => t.status === 'pendente' || t.status === 'aberto').length;
    const concluidos = termos.filter(t => t.status === 'concluido' || t.status === 'resolvido').length;

    return { total, notificacoes, paralizacoes, recomendacoes, pendentes, concluidos };
  }, [termos]);

  return (
    <div className="space-y-6">
      {/* Componente de Ações */}
      <AdminTermosAcoes
        selecionados={selecionados}
        onExcluirLote={handleExcluirLote}
        onRefresh={fetchTermos}
        loading={loading}
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Termos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paralizações</p>
              <p className="text-2xl font-bold text-red-700">{stats.paralizacoes}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Notificações</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.notificacoes}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recomendações</p>
              <p className="text-2xl font-bold text-green-700">{stats.recomendacoes}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Componente de Filtros */}
      <AdminTermosFiltro
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Mensagem de Status */}
      {mensagem && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          mensagem.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : mensagem.includes('⚠️') 
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {mensagem}
          <button 
            onClick={limparMensagem}
            className="ml-2 text-xs underline hover:no-underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Componente de Tabela */}
      <AdminTermosTabela
        termos={termos}
        selecionados={selecionados}
        onSelecionar={handleSelecionar}
        onExcluir={handleExcluir}
        loading={loading}
      />
    </div>
  );
};

export default AdminTermos;