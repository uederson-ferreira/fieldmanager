import React from 'react';
import { ArrowLeft } from 'lucide-react';
import CardsEstatisticasAcoes from '../components/acoes/CardsEstatisticasAcoes';
import ListaAcoesCorretivas from '../components/acoes/ListaAcoesCorretivas';
import type { UserData } from '../types/entities';

interface AcoesCorretivasProps {
  user: UserData;
  onBack: () => void;
}

/**
 * Página principal do módulo de Ações Corretivas
 * Exibe estatísticas e lista de ações
 */
const AcoesCorretivas: React.FC<AcoesCorretivasProps> = ({ user, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com botão Voltar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ações Corretivas</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Gerencie ações corretivas derivadas de não conformidades em LVs
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Como criar uma ação corretiva:</strong> As ações são criadas automaticamente quando você marca um item como "Não Conforme" (NC) em uma LV. O sistema analisa as regras de criticidade e cria a ação com prazo e responsável sugeridos.
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <CardsEstatisticasAcoes />

        {/* Lista de Ações */}
        <ListaAcoesCorretivas />
      </div>
    </div>
  );
};

export default AcoesCorretivas;
