// ===================================================================
// TESTES - TERMO MANAGER & TERMO FOTO MANAGER
// Localização: src/lib/offline/entities/managers/__tests__/TermoManager.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TermoManager, TermoFotoManager } from '../TermoManager';
import type { TermoAmbientalOffline, TermoFotoOffline } from '../../../../../types/offline';

// Mock do offlineDB
vi.mock('../../../database', () => ({
  offlineDB: {
    termos_ambientais: {
      put: vi.fn(),
      get: vi.fn(),
      toArray: vi.fn(),
      filter: vi.fn(() => ({
        toArray: vi.fn(),
      })),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock do validation
vi.mock('../../../validation', () => ({
  validateWithStats: vi.fn(() => ({ valid: true, errors: [], stats: {} })),
  normalizeData: vi.fn((data) => data),
  ValidationError: class ValidationError extends Error {
    constructor(public errors: string[]) {
      super('Validation failed');
    }
  },
}));

describe('TermoManager', () => {
  let mockTermo: TermoAmbientalOffline;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTermo = {
      id: 'termo-test-123',
      numero_sequencial: 'T-001',
      tipo_termo: 'NOTIFICACAO',
      emitido_por_usuario_id: 'user-123',
      emitido_por_nome: 'João Silva',
      data_emissao: '2025-01-15',
      status: 'PENDENTE',
      destinatario_nome: 'Maria Santos',
      area_equipamento_atividade: 'Área A',
      natureza_desvio: 'Segurança',
      sincronizado: false,
      offline: true,
      created_at: '2025-01-15T10:00:00.000Z',
      updated_at: '2025-01-15T10:00:00.000Z',
    } as TermoAmbientalOffline;
  });

  describe('save', () => {
    it('deve salvar termo com validação bem-sucedida', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.put).mockResolvedValue('termo-test-123');

      await TermoManager.save(mockTermo);

      expect(offlineDB.termos_ambientais.put).toHaveBeenCalledWith(mockTermo);
    });

    it('deve lançar erro quando validação falha', async () => {
      const { validateWithStats } = await import('../../../validation');

      vi.mocked(validateWithStats).mockReturnValue({
        valid: false,
        errors: ['Campo obrigatório faltando'],
        stats: {},
      });

      await expect(TermoManager.save(mockTermo)).rejects.toThrow();
    });

    it('deve normalizar dados antes de salvar', async () => {
      const { normalizeData, validateWithStats } = await import('../../../validation');
      const { offlineDB } = await import('../../../database');

      // Mock para retornar validação bem-sucedida
      vi.mocked(validateWithStats).mockReturnValue({
        valid: true,
        errors: [],
        stats: {},
      });

      vi.mocked(offlineDB.termos_ambientais.put).mockResolvedValue('termo-test-123');

      await TermoManager.save(mockTermo);

      expect(normalizeData).toHaveBeenCalledWith(mockTermo);
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os termos', async () => {
      const { offlineDB } = await import('../../../database');

      const mockTermos = [mockTermo, { ...mockTermo, id: 'termo-2' }];
      vi.mocked(offlineDB.termos_ambientais.toArray).mockResolvedValue(mockTermos);

      const result = await TermoManager.getAll();

      expect(result).toEqual(mockTermos);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.toArray).mockRejectedValue(
        new Error('Database error')
      );

      const result = await TermoManager.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('deve retornar termo quando encontrado', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.get).mockResolvedValue(mockTermo);

      const result = await TermoManager.getById('termo-test-123');

      expect(result).toEqual(mockTermo);
      expect(offlineDB.termos_ambientais.get).toHaveBeenCalledWith('termo-test-123');
    });

    it('deve retornar undefined quando termo não encontrado', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.get).mockResolvedValue(undefined);

      const result = await TermoManager.getById('termo-inexistente');

      expect(result).toBeUndefined();
    });

    it('deve retornar undefined em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.get).mockRejectedValue(
        new Error('Database error')
      );

      const result = await TermoManager.getById('termo-test-123');

      expect(result).toBeUndefined();
    });
  });

  describe('getPendentes', () => {
    it('deve retornar apenas termos não sincronizados', async () => {
      const { offlineDB } = await import('../../../database');

      const termosPendentes = [
        mockTermo,
        { ...mockTermo, id: 'termo-2', sincronizado: false },
      ];

      vi.mocked(offlineDB.termos_ambientais.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(termosPendentes),
      } as any);

      const result = await TermoManager.getPendentes();

      expect(result).toEqual(termosPendentes);
      expect(offlineDB.termos_ambientais.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await TermoManager.getPendentes();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar termo com transação atômica', async () => {
      const { offlineDB } = await import('../../../database');

      // Mock completo do termos_fotos para o teste
      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: vi.fn().mockResolvedValue(0),
          })),
        })),
      };

      // Mock da transação
      vi.mocked(offlineDB as any).transaction = vi.fn(async (_mode: string, _tables: any[], callback: () => Promise<void>) => {
        await callback();
      });

      vi.mocked(offlineDB.termos_ambientais.delete).mockResolvedValue(undefined);

      await TermoManager.delete('termo-test-123');

      expect(offlineDB.termos_ambientais.delete).toHaveBeenCalledWith('termo-test-123');
    });

    it('deve deletar fotos associadas em cascade', async () => {
      const { offlineDB } = await import('../../../database');

      // Mock da transação
      vi.mocked(offlineDB as any).transaction = vi.fn(async (_mode: string, _tables: any[], callback: () => Promise<void>) => {
        await callback();
      });

      // Mock do where().equals().delete()
      const deleteMock = vi.fn().mockResolvedValue(3); // 3 fotos removidas
      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: deleteMock,
          })),
        })),
      };

      vi.mocked(offlineDB.termos_ambientais.delete).mockResolvedValue(undefined);

      await TermoManager.delete('termo-test-123');

      expect(deleteMock).toHaveBeenCalled();
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).transaction = vi.fn().mockRejectedValue(
        new Error('Transaction failed')
      );

      await expect(TermoManager.delete('termo-test-123')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('deve atualizar termo com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      const termoAtualizado = { ...mockTermo, status: 'RESOLVIDO' };
      vi.mocked(offlineDB.termos_ambientais.put).mockResolvedValue('termo-test-123');

      await TermoManager.update(termoAtualizado);

      expect(offlineDB.termos_ambientais.put).toHaveBeenCalledWith(termoAtualizado);
    });

    it('deve lançar erro quando falha ao atualizar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.put).mockRejectedValue(
        new Error('Update failed')
      );

      await expect(TermoManager.update(mockTermo)).rejects.toThrow();
    });
  });

  describe('marcarSincronizado', () => {
    it('deve marcar termo como sincronizado', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.get).mockResolvedValue(mockTermo);
      vi.mocked(offlineDB.termos_ambientais.put).mockResolvedValue('termo-test-123');

      await TermoManager.marcarSincronizado('termo-test-123');

      expect(offlineDB.termos_ambientais.get).toHaveBeenCalledWith('termo-test-123');
      expect(offlineDB.termos_ambientais.put).toHaveBeenCalledWith({
        ...mockTermo,
        sincronizado: true,
      });
    });

    it('não deve fazer nada se termo não existe', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.get).mockResolvedValue(undefined);

      await TermoManager.marcarSincronizado('termo-inexistente');

      expect(offlineDB.termos_ambientais.put).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando falha ao marcar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.get).mockRejectedValue(
        new Error('Database error')
      );

      await expect(TermoManager.marcarSincronizado('termo-test-123')).rejects.toThrow();
    });
  });

  describe('count', () => {
    it('deve contar total de termos', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais as any).count = vi.fn().mockResolvedValue(42);

      const result = await TermoManager.count();

      expect(result).toBe(42);
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais as any).count = vi.fn().mockRejectedValue(
        new Error('Database error')
      );

      const result = await TermoManager.count();

      expect(result).toBe(0);
    });
  });

  describe('countPendentes', () => {
    it('deve contar termos pendentes', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.filter).mockReturnValue({
        count: vi.fn().mockResolvedValue(15),
      } as any);

      const result = await TermoManager.countPendentes();

      expect(result).toBe(15);
      expect(offlineDB.termos_ambientais.filter).toHaveBeenCalled();
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.termos_ambientais.filter).mockReturnValue({
        count: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await TermoManager.countPendentes();

      expect(result).toBe(0);
    });
  });
});

