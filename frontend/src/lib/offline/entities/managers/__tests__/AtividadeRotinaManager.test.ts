// ===================================================================
// TESTES - ATIVIDADE ROTINA MANAGER
// Localização: src/lib/offline/entities/managers/__tests__/AtividadeRotinaManager.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AtividadeRotinaManager } from '../AtividadeRotinaManager';
import type { AtividadeRotinaOffline } from '../../../../../types/offline';

// Mock do offlineDB
vi.mock('../../../database', () => ({
  offlineDB: {
    atividades_rotina: {
      put: vi.fn(),
      get: vi.fn(),
      toArray: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
      filter: vi.fn(() => ({
        toArray: vi.fn(),
        count: vi.fn(),
      })),
      delete: vi.fn(),
      count: vi.fn(),
    },
    fotos_rotina: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          delete: vi.fn(),
        })),
      })),
    },
    transaction: vi.fn(),
  },
}));

describe('AtividadeRotinaManager', () => {
  let mockAtividade: AtividadeRotinaOffline;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAtividade = {
      id: 'atividade-test-123',
      area_id: 'area-123',
      area_nome: 'Área A',
      usuario_id: 'user-123',
      usuario_nome: 'João Silva',
      data_atividade: '2025-01-15',
      hora_inicio: '08:00',
      status: 'em_andamento',
      sincronizado: false,
      offline: true,
      created_at: '2025-01-15T08:00:00.000Z',
      updated_at: '2025-01-15T08:00:00.000Z',
    } as AtividadeRotinaOffline;
  });

  describe('save', () => {
    it('deve salvar atividade com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.put).mockResolvedValue('atividade-test-123');

      await AtividadeRotinaManager.save(mockAtividade);

      expect(offlineDB.atividades_rotina.put).toHaveBeenCalledWith(mockAtividade);
    });

    it('deve lançar erro quando falha ao salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.put).mockRejectedValue(new Error('Database error'));

      await expect(AtividadeRotinaManager.save(mockAtividade)).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    it('deve retornar todas as atividades', async () => {
      const { offlineDB } = await import('../../../database');

      const mockAtividades = [mockAtividade, { ...mockAtividade, id: 'atividade-2' }];
      vi.mocked(offlineDB.atividades_rotina.toArray).mockResolvedValue(mockAtividades);

      const result = await AtividadeRotinaManager.getAll();

      expect(result).toEqual(mockAtividades);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.toArray).mockRejectedValue(new Error('Database error'));

      const result = await AtividadeRotinaManager.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('deve retornar atividade quando encontrada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.get).mockResolvedValue(mockAtividade);

      const result = await AtividadeRotinaManager.getById('atividade-test-123');

      expect(result).toEqual(mockAtividade);
      expect(offlineDB.atividades_rotina.get).toHaveBeenCalledWith('atividade-test-123');
    });

    it('deve retornar undefined quando atividade não encontrada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.get).mockResolvedValue(undefined);

      const result = await AtividadeRotinaManager.getById('atividade-inexistente');

      expect(result).toBeUndefined();
    });

    it('deve retornar undefined em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.get).mockRejectedValue(new Error('Database error'));

      const result = await AtividadeRotinaManager.getById('atividade-test-123');

      expect(result).toBeUndefined();
    });
  });

  describe('getByArea', () => {
    it('deve retornar atividades da área especificada', async () => {
      const { offlineDB } = await import('../../../database');

      const atividadesArea = [mockAtividade, { ...mockAtividade, id: 'atividade-2' }];

      vi.mocked(offlineDB.atividades_rotina.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(atividadesArea),
        }),
      } as any);

      const result = await AtividadeRotinaManager.getByArea('area-123');

      expect(result).toEqual(atividadesArea);
      expect(offlineDB.atividades_rotina.where).toHaveBeenCalledWith('area_id');
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      const result = await AtividadeRotinaManager.getByArea('area-123');

      expect(result).toEqual([]);
    });
  });

  describe('getByData', () => {
    it('deve retornar atividades da data especificada', async () => {
      const { offlineDB } = await import('../../../database');

      const atividadesData = [mockAtividade];

      vi.mocked(offlineDB.atividades_rotina.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(atividadesData),
        }),
      } as any);

      const result = await AtividadeRotinaManager.getByData('2025-01-15');

      expect(result).toEqual(atividadesData);
      expect(offlineDB.atividades_rotina.where).toHaveBeenCalledWith('data_atividade');
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      const result = await AtividadeRotinaManager.getByData('2025-01-15');

      expect(result).toEqual([]);
    });
  });

  describe('getPendentes', () => {
    it('deve retornar apenas atividades não sincronizadas', async () => {
      const { offlineDB } = await import('../../../database');

      const atividadesPendentes = [
        mockAtividade,
        { ...mockAtividade, id: 'atividade-2', sincronizado: false },
      ];

      vi.mocked(offlineDB.atividades_rotina.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(atividadesPendentes),
      } as any);

      const result = await AtividadeRotinaManager.getPendentes();

      expect(result).toEqual(atividadesPendentes);
      expect(offlineDB.atividades_rotina.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await AtividadeRotinaManager.getPendentes();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar atividade com transação atômica', async () => {
      const { offlineDB } = await import('../../../database');

      // Mock da transação
      vi.mocked(offlineDB.transaction).mockImplementation(async (mode, tables, callback) => {
        return callback();
      });

      vi.mocked(offlineDB.atividades_rotina.delete).mockResolvedValue();

      const mockFotosDelete = vi.fn().mockResolvedValue(3);

      vi.mocked(offlineDB.fotos_rotina.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: mockFotosDelete,
        }),
      } as any);

      await AtividadeRotinaManager.delete('atividade-test-123');

      expect(offlineDB.transaction).toHaveBeenCalled();
      expect(offlineDB.atividades_rotina.delete).toHaveBeenCalledWith('atividade-test-123');
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.transaction).mockRejectedValue(new Error('Transaction error'));

      await expect(AtividadeRotinaManager.delete('atividade-test-123')).rejects.toThrow('Transaction error');
    });
  });

  describe('update', () => {
    it('deve atualizar atividade com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.put).mockResolvedValue('atividade-test-123');

      await AtividadeRotinaManager.update(mockAtividade);

      expect(offlineDB.atividades_rotina.put).toHaveBeenCalledWith(mockAtividade);
    });

    it('deve lançar erro quando falha ao atualizar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.put).mockRejectedValue(new Error('Database error'));

      await expect(AtividadeRotinaManager.update(mockAtividade)).rejects.toThrow('Database error');
    });
  });

  describe('marcarSincronizada', () => {
    it('deve marcar atividade como sincronizada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.get).mockResolvedValue(mockAtividade);
      vi.mocked(offlineDB.atividades_rotina.put).mockResolvedValue('atividade-test-123');

      await AtividadeRotinaManager.marcarSincronizada('atividade-test-123');

      expect(offlineDB.atividades_rotina.get).toHaveBeenCalledWith('atividade-test-123');
      expect(offlineDB.atividades_rotina.put).toHaveBeenCalledWith({
        ...mockAtividade,
        sincronizado: true,
      });
    });

    it('deve lançar erro quando falha ao marcar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.get).mockRejectedValue(new Error('Database error'));

      await expect(AtividadeRotinaManager.marcarSincronizada('atividade-test-123')).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('deve contar total de atividades', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.count).mockResolvedValue(15);

      const result = await AtividadeRotinaManager.count();

      expect(result).toBe(15);
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.count).mockRejectedValue(new Error('Database error'));

      const result = await AtividadeRotinaManager.count();

      expect(result).toBe(0);
    });
  });

  describe('countPendentes', () => {
    it('deve contar atividades pendentes', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.filter).mockReturnValue({
        count: vi.fn().mockResolvedValue(7),
      } as any);

      const result = await AtividadeRotinaManager.countPendentes();

      expect(result).toBe(7);
      expect(offlineDB.atividades_rotina.filter).toHaveBeenCalled();
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.filter).mockReturnValue({
        count: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await AtividadeRotinaManager.countPendentes();

      expect(result).toBe(0);
    });
  });

  describe('getByPeriodo', () => {
    it('deve retornar atividades no período especificado', async () => {
      const { offlineDB } = await import('../../../database');

      const atividadesPeriodo = [
        mockAtividade,
        { ...mockAtividade, id: 'atividade-2', data_atividade: '2025-01-16' },
      ];

      vi.mocked(offlineDB.atividades_rotina.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(atividadesPeriodo),
      } as any);

      const result = await AtividadeRotinaManager.getByPeriodo('2025-01-15', '2025-01-20');

      expect(result).toEqual(atividadesPeriodo);
      expect(offlineDB.atividades_rotina.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.atividades_rotina.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await AtividadeRotinaManager.getByPeriodo('2025-01-15', '2025-01-20');

      expect(result).toEqual([]);
    });
  });
});
