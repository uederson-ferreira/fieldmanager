// ===================================================================
// TIPOS DE AUTENTICAÇÃO - ECOFIELD SYSTEM
// Localização: src/types/auth.ts
// ===================================================================

// Importar interfaces base de entities.ts
import type {
  UserData,
  CreateUserData,
  UpdateUserData,
  UserMetadata,
  AuthState,
  LoginCredentials,
  AuthMode,
  convertSupabaseUserToUserData,
  createUserMetadata
} from './entities';

// Re-exportar interfaces base para compatibilidade
export type {
  UserData,
  CreateUserData,
  UpdateUserData,
  UserMetadata,
  AuthState,
  LoginCredentials,
  AuthMode
};

// Re-exportar funções helper
export {
  convertSupabaseUserToUserData,
  createUserMetadata
}; 