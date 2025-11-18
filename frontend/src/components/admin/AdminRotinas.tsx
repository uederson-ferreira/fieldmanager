// ===================================================================
// COMPONENTE ADMIN ROTINAS - ECOFIELD SYSTEM
// Localização: src/components/admin/AdminRotinas.tsx
// Módulo: Administração de Rotinas
// Versão: 2.0 - Refatorado com subcomponentes modulares
// ===================================================================

import React, { useMemo } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAdminRotinas } from '../../hooks/useAdminRotinas';
import { AdminRotinasAcoes } from './AdminRotinasAcoes';
import { AdminRotinasTabela } from './AdminRotinasTabela';
import { AdminRotinasForm } from './AdminRotinasForm';

const AdminRotinas: React.FC = () => {
  const {
    // Estado
    rotinas,
    loading,
    error,
    showForm,
    form,
    editId,
    saving,

    // Ações
    fetchRotinas,
    openForm,
    closeForm,
    handleSave,
    handleDelete,
    setForm,
    clearError
  } = useAdminRotinas();

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = rotinas.length;
    const concluidas = rotinas.filter(r => r.status === 'concluida' || r.status === 'concluído').length;
    const pendentes = rotinas.filter(r => r.status === 'pendente').length;
    const emAndamento = rotinas.filter(r => r.status === 'em_andamento' || r.status === 'iniciada').length;

    // Calcular total de não conformidades
    const totalNaoConformidades = rotinas.reduce((acc, r) => {
      return acc + (r.total_nao_conformes || 0);
    }, 0);

    return { total, concluidas, pendentes, emAndamento, totalNaoConformidades };
  }, [rotinas]);

  return (
    <div className="space-y-6">
      {/* Componente de Ações */}
      <AdminRotinasAcoes
        onNovaRotina={() => openForm()}
        onRefresh={fetchRotinas}
        loading={loading}
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Rotinas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-green-700">{stats.concluidas}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.emAndamento}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Não Conformidades</p>
              <p className="text-2xl font-bold text-red-700">{stats.totalNaoConformidades}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-xs underline hover:no-underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Componente de Tabela */}
      <AdminRotinasTabela
        rotinas={rotinas}
        onEdit={openForm}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Componente de Formulário */}
      <AdminRotinasForm
        showForm={showForm}
        form={form}
        editId={editId}
        saving={saving}
        error={error}
        onClose={closeForm}
        onSave={handleSave}
        onFormChange={setForm}
        onClearError={clearError}
      />
    </div>
  );
};

export default AdminRotinas; 