// ===================================================================
// APP SIMPLIFICADO - SEM LAZY LOADING
// Localização: src/App.tsx
// ===================================================================

import React from 'react';
import useAuth from './hooks/useAuth';
import LoginSimple from './components/LoginSimple';
import LoadingSpinner from './components/common/LoadingSpinner';
import InstallPWA from './components/common/InstallPWA';

// Imports diretos (sem lazy loading)
import AdminDashboard from './components/AdminDashboard';
import TecnicoDashboard from './components/TecnicoDashboard';

const AppSimple: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    logout,
    isAdmin
  } = useAuth();

  console.log('🔄 [APP SIMPLE] Estado atual:', {
    isAuthenticated,
    userId: user?.id,
    userName: user?.nome,
    isAdmin,
    isLoading
  });

  // ===================================================================
  // CARREGAMENTO INICIAL
  // ===================================================================
  
  if (isLoading) {
    return <LoadingSpinner message="Inicializando sistema..." />;
  }

  // ===================================================================
  // TELA DE LOGIN
  // ===================================================================
  
  if (!isAuthenticated || !user) {
    return (
      <LoginSimple 
        onLogin={login}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // ===================================================================
  // DASHBOARDS COM loginInfo CORRIGIDO
  // ===================================================================
  
  console.log('✅ [APP SIMPLE] Usuário autenticado, renderizando dashboard');
  console.log('📍 [APP SIMPLE] Perfil:', user.perfil, 'isAdmin:', isAdmin);

  // Props padrão para os dashboards
  const dashboardProps = {
    user,
    onLogout: logout,
    loginInfo: {
      method: "supabase" as const,
      isSupabase: true,
      isDemo: false,
      source: "Sistema Simplificado",
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO DIRETA DOS DASHBOARDS
  // ===================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? (
        <AdminDashboard {...dashboardProps} />
      ) : (
        <TecnicoDashboard {...dashboardProps} />
      )}

      {/* Prompt de instalação PWA */}
      <InstallPWA />
    </div>
  );
};

export default AppSimple;