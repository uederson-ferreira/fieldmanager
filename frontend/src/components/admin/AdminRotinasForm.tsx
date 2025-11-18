import React from 'react';
import { X } from 'lucide-react';
import type { Rotina } from '../../lib/rotinasAPI';

interface AdminRotinasFormProps {
  showForm: boolean;
  form: Partial<Rotina>;
  editId: string | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  onFormChange: (form: Partial<Rotina>) => void;
  onClearError: () => void;
}

export const AdminRotinasForm: React.FC<AdminRotinasFormProps> = ({
  showForm,
  form,
  editId,
  saving,
  error,
  onClose,
  onSave,
  onFormChange,
  onClearError
}) => {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editId ? 'Editar Rotina' : 'Nova Rotina'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={onClearError}
              className="ml-2 text-xs underline hover:no-underline"
            >
              ✕
            </button>
          </div>
        )}
        
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Atividade *
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required 
              value={form.data_atividade || ''} 
              onChange={e => onFormChange({ data_atividade: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área ID *
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required 
              value={form.area_id || ''} 
              onChange={e => onFormChange({ area_id: e.target.value })} 
              placeholder="ID da área"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atividade *
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required 
              value={form.atividade || ''} 
              onChange={e => onFormChange({ atividade: e.target.value })} 
              placeholder="Nome da atividade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              value={form.descricao || ''} 
              onChange={e => onFormChange({ descricao: e.target.value })} 
              placeholder="Descrição detalhada da atividade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TMA Responsável
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={form.tma_responsavel_id || ''} 
              onChange={e => onFormChange({ tma_responsavel_id: e.target.value })} 
              placeholder="ID do TMA responsável"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encarregado
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={form.encarregado_id || ''} 
              onChange={e => onFormChange({ encarregado_id: e.target.value })} 
              placeholder="ID do encarregado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={form.status || ''} 
              onChange={e => onFormChange({ status: e.target.value })} 
            >
              <option value="">Selecione um status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
      </div>
    </div>
  );
}; 