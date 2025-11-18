// ===================================================================
// TESTES - LV MANAGER
// Localização: src/lib/offline/entities/managers/__tests__/LVManager.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LVManager, LVAvaliacaoManager, LVFotoManager } from '../LVManager';
import type { LV, LVAvaliacao, LVFoto } from '../../../../../types/lv';

// Mock do offlineDB
vi.mock('../../../database', () => ({
  offlineDB: {
    lvs: {
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
      })),
      delete: vi.fn(),
    },
  },
}));

describe('LVManager', () => {
  let mockLV: LV;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.dispatchEvent
    // eslint-disable-next-line no-undef
    global.window = {
      dispatchEvent: vi.fn(),
    } as any;

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
  });

  describe('save', () => {
    it('deve salvar LV com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.put).mockResolvedValue('lv-test-123');

      await LVManager.save(mockLV);

      expect(offlineDB.lvs.put).toHaveBeenCalledWith(mockLV);
    });

    it('deve disparar evento meta:atualizar após salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.put).mockResolvedValue('lv-test-123');

      await LVManager.save(mockLV);

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'meta:atualizar',
        })
      );
    });

    it('deve lançar erro quando falha ao salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.put).mockRejectedValue(new Error('Database error'));

      await expect(LVManager.save(mockLV)).rejects.toThrow('Database error');
    });
  });

  describe('getAll', () => {
    it('deve retornar todas as LVs', async () => {
      const { offlineDB } = await import('../../../database');

      const mockLVs = [mockLV, { ...mockLV, id: 'lv-2' }];
      vi.mocked(offlineDB.lvs.toArray).mockResolvedValue(mockLVs);

      const result = await LVManager.getAll();

      expect(result).toEqual(mockLVs);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.toArray).mockRejectedValue(new Error('Database error'));

      const result = await LVManager.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('deve retornar LV quando encontrada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.get).mockResolvedValue(mockLV);

      const result = await LVManager.getById('lv-test-123');

      expect(result).toEqual(mockLV);
      expect(offlineDB.lvs.get).toHaveBeenCalledWith('lv-test-123');
    });

    it('deve retornar undefined quando LV não encontrada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.get).mockResolvedValue(undefined);

      const result = await LVManager.getById('lv-inexistente');

      expect(result).toBeUndefined();
    });

    it('deve retornar undefined em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.get).mockRejectedValue(new Error('Database error'));

      const result = await LVManager.getById('lv-test-123');

      expect(result).toBeUndefined();
    });
  });

  describe('getByTipo', () => {
    it('deve retornar LVs do tipo especificado', async () => {
      const { offlineDB } = await import('../../../database');

      const lvsResiduos = [mockLV, { ...mockLV, id: 'lv-2' }];

      vi.mocked(offlineDB.lvs.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(lvsResiduos),
        }),
      } as any);

      const result = await LVManager.getByTipo('residuos');

      expect(result).toEqual(lvsResiduos);
      expect(offlineDB.lvs.where).toHaveBeenCalledWith('tipo_lv');
    });

    it('deve retornar array vazio quando nenhuma LV do tipo encontrada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await LVManager.getByTipo('outro-tipo');

      expect(result).toEqual([]);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      const result = await LVManager.getByTipo('residuos');

      expect(result).toEqual([]);
    });
  });

  describe('getPendentes', () => {
    it('deve retornar apenas LVs não sincronizadas', async () => {
      const { offlineDB } = await import('../../../database');

      const lvsPendentes = [mockLV, { ...mockLV, id: 'lv-2' }];

      vi.mocked(offlineDB.lvs.filter).mockReturnValue({
        toArray: vi.fn().mockResolvedValue(lvsPendentes),
      } as any);

      const result = await LVManager.getPendentes();

      expect(result).toEqual(lvsPendentes);
      expect(offlineDB.lvs.filter).toHaveBeenCalled();
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.filter).mockReturnValue({
        toArray: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await LVManager.getPendentes();

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar LV com transação atômica', async () => {
      const { offlineDB } = await import('../../../database');

      // Mock completo dos relacionados
      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: vi.fn().mockResolvedValue(0),
          })),
        })),
      };

      vi.mocked(offlineDB as any).lv_fotos = {
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

      vi.mocked(offlineDB.lvs.delete).mockResolvedValue(undefined);

      await LVManager.delete('lv-test-123');

      expect(offlineDB.lvs.delete).toHaveBeenCalledWith('lv-test-123');
    });

    it('deve deletar avaliações e fotos em cascade', async () => {
      const { offlineDB } = await import('../../../database');

      const deleteAvaliacoesMock = vi.fn().mockResolvedValue(3);
      const deleteFotosMock = vi.fn().mockResolvedValue(2);

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: deleteAvaliacoesMock,
          })),
        })),
      };

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: deleteFotosMock,
          })),
        })),
      };

      vi.mocked(offlineDB as any).transaction = vi.fn(async (_mode: string, _tables: any[], callback: () => Promise<void>) => {
        await callback();
      });

      vi.mocked(offlineDB.lvs.delete).mockResolvedValue(undefined);

      await LVManager.delete('lv-test-123');

      expect(deleteAvaliacoesMock).toHaveBeenCalled();
      expect(deleteFotosMock).toHaveBeenCalled();
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).transaction = vi.fn().mockRejectedValue(
        new Error('Transaction failed')
      );

      await expect(LVManager.delete('lv-test-123')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('deve atualizar LV com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      const lvAtualizada = { ...mockLV, status: 'concluida' };
      vi.mocked(offlineDB.lvs.put).mockResolvedValue('lv-test-123');

      await LVManager.update(lvAtualizada);

      expect(offlineDB.lvs.put).toHaveBeenCalledWith(lvAtualizada);
    });

    it('deve lançar erro quando falha ao atualizar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.put).mockRejectedValue(new Error('Update failed'));

      await expect(LVManager.update(mockLV)).rejects.toThrow();
    });
  });

  describe('marcarSincronizada', () => {
    it('deve marcar LV como sincronizada', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.get).mockResolvedValue(mockLV);
      vi.mocked(offlineDB.lvs.put).mockResolvedValue('lv-test-123');

      await LVManager.marcarSincronizada('lv-test-123');

      expect(offlineDB.lvs.get).toHaveBeenCalledWith('lv-test-123');
      expect(offlineDB.lvs.put).toHaveBeenCalledWith({
        ...mockLV,
        sincronizado: true,
      });
    });

    it('não deve fazer nada se LV não existe', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.get).mockResolvedValue(undefined);

      await LVManager.marcarSincronizada('lv-inexistente');

      expect(offlineDB.lvs.put).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando falha ao marcar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.get).mockRejectedValue(new Error('Database error'));

      await expect(LVManager.marcarSincronizada('lv-test-123')).rejects.toThrow();
    });
  });

  describe('count', () => {
    it('deve contar total de LVs', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs as any).count = vi.fn().mockResolvedValue(50);

      const result = await LVManager.count();

      expect(result).toBe(50);
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs as any).count = vi.fn().mockRejectedValue(
        new Error('Database error')
      );

      const result = await LVManager.count();

      expect(result).toBe(0);
    });
  });

  describe('countPendentes', () => {
    it('deve contar LVs pendentes', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.filter).mockReturnValue({
        count: vi.fn().mockResolvedValue(20),
      } as any);

      const result = await LVManager.countPendentes();

      expect(result).toBe(20);
      expect(offlineDB.lvs.filter).toHaveBeenCalled();
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB.lvs.filter).mockReturnValue({
        count: vi.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      const result = await LVManager.countPendentes();

      expect(result).toBe(0);
    });
  });
});

