// ===================================================================
// TESTES - ENCARREGADO SYNC
// Localização: src/lib/offline/sync/syncers/__tests__/EncarregadoSync.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EncarregadoSync } from '../EncarregadoSync';

// Mock dos managers
vi.mock('../../../entities', () => ({
  EncarregadoManager: {
    getPendentes: vi.fn(),
    delete: vi.fn(),
    marcarSincronizado: vi.fn(),
  },
}));

global.fetch = vi.fn();
const mockLocalStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
global.localStorage = mockLocalStorage as any;
vi.stubGlobal('import.meta', { env: { VITE_API_URL: 'http://localhost:3001' } });

describe('EncarregadoSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token-123');
  });

  describe('syncAll', () => {
    it('deve retornar sucesso quando não há encarregados pendentes', async () => {
      const { EncarregadoManager } = await import('../../../entities');
      vi.mocked(EncarregadoManager.getPendentes).mockResolvedValue([]);

      const result = await EncarregadoSync.syncAll();

      expect(result).toEqual({ success: true, sincronizados: 0, erros: 0 });
    });

    it('deve sincronizar encarregados com sucesso', async () => {
      const { EncarregadoManager } = await import('../../../entities');

      const mockEncarregado: any = { id: 'enc-1', nome: 'João Silva', sincronizado: false };
      vi.mocked(EncarregadoManager.getPendentes).mockResolvedValue([mockEncarregado]);
      vi.mocked(EncarregadoManager.delete).mockResolvedValue();

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 'enc-backend-1' } }),
      } as Response);

      const result = await EncarregadoSync.syncAll();

      expect(result.success).toBe(true);
      expect(result.sincronizados).toBe(1);
    });

    it('deve contar erros quando falha', async () => {
      const { EncarregadoManager } = await import('../../../entities');
      vi.mocked(EncarregadoManager.getPendentes).mockRejectedValue(new Error('DB Error'));

      const result = await EncarregadoSync.syncAll();

      expect(result.success).toBe(false);
      expect(result.error).toContain('DB Error');
    });
  });
});
