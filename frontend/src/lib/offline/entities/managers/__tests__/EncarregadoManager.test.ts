// ===================================================================
// TESTES - ENCARREGADO MANAGER
// Localização: src/lib/offline/entities/managers/__tests__/EncarregadoManager.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EncarregadoManager } from '../EncarregadoManager';
import type { EncarregadoOffline } from '../../../../../types/offline';

// Mock do offlineDB
vi.mock('../../../database', () => ({
  offlineDB: {
    encarregados: {
      put: vi.fn(),
      get: vi.fn(),
      toArray: vi.fn(),
      filter: vi.fn(() => ({
        toArray: vi.fn(),
        count: vi.fn(),
      })),
      delete: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('EncarregadoManager', () => {
  let mockEncarregado: EncarregadoOffline;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEncarregado = {
      id: 'encarregado-test-123',
      nome_completo: 'José Silva Santos',
      apelido: 'Zé',
      empresa_id: 'empresa-123',
      area_id: 'area-123',
      ativo: true,
      especialidades: ['Elétrica', 'Manutenção'],
      sincronizado: false,
      created_at: '2025-01-15T08:00:00.000Z',
      updated_at: '2025-01-15T08:00:00.000Z',
    } as EncarregadoOffline;
  });

  describe('save', () => {
    it('deve salvar encarregado com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.put).mockResolvedValue('encarregado-test-123');

      await EncarregadoManager.save(mockEncarregado);

      expect(offlineDB.encarregados.put).toHaveBeenCalledWith(mockEncarregado);
    });

    it('deve lançar erro quando falha ao salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.put).mockRejectedValue(new Error('Database error'));

      await expect(EncarregadoManager.save(mockEncarregado)).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os encarregados', async () => {
      const { offlineDB } = await import('../../../database');

      const mockEncarregados = [mockEncarregado, { ...mockEncarregado, id: 'encarregado-2' }];
      vi.mocked(offlineDB.encarregados.toArray).mockResolvedValue(mockEncarregados);

      const result = await EncarregadoManager.getAll();

      expect(result).toEqual(mockEncarregados);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.toArray).mockRejectedValue(new Error('Database error'));

      const result = await EncarregadoManager.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('deve retornar encarregado quando encontrado', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.get).mockResolvedValue(mockEncarregado);

      const result = await EncarregadoManager.getById('encarregado-test-123');

      expect(result).toEqual(mockEncarregado);
      expect(offlineDB.encarregados.get).toHaveBeenCalledWith('encarregado-test-123');
    });

    it('deve retornar undefined quando encarregado não encontrado', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.get).mockResolvedValue(undefined);

      const result = await EncarregadoManager.getById('encarregado-inexistente');

      expect(result).toBeUndefined();
    });

    it('deve retornar undefined em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.get).mockRejectedValue(new Error('Database error'));

      const result = await EncarregadoManager.getById('encarregado-test-123');

      expect(result).toBeUndefined();
    });
  });

  describe('getByNome', () => {
    it('deve retornar encarregados por nome', async () => {
      const { offlineDB } = await import('../../../database');

      const encarregadosNome = [mockEncarregado];

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(encarregadosNome),
      } as any);

      const result = await EncarregadoManager.getByNome('José');

      expect(result).toEqual(encarregadosNome);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve buscar por apelido também', async () => {
      const { offlineDB } = await import('../../../database');

      const encarregadosNome = [mockEncarregado];

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(encarregadosNome),
      } as any);

      const result = await EncarregadoManager.getByNome('Zé');

      expect(result).toEqual(encarregadosNome);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.getByNome('José');

      expect(result).toEqual([]);
    });
  });

  describe('getAtivos', () => {
    it('deve retornar apenas encarregados ativos', async () => {
      const { offlineDB } = await import('../../../database');

      const encarregadosAtivos = [mockEncarregado];

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(encarregadosAtivos),
      } as any);

      const result = await EncarregadoManager.getAtivos();

      expect(result).toEqual(encarregadosAtivos);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.getAtivos();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar encarregado com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.delete).mockResolvedValue();

      await EncarregadoManager.delete('encarregado-test-123');

      expect(offlineDB.encarregados.delete).toHaveBeenCalledWith('encarregado-test-123');
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.delete).mockRejectedValue(new Error('Database error'));

      await expect(EncarregadoManager.delete('encarregado-test-123')).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('deve atualizar encarregado com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.put).mockResolvedValue('encarregado-test-123');

      await EncarregadoManager.update(mockEncarregado);

      expect(offlineDB.encarregados.put).toHaveBeenCalledWith(mockEncarregado);
    });

    it('deve lançar erro quando falha ao atualizar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.put).mockRejectedValue(new Error('Database error'));

      await expect(EncarregadoManager.update(mockEncarregado)).rejects.toThrow('Database error');
    });
  });

  describe('count', () => {
    it('deve contar total de encarregados', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.count).mockResolvedValue(20);

      const result = await EncarregadoManager.count();

      expect(result).toBe(20);
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.count).mockRejectedValue(new Error('Database error'));

      const result = await EncarregadoManager.count();

      expect(result).toBe(0);
    });
  });

  describe('countAtivos', () => {
    it('deve contar encarregados ativos', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        count: vi.fn().mockResolvedValue(15),
      } as any);

      const result = await EncarregadoManager.countAtivos();

      expect(result).toBe(15);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        count: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.countAtivos();

      expect(result).toBe(0);
    });
  });

  describe('getByEmpresa', () => {
    it('deve retornar encarregados da empresa especificada', async () => {
      const { offlineDB } = await import('../../../database');

      const encarregadosEmpresa = [mockEncarregado];

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(encarregadosEmpresa),
      } as any);

      const result = await EncarregadoManager.getByEmpresa('empresa-123');

      expect(result).toEqual(encarregadosEmpresa);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.getByEmpresa('empresa-123');

      expect(result).toEqual([]);
    });
  });

  describe('getByArea', () => {
    it('deve retornar encarregados da área especificada', async () => {
      const { offlineDB } = await import('../../../database');

      const encarregadosArea = [mockEncarregado];

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(encarregadosArea),
      } as any);

      const result = await EncarregadoManager.getByArea('area-123');

      expect(result).toEqual(encarregadosArea);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.getByArea('area-123');

      expect(result).toEqual([]);
    });
  });

  describe('exists', () => {
    it('deve retornar true quando encarregado existe', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.get).mockResolvedValue(mockEncarregado);

      const result = await EncarregadoManager.exists('encarregado-test-123');

      expect(result).toBe(true);
    });

    it('deve retornar false quando encarregado não existe', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.get).mockResolvedValue(undefined);

      const result = await EncarregadoManager.exists('encarregado-inexistente');

      expect(result).toBe(false);
    });

    it('deve retornar false em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.get).mockRejectedValue(new Error('Database error'));

      const result = await EncarregadoManager.exists('encarregado-test-123');

      expect(result).toBe(false);
    });
  });

  describe('getByEspecialidade', () => {
    it('deve retornar encarregados com especialidade especificada', async () => {
      const { offlineDB } = await import('../../../database');

      const encarregadosEspecialidade = [mockEncarregado];

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(encarregadosEspecialidade),
      } as any);

      const result = await EncarregadoManager.getByEspecialidade('Elétrica');

      expect(result).toEqual(encarregadosEspecialidade);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.getByEspecialidade('Elétrica');

      expect(result).toEqual([]);
    });
  });

  describe('getPendentes', () => {
    it('deve retornar encarregados pendentes de sincronização', async () => {
      const { offlineDB } = await import('../../../database');

      const encarregadosPendentes = [mockEncarregado];

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(encarregadosPendentes),
      } as any);

      const result = await EncarregadoManager.getPendentes();

      expect(result).toEqual(encarregadosPendentes);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.getPendentes();

      expect(result).toEqual([]);
    });
  });

  describe('marcarSincronizado', () => {
    it('deve marcar encarregado como sincronizado', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.update).mockResolvedValue(1);

      await EncarregadoManager.marcarSincronizado('encarregado-test-123');

      expect(offlineDB.encarregados.update).toHaveBeenCalledWith('encarregado-test-123', { sincronizado: true });
    });

    it('deve lançar erro quando falha ao marcar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.update).mockRejectedValue(new Error('Database error'));

      await expect(EncarregadoManager.marcarSincronizado('encarregado-test-123')).rejects.toThrow('Database error');
    });
  });

  describe('countPendentes', () => {
    it('deve contar encarregados pendentes', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        count: vi.fn().mockResolvedValue(5),
      } as any);

      const result = await EncarregadoManager.countPendentes();

      expect(result).toBe(5);
      expect(offlineDB.encarregados.filter).toHaveBeenCalled();
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.encarregados.filter).mockReturnValue({
        count: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await EncarregadoManager.countPendentes();

      expect(result).toBe(0);
    });
  });
});
