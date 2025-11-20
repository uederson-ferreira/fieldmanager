import React, { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import Modal from '../common/Modal';
import FormAcaoCorretiva from './FormAcaoCorretiva';
import { verificarAcaoExistente } from '../../lib/acoesCorretivasAPI';

interface Props {
  avaliacaoId: string;
  lvId: string;
  tipoLV: string;
  itemCodigo: string;
  itemPergunta: string;
  observacaoNC: string;
}

/**
 * Botão que aparece quando um item é marcado como NC
 * Permite criar ação corretiva automaticamente ou manualmente
 */
const BotaoAcaoNC: React.FC<Props> = ({
  avaliacaoId,
  lvId,
  tipoLV,
  itemCodigo,
  itemPergunta,
  observacaoNC
}) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [acaoExistente, setAcaoExistente] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  async function handleClick() {
    // Verificar se já existe ação para esta NC
    setVerificando(true);
    try {
      const acao = await verificarAcaoExistente(avaliacaoId);
      if (acao) {
        setAcaoExistente(acao.id);
        const irParaAcao = window.confirm(
          'Já existe uma ação corretiva para esta NC.\n\nDeseja visualizá-la?'
        );
        if (irParaAcao) {
          window.location.href = `/acoes-corretivas/${acao.id}`;
        }
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar ação existente:', error);
    } finally {
      setVerificando(false);
    }

    // Se não existe, abrir modal para criar
    setMostrarModal(true);
  }

  function handleSucesso(acaoId: string) {
    setMostrarModal(false);

    const irParaAcao = window.confirm(
      '✅ Ação corretiva criada com sucesso!\n\nDeseja visualizar agora?'
    );

    if (irParaAcao) {
      window.location.href = `/acoes-corretivas/${acaoId}`;
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={verificando}
        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition"
        title="Criar ação corretiva para esta não conformidade"
      >
        {verificando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Verificando...
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            Criar Ação Corretiva
          </>
        )}
      </button>

      <Modal
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        title="🚨 Criar Ação Corretiva para NC"
        size="lg"
      >
        <FormAcaoCorretiva
          avaliacaoId={avaliacaoId}
          lvId={lvId}
          tipoLV={tipoLV}
          itemCodigo={itemCodigo}
          itemPergunta={itemPergunta}
          descricaoNC={observacaoNC || 'Não conformidade detectada'}
          autoCreate={true}
          onSucesso={handleSucesso}
          onCancelar={() => setMostrarModal(false)}
        />
      </Modal>
    </>
  );
};

export default BotaoAcaoNC;
