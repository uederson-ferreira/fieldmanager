// ===================================================================
// TESTES - ATIVIDADE ROTINA SYNC
// Localização: src/lib/offline/sync/syncers/__tests__/AtividadeRotinaSync.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AtividadeRotinaSync } from '../AtividadeRotinaSync';

// Mock dos managers
vi.mock('../../../entities', () => ({
  AtividadeRotinaManager: {
    getPendentes: vi.fn(),
    delete: vi.fn(),
  },
  FotoRotinaManager: {
    getByAtividadeId: vi.fn(),
    marcarSincronizada: vi.fn(),
  },
}));

global.fetch = vi.fn();
const mockLocalStorage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
global.localStorage = mockLocalStorage as any;
vi.stubGlobal('import.meta', { env: { VITE_API_URL: 'http://localhost:3001' } });

describe('AtividadeRotinaSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token-123');
  });

  describe('syncAll', () => {
    it('deve retornar sucesso quando não há atividades pendentes', async () => {
      const { AtividadeRotinaManager } = await import('../../../entities');
      vi.mocked(AtividadeRotinaManager.getPendentes).mockResolvedValue([]);

      const result = await AtividadeRotinaSync.syncAll();

      expect(result).toEqual({ success: true, sincronizados: 0, erros: 0 });
    });

    it('deve sincronizar atividades com sucesso', async () => {
      const { AtividadeRotinaManager, FotoRotinaManager } = await import('../../../entities');

      const mockAtividade: any = { id: 'ativ-1', tipo_atividade: 'limpeza', sincronizado: false };
      vi.mocked(AtividadeRotinaManager.getPendentes).mockResolvedValue([mockAtividade]);
      vi.mocked(FotoRotinaManager.getByAtividadeId).mockResolvedValue([]);
      vi.mocked(AtividadeRotinaManager.delete).mockResolvedValue();

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 'ativ-backend-1' } }),
      } as Response);

      const result = await AtividadeRotinaSync.syncAll();

      expect(result.success).toBe(true);
      expect(result.sincronizados).toBe(1);
    });

    it('deve contar erros quando falha', async () => {
      const { AtividadeRotinaManager } = await import('../../../entities');
      vi.mocked(AtividadeRotinaManager.getPendentes).mockRejectedValue(new Error('DB Error'));

      const result = await AtividadeRotinaSync.syncAll();

      expect(result.success).toBe(false);
      expect(result.error).toContain('DB Error');
    });
  });
});
