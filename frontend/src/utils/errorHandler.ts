// ===================================================================
// SISTEMA DE TRATAMENTO DE ERRO - ECOFIELD SYSTEM
// Localização: src/utils/errorHandler.ts
// ===================================================================

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  timestamp: string;
}

export type ErrorType = 'network' | 'timeout' | 'permission' | 'notFound' | 'validation' | 'unknown';

export const errorMessages = {
  network: "Verifique sua conexão com a internet",
  timeout: "O carregamento está muito lento. Tente novamente",
  permission: "Você não tem permissão para esta ação",
  notFound: "Dados não encontrados",
  validation: "Dados inválidos. Verifique as informações",
  unknown: "Erro inesperado. Tente novamente"
};

export const detectErrorType = (error: unknown): ErrorType => {
  const errorMessage = error instanceof Error ? error.message : String(error || '');
  
  if (errorMessage.includes('fetch')) return 'network';
  if (errorMessage.includes('Timeout')) return 'timeout';
  if (errorMessage.includes('permission') || (error as { code?: string })?.code === 'PGRST116') return 'permission';
  if (errorMessage.includes('not found') || (error as { code?: string })?.code === 'PGRST116') return 'notFound';
  if (errorMessage.includes('validation')) return 'validation';
  return 'unknown';
};

export const handleError = (
  error: unknown, 
  context: string, 
  retryAction?: () => void
) => {
  const errorType = detectErrorType(error);
  const message = errorMessages[errorType];
  
  console.error(`❌ [${context}] Erro:`, {
    type: errorType,
    message: error instanceof Error ? error.message : String(error),
    context,
    timestamp: new Date().toISOString()
  });

  // Em produção, enviar para serviço de monitoramento
  if (import.meta.env.PROD) {
    // sendToMonitoring({ level: 'error', errorType, message, context });
  }

  // Mostrar toast ou alert
  if (typeof window !== 'undefined') {
    const actionMessage = retryAction ? "\n\nClique OK para tentar novamente." : "";
    const shouldRetry = window.confirm(`${message}${actionMessage}`);
    
    if (shouldRetry && retryAction) {
      retryAction();
    }
  }
};

export const createErrorBoundary = (componentName: string) => {
  return (error: unknown, action: string, retryAction?: () => void) => {
    handleError(error, `${componentName}:${action}`, retryAction);
  };
}; 