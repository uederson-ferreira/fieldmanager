// ===================================================================
// SETUP DE TESTES - ECOFIELD SYSTEM
// Localização: src/test/setup.ts
// ===================================================================

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup após cada teste
afterEach(() => {
  cleanup();
});

// Mock de variáveis de ambiente
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
vi.stubEnv('VITE_ENCRYPTION_KEY', '074813902e1e7f8c7520da311a03da7aea6d2ce7a8ca4db509baa81f3098b1af');

// Mock global fetch se necessário
global.fetch = vi.fn();

// Mock crypto para testes
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
    subtle: {
      digest: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
  },
});

// Mock IndexedDB para testes offline
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

Object.defineProperty(global, 'indexedDB', {
  value: indexedDB,
  writable: true,
});
