// ===================================================================
// DASHBOARD ADMINISTRATIVO - FIELDMANAGER v2.0 (MULTI-DOMÍNIO)
// Localização: src/components/AdminDashboard.tsx
// ===================================================================

import React, { useState } from 'react';
import {
  Menu, X, LogOut, User, CheckCircle2, AlertTriangle,
  TrendingUp, Clock, Settings
} from 'lucide-react';
import CrudUsuarios from './admin/CrudUsuarios';
import AdminTermos from './admin/AdminTermos';
import AdminLVs from './admin/AdminLVs';
import DashboardGerencial from './admin/DashboardGerencial';
import CrudAreas from './admin/CrudAreas';
import CrudCategorias from './admin/CrudCategorias';
import CrudPerfis from './admin/CrudPerfis';
import CrudConfiguracoes from './admin/CrudConfiguracoes';
import CrudBackup from './admin/Backup';
import AdminRotinas from './admin/AdminRotinas';
import CrudMetas from './admin/CrudMetas';
import DetalhamentoPorUsuario from './admin/DetalhamentoPorUsuario';
import DominioSelector from './common/DominioSelector';
import { NavigationSection } from './common/DynamicNavigation';
import { useMenuAdmin, useMenuItem } from '../hooks/useMenuDinamico';
import { useDominio } from '../contexts/DominioContext';
import type { UserData } from '../types/entities';

