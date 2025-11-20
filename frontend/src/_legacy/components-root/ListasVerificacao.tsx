// ===================================================================
// PÁGINA DEDICADA PARA LISTAS DE VERIFICAÇÃO - ECOFIELD SYSTEM
// Localização: src/components/ListasVerificacao.tsx
// ===================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  ArrowLeft,
} from "lucide-react";
import { LVContainer } from "./lv";
import type { CategoriaLV } from "../types";
import type { UserData } from "../types/entities";
import { getAuthToken } from "../utils/authUtils";

const API_URL = import.meta.env.VITE_API_URL;

interface ListasVerificacaoProps {
  user: UserData;
  onBack: () => void;
}

const ListasVerificacao: React.FC<ListasVerificacaoProps> = ({
  user,
  onBack,
}) => {
  const [categorias, setCategorias] = useState<CategoriaLV[]>([]);
  const [loading, setLoading] = useState(true);
  const [_selectedCategoria, setSelectedCategoria] = useState<CategoriaLV | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<string>("list");

  // ===================================================================
  // CARREGAMENTO DE CATEGORIAS
  // ===================================================================

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 [LVs] Carregando categorias...");

      const token = getAuthToken();
      if (!token) {
        console.error("❌ [LVs] Token de autenticação não encontrado");

        // Tentar buscar do cache offline
        try {
          const { offlineDB } = await import('../lib/offline/database/EcoFieldDB');
          const cachedCategorias = await offlineDB.categorias_lv.toArray();

          if (cachedCategorias.length > 0) {
            console.log(`📦 [LVs] ${cachedCategorias.length} categorias carregadas do cache offline`);
            setCategorias(cachedCategorias);
            return;
          }
        } catch (offlineError) {
          console.error("❌ [LVs] Erro ao buscar cache offline:", offlineError);
        }
        return;
      }

      const response = await fetch(`${API_URL}/api/categorias/lv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error("❌ [LVs] Erro na API:", response.status, response.statusText);

        // Fallback para cache offline quando API falhar (401, 500, etc)
        try {
          const { offlineDB } = await import('../lib/offline/database/EcoFieldDB');
          const cachedCategorias = await offlineDB.categorias_lv.toArray();

          if (cachedCategorias.length > 0) {
            console.log(`📦 [LVs] ${cachedCategorias.length} categorias carregadas do cache offline (fallback)`);
            setCategorias(cachedCategorias);
            return;
          }
        } catch (offlineError) {
          console.error("❌ [LVs] Erro ao buscar cache offline:", offlineError);
        }
        return;
      }

      const data = await response.json();
      console.log(`✅ [LVs] ${data?.length || 0} categorias carregadas`);
      setCategorias(data || []);

      // Salvar no cache offline para uso futuro
      try {
        const { offlineDB } = await import('../lib/offline/database/EcoFieldDB');
        for (const categoria of data) {
          await offlineDB.categorias_lv.put(categoria);
        }
        console.log(`💾 [LVs] ${data.length} categorias salvas no cache offline`);
      } catch (offlineError) {
        console.warn("⚠️ [LVs] Erro ao salvar cache offline:", offlineError);
      }
    } catch (error) {
      console.error("💥 [LVs] Erro inesperado ao carregar categorias:", error);

      // Último fallback: tentar cache offline
      try {
        const { offlineDB } = await import('../lib/offline/database/EcoFieldDB');
        const cachedCategorias = await offlineDB.categorias_lv.toArray();

        if (cachedCategorias.length > 0) {
          console.log(`📦 [LVs] ${cachedCategorias.length} categorias carregadas do cache offline (último fallback)`);
          setCategorias(cachedCategorias);
        }
      } catch (offlineError) {
        console.error("❌ [LVs] Erro ao buscar cache offline:", offlineError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleCategoriaClick = (categoria: CategoriaLV) => {
    setSelectedCategoria(categoria);
    // Unificado: todas as LVs usam o mesmo padrão (lv-{codigo})
    setActiveSection(`lv-${categoria.codigo}` as any);
  };

  const handleBackToList = () => {
    setActiveSection("list");
    setSelectedCategoria(null);
  };

  // ===================================================================
  // FILTRAGEM
  // ===================================================================

  const filteredCategorias = categorias
    .filter((categoria) =>
      categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoria.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      categoria.codigo.includes(searchTerm)
    )
    .sort((a, b) => {
      // Converter códigos para números para ordenação correta
      const codigoA = parseInt(a.codigo, 10);
      const codigoB = parseInt(b.codigo, 10);
      
      // Se ambos são números válidos, ordenar numericamente
      if (!isNaN(codigoA) && !isNaN(codigoB)) {
        return codigoA - codigoB;
      }
      
      // Se apenas um é número válido, números vêm primeiro
      if (!isNaN(codigoA) && isNaN(codigoB)) return -1;
      if (isNaN(codigoA) && !isNaN(codigoB)) return 1;
      
      // Se ambos não são números, ordenar alfabeticamente
      return a.codigo.localeCompare(b.codigo);
    });

  // ===================================================================
  // EFFECTS
  // ===================================================================

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // ===================================================================
  // RENDER CONTENT
  // ===================================================================

  const renderContent = () => {
    switch (activeSection) {
      case "lv-01":
      case "lv-02":
      case "lv-03":
      case "lv-04":
      case "lv-05":
      case "lv-06":
      case "lv-07":
      case "lv-08":
      case "lv-09":
      case "lv-10":
      case "lv-11":
      case "lv-12":
      case "lv-13":
      case "lv-14":
      case "lv-15":
      case "lv-16":
      case "lv-17":
      case "lv-18":
      case "lv-19":
      case "lv-20":
      case "lv-21":
      case "lv-22":
      case "lv-23":
      case "lv-24":
      case "lv-25":
      case "lv-26":
      case "lv-27":
      case "lv-28":
      case "lv-29":
      case "lv-30": {
        const tipo_lv = activeSection.replace('lv-', '');
        return <LVContainer user={user} tipo_lv={tipo_lv} onBack={handleBackToList} />;
      }

      case "list":
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-green-900">
                  Listas de Verificação
                </h1>
                <p className="text-green-600 mt-1">
                  Selecione uma categoria para iniciar a inspeção
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-green-600 bg-green-50 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </button>
                <button
                  onClick={loadCategorias}
                  disabled={loading}
                  className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Atualizar categorias"
                >
                  <span className={`text-white font-bold text-lg ${loading ? 'animate-spin' : ''}`}>↻</span>
                  <span className="ml-2">Atualizar</span>
                </button>
              </div>
            </div>

            {/* Barra de Pesquisa e Ações */}
            <div className="bg-white rounded-lg border border-green-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Barra de Pesquisa */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                    <input
                      type="text"
                      placeholder="Buscar listas de verificação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button className="px-4 py-2 text-green-600 bg-green-50 border border-green-300 rounded-lg hover:bg-green-700 hover:text-white transition-colors flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </button>
                  <button
                    onClick={loadCategorias}
                    disabled={loading}
                    className={`px-4 py-2 text-green-600 bg-green-50 border border-green-300 rounded-lg hover:bg-green-700 hover:text-white transition-colors flex items-center ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Download className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Baixando...' : 'Baixar LVs'}
                  </button>
                  <button className="px-4 py-2 text-green-600 bg-green-50 border border-green-300 rounded-lg hover:bg-green-700 hover:text-white transition-colors flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de Categorias LV */}
            <div className="bg-white rounded-lg shadow-sm border border-green-50 overflow-x-hidden">
              <div className="p-4 sm:p-6 border-b border-green-200">
                <h2 className="text-base sm:text-lg font-semibold text-green-700">
                  Listas de Verificação Disponíveis
                  {loading && (
                    <span className="text-sm text-green-500 ml-2">
                      Carregando...
                    </span>
                  )}
                </h2>
                <p className="text-green-500 text-sm mt-1">
                  Clique em uma categoria para iniciar a inspeção
                </p>
              </div>

              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-green-200 h-24 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredCategorias.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredCategorias.map((categoria) => (
                      <button
                        key={categoria.id}
                        onClick={() => handleCategoriaClick(categoria)}
                        className="p-3 sm:p-4 border border-green-50 rounded-lg hover:border-green-100 hover:bg-green-700 hover:shadow-md transition-all duration-200 text-left group min-h-[100px] sm:min-h-[120px] touch-spacing bg-green-50"
                      >
                        <div className="flex items-start justify-between h-full">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-green-200 text-green-700 group-hover:text-white group-hover:bg-green-600 text-xs font-medium px-2 py-1 rounded-lg transition-colors">
                                {categoria.codigo}
                              </span>
                            </div>
                            <h3 className="font-medium text-green-700 group-hover:text-white transition-colors text-sm sm:text-base break-words">
                              {categoria.nome}
                            </h3>
                            <p className="text-xs sm:text-sm text-green-500 group-hover:text-white transition-colors mt-1 line-clamp-2 break-words">
                              {categoria.descricao || 'Sem descrição'}
                            </p>
                          </div>
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 group-hover:text-white transition-colors ml-2 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-600">
                      {searchTerm ? 'Nenhuma categoria encontrada para sua busca' : 'Nenhuma categoria encontrada'}
                    </p>
                    <button
                      onClick={loadCategorias}
                      className="mt-3 px-4 py-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  // ===================================================================
  // RENDER PRINCIPAL
  // ===================================================================

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default ListasVerificacao; 