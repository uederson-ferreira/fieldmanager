import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, MessageSquare, Image, RefreshCw, Upload } from 'lucide-react';
import {
  buscarAcaoCorretiva,
  atualizarStatusAcao,
  adicionarComentario,
  adicionarEvidencia,
  iniciarAcao,
  solicitarValidacao,
  concluirAcao,
  cancelarAcao
} from '../lib/acoesCorretivasAPI';
import type { AcaoCorretivaCompleta, HistoricoAcao, ComentarioAcao, StatusAcao } from '../types/acoes';
import type { UserData } from '../types/entities';
import {
  STATUS_ACAO_LABELS,
  CRITICIDADE_LABELS,
  CRITICIDADE_CORES,
  STATUS_ACAO_CORES,
  STATUS_PRAZO_CORES,
  formatarPrazo,
  getCriticidadeIcone,
  getStatusIcone
} from '../types/acoes';

interface DetalhesAcaoCorretivaProps {
  id: string;
  user: UserData;
  onBack: () => void;
}

const DetalhesAcaoCorretiva: React.FC<DetalhesAcaoCorretivaProps> = ({ id, user, onBack }) => {

  const [acao, setAcao] = useState<AcaoCorretivaCompleta | null>(null);
  const [historico, setHistorico] = useState<HistoricoAcao[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioAcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [mudandoStatus, setMudandoStatus] = useState(false);
  const [uploadandoEvidencia, setUploadandoEvidencia] = useState(false);

  useEffect(() => {
    if (id) carregarAcao();
  }, [id]);

  async function carregarAcao() {
    try {
      setCarregando(true);
      setErro(null);
      const resultado = await buscarAcaoCorretiva(id!);
      setAcao(resultado.acao);
      setHistorico(resultado.historico);
      setComentarios(resultado.comentarios);
    } catch (error: any) {
      console.error('Erro ao carregar ação:', error);
      setErro(error.message || 'Erro ao carregar ação corretiva');
    } finally {
      setCarregando(false);
    }
  }

  async function handleMudarStatus(novoStatus: StatusAcao, observacoes?: string) {
    if (!acao) return;

    const confirmacao = window.confirm(`Tem certeza que deseja alterar o status para "${STATUS_ACAO_LABELS[novoStatus]}"?`);
    if (!confirmacao) return;

    try {
      setMudandoStatus(true);
      await atualizarStatusAcao(acao.id, novoStatus, observacoes);
      alert(`✅ Status atualizado para "${STATUS_ACAO_LABELS[novoStatus]}"`);
      await carregarAcao();
    } catch (error: any) {
      alert(`❌ Erro ao atualizar status: ${error.message}`);
    } finally {
      setMudandoStatus(false);
    }
  }

  async function handleEnviarComentario(e: React.FormEvent) {
    e.preventDefault();
    if (!novoComentario.trim() || !acao) return;

    try {
      setEnviandoComentario(true);
      await adicionarComentario(acao.id, novoComentario);
      setNovoComentario('');
      await carregarAcao();
    } catch (error: any) {
      alert(`❌ Erro ao adicionar comentário: ${error.message}`);
    } finally {
      setEnviandoComentario(false);
    }
  }

  async function handleAdicionarEvidencia(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !acao) return;

    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!tiposPermitidos.includes(arquivo.type)) {
      alert('❌ Tipo de arquivo não permitido. Use apenas imagens (JPEG, PNG, WebP, HEIC).');
      e.target.value = '';
      return;
    }

    // Validar tamanho (máx 10MB)
    const tamanhoMaximo = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > tamanhoMaximo) {
      alert('❌ Arquivo muito grande. Tamanho máximo: 10MB');
      e.target.value = '';
      return;
    }

    const descricao = window.prompt('Descrição da evidência (opcional):') || '';

    try {
      setUploadandoEvidencia(true);

      // 1. Primeiro fazer upload do arquivo para o Supabase Storage
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('entityType', 'acoes');
      formData.append('entityId', acao.id);
      formData.append('categoria', 'evidencias');

      const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Erro ao fazer upload da foto');
      }

      const { url: urlFoto } = await uploadResponse.json();

      // 2. Agora registrar a evidência no sistema de ações
      await adicionarEvidencia(acao.id, urlFoto, descricao);

      alert('✅ Evidência adicionada com sucesso!');
      await carregarAcao();
      e.target.value = ''; // Limpar input
    } catch (error: any) {
      console.error('Erro ao adicionar evidência:', error);
      alert(`❌ Erro ao adicionar evidência: ${error.message}`);
      e.target.value = '';
    } finally {
      setUploadandoEvidencia(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (erro || !acao) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">⚠️ {erro || 'Ação não encontrada'}</p>
          <button onClick={onBack} className="mt-2 text-red-600 underline">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const coresCriticidade = CRITICIDADE_CORES[acao.criticidade];
  const coresStatus = STATUS_ACAO_CORES[acao.status];
  const coresPrazo = STATUS_PRAZO_CORES[acao.status_prazo];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Ação Corretiva</h1>
          <p className="text-sm text-gray-600">ID: {acao.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-lg shadow-lg border p-6 space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${coresCriticidade.bg} ${coresCriticidade.text}`}>
            {getCriticidadeIcone(acao.criticidade)} {CRITICIDADE_LABELS[acao.criticidade]}
          </span>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${coresStatus.bg} ${coresStatus.text}`}>
            {getStatusIcone(acao.status)} {STATUS_ACAO_LABELS[acao.status]}
          </span>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${coresPrazo.bg} ${coresPrazo.text}`}>
            {formatarPrazo(acao.status_prazo, acao.dias_ate_prazo)}
          </span>
        </div>

        {/* Título */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {acao.item_codigo} - {acao.item_pergunta}
          </h2>
          <p className="text-sm text-gray-600">
            {acao.nome_lv} • {acao.lv_area} • {new Date(acao.data_inspecao || '').toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* NC */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="font-semibold text-red-800 mb-2">🚨 Não Conformidade Detectada:</p>
          <p className="text-red-700">{acao.descricao_nc}</p>
          {acao.nc_observacao_original && acao.nc_observacao_original !== acao.descricao_nc && (
            <p className="text-sm text-red-600 mt-2 italic">Observação original: {acao.nc_observacao_original}</p>
          )}
        </div>

        {/* Ação Proposta */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="font-semibold text-blue-800 mb-2">✅ Ação Corretiva Proposta:</p>
          <p className="text-blue-700">{acao.acao_proposta}</p>
          {acao.acao_descricao && (
            <p className="text-sm text-blue-600 mt-2">{acao.acao_descricao}</p>
          )}
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-600">Responsável</p>
            <p className="font-medium">{acao.responsavel_nome || 'Não atribuído'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Prazo</p>
            <p className="font-medium">{new Date(acao.prazo_atual).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Abertura</p>
            <p className="font-medium">{new Date(acao.data_abertura).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Evidências</p>
            <p className="font-medium">{acao.qtd_evidencias}</p>
          </div>
        </div>

        {/* Evidências */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-gray-800 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Evidências de Correção ({acao.qtd_evidencias})
            </p>
            {!['concluida', 'cancelada'].includes(acao.status) && (
              <label className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                {uploadandoEvidencia ? 'Enviando...' : 'Adicionar Evidência'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdicionarEvidencia}
                  disabled={uploadandoEvidencia}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {acao.evidencias_correcao.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {acao.evidencias_correcao.map((evidencia, index) => (
                <div key={index} className="group relative">
                  <img
                    src={evidencia.url}
                    alt={`Evidência ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                    onClick={() => window.open(evidencia.url, '_blank')}
                  />
                  {evidencia.descricao && (
                    <p className="text-xs text-gray-600 mt-1">{evidencia.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {acao.evidencias_correcao.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhuma evidência adicionada ainda</p>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="pt-4 border-t">
          <p className="font-semibold text-gray-800 mb-3">Ações Rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {acao.status === 'aberta' && (
              <button
                onClick={() => handleMudarStatus('em_andamento')}
                disabled={mudandoStatus}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                ▶️ Iniciar Ação
              </button>
            )}
            {acao.status === 'em_andamento' && (
              <button
                onClick={() => handleMudarStatus('aguardando_validacao')}
                disabled={mudandoStatus}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                👀 Solicitar Validação
              </button>
            )}
            {acao.status === 'aguardando_validacao' && (
              <>
                <button
                  onClick={() => handleMudarStatus('concluida', 'Ação validada e aprovada')}
                  disabled={mudandoStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Aprovar e Concluir
                </button>
                <button
                  onClick={() => handleMudarStatus('em_andamento', 'Correções necessárias')}
                  disabled={mudandoStatus}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  🔄 Solicitar Correção
                </button>
              </>
            )}
            {!['concluida', 'cancelada'].includes(acao.status) && (
              <button
                onClick={() => {
                  const motivo = window.prompt('Motivo do cancelamento:');
                  if (motivo) handleMudarStatus('cancelada', motivo);
                }}
                disabled={mudandoStatus}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                ❌ Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comentários */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comentários ({comentarios.length})
        </h3>

        {/* Form Novo Comentário */}
        <form onSubmit={handleEnviarComentario} className="mb-6">
          <textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Adicionar comentário..."
            className="w-full border rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-emerald-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={enviandoComentario || !novoComentario.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {enviandoComentario ? 'Enviando...' : 'Enviar Comentário'}
          </button>
        </form>

        {/* Lista de Comentários */}
        <div className="space-y-4">
          {comentarios.map((comentario) => (
            <div key={comentario.id} className="border-l-4 border-emerald-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-gray-800">{comentario.usuario_nome}</p>
                <p className="text-xs text-gray-500">{new Date(comentario.created_at).toLocaleString('pt-BR')}</p>
              </div>
              <p className="text-gray-700">{comentario.comentario}</p>
            </div>
          ))}
          {comentarios.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
          )}
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Histórico ({historico.length})
        </h3>
        <div className="space-y-3">
          {historico.map((item) => (
            <div key={item.id} className="flex gap-3 border-l-2 border-gray-300 pl-4">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.descricao}</p>
                <p className="text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                  {item.usuario_nome && ` • ${item.usuario_nome}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetalhesAcaoCorretiva;
