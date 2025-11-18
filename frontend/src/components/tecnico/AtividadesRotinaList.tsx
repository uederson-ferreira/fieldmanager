import React from 'react';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  MessageCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import type { AtividadeRotina, Area, Encarregado, EmpresaContratada } from '../../types';

// Type para atividades que podem vir do cache offline
type AtividadeRotinaComOffline = AtividadeRotina & {
  offline?: boolean;
  sincronizado?: boolean;
};

interface AtividadesRotinaListProps {
  atividades: AtividadeRotinaComOffline[];
  areas: Area[];
  encarregados: Encarregado[];
  empresas: EmpresaContratada[];
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
  isOnline: boolean;
  rotinasOfflineCount: number;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (filter: string) => void;
  onNewActivity: () => void;
  onEdit: (atividade: AtividadeRotina) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onShare: (atividade: AtividadeRotina) => Promise<void>;
  onDownload: () => Promise<void>;
  onBack: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Concluída':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'Em Andamento':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'Planejada':
      return <Calendar className="h-4 w-4 text-blue-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluída':
      return 'bg-green-100 text-green-800';
    case 'Em Andamento':
      return 'bg-yellow-100 text-yellow-800';
    case 'Planejada':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getAreaName = (areaId: string, areas: Area[]) => {
  const area = areas.find(a => a.id === areaId);
  return area?.nome || areaId;
};

const getEncarregadoName = (encarregadoId: string, encarregados: Encarregado[]) => {
  const encarregado = encarregados.find(e => e.id === encarregadoId);
  return encarregado?.nome_completo || encarregadoId;
};

const getEmpresaName = (empresaId: string, empresas: EmpresaContratada[]) => {
  const empresa = empresas.find(e => e.id === empresaId);
  return empresa?.nome || empresaId;
};

export const AtividadesRotinaList: React.FC<AtividadesRotinaListProps> = ({
  atividades,
  areas,
  encarregados,
  empresas,
  loading,
  searchTerm,
  statusFilter,
  isOnline: _isOnline,
  rotinasOfflineCount: _rotinasOfflineCount,
  onSearchChange: _onSearchChange,
  onStatusFilterChange: _onStatusFilterChange,
  onNewActivity: _onNewActivity,
  onEdit,
  onDelete,
  onShare,
  onDownload: _onDownload,
  onBack: _onBack
}) => {
  // Garantir que atividades seja sempre um array
  const atividadesArray = Array.isArray(atividades) ? atividades : [];
  
  // Filtrar atividades
  const filteredAtividades = atividadesArray.filter(atividade => {
    const matchesSearch = atividade.atividade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atividade.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getAreaName(atividade.area_id || '', areas).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || atividade.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando atividades...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Estado vazio */}
      {filteredAtividades.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Nenhuma atividade encontrada com os filtros aplicados'
              : 'Nenhuma atividade registrada'
            }
          </p>
        </div>
      ) : (
        /* Lista de Atividades */
        <div className="space-y-3 overflow-x-hidden">
          {filteredAtividades.map((atividade) => (
            <div
              key={atividade.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header da Atividade */}
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(atividade.status)}
                    <h3 className="font-semibold text-gray-900">{atividade.atividade}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(atividade.status)}`}>
                      {atividade.status}
                    </span>
                    
                    {/* Indicador de origem (online/offline) */}
                    {(atividade.offline === true || atividade.sincronizado === false) ? (
                      <div className="flex items-center">
                        <WifiOff className="h-4 w-4 text-yellow-600 mr-1" />
                        <span className="text-yellow-700 font-medium text-xs">Offline</span>
                        <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          Aguardando sincronização
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Wifi className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-700 font-medium text-xs">Sincronizado</span>
                      </div>
                    )}
                  </div>

                  {/* Informações da Atividade */}
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(atividade.data_atividade).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {atividade.hora_inicio && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{atividade.hora_inicio} - {atividade.hora_fim || 'Em andamento'}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{getAreaName(atividade.area_id || '', areas)}</span>
                    </div>
                    
                    {atividade.encarregado_id && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{getEncarregadoName(atividade.encarregado_id, encarregados)}</span>
                      </div>
                    )}
                  </div>

                  {/* Descrição */}
                  {atividade.descricao && (
                    <p className="text-sm text-gray-600 mt-2">{atividade.descricao}</p>
                  )}

                  {/* Informações Adicionais */}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    {atividade.km_percorrido && (
                      <span>KM: {atividade.km_percorrido}</span>
                    )}
                    {atividade.empresa_contratada_id && (
                      <span>Empresa: {getEmpresaName(atividade.empresa_contratada_id, empresas)}</span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:ml-4 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-2">
                  <button
                    onClick={() => onShare(atividade)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Compartilhar via WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => onEdit(atividade)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => onDelete(atividade.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 