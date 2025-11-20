// ===================================================================
// COMPONENTE DE LOGIN SIMPLIFICADO ESTILIZADO - FIELDMANAGER v2.0
// Localização: src/components/LoginSimple.tsx
// ===================================================================

import React, { useState } from 'react';
import { User, Lock, AlertCircle, Shield, TestTube, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePasswordStrength } from '../utils/authUtils';
import ForgotPassword from '../_legacy/components-root/ForgotPassword';

interface LoginSimpleProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

const LoginSimple: React.FC<LoginSimpleProps> = ({ onLogin, isLoading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ===================================================================
  // CREDENCIAIS DE TESTE
  // ===================================================================

  const handleTestCredentials1 = () => {
    setFormData({
      email: 'tecnico@fieldmanager.dev',
      password: 'Tecnico@2025'
    });
    setValidationErrors([]);
  };

  const handleTestCredentials2 = () => {
    setFormData({
      email: 'supervisor@fieldmanager.dev',
      password: 'Super@2025'
    });
    setValidationErrors([]);
  };

  const handleTestCredentials3 = () => {
    setFormData({
      email: 'admin@fieldmanager.dev',
      password: 'Admin@2025'
    });
    setValidationErrors([]);
  };

  // ===================================================================
  // VALIDAÇÕES EM TEMPO REAL
  // ===================================================================

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validar email
    if (!formData.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!validateEmail(formData.email)) {
      errors.push('Formato de email inválido');
    }

    // Validar senha (com email para verificar se é usuário existente)
    if (!formData.password) {
      errors.push('Senha é obrigatória');
    } else {
      const passwordValidation = validatePasswordStrength(formData.password, formData.email);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // ===================================================================
  // SUBMIT DO FORMULÁRIO
  // ===================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setValidationErrors([]);

    // ✅ VALIDAÇÃO COMPLETA
    if (!validateForm()) {
      return;
    }

    console.log('📝 [LOGIN SIMPLE] Enviando dados de login...');
    
    // Chamar função de login
    const result = await onLogin(formData.email.trim(), formData.password);
    
    if (!result.success) {
      setLocalError(result.error || 'Erro no login');
    }
  };

  const displayError = localError || error;

  // Renderizar ForgotPassword se solicitado
  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBack={() => setShowForgotPassword(false)}
        onSuccess={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center overflow-x-hidden w-full p-2 sm:p-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        
        {/* HEADER */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/icon.png" 
              alt="FieldManager Logo" 
              className="h-28 w-28 object-contain"
              onError={(e) => {
                console.error('❌ Erro ao carregar logo:', e);
                // Fallback para um ícone SVG se a imagem não carregar
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            FieldManager
          </h2>
          <p className="text-gray-600 text-lg">
            Sistema Multi-Domínio de Gestão
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-white shadow-2xl rounded-2xl px-8 pt-8 pb-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CAMPO EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (validationErrors.length > 0) validateForm();
                  }}
                  className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  placeholder="seu.email@empresa.com"
                />
              </div>
            </div>

            {/* CAMPO SENHA */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    if (validationErrors.length > 0) validateForm();
                  }}
                  className="pl-10 pr-10 block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-r-lg transition-colors hover:bg-green-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* ERROS DE VALIDAÇÃO */}
            {validationErrors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ERRO DE LOGIN */}
            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{displayError}</span>
              </div>
            )}

            {/* BOTÃO LOGIN */}
            <button
              type="submit"
              disabled={isLoading || validationErrors.length > 0}
              className={`
                w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white
                ${isLoading || validationErrors.length > 0
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }
                transition duration-200 shadow-lg
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Entrar no Sistema
                </>
              )}
            </button>

            {/* LINK ESQUECEU A SENHA */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-green-600 hover:text-green-700 underline transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>

            {/* BOTÕES DE CREDENCIAIS DE TESTE (APENAS EM DEV) */}
            {import.meta.env.DEV && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleTestCredentials1}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 shadow-sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Técnico (tecnico@fieldmanager.dev)
                </button>
                
                <button
                  type="button"
                  onClick={handleTestCredentials2}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200 shadow-sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Supervisor (supervisor@fieldmanager.dev)
                </button>
                
                <button
                  type="button"
                  onClick={handleTestCredentials3}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 shadow-sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Admin (admin@fieldmanager.dev)
                </button>
              </div>
            )}
          </form>
        </div>

        {/* FOOTER */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            FieldManager v2.0.0 - Sistema Multi-Domínio
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Desenvolvido por{' '}
            <a 
              href="https://github.com/uederson-ferreira" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              Uederson Ferreira
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSimple;