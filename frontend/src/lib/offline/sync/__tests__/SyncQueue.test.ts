// ===================================================================
// TESTES - SYNC QUEUE
// Localização: src/lib/offline/sync/__tests__/SyncQueue.test.ts
// ===================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncQueue } from '../SyncQueue';
import type { SyncQueueItem } from '../../database/EcoFieldDB';

// Mock do offlineDB
vi.mock('../../database', () => ({
  offlineDB: {
    sync_queue: {
      add: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(),
        })),
      })),
      update: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      toArray: vi.fn(),
      orderBy: vi.fn(() => ({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(),
          })),
        })),
      })),
      filter: vi.fn(() => ({
        toArray: vi.fn(),
      })),
    },
  },
}));

// Mock dos syncers
vi.mock('../syncers/TermoSync', () => ({
  TermoSync: {
    syncAll: vi.fn(() => Promise.resolve({ sincronizados: 1, erros: 0 })),
  },
}));

vi.mock('../syncers/LVSync', () => ({
  LVSync: {
    syncAll: vi.fn(() => Promise.resolve({ sincronizados: 1, erros: 0 })),
  },
}));

vi.mock('../syncers/AtividadeRotinaSync', () => ({
  AtividadeRotinaSync: {
    syncAll: vi.fn(() => Promise.resolve({ sincronizados: 1, erros: 0 })),
  },
}));

vi.mock('../syncers/InspecaoSync', () => ({
  InspecaoSync: {
    syncAll: vi.fn(() => Promise.resolve({ sincronizados: 1, erros: 0 })),
  },
}));

vi.mock('../syncers/EncarregadoSync', () => ({
  EncarregadoSync: {
    syncAll: vi.fn(() => Promise.resolve({ sincronizados: 1, erros: 0 })),
  },
}));