// ===================================================================
// TESTES - TERMO FOTO MANAGER
// ===================================================================

describe('TermoFotoManager', () => {
  let mockFoto: TermoFotoOffline;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFoto = {
      id: 'foto-test-123',
      termo_id: 'termo-test-123',
      base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      nome_arquivo: 'foto-teste.jpg',
      url_arquivo: undefined,
      tamanho_bytes: 1024,
      tipo_mime: 'image/jpeg',
      sincronizado: false,
      offline: true,
      created_at: '2025-01-15T10:00:00.000Z',
      updated_at: '2025-01-15T10:00:00.000Z',
    };
  });

  describe('save', () => {
    it('deve salvar foto com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).termos_fotos = {
        put: vi.fn().mockResolvedValue('foto-test-123'),
      };

      await TermoFotoManager.save(mockFoto);

      expect(offlineDB.termos_fotos.put).toHaveBeenCalledWith(mockFoto);
    });

    it('deve lançar erro quando falha ao salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).termos_fotos = {
        put: vi.fn().mockRejectedValue(new Error('Save failed')),
      };

      await expect(TermoFotoManager.save(mockFoto)).rejects.toThrow();
    });
  });

  describe('getByTermoId', () => {
    it('deve retornar fotos do termo', async () => {
      const { offlineDB } = await import('../../../database');

      const mockFotos = [mockFoto, { ...mockFoto, id: 'foto-2' }];
      const toArrayMock = vi.fn().mockResolvedValue(mockFotos);

      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: toArrayMock,
          })),
        })),
      };

      const result = await TermoFotoManager.getByTermoId('termo-test-123');

      expect(result).toEqual(mockFotos);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockRejectedValue(new Error('Database error')),
          })),
        })),
      };

      const result = await TermoFotoManager.getByTermoId('termo-test-123');

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar foto por ID', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).termos_fotos = {
        delete: vi.fn().mockResolvedValue(),
      };

      await TermoFotoManager.delete('foto-test-123');

      expect(offlineDB.termos_fotos.delete).toHaveBeenCalledWith('foto-test-123');
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).termos_fotos = {
        delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
      };

      await expect(TermoFotoManager.delete('foto-test-123')).rejects.toThrow();
    });
  });

  describe('deleteByTermoId', () => {
    it('deve deletar todas as fotos de um termo', async () => {
      const { offlineDB } = await import('../../../database');

      const deleteMock = vi.fn().mockResolvedValue(5); // 5 fotos deletadas

      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: deleteMock,
          })),
        })),
      };

      await TermoFotoManager.deleteByTermoId('termo-test-123');

      expect(deleteMock).toHaveBeenCalled();
    });

    it('deve lançar erro quando falha ao deletar fotos', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
          })),
        })),
      };

      await expect(TermoFotoManager.deleteByTermoId('termo-test-123')).rejects.toThrow();
    });
  });

  describe('countByTermoId', () => {
    it('deve contar fotos por termo', async () => {
      const { offlineDB } = await import('../../../database');

      const countMock = vi.fn().mockResolvedValue(7);

      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            count: countMock,
          })),
        })),
      };

      const result = await TermoFotoManager.countByTermoId('termo-test-123');

      expect(result).toBe(7);
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).termos_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            count: vi.fn().mockRejectedValue(new Error('Database error')),
          })),
        })),
      };

      const result = await TermoFotoManager.countByTermoId('termo-test-123');

      expect(result).toBe(0);
    });
  });
});
