import React, { useEffect, useState } from 'react';
import { perfisAPI, type Perfil } from '../../lib/perfisAPI';

const initialForm: Partial<Perfil> = {
  nome: '',
  descricao: '',
  ativo: true,
  permissoes: {
    lvs: [],
    termos: [],
    rotinas: [],
    metas: [],
    fotos: [],
    relatorios: [],
    usuarios: [],
    perfis: [],
    sistema: [],
    admin: false,
    demo: false
  }
};

const CrudPerfis: React.FC = () => {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Perfil>>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerfis();
  }, []);

  async function fetchPerfis() {
    setLoading(true);
    setError(null);
    
    try {
      const result = await perfisAPI.list();
      if (result.success && result.data) {
        setPerfis(result.data);
      } else {
        setError(result.error || 'Erro ao carregar perfis');
      }
    } catch (error) {
      setError('Erro inesperado ao carregar perfis');
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
  }

  function openForm(perfil?: Perfil) {
    setForm(perfil ? { ...perfil } : initialForm);
    setEditId(perfil ? perfil.id : null);
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
        const result = await perfisAPI.update(editId, form);
        if (!result.success) {
          setError(result.error || 'Erro ao atualizar perfil');
          return;
        }
      } else {
        const result = await perfisAPI.create(form as any);
        if (!result.success) {
          setError(result.error || 'Erro ao criar perfil');
          return;
        }
      }
      
      setSaving(false);
      closeForm();
      fetchPerfis();
    } catch (error) {
      setError('Erro inesperado ao salvar perfil');
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm('Deseja realmente excluir este perfil?')) {
      try {
        const result = await perfisAPI.delete(id);
        if (result.success) {
          fetchPerfis();
        } else {
          setError(result.error || 'Erro ao excluir perfil');
        }
      } catch (error) {
        setError('Erro inesperado ao excluir perfil');
        console.error('Erro ao excluir perfil:', error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-green-50 overflow-x-hidden w-full">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Perfis de Usuário</h1>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => openForm()}>Novo Perfil</button>
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
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Descrição</th>
                <th className="p-2 text-left">Ativo</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {perfis.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.nome}</td>
                  <td className="p-2">{p.descricao || '-'}</td>
                  <td className="p-2">{p.ativo ? 'Sim' : 'Não'}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-600" onClick={() => openForm(p)}>Editar</button>
                    <button className="text-red-600" onClick={() => handleDelete(p.id)}>Excluir</button>
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
              <h2 className="text-lg font-semibold mb-4">{editId ? 'Editar Perfil' : 'Novo Perfil'}</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="mb-2">
                <label className="block text-sm">Nome</label>
                <input 
                  type="text" 
                  className="border rounded px-2 py-1 w-full" 
                  required 
                  value={form.nome || ''} 
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} 
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Descrição</label>
                <input 
                  type="text" 
                  className="border rounded px-2 py-1 w-full" 
                  value={form.descricao || ''} 
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} 
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Ativo</label>
                <select 
                  className="border rounded px-2 py-1 w-full" 
                  value={form.ativo ? 'true' : 'false'} 
                  onChange={e => setForm(f => ({ ...f, ativo: e.target.value === 'true' }))}
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
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

export default CrudPerfis; 