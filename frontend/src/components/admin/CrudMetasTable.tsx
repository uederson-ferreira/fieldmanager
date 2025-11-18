// ===================================================================
// COMPONENTE TABELA DE METAS - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetasTable.tsx
// Módulo: Tabela de metas com ações e progresso
// ===================================================================

import React from 'react';
import { Target, Edit, Edit2, Trash2, RefreshCw, Users, UserPlus } from 'lucide-react';
import type { Meta, MetaComProgresso, MetaAtribuicao } from '../../types/metas';
import { getStatusLabel, getTipoMetaLabel, getPeriodoLabel } from '../../types/metas';

interface CrudMetasTableProps {
  metas: Meta[];
  loading: boolean;
  openForm: (meta?: MetaComProgresso) => void;
  handleDelete: (id: string) => Promise<void>;
  handleToggleStatus: (id: string, ativa: boolean) => Promise<void>;
  handleCalcularProgresso: (id: string) => Promise<void>;
  openAtribuicaoModal: (meta: MetaComProgresso) => Promise<void>;
  handleAtribuirATodosTMAs: (metaId: string) => Promise<void>;
  getPercentualColor: (percentual: number) => string;
  getStatusIcon: (status: string) => string;
  onEditarAtribuicao: (meta: Meta, atribuicao: MetaAtribuicao) => void;
  onRemoverAtribuicao: (metaId: string, atribuicaoId: string) => Promise<void>;
}

