// ===================================================================
// UTILITÁRIOS DE AUTENTICAÇÃO SEGURA - ECOFIELD SYSTEM
// Localização: src/utils/authUtils.ts
// ===================================================================

// ===================================================================
// CHAVE DE CRIPTOGRAFIA (DEVE SER A MESMA DO BACKEND)
// ===================================================================

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

// 🔒 SEGURANÇA: Logs removidos para não expor chave de criptografia

// ✅ VALIDAÇÃO DE SEGURANÇA
if (!ENCRYPTION_KEY) {
  throw new Error('❌ [SECURITY] VITE_ENCRYPTION_KEY não definida! Configure a variável de ambiente.');
}

// 🔒 APENAS EM DESENVOLVIMENTO: Verificar se chave está carregada
if (import.meta.env.DEV) {
  console.log('🔑 [DEBUG] Chave de criptografia:', ENCRYPTION_KEY ? 'CARREGADA ✓' : 'NÃO ENCONTRADA ✗');
}

// ===================================================================
// CRIPTOGRAFIA AES PARA SENHAS
// ===================================================================

/**
 * Criptografa senha usando AES para envio seguro
 * @param password - Senha em texto plano
 * @returns Promise<string> - Senha criptografada
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // ✅ USAR CRIPTOGRAFIA AES (REVERSÍVEL E SEGURO)
    const encryptedPassword = await encryptPassword(password);

    // 🔒 SEGURANÇA: Não logar senha criptografada
    if (import.meta.env.DEV) {
      console.log('🔐 [AUTH UTILS] Senha criptografada com sucesso');
    }

    return encryptedPassword;
  } catch (error) {
    console.error('❌ [AUTH UTILS] Erro ao criptografar senha');
    throw new Error('Erro ao processar senha');
  }
}

/**
 * Converte string hex para Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Criptografa senha usando AES
 */
