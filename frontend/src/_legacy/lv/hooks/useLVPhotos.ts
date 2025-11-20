// ===================================================================
// HOOK ESPECIALIZADO PARA FOTOS DE LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/hooks/useLVPhotos.ts
// ===================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { lvAPI } from '../../../lib/lvAPI';
import type { LVFoto } from '../types/lv';

export function useLVPhotos(lvId: string) {
  const [fotos, setFotos] = useState<LVFoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar fotos existentes
  const carregarFotos = useCallback(async () => {
    if (!lvId || lvId === 'temp') return;
    
    try {
      setLoading(true);
      const response = await lvAPI.buscarFotos(lvId);
      if (response.success && response.data) {
        setFotos(response.data);
      } else {
        setFotos([]);
      }
    } catch (err) {
      console.error('❌ [useLVPhotos] Erro ao carregar fotos:', err);
      setError('Erro ao carregar fotos');
      setFotos([]);
    } finally {
      setLoading(false);
    }
  }, [lvId]);

  // Capturar foto (abrir seletor de arquivo)
  const capturarFoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Processar foto selecionada
  const processarFoto = useCallback(async (file: File) => {
    if (!lvId || lvId === 'temp') return;
    
    try {
      setLoading(true);
      const response = await lvAPI.salvarFotosLV(lvId, [file]);
      if (response.success && response.data) {
        setFotos(prev => [...prev, ...(response.data || [])]);
      }
    } catch (err) {
      console.error('❌ [useLVPhotos] Erro ao salvar foto:', err);
      setError('Erro ao salvar foto');
    } finally {
      setLoading(false);
    }
  }, [lvId]);

  // Remover foto
  const removerFoto = useCallback(async (fotoId: string) => {
    if (!lvId || lvId === 'temp') return;

    try {
      setLoading(true);
      setError(null);

      // Excluir foto via API
      const response = await lvAPI.excluirFoto(lvId, fotoId);

      if (response.success) {
        // Remover do estado local após exclusão bem-sucedida
        setFotos(prev => prev.filter(f => f.id !== fotoId));
        console.log('✅ [useLVPhotos] Foto removida com sucesso');
      } else {
        throw new Error(response.error || 'Erro ao excluir foto');
      }
    } catch (err) {
      console.error('❌ [useLVPhotos] Erro ao remover foto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover foto');
    } finally {
      setLoading(false);
    }
  }, [lvId]);

  // Carregar fotos ao montar componente
  useEffect(() => {
    carregarFotos();
  }, [carregarFotos]);

  return {
    fotos,
    loading,
    error,
    fileInputRef,
    capturarFoto,
    processarFoto,
    removerFoto,
    carregarFotos
  };
} 