interface AdminDashboardProps {
  user: UserData;
  onLogout: () => void;
  loginInfo: {
    method: 'supabase' | 'demo' | null;
    isSupabase: boolean;
    isDemo: boolean;
    source: string;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, loginInfo }) => {
  // Hooks do sistema multi-domínio
  const menuSections = useMenuAdmin();
  const { dominioAtual } = useDominio();

  // State local
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Buscar item de menu atual
  const currentMenuItem = useMenuItem(menuSections, activeSection);

  // Buscar atividades recentes
  React.useEffect(() => {
    const fetchAtividades = async () => {
      try {
        // Pegar token do localStorage (autenticação via backend)
        const token = localStorage.getItem('ecofield_auth_token');

        if (!token) {
          console.error('❌ Token não encontrado');
          setStatsLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/estatisticas/atividades-recentes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAtividadesRecentes(data);
        }
      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (activeSection === 'dashboard') {
      fetchAtividades();
    }
  }, [activeSection]);

  // ===================================================================
  // RENDERIZAÇÃO DE MÓDULOS DINÂMICOS
  // ===================================================================

  const renderModuloContent = (moduleId: string) => {
    // TODO: Implementar componente genérico para execução de módulos
    // Por enquanto, retorna placeholder
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-emerald-400 mb-4">
          <Settings className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {currentMenuItem?.label || 'Módulo'}
        </h3>
        <p className="text-gray-600 mb-2">
          Domínio: <span className="font-medium" style={{ color: dominioAtual?.cor_primaria }}>
            {dominioAtual?.nome}
          </span>
        </p>
        <p className="text-gray-600 mb-4">
          Módulo ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{moduleId}</code>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          O formulário dinâmico para execução deste módulo será implementado na próxima etapa.
        </p>
        <button
          onClick={() => setActiveSection('dashboard')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  };

  // ===================================================================
  // RENDERIZAR CONTEÚDO
  // ===================================================================

  const renderContent = () => {
    // Verificar se é um módulo dinâmico (ID começa com "modulo_")
    if (activeSection.startsWith('modulo_')) {
      const moduleId = activeSection.replace('modulo_', '');
      return renderModuloContent(moduleId);
    }

    // Rotas estáticas
    switch (activeSection) {
      case 'usuarios':
        return <CrudUsuarios />;

      case 'areas':
        return <CrudAreas />;

      case 'perfis':
        return <CrudPerfis />;

      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Seletor de Domínio */}
            <DominioSelector />

            {/* Header do Dashboard */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
                <p className="text-gray-600 mt-1">
                  Bem-vindo, {user.nome} - {loginInfo.source}
                </p>
                {dominioAtual && (
                  <p className="text-sm mt-1" style={{ color: dominioAtual.cor_primaria }}>
                    {dominioAtual.icone} {dominioAtual.nome}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>v{import.meta.env.VITE_APP_VERSION || '2.0.0'}</span>
                {import.meta.env.DEV && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    DEV
                  </span>
                )}
              </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2 este mês</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inspeções Hoje</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-500">3 em andamento</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Não Conformidades</p>
                    <p className="text-2xl font-bold text-gray-900">4</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <FileCheck className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-500">2 resolvidas</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conformidade</p>
                    <p className="text-2xl font-bold text-gray-900">94%</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2% este mês</span>
                </div>
              </div>
            </div>

            {/* Lista de Atividades Recentes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
              </div>
              <div className="p-6">
                {statsLoading ? (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Carregando atividades...</p>
                  </div>
                ) : atividadesRecentes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Nenhuma atividade recente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {atividadesRecentes.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`h-2 w-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'progress' ? 'bg-blue-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'relatorios':
        return <DashboardGerencial onNavigateToDetalhamento={() => setActiveSection('detalhamento')} />;

      case 'configuracoes':
        return <CrudConfiguracoes />;

      case 'backup':
        return <CrudBackup />;

      case 'categorias':
        return <CrudCategorias />;

      case 'rotinas':
        return <AdminRotinas />;

      case 'metas':
        return <CrudMetas user={user} />;

      case 'termos':
        return <AdminTermos />;

      case 'lvs':
        return <AdminLVs />;

      case 'detalhamento':
        return <DetalhamentoPorUsuario onBack={() => setActiveSection('relatorios')} />;

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Settings className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentMenuItem?.label || 'Seção Desconhecida'}
            </h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidade está em desenvolvimento.
            </p>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        );
    }
  };

  // ===================================================================
  // RENDER PRINCIPAL
  // ===================================================================

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden w-full">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">FieldManager</h2>
          {dominioAtual && (
            <span className="text-xs px-2 py-1 rounded-full" style={{
              backgroundColor: `${dominioAtual.cor_primaria}20`,
              color: dominioAtual.cor_primaria
            }}>
              {dominioAtual.nome}
            </span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar - Mobile Overlay / Desktop Fixed */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed md:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarOpen ? 'w-64' : 'md:w-16'}
        bg-white shadow-lg flex flex-col
        md:h-screen
      `}>
        {/* Header da Sidebar - Desktop Only */}
        <div className="hidden md:flex p-4 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            {sidebarOpen && (
              <h2 className="text-lg font-semibold text-gray-900">
                FieldManager
                <span className="block text-xs text-gray-500 font-normal">Admin</span>
              </h2>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu Items - Dinâmico por Domínio */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {sidebarOpen ? (
            // Modo expandido: mostrar seções completas
            menuSections.map((section, sectionIndex) => (
              <NavigationSection
                key={sectionIndex}
                section={section}
                activeItemId={activeSection}
                onItemClick={(itemId) => {
                  setActiveSection(itemId);
                  // Fechar sidebar no mobile após clicar
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
              />
            ))
          ) : (
            // Modo compacto: mostrar apenas ícones
            <div className="space-y-1">
              {menuSections.flatMap(section => section.items).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center justify-center px-3 py-2 rounded-lg transition-colors
                    ${activeSection === item.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* User Info e Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{
              backgroundColor: dominioAtual?.cor_primaria || '#10b981'
            }}>
              <User className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user.perfil}</p>
              </div>
            )}
            <button
              onClick={() => {
                console.log("🔘 [ADMIN DASHBOARD] Botão de logout clicado");
                try {
                  onLogout();
                  console.log("✅ [ADMIN DASHBOARD] Logout executado com sucesso");
                } catch (error) {
                  console.error("❌ [ADMIN DASHBOARD] Erro no logout:", error);
                }
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
