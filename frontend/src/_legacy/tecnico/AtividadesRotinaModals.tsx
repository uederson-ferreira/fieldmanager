import React from 'react';
import { Save } from 'lucide-react';
import Modal from '../common/Modal';

interface AtividadesRotinaModalsProps {
  // Estados dos modais
  showAreaModal: boolean;
  showEncarregadoModal: boolean;
  showEmpresaModal: boolean;
  showStatusModal: boolean;
  
  // Estados dos formulários
  areaForm: { nome: string; descricao: string };
  encarregadoForm: { nome: string; telefone: string; empresa: string };
  empresaForm: { nome: string; cnpj: string; telefone: string };
  statusForm: { status: string };
  
  // Ações
  onCloseModal: (modalType: 'area' | 'encarregado' | 'empresa' | 'status') => void;
  onSaveArea: () => Promise<void>;
  onSaveEncarregado: () => Promise<void>;
  onSaveEmpresa: () => Promise<void>;
  onSaveStatus: () => void;
  onAreaFormChange: (field: string, value: string) => void;
  onEncarregadoFormChange: (field: string, value: string) => void;
  onEmpresaFormChange: (field: string, value: string) => void;
  onStatusFormChange: (field: string, value: string) => void;
}

export const AtividadesRotinaModals: React.FC<AtividadesRotinaModalsProps> = ({
  showAreaModal,
  showEncarregadoModal,
  showEmpresaModal,
  showStatusModal,
  areaForm,
  encarregadoForm,
  empresaForm,
  statusForm,
  onCloseModal,
  onSaveArea,
  onSaveEncarregado,
  onSaveEmpresa,
  onSaveStatus,
  onAreaFormChange,
  onEncarregadoFormChange,
  onEmpresaFormChange,
  onStatusFormChange
}) => {
  return (
    <>
      {/* Modal de Área */}
      {showAreaModal && (
        <Modal
          isOpen={showAreaModal}
          onClose={() => onCloseModal('area')}
          title="Nova Área"
          size="md"
        >
          <form onSubmit={(e) => { e.preventDefault(); onSaveArea(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Área *
              </label>
              <input
                type="text"
                required
                value={areaForm.nome}
                onChange={(e) => onAreaFormChange('nome', e.target.value)}
                placeholder="Nome da área"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                value={areaForm.descricao}
                onChange={(e) => onAreaFormChange('descricao', e.target.value)}
                placeholder="Descrição da área"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onCloseModal('area')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Encarregado */}
      {showEncarregadoModal && (
        <Modal
          isOpen={showEncarregadoModal}
          onClose={() => onCloseModal('encarregado')}
          title="Novo Encarregado"
          size="md"
        >
          <form onSubmit={(e) => { e.preventDefault(); onSaveEncarregado(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                required
                value={encarregadoForm.nome}
                onChange={(e) => onEncarregadoFormChange('nome', e.target.value)}
                placeholder="Nome do encarregado"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                required
                value={encarregadoForm.telefone}
                onChange={(e) => onEncarregadoFormChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={encarregadoForm.empresa}
                onChange={(e) => onEncarregadoFormChange('empresa', e.target.value)}
                placeholder="Nome da empresa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onCloseModal('encarregado')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Empresa */}
      {showEmpresaModal && (
        <Modal
          isOpen={showEmpresaModal}
          onClose={() => onCloseModal('empresa')}
          title="Nova Empresa"
          size="md"
        >
          <form onSubmit={(e) => { e.preventDefault(); onSaveEmpresa(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa *
              </label>
              <input
                type="text"
                required
                value={empresaForm.nome}
                onChange={(e) => onEmpresaFormChange('nome', e.target.value)}
                placeholder="Nome da empresa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={empresaForm.cnpj}
                onChange={(e) => onEmpresaFormChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={empresaForm.telefone}
                onChange={(e) => onEmpresaFormChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onCloseModal('empresa')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Status */}
      {showStatusModal && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => onCloseModal('status')}
          title="Gerenciar Status"
          size="sm"
        >
          <form onSubmit={(e) => { e.preventDefault(); onSaveStatus(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={statusForm.status}
                onChange={(e) => onStatusFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione um status</option>
                <option value="Planejada">Planejada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onCloseModal('status')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}; 