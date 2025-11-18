// ===================================================================
// DASHBOARD NAVIGATION - ECOFIELD SYSTEM
// Localização: src/components/dashboard/DashboardNavigation.tsx
// ===================================================================

import React from 'react';
import {
  ChevronDown,
  FileText,
  Clock,
  History,
  Wrench,
  Target,
  AlertCircle,
} from 'lucide-react';
import { useDashboard } from './DashboardProvider';
import { useLVSyncStatus } from '../../hooks/useLVSyncStatus';

import type { ActiveSection } from './DashboardProvider';

const DashboardNavigation: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    mobileMenuOpen,
    setMobileMenuOpen,
    toolsDropdownOpen,
    setToolsDropdownOpen,
    handleBackToDashboard,
  } = useDashboard();

  // Hook para sincronização - usado para badges
  const { termosPendentes, rotinasPendentes } = useLVSyncStatus();

  const handleNavigation = (section: ActiveSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Navegação Horizontal - Desktop e Tablet */}
      <nav className="hidden md:block bg-white border-b border-primary-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo do App */}
            <div className="flex items-center">

            </div>
            
            {/* Navegação */}
            <div className="flex items-center space-x-1 lg:space-x-2">
              {/* Dashboard */}
              <button
                onClick={handleBackToDashboard}
                className={`px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  activeSection === "dashboard"
                    ? "bg-primary-600 text-white"
                    : "text-primary-600 bg-primary-50 border border-primary-600 hover:bg-primary-600 hover:text-white"
                }`}
              >
                Dashboard
              </button>

              {/* LVs */}
              <button
                onClick={() => handleNavigation("lvs")}
                className={`px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2 ${
                  activeSection === "lvs"
                    ? "bg-secondary-600 text-white"
                    : "text-secondary-600 bg-secondary-50 border border-secondary-600 hover:bg-secondary-600 hover:text-white"
                }`}
              >
                <FileText className="h-3 w-3 md:h-4 md:w-4" />
                <span>LVs</span>
              </button>

              {/* Rotina */}
              <button
                onClick={() => handleNavigation("rotina")}
                className={`px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2 relative ${
                  activeSection === "rotina"
                    ? "bg-warning-600 text-white"
                    : "text-warning-600 bg-warning-50 border border-warning-600 hover:bg-warning-600 hover:text-white"
                }`}
              >
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                <span>Rotina</span>
                {/* Badge para rotinas offline */}
                {rotinasPendentes > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold text-[10px] md:text-xs">
                    {rotinasPendentes}
                  </span>
                )}
              </button>

              {/* Termos */}
              <button
                onClick={() => handleNavigation("lista-termos")}
                className={`px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2 relative ${
                  activeSection === "lista-termos"
                    ? "bg-primary-600 text-white"
                    : "text-primary-600 bg-primary-50 border border-primary-600 hover:bg-primary-600 hover:text-white"
                }`}
              >
                <FileText className="h-3 w-3 md:h-4 md:w-4" />
                <span>Termos</span>
                {/* Badge para termos offline */}
                {termosPendentes > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold text-[10px] md:text-xs">
                    {termosPendentes}
                  </span>
                )}
              </button>

              {/* Metas */}
              <button
                onClick={() => handleNavigation("metas")}
                className={`px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2 ${
                  activeSection === "metas"
                    ? "bg-primary-600 text-white"
                    : "text-primary-600 bg-primary-50 border border-primary-600 hover:bg-primary-600 hover:text-white"
                }`}
              >
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                <span>Metas</span>
              </button>

              {/* Ações Corretivas */}
              <button
                onClick={() => handleNavigation("acoes-corretivas")}
                className={`px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2 ${
                  activeSection === "acoes-corretivas"
                    ? "bg-red-600 text-white"
                    : "text-red-600 bg-red-50 border border-red-600 hover:bg-red-600 hover:text-white"
                }`}
              >
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden lg:inline">Ações Corretivas</span>
                <span className="lg:hidden">Ações</span>
              </button>

              {/* Dropdown Ferramentas */}
              <div className="relative">
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className={`px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center space-x-1 md:space-x-2 ${
                    activeSection === "historico" || activeSection === "fotos"
                      ? "bg-primary-600 text-white"
                      : "text-primary-600 bg-primary-50 border border-primary-600 hover:bg-primary-600 hover:text-white"
                  }`}
                >
                  <Wrench className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden lg:inline">Ferramentas</span>
                  <span className="lg:hidden">Tools</span>
                  <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Submenu Desktop */}
                {toolsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-primary-200 rounded-lg shadow-lg z-50 min-w-32">
                    <button
                      onClick={() => handleNavigation("historico")}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2 hover:bg-primary-50 ${
                        activeSection === "historico"
                          ? "bg-primary-600 text-white"
                          : "text-primary-600"
                      }`}
                    >
                      <History className="h-4 w-4" />
                      <span>Histórico</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("fotos")}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-2 hover:bg-primary-50 ${
                        activeSection === "fotos"
                          ? "bg-primary-600 text-white"
                          : "text-primary-600"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Fotos</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-end md:hidden">
          <div className="w-full max-w-sm bg-white h-full shadow-lg flex flex-col safe-area">
            <div className="flex items-center justify-between p-4 border-b border-green-200">
              <span className="font-semibold text-lg text-gray-800">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none shadow-sm flex items-center justify-center"
                aria-label="Fechar menu"
              >
                <div className="flex flex-col justify-center items-center w-5 h-5">
                  <div className="w-5 h-0.5 bg-white transform rotate-45 origin-center"></div>
                  <div className="w-5 h-0.5 bg-white transform -rotate-45 origin-center -mt-0.5"></div>
                </div>
              </button>
            </div>
            <nav className="flex-1 flex flex-col p-4 space-y-2">
              <button
                onClick={() => { setMobileMenuOpen(false); handleBackToDashboard(); }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === "dashboard" ? "bg-green-600 text-white" : "text-green-600 bg-green-50 border border-green-600 hover:bg-green-600 hover:text-white"}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleNavigation("lvs"); }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === "lvs" ? "bg-blue-600 text-white" : "text-blue-600 bg-blue-50 border border-blue-600 hover:bg-blue-600 hover:text-white"}`}
              >
                LVs
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleNavigation("rotina"); }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors relative ${activeSection === "rotina" ? "bg-orange-600 text-white" : "text-orange-600 bg-orange-50 border border-orange-600 hover:bg-orange-600 hover:text-white"}`}
              >
                <div className="flex items-center justify-between">
                  <span>Rotina</span>
                  {/* Badge para rotinas offline */}
                  {rotinasPendentes > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {rotinasPendentes}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleNavigation("lista-termos"); }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors relative ${activeSection === "lista-termos" ? "bg-green-600 text-white" : "text-green-600 bg-green-50 border border-green-600 hover:bg-green-600 hover:text-white"}`}
              >
                <div className="flex items-center justify-between">
                  <span>Termos</span>
                  {/* Badge para termos offline */}
                  {termosPendentes > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {termosPendentes}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleNavigation("metas"); }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === "metas" ? "bg-green-600 text-white" : "text-green-600 bg-green-50 border border-green-600 hover:bg-green-600 hover:text-white"}`}
              >
                Metas
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleNavigation("acoes-corretivas"); }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === "acoes-corretivas" ? "bg-red-600 text-white" : "text-red-600 bg-red-50 border border-red-600 hover:bg-red-600 hover:text-white"}`}
              >
                Ações Corretivas
              </button>
              {/* Dropdown Ferramentas - Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    activeSection === "historico" || activeSection === "fotos"
                      ? "bg-green-600 text-white"
                      : "text-green-600 bg-green-50 border border-green-600 hover:bg-green-600 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4" />
                    <span>Ferramentas</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Submenu Mobile */}
                {toolsDropdownOpen && (
                  <div className="ml-4 space-y-1">
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleNavigation("historico"); setToolsDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        activeSection === "historico"
                          ? "bg-green-600 text-white"
                          : "text-green-600 bg-green-50 border border-green-600 hover:bg-green-600 hover:text-white"
                      }`}
                    >
                      <History className="h-4 w-4" />
                      <span>Histórico</span>
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleNavigation("fotos"); setToolsDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        activeSection === "fotos"
                          ? "bg-green-600 text-white"
                          : "text-green-600 bg-green-50 border border-green-600 hover:bg-green-600 hover:text-white"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Fotos</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
          {/* Clicar fora fecha o menu */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};

export default DashboardNavigation; 