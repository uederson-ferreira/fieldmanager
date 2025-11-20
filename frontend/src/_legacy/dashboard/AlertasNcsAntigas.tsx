import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, X } from 'lucide-react';
import { lvAPI } from '../../lib/lvAPI';

interface NCAtrasada {
  id: string;
  lv_id: string;
  item_codigo: string;
  item_pergunta: string;
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  prazo_dias: number;
  dias_desde_nc: number;
  dias_atraso: number;
  lvs: {
    numero_sequencial: number;
    area: string;
  };
}

/**
 * Componente de alertas para NCs antigas sem ação corretiva
 * Mostra um banner fixo no topo do dashboard quando há NCs atrasadas
 */
const AlertasNcsAntigas: React.FC = () => {
  const [ncsAtrasadas, setNcsAtrasadas] = useState<NCAtrasada[]>([]);
  const [mostrarAlerta, setMostrarAlerta] = useState(true);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarNcsAtrasadas();
  }, []);

  async function carregarNcsAtrasadas() {
    try {
      setCarregando(true);
      const response = await lvAPI.getNcsPendentes();

      if (response.success && response.data) {
        // Filtrar apenas NCs atrasadas
        const atrasadas = response.data.ncs
          .filter((nc: any) => nc.atrasada)
          .map((nc: any) => ({
            ...nc,
            dias_atraso: nc.dias_desde_nc - nc.prazo_dias
          }))
          .sort((a: any, b: any) => {
            // Ordenar por criticidade (critica > alta > media > baixa) e depois por dias de atraso
            const criticidades = { critica: 4, alta: 3, media: 2, baixa: 1 };
            const diffCriticidade = criticidades[b.criticidade as keyof typeof criticidades] -
                                   criticidades[a.criticidade as keyof typeof criticidades];
            if (diffCriticidade !== 0) return diffCriticidade;
            return b.dias_atraso - a.dias_atraso;
          });

        setNcsAtrasadas(atrasadas);
      }
    } catch (error) {
      console.error('Erro ao carregar NCs atrasadas:', error);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando || !mostrarAlerta || ncsAtrasadas.length === 0) {
    return null;
  }

  const criticasAtrasadas = ncsAtrasadas.filter(nc => nc.criticidade === 'critica').length;
  const altasAtrasadas = ncsAtrasadas.filter(nc => nc.criticidade === 'alta').length;

  return (
    <div className="mb-4 sm:mb-6 w-full overflow-x-hidden">
      {/* Banner principal de alerta */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl shadow-lg p-3 sm:p-4 w-full">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 w-full">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 w-full min-w-0">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                <h3 className="font-bold text-base sm:text-lg break-words">
                  Atenção: {ncsAtrasadas.length} NC{ncsAtrasadas.length > 1 ? 's' : ''} Atrasada{ncsAtrasadas.length > 1 ? 's' : ''}!
                </h3>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse flex-shrink-0" />
              </div>

              <p className="text-xs sm:text-sm text-white/90 mb-3 break-words">
                {criticasAtrasadas > 0 && (
                  <span className="font-semibold">
                    {criticasAtrasadas} crítica{criticasAtrasadas > 1 ? 's' : ''}
                  </span>
                )}
                {criticasAtrasadas > 0 && altasAtrasadas > 0 && ' e '}
                {altasAtrasadas > 0 && (
                  <span className="font-semibold">
                    {altasAtrasadas} alta{altasAtrasadas > 1 ? 's' : ''}
                  </span>
                )}
                {(criticasAtrasadas > 0 || altasAtrasadas > 0) && ' '}
                sem ação corretiva no prazo. Ação imediata necessária!
              </p>

              {/* Lista das 3 NCs mais críticas/atrasadas */}
              <div className="space-y-2 w-full">
                {ncsAtrasadas.slice(0, 3).map((nc) => (
                  <div
                    key={nc.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 w-full"
                    style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)' }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-bold rounded flex-shrink-0 ${
                            nc.criticidade === 'critica'
                              ? 'bg-red-900 text-white'
                              : 'bg-orange-900 text-white'
                          }`}>
                            {nc.criticidade.toUpperCase()}
                          </span>
                          <span className="text-xs font-medium break-words">
                            LV-{String(nc.lvs.numero_sequencial).padStart(4, '0')} - {nc.lvs.area}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium break-words line-clamp-2">
                          {nc.item_codigo} - {nc.item_pergunta}
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                        <div className="text-xs font-semibold bg-red-900 text-white px-2 py-1 rounded inline-block">
                          {nc.dias_atraso} dia{nc.dias_atraso > 1 ? 's' : ''} de atraso
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {ncsAtrasadas.length > 3 && (
                  <div className="text-center text-xs text-white/80 pt-1">
                    + {ncsAtrasadas.length - 3} outra{ncsAtrasadas.length - 3 > 1 ? 's' : ''} NC{ncsAtrasadas.length - 3 > 1 ? 's' : ''} atrasada{ncsAtrasadas.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setMostrarAlerta(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 self-start sm:self-auto"
            title="Dispensar alerta"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertasNcsAntigas;
