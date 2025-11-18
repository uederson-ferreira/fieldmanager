// ===================================================================
// FILTER MANAGER - ECOFIELD SYSTEM
// Localização: src/utils/FilterManager.ts
// ===================================================================

export interface FilterConfig {
  field: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean' | 'custom';
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn';
  value?: unknown;
  options?: Array<{ label: string; value: unknown }>;
  customFilter?: (item: unknown, filterValue: unknown) => boolean;
}

export interface FilterState {
  [key: string]: {
    value: unknown;
    operator: string;
    active: boolean;
  };
}

export interface FilterResult<T> {
  filteredData: T[];
  totalItems: number;
  filteredItems: number;
  appliedFilters: FilterState;
  summary: {
    activeFilters: number;
    removedItems: number;
  };
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
}

// ===================================================================
// CLASSE PRINCIPAL
// ===================================================================

export class FilterManager {
  /**
   * Filtrar dados com base em configurações
   */
  static filterData<T>(
    data: T[],
    filters: FilterState,
    configs: FilterConfig[]
  ): FilterResult<T> {
    let filteredData = [...data];
    const appliedFilters: FilterState = {};
    let removedItems = 0;

    // Aplicar cada filtro
    Object.entries(filters).forEach(([field, filter]) => {
      if (filter.active && filter.value !== undefined && filter.value !== '') {
        const config = configs.find(c => c.field === field);
        if (config) {
          const beforeCount = filteredData.length;
          filteredData = this.applyFilter(filteredData, field, filter, config);
          const afterCount = filteredData.length;
          removedItems += beforeCount - afterCount;
          appliedFilters[field] = filter;
        }
      }
    });

    return {
      filteredData,
      totalItems: data.length,
      filteredItems: filteredData.length,
      appliedFilters,
      summary: {
        activeFilters: Object.keys(appliedFilters).length,
        removedItems
      }
    };
  }

  /**
   * Aplicar filtro individual
   */
  private static applyFilter<T>(
    data: T[],
    field: string,
    filter: { value: unknown; operator: string },
    config: FilterConfig
  ): T[] {
    return data.filter(item => {
      const value = this.getNestedValue(item, field);
      
      switch (config.type) {
        case 'text':
          return this.filterText(value, filter.value as string, filter.operator);
        case 'select':
          return this.filterSelect(value, filter.value, filter.operator);
        case 'date':
          return this.filterDate(value, filter.value, filter.operator);
        case 'dateRange':
          return this.filterDateRange(value, filter.value as { start: string; end: string });
        case 'number':
          return this.filterNumber(value, filter.value, filter.operator);
        case 'boolean':
          return this.filterBoolean(value, filter.value);
        case 'custom':
          return config.customFilter ? config.customFilter(item, filter.value) : true;
        default:
          return true;
      }
    });
  }

  /**
   * Filtrar texto
   */
  private static filterText(value: unknown, filterValue: string, operator: string): boolean {
    const strValue = String(value || '').toLowerCase();
    const strFilter = filterValue.toLowerCase();

    switch (operator) {
      case 'contains':
        return strValue.includes(strFilter);
      case 'startsWith':
        return strValue.startsWith(strFilter);
      case 'endsWith':
        return strValue.endsWith(strFilter);
      case 'equals':
        return strValue === strFilter;
      default:
        return strValue.includes(strFilter);
    }
  }