// ===================================================================
// TESTES - LV AVALIACAO MANAGER
// ===================================================================

describe('LVAvaliacaoManager', () => {
  let mockAvaliacao: LVAvaliacao;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAvaliacao = {
      id: 'avaliacao-test-123',
      lv_id: 'lv-test-123',
      pergunta_id: 'pergunta-1',
      resposta: 'conforme',
      observacao: 'Tudo certo',
      pontuacao: 10,
      created_at: '2025-01-15T10:00:00.000Z',
      updated_at: '2025-01-15T10:00:00.000Z',
    } as LVAvaliacao;
  });

  describe('save', () => {
    it('deve salvar avaliação com sucesso', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        put: vi.fn().mockResolvedValue('avaliacao-test-123'),
      };

      await LVAvaliacaoManager.save(mockAvaliacao);

      expect(offlineDB.lv_avaliacoes.put).toHaveBeenCalledWith(mockAvaliacao);
    });

    it('deve lançar erro quando falha ao salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        put: vi.fn().mockRejectedValue(new Error('Save failed')),
      };

      await expect(LVAvaliacaoManager.save(mockAvaliacao)).rejects.toThrow();
    });
  });

  describe('getByLVId', () => {
    it('deve retornar avaliações da LV', async () => {
      const { offlineDB } = await import('../../../database');

      const mockAvaliacoes = [mockAvaliacao, { ...mockAvaliacao, id: 'avaliacao-2' }];

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue(mockAvaliacoes),
          })),
        })),
      };

      const result = await LVAvaliacaoManager.getByLVId('lv-test-123');

      expect(result).toEqual(mockAvaliacoes);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockRejectedValue(new Error('Database error')),
          })),
        })),
      };

      const result = await LVAvaliacaoManager.getByLVId('lv-test-123');

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar avaliação por ID', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        delete: vi.fn().mockResolvedValue(undefined),
      };

      await LVAvaliacaoManager.delete('avaliacao-test-123');

      expect(offlineDB.lv_avaliacoes.delete).toHaveBeenCalledWith('avaliacao-test-123');
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
      };

      await expect(LVAvaliacaoManager.delete('avaliacao-test-123')).rejects.toThrow();
    });
  });

  describe('deleteByLVId', () => {
    it('deve deletar todas as avaliações de uma LV', async () => {
      const { offlineDB } = await import('../../../database');

      const deleteMock = vi.fn().mockResolvedValue(5);

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: deleteMock,
          })),
        })),
      };

      await LVAvaliacaoManager.deleteByLVId('lv-test-123');

      expect(deleteMock).toHaveBeenCalled();
    });

    it('deve lançar erro quando falha ao deletar avaliações', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
          })),
        })),
      };

      await expect(LVAvaliacaoManager.deleteByLVId('lv-test-123')).rejects.toThrow();
    });
  });

  describe('countByLVId', () => {
    it('deve contar avaliações por LV', async () => {
      const { offlineDB } = await import('../../../database');

      const countMock = vi.fn().mockResolvedValue(10);

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            count: countMock,
          })),
        })),
      };

      const result = await LVAvaliacaoManager.countByLVId('lv-test-123');

      expect(result).toBe(10);
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_avaliacoes = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            count: vi.fn().mockRejectedValue(new Error('Database error')),
          })),
        })),
      };

      const result = await LVAvaliacaoManager.countByLVId('lv-test-123');

      expect(result).toBe(0);
    });
  });
});

