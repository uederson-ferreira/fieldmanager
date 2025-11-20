// ===================================================================
// HOOK - MENU DINÂMICO (FIELDMANAGER v2.0)
// Localização: frontend/src/hooks/useMenuDinamico.ts
// ===================================================================

import { useMemo } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserCheck,
  MapPin,
  FolderOpen,
  Settings,
  Database,
  Target,
  ClipboardList
} from 'lucide-react';
import { useDominio } from '../contexts/DominioContext';
import {
  gerarSecoesModulos,
  type MenuSection,
  type MenuItem
} from '../components/common/DynamicNavigation';

/**
 * Hook que retorna as seções de menu dinâmicas para o Admin
 * Combina itens estáticos (Dashboard, Config) com módulos dinâmicos do domínio
 */
export function useMenuAdmin(): MenuSection[] {
  const { modulosDisponiveis } = useDominio();

  return useMemo(() => {
    // Seções estáticas (sempre presentes)
    const secoesEstaticas: MenuSection[] = [
      {
        title: 'Visão Geral',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
          { id: 'relatorios', label: 'Relatórios', icon: BarChart3, badge: null },
        ]
      },
      // As seções de módulos serão inseridas aqui
    ];

    // Gerar seções dinâmicas a partir dos módulos do domínio atual
    const secoesModulos = gerarSecoesModulos(modulosDisponiveis);

    // Seções de configuração (sempre no final)
    const secoesConfiguracao: MenuSection[] = [
      {
        title: 'Metas e Objetivos',
        items: [
          { id: 'metas', label: 'Metas', icon: Target, badge: null },
        ]
      },
      {
        title: 'Configurações',
        items: [
          { id: 'usuarios', label: 'Usuários', icon: Users, badge: null },
          { id: 'perfis', label: 'Perfis', icon: UserCheck, badge: null },
          { id: 'areas', label: 'Áreas', icon: MapPin, badge: null },
          { id: 'categorias', label: 'Categorias', icon: FolderOpen, badge: null },
        ]
      },
      {
        title: 'Sistema',
        items: [
          { id: 'configuracoes', label: 'Configurações', icon: Settings, badge: null },
          { id: 'backup', label: 'Backup & Restore', icon: Database, badge: null },
        ]
      }
    ];

    // Combinar todas as seções na ordem correta
    return [
      ...secoesEstaticas,
      ...secoesModulos,    // Módulos dinâmicos do domínio
      ...secoesConfiguracao
    ];
  }, [modulosDisponiveis]);
}

/**
 * Hook que retorna as seções de menu dinâmicas para o Técnico
 * Mais simples, focado apenas nos módulos de execução
 */
export function useMenuTecnico(): MenuSection[] {
  const { modulosDisponiveis } = useDominio();

  return useMemo(() => {
    const secoesEstaticas: MenuSection[] = [
      {
        title: 'Início',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
          { id: 'historico', label: 'Histórico', icon: ClipboardList, badge: null },
        ]
      },
    ];

    // Gerar seções dinâmicas a partir dos módulos
    const secoesModulos = gerarSecoesModulos(modulosDisponiveis);

    return [
      ...secoesEstaticas,
      ...secoesModulos
    ];
  }, [modulosDisponiveis]);
}

/**
 * Hook para buscar um item de menu pelo ID
 */
export function useMenuItem(sections: MenuSection[], itemId: string): MenuItem | null {
  return useMemo(() => {
    for (const section of sections) {
      const item = section.items.find(i => i.id === itemId);
      if (item) return item;
    }
    return null;
  }, [sections, itemId]);
}
