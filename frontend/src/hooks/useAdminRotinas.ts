import { useState, useEffect, useCallback } from 'react';
import { rotinasAPI } from '../lib/rotinasAPI';
import type { Rotina, RotinaCreateData } from '../lib/rotinasAPI';

interface UseAdminRotinasReturn {
  // Estado
  rotinas: Rotina[];
  loading: boolean;
  error: string | null;
  showForm: boolean;
  form: Partial<Rotina>;
  editId: string | null;
  saving: boolean;
  
  // Ações
  fetchRotinas: () => Promise<void>;
  openForm: (rotina?: Rotina) => void;
  closeForm: () => void;
  handleSave: (e: React.FormEvent) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setForm: (form: Partial<Rotina>) => void;
  clearError: () => void;
}

const initialForm: Partial<Rotina> = {
  data_atividade: '',
  area_id: '',
  atividade: '',
  descricao: '',
  tma_responsavel_id: '',
  encarregado_id: '',
  status: '',
};

export const useAdminRotinas = (): UseAdminRotinasReturn => {
  // Estados
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setFormState] = useState<Partial<Rotina>>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Buscar rotinas
  const fetchRotinas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rotinasAPI.list();
      if (result.success && result.data) {
        setRotinas(result.data);
      } else {
        console.error('❌ [ADMIN ROTINAS] Erro ao carregar rotinas:', result.error);
        setError(result.error || 'Erro ao carregar rotinas');
      }
    } catch (error: any) {
      console.error('❌ [ADMIN ROTINAS] Erro inesperado:', error);
      setError('Erro inesperado ao carregar rotinas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Abrir formulário
  const openForm = useCallback((rotina?: Rotina) => {
    setFormState(rotina ? { ...rotina } : initialForm);
    setEditId(rotina ? rotina.id : null);
    setShowForm(true);
    setError(null);
  }, []);

  // Fechar formulário
  const closeForm = useCallback(() => {
    setShowForm(false);
    setFormState(initialForm);
    setEditId(null);
    setError(null);
  }, []);

  // Salvar rotina
  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      if (editId) {
        const result = await rotinasAPI.update(editId, form);
        if (!result.success) {
          setError(result.error || 'Erro ao atualizar rotina');
          return;
        }
      } else {
        const result = await rotinasAPI.create(form as RotinaCreateData);
        if (!result.success) {
          setError(result.error || 'Erro ao criar rotina');
          return;
        }
      }
      
      setSaving(false);
      closeForm();
      await fetchRotinas();
    } catch (error: any) {
      console.error('❌ [ADMIN ROTINAS] Erro ao salvar rotina:', error);
      setError('Erro inesperado ao salvar rotina');
    } finally {
      setSaving(false);
    }
  }, [editId, form, closeForm, fetchRotinas]);

  // Excluir rotina
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta rotina?')) {
      return;
    }

    try {
      setError(null);
      const result = await rotinasAPI.delete(id);
      
      if (result.success) {
        await fetchRotinas();
      } else {
        setError(result.error || 'Erro ao excluir rotina');
      }
    } catch (error: any) {
      console.error('❌ [ADMIN ROTINAS] Erro ao excluir rotina:', error);
      setError('Erro inesperado ao excluir rotina');
    }
  }, [fetchRotinas]);

  // Atualizar formulário
  const setForm = useCallback((novoForm: Partial<Rotina>) => {
    setFormState(prev => ({ ...prev, ...novoForm }));
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efeito inicial
  useEffect(() => {
    fetchRotinas();
  }, [fetchRotinas]);

  return {
    // Estado
    rotinas,
    loading,
    error,
    showForm,
    form,
    editId,
    saving,
    
    // Ações
    fetchRotinas,
    openForm,
    closeForm,
    handleSave,
    handleDelete,
    setForm,
    clearError
  };
}; 