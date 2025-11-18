// ===================================================================
// CONFLICT RESOLUTION MODAL - ECOFIELD SYSTEM
// Localização: src/components/common/ConflictResolutionModal.tsx
// Componente: Modal para resolução de conflitos de sincronização
// ===================================================================

import React, { useState } from 'react';
import type { ConflictInfo, ConflictResolution } from '../../lib/offline/sync/ConflictDetector';
import { ConflictDetector } from '../../lib/offline/sync/ConflictDetector';

interface ConflictResolutionModalProps {
  conflict: ConflictInfo | null;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  conflict,
  onResolve,
  onCancel
}) => {
  const [selectedResolution, setSelectedResolution] = useState<'keep-local' | 'keep-remote' | 'skip'>('keep-local');
  const [showDetails, setShowDetails] = useState(false);

  if (!conflict) return null;

  const description = ConflictDetector.getConflictDescription(conflict);
  const differences = ConflictDetector.compareVersions(conflict);

  const handleResolve = () => {
    onResolve({ action: selectedResolution });
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '(vazio)';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    return String(value);
  };

  const formatFieldName = (field: string): string => {
    // Converter snake_case para formato legível
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-yellow-500 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Conflito de Sincronização Detectado
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Description */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-gray-700">{description}</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-600 font-medium mb-1">Versão Local</p>
              <p className="text-xs text-gray-600">
                Modificado em: {new Date(conflict.localModifiedAt).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600 font-medium mb-1">Versão do Servidor</p>
              <p className="text-xs text-gray-600">
                Modificado em: {new Date(conflict.remoteModifiedAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Differences */}
          {differences.length > 0 && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-left transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {showDetails ? 'Ocultar' : 'Ver'} Diferenças ({differences.length} campos diferentes)
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDetails && (
                <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {differences.map((diff, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {formatFieldName(diff.field)}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-blue-600 font-medium mb-1">Local:</p>
                          <p className="text-gray-700 break-words">{formatValue(diff.local)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-green-600 font-medium mb-1">Servidor:</p>
                          <p className="text-gray-700 break-words">{formatValue(diff.remote)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resolution Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Escolha uma opção:</p>

            <label className="flex items-start gap-3 p-3 border-2 border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
              <input
                type="radio"
                name="resolution"
                value="keep-local"
                checked={selectedResolution === 'keep-local'}
                onChange={(e) => setSelectedResolution(e.target.value as 'keep-local')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">Manter Versão Local</p>
                <p className="text-sm text-gray-600">
                  Sobrescrever dados do servidor com suas alterações locais
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
              <input
                type="radio"
                name="resolution"
                value="keep-remote"
                checked={selectedResolution === 'keep-remote'}
                onChange={(e) => setSelectedResolution(e.target.value as 'keep-remote')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">Manter Versão do Servidor</p>
                <p className="text-sm text-gray-600">
                  Descartar suas alterações locais e manter os dados do servidor
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="resolution"
                value="skip"
                checked={selectedResolution === 'skip'}
                onChange={(e) => setSelectedResolution(e.target.value as 'skip')}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">Pular Sincronização</p>
                <p className="text-sm text-gray-600">
                  Não sincronizar este item agora (você poderá tentar novamente depois)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
