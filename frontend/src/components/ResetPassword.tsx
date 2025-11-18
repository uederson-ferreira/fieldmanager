// ===================================================================
// COMPONENTE DE RESET DE SENHA - ECOFIELD SYSTEM
// Localização: src/components/ResetPassword.tsx
// ===================================================================

import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { validatePasswordStrength } from '../utils/authUtils';
import { authAPI } from '../lib/authAPI';

interface ResetPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasValidSession, setHasValidSession] = useState(false);

  // ===================================================================
  // VERIFICAR SESSÃO DE RECUPERAÇÃO
  // ===================================================================

  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 [RESET PASSWORD] Verificando sessão de recuperação...');
      
      try {
        const result = await authAPI.checkRecoverySession();
        
        if (result.isRecovery) {
          console.log('✅ [RESET PASSWORD] Sessão de recuperação válida');
          setHasValidSession(true);
        } else {
          console.log('❌ [RESET PASSWORD] Sessão de recuperação inválida');
          setError('Link de recuperação inválido ou expirado. Solicite um novo link.');
        }
      } catch (error) {
        console.error('❌ [RESET PASSWORD] Erro ao verificar sessão:', error);
        setError('Erro ao verificar sessão de recuperação');
      }
    };

    checkSession();
  }, []);

  // ===================================================================
  // VALIDAÇÕES
  // ===================================================================

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validar nova senha
    if (!formData.newPassword) {
      errors.push('Nova senha é obrigatória');
    } else if (formData.newPassword.length < 6) {
      errors.push('A senha deve ter pelo menos 6 caracteres');
    } else {
      const passwordValidation = validatePasswordStrength(formData.newPassword);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    // Validar confirmação
    if (!formData.confirmPassword) {
      errors.push('Confirmação de senha é obrigatória');
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.push('As senhas não coincidem');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // ===================================================================
  // SUBMIT DO FORMULÁRIO
  // ===================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log('🔐 [RESET PASSWORD] Atualizando senha...');

    try {
      const result = await authAPI.updatePassword(formData.newPassword);
      
      if (result.success) {
        console.log('✅ [RESET PASSWORD] Senha atualizada com sucesso');
        
        // Forçar logout após mudança de senha
        await authAPI.signOutAfterPasswordChange();
        
        setSuccess(true);
      } else {
        console.error('❌ [RESET PASSWORD] Erro:', result.error);
        setError(result.error || 'Erro ao atualizar senha');
      }
    } catch (error) {
      console.error('💥 [RESET PASSWORD] Erro inesperado:', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center overflow-x-hidden w-full p-2 sm:p-4">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          
          {/* HEADER */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src="/icon.png" alt="EcoField Logo" className="h-28 w-30" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Link Inválido
            </h2>
            <p className="text-gray-600 text-lg">
              Este link de recuperação não é válido
            </p>
          </div>

          {/* CARD DE ERRO */}
          <div className="bg-white shadow-2xl rounded-2xl px-8 pt-8 pb-6 border border-gray-100">
            <div className="text-center space-y-6">
              
              {/* ÍCONE DE ERRO */}
              <div className="flex justify-center">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>

              {/* MENSAGEM */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Link expirado ou inválido
                </h3>
                <p className="text-gray-600">
                  Este link de recuperação não é válido ou já expirou.
                </p>
                <p className="text-sm text-gray-500">
                  Solicite um novo link de recuperação.
                </p>
              </div>

              {/* BOTÕES */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Login
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistema EcoField v1.0.0 - Gestão
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center overflow-x-hidden w-full p-2 sm:p-4">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          
          {/* HEADER */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src="/icon.png" alt="EcoField Logo" className="h-28 w-30" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Senha Alterada!
            </h2>
            <p className="text-gray-600 text-lg">
              Sua senha foi atualizada com sucesso
            </p>
          </div>

          {/* CARD DE SUCESSO */}
          <div className="bg-white shadow-2xl rounded-2xl px-8 pt-8 pb-6 border border-gray-100">
            <div className="text-center space-y-6">
              
              {/* ÍCONE DE SUCESSO */}
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>

              {/* MENSAGEM */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Senha atualizada com sucesso
                </h3>
                <p className="text-gray-600">
                  Sua senha foi alterada e você foi desconectado automaticamente.
                </p>
                <p className="text-sm text-gray-500">
                  Faça login novamente com sua nova senha.
                </p>
              </div>

              {/* BOTÕES */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onSuccess}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 shadow-lg"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Fazer Login
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistema EcoField v1.0.0 - Gestão
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center overflow-x-hidden w-full p-2 sm:p-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        
        {/* HEADER */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/icon.png" alt="EcoField Logo" className="h-28 w-30" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Nova Senha
          </h2>
          <p className="text-gray-600 text-lg">
            Digite sua nova senha
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-white shadow-2xl rounded-2xl px-8 pt-8 pb-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CAMPO NOVA SENHA */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, newPassword: e.target.value }));
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

            {/* CAMPO CONFIRMAR SENHA */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    if (validationErrors.length > 0) validateForm();
                  }}
                  className="pl-10 pr-10 block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-r-lg transition-colors hover:bg-green-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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

            {/* ERRO DE API */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* BOTÃO ATUALIZAR */}
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
                  Atualizando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Atualizar Senha
                </>
              )}
            </button>

            {/* BOTÃO VOLTAR */}
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Sistema EcoField v1.0.0 - Gestão Ambiental
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 