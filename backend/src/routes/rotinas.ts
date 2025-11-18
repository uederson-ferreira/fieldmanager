// ===================================================================
// API DE ROTINAS - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/rotinas.ts
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
    console.error('❌ [ROTINAS API] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Listar rotinas
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('📋 [ROTINAS API] Listando rotinas');

    if (!supabaseAdmin) {
      console.error('❌ [ROTINAS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar perfil do usuário para verificar se é admin
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    if (userError) {
      console.error('❌ [ROTINAS API] Erro ao buscar usuário:', userError);
    }

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';
    const isAdminOrSup = isAdmin || isSupervisor;

    console.log('🔐 [ROTINAS API] Perfil:', perfil?.nome, '| Admin?', isAdmin, '| Supervisor?', isSupervisor);

    let query = supabaseAdmin
      .from('atividades_rotina')
      .select('*')
      .order('created_at', { ascending: false });

    // Admin/Supervisor veem todas, Técnico vê só as suas
    if (!isAdminOrSup) {
      query = query.eq('auth_user_id', user?.id || '');
      console.log('🔒 [ROTINAS API] Filtrando por auth_user_id (técnico)');
    } else {
      console.log('🔓 [ROTINAS API] Admin/Supervisor - retornando todas as rotinas');
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [ROTINAS API] Erro ao listar rotinas:', error);
      return res.status(500).json({ error: 'Erro ao listar rotinas' });
    }

    console.log('✅ [ROTINAS API] Rotinas listadas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [ROTINAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar rotina por ID
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 [ROTINAS API] Buscando rotina:', id);
    
    const { data, error } = await supabase
      .from('atividades_rotina')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('❌ [ROTINAS API] Erro ao buscar rotina:', error);
      return res.status(500).json({ error: 'Erro ao buscar rotina' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Rotina não encontrada' });
    }
    
    console.log('✅ [ROTINAS API] Rotina encontrada:', data.id);
    res.json(data);
  } catch (error) {
    console.error('❌ [ROTINAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova rotina
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const rotinaData = req.body;
    
    console.log('➕ [ROTINAS API] Criando nova rotina');
    console.log('📊 [ROTINAS API] Dados recebidos:', JSON.stringify(rotinaData, null, 2));
    
    const { data, error } = await supabase
      .from('atividades_rotina')
      .insert(rotinaData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [ROTINAS API] Erro detalhado do Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        dados: rotinaData
      });
      return res.status(500).json({ error: 'Erro ao criar rotina', details: error.message });
    }
    
    console.log('✅ [ROTINAS API] Rotina criada:', data.id);
    res.json(data);
  } catch (error) {
    console.error('❌ [ROTINAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar rotina
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rotinaData = req.body;
    
    console.log('✏️ [ROTINAS API] Atualizando rotina:', id);
    
    const { data, error } = await supabase
      .from('atividades_rotina')
      .update(rotinaData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [ROTINAS API] Erro ao atualizar rotina:', error);
      return res.status(500).json({ error: 'Erro ao atualizar rotina' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Rotina não encontrada' });
    }
    
    console.log('✅ [ROTINAS API] Rotina atualizada:', data.id);
    res.json(data);
  } catch (error) {
    console.error('❌ [ROTINAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar fotos da rotina
router.get('/:id/fotos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('📸 [ROTINAS API] Buscando fotos da rotina:', id);
    
    const { data, error } = await supabase
      .from('fotos_rotina')
      .select('*')
      .eq('atividade_id', id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [ROTINAS API] Erro ao buscar fotos:', error);
      return res.status(500).json({ error: 'Erro ao buscar fotos da rotina' });
    }
    
    console.log('✅ [ROTINAS API] Fotos encontradas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [ROTINAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar fotos da rotina
router.post('/:id/fotos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { fotos } = req.body;

    console.log('📸 [ROTINAS API] Salvando fotos da rotina:', id);
    console.log('📸 [ROTINAS API] User ID:', user?.id);

    if (!supabaseAdmin) {
      console.error('❌ [ROTINAS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se a rotina existe e pertence ao usuário
    const { data: existingRotina, error: checkError } = await supabaseAdmin
      .from('atividades_rotina')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingRotina) {
      console.error('❌ [ROTINAS API] Rotina não encontrada ou não autorizada');
      return res.status(404).json({ error: 'Rotina não encontrada' });
    }

    if (!fotos || !Array.isArray(fotos)) {
      return res.status(400).json({ error: 'Fotos inválidas' });
    }

    // Preparar fotos para inserção
    const fotosParaSalvar = fotos.map((foto: Record<string, unknown>) => ({
      atividade_id: id,
      nome_arquivo: foto.nome_arquivo,
      url_arquivo: foto.url_arquivo,
      descricao: foto.descricao || '',
      latitude: foto.latitude,
      longitude: foto.longitude,
      created_at: new Date().toISOString()
    }));

    // Salvar fotos
    const { data, error } = await supabaseAdmin
      .from('fotos_rotina')
      .insert(fotosParaSalvar)
      .select();

    if (error) {
      console.error('❌ [ROTINAS API] Erro ao salvar fotos:', error);
      return res.status(500).json({ error: 'Erro ao salvar fotos da rotina' });
    }

    console.log('✅ [ROTINAS API] Fotos salvas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [ROTINAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir rotina
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ [ROTINAS API] Excluindo rotina:', id);
    
    const { error } = await supabase
      .from('atividades_rotina')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ [ROTINAS API] Erro ao excluir rotina:', error);
      return res.status(500).json({ error: 'Erro ao excluir rotina' });
    }
    
    console.log('✅ [ROTINAS API] Rotina excluída:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [ROTINAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 