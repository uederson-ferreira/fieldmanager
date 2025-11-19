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
      // Usar setDominiosDisponiveis para evitar dependência circular
      if (dominios.length > 0) {
        setDominiosDisponiveis(dominios);
        // Só definir se ainda não tem domínio atual
        setDominioAtualState(prev => prev || dominios[0]);
      }
    } catch (error) {
      console.error('❌ [DominioContext] Erro ao carregar domínios:', error);
      setErro('Erro ao carregar domínios. Por favor, tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, [tenantId]); // Removido dominioAtual da dependência

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
    // Evitar atualização desnecessária
    if (dominioAtual?.id === dominio.id) {
      return;
    }
    
    setDominioAtualState(dominio);
    localStorage.setItem('fieldmanager_dominio_atual', dominio.id);
    console.log(`✅ [DominioContext] Domínio alterado para: ${dominio.nome}`);
  }, [dominioAtual]);

  // Carregar domínios na inicialização (apenas uma vez)
  useEffect(() => {
    let mounted = true;
    
    const loadDominios = async () => {
      try {
        setCarregando(true);
        setErro(null);

        let dominios: Dominio[];

        if (tenantId) {
          dominios = await dominiosAPI.getDominiosAtivosTenant(tenantId);
        } else {
          dominios = await dominiosAPI.getDominios();
        }

        if (!mounted) return;

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
        if (dominios.length > 0) {
          setDominioAtualState(dominios[0]);
        }
      } catch (error) {
        if (!mounted) return;
        console.error('❌ [DominioContext] Erro ao carregar domínios:', error);
        setErro('Erro ao carregar domínios. Por favor, tente novamente.');
      } finally {
        if (mounted) {
          setCarregando(false);
        }
      }
    };

    loadDominios();

    return () => {
      mounted = false;
    };
  }, [tenantId]); // Apenas quando tenantId mudar

  // Carregar módulos quando o domínio mudar (com debounce)
  useEffect(() => {
    if (!dominioAtual) {
      setModulosDisponiveis([]);
      return;
    }

    let mounted = true;
    const timeoutId = setTimeout(async () => {
      try {
        const modulos = await dominiosAPI.getModulosDominio(dominioAtual.id, tenantId);
        if (mounted) {
          setModulosDisponiveis(modulos);
        }
      } catch (error) {
        if (mounted) {
          console.error('❌ [DominioContext] Erro ao carregar módulos:', error);
          setErro('Erro ao carregar módulos. Por favor, tente novamente.');
        }
      }
    }, 300); // Debounce de 300ms

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [dominioAtual?.id, tenantId]); // Apenas quando ID do domínio ou tenant mudar

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
