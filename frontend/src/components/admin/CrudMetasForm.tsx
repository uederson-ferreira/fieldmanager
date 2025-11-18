// ===================================================================
// COMPONENTE FORMULÁRIO DE METAS - ECOFIELD SYSTEM
// Localização: src/components/admin/CrudMetasForm.tsx
// Módulo: Formulário para criar/editar metas
// ===================================================================

import React from 'react';
import Modal from '../common/Modal';
import { TIPOS_META, PERIODOS_META, ESCOPOS_META } from '../../types/metas';
import type { TipoMeta, PeriodoMeta, EscopoMeta } from '../../types/metas';

interface CrudMetasFormProps {
  showForm: boolean;
  closeForm: () => void;
  handleSave: (e: React.FormEvent) => Promise<void>;
  editId: string | null;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
}

export const CrudMetasForm: React.FC<CrudMetasFormProps> = ({
  showForm,
  closeForm,
  handleSave,
  editId,
  form,
  setForm,
  saving
}) => {
  return (
    <Modal
      isOpen={showForm}
      onClose={closeForm}
      title={editId ? 'Editar Meta' : 'Nova Meta'}
      subtitle="Configure os parâmetros da meta"
      size="lg"
      showCloseButton={true}
      headerClassName="bg-gradient-to-r from-green-600 to-green-700"
    >
      <form onSubmit={handleSave} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Meta
            </label>
            <select
              value={form.tipo_meta}
              onChange={(e) => setForm((prev: any) => ({ ...prev, tipo_meta: e.target.value as TipoMeta }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {TIPOS_META.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria (opcional)
            </label>
            <input
              type="text"
              value={form.categoria}
              onChange={(e) => setForm((prev: any) => ({ ...prev, categoria: e.target.value }))}
              placeholder="Ex: 01, 02, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escopo
            </label>
            <select
              value={form.escopo}
              onChange={(e) => setForm((prev: any) => ({ ...prev, escopo: e.target.value as EscopoMeta }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {ESCOPOS_META.map(escopo => (
                <option key={escopo.value} value={escopo.value}>{escopo.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={form.periodo}
              onChange={(e) => setForm((prev: any) => ({ ...prev, periodo: e.target.value as PeriodoMeta }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {PERIODOS_META.map(periodo => (
                <option key={periodo.value} value={periodo.value}>{periodo.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano
            </label>
            <input
              type="number"
              value={form.ano}
              onChange={(e) => setForm((prev: any) => ({ ...prev, ano: parseInt(e.target.value) }))}
              min={2020}
              max={2030}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          {form.periodo !== 'anual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <input
                type="number"
                value={form.mes || ''}
                onChange={(e) => setForm((prev: any) => ({ ...prev, mes: parseInt(e.target.value) }))}
                min={1}
                max={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título da Meta
          </label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm((prev: any) => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: Meta de LVs para Janeiro"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm((prev: any) => ({ ...prev, descricao: e.target.value }))}
            placeholder="Descreva a meta em detalhes..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade Meta
            </label>
            <input
              type="number"
              value={form.quantidade_meta}
              onChange={(e) => setForm((prev: any) => ({ ...prev, quantidade_meta: parseInt(e.target.value) }))}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev: any) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={form.data_inicio}
              onChange={(e) => setForm((prev: any) => ({ ...prev, data_inicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={form.data_fim}
              onChange={(e) => setForm((prev: any) => ({ ...prev, data_fim: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={closeForm}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : (editId ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}; 