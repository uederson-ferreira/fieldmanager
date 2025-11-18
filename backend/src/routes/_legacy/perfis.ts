// ===================================================================
// ROTAS DE PERFIS - ECOFIELD SYSTEM
// Localização: src/routes/perfis.ts
// ===================================================================

import express from 'express';
import { supabase } from '../supabase';

const perfisRouter = express.Router();

// ===================================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ===================================================================

const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar dados do usuário na tabela usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (usuarioError || !usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Adicionar dados do usuário ao request
    (req as any).user = usuario;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================================================
// ROTAS
// ===================================================================

// GET /api/perfis - Listar todos os perfis
perfisRouter.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: perfis, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('Erro ao buscar perfis:', error);
      return res.status(500).json({ error: 'Erro ao buscar perfis' });
    }

    res.json({ perfis: perfis || [] });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/perfis/:id - Buscar perfil específico
perfisRouter.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: perfil, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !perfil) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    res.json({ perfil });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/perfis - Criar novo perfil
perfisRouter.post('/', authenticateUser, async (req, res) => {
  try {
    const { nome, descricao, permissoes } = req.body;

    if (!nome || !descricao) {
      return res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
    }

    const { data: perfil, error } = await supabase
      .from('perfis')
      .insert({
        nome,
        descricao,
        permissoes: permissoes || {},
        ativo: true
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return res.status(500).json({ error: 'Erro ao criar perfil' });
    }

    res.status(201).json({ perfil });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/perfis/:id - Atualizar perfil
perfisRouter.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, permissoes, ativo } = req.body;

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (permissoes !== undefined) updateData.permissoes = permissoes;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data: perfil, error } = await supabase
      .from('perfis')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !perfil) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    res.json({ perfil });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/perfis/:id - Deletar perfil
perfisRouter.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há usuários usando este perfil
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('perfil_id', id);

    if (usuariosError) {
      console.error('Erro ao verificar usuários:', usuariosError);
      return res.status(500).json({ error: 'Erro ao verificar usuários' });
    }

    if (usuarios && usuarios.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar o perfil. Existem usuários associados a ele.' 
      });
    }

    const { error } = await supabase
      .from('perfis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar perfil:', error);
      return res.status(500).json({ error: 'Erro ao deletar perfil' });
    }

    res.json({ message: 'Perfil deletado com sucesso' });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/perfis/usuario/:userId - Buscar perfil do usuário
perfisRouter.get('/usuario/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar usuário com perfil
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        email,
        perfil_id,
        perfis (*)
      `)
      .eq('auth_user_id', userId)
      .single();

    if (usuarioError || !usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!usuario.perfil_id || !usuario.perfis) {
      return res.status(404).json({ error: 'Usuário sem perfil definido' });
    }

    const perfil = Array.isArray(usuario.perfis) ? usuario.perfis[0] : usuario.perfis;

    res.json({ perfil });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/perfis/aplicar - Aplicar perfil a um usuário
perfisRouter.post('/aplicar', authenticateUser, async (req, res) => {
  try {
    const { userId, perfilId } = req.body;

    if (!userId || !perfilId) {
      return res.status(400).json({ error: 'userId e perfilId são obrigatórios' });
    }

    // Verificar se o perfil existe
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('id')
      .eq('id', perfilId)
      .single();

    if (perfilError || !perfil) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }

    // Aplicar perfil ao usuário
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ perfil_id: perfilId })
      .eq('auth_user_id', userId);

    if (updateError) {
      console.error('Erro ao aplicar perfil:', updateError);
      return res.status(500).json({ error: 'Erro ao aplicar perfil' });
    }

    res.json({ message: 'Perfil aplicado com sucesso' });
  } catch (error) {
    console.error('Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default perfisRouter; 