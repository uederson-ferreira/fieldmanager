import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Trash2, Calendar, FileImage, RefreshCw, ChevronLeft } from 'lucide-react';
import { fotosAPI, type Foto, type FotosStats } from '../lib/fotosAPI';

import { UserData } from '../types/entities';
import Modal from './common/Modal';

interface FotosProps {
  onBack: () => void;
  user: UserData;
}

const Fotos: React.FC<FotosProps> = ({ onBack }) => {

  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FotosStats>({
    total: 0,
    porCategoria: {},
    porMes: {},
    tamanhoTotal: 0
  });
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [selectedMes, setSelectedMes] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Estados para modal de visualização
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Carregar todas as fotos
  const carregarFotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fotosAPI.list();
      
      if (result.success && result.data) {
        setFotos(result.data);
        calcularStats(result.data);
      } else {
        setError(result.error || 'Erro ao carregar fotos');
      }
    } catch (error) {
      setError('Erro inesperado ao carregar fotos');
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular estatísticas
  const calcularStats = useCallback((fotosData: Foto[]) => {
    const porCategoria: { [key: string]: number } = {};
    const porMes: { [key: string]: number } = {};
    let tamanhoTotal = 0;

    fotosData.forEach(foto => {
      // Por categoria
      const categoria = foto.categoria || 'geral';
      porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;

      // Por mês
      const data = new Date(foto.created_at);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      porMes[mesAno] = (porMes[mesAno] || 0) + 1;

      // Tamanho total (estimativa)
      tamanhoTotal += 1024 * 1024; // 1MB por foto (estimativa)
    });

    setStats({
      total: fotosData.length,
      porCategoria,
      porMes,
      tamanhoTotal
    });
  }, []);

  // Filtrar fotos
  const fotosFiltradas = fotos.filter(foto => {
    const matchSearch = !searchTerm || 
      foto.nome_arquivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (foto.descricao && foto.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategoria = selectedCategoria === 'todas' || foto.categoria === selectedCategoria;
    
    const matchMes = selectedMes === 'todos' || 
      new Date(foto.created_at).toISOString().slice(0, 7) === selectedMes;
    
    return matchSearch && matchCategoria && matchMes;
  });

  // Abrir modal de visualização
  const abrirModal = (foto: Foto) => {
    setSelectedFoto(foto);
    setShowModal(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setShowModal(false);
    setSelectedFoto(null);
  };

  // Download de foto
  const downloadFoto = async (foto: Foto) => {
    try {
      const result = await fotosAPI.download(foto.id);
      
      if (result.success && result.data) {
        const url = URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = foto.nome_arquivo;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || 'Erro ao baixar a foto');
      }
    } catch (error) {
      setError('Erro inesperado ao baixar a foto');
      console.error('Erro ao baixar foto:', error);
    }
  };

  // Deletar foto
  const deletarFoto = async (foto: Foto) => {
    if (!confirm('Tem certeza que deseja deletar esta foto?')) return;

    try {
      const result = await fotosAPI.delete(foto.id, foto.tipo || 'lv');
      
      if (result.success) {
        carregarFotos(); // Recarregar fotos
      } else {
        setError(result.error || 'Erro ao deletar a foto');
      }
    } catch (error) {
      setError('Erro inesperado ao deletar a foto');
      console.error('Erro ao deletar foto:', error);
    }
  };

  // Carregar fotos ao montar componente
  useEffect(() => {
    carregarFotos();
  }, [carregarFotos]);

  // Formatar data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatar tamanho
  const formatarTamanho = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Voltar</span>
              </button>
              <div className="flex items-center space-x-3">
                <FileImage className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Galeria de Fotos</h1>
                  <p className="text-sm text-gray-600">Gerencie todas as fotos do sistema</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={carregarFotos}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4">
          {error}
        </div>
      )}

      {/* Estatísticas */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Fotos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Object.keys(stats.porCategoria).length}</div>
              <div className="text-sm text-gray-600">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.porMes).length}</div>
              <div className="text-sm text-gray-600">Meses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatarTamanho(stats.tamanhoTotal)}</div>
              <div className="text-sm text-gray-600">Tamanho Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Busca */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar fotos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por categoria */}
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todas">Todas as categorias</option>
              {Object.keys(stats.porCategoria).map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria} ({stats.porCategoria[categoria]})
                </option>
              ))}
            </select>

            {/* Filtro por mês */}
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todos">Todos os meses</option>
              {Object.keys(stats.porMes).map(mes => (
                <option key={mes} value={mes}>
                  {new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} ({stats.porMes[mes]})
                </option>
              ))}
            </select>

            {/* Modo de visualização */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Fotos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fotosFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma foto encontrada</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicionar novas fotos.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {fotosFiltradas.map((foto) => (
              <div key={foto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Imagem */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={foto.url_arquivo}
                    alt={foto.nome_arquivo}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => abrirModal(foto)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE2MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4OC4zNjYgNjAgOTUgNTMuMzY2IDk1IDQ1Qzk1IDM2LjYzNCA4OC4zNjYgMzAgODAgMzBDNzEuNjM0IDMwIDY1IDM2LjYzNCA2NSA0NUM2NSA1My4zNjYgNzEuNjM0IDYwIDgwIDYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => downloadFoto(foto)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deletarFoto(foto)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Informações */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">{foto.nome_arquivo}</h3>
                  {foto.descricao && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{foto.descricao}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatarData(foto.created_at)}</span>
                    </div>
                    {foto.categoria && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {foto.categoria}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
      {showModal && selectedFoto && (
        <Modal isOpen={showModal} onClose={fecharModal} title="Visualizar Foto">
          <div className="space-y-4">
            <img
              src={selectedFoto.url_arquivo}
              alt={selectedFoto.nome_arquivo}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDE2MCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4OC4zNjYgNjAgOTUgNTMuMzY2IDk1IDQ1Qzk1IDM2LjYzNCA4OC4zNjYgMzAgODAgMzBDNzEuNjM0IDMwIDY1IDM2LjYzNCA2NSA0NUM2NSA1My4zNjYgNzEuNjM0IDYwIDgwIDYwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
              }}
            />
            <div className="space-y-2">
              <div>
                <strong>Nome:</strong> {selectedFoto.nome_arquivo}
              </div>
              {selectedFoto.descricao && (
                <div>
                  <strong>Descrição:</strong> {selectedFoto.descricao}
                </div>
              )}
              {selectedFoto.categoria && (
                <div>
                  <strong>Categoria:</strong> {selectedFoto.categoria}
                </div>
              )}
              <div>
                <strong>Data:</strong> {formatarData(selectedFoto.created_at)}
              </div>
              {(selectedFoto.latitude || selectedFoto.longitude) && (
                <div>
                  <strong>Localização:</strong> {selectedFoto.latitude}, {selectedFoto.longitude}
                </div>
              )}
            </div>
            <div className="flex space-x-2 pt-4">
              <button
                onClick={() => downloadFoto(selectedFoto)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => deletarFoto(selectedFoto)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Fotos; 