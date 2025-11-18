// ===================================================================
// DASHBOARD HEADER - ECOFIELD SYSTEM
// Localização: src/components/dashboard/DashboardHeader.tsx
// ===================================================================

import React from 'react';
import { useDashboard } from './DashboardProvider';

import StatusIndicator from '../common/StatusIndicator';
import { SyncButton } from '../common/SyncButton';
import {
  Menu,
  LogOut
} from 'lucide-react';

const DashboardHeader: React.FC = () => {
  const { user, onLogout, mobileMenuOpen, setMobileMenuOpen } = useDashboard();

  return (
    <header className="bg-white shadow-sm border-b border-primary-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors focus:outline-none shadow-sm flex items-center justify-center"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/icon.png" 
                alt="Ecofield" 
                className="w-12 h-12 object-contain"
              />
              <div className="hidden sm:block flex flex-col items-center">
                <h1 className="text-2xl font-bold text-primary-900 leading-tight">Ecofield</h1>
                <p className="text-xs text-primary-600 leading-tight">Sistema de Inspeção e Auditoria</p>
              </div>
            </div>
          </div>

          {/* Status Online/Offline e Sincronização */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <StatusIndicator showSyncStatus={false} />

            {/* Botão de Sincronização Manual */}
            <div className="hidden sm:block">
              <SyncButton showDetails={false} />
            </div>

            {/* Informações do usuário - Mobile */}
            <div className="sm:hidden text-right">
              <p className="text-xs font-medium text-primary-900 leading-tight">
                {user.nome || 'Usuário'}
              </p>
              <p className="text-xs text-primary-500 leading-tight">
                {user.perfil || 'Técnico'}
              </p>
            </div>
          </div>

          {/* Usuário e Logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-primary-900 leading-tight">
                {user.nome || 'Usuário'}
              </p>
              <p className="text-xs text-primary-500 leading-tight mt-0.5">
                ID: {user.id || 'N/A'}
              </p>
              <p className="text-xs text-primary-600 leading-tight mt-0.5">
                {user.perfil || 'Técnico'}
              </p>
            </div>
            
            <button
              onClick={() => {
                console.log("🔘 [DASHBOARD HEADER] Botão de logout clicado");
                try {
                  onLogout();
                  console.log("✅ [DASHBOARD HEADER] Logout executado com sucesso");
                } catch (error) {
                  console.error("❌ [DASHBOARD HEADER] Erro no logout:", error);
                }
              }}
              className="w-8 h-8 bg-primary-600 text-white transition-colors touch-spacing shadow-sm rounded-lg flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 