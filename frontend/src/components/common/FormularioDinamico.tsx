// ===================================================================
// COMPONENTE: FORMULÁRIO DINÂMICO - FIELDMANAGER v2.0
// Executa módulos de forma genérica (Checklists, Inspeções, Auditorias)
// ===================================================================

import { useState, useEffect } from 'react';
import { Camera, Save, Send, FileText, AlertCircle } from 'lucide-react';
import type {
  ModuloCompleto,
  PerguntaModulo,
  CriarExecucaoPayload
} from '../../types/dominio';

interface FormularioDinamicoProps {
  modulo: ModuloCompleto;
  tenantId: string;
  usuarioId: string;
  onSubmit: (payload: CriarExecucaoPayload) => Promise<void>;
  onSaveDraft?: (payload: CriarExecucaoPayload) => Promise<void>;
  onCancel: () => void;
  execucaoExistente?: any; // Para edição de rascunhos
}

interface RespostaState {
  pergunta_id: string;
  pergunta_codigo: string;
  resposta?: string;
  resposta_booleana?: boolean;
  observacao?: string;
}

interface FotoState {
  pergunta_id?: string;
  pergunta_codigo?: string;
  file: File;
  preview: string;
  descricao?: string;
}

export default function FormularioDinamico({
  modulo,
  tenantId,
  usuarioId,
  onSubmit,
  onSaveDraft,
  onCancel,
  execucaoExistente
}: FormularioDinamicoProps) {
  const [respostas, setRespostas] = useState<Record<string, RespostaState>>({});
  const [fotos, setFotos] = useState<FotoState[]>([]);
  const [dadosGerais, setDadosGerais] = useState({
    local: '',
    responsavel: '',
    empresa: '',
    observacoes_gerais: ''
  });
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Agrupar perguntas por categoria
  const perguntasPorCategoria = modulo.perguntas.reduce((acc, pergunta) => {
    const categoria = pergunta.categoria || 'Geral';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(pergunta);
    return acc;
  }, {} as Record<string, PerguntaModulo[]>);

  const categorias = Object.keys(perguntasPorCategoria).sort();

  useEffect(() => {
    // Definir primeira categoria como ativa
    if (categorias.length > 0 && !categoriaAtiva) {
      setCategoriaAtiva(categorias[0]);
    }
  }, [categorias, categoriaAtiva]);

  // Renderizar campo baseado no tipo de resposta
  const renderCampo = (pergunta: PerguntaModulo) => {
    const resposta = respostas[pergunta.id];

    switch (pergunta.tipo_resposta) {
      case 'boolean':
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setResposta(pergunta, true, 'C')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                resposta?.resposta === 'C'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Conforme
            </button>
            <button
              type="button"
              onClick={() => setResposta(pergunta, false, 'NC')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                resposta?.resposta === 'NC'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Não Conforme
            </button>
            <button
              type="button"
              onClick={() => setResposta(pergunta, undefined, 'NA')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                resposta?.resposta === 'NA'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              N/A
            </button>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={resposta?.resposta || ''}
            onChange={(e) => setResposta(pergunta, undefined, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Digite sua resposta..."
          />
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={resposta?.resposta || ''}
            onChange={(e) => setResposta(pergunta, undefined, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="Digite um número..."
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={resposta?.resposta || ''}
            onChange={(e) => setResposta(pergunta, undefined, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        );

      case 'multiple_choice':
        return (
          <select
            value={resposta?.resposta || ''}
            onChange={(e) => setResposta(pergunta, undefined, e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecione uma opção...</option>
            {pergunta.opcoes_resposta?.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  // Atualizar resposta
  const setResposta = (
    pergunta: PerguntaModulo,
    booleana?: boolean,
    texto?: string
  ) => {
    setRespostas((prev) => ({
      ...prev,
      [pergunta.id]: {
        pergunta_id: pergunta.id,
        pergunta_codigo: pergunta.codigo,
        resposta: texto,
        resposta_booleana: booleana,
        observacao: prev[pergunta.id]?.observacao
      }
    }));
  };

  // Adicionar observação
  const setObservacao = (perguntaId: string, observacao: string) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: {
        ...prev[perguntaId],
        observacao
      }
    }));
  };

  // Adicionar foto
  const handleAddFoto = (pergunta: PerguntaModulo, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotos((prev) => [
        ...prev,
        {
          pergunta_id: pergunta.id,
          pergunta_codigo: pergunta.codigo,
          file,
          preview: reader.result as string
        }
      ]);
    };
    reader.readAsDataURL(file);
  };

  // Validar formulário
  const validarFormulario = (): boolean => {
    const erros: string[] = [];

    // Validar perguntas obrigatórias
    modulo.perguntas.forEach((pergunta) => {
      if (pergunta.obrigatoria && !respostas[pergunta.id]) {
        erros.push(`Pergunta obrigatória não respondida: ${pergunta.codigo}`);
      }
    });

    setErrors(erros);
    return erros.length === 0;
  };

  // Submeter formulário
  const handleSubmit = async (status: 'rascunho' | 'concluido') => {
    if (status === 'concluido' && !validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const payload: CriarExecucaoPayload = {
        tenant_id: tenantId,
        modulo_id: modulo.id,
        usuario_id: usuarioId,
        status,
        dados_execucao: dadosGerais,
        observacoes_gerais: dadosGerais.observacoes_gerais,
        respostas: Object.values(respostas)
      };

      if (status === 'rascunho' && onSaveDraft) {
        await onSaveDraft(payload);
      } else {
        await onSubmit(payload);
      }
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      setErrors(['Erro ao salvar formulário. Tente novamente.']);
    } finally {
      setLoading(false);
    }
  };

  // Progresso de preenchimento
  const totalPerguntas = modulo.perguntas.length;
  const perguntasRespondidas = Object.keys(respostas).length;
  const progresso = Math.round((perguntasRespondidas / totalPerguntas) * 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{modulo.nome}</h1>
              <p className="text-sm text-gray-600">{modulo.descricao}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium text-emerald-600">
                {perguntasRespondidas}/{totalPerguntas} ({progresso}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dados Gerais */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dados Gerais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Local/Área"
              value={dadosGerais.local}
              onChange={(e) =>
                setDadosGerais((prev) => ({ ...prev, local: e.target.value }))
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Responsável"
              value={dadosGerais.responsavel}
              onChange={(e) =>
                setDadosGerais((prev) => ({ ...prev, responsavel: e.target.value }))
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Empresa"
              value={dadosGerais.empresa}
              onChange={(e) =>
                setDadosGerais((prev) => ({ ...prev, empresa: e.target.value }))
              }
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs de Categorias */}
      {categorias.length > 1 && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="flex border-b">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaAtiva(categoria)}
                  className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                    categoriaAtiva === categoria
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Perguntas */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
        {categoriaAtiva &&
          perguntasPorCategoria[categoriaAtiva]?.map((pergunta, index) => (
            <div key={pergunta.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {pergunta.codigo.split('.')[1] || index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {pergunta.pergunta}
                    {pergunta.obrigatoria && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>

                  {/* Campo de resposta */}
                  {renderCampo(pergunta)}

                  {/* Observação */}
                  {pergunta.permite_observacao && (
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 mb-1">
                        Observação
                      </label>
                      <input
                        type="text"
                        value={respostas[pergunta.id]?.observacao || ''}
                        onChange={(e) =>
                          setObservacao(pergunta.id, e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                        placeholder="Adicione uma observação..."
                      />
                    </div>
                  )}

                  {/* Foto */}
                  {pergunta.permite_foto && (
                    <div className="mt-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">Adicionar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAddFoto(pergunta, file);
                          }}
                        />
                      </label>
                      {/* Preview de fotos */}
                      <div className="flex gap-2 mt-2">
                        {fotos
                          .filter((f) => f.pergunta_id === pergunta.id)
                          .map((foto, i) => (
                            <img
                              key={i}
                              src={foto.preview}
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Observações Gerais */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações Gerais
          </label>
          <textarea
            value={dadosGerais.observacoes_gerais}
            onChange={(e) =>
              setDadosGerais((prev) => ({
                ...prev,
                observacoes_gerais: e.target.value
              }))
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            rows={4}
            placeholder="Observações gerais sobre a execução..."
          />
        </div>
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">
                  Erros no formulário
                </h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            {onSaveDraft && (
              <button
                onClick={() => handleSubmit('rascunho')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Salvar Rascunho
              </button>
            )}
            <button
              onClick={() => handleSubmit('concluido')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Enviando...' : 'Finalizar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
