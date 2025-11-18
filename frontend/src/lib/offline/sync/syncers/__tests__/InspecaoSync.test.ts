// ===================================================================
// TESTES - INSPECAO SYNC
// Localização: src/lib/offline/sync/syncers/__tests__/InspecaoSync.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InspecaoSync } from '../InspecaoSync';

// Mock dos managers
vi.mock('../../../entities', () => ({
  InspecaoManager: {
    getPendentes: vi.fn(),
    delete: vi.fn(),
    marcarSincronizada: vi.fn(),
  },
  RespostaInspecaoManager: {
    getByInspecaoId: vi.fn(),
    marcarSincronizada: vi.fn(),
  },
  FotoInspecaoManager: {
    getByInspecaoId: vi.fn(),
    marcarSincronizada: vi.fn(),
  },
}));

global.fetch = vi.fn();
const mockLocalStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
global.localStorage = mockLocalStorage as any;
vi.stubGlobal('import.meta', { env: { VITE_API_URL: 'http://localhost:3001' } });

describe('InspecaoSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token-123');
  });

  describe('syncAll', () => {
    it('deve retornar sucesso quando não há inspeções pendentes', async () => {
      const { InspecaoManager } = await import('../../../entities');
      vi.mocked(InspecaoManager.getPendentes).mockResolvedValue([]);

      const result = await InspecaoSync.syncAll();

      expect(result).toEqual({ success: true, sincronizados: 0, erros: 0 });
    });

    it('deve sincronizar inspeções com sucesso', async () => {
      const { InspecaoManager, RespostaInspecaoManager, FotoInspecaoManager } = await import('../../../entities');

      const mockInspecao: any = { id: 'insp-1', tipo_inspecao: 'ambiental', sincronizado: false };
      vi.mocked(InspecaoManager.getPendentes).mockResolvedValue([mockInspecao]);
      vi.mocked(RespostaInspecaoManager.getByInspecaoId).mockResolvedValue([]);
      vi.mocked(FotoInspecaoManager.getByInspecaoId).mockResolvedValue([]);
      vi.mocked(InspecaoManager.delete).mockResolvedValue();

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 'insp-backend-1' } }),
      } as Response);

      const result = await InspecaoSync.syncAll();

      expect(result.success).toBe(true);
      expect(result.sincronizados).toBe(1);
    });

    it('deve contar erros quando falha', async () => {
      const { InspecaoManager } = await import('../../../entities');
      vi.mocked(InspecaoManager.getPendentes).mockRejectedValue(new Error('DB Error'));

      const result = await InspecaoSync.syncAll();

      expect(result.success).toBe(false);
      expect(result.error).toContain('DB Error');
    });
  });
});