export const CrudMetasTable: React.FC<CrudMetasTableProps> = ({
  metas,
  loading,
  openForm,
  handleDelete,
  handleToggleStatus,
  handleCalcularProgresso,
  openAtribuicaoModal,
  handleAtribuirATodosTMAs,
  getPercentualColor,
  getStatusIcon,
  onEditarAtribuicao,
  onRemoverAtribuicao
}) => {
  const renderProgresso = (meta: Meta) => {
    const progressoPrincipal = meta.progresso_metas?.[0];
    const quantidadeAtual =
      (progressoPrincipal as any)?.quantidade_atual ??
      (meta as any).quantidade_atual ??
      0;
    const percentual = meta.percentual_alcancado ?? progressoPrincipal?.percentual_atual ?? 0;

    return { quantidadeAtual, percentual };
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-green-100 bg-white px-4 py-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-green-600" />
          <span className="text-green-700">Carregando metas...</span>
        </div>
      </div>
    );
  }

  if (metas.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-green-100 bg-white px-4 py-12 text-center shadow-sm">
        <Target className="mx-auto h-12 w-12 text-green-300" />
        <p className="mt-4 text-green-800">Nenhuma meta cadastrada ainda.</p>
        <button
          onClick={() => openForm()}
          className="mt-3 inline-flex items-center rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          Criar primeira meta
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {metas.map((meta) => {
        const { quantidadeAtual, percentual } = renderProgresso(meta);
        const atribuicoes = meta.metas_atribuicoes ?? [];
        const statusColor = getStatusIcon((meta as any).status_atual || 'em_andamento');
        const ultimaAtualizacao =
          meta.progresso_metas && meta.progresso_metas.length > 0
            ? new Date((meta.progresso_metas[0] as any).ultima_atualizacao).toLocaleDateString('pt-BR')
            : 'Não atualizado';
        let percentualFinal = percentual ?? 0;
        if ((percentualFinal === 0 || Number.isNaN(percentualFinal)) && quantidadeAtual > 0 && meta.meta_quantidade > 0) {
          percentualFinal = (quantidadeAtual / meta.meta_quantidade) * 100;
        }

        return (
          <article
            key={meta.id}
            className="w-full rounded-3xl border border-green-100 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    {getTipoMetaLabel(meta.tipo_meta)}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    Escopo: {meta.escopo === 'individual' ? 'Individual' : 'Equipe'}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    {getPeriodoLabel(meta.periodo)} {meta.ano}
                    {meta.mes ? `/${meta.mes.toString().padStart(2, '0')}` : ''}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-green-900">
                  {(meta as any).titulo || meta.descricao || 'Meta sem título'}
                </h3>
                {meta.descricao && (
                  <p className="text-sm text-green-700">{meta.descricao}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-800">
                  <span
                    className={`h-3 w-3 rounded-full bg-${statusColor}-500`}
                    aria-hidden="true"
                  />
                  {getStatusLabel((meta as any).status_atual || 'em_andamento')}
                </span>
                <button
                  onClick={() => openForm(meta as MetaComProgresso)}
                  className="inline-flex items-center rounded-full border border-blue-200 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-green-800">
                  <span>Progresso geral</span>
                  <span>
                    {quantidadeAtual} / {meta.meta_quantidade}
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-green-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(percentualFinal ?? 0, 100)}%` }}
                  />
                </div>
                <span className={`mt-1 block text-right text-sm font-semibold ${getPercentualColor(percentualFinal ?? 0)}`}>
                  {(percentualFinal ?? 0).toFixed(1)}%
                </span>
              </div>

              <div className="grid gap-3 rounded-2xl bg-green-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase text-green-600">Período</p>
                  <p className="mt-1 text-sm text-green-900">
                    {getPeriodoLabel(meta.periodo)} {meta.ano}
                    {meta.mes ? `/${meta.mes.toString().padStart(2, '0')}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-green-600">Última atualização</p>
                  <p className="mt-1 text-sm text-green-900">{ultimaAtualizacao}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-green-600">Criada em</p>
                  <p className="mt-1 text-sm text-green-900">
                    {meta.created_at ? new Date(meta.created_at).toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-green-600">Status</p>
                  <p className="mt-1 text-sm text-green-900">
                    {meta.ativa ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-semibold text-green-900">
                Atribuições ({atribuicoes.length})
              </h4>

              {atribuicoes.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {atribuicoes.map((atribuicao) => (
                    <div
                      key={atribuicao.id}
                      className="flex items-center justify-between rounded-2xl border border-green-100 bg-white/60 px-3 py-3 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {atribuicao.usuarios?.nome ?? 'TMA não identificado'}
                        </p>
                        <p className="text-xs text-green-700">
                          {atribuicao.usuarios?.email ?? 'E-mail não informado'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                          {atribuicao.meta_quantidade_individual ?? meta.meta_quantidade} un
                        </span>
                        <button
                          type="button"
                          onClick={() => onEditarAtribuicao(meta, atribuicao)}
                          className="inline-flex items-center rounded-full border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                        >
                          <Edit2 className="mr-1 h-3 w-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void onRemoverAtribuicao(meta.id, atribuicao.id)}
                          className="inline-flex items-center rounded-full border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-50"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-green-50 px-3 py-3 text-sm text-green-700">
                  Nenhum TMA atribuído a esta meta no momento.
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-green-100 pt-4">
              <button
                onClick={() => handleCalcularProgresso(meta.id)}
                className="inline-flex items-center rounded-full border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:border-green-300 hover:bg-green-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalcular progresso
              </button>

              {meta.escopo === 'individual' && (
                <button
                  onClick={() => openAtribuicaoModal(meta as MetaComProgresso)}
                  className="inline-flex items-center rounded-full border border-purple-200 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-50"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Atribuição individual
                </button>
              )}

              <button
                onClick={() => handleAtribuirATodosTMAs(meta.id)}
                className="inline-flex items-center rounded-full border border-orange-200 px-3 py-1.5 text-sm font-medium text-orange-700 transition-colors hover:border-orange-300 hover:bg-orange-50"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Atribuir a todos TMAs
              </button>

              <button
                onClick={() => handleToggleStatus(meta.id, !meta.ativa)}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  meta.ativa
                    ? 'border border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50'
                    : 'border border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <Target className="mr-2 h-4 w-4" />
                {meta.ativa ? 'Desativar' : 'Ativar'}
              </button>

              <button
                onClick={() => handleDelete(meta.id)}
                className="inline-flex items-center rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover meta
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}; 