import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { buscarEstatisticasAcoes } from '../../lib/acoesCorretivasAPI';
import type { EstatisticasAcoes } from '../../types/acoes';

const CardsEstatisticasAcoes: React.FC = () => {
  const [stats, setStats] = useState<EstatisticasAcoes | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  async function carregarEstatisticas() {
    try {
      setCarregando(true);
      const dados = await buscarEstatisticasAcoes();
      setStats(dados);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      titulo: 'Ações Abertas',
      valor: stats.abertas + stats.em_andamento,
      icone: AlertCircle,
      cor: 'bg-blue-500',
      corTexto: 'text-blue-600',
      corFundo: 'bg-blue-50'
    },
    {
      titulo: 'Atrasadas',
      valor: stats.atrasadas,
      icone: AlertTriangle,
      cor: 'bg-red-500',
      corTexto: 'text-red-600',
      corFundo: 'bg-red-50'
    },
    {
      titulo: 'Críticas',
      valor: stats.criticas,
      icone: AlertCircle,
      cor: 'bg-orange-500',
      corTexto: 'text-orange-600',
      corFundo: 'bg-orange-50'
    },
    {
      titulo: 'Concluídas',
      valor: stats.concluidas,
      icone: CheckCircle,
      cor: 'bg-green-500',
      corTexto: 'text-green-600',
      corFundo: 'bg-green-50'
    }
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const Icon = card.icone;
          return (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.corFundo}`}>
                  <Icon className={`w-6 h-6 ${card.corTexto}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.titulo}</p>
                <p className={`text-3xl font-bold ${card.corTexto}`}>{card.valor}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Métricas adicionais */}
      {stats.tempo_medio_resolucao_dias && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Métricas de Performance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tempo Médio de Resolução</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.tempo_medio_resolucao_dias.toFixed(1)} dias
              </p>
            </div>
            {stats.taxa_conclusao_no_prazo && (
              <div>
                <p className="text-sm text-gray-600">Taxa de Conclusão no Prazo</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.taxa_conclusao_no_prazo.toFixed(0)}%
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Total de Ações</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsEstatisticasAcoes;
