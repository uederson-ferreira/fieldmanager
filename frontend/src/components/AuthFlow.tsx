// ===================================================================
// FLUXO DE AUTENTICAÇÃO COMPLETO - ECOFIELD SYSTEM
// Localização: src/components/AuthFlow.tsx
// ===================================================================

import React, { useState } from 'react';
import LoginSimple from './LoginSimple';
import ForgotPassword from '../_legacy/components-root/ForgotPassword';
import ResetPassword from '../_legacy/components-root/ResetPassword';
import { authAPI } from '../lib/authAPI';
import useAuth from '../hooks/useAuth';

type AuthScreen = 'login' | 'forgot-password' | 'reset-password';

interface AuthFlowProps {
  onLoginSuccess: (user: any) => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onLoginSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  // ===================================================================
  // HANDLERS DE NAVEGAÇÃO
  // ===================================================================

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log('✅ [AUTH FLOW] Login bem-sucedido');
        // O useAuth já atualizou o estado, não precisamos chamar onLoginSuccess
        return { success: true };
      } else {
        console.error('❌ [AUTH FLOW] Erro no login:', result.error);
        setError(result.error || 'Erro no login');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('💥 [AUTH FLOW] Erro inesperado no login:', error);
      setError('Erro interno do servidor');
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('🔑 [AUTH FLOW] Navegando para recuperação de senha');
    setCurrentScreen('forgot-password');
    setError(null);
  };

  const handleBackToLogin = () => {
    console.log('⬅️ [AUTH FLOW] Voltando para login');
    setCurrentScreen('login');
    setError(null);
  };

  const handleResetPasswordSuccess = () => {
    console.log('✅ [AUTH FLOW] Reset de senha bem-sucedido, voltando para login');
    setCurrentScreen('login');
    setError(null);
  };

  // ===================================================================
  // RENDERIZAÇÃO CONDICIONAL
  // ===================================================================

  switch (currentScreen) {
    case 'forgot-password':
      return (
        <ForgotPassword
          onBack={handleBackToLogin}
          onSuccess={handleBackToLogin}
        />
      );

    case 'reset-password':
      return (
        <ResetPassword
          onBack={handleBackToLogin}
          onSuccess={handleResetPasswordSuccess}
        />
      );

    default:
      return (
        <LoginSimple
          onLogin={handleLogin}
          isLoading={isLoading}
          error={error}
        />
      );
  }
};

export default AuthFlow; 