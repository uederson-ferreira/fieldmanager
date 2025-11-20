// ===================================================================
// COMPONENTE DE RECUPERAÇÃO DE SENHA - ECOFIELD SYSTEM
// Localização: src/components/ForgotPassword.tsx
// ===================================================================

import React, { useState } from 'react';
import { User, AlertCircle, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { validateEmail } from '../../utils/authUtils';
import { authAPI } from '../../lib/authAPI';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ===================================================================
  // VALIDAÇÕES
  // ===================================================================

  const validateForm = (): boolean => {
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Email é obrigatório');
      return false;
    }

    if (!validateEmail(email)) {
      setValidationError('Formato de email inválido');
      return false;
    }

    return true;
  };

  // ===================================================================
  // SUBMIT DO FORMULÁRIO
  // ===================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log('📧 [FORGOT PASSWORD] Enviando email de recuperação para:', email);

    try {
      const result = await authAPI.sendPasswordResetEmail(email.trim());
      
      if (result.success) {
        console.log('✅ [FORGOT PASSWORD] Email enviado com sucesso');
        setSuccess(true);
      } else {
        console.error('❌ [FORGOT PASSWORD] Erro:', result.error);
        setError(result.error || 'Erro ao enviar email');
      }
    } catch (error) {
      console.error('💥 [FORGOT PASSWORD] Erro inesperado:', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

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
              Email Enviado!
            </h2>
            <p className="text-gray-600 text-lg">
              Verifique sua caixa de entrada
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
                  Email de recuperação enviado
                </h3>
                <p className="text-gray-600">
                  Enviamos um link de recuperação para <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Verifique sua caixa de entrada e spam. O link expira em 1 hora.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center overflow-x-hidden w-full p-2 sm:p-4">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        
        {/* HEADER */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/icon.png" alt="FieldManager Logo" className="h-28 w-30" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar Senha
          </h2>
          <p className="text-gray-600 text-lg">
            Digite seu email para receber o link de recuperação
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  placeholder="seu.email@empresa.com"
                />
              </div>
            </div>

            {/* ERRO DE VALIDAÇÃO */}
            {validationError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-yellow-700">{validationError}</span>
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

            {/* BOTÃO ENVIAR */}
            <button
              type="submit"
              disabled={isLoading || !!validationError}
              className={`
                w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white
                ${isLoading || !!validationError
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }
                transition duration-200 shadow-lg
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email de Recuperação
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

export default ForgotPassword; 