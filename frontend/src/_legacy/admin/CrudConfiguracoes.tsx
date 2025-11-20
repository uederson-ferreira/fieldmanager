import React, { useEffect, useState } from 'react';
import { configuracoesAPI, type Configuracao } from '../../lib/configuracoesAPI';

const initialForm: Partial<Configuracao> = {
  chave: '',
  valor: '',
  descricao: '',
  tipo: 'string',
  categoria: 'sistema',
  editavel: true,
  ativo: true,
};

const CrudConfiguracoes: React.FC = () => {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Configuracao>>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  async function fetchConfiguracoes() {
    setLoading(true);
    setError(null);
    
    try {
      const result = await configuracoesAPI.list();
      if (result.success && result.data) {
        setConfiguracoes(result.data);
      } else {
        setError(result.error || 'Erro ao carregar configurações');
      }
    } catch (error) {
      setError('Erro inesperado ao carregar configurações');
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }

  function openForm(config?: Configuracao) {
    setForm(config ? { ...config } : initialForm);
    setEditId(config ? config.id : null);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setForm(initialForm);
    setEditId(null);
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      if (editId) {
        const result = await configuracoesAPI.update(editId, form);
        if (!result.success) {
          setError(result.error || 'Erro ao atualizar configuração');
          return;
        }
      } else {
        const result = await configuracoesAPI.create(form as any);
        if (!result.success) {
          setError(result.error || 'Erro ao criar configuração');
          return;
        }
      }
      
      setSaving(false);
      closeForm();
      fetchConfiguracoes();
    } catch (error) {
      setError('Erro inesperado ao salvar configuração');
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm('Deseja realmente excluir esta configuração?')) {
      try {
        const result = await configuracoesAPI.delete(id);
        if (result.success) {
          fetchConfiguracoes();
        } else {
          setError(result.error || 'Erro ao excluir configuração');
        }
      } catch (error) {
        setError('Erro inesperado ao excluir configuração');
        console.error('Erro ao excluir configuração:', error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Configurações do Sistema</h1>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => openForm()}>Nova Configuração</button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Chave</th>
                <th className="p-2 text-left">Valor</th>
                <th className="p-2 text-left">Tipo</th>
                <th className="p-2 text-left">Categoria</th>
                <th className="p-2 text-left">Editável</th>
                <th className="p-2 text-left">Ativo</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {configuracoes.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2 font-mono text-sm">{c.chave}</td>
                  <td className="p-2">{c.valor}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {c.tipo || 'string'}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {c.categoria || '-'}
                    </span>
                  </td>
                  <td className="p-2">
                    {c.editavel ? '✓' : '✗'}
                  </td>
                  <td className="p-2">
                    {c.ativo ? (
                      <span className="text-green-600">●</span>
                    ) : (
                      <span className="text-gray-400">●</span>
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="text-blue-600 hover:underline disabled:text-gray-400"
                      onClick={() => openForm(c)}
                      disabled={!c.editavel}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline disabled:text-gray-400"
                      onClick={() => handleDelete(c.id)}
                      disabled={!c.editavel}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Modal de Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]" onSubmit={handleSave}>
              <h2 className="text-lg font-semibold mb-4">{editId ? 'Editar Configuração' : 'Nova Configuração'}</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Chave *</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full font-mono text-sm"
                  placeholder="app.nome"
                  required
                  value={form.chave || ''}
                  onChange={e => setForm(f => ({ ...f, chave: e.target.value }))}
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Valor *</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  placeholder="EcoField"
                  required
                  value={form.valor || ''}
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Descrição da configuração"
                  rows={2}
                  value={form.descricao || ''}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={form.tipo || 'string'}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={form.categoria || 'sistema'}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  >
                    <option value="sistema">Sistema</option>
                    <option value="notificacoes">Notificações</option>
                    <option value="email">Email</option>
                    <option value="backup">Backup</option>
                    <option value="integracao">Integração</option>
                    <option value="seguranca">Segurança</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editavel"
                    className="mr-2 w-4 h-4"
                    checked={form.editavel ?? true}
                    onChange={e => setForm(f => ({ ...f, editavel: e.target.checked }))}
                  />
                  <label htmlFor="editavel" className="text-sm">Editável</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    className="mr-2 w-4 h-4"
                    checked={form.ativo ?? true}
                    onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                  />
                  <label htmlFor="ativo" className="text-sm">Ativo</label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-4 py-2 rounded" 
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button 
                  type="button" 
                  className="bg-gray-300 px-4 py-2 rounded" 
                  onClick={closeForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrudConfiguracoes; 