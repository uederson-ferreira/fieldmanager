// ===================================================================
// TESTES - LV SYNC
// Localização: src/lib/offline/sync/syncers/__tests__/LVSync.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LVSync } from '../LVSync';
import type { LV } from '../../../../../types/lv';

// Mock dos managers
vi.mock('../../../entities', () => ({
  LVManager: {
    getPendentes: vi.fn(),
    delete: vi.fn(),
  },
  LVAvaliacaoManager: {
    getByLVId: vi.fn(),
    deleteByLVId: vi.fn(),
  },
  LVFotoManager: {
    getByLVId: vi.fn(),
    deleteByLVId: vi.fn(),
  },
}));

// Mock do fetch global
global.fetch = vi.fn();

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = mockLocalStorage as any;

// Mock do import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_URL: 'http://localhost:3001',
  },
});

describe('LVSync', () => {
  let mockLV: LV;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLV = {
      id: 'lv-test-123',
      tipo_lv: 'residuos',
      numero_lv: 'LV-001',
      nome_lv: 'Lista de Verificação de Resíduos',
      usuario_id: 'user-123',
      usuario_nome: 'João Silva',
      data_inspecao: '2025-01-15',
      area: 'Área A',
      status: 'em_andamento',
      sincronizado: false,
      offline: true,
      created_at: '2025-01-15T10:00:00.000Z',
      updated_at: '2025-01-15T10:00:00.000Z',
    } as LV;

    // Setup localStorage mock
    mockLocalStorage.getItem.mockReturnValue('fake-token-123');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('syncAll', () => {
    it('deve retornar sucesso quando não há LVs pendentes', async () => {
      const { LVManager } = await import('../../../entities');
      vi.mocked(LVManager.getPendentes).mockResolvedValue([]);

      const result = await LVSync.syncAll();

      expect(result).toEqual({
        success: true,
        sincronizadas: 0,
        erros: 0,
      });
      expect(LVManager.getPendentes).toHaveBeenCalled();
    });

    it('deve sincronizar LVs pendentes com sucesso', async () => {
      const { LVManager, LVAvaliacaoManager, LVFotoManager } = await import('../../../entities');

      vi.mocked(LVManager.getPendentes).mockResolvedValue([mockLV]);
      vi.mocked(LVAvaliacaoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVFotoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVManager.delete).mockResolvedValue();
      vi.mocked(LVAvaliacaoManager.deleteByLVId).mockResolvedValue();
      vi.mocked(LVFotoManager.deleteByLVId).mockResolvedValue();

      // Mock fetch para backend
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 'lv-backend-123' } }),
      } as Response);

      const result = await LVSync.syncAll();

      expect(result.success).toBe(true);
      expect(result.sincronizadas).toBe(1);
      expect(result.erros).toBe(0);
    });

    it('deve chamar callback de progresso durante sincronização', async () => {
      const { LVManager, LVAvaliacaoManager, LVFotoManager } = await import('../../../entities');

      vi.mocked(LVManager.getPendentes).mockResolvedValue([mockLV, { ...mockLV, id: 'lv-2' }]);
      vi.mocked(LVAvaliacaoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVFotoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVManager.delete).mockResolvedValue();
      vi.mocked(LVAvaliacaoManager.deleteByLVId).mockResolvedValue();
      vi.mocked(LVFotoManager.deleteByLVId).mockResolvedValue();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 'lv-backend-123' } }),
      } as Response);

      const onProgress = vi.fn();
      await LVSync.syncAll(onProgress);

      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenNthCalledWith(1, 1, 2, expect.any(String));
      expect(onProgress).toHaveBeenNthCalledWith(2, 2, 2, expect.any(String));
    });

    it('deve contar erros quando sincronização falha', async () => {
      const { LVManager, LVAvaliacaoManager, LVFotoManager } = await import('../../../entities');

      vi.mocked(LVManager.getPendentes).mockResolvedValue([mockLV]);
      vi.mocked(LVAvaliacaoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVFotoManager.getByLVId).mockResolvedValue([]);

      // Mock fetch para falhar
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await LVSync.syncAll();

      expect(result.success).toBe(false);
      expect(result.erros).toBe(1);
    });

    it('deve retornar erro quando exception ocorre', async () => {
      const { LVManager } = await import('../../../entities');

      vi.mocked(LVManager.getPendentes).mockRejectedValue(new Error('Database error'));

      const result = await LVSync.syncAll();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('envio para backend', () => {
    it('deve enviar dados com Authorization header', async () => {
      const { LVManager, LVAvaliacaoManager, LVFotoManager } = await import('../../../entities');

      vi.mocked(LVManager.getPendentes).mockResolvedValue([mockLV]);
      vi.mocked(LVAvaliacaoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVFotoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVManager.delete).mockResolvedValue();
      vi.mocked(LVAvaliacaoManager.deleteByLVId).mockResolvedValue();
      vi.mocked(LVFotoManager.deleteByLVId).mockResolvedValue();

      const mockResponse = { success: true, data: { id: 'lv-backend-123' } };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await LVSync.syncAll();

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/lvs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token-123',
          }),
        })
      );
    });

    it('deve deletar LV após sincronização bem-sucedida', async () => {
      const { LVManager, LVAvaliacaoManager, LVFotoManager } = await import('../../../entities');

      vi.mocked(LVManager.getPendentes).mockResolvedValue([mockLV]);
      vi.mocked(LVAvaliacaoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVFotoManager.getByLVId).mockResolvedValue([]);
      vi.mocked(LVManager.delete).mockResolvedValue();

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: 'lv-backend-123' } }),
      } as Response);

      await LVSync.syncAll();

      expect(LVManager.delete).toHaveBeenCalledWith(mockLV.id);
    });
  });
});
