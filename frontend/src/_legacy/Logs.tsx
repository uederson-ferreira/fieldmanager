import React, { useEffect, useState } from 'react';
import { logsAPI, type Log } from '../../lib/logsAPI';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');
  const [filtroData, setFiltroData] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filtroUsuario, filtroAcao, filtroData]);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        usuario: filtroUsuario || undefined,
        acao: filtroAcao || undefined,
        data: filtroData || undefined
      };

      const result = await logsAPI.list(filters);
      
      if (result.success && result.data) {
        setLogs(result.data);
      } else {
        setError(result.error || 'Erro ao carregar logs');
      }
    } catch (error) {
      setError('Erro inesperado ao carregar logs');
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function limparLogsAntigos() {
    if (!window.confirm('Deseja realmente limpar logs antigos (mais de 30 dias)?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await logsAPI.limparAntigos(30);
      
      if (result.success) {
        setError(null);
        fetchLogs(); // Recarregar logs após limpeza
      } else {
        setError(result.error || 'Erro ao limpar logs antigos');
      }
    } catch (error) {
      setError('Erro inesperado ao limpar logs');
      console.error('Erro ao limpar logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function limparFiltros() {
    setFiltroUsuario('');
    setFiltroAcao('');
    setFiltroData('');
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Logs do Sistema</h1>
        <button 
          className="bg-red-600 text-white px-3 py-1 rounded text-sm" 
          onClick={limparLogsAntigos}
          disabled={loading}
        >
          Limpar Logs Antigos
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <input 
          type="text" 
          placeholder="Filtrar por usuário" 
          className="border rounded px-2 py-1" 
          value={filtroUsuario} 
          onChange={e => setFiltroUsuario(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Filtrar por ação" 
          className="border rounded px-2 py-1" 
          value={filtroAcao} 
          onChange={e => setFiltroAcao(e.target.value)} 
        />
        <input 
          type="date" 
          className="border rounded px-2 py-1" 
          value={filtroData} 
          onChange={e => setFiltroData(e.target.value)} 
        />
        <button 
          className="bg-gray-300 px-3 py-1 rounded" 
          onClick={limparFiltros}
        >
          Limpar Filtros
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Carregando logs...</p>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum log encontrado
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Usuário</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Ação</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {new Date(log.data).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 text-sm font-medium">
                      {log.usuario}
                    </td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {log.acao}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {log.detalhes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {!loading && logs.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Total de {logs.length} logs encontrados
        </div>
      )}
    </div>
  );
};

export default Logs; 