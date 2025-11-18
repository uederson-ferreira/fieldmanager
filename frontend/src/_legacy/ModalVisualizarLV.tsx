// ===================================================================
// MODAL VISUALIZAR LV - VERSÃO MIGRADA PARA MODAL.TSX
// Localização: src/components/tecnico/ModalVisualizarLV.tsx
// Módulo: Visualização detalhada de Listas de Verificação usando Modal.tsx
// ===================================================================

import React, { useEffect, useState } from 'react';
import { Printer, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import Modal from '../common/Modal';

import { usePhotoCache } from '../../hooks/usePhotoCache';

// ===================================================================
// INTERFACES
// ===================================================================

interface LVAvaliacao {
  id: string;
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  avaliacao: 'C' | 'NC' | 'NA' | 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  observacao?: string;
  created_at?: string;
}

interface LVFoto {
  id: string;
  item_id: string; // UUID da pergunta (perguntas_lv.id)
  url_arquivo: string;
  legenda?: string;
  created_at?: string;
}

interface LVResiduosData {
  id: string;
  numero_lv: string;
  data_lv: string;
  local_atividade: string;
  area_equipamento_atividade: string;
  emitido_por_nome: string;
  destinatario_nome: string;
  status: string;
  created_at: string;
}

interface ModalVisualizarLVProps {
  lv: Partial<LVResiduosData>;
  aberto: boolean;
  onClose: () => void;
}

interface Estatisticas {
  total_conformes: number;
  total_nao_conformes: number;
  total_nao_aplicaveis: number;
  total_avaliado: number;
  percentual_conformidade: number;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const ModalVisualizarLV: React.FC<ModalVisualizarLVProps> = ({ lv, aberto, onClose }) => {
  const [carregando, setCarregando] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<LVAvaliacao[]>([]);
  const [fotos, setFotos] = useState<LVFoto[]>([]);
  const [fotosConvertidas, setFotosConvertidas] = useState<{ [key: string]: string }>({});
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    total_conformes: 0,
    total_nao_conformes: 0,
    total_nao_aplicaveis: 0,
    total_avaliado: 0,
    percentual_conformidade: 0
  });
  
  // Hook para cache de fotos
  const { convertPhotoUrlToBase64 } = usePhotoCache();

  // ===================================================================
  // EFFECTS
  // ===================================================================

  useEffect(() => {
    const carregarDetalhes = async () => {
      if (!aberto || !lv.id) return;

      setCarregando(true);
      try {
        // Buscar dados via API
        const [avaliacoesResponse, fotosResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/lvs/avaliacoes/${lv.id}`),
          fetch(`${import.meta.env.VITE_API_URL}/api/lvs/fotos/${lv.id}`)
        ]);

        const avaliacoesData = avaliacoesResponse.ok ? (await avaliacoesResponse.json()).avaliacoes : [];
        const fotosData = fotosResponse.ok ? (await fotosResponse.json()).fotos : [];

        setAvaliacoes(avaliacoesData || []);
        setFotos(fotosData || []);
        
        // Calcular estatísticas
        const avaliacoesValidas = avaliacoesData || [];
        const novasEstatisticas = {
          total_conformes: avaliacoesValidas.filter((av: LVAvaliacao) => av.avaliacao === 'C' || av.avaliacao === 'conforme').length,
          total_nao_conformes: avaliacoesValidas.filter((av: LVAvaliacao) => av.avaliacao === 'NC' || av.avaliacao === 'nao_conforme').length,
          total_nao_aplicaveis: avaliacoesValidas.filter((av: LVAvaliacao) => av.avaliacao === 'NA' || av.avaliacao === 'nao_aplicavel').length,
          total_avaliado: avaliacoesValidas.length,
          percentual_conformidade: 0
        };
        
        // Calcular percentual de conformidade
        const itensAplicaveis = novasEstatisticas.total_conformes + novasEstatisticas.total_nao_conformes;
        novasEstatisticas.percentual_conformidade = itensAplicaveis > 0 
          ? Math.round((novasEstatisticas.total_conformes / itensAplicaveis) * 100) 
          : 0;
        
        setEstatisticas(novasEstatisticas);
        console.log('📊 [MODAL] Estatísticas calculadas:', novasEstatisticas);
        
        // Converter fotos para base64
        if (fotosData && fotosData.length > 0) {
          console.log('🖼️ [MODAL] Processando fotos:', fotosData.length);
          const fotosConvertidasTemp: { [key: string]: string } = {};
          
          const promises = fotosData.map(async (foto: LVFoto) => {
            try {
              const base64Photo = await convertPhotoUrlToBase64(foto.url_arquivo);
              return { id: foto.id, base64: base64Photo };
            } catch (error) {
              console.error(`❌ [MODAL] Erro ao converter foto ${foto.id}:`, error);
              return { 
                id: foto.id, 
                base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0OEM0NC40MTggNDggNDggNDQuNDE4IDQ4IDQwQzQ4IDM1LjU4MiA0NC40MTggMzIgNDAgMzJDMzUuNTgyIDMyIDMyIDM1LjU4MiAzMiA0MEMzMiA0NC40MTggMzUuNTgyIDQ4IDQwIDQ4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
              };
            }
          });
          
          const resultados = await Promise.all(promises);
          resultados.forEach((result: { id: string; base64: string }) => {
            fotosConvertidasTemp[result.id] = result.base64;
          });
          
          setFotosConvertidas(fotosConvertidasTemp);
          console.log('✅ [MODAL] Processamento de fotos concluído');
        }
      } catch (error) {
        console.error('❌ [MODAL] Erro ao carregar detalhes:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDetalhes();
  }, [aberto, lv.id, convertPhotoUrlToBase64]);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handlePrint = async () => {
    try {
      const conteudo = document.getElementById('modal-lv-content');
      if (!conteudo) return;

      const janela = window.open('', '_blank');
      if (!janela) return;

      janela.document.write(`
        <html>
          <head>
            <title>LV ${lv.numero_lv} - Visualização</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
              .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
              .stat-value { font-size: 24px; font-weight: bold; }
              .stat-label { font-size: 12px; color: #666; }
              .avaliacoes { margin-bottom: 30px; }
              .avaliacao-item { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
              .fotos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
              .foto-item { text-align: center; }
              .foto-item img { max-width: 100%; height: auto; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${conteudo.innerHTML}
          </body>
        </html>
      `);
      janela.document.close();
      janela.print();
    } catch (error) {
      console.error('❌ [PRINT] Erro ao imprimir:', error);
    }
  };

  // ===================================================================
  // RENDER
  // ===================================================================

  return (
    <Modal
      isOpen={aberto}
      onClose={onClose}
      title={`📋 LV ${lv.numero_lv || 'Visualização'}`}
      subtitle={`Local: ${lv.local_atividade} | Data: ${lv.data_lv ? new Date(lv.data_lv).toLocaleDateString('pt-BR') : 'N/A'}`}
      size="xl"
      showCloseButton={true}
      headerClassName="bg-gradient-to-r from-blue-600 to-blue-700"
    >
      {/* Loading */}
      {carregando && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Carregando detalhes...</span>
        </div>
      )}

      {/* Conteúdo */}
      {!carregando && (
        <div id="modal-lv-content" className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">{estatisticas.total_conformes}</div>
              <div className="text-sm text-green-700">Conformes</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-600">{estatisticas.total_nao_conformes}</div>
              <div className="text-sm text-red-700">Não Conformes</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-600">{estatisticas.total_nao_aplicaveis}</div>
              <div className="text-sm text-gray-700">Não Aplicáveis</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.percentual_conformidade}%</div>
              <div className="text-sm text-blue-700">Conformidade</div>
            </div>
          </div>

          {/* Informações Gerais */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">📋 Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Número e Nome */}
              {(lv as any).numero_sequencial && (
                <div>
                  <span className="font-semibold text-gray-700">Número LV:</span>
                  <span className="ml-2 text-gray-900">LV-{String((lv as any).numero_sequencial).padStart(4, '0')}</span>
                </div>
              )}
              {(lv as any).nome_lv && (
                <div>
                  <span className="font-semibold text-gray-700">Tipo:</span>
                  <span className="ml-2 text-gray-900">{(lv as any).nome_lv}</span>
                </div>
              )}

              {/* Datas */}
              {(lv as any).data_inspecao && (
                <div>
                  <span className="font-semibold text-gray-700">Data da Inspeção:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date((lv as any).data_inspecao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {(lv as any).data_preenchimento && (
                <div>
                  <span className="font-semibold text-gray-700">Data de Preenchimento:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date((lv as any).data_preenchimento).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}

              {/* Área e Local */}
              {(lv as any).area && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Área:</span>
                  <span className="ml-2 text-gray-900">{(lv as any).area}</span>
                </div>
              )}

              {/* Responsáveis */}
              {(lv as any).responsavel_area && (
                <div>
                  <span className="font-semibold text-gray-700">Responsável Área:</span>
                  <span className="ml-2 text-gray-900">{(lv as any).responsavel_area}</span>
                </div>
              )}
              {(lv as any).responsavel_tecnico && (
                <div>
                  <span className="font-semibold text-gray-700">Responsável Técnico:</span>
                  <span className="ml-2 text-gray-900">{(lv as any).responsavel_tecnico}</span>
                </div>
              )}
              {(lv as any).responsavel_empresa && (
                <div>
                  <span className="font-semibold text-gray-700">Responsável Empresa:</span>
                  <span className="ml-2 text-gray-900">{(lv as any).responsavel_empresa}</span>
                </div>
              )}

              {/* Inspetores */}
              {(lv as any).inspetor_principal && (
                <div>
                  <span className="font-semibold text-gray-700">Inspetor Principal:</span>
                  <span className="ml-2 text-gray-900">{(lv as any).inspetor_principal}</span>
                </div>
              )}
              {(lv as any).inspetor_secundario && (
                <div>
                  <span className="font-semibold text-gray-700">Inspetor Secundário:</span>
                  <span className="ml-2 text-gray-900">
                    {(lv as any).inspetor_secundario}
                    {(lv as any).inspetor_secundario_matricula &&
                      ` (Mat: ${(lv as any).inspetor_secundario_matricula})`
                    }
                  </span>
                </div>
              )}

              {/* GPS */}
              {((lv as any).latitude || (lv as any).longitude) && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Coordenadas GPS:</span>
                  <span className="ml-2 text-gray-900">
                    {(lv as any).latitude && `Lat: ${(lv as any).latitude}`}
                    {(lv as any).latitude && (lv as any).longitude && ' | '}
                    {(lv as any).longitude && `Long: ${(lv as any).longitude}`}
                    {(lv as any).gps_precisao && ` (Precisão: ${(lv as any).gps_precisao}m)`}
                  </span>
                </div>
              )}

              {/* Observações Gerais */}
              {(lv as any).observacoes_gerais && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Observações Gerais:</span>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{(lv as any).observacoes_gerais}</p>
                </div>
              )}

              {/* Status */}
              {(lv as any).status && (
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="ml-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (lv as any).status === 'concluido' || (lv as any).status === 'concluida'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(lv as any).status === 'concluido' || (lv as any).status === 'concluida'
                        ? 'Concluído'
                        : 'Rascunho'
                      }
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Avaliações */}
          {avaliacoes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">✅ Avaliações Realizadas</h3>
              <div className="space-y-3">
                {avaliacoes.map((avaliacao) => (
                  <div key={avaliacao.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Item {avaliacao.item_id}</span>
                      <div className="flex items-center gap-2">
                        {avaliacao.avaliacao === 'C' || avaliacao.avaliacao === 'conforme' ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Conforme</span>
                          </div>
                        ) : avaliacao.avaliacao === 'NC' || avaliacao.avaliacao === 'nao_conforme' ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Não Conforme</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MinusCircle className="w-4 h-4" />
                            <span className="text-sm">Não Aplicável</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {avaliacao.observacao && (
                      <p className="text-gray-600 text-sm mt-2">{avaliacao.observacao}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fotos */}
          {fotos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">📸 Evidências Fotográficas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fotos.map((foto) => (
                  <div key={foto.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={fotosConvertidas[foto.id] || foto.url_arquivo}
                      alt={`Evidência ${foto.item_id}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNjAgODguOTU0MyA2OC45NTQzIDgwIDgwIDgwSDEyMEMxMzEuMDQ2IDgwIDE0MCA4OC45NTQzIDE0MCAxMDBWMTIwQzE0MCAxMzEuMDQ2IDEzMS4wNDYgMTQwIDEyMCAxNDBIOEQ2OC45NTQzIDE0MCA2MCAxMzEuMDQ2IDYwIDEyMFYxMDBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik04MCA5MEM4MCA4NS4zNzE2IDg0LjM3MTYgODEgODkgODFIMTExQzExNS42MjkgODEgMTIwIDg1LjM3MTYgMTIwIDkwVjExMEMxMjAgMTE0LjYyOSAxMTUuNjI5IDExOSAxMTEgMTE5SDg5Qzg0LjM3MTYgMTE5IDgwIDExNC42MjkgODAgMTEwVjkwWiIgZmlsbD0iI0Q5RENEQyIvPgo8L3N2Zz4K';
                      }}
                    />
                    <div className="p-3">
                      <p className="text-sm text-gray-600">
                        Item {foto.item_id} - {foto.legenda || 'Evidência fotográfica'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão de impressão */}
          <div className="flex justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Relatório</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalVisualizarLV; 