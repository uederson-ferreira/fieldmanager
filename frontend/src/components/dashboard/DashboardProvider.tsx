// ===================================================================
// DASHBOARD PROVIDER - ECOFIELD SYSTEM
// Localização: src/components/dashboard/DashboardProvider.tsx
// ===================================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserData } from '../../types/entities';

// Tipos para as seções ativas
export type ActiveSection =
  | "dashboard"
  | "lvs"
  | "lv-residuos"
  | "lv-inspecao"
  | "rotina"
  | "historico"
  | "fotos"
  | "termo-form-v2"
  | "lista-termos"
  | "atividades-rotina-form"
  | "atividades-rotina-lista"
  | "metas"
  | "acoes-corretivas"
  | "acoes-corretivas-detalhes"
  | "lv-02"
  | "lv-03"
  | "lv-04"
  | "lv-05"
  | "lv-06"
  | "lv-07"
  | "lv-08"
  | "lv-09"
  | "lv-10"
  | "lv-11"
  | "lv-12"
  | "lv-13"
  | "lv-14"
  | "lv-15"
  | "lv-16"
  | "lv-17"
  | "lv-18"
  | "lv-19"
  | "lv-20"
  | "lv-21"
  | "lv-22"
  | "lv-23"
  | "lv-24"
  | "lv-25"
  | "lv-26"
  | "lv-27"
  | "lv-28"
  | "lv-29";

// Interface para estatísticas do dashboard
export interface DashboardStats {
  // LVs (Listas de Verificação)
  lvsPendentes: number;
  lvsCompletas: number;
  lvsNaoConformes: number;
  lvsPercentualConformidade: number;
  
  // Termos Ambientais
  total_termos: number;
  termosPendentes: number;
  termosCorrigidos: number;
  paralizacoes: number;
  notificacoes: number;
  total_recomendacoes: number;
  
  // Rotinas/Atividades
  rotinasHoje: number;
  rotinasMes: number;
  itensEmitidos: number;
  tempoMedio: number;
  
  loading: boolean;
}

// Interface do contexto
interface DashboardContextType {
  // Estado
  activeSection: ActiveSection;
  mobileMenuOpen: boolean;
  toolsDropdownOpen: boolean;
  dashboardStats: DashboardStats;
  acaoCorretivaId: string | null;

  // Ações
  setActiveSection: (section: ActiveSection) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setToolsDropdownOpen: (open: boolean) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  setAcaoCorretivaId: (id: string | null) => void;
  handleBackToDashboard: () => void;
  handleRefreshStats: () => void;
  navegarParaDetalhesAcao: (acaoId: string) => void;

  // Props do usuário
  user: UserData;
  onLogout: () => void;
  loginInfo: {
    method: "supabase" | "demo" | null;
    isSupabase: boolean;
    isDemo: boolean;
    source: string;
  };
}

// Contexto
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider do contexto
interface DashboardProviderProps {
  children: React.ReactNode;
  user: UserData;
  onLogout: () => void;
  loginInfo: {
    method: "supabase" | "demo" | null;
    isSupabase: boolean;
    isDemo: boolean;
    source: string;
  };
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  user,
  onLogout,
  loginInfo,
}) => {
  // Estados
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [acaoCorretivaId, setAcaoCorretivaId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    lvsPendentes: 0,
    lvsCompletas: 0,
    lvsNaoConformes: 0,
    lvsPercentualConformidade: 0,
    total_termos: 0,
    termosPendentes: 0,
    termosCorrigidos: 0,
    paralizacoes: 0,
    notificacoes: 0,
    total_recomendacoes: 0,
    rotinasHoje: 0,
    rotinasMes: 0,
    itensEmitidos: 0,
    tempoMedio: 0,
    loading: false,
  });

  // Handlers
  const handleBackToDashboard = useCallback(() => {
    setActiveSection("dashboard");
    setAcaoCorretivaId(null);
  }, []);

  const handleRefreshStats = useCallback(() => {
    // Esta função será implementada nos hooks especializados
    console.log('🔄 [CONTEXT] Atualizando estatísticas...');
  }, []);

  const navegarParaDetalhesAcao = useCallback((acaoId: string) => {
    setAcaoCorretivaId(acaoId);
    setActiveSection("acoes-corretivas-detalhes");
  }, []);

  const value: DashboardContextType = {
    // Estado
    activeSection,
    mobileMenuOpen,
    toolsDropdownOpen,
    dashboardStats,
    acaoCorretivaId,

    // Ações
    setActiveSection,
    setMobileMenuOpen,
    setToolsDropdownOpen,
    setDashboardStats,
    setAcaoCorretivaId,
    handleBackToDashboard,
    handleRefreshStats,
    navegarParaDetalhesAcao,

    // Props
    user,
    onLogout,
    loginInfo,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook para usar o contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard deve ser usado dentro de um DashboardProvider');
  }
  return context;
}; 