describe('SyncQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock crypto.randomUUID
    global.crypto.randomUUID = vi.fn(() => 'test-uuid-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('enqueue', () => {
    it('deve adicionar novo item à fila', async () => {
      const { offlineDB } = await import('../../database');

      vi.mocked(offlineDB.sync_queue.where).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(undefined)),
        })),
      } as any);

      vi.mocked(offlineDB.sync_queue.add).mockResolvedValue('test-uuid-123');

      const id = await SyncQueue.enqueue('termo', 'termo-123', 'create');

      expect(id).toBe('test-uuid-123');
      expect(offlineDB.sync_queue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'termo',
          entity_id: 'termo-123',
          operation: 'create',
          priority: 10,
          retries: 0,
        })
      );
    });

    it('deve atualizar item existente na fila', async () => {
      const { offlineDB } = await import('../../database');

      const existingItem: SyncQueueItem = {
        id: 'existing-id',
        entity_type: 'termo',
        entity_id: 'termo-123',
        operation: 'create',
        priority: 10,
        retries: 0,
        max_retries: 5,
        created_at: new Date().toISOString(),
      };

      vi.mocked(offlineDB.sync_queue.where).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(existingItem)),
        })),
      } as any);

      vi.mocked(offlineDB.sync_queue.update).mockResolvedValue(1);

      const id = await SyncQueue.enqueue('termo', 'termo-123', 'update', {
        priority: 5,
      });

      expect(id).toBe('existing-id');
      expect(offlineDB.sync_queue.update).toHaveBeenCalledWith(
        'existing-id',
        expect.objectContaining({
          operation: 'update',
          priority: 5,
        })
      );
    });

    it('deve respeitar prioridade customizada', async () => {
      const { offlineDB } = await import('../../database');

      vi.mocked(offlineDB.sync_queue.where).mockReturnValue({
        equals: vi.fn(() => ({
          first: vi.fn(() => Promise.resolve(undefined)),
        })),
      } as any);

      await SyncQueue.enqueue('lv', 'lv-456', 'create', { priority: 0 });

      expect(offlineDB.sync_queue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 0, // Prioridade máxima
        })
      );
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas da fila', async () => {
      const { offlineDB } = await import('../../database');

      const mockItems: SyncQueueItem[] = [
        {
          id: '1',
          entity_type: 'termo',
          entity_id: 'termo-1',
          operation: 'create',
          priority: 10,
          retries: 0,
          max_retries: 5,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          entity_type: 'lv',
          entity_id: 'lv-1',
          operation: 'update',
          priority: 5,
          retries: 0,
          max_retries: 5,
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(offlineDB.sync_queue.toArray).mockResolvedValue(mockItems);

      const stats = await SyncQueue.getStats();

      expect(stats).toEqual({
        total: 2,
        pending: 2,
        scheduled: 0,
        failedRecently: 0,
        byEntityType: {
          termo: 1,
          lv: 1,
        },
      });
    });

    it('deve contar itens agendados corretamente', async () => {
      const { offlineDB } = await import('../../database');

      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const mockItems: SyncQueueItem[] = [
        {
          id: '1',
          entity_type: 'termo',
          entity_id: 'termo-1',
          operation: 'create',
          priority: 10,
          retries: 0,
          max_retries: 5,
          created_at: new Date().toISOString(),
          scheduled_for: futureDate,
        },
      ];

      vi.mocked(offlineDB.sync_queue.toArray).mockResolvedValue(mockItems);

      const stats = await SyncQueue.getStats();

      expect(stats.scheduled).toBe(1);
      expect(stats.pending).toBe(0);
    });
  });

  describe('clear', () => {
    it('deve limpar toda a fila', async () => {
      const { offlineDB } = await import('../../database');

      await SyncQueue.clear();

      expect(offlineDB.sync_queue.clear).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover item específico', async () => {
      const { offlineDB } = await import('../../database');

      await SyncQueue.remove('test-id');

      expect(offlineDB.sync_queue.delete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('cleanupFailedItems', () => {
    it('deve remover itens que excederam tentativas', async () => {
      const { offlineDB } = await import('../../database');

      const failedItems: SyncQueueItem[] = [
        {
          id: 'failed-1',
          entity_type: 'termo',
          entity_id: 'termo-1',
          operation: 'create',
          priority: 10,
          retries: 5,
          max_retries: 5,
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(offlineDB.sync_queue.filter).mockReturnValue({
        toArray: vi.fn(() => Promise.resolve(failedItems)),
      } as any);

      vi.mocked(offlineDB.sync_queue.delete).mockResolvedValue(undefined);

      const count = await SyncQueue.cleanupFailedItems();

      expect(count).toBe(1);
      expect(offlineDB.sync_queue.delete).toHaveBeenCalledWith('failed-1');
    });
  });

  describe('processPending', () => {
    it('deve retornar resultado vazio quando não há itens', async () => {
      const { offlineDB } = await import('../../database');

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([])),
          })),
        })),
      } as any);

      const result = await SyncQueue.processPending();

      expect(result).toEqual({
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        errors: [],
      });
    });

    it('deve processar itens pendentes com sucesso', async () => {
      const { offlineDB } = await import('../../database');
      const { TermoSync } = await import('../syncers/TermoSync');

      const mockItem: SyncQueueItem = {
        id: 'item-1',
        entity_type: 'termo',
        entity_id: 'termo-1',
        operation: 'create',
        priority: 10,
        retries: 0,
        max_retries: 5,
        created_at: new Date().toISOString(),
      };

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([mockItem])),
          })),
        })),
      } as any);

      vi.mocked(TermoSync.syncAll).mockResolvedValue({
        success: true,
        sincronizados: 1,
        erros: 0,
        conflitos: 0,
      });

      vi.mocked(offlineDB.sync_queue.delete).mockResolvedValue(undefined);

      const result = await SyncQueue.processPending();

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);
      expect(TermoSync.syncAll).toHaveBeenCalled();
      expect(offlineDB.sync_queue.delete).toHaveBeenCalledWith('item-1');
    });

    it('deve chamar callback de progresso', async () => {
      const { offlineDB } = await import('../../database');
      const { TermoSync } = await import('../syncers/TermoSync');

      const mockItems: SyncQueueItem[] = [
        {
          id: 'item-1',
          entity_type: 'termo',
          entity_id: 'termo-1',
          operation: 'create',
          priority: 10,
          retries: 0,
          max_retries: 5,
          created_at: new Date().toISOString(),
        },
        {
          id: 'item-2',
          entity_type: 'termo',
          entity_id: 'termo-2',
          operation: 'create',
          priority: 10,
          retries: 0,
          max_retries: 5,
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve(mockItems)),
          })),
        })),
      } as any);

      vi.mocked(TermoSync.syncAll).mockResolvedValue({
        success: true,
        sincronizados: 1,
        erros: 0,
        conflitos: 0,
      });

      vi.mocked(offlineDB.sync_queue.delete).mockResolvedValue(undefined);

      const onProgress = vi.fn();
      await SyncQueue.processPending({ onProgress });

      expect(onProgress).toHaveBeenCalled();
    });

    it('deve pular itens que excederam tentativas', async () => {
      const { offlineDB } = await import('../../database');

      const mockItem: SyncQueueItem = {
        id: 'item-1',
        entity_type: 'termo',
        entity_id: 'termo-1',
        operation: 'create',
        priority: 10,
        retries: 5,
        max_retries: 5,
        created_at: new Date().toISOString(),
      };

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([mockItem])),
          })),
        })),
      } as any);

      const result = await SyncQueue.processPending();

      expect(result.skipped).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        entity_type: 'termo',
        entity_id: 'termo-1',
        error: expect.stringContaining('tentativas'),
      });
    });

    it('deve reagendar item com retry quando sincronização falha', async () => {
      const { offlineDB } = await import('../../database');
      const { TermoSync } = await import('../syncers/TermoSync');

      const mockItem: SyncQueueItem = {
        id: 'item-1',
        entity_type: 'termo',
        entity_id: 'termo-1',
        operation: 'create',
        priority: 10,
        retries: 0,
        max_retries: 5,
        created_at: new Date().toISOString(),
      };

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([mockItem])),
          })),
        })),
      } as any);

      vi.mocked(TermoSync.syncAll).mockResolvedValue({
        success: false,
        sincronizados: 0,
        erros: 1,
        conflitos: 0,
      });

      vi.mocked(offlineDB.sync_queue.update).mockResolvedValue(1);

      const result = await SyncQueue.processPending();

      expect(result.failed).toBe(1);
      expect(offlineDB.sync_queue.update).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({
          retries: 1,
          last_error: 'Sincronização retornou false',
          scheduled_for: expect.any(String),
        })
      );
    });

    it('deve processar diferentes tipos de entidade', async () => {
      const { offlineDB } = await import('../../database');
      const { LVSync } = await import('../syncers/LVSync');

      const mockItem: SyncQueueItem = {
        id: 'item-1',
        entity_type: 'lv',
        entity_id: 'lv-1',
        operation: 'create',
        priority: 10,
        retries: 0,
        max_retries: 5,
        created_at: new Date().toISOString(),
      };

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([mockItem])),
          })),
        })),
      } as any);

      vi.mocked(LVSync.syncAll).mockResolvedValue({
        success: true,
        sincronizadas: 1,
        erros: 0,
      });

      vi.mocked(offlineDB.sync_queue.delete).mockResolvedValue(undefined);

      const result = await SyncQueue.processPending();

      expect(result.succeeded).toBe(1);
      expect(LVSync.syncAll).toHaveBeenCalled();
    });

    it('deve registrar erro quando sincronização lança exceção', async () => {
      const { offlineDB } = await import('../../database');
      const { TermoSync } = await import('../syncers/TermoSync');

      const mockItem: SyncQueueItem = {
        id: 'item-1',
        entity_type: 'termo',
        entity_id: 'termo-1',
        operation: 'create',
        priority: 10,
        retries: 0,
        max_retries: 5,
        created_at: new Date().toISOString(),
      };

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([mockItem])),
          })),
        })),
      } as any);

      vi.mocked(TermoSync.syncAll).mockRejectedValue(new Error('Network error'));
      vi.mocked(offlineDB.sync_queue.update).mockResolvedValue(1);

      const result = await SyncQueue.processPending();

      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        entity_type: 'termo',
        entity_id: 'termo-1',
        error: 'Network error',
      });
    });

    it('deve aplicar backoff exponencial em retries', async () => {
      const { offlineDB } = await import('../../database');
      const { TermoSync } = await import('../syncers/TermoSync');

      const mockItem: SyncQueueItem = {
        id: 'item-1',
        entity_type: 'termo',
        entity_id: 'termo-1',
        operation: 'create',
        priority: 10,
        retries: 2, // Terceira tentativa
        max_retries: 5,
        created_at: new Date().toISOString(),
      };

      vi.mocked(offlineDB.sync_queue.orderBy).mockReturnValue({
        filter: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(() => Promise.resolve([mockItem])),
          })),
        })),
      } as any);

      vi.mocked(TermoSync.syncAll).mockRejectedValue(new Error('Test error'));
      vi.mocked(offlineDB.sync_queue.update).mockResolvedValue(1);

      await SyncQueue.processPending();

      // Verificar que update foi chamado com backoff (15000ms para 3ª tentativa)
      expect(offlineDB.sync_queue.update).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({
          retries: 3,
        })
      );
    });
  });
});
