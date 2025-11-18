// ===================================================================
// APP SIMPLIFICADO
// ===================================================================

// Arquivo: src/AppSimple.tsx

import React, { Suspense } from 'react';
import useAuth from './hooks/useAuth';
import LoginSimple from './components/LoginSimple';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy loading dos dashboards
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const TecnicoDashboard = React.lazy(() => import('./components/TecnicoDashboard'));

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner message="Carregando dashboard..." />}>
        {isAdmin ? (
          <AdminDashboard {...dashboardProps} />
        ) : (
          <TecnicoDashboard {...dashboardProps} />
        )}
      </Suspense>
    </div>
  );
};

export default AppSimple;