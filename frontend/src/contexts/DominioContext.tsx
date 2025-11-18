// ===================================================================
// CONTEXT - DOMÍNIO ATUAL (FIELDMANAGER v2.0)
// Localização: frontend/src/contexts/DominioContext.tsx
// ===================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Dominio, ModuloSistema } from '../types/dominio';
import { dominiosAPI } from '../lib/dominiosAPI';

interface DominioContextType {
  dominioAtual: Dominio | null;
  dominiosDisponiveis: Dominio[];
  modulosDisponiveis: ModuloSistema[];
  carregando: boolean;
  erro: string | null;
  setDominioAtual: (dominio: Dominio) => void;
  refreshDominios: () => Promise<void>;
  refreshModulos: () => Promise<void>;
}

const DominioContext = createContext<DominioContextType | undefined>(undefined);

interface DominioProviderProps {
  children: React.ReactNode;
  tenantId?: string; // Opcional, para suportar multi-tenant no futuro
}

export const DominioProvider: React.FC<DominioProviderProps> = ({ children, tenantId }) => {
  const [dominioAtual, setDominioAtualState] = useState<Dominio | null>(null);
  const [dominiosDisponiveis, setDominiosDisponiveis] = useState<Dominio[]>([]);
  const [modulosDisponiveis, setModulosDisponiveis] = useState<ModuloSistema[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Carrega todos os domínios disponíveis
   */
  const refreshDominios = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      let dominios: Dominio[];

      if (tenantId) {
        // Multi-tenant: buscar domínios ativos do tenant
        dominios = await dominiosAPI.getDominiosAtivosTenant(tenantId);
      } else {
        // Modo padrão: buscar todos os domínios
        dominios = await dominiosAPI.getDominios();
      }

      setDominiosDisponiveis(dominios);

      // Restaurar domínio selecionado do localStorage
      const dominioSalvoId = localStorage.getItem('fieldmanager_dominio_atual');

      if (dominioSalvoId) {
        const dominioSalvo = dominios.find(d => d.id === dominioSalvoId);
        if (dominioSalvo) {
          setDominioAtualState(dominioSalvo);
          return;
        }
      }

      // Se não tem domínio salvo, selecionar o primeiro disponível
      if (dominios.length > 0 && !dominioAtual) {
        setDominioAtualState(dominios[0]);
      }
    } catch (error) {
      console.error('❌ [DominioContext] Erro ao carregar domínios:', error);
      setErro('Erro ao carregar domínios. Por favor, tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, [tenantId, dominioAtual]);

  /**
   * Carrega módulos do domínio atual
   */
  const refreshModulos = useCallback(async () => {
    if (!dominioAtual) {
      setModulosDisponiveis([]);
      return;
    }

    try {
      const modulos = await dominiosAPI.getModulosDominio(dominioAtual.id, tenantId);
      setModulosDisponiveis(modulos);
    } catch (error) {
      console.error('❌ [DominioContext] Erro ao carregar módulos:', error);
      setErro('Erro ao carregar módulos. Por favor, tente novamente.');
    }
  }, [dominioAtual, tenantId]);

  /**
   * Define o domínio atual e salva no localStorage
   */
  const setDominioAtual = useCallback((dominio: Dominio) => {
    setDominioAtualState(dominio);
    localStorage.setItem('fieldmanager_dominio_atual', dominio.id);
    console.log(`✅ [DominioContext] Domínio alterado para: ${dominio.nome}`);
  }, []);

  // Carregar domínios na inicialização
  useEffect(() => {
    refreshDominios();
  }, [refreshDominios]);

  // Carregar módulos quando o domínio mudar
  useEffect(() => {
    if (dominioAtual) {
      refreshModulos();
    }
  }, [dominioAtual, refreshModulos]);

  const value: DominioContextType = {
    dominioAtual,
    dominiosDisponiveis,
    modulosDisponiveis,
    carregando,
    erro,
    setDominioAtual,
    refreshDominios,
    refreshModulos
  };

  return (
    <DominioContext.Provider value={value}>
      {children}
    </DominioContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de domínio
 */
export const useDominio = (): DominioContextType => {
  const context = useContext(DominioContext);

  if (!context) {
    throw new Error('useDominio deve ser usado dentro de DominioProvider');
  }

  return context;
};

/**
 * Hook para verificar se um domínio específico está ativo
 */
export const useDominioAtivo = (codigoDominio: string): boolean => {
  const { dominioAtual } = useDominio();
  return dominioAtual?.codigo === codigoDominio;
};

/**
 * Hook para buscar módulos de uma categoria específica
 */
export const useModulosPorTipo = (tipo: ModuloSistema['tipo_modulo']): ModuloSistema[] => {
  const { modulosDisponiveis } = useDominio();
  return modulosDisponiveis.filter(m => m.tipo_modulo === tipo);
};
