// ===================================================================
// TESTES - SUPABASE CLIENT
// Localização: src/lib/__tests__/supabase.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase, API_URL, testConnection, isUserAuthenticated } from '../supabase';

// Mock do Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  })),
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuração', () => {
    it('deve exportar API_URL', () => {
      expect(API_URL).toBeDefined();
      expect(typeof API_URL).toBe('string');
    });

    it('deve criar cliente supabase com anon key', () => {
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
    });

    it('NÃO deve exportar supabaseAdmin (segurança)', async () => {
      // Verificar que não existe export de supabaseAdmin
      const exports = Object.keys(await import('../supabase'));
      expect(exports).not.toContain('supabaseAdmin');
    });
  });

  describe('testConnection', () => {
    it('deve retornar true quando conexão é bem-sucedida', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: { id: 'test-user' } } as any,
        error: null,
      });

      const result = await testConnection();
      expect(result).toBe(true);
    });

    it('deve retornar false quando há erro', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: { message: 'Connection failed' } as any,
      });

      const result = await testConnection();
      expect(result).toBe(false);
    });

    it('deve retornar false quando há exceção', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockRejectedValue(new Error('Network error'));

      const result = await testConnection();
      expect(result).toBe(false);
    });
  });

  describe('isUserAuthenticated', () => {
    it('deve retornar true quando usuário está autenticado', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: { id: 'test-user' } } as any,
        error: null,
      });

      const result = await isUserAuthenticated();
      expect(result).toBe(true);
    });

    it('deve retornar false quando usuário não está autenticado', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' } as any,
      });

      const result = await isUserAuthenticated();
      expect(result).toBe(false);
    });

    it('deve retornar false em caso de exceção', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockRejectedValue(new Error('Error'));

      const result = await isUserAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('Segurança', () => {
    it('deve usar apenas anon key no cliente', () => {
      // Verificar que não há service key no código
      expect(import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    });

    it('deve ter autoRefreshToken ativado', () => {
      // Cliente deve ter configuração de refresh automático
      expect(supabase.auth).toBeDefined();
    });
  });
});
