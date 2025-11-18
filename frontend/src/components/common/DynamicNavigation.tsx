// ===================================================================
// COMPONENTE - NAVEGAÇÃO DINÂMICA (FIELDMANAGER v2.0)
// Localização: frontend/src/components/common/DynamicNavigation.tsx
// ===================================================================

import {
  ClipboardCheck,
  FileText,
  SearchCheck,
  Award,
  type LucideIcon
} from 'lucide-react';
import type { ModuloSistema } from '../../types/dominio';

/**
 * Mapeia tipo de módulo para ícone
 */
const ICONE_POR_TIPO: Record<ModuloSistema['tipo_modulo'], LucideIcon> = {
  checklist: ClipboardCheck,
  formulario: FileText,
  inspecao: SearchCheck,
  auditoria: Award
};

/**
 * Mapeia tipo de módulo para label genérico
 */
const LABEL_POR_TIPO: Record<ModuloSistema['tipo_modulo'], string> = {
  checklist: 'Checklists',
  formulario: 'Formulários',
  inspecao: 'Inspeções',
  auditoria: 'Auditorias'
};

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge: number | null;
  moduleId?: string; // ID do módulo quando for item de módulo
  tipo?: ModuloSistema['tipo_modulo'];
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

/**
 * Gera itens de menu dinâmicos a partir dos módulos disponíveis
 */
export function gerarItensModulos(modulos: ModuloSistema[]): MenuItem[] {
  return modulos.map(modulo => ({
    id: `modulo_${modulo.id}`,
    label: modulo.nome,
    icon: ICONE_POR_TIPO[modulo.tipo_modulo] || ClipboardCheck,
    badge: null,
    moduleId: modulo.id,
    tipo: modulo.tipo_modulo
  }));
}

/**
 * Agrupa módulos por tipo
 */
export function agruparModulosPorTipo(modulos: ModuloSistema[]): Record<string, ModuloSistema[]> {
  return modulos.reduce((acc, modulo) => {
    const tipo = modulo.tipo_modulo;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(modulo);
    return acc;
  }, {} as Record<string, ModuloSistema[]>);
}

/**
 * Gera seções de menu agrupadas por tipo de módulo
 */
export function gerarSecoesModulos(modulos: ModuloSistema[]): MenuSection[] {
  const modulosAgrupados = agruparModulosPorTipo(modulos);
  const secoes: MenuSection[] = [];

  // Para cada tipo de módulo, criar uma seção
  Object.entries(modulosAgrupados).forEach(([tipo, modulosDaTipo]) => {
    if (modulosDaTipo.length > 0) {
      secoes.push({
        title: LABEL_POR_TIPO[tipo as ModuloSistema['tipo_modulo']],
        items: gerarItensModulos(modulosDaTipo)
      });
    }
  });

  return secoes;
}

/**
 * Componente de item de navegação
 */
interface NavigationItemProps {
  item: MenuItem;
  active: boolean;
  onClick: () => void;
}

export function NavigationItem({ item, active, onClick }: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all
        ${active
          ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-gray-500'}`} />
      <span className="flex-1 text-left text-sm">{item.label}</span>
      {item.badge && (
        <span className={`
          px-2 py-0.5 text-xs font-semibold rounded-full
          ${active ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}
        `}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

/**
 * Componente de seção de navegação
 */
interface NavigationSectionProps {
  section: MenuSection;
  activeItemId: string | null;
  onItemClick: (itemId: string) => void;
}

export function NavigationSection({ section, activeItemId, onItemClick }: NavigationSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {section.title}
      </h3>
      <div className="space-y-1">
        {section.items.map(item => (
          <NavigationItem
            key={item.id}
            item={item}
            active={activeItemId === item.id}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
