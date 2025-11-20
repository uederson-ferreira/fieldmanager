import React, { useState, useEffect } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import { criarAcaoCorretiva, criarAcaoAutomatica } from '../../lib/acoesCorretivasAPI';
import type { CriarAcaoPayload, Criticidade } from '../../types/acoes';
import { CRITICIDADE_LABELS } from '../../types/acoes';

interface Props {
  lvId: string;
  avaliacaoId: string;
  tipoLV: string;
  itemCodigo: string;
  itemPergunta: string;
  descricaoNC: string;
  autoCreate?: boolean;
  onSucesso?: (acaoId: string) => void;
  onCancelar?: () => void;
}

const FormAcaoCorretiva: React.FC<Props> = ({
  lvId,
  avaliacaoId,
  tipoLV,
  itemCodigo,
  itemPergunta,
  descricaoNC,
  autoCreate = false,
  onSucesso,
  onCancelar
}) => {
  const [formulario, setFormulario] = useState<Partial<CriarAcaoPayload>>({
    lv_id: lvId,
    avaliacao_id: avaliacaoId,
    tipo_lv: tipoLV,
    item_codigo: itemCodigo,
    item_pergunta: itemPergunta,
    descricao_nc: descricaoNC,
    acao_proposta: '',
    acao_descricao: '',
    criticidade: 'media',
    categoria: '',
    responsavel_id: '',
    area_responsavel: '',
    prazo_dias: 7
  });

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarUsuarios();

    // Se for autocreate, tentar criar automaticamente
    if (autoCreate) {
      handleAutoCriar();
    }
  }, [autoCreate]);

  async function carregarUsuarios() {
    try {
      // Importar e chamar API de usuários
      const { usuariosAPI } = await import('../../lib/usuariosAPI');
      const { usuarios: usuariosData } = await usuariosAPI.getUsuariosAtivos();
      if (usuariosData) {
        setUsuarios(usuariosData);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  async function handleAutoCriar() {
    try {
      setSalvando(true);
      setErro(null);

      const resultado = await criarAcaoAutomatica(avaliacaoId);

      alert(`✅ Ação corretiva criada automaticamente!\n\nCriticidade: ${resultado.regra_aplicada.criticidade}\nPrazo: ${resultado.regra_aplicada.prazo_dias} dias`);

      onSucesso?.(resultado.acao.id);
    } catch (error: any) {
      console.error('Erro ao criar ação automática:', error);
      setErro(error.message || 'Erro ao criar ação automática. Preencha manualmente.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formulario.acao_proposta) {
      setErro('Ação proposta é obrigatória');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const acao = await criarAcaoCorretiva(formulario as CriarAcaoPayload);

      alert('✅ Ação corretiva criada com sucesso!');
      onSucesso?.(acao.id);

    } catch (error: any) {
      console.error('Erro ao criar ação:', error);
      setErro(error.message || 'Erro ao criar ação corretiva');
    } finally {
      setSalvando(false);
    }
  }

  // Se já está criando automaticamente, mostrar loading
  if (autoCreate && salvando) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Criando ação corretiva automaticamente...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NC Info */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="font-medium text-red-800 mb-1">Não Conformidade:</p>
        <p className="text-sm text-red-700 mb-2">
          <span className="font-semibold">{itemCodigo}</span> - {itemPergunta}
        </p>
        <p className="text-sm text-red-600">{descricaoNC}</p>
      </div>

      {/* Botão de Criação Automática */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800 mb-3">
          ⚡ <strong>Criação Rápida:</strong> O sistema pode criar a ação automaticamente
          aplicando regras de criticidade e prazo baseadas no tipo de NC.
        </p>
        <button
          type="button"
          onClick={handleAutoCriar}
          disabled={salvando}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
        >
          {salvando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Criando automaticamente...
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              Criar Automaticamente com Regras
            </>
          )}
        </button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
          <p className="text-red-800 text-sm">⚠️ {erro}</p>
          <p className="text-xs text-red-600 mt-1">
            Se a criação automática falhou, preencha o formulário abaixo manualmente.
          </p>
        </div>
      )}

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou preencha manualmente</span>
        </div>
      </div>

      {/* Ação Proposta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ação Corretiva Proposta *
        </label>
        <input
          type="text"
          value={formulario.acao_proposta}
          onChange={(e) => setFormulario({ ...formulario, acao_proposta: e.target.value })}
          placeholder="Ex: Providenciar tampa para container de resíduos"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      {/* Descrição Detalhada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição Detalhada (opcional)
        </label>
        <textarea
          value={formulario.acao_descricao}
          onChange={(e) => setFormulario({ ...formulario, acao_descricao: e.target.value })}
          placeholder="Detalhes adicionais sobre como executar a ação..."
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Criticidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criticidade *
          </label>
          <select
            value={formulario.criticidade}
            onChange={(e) => setFormulario({ ...formulario, criticidade: e.target.value as Criticidade })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            {Object.entries(CRITICIDADE_LABELS).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>
        </div>

        {/* Prazo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prazo (dias) *
          </label>
          <input
            type="number"
            value={formulario.prazo_dias}
            onChange={(e) => setFormulario({ ...formulario, prazo_dias: parseInt(e.target.value) || 7 })}
            min="1"
            max="365"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Vencimento: {new Date(Date.now() + (formulario.prazo_dias || 7) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Responsável */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Responsável pela Ação
        </label>
        <select
          value={formulario.responsavel_id}
          onChange={(e) => setFormulario({ ...formulario, responsavel_id: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Selecione um responsável...</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nome} - {usuario.email}
            </option>
          ))}
        </select>
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria (opcional)
        </label>
        <input
          type="text"
          value={formulario.categoria}
          onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
          placeholder="Ex: residuos_classe_i, efluentes, documentacao"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          <Save className="w-5 h-5" />
          {salvando ? 'Salvando...' : 'Criar Ação Corretiva'}
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default FormAcaoCorretiva;
