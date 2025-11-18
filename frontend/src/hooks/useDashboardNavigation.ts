// ===================================================================
// HOOK ESPECIALIZADO - NAVEGAÇÃO DO DASHBOARD
// Localização: src/hooks/useDashboardNavigation.ts
// Módulo: Gerenciamento de navegação e estados do dashboard
// ===================================================================

import { useState, useCallback, useEffect } from 'react';

// ===================================================================
// INTERFACES
// ===================================================================

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

export interface NavigationState {
  activeSection: ActiveSection;
  mobileMenuOpen: boolean;
  toolsDropdownOpen: boolean;
  breadcrumbs: ActiveSection[];
}

export interface NavigationActions {
  navigateTo: (section: ActiveSection) => void;
  goBack: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setToolsDropdownOpen: (open: boolean) => void;
  resetNavigation: () => void;
}

// ===================================================================
// CONFIGURAÇÕES DE NAVEGAÇÃO
// ===================================================================

export const NAVIGATION_CONFIG = {
  sections: {
    dashboard: { label: 'Dashboard', icon: 'Home', color: 'blue', mobile: true },
    lvs: { label: 'LVs', icon: 'ClipboardList', color: 'green', mobile: true },
    'lv-residuos': { label: 'LV Resíduos', icon: 'Trash2', color: 'red', mobile: false },
    'lv-inspecao': { label: 'LV Inspeção', icon: 'Search', color: 'orange', mobile: false },
    'lv-02': { label: 'LV 02', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-03': { label: 'LV 03', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-04': { label: 'LV 04', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-05': { label: 'LV 05', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-06': { label: 'LV 06', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-07': { label: 'LV 07', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-08': { label: 'LV 08', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-09': { label: 'LV 09', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-10': { label: 'LV 10', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-11': { label: 'LV 11', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-12': { label: 'LV 12', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-13': { label: 'LV 13', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-14': { label: 'LV 14', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-15': { label: 'LV 15', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-16': { label: 'LV 16', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-17': { label: 'LV 17', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-18': { label: 'LV 18', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-19': { label: 'LV 19', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-20': { label: 'LV 20', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-21': { label: 'LV 21', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-22': { label: 'LV 22', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-23': { label: 'LV 23', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-24': { label: 'LV 24', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-25': { label: 'LV 25', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-26': { label: 'LV 26', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-27': { label: 'LV 27', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-28': { label: 'LV 28', icon: 'ClipboardList', color: 'green', mobile: false },
    'lv-29': { label: 'LV 29', icon: 'ClipboardList', color: 'green', mobile: false },
    metas: { label: 'Metas', icon: 'Target', color: 'purple', mobile: true },
    termos: { label: 'Termos', icon: 'FileText', color: 'yellow', mobile: true },
    'termo-form-v2': { label: 'Novo Termo', icon: 'FileText', color: 'yellow', mobile: false },
    'lista-termos': { label: 'Lista Termos', icon: 'FileText', color: 'yellow', mobile: false },
    fotos: { label: 'Fotos', icon: 'Camera', color: 'pink', mobile: true },
    historico: { label: 'Histórico', icon: 'Clock', color: 'gray', mobile: false },
    rotinas: { label: 'Rotinas', icon: 'Calendar', color: 'indigo', mobile: false },
    rotina: { label: 'Rotina', icon: 'Calendar', color: 'indigo', mobile: false },
    'atividades-rotina-form': { label: 'Nova Atividade', icon: 'Calendar', color: 'indigo', mobile: false },
    'atividades-rotina-lista': { label: 'Lista Atividades', icon: 'Calendar', color: 'indigo', mobile: false }
  },
  
  // Seções que são LVs genéricas
  lvSections: [
    'lv-02', 'lv-03', 'lv-04', 'lv-05', 'lv-06', 'lv-07', 'lv-08', 'lv-09',
    'lv-10', 'lv-11', 'lv-12', 'lv-13', 'lv-14', 'lv-15', 'lv-16', 'lv-17',
    'lv-18', 'lv-19', 'lv-20', 'lv-21', 'lv-22', 'lv-23', 'lv-24', 'lv-25',
    'lv-26', 'lv-27', 'lv-28', 'lv-29'
  ],
  
  // Seções que são formulários
  formSections: [
    'termo-form-v2',
    'atividades-rotina-form'
  ],
  
  // Seções que são listas
  listSections: [
    'atividades-rotina-lista'
  ]
};

// ===================================================================
// HOOK PRINCIPAL
// ===================================================================

export const useDashboardNavigation = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<ActiveSection[]>(["dashboard"]);

  // ===================================================================
  // FUNÇÕES DE NAVEGAÇÃO
  // ===================================================================

  const navigateTo = useCallback((section: ActiveSection) => {
    console.log(`🧭 [DASHBOARD NAVIGATION] Navegando para: ${section}`);
    
    setActiveSection(section);
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    
    // Atualizar breadcrumbs
    if (section !== "dashboard") {
      setBreadcrumbs(prev => {
        const newBreadcrumbs = [...prev];
        
        // Se já existe na lista, remover tudo depois
        const existingIndex = newBreadcrumbs.indexOf(section);
        if (existingIndex !== -1) {
          return newBreadcrumbs.slice(0, existingIndex + 1);
        }
        
        // Adicionar nova seção
        newBreadcrumbs.push(section);
        
        // Manter máximo de 5 breadcrumbs
        if (newBreadcrumbs.length > 5) {
          return newBreadcrumbs.slice(-5);
        }
        
        return newBreadcrumbs;
      });
    } else {
      // Reset breadcrumbs ao voltar ao dashboard
      setBreadcrumbs(["dashboard"]);
    }
  }, []);

  const goBack = useCallback(() => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const previousSection = newBreadcrumbs[newBreadcrumbs.length - 1];
      
      console.log(`⬅️ [DASHBOARD NAVIGATION] Voltando para: ${previousSection}`);
      
      setActiveSection(previousSection);
      setBreadcrumbs(newBreadcrumbs);
      setMobileMenuOpen(false);
      setToolsDropdownOpen(false);
    } else {
      // Se não há breadcrumbs, voltar ao dashboard
      navigateTo("dashboard");
    }
  }, [breadcrumbs, navigateTo]);

  const resetNavigation = useCallback(() => {
    console.log(`🔄 [DASHBOARD NAVIGATION] Resetando navegação`);
    
    setActiveSection("dashboard");
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    setBreadcrumbs(["dashboard"]);
  }, []);

  // ===================================================================
  // FUNÇÕES AUXILIARES
  // ===================================================================

  const isDashboard = useCallback(() => {
    return activeSection === "dashboard";
  }, [activeSection]);

  const isLVSection = useCallback(() => {
    return activeSection === "lvs" || 
           activeSection === "lv-residuos" || 
           activeSection === "lv-inspecao" ||
           NAVIGATION_CONFIG.lvSections.includes(activeSection);
  }, [activeSection]);

  const isRotinaSection = useCallback(() => {
    return activeSection === "rotina" || 
           activeSection === "atividades-rotina-form" || 
           activeSection === "atividades-rotina-lista";
  }, [activeSection]);

  const isTermosSection = useCallback(() => {
    return activeSection === "lista-termos" || 
           activeSection === "termo-form-v2";
  }, [activeSection]);

  const isMetasSection = useCallback(() => {
    return activeSection === "metas";
  }, [activeSection]);

  const isToolsSection = useCallback(() => {
    return activeSection === "historico" || activeSection === "fotos";
  }, [activeSection]);

  const getSectionConfig = (section: ActiveSection) => {
    return NAVIGATION_CONFIG.sections[section] || {
      label: 'Seção',
      icon: 'FileText',
      color: 'gray',
      mobile: false
    };
  };

  const getCurrentSectionConfig = useCallback(() => {
    return getSectionConfig(activeSection);
  }, [activeSection, getSectionConfig]);

  const getBreadcrumbLabels = useCallback(() => {
    return breadcrumbs.map(section => getSectionConfig(section).label);
  }, [breadcrumbs, getSectionConfig]);

  // ===================================================================
  // FUNÇÕES DE MOBILE
  // ===================================================================

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    setToolsDropdownOpen(false);
  }, []);

  const toggleToolsDropdown = useCallback(() => {
    setToolsDropdownOpen(prev => !prev);
    setMobileMenuOpen(false);
  }, []);

  const closeAllMenus = useCallback(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  }, []);

  // ===================================================================
  // EFFECTS
  // ===================================================================

  useEffect(() => {
    // Fechar menus ao mudar de seção
    if (mobileMenuOpen || toolsDropdownOpen) {
      closeAllMenus();
    }
  }, [activeSection, mobileMenuOpen, toolsDropdownOpen, closeAllMenus]);

  // ===================================================================
  // RETORNO DO HOOK
  // ===================================================================

  return {
    // Estados
    activeSection,
    mobileMenuOpen,
    toolsDropdownOpen,
    breadcrumbs,
    
    // Ações
    navigateTo,
    goBack,
    setMobileMenuOpen,
    setToolsDropdownOpen,
    resetNavigation,
    toggleMobileMenu,
    toggleToolsDropdown,
    closeAllMenus,
    
    // Verificações
    isDashboard,
    isLVSection,
    isRotinaSection,
    isTermosSection,
    isMetasSection,
    isToolsSection,
    
    // Configurações
    getSectionConfig,
    getCurrentSectionConfig,
    getBreadcrumbLabels,
    
    // Configuração global
    config: NAVIGATION_CONFIG
  };
};

// ===================================================================
// HOOKS AUXILIARES
// ===================================================================

export const useNavigationHistory = () => {
  const [history, setHistory] = useState<ActiveSection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addToHistory = useCallback((section: ActiveSection) => {
    setHistory(prev => {
      const newHistory = [...prev.slice(0, currentIndex + 1), section];
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const goBackInHistory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return "dashboard" as ActiveSection;
  }, [currentIndex, history]);

  const goForwardInHistory = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return history[history.length - 1] || "dashboard";
  }, [currentIndex, history]);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    addToHistory,
    goBackInHistory,
    goForwardInHistory,
    canGoBack,
    canGoForward
  };
};

// ===================================================================
// EXPORTS PARA COMPATIBILIDADE
// ===================================================================

export default useDashboardNavigation; 