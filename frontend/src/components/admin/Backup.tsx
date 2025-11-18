import React, { useState } from 'react';
import { backupAPI } from '../../lib/backupAPI';

const tabelasPrincipais = [
  // Usuários e Estrutura
  'usuarios',
  'perfis',
  'areas',
  'categorias_lv',
  'empresas_contratadas',

  // LVs
  'lvs',
  'lv_avaliacoes',
  'lv_fotos',

  // Termos Ambientais
  'termos_ambientais',
  'termos_fotos',

  // Atividades e Rotinas
  'atividades_rotina',

  // Metas
  'metas',
  'metas_atribuicoes',
  'progresso_metas',

  // Ações Corretivas
  'acoes_corretivas',
  'historico_acoes',
  'comentarios_acoes',

  // Sistema
  'configuracoes',
  'logs',
];

const Backup: React.FC = () => {
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function exportarTabela(tabela: string, formato: 'csv' | 'json') {
    setExportando(true);
    setMensagem('');
    setError(null);
    
    try {
      const result = await backupAPI.exportarTabela(tabela, formato);
      
      if (!result.success || !result.data) {
        setError(result.error || 'Erro ao exportar dados');
        return;
      }

      let conteudo = '';
      let nomeArquivo = `${tabela}.${formato}`;
      
      if (formato === 'json') {
        conteudo = JSON.stringify(result.data, null, 2);
      } else {
        // CSV simples
        const colunas = Object.keys(result.data[0] || {});
        conteudo = colunas.join(',') + '\n' + result.data.map((row: any) => 
          colunas.map(c => JSON.stringify(row[c] ?? '')).join(',')
        ).join('\n');
      }
      
      const blob = new Blob([conteudo], { 
        type: formato === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
      
      setMensagem('Exportação concluída!');
    } catch (error) {
      setError('Erro inesperado ao exportar dados');
      console.error('Erro ao exportar:', error);
    } finally {
      setExportando(false);
    }
  }

  async function importarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    setImportando(true);
    setMensagem('');
    setError(null);
    
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const texto = await file.text();
      let dados: any[] = [];
      
      if (file.name.endsWith('.json')) {
        try {
          dados = JSON.parse(texto);
        } catch {
          setError('Arquivo JSON inválido.');
          return;
        }
      } else {
        setError('Importação só aceita arquivos JSON.');
        return;
      }
      
      if (!Array.isArray(dados) || dados.length === 0) {
        setError('Arquivo vazio ou formato inválido.');
        return;
      }
      
      // Perguntar tabela
      const tabela = prompt('Para qual tabela deseja importar? (ex: usuarios, lv_residuos)');
      if (!tabela) {
        return;
      }
      
      const result = await backupAPI.restaurarTabela(tabela, dados);
      
      if (!result.success) {
        setError(result.error || 'Erro ao importar dados');
      } else {
        setMensagem('Importação concluída!');
      }
    } catch (error) {
      setError('Erro inesperado ao importar dados');
      console.error('Erro ao importar:', error);
    } finally {
      setImportando(false);
    }
  }

  async function backupCompleto() {
    setExportando(true);
    setMensagem('');
    setError(null);
    
    try {
      const result = await backupAPI.backupCompleto();
      
      if (!result.success || !result.data) {
        setError(result.error || 'Erro ao gerar backup completo');
        return;
      }

      const conteudo = JSON.stringify(result.data, null, 2);
      const blob = new Blob([conteudo], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setMensagem('Backup completo gerado com sucesso!');
    } catch (error) {
      setError('Erro inesperado ao gerar backup completo');
      console.error('Erro ao gerar backup:', error);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Backup e Restauração</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {mensagem && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {mensagem}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Backup Completo do Sistema</h2>
        <button 
          className="bg-purple-600 text-white px-4 py-2 rounded mb-4" 
          disabled={exportando} 
          onClick={backupCompleto}
        >
          {exportando ? 'Gerando Backup...' : 'Gerar Backup Completo'}
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Exportar Dados por Tabela</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {tabelasPrincipais.map((tabela) => (
            <React.Fragment key={tabela}>
              <button 
                className="bg-blue-600 text-white px-3 py-1 rounded" 
                disabled={exportando} 
                onClick={() => exportarTabela(tabela, 'csv')}
              >
                Exportar {tabela} (CSV)
              </button>
              <button 
                className="bg-green-600 text-white px-3 py-1 rounded" 
                disabled={exportando} 
                onClick={() => exportarTabela(tabela, 'json')}
              >
                Exportar {tabela} (JSON)
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Importar Dados</h2>
        <input 
          type="file" 
          accept=".json" 
          className="mb-2" 
          disabled={importando} 
          onChange={importarArquivo} 
        />
        <p className="text-sm text-gray-600">
          Importação só aceita arquivos JSON. Certifique-se de que o arquivo contém um array de objetos.
        </p>
      </div>
    </div>
  );
};

export default Backup; 