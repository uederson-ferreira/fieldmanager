// ===================================================================
// TESTES - CONFLICT RESOLVER
// Localização: src/lib/offline/sync/__tests__/ConflictResolver.test.ts
// ===================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictResolver } from '../ConflictResolver';
import type { ConflictableEntity } from '../ConflictResolver';

describe('ConflictResolver', () => {
  let baseEntity: ConflictableEntity;

  beforeEach(() => {
    baseEntity = {
      id: 'test-id-123',
      created_at: '2025-01-01T10:00:00.000Z',
      updated_at: '2025-01-01T10:00:00.000Z',
    };
  });

  describe('detectConflict', () => {
    it('deve detectar quando não há versão remota (novo registro)', () => {
      const result = ConflictResolver.detectConflict(baseEntity, null as any);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe('NO_CONFLICT');
      expect(result.recommendedStrategy).toBe('USE_LOCAL');
      expect(result.message).toContain('Registro novo');
    });

    it('deve detectar quando versão remota é mais nova', () => {
      const local = { ...baseEntity, updated_at: '2025-01-01T10:00:00.000Z' };
      const remote = { ...baseEntity, updated_at: '2025-01-01T11:00:00.000Z' };

      const result = ConflictResolver.detectConflict(local, remote);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('REMOTE_NEWER');
      expect(result.recommendedStrategy).toBe('USE_REMOTE');
      expect(result.message).toContain('mais recente');
    });

    it('deve detectar quando versão local é mais nova', () => {
      const local = { ...baseEntity, updated_at: '2025-01-01T12:00:00.000Z' };
      const remote = { ...baseEntity, updated_at: '2025-01-01T10:00:00.000Z' };

      const result = ConflictResolver.detectConflict(local, remote);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('LOCAL_NEWER');
      expect(result.recommendedStrategy).toBe('USE_LOCAL');
      expect(result.message).toContain('mais recente');
    });

    it('deve detectar quando timestamps são iguais (sem conflito)', () => {
      const local = { ...baseEntity, updated_at: '2025-01-01T10:00:00.000Z' };
      const remote = { ...baseEntity, updated_at: '2025-01-01T10:00:00.000Z' };

      const result = ConflictResolver.detectConflict(local, remote);

      expect(result.hasConflict).toBe(false);
      expect(result.conflictType).toBe('NO_CONFLICT');
      expect(result.message).toContain('Mesma versão');
    });

    it('deve usar created_at como fallback quando updated_at ausente', () => {
      const local = { ...baseEntity, updated_at: undefined, created_at: '2025-01-01T10:00:00.000Z' };
      const remote = { ...baseEntity, updated_at: undefined, created_at: '2025-01-01T11:00:00.000Z' };

      const result = ConflictResolver.detectConflict(local, remote);

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('REMOTE_NEWER');
    });

    it('deve lidar com timestamps inválidos', () => {
      const local = { ...baseEntity, updated_at: 'invalid-date' };
      const remote = { ...baseEntity, updated_at: '2025-01-01T10:00:00.000Z' };

      const result = ConflictResolver.detectConflict(local, remote);

      expect(result.hasConflict).toBe(false);
      expect(result.recommendedStrategy).toBe('USE_LOCAL');
      expect(result.message).toContain('inválidos');
    });

    it('deve calcular diferença de tempo corretamente', () => {
      const local = { ...baseEntity, updated_at: '2025-01-01T10:00:00.000Z' };
      const remote = { ...baseEntity, updated_at: '2025-01-01T10:30:00.000Z' };

      const result = ConflictResolver.detectConflict(local, remote);

      expect(result.message).toContain('30 min');
    });
  });

  describe('resolveConflict', () => {
    it('deve resolver usando versão local (USE_LOCAL)', () => {
      const local = { ...baseEntity, name: 'Local Name' } as any;
      const remote = { ...baseEntity, name: 'Remote Name' } as any;

      const resolved = ConflictResolver.resolveConflict(local, remote, 'USE_LOCAL');

      expect(resolved.name).toBe('Local Name');
      expect(resolved._conflict_resolved_at).toBeDefined();
    });

    it('deve resolver usando versão remota (USE_REMOTE)', () => {
      const local = { ...baseEntity, name: 'Local Name' } as any;
      const remote = { ...baseEntity, name: 'Remote Name' } as any;

      const resolved = ConflictResolver.resolveConflict(local, remote, 'USE_REMOTE');

      expect(resolved.name).toBe('Remote Name');
      expect(resolved._conflict_resolved_at).toBeDefined();
    });

    it('deve fazer merge automático (MERGE)', () => {
      const local = {
        ...baseEntity,
        name: 'Local Name',
        description: 'Local Description',
        localOnly: 'Only in local',
      } as any;

      const remote = {
        ...baseEntity,
        name: 'Remote Name',
        email: 'remote@test.com',
      } as any;

      const resolved = ConflictResolver.resolveConflict(local, remote, 'MERGE');

      expect(resolved.name).toBe('Remote Name'); // Base é remote
      expect(resolved.email).toBe('remote@test.com');
      expect(resolved.localOnly).toBe('Only in local'); // Campo só em local
      expect(resolved._conflict_resolved_at).toBeDefined();
      expect(resolved.updated_at).toBeDefined();
    });

    it('deve usar local quando estratégia é ASK_USER', () => {
      const local = { ...baseEntity, name: 'Local Name' } as any;
      const remote = { ...baseEntity, name: 'Remote Name' } as any;

      const resolved = ConflictResolver.resolveConflict(local, remote, 'ASK_USER');

      expect(resolved.name).toBe('Local Name');
    });
  });

  describe('updateLocalTimestamp', () => {
    it('deve atualizar timestamps local e updated_at', () => {
      const entity = { ...baseEntity };

      const updated = ConflictResolver.updateLocalTimestamp(entity);

      expect(updated._local_updated_at).toBeDefined();
      expect(updated.updated_at).toBeDefined();
      expect(new Date(updated._local_updated_at!).getTime()).toBeGreaterThan(
        new Date(baseEntity.updated_at!).getTime()
      );
    });
  });

  describe('isLocallyModified', () => {
    it('deve retornar true quando local foi modificado mais recentemente', () => {
      const entity = {
        ...baseEntity,
        updated_at: '2025-01-01T10:00:00.000Z',
        _local_updated_at: '2025-01-01T11:00:00.000Z',
      };

      const result = ConflictResolver.isLocallyModified(entity);

      expect(result).toBe(true);
    });

    it('deve retornar false quando local não foi modificado', () => {
      const entity = {
        ...baseEntity,
        updated_at: '2025-01-01T11:00:00.000Z',
        _local_updated_at: '2025-01-01T10:00:00.000Z',
      };

      const result = ConflictResolver.isLocallyModified(entity);

      expect(result).toBe(false);
    });

    it('deve retornar false quando timestamps ausentes', () => {
      const entity = { ...baseEntity };

      const result = ConflictResolver.isLocallyModified(entity);

      expect(result).toBe(false);
    });
  });

  describe('formatConflictMessage', () => {
    it('deve formatar mensagem quando não há conflito', () => {
      const result = {
        hasConflict: false,
        conflictType: 'NO_CONFLICT' as const,
        recommendedStrategy: 'USE_LOCAL' as const,
        message: 'Sem conflitos',
      };

      const message = ConflictResolver.formatConflictMessage(result);

      expect(message).toContain('Sem conflitos');
    });

    it('deve formatar mensagem detalhada quando há conflito', () => {
      const result = {
        hasConflict: true,
        conflictType: 'REMOTE_NEWER' as const,
        localTimestamp: '2025-01-01T10:00:00.000Z',
        remoteTimestamp: '2025-01-01T11:00:00.000Z',
        recommendedStrategy: 'USE_REMOTE' as const,
        message: 'Versão remota mais recente',
      };

      const message = ConflictResolver.formatConflictMessage(result);

      expect(message).toContain('CONFLITO DETECTADO');
      expect(message).toContain('REMOTE_NEWER');
      expect(message).toContain('USE_REMOTE');
    });
  });
});
