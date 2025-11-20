import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import Modal from '../common/Modal';
import FormAcaoCorretiva from './FormAcaoCorretiva';

interface NCDetectada {
  avaliacao_id: string;
  item_codigo: string;
  item_pergunta: string;
  observacao: string;
  criticidade_sugerida: 'baixa' | 'media' | 'alta' | 'critica';
  prazo_dias_sugerido: number;
  acao_sugerida: string;
  categoria_sugerida: string;
  tem_regra: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lvId: string;
  tipoLV: string;
  ncs: NCDetectada[];
  onTodasAcoesCriadas: () => void;
}

/**
 * Modal que mostra NCs detectadas e permite criar ações corretivas
 * Aparece automaticamente após salvar uma LV com NCs
 */
const ModalCriarAcoesNC: React.FC<Props> = ({
  isOpen,
  onClose,
  lvId,
  tipoLV,
  ncs,
  onTodasAcoesCriadas
}) => {
  const [ncAtualIndex, setNcAtualIndex] = useState(0);
  const [acoesCriadas, setAcoesCriadas] = useState<string[]>([]);
  const [ncsPuladas, setNcsPuladas] = useState<number[]>([]);

  const ncAtual = ncs[ncAtualIndex];
  const totalNCs = ncs.length;
  const totalProcessadas = acoesCriadas.length + ncsPuladas.length;

  function handleSucesso(acaoId: string) {
    console.log(`✅ Ação ${acaoId} criada para NC ${ncAtualIndex + 1}`);
    setAcoesCriadas(prev => [...prev, acaoId]);

    // Se ainda há NCs pendentes, ir para próxima
    if (ncAtualIndex < totalNCs - 1) {
      setNcAtualIndex(prev => prev + 1);
    } else {
      // Todas processadas
      finalizarProcessamento();
    }
  }

  function handlePular() {
    console.log(`⏭️ NC ${ncAtualIndex + 1} pulada`);
    setNcsPuladas(prev => [...prev, ncAtualIndex]);

    // Se ainda há NCs pendentes, ir para próxima
    if (ncAtualIndex < totalNCs - 1) {
      setNcAtualIndex(prev => prev + 1);
    } else {
      // Todas processadas
      finalizarProcessamento();
    }
  }

  function finalizarProcessamento() {
    if (acoesCriadas.length > 0) {
      alert(`✅ ${acoesCriadas.length} ação(ões) corretiva(s) criada(s) com sucesso!`);
    }

    if (ncsPuladas.length > 0) {
      alert(`ℹ️ ${ncsPuladas.length} NC(s) pulada(s). Você pode criar ações para elas depois na tela de Ações Corretivas.`);
    }

    onTodasAcoesCriadas();
    resetarEstado();
    onClose();
  }

  function resetarEstado() {
    setNcAtualIndex(0);
    setAcoesCriadas([]);
    setNcsPuladas([]);
  }

  function handleFechar() {
    if (totalProcessadas > 0 && totalProcessadas < totalNCs) {
      const confirmar = window.confirm(
        `Você criou ${acoesCriadas.length} ação(ões) de ${totalNCs} NC(s).\n\nDeseja realmente sair? As NCs restantes não terão ações criadas.`
      );
      if (!confirmar) return;
    }

    resetarEstado();
    onClose();
  }

  if (!ncAtual) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleFechar}
      title="🚨 Não Conformidades Detectadas"
      size="lg"
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              NC {ncAtualIndex + 1} de {totalNCs}
            </span>
            <span className="text-xs text-gray-500">
              {acoesCriadas.length} criadas • {ncsPuladas.length} puladas
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(totalProcessadas / totalNCs) * 100}%` }}
            />
          </div>
        </div>

        {/* Info da NC Atual */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">
                {ncAtual.item_codigo} - {ncAtual.item_pergunta}
              </h3>
              {ncAtual.observacao && (
                <p className="text-sm text-amber-800 mb-2">
                  <strong>Observação:</strong> {ncAtual.observacao}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${
                  ncAtual.criticidade_sugerida === 'critica' ? 'bg-red-100 text-red-700' :
                  ncAtual.criticidade_sugerida === 'alta' ? 'bg-orange-100 text-orange-700' :
                  ncAtual.criticidade_sugerida === 'media' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {ncAtual.criticidade_sugerida.toUpperCase()}
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  Prazo: {ncAtual.prazo_dias_sugerido} dias
                </span>
                {ncAtual.tem_regra && (
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Regra aplicada
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Ação Corretiva */}
        <FormAcaoCorretiva
          lvId={lvId}
          avaliacaoId={ncAtual.avaliacao_id}
          tipoLV={tipoLV}
          itemCodigo={ncAtual.item_codigo}
          itemPergunta={ncAtual.item_pergunta}
          descricaoNC={ncAtual.observacao || 'Não conformidade detectada'}
          autoCreate={false}
          onSucesso={handleSucesso}
          onCancelar={handlePular}
        />

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <button
            onClick={handlePular}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Pular esta NC
          </button>
          {totalProcessadas > 0 && (
            <button
              onClick={() => {
                if (window.confirm(`Você já processou ${totalProcessadas} NC(s). Deseja parar aqui?`)) {
                  finalizarProcessamento();
                }
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Parar aqui
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalCriarAcoesNC;
