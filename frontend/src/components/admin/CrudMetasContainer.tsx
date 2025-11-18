// ===================================================================
// CONTAINER PRINCIPAL - CRUD METAS - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetasContainer.tsx
// Módulo: Container principal que orquestra componentes modulares
// ===================================================================

import React from 'react';
import { Target, Plus, BarChart3 } from 'lucide-react';
import { useCrudMetas } from '../../hooks/useCrudMetas';
import { CrudMetasDashboard } from './CrudMetasDashboard';
import { CrudMetasFilters } from './CrudMetasFilters';
import { CrudMetasTable } from './CrudMetasTable';
import { CrudMetasForm } from './CrudMetasForm';
import { CrudMetasAtribuicao } from './CrudMetasAtribuicao';
import { CrudMetasEditarAtribuicao } from './CrudMetasEditarAtribuicao';
import { getTipoMetaLabel, getPeriodoLabel } from '../../types/metas';
import type { UserData } from '../../types/entities';

interface CrudMetasContainerProps {
  user: UserData;
}

export const CrudMetasContainer: React.FC<CrudMetasContainerProps> = ({ user }) => {
  const {
    // Estados
    loading,
    saving,
    showForm,
    showDashboard,
    editId,
    filtros,
    searchTerm,
    dashboard,
    showAtribuicaoModal,
    metaSelecionada,
    tmasDisponiveis,
    atribuicoesSelecionadas,
    filtroUsuario,
    filtroPerfil,
    perfisDisponiveis,
    form,
    formAtribuicao,
    
    // Ações
    openForm,
    closeForm,
    handleSave,
    handleDelete,
    handleToggleStatus,
    handleCalcularProgresso,
    openAtribuicaoModal,
    handleAtribuirMeta,
    handleAtribuirATodosTMAs,
    handleSelecionarTodos,
    handleDesselecionarTodos,
    handleToggleUsuario,
    openEditarAtribuicao,
    closeEditarAtribuicao,
    handleSalvarAtribuicao,
    handleRemoverAtribuicao,
    
    // Setters
    setFiltros,
    setSearchTerm,
    setShowDashboard,
    setForm,
    setFiltroUsuario,
    setFiltroPerfil,
    setShowAtribuicaoModal,
    setFormAtribuicao,
    
    // Utilitários
    getPercentualColor,
    getStatusIcon,
    metasFiltradas,
    showEditarAtribuicaoModal,
    atribuicaoEmEdicao,
    savingAtribuicao
  } = useCrudMetas({ user });

  return (
    <>
      <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-green-900 flex items-center">
                <Target className="h-6 w-6 mr-2" />
                Gerenciamento de Metas
              </h1>
              <p className="text-green-600 mt-1">
                Defina e acompanhe metas para LVs, Termos e Rotinas
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showDashboard ? 'Lista' : 'Dashboard'}
              </button>
              <button
                onClick={() => openForm()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </button>
            </div>
          </div>

          {/* Dashboard de Metas */}
          {showDashboard && dashboard && (
            <CrudMetasDashboard
              dashboard={dashboard}
              getStatusIcon={getStatusIcon}
              getPercentualColor={getPercentualColor}
                      getTipoMetaLabel={(tipo: string) => getTipoMetaLabel(tipo as any)}
        getPeriodoLabel={(periodo: string) => getPeriodoLabel(periodo as any)}
            />
          )}

          {/* Filtros e Busca */}
          <CrudMetasFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtros={filtros}
            setFiltros={setFiltros}
          />

          {/* Tabela de Metas */}
          <CrudMetasTable
            metas={metasFiltradas}
            loading={loading}
            openForm={openForm}
            handleDelete={handleDelete}
            handleToggleStatus={handleToggleStatus}
            handleCalcularProgresso={handleCalcularProgresso}
            openAtribuicaoModal={openAtribuicaoModal}
            handleAtribuirATodosTMAs={handleAtribuirATodosTMAs}
            getPercentualColor={getPercentualColor}
            getStatusIcon={getStatusIcon}
            onEditarAtribuicao={openEditarAtribuicao}
            onRemoverAtribuicao={handleRemoverAtribuicao}
          />
        </div>
      </div>

      {/* Modal de Formulário */}
      <CrudMetasForm
        showForm={showForm}
        closeForm={closeForm}
        handleSave={handleSave}
        editId={editId}
        form={form}
        setForm={setForm}
        saving={saving}
      />

      <CrudMetasEditarAtribuicao
        isOpen={showEditarAtribuicaoModal}
        onClose={closeEditarAtribuicao}
        meta={atribuicaoEmEdicao?.meta}
        atribuicao={atribuicaoEmEdicao?.atribuicao}
        form={formAtribuicao}
        onChange={setFormAtribuicao}
        onSubmit={handleSalvarAtribuicao}
        saving={savingAtribuicao}
      />

             {/* Modal de Atribuição Individual */}
       <CrudMetasAtribuicao
         showAtribuicaoModal={showAtribuicaoModal}
         setShowAtribuicaoModal={setShowAtribuicaoModal}
        metaSelecionada={metaSelecionada}
        tmasDisponiveis={tmasDisponiveis}
        atribuicoesSelecionadas={atribuicoesSelecionadas}
        filtroUsuario={filtroUsuario}
        setFiltroUsuario={setFiltroUsuario}
        filtroPerfil={filtroPerfil}
        setFiltroPerfil={setFiltroPerfil}
        perfisDisponiveis={perfisDisponiveis}
        handleAtribuirMeta={handleAtribuirMeta}
        handleSelecionarTodos={handleSelecionarTodos}
        handleDesselecionarTodos={handleDesselecionarTodos}
        handleToggleUsuario={handleToggleUsuario}
      />
    </>
  );
}; 