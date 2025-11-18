// Configuração de versão do EcoField
export const APP_VERSION = '1.4.0';
export const APP_BUILD_DATE = '2025-08-03T11:00:00.000Z';

// Função para obter versão atual (com fallback para localStorage)
export const getCurrentVersion = (): string => {
  return localStorage.getItem('ecofield_current_version') || APP_VERSION;
};

// Função para atualizar versão
export const updateVersion = (newVersion: string): void => {
  localStorage.setItem('ecofield_current_version', newVersion);
}; 