import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  UserPlus, 
  Building, 
  Settings,
  MapPin,
  Clock,
  Calendar,
  User,
  FileText,
  Navigation
} from 'lucide-react';
import type { Area, Encarregado, EmpresaContratada } from '../../types';

interface AtividadesRotinaFormProps {
  formData: {
    data_atividade: string;
    hora_inicio: string;
    hora_fim: string;
    area_id: string;
    atividade: string;
    descricao: string;
    km_percorrido: string;
    tma_responsavel_id: string;
    encarregado_id: string;
    empresa_contratada_id: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    foto: File | string | null;
  };
  areas: Area[];
  encarregados: Encarregado[];
  empresas: EmpresaContratada[];
  editingId: string | null;
  saving: boolean;
  onInputChange: (field: string, value: string | File | null) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onOpenModal: (modalType: 'area' | 'encarregado' | 'empresa' | 'status') => void;
}

const getStatusOptions = () => [
  { value: 'Planejada', label: 'Planejada' },
  { value: 'Em Andamento', label: 'Em Andamento' },
  { value: 'Concluída', label: 'Concluída' },
  { value: 'Cancelada', label: 'Cancelada' }
];

export const AtividadesRotinaForm: React.FC<AtividadesRotinaFormProps> = ({
  formData,
  areas,
  encarregados,
  empresas,
  editingId,
  saving,
  onInputChange,
  onSave,
  onCancel,
  onOpenModal
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="w-full overflow-x-hidden space-y-2 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="p-2 text-green-600 hover:text-green-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-green-900">
            {editingId ? 'Editar Atividade' : 'Nova Atividade'}
          </h1>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-6">
        
        {/* Foto da Atividade - MOVIDA PARA O TOPO */}
        <div className="w-full">
          <label className="block text-sm font-medium text-green-700 mb-2">
            <Camera className="inline h-4 w-4 mr-1" />
            Foto da Atividade
          </label>
          
          {/* Área de upload - SÓ MOSTRA QUANDO NÃO HÁ FOTO */}
          {!formData.foto && (
            <div className="w-full border-2 border-dashed border-green-300 rounded-lg p-4 sm:p-6 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onInputChange('foto', e.target.files?.[0] || null)}
                className="hidden"
                id="foto-upload"
              />
              <label htmlFor="foto-upload" className="cursor-pointer block w-full">
                <Camera className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-green-400 mb-2" />
                <p className="text-sm text-green-600 font-medium">
                  Clique para selecionar uma foto
                </p>
                <p className="text-xs text-green-500 mt-1">
                  PNG, JPG ou JPEG até 10MB
                </p>
              </label>
            </div>
          )}
          
          {/* PRÉVIA REAL DA FOTO - MOSTRA A IMAGEM EFETIVA */}
          {formData.foto && (
            <div className="w-full mt-4 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                <p className="text-sm font-medium text-green-800">
                  📸 Foto selecionada:
                </p>
                <button
                  type="button"
                  onClick={() => onInputChange('foto', null)}
                  className="w-full sm:w-auto px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 text-sm transition-colors min-h-[44px]"
                >
                  ✕ Remover foto
                </button>
              </div>
              
              {typeof formData.foto === 'string' ? (
                // Foto existente (string/URL)
                <div className="w-full text-center">
                  <img 
                    src={formData.foto} 
                    alt="Foto da atividade"
                    className="w-full max-w-sm h-auto max-h-48 sm:max-h-64 rounded-lg shadow-sm mx-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-sm text-green-600 mt-2">
                    Foto existente carregada
                  </div>
                </div>
              ) : (
                // Nova foto selecionada (File)
                <div className="w-full text-center">
                  <img 
                    src={URL.createObjectURL(formData.foto)} 
                    alt="Foto da atividade"
                    className="w-full max-w-sm h-auto max-h-48 sm:max-h-64 rounded-lg shadow-sm mx-auto object-cover"
                  />
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-green-800 break-words">
                      {formData.foto.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(formData.foto.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Data da Atividade */}
          <div className="w-full">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Data da Atividade *
            </label>
            <input
              type="date"
              required
              value={formData.data_atividade}
              onChange={(e) => onInputChange('data_atividade', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Horário de Início */}
          <div className="w-full">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Horário de Início
            </label>
            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => onInputChange('hora_inicio', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Horário de Fim */}
          <div className="w-full">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Horário de Fim
            </label>
            <input
              type="time"
              value={formData.hora_fim}
              onChange={(e) => onInputChange('hora_fim', e.target.value)}
              className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Área */}
          <div className="w-full sm:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Área *
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                required
                value={formData.area_id}
                onChange={(e) => onInputChange('area_id', e.target.value)}
                className="flex-1 w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px] bg-white"
              >
                <option value="">Selecione uma área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onOpenModal('area')}
                className="w-full sm:w-auto px-3 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px] flex items-center justify-center"
                title="Adicionar nova área"
              >
                <UserPlus className="h-4 w-4 sm:mr-0 mr-2" />
                <span className="sm:hidden">Adicionar Área</span>
              </button>
            </div>
          </div>

          {/* Atividade */}
          <div className="w-full sm:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Atividade *
            </label>
            <input
              type="text"
              required
              value={formData.atividade}
              onChange={(e) => onInputChange('atividade', e.target.value)}
              placeholder="Nome da atividade"
              className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Encarregado */}
          <div className="w-full sm:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Encarregado
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={formData.encarregado_id}
                onChange={(e) => onInputChange('encarregado_id', e.target.value)}
                className="flex-1 w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px] bg-white"
              >
                <option value="">Selecione um encarregado</option>
                {encarregados.map((encarregado) => (
                  <option key={encarregado.id} value={encarregado.id}>
                    {encarregado.nome_completo}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onOpenModal('encarregado')}
                className="w-full sm:w-auto px-3 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px] flex items-center justify-center"
                title="Adicionar novo encarregado"
              >
                <UserPlus className="h-4 w-4 sm:mr-0 mr-2" />
                <span className="sm:hidden">Adicionar Encarregado</span>
              </button>
            </div>
          </div>

          {/* Empresa Contratada */}
          <div className="w-full sm:col-span-2">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <Building className="inline h-4 w-4 mr-1" />
              Empresa Contratada
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={formData.empresa_contratada_id}
                onChange={(e) => onInputChange('empresa_contratada_id', e.target.value)}
                className="flex-1 w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px] bg-white"
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onOpenModal('empresa')}
                className="w-full sm:w-auto px-3 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px] flex items-center justify-center"
                title="Adicionar nova empresa"
              >
                <UserPlus className="h-4 w-4 sm:mr-0 mr-2" />
                <span className="sm:hidden">Adicionar Empresa</span>
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="w-full">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <Settings className="inline h-4 w-4 mr-1" />
              Status
            </label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={formData.status}
                onChange={(e) => onInputChange('status', e.target.value)}
                className="flex-1 w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px] bg-white"
              >
                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onOpenModal('status')}
                className="w-full sm:w-auto px-3 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px] flex items-center justify-center"
                title="Gerenciar status"
              >
                <Settings className="h-4 w-4 sm:mr-0 mr-2" />
                <span className="sm:hidden">Gerenciar Status</span>
              </button>
            </div>
          </div>

          {/* KM Percorrido */}
          <div className="w-full">
            <label className="block text-sm font-medium text-green-700 mb-2">
              <Navigation className="inline h-4 w-4 mr-1" />
              KM Percorrido
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.km_percorrido}
              onChange={(e) => onInputChange('km_percorrido', e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
            />
          </div>
        </div>

        {/* Descrição */}
        <div className="w-full">
          <label className="block text-sm font-medium text-green-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Descrição
          </label>
          <textarea
            rows={4}
            value={formData.descricao}
            onChange={(e) => onInputChange('descricao', e.target.value)}
            placeholder="Descrição detalhada da atividade..."
            className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm resize-none"
          />
        </div>

        {/* Coordenadas (se disponível) */}
        {(formData.latitude || formData.longitude) && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-green-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => onInputChange('latitude', e.target.value ? e.target.value : null)}
                className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-green-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => onInputChange('longitude', e.target.value ? e.target.value : null)}
                className="w-full px-3 py-3 sm:py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}; 