  /**
   * Filtrar select
   */
  private static filterSelect(value: unknown, filterValue: unknown, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return value === filterValue;
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      case 'notIn':
        return Array.isArray(filterValue) && !filterValue.includes(value);
      default:
        return value === filterValue;
    }
  }

  /**
   * Filtrar data
   */
  private static filterDate(value: unknown, filterValue: unknown, operator: string): boolean {
    const dateValue = value instanceof Date ? value : new Date(String(value || ''));
    const dateFilter = filterValue instanceof Date ? filterValue : new Date(String(filterValue || ''));

    if (isNaN(dateValue.getTime()) || isNaN(dateFilter.getTime())) {
      return false;
    }

    switch (operator) {
      case 'equals':
        return dateValue.getTime() === dateFilter.getTime();
      case 'greaterThan':
        return dateValue > dateFilter;
      case 'lessThan':
        return dateValue < dateFilter;
      default:
        return dateValue.getTime() === dateFilter.getTime();
    }
  }

  /**
   * Filtrar intervalo de datas
   */
  private static filterDateRange(value: unknown, filterValue: { start: string; end: string }): boolean {
    const dateValue = value instanceof Date ? value : new Date(String(value || ''));
    const startDate = new Date(filterValue.start);
    const endDate = new Date(filterValue.end);

    if (isNaN(dateValue.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }

    return dateValue >= startDate && dateValue <= endDate;
  }

  /**
   * Filtrar número
   */
  private static filterNumber(value: unknown, filterValue: unknown, operator: string): boolean {
    const numValue = Number(value);
    const numFilter = Number(filterValue);

    if (isNaN(numValue) || isNaN(numFilter)) {
      return false;
    }

    switch (operator) {
      case 'equals':
        return numValue === numFilter;
      case 'greaterThan':
        return numValue > numFilter;
      case 'lessThan':
        return numValue < numFilter;
      case 'between':
        if (Array.isArray(filterValue) && filterValue.length === 2) {
          const [min, max] = filterValue.map(Number);
          return numValue >= min && numValue <= max;
        }
        return false;
      default:
        return numValue === numFilter;
    }
  }

  /**
   * Filtrar booleano
   */
  private static filterBoolean(value: unknown, filterValue: unknown): boolean {
    const boolValue = Boolean(value);
    const boolFilter = Boolean(filterValue);
    return boolValue === boolFilter;
  }

  /**
   * Ordenar dados
   */
  static sortData<T>(
    data: T[],
    sortConfig: SortConfig
  ): T[] {
    return [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, sortConfig.field);
      const bValue = this.getNestedValue(b, sortConfig.field);

      // Converter para string para comparação segura
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Paginar dados
   */
  static paginateData<T>(
    data: T[],
    pagination: PaginationConfig
  ): T[] {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  }

  /**
   * Filtrar por data
   */
  static filterByDate<T>(
    data: T[],
    dateField: string,
    dateFilter: string
  ): T[] {
    return data.filter(item => {
      const dateValue = this.getNestedValue(item, dateField);
      if (!dateValue) return false;
      
      const itemDate = new Date(String(dateValue));
      const filterDate = new Date(dateFilter);
      
      return itemDate.toDateString() === filterDate.toDateString();
    });
  }

  /**
   * Filtrar por status
   */
  static filterByStatus<T>(
    data: T[],
    statusField: string,
    statusFilter: string
  ): T[] {
    return data.filter(item => {
      const statusValue = this.getNestedValue(item, statusField);
      return String(statusValue).toLowerCase() === statusFilter.toLowerCase();
    });
  }

  /**
   * Filtrar por busca
   */
  static filterBySearch<T>(
    data: T[],
    searchFields: string[],
    searchTerm: string
  ): T[] {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        return String(value).toLowerCase().includes(term);
      });
    });
  }

  /**
   * Filtrar por usuário
   */
  static filterByUser<T>(
    data: T[],
    userField: string,
    userId: string
  ): T[] {
    return data.filter(item => {
      const itemUserId = this.getNestedValue(item, userField);
      return String(itemUserId) === userId;
    });
  }

  /**
   * Obter valores únicos
   */
  static getUniqueValues<T>(
    data: T[],
    field: string
  ): unknown[] {
    const values = data.map(item => this.getNestedValue(item, field));
    return [...new Set(values)].filter(value => value !== undefined && value !== null);
  }

  /**
   * Obter estatísticas dos filtros
   */
  static getFilterStats<T>(
    data: T[],
    filters: FilterState
  ): {
    totalItems: number;
    activeFilters: number;
    filteredItems: number;
    filterBreakdown: { [field: string]: number };
  } {
    const activeFilters = Object.values(filters).filter(f => f.active).length;
    const filterBreakdown: { [field: string]: number } = {};

    Object.entries(filters).forEach(([field, filter]) => {
      if (filter.active) {
        filterBreakdown[field] = data.filter(item => {
          const value = this.getNestedValue(item, field);
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        }).length;
      }
    });

    return {
      totalItems: data.length,
      activeFilters,
      filteredItems: data.length,
      filterBreakdown
    };
  }

  /**
   * Limpar filtros
   */
  static clearFilters(filters: FilterState): FilterState {
    const cleared: FilterState = {};
    Object.keys(filters).forEach(key => {
      cleared[key] = {
        value: undefined,
        operator: 'equals',
        active: false
      };
    });
    return cleared;
  }

  /**
   * Obter valor aninhado
   */
  private static getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Criar configuração de filtro
   */
  static createFilterConfig(
    field: string,
    type: FilterConfig['type'],
    options?: Partial<FilterConfig>
  ): FilterConfig {
    return {
      field,
      type,
      operator: options?.operator || this.getDefaultOperator(type),
      options: options?.options,
      customFilter: options?.customFilter
    };
  }

  /**
   * Obter operador padrão para tipo de filtro
   */
  private static getDefaultOperator(type: FilterConfig['type']): FilterConfig['operator'] {
    switch (type) {
      case 'text':
        return 'contains';
      case 'select':
        return 'equals';
      case 'date':
        return 'equals';
      case 'number':
        return 'equals';
      case 'boolean':
        return 'equals';
      default:
        return 'equals';
    }
  }
}

