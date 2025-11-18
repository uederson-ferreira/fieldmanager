// ===================================================================
// COMPONENTE - SELETOR DE DOMÍNIO (FIELDMANAGER v2.0)
// Localização: frontend/src/components/common/DominioSelector.tsx
// ===================================================================

import React from 'react';
import {
  Leaf,
  HardHat,
  Award,
  Stethoscope,
  Wrench,
  ClipboardCheck,
  type LucideIcon
} from 'lucide-react';
import type { Dominio } from '../../types/dominio';
import { useDominio } from '../../contexts/DominioContext';

interface DominioSelectorProps {
  className?: string;
}

// Mapeamento de ícones Lucide
const iconMap: Record<string, LucideIcon> = {
  Leaf,
  HardHat,
  Award,
  Stethoscope,
  Wrench,
  ClipboardCheck
};

const DominioSelector: React.FC<DominioSelectorProps> = ({ className = '' }) => {
  const { dominioAtual, dominiosDisponiveis, setDominioAtual, carregando, erro } = useDominio();

  if (carregando) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-sm text-gray-600">Carregando domínios...</span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={`bg-red-50 rounded-xl border border-red-200 p-4 ${className}`}>
        <p className="text-sm text-red-600">❌ {erro}</p>
      </div>
    );
  }

  if (dominiosDisponiveis.length === 0) {
    return (
      <div className={`bg-yellow-50 rounded-xl border border-yellow-200 p-4 ${className}`}>
        <p className="text-sm text-yellow-800">
          ⚠️ Nenhum domínio disponível. Entre em contato com o administrador.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Domínios Ativos ({dominiosDisponiveis.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {dominiosDisponiveis.map(dominio => {
          const Icon = iconMap[dominio.icone] || ClipboardCheck;
          const isActive = dominio.id === dominioAtual?.id;

          return (
            <button
              key={dominio.id}
              onClick={() => setDominioAtual(dominio)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2
                transition-all duration-200 hover:scale-105
                ${
                  isActive
                    ? 'border-current bg-gradient-to-br from-white to-gray-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                }
              `}
              style={{
                borderColor: isActive ? dominio.cor_primaria : undefined,
                color: isActive ? dominio.cor_primaria : '#6B7280'
              }}
              title={dominio.descricao || dominio.nome}
            >
              <Icon
                className={`h-8 w-8 mb-2 transition-all ${isActive ? 'scale-110' : ''}`}
                style={{ color: isActive ? dominio.cor_primaria : undefined }}
              />

              <span className="text-xs font-medium text-center line-clamp-2">
                {dominio.nome}
              </span>

              {isActive && (
                <div
                  className="mt-2 w-full h-1 rounded-full"
                  style={{ backgroundColor: dominio.cor_primaria }}
                />
              )}
            </button>
          );
        })}
      </div>

      {dominioAtual && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: dominioAtual.cor_primaria }}
            />
            <p className="text-sm text-gray-600">
              <span className="font-medium">Domínio Atual:</span>{' '}
              <span style={{ color: dominioAtual.cor_primaria }}>
                {dominioAtual.nome}
              </span>
            </p>
          </div>

          {dominioAtual.descricao && (
            <p className="text-xs text-gray-500 mt-1 ml-5">
              {dominioAtual.descricao}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DominioSelector;
