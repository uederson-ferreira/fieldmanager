// ===================================================================
// API DE CATEGORIAS LV - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/categorias.ts
// ===================================================================

import express from 'express';
import { supabase, supabaseAdmin } from '../supabase';
import { authenticateUser } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = express.Router();

// Listar categorias LV
router.get('/lv', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    console.log('🔍 [CATEGORIAS API] Buscando categorias LV');

    if (!supabaseAdmin) {
      console.error('❌ [CATEGORIAS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('categorias_lv')
      .select('*')
      .order('nome');

    if (error) {
      console.error('❌ [CATEGORIAS API] Erro ao buscar categorias:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    console.log('✅ [CATEGORIAS API] Categorias encontradas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as categorias
router.get('/categorias', async (req: Request, res: Response) => {
  try {
    console.log('📋 [CATEGORIAS API] Listando todas as categorias');

    if (!supabaseAdmin) {
      console.error('❌ [CATEGORIAS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('categorias_lv')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      console.error('❌ [CATEGORIAS API] Erro ao listar categorias:', error);
      return res.status(500).json({ error: 'Erro ao listar categorias' });
    }

    console.log('✅ [CATEGORIAS API] Categorias listadas:', data?.length || 0);
    res.json({ categorias: data || [] });
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar categoria por ID
router.get('/categoria/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('🔍 [CATEGORIAS API] Buscando categoria:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('categorias_lv')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [CATEGORIAS API] Erro ao buscar categoria:', error);
      return res.status(500).json({ error: 'Erro ao buscar categoria' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    console.log('✅ [CATEGORIAS API] Categoria encontrada:', data.nome);
    res.json({ categoria: data });
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova categoria
router.post('/criar-categoria', async (req: Request, res: Response) => {
  try {
    const { codigo, nome, descricao, ordem, ativa } = req.body;
    console.log('➕ [CATEGORIAS API] Criando nova categoria:', nome);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('categorias_lv')
      .insert({
        codigo,
        nome,
        descricao,
        ordem: ordem || 1,
        ativa: ativa !== undefined ? ativa : true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [CATEGORIAS API] Erro ao criar categoria:', error);
      return res.status(500).json({ error: 'Erro ao criar categoria' });
    }

    console.log('✅ [CATEGORIAS API] Categoria criada:', data.nome);
    res.status(201).json({ categoria: data });
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar categoria
router.put('/atualizar-categoria/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { codigo, nome, descricao, ordem, ativa } = req.body;
    console.log('✏️ [CATEGORIAS API] Atualizando categoria:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const updateData: any = {};
    if (codigo !== undefined) updateData.codigo = codigo;
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (ordem !== undefined) updateData.ordem = ordem;
    if (ativa !== undefined) updateData.ativa = ativa;

    const { data, error } = await supabaseAdmin
      .from('categorias_lv')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [CATEGORIAS API] Erro ao atualizar categoria:', error);
      return res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    console.log('✅ [CATEGORIAS API] Categoria atualizada:', data.nome);
    res.json({ categoria: data });
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar categoria
router.delete('/deletar-categoria/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('🗑️ [CATEGORIAS API] Deletando categoria:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { error } = await supabaseAdmin
      .from('categorias_lv')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [CATEGORIAS API] Erro ao deletar categoria:', error);
      return res.status(500).json({ error: 'Erro ao deletar categoria' });
    }

    console.log('✅ [CATEGORIAS API] Categoria deletada:', id);
    res.status(200).json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Reordenar categorias
router.put('/reordenar-categorias', async (req: Request, res: Response) => {
  try {
    const { categorias } = req.body;
    console.log('🔄 [CATEGORIAS API] Reordenando categorias:', categorias.length);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Atualizar cada categoria
    for (const cat of categorias) {
      await supabaseAdmin
        .from('categorias_lv')
        .update({ ordem: cat.ordem })
        .eq('id', cat.id);
    }

    console.log('✅ [CATEGORIAS API] Categorias reordenadas');
    res.json({ message: 'Categorias reordenadas com sucesso' });
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar categorias por nome
router.get('/buscar-categorias', async (req: Request, res: Response) => {
  try {
    const { nome } = req.query;
    console.log('🔍 [CATEGORIAS API] Buscando categorias com nome:', nome);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('categorias_lv')
      .select('*')
      .ilike('nome', `%${nome}%`)
      .order('ordem', { ascending: true });

    if (error) {
      console.error('❌ [CATEGORIAS API] Erro ao buscar categorias:', error);
      return res.status(500).json({ error: 'Erro ao buscar categorias' });
    }

    console.log('✅ [CATEGORIAS API] Categorias encontradas:', data?.length || 0);
    res.json({ categorias: data || [] });
  } catch (error) {
    console.error('❌ [CATEGORIAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
