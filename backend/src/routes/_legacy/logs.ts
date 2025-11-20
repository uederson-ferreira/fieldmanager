// ===================================================================
// API DE LOGS - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/logs.ts
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
    console.error('❌ [LOGS API] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Listar logs
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { page = 1, limit = 50, nivel, usuario, data_inicio, data_fim } = req.query;

    console.log('🔍 [LOGS API] Listando logs');

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    let query = supabaseAdmin
      .from('logs')
      .select('*')
      .order('data', { ascending: false });

    // Aplicar filtros
    if (nivel) {
      query = query.eq('nivel', nivel);
    }

    if (usuario) {
      query = query.eq('usuario', usuario);
    }

    if (data_inicio) {
      query = query.gte('data', data_inicio);
    }

    if (data_fim) {
      query = query.lte('data', data_fim);
    }

    // Aplicar paginação
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ [LOGS API] Erro ao buscar logs:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    console.log('✅ [LOGS API] Logs encontrados:', data?.length || 0);
    res.json({
      logs: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: data?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ [LOGS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar log específico
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🔍 [LOGS API] Buscando log:', id);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [LOGS API] Erro ao buscar log:', error);
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    console.log('✅ [LOGS API] Log encontrado:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [LOGS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar log
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const logData = req.body;

    console.log('📝 [LOGS API] Criando log:', logData);

    // Validar dados obrigatórios
    if (!logData.mensagem || !logData.nivel) {
      return res.status(400).json({ error: 'Mensagem e nível são obrigatórios' });
    }

    // Preparar dados para inserção
    const novoLog = {
      ...logData,
      usuario: user?.email || 'unknown',
      data: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('logs')
      .insert(novoLog)
      .select()
      .single();

    if (error) {
      console.error('❌ [LOGS API] Erro ao criar log:', error);
      return res.status(500).json({ error: 'Erro ao criar log' });
    }

    console.log('✅ [LOGS API] Log criado:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ [LOGS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir log
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🗑️ [LOGS API] Excluindo log:', id);

    // Verificar se o log existe
    const { data: existingLog, error: fetchError } = await supabase
      .from('logs')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingLog) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    // Excluir log
    const { error } = await supabase
      .from('logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [LOGS API] Erro ao excluir log:', error);
      return res.status(500).json({ error: 'Erro ao excluir log' });
    }

    console.log('✅ [LOGS API] Log excluído:', id);
    res.status(204).send();
  } catch (error) {
    console.error('❌ [LOGS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Limpar logs antigos
router.delete('/limpar/antigos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { dias = 30 } = req.query;

    console.log('🗑️ [LOGS API] Limpando logs antigos (mais de', dias, 'dias)');

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - Number(dias));

    const { error } = await supabase
      .from('logs')
      .delete()
      .lt('data', dataLimite.toISOString());

    if (error) {
      console.error('❌ [LOGS API] Erro ao limpar logs:', error);
      return res.status(500).json({ error: 'Erro ao limpar logs' });
    }

    console.log('✅ [LOGS API] Logs antigos limpos');
    res.json({ message: 'Logs antigos limpos com sucesso' });
  } catch (error) {
    console.error('❌ [LOGS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 