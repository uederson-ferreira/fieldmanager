// ===================================================================
// COMPONENTE AÇÕES DO FORMULÁRIO DE TERMOS - ECOFIELD SYSTEM
// Localização: src/components/tecnico/TermoFormActions.tsx
// Módulo: Ações e botões do formulário de termos
// ===================================================================

import React from 'react';
import { Save } from 'lucide-react';
import type { ProcessedPhotoData } from '../../utils/TermoPhotoProcessor';

interface TermoFormActionsProps {
  salvando: boolean;
  salvarTermo: () => Promise<void>;
  onCancelar?: () => void;
  fotos: { [categoria: string]: ProcessedPhotoData[] };
  dadosFormulario: {
    nao_conformidades: any[];
    acoes_correcao: any[];
  };
}

export const TermoFormActions: React.FC<TermoFormActionsProps> = ({
  salvando,
  salvarTermo,
  onCancelar,
  fotos,
  dadosFormulario
}) => {
  const totalFotos = Object.values(fotos).reduce((total, fotos) => total + fotos.length, 0);
  const totalNC = dadosFormulario.nao_conformidades.length;
  const totalAcoes = dadosFormulario.acoes_correcao.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="text-sm text-gray-600 space-y-1">
          <p>* Campos obrigatórios</p>
          <p>
            Total de fotos: {totalFotos}
          </p>
          <p>
            Não conformidades: {totalNC}/10
          </p>
          <p>
            Ações de correção: {totalAcoes}/10
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            onClick={() => {
              console.log('🔙 [TERMO FORM] Botão Cancelar clicado');
              console.log('🔙 [TERMO FORM] onCancelar existe:', !!onCancelar);
              
              if (onCancelar) {
                console.log('🔙 [TERMO FORM] Chamando onCancelar...');
                onCancelar();
              } else {
                console.log('❌ [TERMO FORM] onCancelar não definido!');
              }
            }}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={salvarTermo}
            disabled={salvando}
            className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {salvando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar Termo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 