// ===================================================================
// HOOK PARA USO EM COMPONENTES
// ===================================================================

import { useState, useCallback, useMemo } from 'react';

export const useFilterManager = <T>(
  initialData: T[],
  filterConfigs: FilterConfig[]
) => {
  const [filters, setFilters] = useState<FilterState>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10,
    totalItems: initialData.length
  });

  // Aplicar filtros
  const filteredData = useMemo(() => {
    const result = FilterManager.filterData(initialData, filters, filterConfigs);
    return result;
  }, [initialData, filters, filterConfigs]);

  // Aplicar ordenação
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData.filteredData;
    return FilterManager.sortData(filteredData.filteredData, sortConfig);
  }, [filteredData.filteredData, sortConfig]);

  // Aplicar paginação
  const paginatedData = useMemo(() => {
    const paginationWithTotal = {
      ...pagination,
      totalItems: sortedData.length
    };
    return FilterManager.paginateData(sortedData, paginationWithTotal);
  }, [sortedData, pagination]);

  // Atualizar filtro
  const updateFilter = useCallback((field: string, value: unknown, operator?: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: {
        value,
        operator: operator || 'equals',
        active: value !== undefined && value !== ''
      }
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset para primeira página
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters(FilterManager.clearFilters(filters));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters]);

  // Atualizar ordenação
  const updateSort = useCallback((field: string, direction: 'asc' | 'desc' = 'asc') => {
    setSortConfig({ field, direction });
  }, []);

  // Atualizar paginação
  const updatePagination = useCallback((page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      page,
      pageSize: pageSize || prev.pageSize
    }));
  }, []);

  return {
    data: paginatedData,
    filteredData: filteredData.filteredData,
    filters,
    sortConfig,
    pagination,
    updateFilter,
    clearFilters,
    updateSort,
    updatePagination,
    stats: filteredData.summary
  };
};

// ===================================================================
// FUNÇÕES UTILITÁRIAS
// ===================================================================

export const filterData = <T>(data: T[], filters: FilterState, configs: FilterConfig[]) => {
  return FilterManager.filterData(data, filters, configs);
};

export const sortData = <T>(data: T[], sortConfig: SortConfig) => {
  return FilterManager.sortData(data, sortConfig);
};

export const paginateData = <T>(data: T[], pagination: PaginationConfig) => {
  return FilterManager.paginateData(data, pagination);
};

export const filterByDate = <T>(data: T[], dateField: string, dateFilter: string) => {
  return FilterManager.filterByDate(data, dateField, dateFilter);
};

export const filterByStatus = <T>(data: T[], statusField: string, statusFilter: string) => {
  return FilterManager.filterByStatus(data, statusField, statusFilter);
};

export const filterBySearch = <T>(data: T[], searchFields: string[], searchTerm: string) => {
  return FilterManager.filterBySearch(data, searchFields, searchTerm);
};

export const filterByUser = <T>(data: T[], userField: string, userId: string) => {
  return FilterManager.filterByUser(data, userField, userId);
};

export const getUniqueValues = <T>(data: T[], field: string) => {
  return FilterManager.getUniqueValues(data, field);
};

export const clearFilters = (filters: FilterState) => {
  return FilterManager.clearFilters(filters);
}; 