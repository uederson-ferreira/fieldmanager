// ===================================================================
// API DE ÁREAS - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/areas.ts
// ===================================================================

import express from 'express';
import { supabase, supabaseAdmin } from '../supabase';
import type { Request, Response } from 'express';

const router = express.Router();

// Middleware para autenticação
const authenticateUser = async (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AREAS API] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Listar áreas
router.get('/areas', authenticateUser, async (req: Request, res: Response) => {
  try {
    console.log('📋 [AREAS API] Listando áreas');

    if (!supabaseAdmin) {
      console.error('❌ [AREAS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('areas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('❌ [AREAS API] Erro ao listar áreas:', error);
      return res.status(500).json({ error: 'Erro ao listar áreas' });
    }

    console.log('✅ [AREAS API] Áreas listadas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar área por ID
router.get('/areas/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🔍 [AREAS API] Buscando área:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [AREAS API] Erro ao buscar área:', error);
      return res.status(500).json({ error: 'Erro ao buscar área' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    console.log('✅ [AREAS API] Área encontrada:', data.id);
    res.json(data);
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova área
router.post('/areas', authenticateUser, async (req: Request, res: Response) => {
  try {
    const areaData = req.body;

    console.log('➕ [AREAS API] Criando nova área');

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('areas')
      .insert(areaData)
      .select()
      .single();

    if (error) {
      console.error('❌ [AREAS API] Erro ao criar área:', error);
      return res.status(500).json({ error: 'Erro ao criar área' });
    }

    console.log('✅ [AREAS API] Área criada:', data.id);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar área (rota alternativa para compatibilidade)
router.post('/criar-area', async (req: Request, res: Response) => {
  try {
    const { nome, descricao, localizacao, ativa } = req.body;
    console.log('➕ [AREAS API] Criando nova área:', nome);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('areas')
      .insert({
        nome,
        descricao,
        localizacao,
        ativa: ativa !== undefined ? ativa : true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [AREAS API] Erro ao criar área:', error);
      return res.status(500).json({ error: 'Erro ao criar área' });
    }

    console.log('✅ [AREAS API] Área criada:', data.nome);
    res.status(201).json({ area: data });
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar área
router.put('/areas/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const areaData = req.body;

    console.log('✏️ [AREAS API] Atualizando área:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('areas')
      .update(areaData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [AREAS API] Erro ao atualizar área:', error);
      return res.status(500).json({ error: 'Erro ao atualizar área' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    console.log('✅ [AREAS API] Área atualizada:', data.id);
    res.json(data);
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar área (rota alternativa para compatibilidade)
router.put('/atualizar-area/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, localizacao, ativa } = req.body;
    console.log('✏️ [AREAS API] Atualizando área:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (localizacao !== undefined) updateData.localizacao = localizacao;
    if (ativa !== undefined) updateData.ativa = ativa;

    const { data, error } = await supabaseAdmin
      .from('areas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [AREAS API] Erro ao atualizar área:', error);
      return res.status(500).json({ error: 'Erro ao atualizar área' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    console.log('✅ [AREAS API] Área atualizada:', data.nome);
    res.json({ area: data });
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir área
router.delete('/areas/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🗑️ [AREAS API] Excluindo área:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { error } = await supabaseAdmin
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [AREAS API] Erro ao excluir área:', error);
      return res.status(500).json({ error: 'Erro ao excluir área' });
    }

    console.log('✅ [AREAS API] Área excluída:', id);
    res.status(204).send();
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir área (rota alternativa para compatibilidade)
router.delete('/deletar-area/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('🗑️ [AREAS API] Deletando área:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { error } = await supabaseAdmin
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [AREAS API] Erro ao deletar área:', error);
      return res.status(500).json({ error: 'Erro ao deletar área' });
    }

    console.log('✅ [AREAS API] Área deletada:', id);
    res.status(200).json({ message: 'Área deletada com sucesso' });
  } catch (error) {
    console.error('❌ [AREAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 