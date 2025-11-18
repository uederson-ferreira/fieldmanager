// ===================================================================
// COMPONENTE ATIVIDADES ROTINA CONTAINER - ECOFIELD SYSTEM
// Localização: src/components/tecnico/AtividadesRotinaContainer.tsx
// Módulo: Atividades de Rotina (Container Principal)
// Versão: 3.0 - Refatorado com estrutura moderna igual a Termos
// ===================================================================

import React from 'react';
import { ArrowLeft, Plus, Wifi } from 'lucide-react';
import { useAtividadesRotina } from '../../hooks/useAtividadesRotina';
import { useLVSyncStatus } from '../../hooks/useLVSyncStatus';
import { AtividadesRotinaList } from './AtividadesRotinaList';
import { AtividadesRotinaForm } from './AtividadesRotinaForm';
import { AtividadesRotinaModals } from './AtividadesRotinaModals';
import type { UserData } from '../../types/entities';

interface AtividadesRotinaContainerProps {
  user: UserData;
  onBack: () => void;
}

const AtividadesRotinaContainer: React.FC<AtividadesRotinaContainerProps> = ({
  user,
  onBack
}) => {
  const {
    // Estados principais
    viewMode,
    atividades,
    areas,
    encarregados,
    empresas,
    loading,
    saving,
    searchTerm,
    statusFilter,
    editingId,
    rotinasOfflineCount,
    isOnline,

    // Estados de formulário
    formData,

    // Estados de modais
    showAreaModal,
    showEncarregadoModal,
    showEmpresaModal,
    showStatusModal,
    areaForm,
    encarregadoForm,
    empresaForm,
    statusForm,

    // Ações principais
    setViewMode,
    handleInputChange,
    resetForm,
    handleEdit,
    handleSave,
    handleDelete,
    shareViaWhatsApp,
    handleDownloadData,

    // Ações de modais
    openModal,
    closeModal,
    handleSaveArea,
    handleSaveEncarregado,
    handleSaveEmpresa,
    handleSaveStatus,
    handleAreaFormChange,
    handleEncarregadoFormChange,
    handleEmpresaFormChange,
    handleStatusFormChange,

    // Ações de filtros
    setSearchTerm,
    setStatusFilter,
  } = useAtividadesRotina(user);

  // Hook para sincronização
  const { rotinasPendentes, syncing, syncNow } = useLVSyncStatus();

  // Handlers do hook já são usados diretamente

  // Handler para nova atividade
  const handleNewActivity = () => {
    resetForm();
    setViewMode('form');
  };

  // Handler para cancelar formulário
  const handleCancelForm = () => {
    resetForm();
    setViewMode('list');
  };

  // ===================================================================
  // 🚀 NAVEGAÇÃO: Se formulário ativo, mostrar apenas o formulário
  // ===================================================================
  if (viewMode === 'form') {
    return (
      <>
        <AtividadesRotinaForm
          formData={formData}
          areas={areas}
          encarregados={encarregados}
          empresas={empresas}
          editingId={editingId}
          saving={saving}
          onInputChange={handleInputChange}
          onSave={handleSave}
          onCancel={handleCancelForm}
          onOpenModal={openModal}
        />
        
        {/* Modais também no formulário */}
        <AtividadesRotinaModals
          showAreaModal={showAreaModal}
          showEncarregadoModal={showEncarregadoModal}
          showEmpresaModal={showEmpresaModal}
          showStatusModal={showStatusModal}
          areaForm={areaForm}
          encarregadoForm={encarregadoForm}
          empresaForm={empresaForm}
          statusForm={statusForm}
          onCloseModal={closeModal}
          onSaveArea={handleSaveArea}
          onSaveEncarregado={handleSaveEncarregado}
          onSaveEmpresa={handleSaveEmpresa}
          onSaveStatus={handleSaveStatus}
          onAreaFormChange={handleAreaFormChange}
          onEncarregadoFormChange={handleEncarregadoFormChange}
          onEmpresaFormChange={handleEmpresaFormChange}
          onStatusFormChange={handleStatusFormChange}
        />
      </>
    );
  }

  // ===================================================================
  // 📋 LISTA: Se formulário inativo, mostrar apenas a lista
  // ===================================================================
  return (
    <>
      <div className="min-h-screen bg-green-50 overflow-x-hidden w-full py-4 sm:py-8">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-green-900">
                  Atividades de Rotina
                </h1>
                <p className="text-green-600 mt-1">
                  Consulta e acompanhamento de atividades programadas
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-green-600 bg-green-50 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </button>
                <button
                  onClick={handleNewActivity}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atividade
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Array.isArray(atividades) ? atividades.length : 0}
                </div>
                <div className="text-sm text-gray-600">Total de Atividades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Array.isArray(atividades) ? atividades.filter(a => a.status === 'Planejada').length : 0}
                </div>
                <div className="text-sm text-gray-600">Planejadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Array.isArray(atividades) ? atividades.filter(a => a.status === 'Em Andamento').length : 0}
                </div>
                <div className="text-sm text-gray-600">Em Andamento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Array.isArray(atividades) ? atividades.filter(a => a.status === 'Concluída').length : 0}
                </div>
                <div className="text-sm text-gray-600">Concluídas</div>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por atividade, área, encarregado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              {/* Filtro de Status */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Planejada">Planejada</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>
              
              {/* Botão Sincronização */}
              {rotinasPendentes > 0 && (
                <button
                  onClick={syncNow}
                  disabled={syncing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Wifi className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : `Sincronizar (${rotinasPendentes})`}
                </button>
              )}
              
              {/* Botão Download */}
              <button
                onClick={handleDownloadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Download
              </button>
            </div>
          </div>

          {/* Lista de Atividades */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <AtividadesRotinaList
              atividades={atividades}
              areas={areas}
              encarregados={encarregados}
              empresas={empresas}
              loading={loading}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              isOnline={isOnline}
              rotinasOfflineCount={rotinasOfflineCount}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onNewActivity={handleNewActivity}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={shareViaWhatsApp}
              onDownload={handleDownloadData}
              onBack={onBack}
            />
          </div>
        </div>
      </div>

      {/* Modais */}
      <AtividadesRotinaModals
        showAreaModal={showAreaModal}
        showEncarregadoModal={showEncarregadoModal}
        showEmpresaModal={showEmpresaModal}
        showStatusModal={showStatusModal}
        areaForm={areaForm}
        encarregadoForm={encarregadoForm}
        empresaForm={empresaForm}
        statusForm={statusForm}
        onCloseModal={closeModal}
        onSaveArea={handleSaveArea}
        onSaveEncarregado={handleSaveEncarregado}
        onSaveEmpresa={handleSaveEmpresa}
        onSaveStatus={handleSaveStatus}
        onAreaFormChange={handleAreaFormChange}
        onEncarregadoFormChange={handleEncarregadoFormChange}
        onEmpresaFormChange={handleEmpresaFormChange}
        onStatusFormChange={handleStatusFormChange}
      />
    </>
  );
};

export default AtividadesRotinaContainer; 