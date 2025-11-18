// ===================================================================
// TESTES - INSPECAO MANAGER
// Localização: src/lib/offline/entities/managers/__tests__/InspecaoManager.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InspecaoManager } from '../InspecaoManager';
import type { InspecaoOffline } from '../../../../../types/offline';

// Mock do offlineDB
vi.mock('../../../database', () => ({
  offlineDB: {
    inspecoes: {
      put: vi.fn(),
      get: vi.fn(),
      toArray: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
          count: vi.fn(),
          delete: vi.fn(),
        })),
      })),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    respostas_inspecao: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          delete: vi.fn(),
        })),
      })),
    },
    fotos_inspecao: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          delete: vi.fn(),
        })),
      })),
    },
    transaction: vi.fn(),
  },
}));

describe('InspecaoManager', () => {
  let mockInspecao: InspecaoOffline;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInspecao = {
      id: 'inspecao-test-123',
      atividade_rotina_id: 'atividade-123',
      usuario_id: 'user-123',
      usuario_nome: 'João Silva',
      data_inspecao: '2025-01-15',
      hora_inicio: '08:00',
      status: 'em_andamento',
      sincronizado: false,
      offline: true,
      created_at: '2025-01-15T08:00:00.000Z',
      updated_at: '2025-01-15T08:00:00.000Z',
    } as InspecaoOffline;
  });

  describe('save', () => {
    it('deve salvar inspeção com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.put).mockResolvedValue('inspecao-test-123');

      await InspecaoManager.save(mockInspecao);

      expect(offlineDB.inspecoes.put).toHaveBeenCalledWith(mockInspecao);
    });

    it('deve lançar erro quando falha ao salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.put).mockRejectedValue(new Error('Database error'));

      await expect(InspecaoManager.save(mockInspecao)).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    it('deve retornar todas as inspeções', async () => {
      const { offlineDB } = await import('../../../database');

      const mockInspecoes = [mockInspecao, { ...mockInspecao, id: 'inspecao-2' }];
      vi.mocked(offlineDB.inspecoes.toArray).mockResolvedValue(mockInspecoes);

      const result = await InspecaoManager.getAll();

      expect(result).toEqual(mockInspecoes);
      expect(result).toHaveLength(2);
    });

    it('deve lançar erro quando falha ao buscar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.toArray).mockRejectedValue(new Error('Database error'));

      await expect(InspecaoManager.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getPendentes', () => {
    it('deve retornar apenas inspeções não sincronizadas', async () => {
      const { offlineDB } = await import('../../../database');

      const inspecoesPendentes = [
        mockInspecao,
        { ...mockInspecao, id: 'inspecao-2', sincronizado: false },
      ];

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(inspecoesPendentes),
        }),
      } as any);

      const result = await InspecaoManager.getPendentes();

      expect(result).toEqual(inspecoesPendentes);
      expect(offlineDB.inspecoes.where).toHaveBeenCalledWith('sincronizado');
    });

    it('deve lançar erro quando falha ao buscar pendentes', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      await expect(InspecaoManager.getPendentes()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('deve retornar inspeção quando encontrada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.get).mockResolvedValue(mockInspecao);

      const result = await InspecaoManager.getById('inspecao-test-123');

      expect(result).toEqual(mockInspecao);
      expect(offlineDB.inspecoes.get).toHaveBeenCalledWith('inspecao-test-123');
    });

    it('deve retornar undefined quando inspeção não encontrada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.get).mockResolvedValue(undefined);

      const result = await InspecaoManager.getById('inspecao-inexistente');

      expect(result).toBeUndefined();
    });

    it('deve lançar erro quando falha ao buscar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.get).mockRejectedValue(new Error('Database error'));

      await expect(InspecaoManager.getById('inspecao-test-123')).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('deve atualizar inspeção com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.put).mockResolvedValue('inspecao-test-123');

      await InspecaoManager.update(mockInspecao);

      expect(offlineDB.inspecoes.put).toHaveBeenCalledWith(mockInspecao);
    });

    it('deve lançar erro quando falha ao atualizar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.put).mockRejectedValue(new Error('Database error'));

      await expect(InspecaoManager.update(mockInspecao)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('deve deletar inspeção com transação atômica', async () => {
      const { offlineDB } = await import('../../../database');

      // Mock da transação
      vi.mocked(offlineDB.transaction).mockImplementation(async (mode, tables, callback) => {
        return callback();
      });

      vi.mocked(offlineDB.inspecoes.delete).mockResolvedValue();

      const mockRespostasDelete = vi.fn().mockResolvedValue(3);
      const mockFotosDelete = vi.fn().mockResolvedValue(2);

      vi.mocked(offlineDB.respostas_inspecao.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: mockRespostasDelete,
        }),
      } as any);

      vi.mocked(offlineDB.fotos_inspecao.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: mockFotosDelete,
        }),
      } as any);

      await InspecaoManager.delete('inspecao-test-123');

      expect(offlineDB.transaction).toHaveBeenCalled();
      expect(offlineDB.inspecoes.delete).toHaveBeenCalledWith('inspecao-test-123');
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.transaction).mockRejectedValue(new Error('Transaction error'));

      await expect(InspecaoManager.delete('inspecao-test-123')).rejects.toThrow('Transaction error');
    });
  });

  describe('marcarSincronizada', () => {
    it('deve marcar inspeção como sincronizada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.update).mockResolvedValue(1);

      await InspecaoManager.marcarSincronizada('inspecao-test-123');

      expect(offlineDB.inspecoes.update).toHaveBeenCalledWith('inspecao-test-123', { sincronizado: true });
    });

    it('deve lançar erro quando falha ao marcar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.update).mockRejectedValue(new Error('Database error'));

      await expect(InspecaoManager.marcarSincronizada('inspecao-test-123')).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('deve contar total de inspeções', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.count).mockResolvedValue(10);

      const result = await InspecaoManager.count();

      expect(result).toBe(10);
    });

    it('deve lançar erro quando falha ao contar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.count).mockRejectedValue(new Error('Database error'));

      await expect(InspecaoManager.count()).rejects.toThrow('Database error');
    });
  });

  describe('countPendentes', () => {
    it('deve contar inspeções pendentes', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          count: vi.fn().mockResolvedValue(5),
        }),
      } as any);

      const result = await InspecaoManager.countPendentes();

      expect(result).toBe(5);
      expect(offlineDB.inspecoes.where).toHaveBeenCalledWith('sincronizado');
    });

    it('deve lançar erro quando falha ao contar pendentes', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          count: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      await expect(InspecaoManager.countPendentes()).rejects.toThrow('Database error');
    });
  });

  describe('getByAtividadeId', () => {
    it('deve retornar inspeções da atividade especificada', async () => {
      const { offlineDB } = await import('../../../database');

      const inspecoesAtividade = [mockInspecao, { ...mockInspecao, id: 'inspecao-2' }];

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(inspecoesAtividade),
        }),
      } as any);

      const result = await InspecaoManager.getByAtividadeId('atividade-123');

      expect(result).toEqual(inspecoesAtividade);
      expect(offlineDB.inspecoes.where).toHaveBeenCalledWith('atividade_rotina_id');
    });

    it('deve lançar erro quando falha ao buscar por atividade', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      await expect(InspecaoManager.getByAtividadeId('atividade-123')).rejects.toThrow('Database error');
    });
  });

  describe('limparSincronizadas', () => {
    it('deve limpar inspeções sincronizadas', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: vi.fn().mockResolvedValue(8),
        }),
      } as any);

      const result = await InspecaoManager.limparSincronizadas();

      expect(result).toBe(8);
      expect(offlineDB.inspecoes.where).toHaveBeenCalledWith('sincronizado');
    });

    it('deve lançar erro quando falha ao limpar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.inspecoes.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      await expect(InspecaoManager.limparSincronizadas()).rejects.toThrow('Database error');
    });
  });
});