// ===================================================================
// TESTES - LV FOTO MANAGER
// ===================================================================

describe('LVFotoManager', () => {
  let mockFoto: LVFoto;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFoto = {
      id: 'foto-test-123',
      lv_id: 'lv-test-123',
      item_id: 'item-1',
      base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      nome_arquivo: 'foto-lv.jpg',
      url_arquivo: undefined,
      tamanho_bytes: 2048,
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

      vi.mocked(offlineDB as any).lv_fotos = {
        put: vi.fn().mockResolvedValue('foto-test-123'),
      };

      await LVFotoManager.save(mockFoto);

      expect(offlineDB.lv_fotos.put).toHaveBeenCalledWith(mockFoto);
    });

    it('deve lançar erro quando falha ao salvar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_fotos = {
        put: vi.fn().mockRejectedValue(new Error('Save failed')),
      };

      await expect(LVFotoManager.save(mockFoto)).rejects.toThrow();
    });
  });

  describe('getByLVId', () => {
    it('deve retornar fotos da LV', async () => {
      const { offlineDB } = await import('../../../database');

      const mockFotos = [mockFoto, { ...mockFoto, id: 'foto-2' }];

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue(mockFotos),
          })),
        })),
      };

      const result = await LVFotoManager.getByLVId('lv-test-123');

      expect(result).toEqual(mockFotos);
      expect(result).toHaveLength(2);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockRejectedValue(new Error('Database error')),
          })),
        })),
      };

      const result = await LVFotoManager.getByLVId('lv-test-123');

      expect(result).toEqual([]);
    });
  });

  describe('getByItemId', () => {
    it('deve retornar fotos de um item específico', async () => {
      const { offlineDB } = await import('../../../database');

      const mockFotos = [mockFoto];

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue(mockFotos),
          })),
        })),
      };

      const result = await LVFotoManager.getByItemId('lv-test-123', 'item-1');

      expect(result).toEqual(mockFotos);
      expect(offlineDB.lv_fotos.where).toHaveBeenCalledWith(['lv_id', 'item_id']);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: vi.fn().mockRejectedValue(new Error('Database error')),
          })),
        })),
      };

      const result = await LVFotoManager.getByItemId('lv-test-123', 'item-1');

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deve deletar foto por ID', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_fotos = {
        delete: vi.fn().mockResolvedValue(undefined),
      };

      await LVFotoManager.delete('foto-test-123');

      expect(offlineDB.lv_fotos.delete).toHaveBeenCalledWith('foto-test-123');
    });

    it('deve lançar erro quando falha ao deletar', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_fotos = {
        delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
      };

      await expect(LVFotoManager.delete('foto-test-123')).rejects.toThrow();
    });
  });

  describe('deleteByLVId', () => {
    it('deve deletar todas as fotos de uma LV', async () => {
      const { offlineDB } = await import('../../../database');

      const deleteMock = vi.fn().mockResolvedValue(8);

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: deleteMock,
          })),
        })),
      };

      await LVFotoManager.deleteByLVId('lv-test-123');

      expect(deleteMock).toHaveBeenCalled();
    });

    it('deve lançar erro quando falha ao deletar fotos', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
          })),
        })),
      };

      await expect(LVFotoManager.deleteByLVId('lv-test-123')).rejects.toThrow();
    });
  });

  describe('countByLVId', () => {
    it('deve contar fotos por LV', async () => {
      const { offlineDB } = await import('../../../database');

      const countMock = vi.fn().mockResolvedValue(15);

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            count: countMock,
          })),
        })),
      };

      const result = await LVFotoManager.countByLVId('lv-test-123');

      expect(result).toBe(15);
    });

    it('deve retornar 0 em caso de erro', async () => {
      const { offlineDB } = await import('../../../database');

      vi.mocked(offlineDB as any).lv_fotos = {
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            count: vi.fn().mockRejectedValue(new Error('Database error')),
          })),
        })),
      };

      const result = await LVFotoManager.countByLVId('lv-test-123');

      expect(result).toBe(0);
    });
  });
});
