import { useState, useEffect, useCallback } from 'react';
import { termosAPI } from '../lib/termosAPI';
import type { TermoAmbiental } from '../types/termos';

interface FiltrosTermos {
  tipo_termo: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  emitido_por: string;
  area: string;
}

interface UseAdminTermosReturn {
  // Estado
  termos: TermoAmbiental[];
  loading: boolean;
  selecionados: string[];
  mensagem: string;
  filtros: FiltrosTermos;
  
  // Ações
  fetchTermos: () => Promise<void>;
  handleSelecionar: (id: string) => void;
  handleExcluir: (id: string) => Promise<void>;
  handleExcluirLote: () => Promise<void>;
  setFiltros: (filtros: Partial<FiltrosTermos>) => void;
  limparFiltros: () => void;
  limparMensagem: () => void;
}

export const useAdminTermos = (): UseAdminTermosReturn => {
  // Estados
  const [termos, setTermos] = useState<TermoAmbiental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [filtros, setFiltrosState] = useState<FiltrosTermos>({
    tipo_termo: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    emitido_por: '',
    area: ''
  });

  // Buscar termos
  const fetchTermos = useCallback(async () => {
    setLoading(true);
    setMensagem('');
    
    try {
      const response = await termosAPI.listarTermos();
      if (response.success && response.data) {
        setTermos(response.data as unknown as TermoAmbiental[]);
      } else {
        console.error('❌ [ADMIN TERMOS] Erro ao carregar termos:', response.error);
        setMensagem('Erro ao carregar termos: ' + (response.error || 'Erro desconhecido'));
      }
    } catch (error: any) {
      console.error('❌ [ADMIN TERMOS] Erro inesperado:', error);
      setMensagem('Erro ao buscar termos: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, []);

  // Selecionar/desselecionar termo
  const handleSelecionar = useCallback((id: string) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id) 
        : [...prev, id]
    );
  }, []);

  // Excluir termo individual
  const handleExcluir = useCallback(async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este termo?')) {
      return;
    }

    try {
      setMensagem('');
      const response = await termosAPI.excluirTermo(id);
      
      if (response.success) {
        setMensagem('✅ Termo excluído com sucesso!');
        await fetchTermos(); // Recarregar lista
      } else {
        setMensagem('❌ Erro ao excluir termo: ' + (response.error || 'Erro desconhecido'));
      }
    } catch (error: any) {
      console.error('❌ [ADMIN TERMOS] Erro ao excluir termo:', error);
      setMensagem('❌ Erro ao excluir termo: ' + (error.message || error));
    }
  }, [fetchTermos]);

  // Excluir termos em lote
  const handleExcluirLote = useCallback(async () => {
    if (selecionados.length === 0) {
      setMensagem('⚠️ Nenhum termo selecionado para exclusão');
      return;
    }

    if (!window.confirm(`Deseja excluir ${selecionados.length} termo(s) selecionado(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      setMensagem('');
      
      const resultados = [];
      const erros = [];
      
      for (const id of selecionados) {
        try {
          const response = await termosAPI.excluirTermo(id);
          if (response.success) {
            resultados.push(id);
          } else {
            erros.push({ id, error: response.error });
          }
        } catch (error: any) {
          erros.push({ id, error: error.message || error });
        }
      }
      
      // Relatório de resultado
      if (erros.length === 0) {
        setMensagem(`✅ ${resultados.length} termo(s) excluído(s) com sucesso!`);
      } else if (resultados.length > 0) {
        setMensagem(`⚠️ ${resultados.length} termo(s) excluído(s), mas falhou para ${erros.length} termo(s)`);
      } else {
        setMensagem(`❌ Falha ao excluir todos os termos selecionados`);
      }
      
      setSelecionados([]);
      await fetchTermos(); // Recarregar lista
    } catch (error: any) {
      console.error('❌ [ADMIN TERMOS] Erro geral na exclusão em lote:', error);
      setMensagem('❌ Erro ao excluir termos em lote: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, [selecionados, fetchTermos]);

  // Atualizar filtros
  const setFiltros = useCallback((novosFiltros: Partial<FiltrosTermos>) => {
    setFiltrosState(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltrosState({
      tipo_termo: '',
      status: '',
      data_inicio: '',
      data_fim: '',
      emitido_por: '',
      area: ''
    });
  }, []);

  // Limpar mensagem
  const limparMensagem = useCallback(() => {
    setMensagem('');
  }, []);

  // Efeito para recarregar quando filtros mudam
  useEffect(() => {
    fetchTermos();
  }, [filtros, fetchTermos]);

  return {
    // Estado
    termos,
    loading,
    selecionados,
    mensagem,
    filtros,
    
    // Ações
    fetchTermos,
    handleSelecionar,
    handleExcluir,
    handleExcluirLote,
    setFiltros,
    limparFiltros,
    limparMensagem
  };
}; 