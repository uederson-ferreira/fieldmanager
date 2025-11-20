// ===================================================================
// COMPONENTE: FORMULÁRIO DINÂMICO - FIELDMANAGER v2.0
// Executa módulos de forma genérica (Checklists, Inspeções, Auditorias)
// ===================================================================

import { useState, useEffect } from 'react';
import { Camera, Save, Send, FileText, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import type {
  ModuloCompleto,
  PerguntaModulo,
  CriarExecucaoPayload
} from '../../types/dominio';
import { uploadMultipleFotos, type FotoExecucao } from '../../lib/fotosExecucoesAPI';
import AssinaturaDigital, { type DadosAssinatura } from './AssinaturaDigital';
import { criarAssinatura, type CriarAssinaturaPayload } from '../../lib/assinaturasAPI';
import { criarExecucao as criarExecucaoAPI } from '../../lib/execucoesAPI';

interface FormularioDinamicoProps {
  modulo: ModuloCompleto;
  tenantId: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
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
  usuarioNome,
  usuarioEmail,
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

  // Estados para assinatura digital
  const [mostrarAssinatura, setMostrarAssinatura] = useState(false);
  const [dadosAssinatura, setDadosAssinatura] = useState<DadosAssinatura | null>(null);
  const [execucaoIdParaAssinatura, setExecucaoIdParaAssinatura] = useState<string | null>(null);

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

  // Gerar imagem de teste
  const gerarImagemTeste = (texto: string): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;

      // Fundo gradiente
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#2563eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Texto central
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧪 FOTO DE TESTE', 400, 250);
      ctx.font = '32px Arial';
      ctx.fillText(texto, 400, 320);
      ctx.font = '24px Arial';
      ctx.fillText('FieldManager v2.0', 400, 380);

      // Converter para blob e depois File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `foto-teste-${Date.now()}.png`, {
            type: 'image/png'
          });
          resolve(file);
        } else {
          // Fallback: criar arquivo vazio se canvas falhar
          resolve(new File([''], 'foto-teste.png', { type: 'image/png' }));
        }
      }, 'image/png');
    });
  };

  // Preencher com dados de teste
  const preencherComDadosTeste = async () => {
    console.log('🧪 [FormularioDinamico] Preenchendo com dados de teste');

    // Preencher dados gerais
    setDadosGerais({
      local: 'Área de Testes - Setor A',
      responsavel: 'João da Silva',
      empresa: 'Empresa Teste Ltda',
      observacoes_gerais: 'Preenchimento automático para testes do sistema.'
    });

    // Preencher respostas das perguntas
    const respostasTeste: Record<string, RespostaState> = {};

    // TODAS as perguntas que permitem foto receberão fotos
    const perguntasComFoto: PerguntaModulo[] = modulo.perguntas
      .filter((p) => p.permite_foto);

    // Preencher respostas
    for (let index = 0; index < modulo.perguntas.length; index++) {
      const pergunta = modulo.perguntas[index];
      
      // Alternar entre Conforme, Não Conforme e N/A
      let resposta: string;
      let booleana: boolean | undefined;
      let obs: string | undefined;

      if (index % 3 === 0) {
        // Conforme
        resposta = 'C';
        booleana = true;
        obs = 'Item conforme. Teste automático.';
      } else if (index % 3 === 1) {
        // Não Conforme
        resposta = 'NC';
        booleana = false;
        obs = 'Item não conforme detectado. Requer atenção. Teste automático.';
      } else {
        // N/A
        resposta = 'NA';
        booleana = undefined;
        obs = 'Não se aplica neste contexto. Teste automático.';
      }

      respostasTeste[pergunta.id] = {
        pergunta_id: pergunta.id,
        pergunta_codigo: pergunta.codigo,
        resposta,
        resposta_booleana: booleana,
        observacao: obs
      };
    }

    setRespostas(respostasTeste);
    console.log(`✅ [FormularioDinamico] ${modulo.perguntas.length} perguntas preenchidas automaticamente`);

    // Gerar fotos de teste distribuídas entre TODAS as perguntas
    // Alternando: 2 fotos na primeira pergunta, 1 na segunda, 2 na terceira, etc.
    if (perguntasComFoto.length > 0) {
      const fotosPromises: Promise<FotoState | null>[] = [];

      // Para cada pergunta que permite foto
      perguntasComFoto.forEach((pergunta, index) => {
        // Primeira pergunta: 2 fotos, Segunda: 1 foto, Terceira: 2 fotos, etc.
        const numFotos = index % 2 === 0 ? 2 : 1;

        // Gerar o número de fotos para esta pergunta
        for (let i = 0; i < numFotos; i++) {
          fotosPromises.push(
            (async () => {
              try {
                await new Promise(resolve => setTimeout(resolve, i * 50)); // Delay para IDs únicos
                const fotoFile = await gerarImagemTeste(`${pergunta.codigo} (${i + 1}/${numFotos})`);
                const preview = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(fotoFile);
                });

                return {
                  pergunta_id: pergunta.id,
                  pergunta_codigo: pergunta.codigo,
                  file: fotoFile,
                  preview,
                  descricao: `Foto ${i + 1} de ${numFotos} - ${pergunta.codigo}`
                };
              } catch (error) {
                console.warn(`⚠️ Erro ao gerar foto para ${pergunta.codigo}:`, error);
                return null;
              }
            })()
          );
        }
      });

      console.log(`📸 [FormularioDinamico] Gerando ${fotosPromises.length} fotos distribuídas...`);
      const fotosGeradas = await Promise.all(fotosPromises);
      const fotosValidas = fotosGeradas.filter(f => f !== null) as FotoState[];

      setFotos(fotosValidas);
      console.log(`✅ [FormularioDinamico] ${fotosValidas.length} fotos de teste adicionadas em ${perguntasComFoto.length} perguntas`);
    }
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

  // Callback quando assinatura é concluída
  const handleAssinaturaConcluida = async (assinatura: DadosAssinatura) => {
    // Proteção contra duplo submit
    if (loading) {
      console.warn('⚠️ [FormularioDinamico] Já está processando, ignorando duplo submit');
      return;
    }

    console.log('✍️ [FormularioDinamico] Assinatura capturada, processando execução...');
    setDadosAssinatura(assinatura);
    setMostrarAssinatura(false);
    setLoading(true);

    try {
      // PASSO 1: Criar execução PRIMEIRO (sem fotos ainda)
      const payload: CriarExecucaoPayload = {
        tenant_id: tenantId,
        modulo_id: modulo.id,
        usuario_id: usuarioId,
        status: 'concluido',
        local_atividade: dadosGerais.local,
        responsavel_tecnico: dadosGerais.responsavel,
        observacoes: dadosGerais.observacoes_gerais,
        campos_customizados: {
          empresa: dadosGerais.empresa,
          fotos: [] // Fotos serão adicionadas depois
        },
        respostas: Object.values(respostas)
      };

      console.log('💾 [FormularioDinamico] Salvando execução...');
      const execucaoCriada = await criarExecucaoAPI(payload);
      console.log('✅ [FormularioDinamico] Execução criada:', execucaoCriada.id);

      // PASSO 2: Upload de fotos usando o ID real da execução
      let fotosUpload: FotoExecucao[] = [];
      if (fotos.length > 0) {
        console.log(`📸 [FormularioDinamico] Fazendo upload de ${fotos.length} fotos...`);

        const { success, data, errors } = await uploadMultipleFotos(
          fotos.map((f) => ({
            file: f.file,
            perguntaId: f.pergunta_id,
            perguntaCodigo: f.pergunta_codigo,
            descricao: f.descricao
          })),
          execucaoCriada.id // Usar ID real da execução
        );

        if (success && data) {
          fotosUpload = data;
          console.log(`✅ [FormularioDinamico] ${fotosUpload.length} fotos enviadas`);
        }

        if (errors && errors.length > 0) {
          console.warn('⚠️ [FormularioDinamico] Alguns uploads falharam:', errors);
        }
      }

      // PASSO 3: Salvar assinatura digital vinculada à execução
      console.log('✍️ [FormularioDinamico] Salvando assinatura digital...');
      const payloadAssinatura: CriarAssinaturaPayload = {
        execucaoId: execucaoCriada.id,
        tenantId,
        usuarioId,
        dadosAssinatura: assinatura,
        localAssinatura: dadosGerais.local,
        cargoResponsavel: dadosGerais.responsavel,
        observacoes: dadosGerais.observacoes_gerais
      };

      await criarAssinatura(payloadAssinatura);
      console.log('✅ [FormularioDinamico] Assinatura digital salva com sucesso');

      // Disparar evento para atualizar dashboard e estatísticas
      window.dispatchEvent(new Event('execucaoCriada'));
      console.log('🔔 [FormularioDinamico] Evento execucaoCriada disparado');

      // Chamar callback de sucesso (para navegação e mensagem)
      // Passar informações da execução criada, não o payload original
      await onSubmit({
        ...payload,
        id: execucaoCriada.id,
        numero_documento: execucaoCriada.numero_documento,
        created_at: execucaoCriada.created_at
      });

    } catch (error) {
      console.error('❌ [FormularioDinamico] Erro ao processar execução com assinatura:', error);
      setErrors(['Erro ao salvar execução com assinatura. Tente novamente.']);
      setLoading(false);
    }
  };

  // Submeter formulário
  const handleSubmit = async (status: 'rascunho' | 'concluido') => {
    // Proteção contra duplo submit
    if (loading) {
      console.warn('⚠️ [FormularioDinamico] Já está processando, ignorando duplo submit');
      return;
    }

    if (status === 'concluido' && !validarFormulario()) {
      return;
    }

    // Se for conclusão, mostrar modal de assinatura
    if (status === 'concluido') {
      console.log('✍️ [FormularioDinamico] Solicitando assinatura digital...');
      setMostrarAssinatura(true);
      return;
    }

    // Salvar rascunho (sem assinatura)
    setLoading(true);

    try {
      // PASSO 1: Criar execução PRIMEIRO (sem fotos ainda)
      const payload: CriarExecucaoPayload = {
        tenant_id: tenantId,
        modulo_id: modulo.id,
        usuario_id: usuarioId,
        status: 'rascunho',
        local_atividade: dadosGerais.local,
        responsavel_tecnico: dadosGerais.responsavel,
        observacoes: dadosGerais.observacoes_gerais,
        campos_customizados: {
          empresa: dadosGerais.empresa,
          fotos: [] // Fotos serão adicionadas depois
        },
        respostas: Object.values(respostas)
      };

      console.log('💾 [FormularioDinamico] Salvando rascunho...');
      const execucaoCriada = await criarExecucaoAPI(payload);
      console.log('✅ [FormularioDinamico] Rascunho criado:', execucaoCriada.id);

      // Disparar evento para atualizar dashboard e estatísticas
      window.dispatchEvent(new Event('execucaoCriada'));
      console.log('🔔 [FormularioDinamico] Evento execucaoCriada disparado (rascunho)');

      // PASSO 2: Upload de fotos usando o ID real da execução
      let fotosUpload: FotoExecucao[] = [];
      if (fotos.length > 0) {
        console.log(`📸 [FormularioDinamico] Fazendo upload de ${fotos.length} fotos...`);

        const { success, data, errors } = await uploadMultipleFotos(
          fotos.map((f) => ({
            file: f.file,
            perguntaId: f.pergunta_id,
            perguntaCodigo: f.pergunta_codigo,
            descricao: f.descricao
          })),
          execucaoCriada.id // Usar ID real da execução
        );

        if (success && data) {
          fotosUpload = data;
          console.log(`✅ [FormularioDinamico] ${fotosUpload.length} fotos enviadas`);
        }

        if (errors && errors.length > 0) {
          console.warn('⚠️ [FormularioDinamico] Alguns uploads falharam:', errors);
        }
      }

      if (onSaveDraft) {
        await onSaveDraft(payload);
      }
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      setErrors(['Erro ao salvar rascunho. Tente novamente.']);
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

          {/* Botão de Teste (DEV apenas) */}
          {import.meta.env.DEV && (
            <div className="mt-3">
              <button
                type="button"
                onClick={preencherComDadosTeste}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <span>🧪</span>
                Preencher com Dados de Teste
                <span className="text-xs opacity-75">(DEV)</span>
              </button>
            </div>
          )}
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
          {/* Indicador de fotos pendentes */}
          {fotos.length > 0 && (
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>
                <strong>{fotos.length}</strong> {fotos.length === 1 ? 'foto será enviada' : 'fotos serão enviadas'}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            {onSaveDraft && (
              <button
                onClick={() => handleSubmit('rascunho')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
            )}
            <button
              onClick={() => handleSubmit('concluido')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? (fotos.length > 0 ? 'Enviando fotos...' : 'Enviando...') : 'Finalizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Assinatura Digital */}
      {mostrarAssinatura && (
        <AssinaturaDigital
          usuarioNome={usuarioNome}
          usuarioEmail={usuarioEmail}
          onAssinaturaConcluida={handleAssinaturaConcluida}
          onCancelar={() => setMostrarAssinatura(false)}
          titulo="Assinatura Digital da Execução"
          descricao={`${modulo.nome} - ${dadosGerais.local || 'Local não informado'}`}
          requerSenha={true}
        />
      )}
    </div>
  );
}