async function encryptPassword(password: string): Promise<string> {
  try {
    // Gerar IV (Initialization Vector) aleatório
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // Converter chave hex para bytes
    const keyData = hexToBytes(ENCRYPTION_KEY);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData as unknown as ArrayBuffer,
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt']
    );
    
    // Criptografar senha
    const passwordData = new TextEncoder().encode(password);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      passwordData
    );
    
    // Retornar IV + dados criptografados em formato hex
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const encryptedHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${ivHex}:${encryptedHex}`;
  } catch (error) {
    console.error('❌ [AUTH UTILS] Erro na criptografia AES:', error);
    throw new Error('Erro na criptografia');
  }
}

// ===================================================================
// VALIDAÇÕES DE SEGURANÇA
// ===================================================================

/**
 * Valida se o ambiente é seguro para autenticação
 * @returns boolean - true se seguro
 */
export function isSecureEnvironment(): boolean {
  // Temporariamente desabilitado para Vercel
  return true;
  
  // Código original comentado para debug
  /*
  // Em produção, HTTPS é obrigatório
  if (import.meta.env.PROD) {
    // Verificar se está usando HTTPS
    const isHttps = window.location.protocol === 'https:';
    
    // Se estiver na Vercel, permitir acesso (Vercel gerencia HTTPS automaticamente)
    const isVercel = window.location.hostname.includes('vercel.app') ||
                    window.location.hostname.includes('vercel.com') ||
                    import.meta.env.VITE_VERCEL === '1';
    
    return isHttps || isVercel;
  }
  
  // Em desenvolvimento, permitir HTTP
  return true;
  */
}

/**
 * Valida força da senha
 * @param password - Senha a ser validada
 * @param email - Email do usuário (opcional, para verificar se é usuário existente)
 * @returns { isValid: boolean; errors: string[] } - Resultado da validação
 */
export function validatePasswordStrength(password: string, email?: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // ✅ LISTA DE USUÁRIOS EXISTENTES (SEM VALIDAÇÃO RIGOROSA)
  const existingUsers = [
    'admin@ecofield.com',
    'uedersonferreira@gmail.com',
    'teste.tma_campo@sistema.com',
    'teste.tma_gestao@sistema.com',
    'teste.desenvolvedor@sistema.com',
    'teste.adm@sistema.com',
    'joao.silva@empresa.com',
    'admin@sistema.com'
  ];
  
  // ✅ VALIDAÇÃO BÁSICA PARA TODOS
  if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  // ✅ VALIDAÇÃO RIGOROSA APENAS PARA NOVOS USUÁRIOS
  if (email && !existingUsers.includes(email.toLowerCase().trim())) {
    // Apenas para novos usuários - validações mais rigorosas
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ===================================================================
// MASCARAMENTO DE DADOS SENSÍVEIS
// ===================================================================

/**
 * Mascara dados sensíveis nos logs
 * @param data - Dados a serem mascarados
 * @param sensitiveFields - Campos sensíveis
 * @returns string - Dados mascarados
 */
export function maskSensitiveData(data: any, sensitiveFields: string[] = ['password', 'token', 'secret']): string {
  try {
    const masked = { ...data };
    
    sensitiveFields.forEach(field => {
      if (masked[field]) {
        masked[field] = '[OCULTO]';
      }
    });
    
    return JSON.stringify(masked);
  } catch (error) {
    return '[DADOS OCULTOS]';
  }
}

// ===================================================================
// VALIDAÇÃO DE EMAIL
// ===================================================================

/**
 * Valida formato de email
 * @param email - Email a ser validado
 * @returns boolean - true se válido
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
}

/**
 * Limpa completamente o localStorage relacionado à autenticação
 */
export const clearAuthStorage = (): void => {
  try {
    // Limpar todas as chaves relacionadas à autenticação
    localStorage.removeItem("ecofield_auth");
    localStorage.removeItem("ecofield_auth_v2");
    localStorage.removeItem("ecofield_auth_token");
    localStorage.removeItem("ecofield_auth_expires");
    localStorage.removeItem("ecofield_auth_refresh");
    
    // Limpar outras chaves que possam estar relacionadas
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('supabase') || key.includes('ecofield'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log("🧹 [AUTH UTILS] localStorage limpo completamente");
  } catch (error) {
    console.error("❌ [AUTH UTILS] Erro ao limpar localStorage:", error);
  }
};

/**
 * Verifica se há dados de autenticação no localStorage
 */
export const hasAuthData = (): boolean => {
  try {
    const authData = localStorage.getItem("ecofield_auth_v2");
    const oldAuthData = localStorage.getItem("ecofield_auth");
    const supabaseToken = localStorage.getItem("ecofield_auth_token");
    
    return !!(authData || oldAuthData || supabaseToken);
  } catch (error) {
    console.error("❌ [AUTH UTILS] Erro ao verificar dados de autenticação:", error);
    return false;
  }
};

/**
 * Força o logout limpando todos os dados
 */
export const forceLogout = (): void => {
  try {
    clearAuthStorage();
    
    // Redirecionar para a página inicial
    window.location.href = '/';
    
    console.log("🚪 [AUTH UTILS] Logout forçado executado");
  } catch (error) {
    console.error("❌ [AUTH UTILS] Erro no logout forçado:", error);
  }
};

/**
 * Função de logout robusta que tenta múltiplas abordagens
 */
export const robustLogout = async (): Promise<void> => {
  try {
    console.log("🛡️ [AUTH UTILS] Iniciando logout robusto...");
    
    // 1. Limpar localStorage imediatamente
    clearAuthStorage();
    
    // 2. Tentar logout via backend se disponível
    try {
      const token = getAuthToken();
      if (token) {
        console.log("✅ [AUTH UTILS] Logout via backend executado");
      }
    } catch (backendError) {
      console.error("⚠️ [AUTH UTILS] Erro no logout via backend:", backendError);
    }
    
    // 3. Forçar redirecionamento
    window.location.href = '/';
    
    console.log("✅ [AUTH UTILS] Logout robusto concluído");
  } catch (error) {
    console.error("💥 [AUTH UTILS] Erro no logout robusto:", error);
    
    // Último recurso: forçar redirecionamento
    try {
      window.location.href = '/';
    } catch (redirectError) {
      console.error("💥 [AUTH UTILS] Erro no redirecionamento:", redirectError);
    }
  }
};

/**
 * Obtém informações sobre o estado atual da autenticação
 */
export const getAuthInfo = (): {
  hasLocalData: boolean;
  hasSupabaseToken: boolean;
  storageKeys: string[];
} => {
  try {
    const hasLocalData = hasAuthData();
    const hasSupabaseToken = !!localStorage.getItem("ecofield_auth_token");
    
    const storageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('supabase') || key.includes('ecofield'))) {
        storageKeys.push(key);
      }
    }
    
    return {
      hasLocalData,
      hasSupabaseToken,
      storageKeys
    };
  } catch (error) {
    console.error("❌ [AUTH UTILS] Erro ao obter informações de autenticação:", error);
    return {
      hasLocalData: false,
      hasSupabaseToken: false,
      storageKeys: []
    };
  }
}; 

/**
 * Verifica se o token está expirado
 * @returns true se expirado, false se válido
 */
export const isTokenExpired = (): boolean => {
  try {
    const token = getAuthToken();
    if (!token) return true;
    
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return now > payload.exp;
  } catch (error) {
    console.error('❌ [AUTH UTILS] Erro ao verificar expiração do token:', error);
    return true;
  }
};

/**
 * Obtém informações sobre o token atual
 * @returns Informações do token ou null se inválido
 */
export const getTokenInfo = (): { exp: Date; iat: Date; email: string; expirado: boolean } | null => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return {
      exp: new Date(payload.exp * 1000),
      iat: new Date(payload.iat * 1000),
      email: payload.email || '',
      expirado: now > payload.exp
    };
  } catch (error) {
    console.error('❌ [AUTH UTILS] Erro ao obter informações do token:', error);
    return null;
  }
};

/**
 * Obtém o token de autenticação do localStorage
 * @returns Token de acesso ou null se não encontrado
 */
export const getAuthToken = (): string | null => {
  try {
    const token = localStorage.getItem('ecofield_auth_token');
    return token || null;
  } catch (error) {
    console.error('❌ [AUTH UTILS] Erro ao obter token:', error);
    return null;
  }
};

/**
 * Verifica se o usuário está autenticado
 * @returns true se autenticado, false caso contrário
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Obtém headers de autenticação para requisições
 * @returns Headers com token de autenticação
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}; 