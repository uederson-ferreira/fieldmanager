// ===================================================================
// MODAL DE EDIÇÃO DE ATRIBUIÇÃO DE META - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetasEditarAtribuicao.tsx
// ===================================================================

import React from 'react';
import Modal from '../common/Modal';
import type { Meta, MetaAtribuicao } from '../../types/metas';

interface CrudMetasEditarAtribuicaoProps {
  isOpen: boolean;
  onClose: () => void;
  meta?: Meta;
  atribuicao?: MetaAtribuicao & {
    usuarios?: {
      nome: string;
      email: string;
    };
  };
  form: {
    meta_quantidade_individual: number;
    responsavel: boolean;
  };
  onChange: (form: { meta_quantidade_individual: number; responsavel: boolean }) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
}

export const CrudMetasEditarAtribuicao: React.FC<CrudMetasEditarAtribuicaoProps> = ({
  isOpen,
  onClose,
  meta,
  atribuicao,
  form,
  onChange,
  onSubmit,
  saving
}) => {
  if (!meta || !atribuicao) return null;

  const nomeTma = atribuicao.usuarios?.nome || 'TMA';
  const emailTma = atribuicao.usuarios?.email || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar atribuição de ${nomeTma}`}
      subtitle="Ajuste a quantidade ou responsabilidade desta meta para o TMA selecionado."
      size="md"
      showCloseButton
      headerClassName="bg-gradient-to-r from-emerald-600 to-green-600"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
        className="p-6 space-y-6"
      >
        <div className="rounded-2xl bg-green-50 p-4">
          <h4 className="text-sm font-semibold text-green-900">{meta.descricao ?? meta.id}</h4>
          <p className="mt-1 text-sm text-green-700">{emailTma}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Quantidade meta individual
            </label>
            <input
              type="number"
              min={0}
              value={form.meta_quantidade_individual}
              onChange={(e) => onChange({
                ...form,
                meta_quantidade_individual: Number(e.target.value)
              })}
              className="w-full rounded-lg border border-green-200 px-3 py-2 focus:border-green-400 focus:ring-2 focus:ring-green-300"
              required
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-green-900">
            <input
              type="checkbox"
              checked={form.responsavel}
              onChange={(e) => onChange({ ...form, responsavel: e.target.checked })}
              className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
            />
            TMA responsável pela meta
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-green-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:border-green-300 hover:bg-green-50"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

