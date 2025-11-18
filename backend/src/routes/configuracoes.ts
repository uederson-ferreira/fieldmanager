// ===================================================================
// API DE CONFIGURAÇÕES - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/configuracoes.ts
// ===================================================================

import express from 'express';
import { supabase } from '../supabase';
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
    console.error('❌ [CONFIGURAÇÕES API] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Listar configurações
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('🔍 [CONFIGURAÇÕES API] Listando configurações');

    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .order('chave', { ascending: true });

    if (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar configurações:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    console.log('✅ [CONFIGURAÇÕES API] Configurações encontradas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [CONFIGURAÇÕES API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar configuração específica
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🔍 [CONFIGURAÇÕES API] Buscando configuração:', id);

    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar configuração:', error);
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    console.log('✅ [CONFIGURAÇÕES API] Configuração encontrada:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [CONFIGURAÇÕES API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar configuração
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const configData = req.body;

    console.log('📝 [CONFIGURAÇÕES API] Criando configuração:', configData);

    // Validar dados obrigatórios
    if (!configData.chave || !configData.valor) {
      return res.status(400).json({ error: 'Chave e valor são obrigatórios' });
    }

    // Preparar dados para inserção
    const novaConfig = {
      ...configData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('configuracoes')
      .insert(novaConfig)
      .select()
      .single();

    if (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao criar configuração:', error);
      return res.status(500).json({ error: 'Erro ao criar configuração' });
    }

    console.log('✅ [CONFIGURAÇÕES API] Configuração criada:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ [CONFIGURAÇÕES API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configuração
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const configData = req.body;

    console.log('📝 [CONFIGURAÇÕES API] Atualizando configuração:', id, configData);

    // Verificar se a configuração existe
    const { data: existingConfig, error: fetchError } = await supabase
      .from('configuracoes')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingConfig) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Atualizar configuração
    const { data, error } = await supabase
      .from('configuracoes')
      .update({
        ...configData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao atualizar configuração:', error);
      return res.status(500).json({ error: 'Erro ao atualizar configuração' });
    }

    console.log('✅ [CONFIGURAÇÕES API] Configuração atualizada:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [CONFIGURAÇÕES API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir configuração
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🗑️ [CONFIGURAÇÕES API] Excluindo configuração:', id);

    // Verificar se a configuração existe
    const { data: existingConfig, error: fetchError } = await supabase
      .from('configuracoes')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingConfig) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Excluir configuração
    const { error } = await supabase
      .from('configuracoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [CONFIGURAÇÕES API] Erro ao excluir configuração:', error);
      return res.status(500).json({ error: 'Erro ao excluir configuração' });
    }

    console.log('✅ [CONFIGURAÇÕES API] Configuração excluída:', id);
    res.status(204).send();
  } catch (error) {
    console.error('❌ [CONFIGURAÇÕES API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =====================================================
// CONFIGURAÇÕES DINÂMICAS - Substituem código hardcoded
// Adicionado em: 04/01/2025
// =====================================================

/**
 * GET /api/configuracoes/dinamicas/all
 * Retorna TODAS as configurações dinâmicas em um único request
 * Útil para cache inicial da aplicação
 */
router.get('/dinamicas/all', async (req: Request, res: Response) => {
  try {
    console.log('🔍 [CONFIGURAÇÕES API] Buscando todas as configurações dinâmicas');

    const [
      termTypes,
      termStatus,
      severityLevels,
      deviationNature,
      lvEvaluationOptions,
      routineStatus,
      lvCriticalityLevels,
      lvInspectionTypes,
      wasteClassifications,
      lvValidationRules
    ] = await Promise.all([
      supabase.from('term_types').select('*').eq('active', true).order('display_order'),
      supabase.from('term_status').select('*').eq('active', true).order('display_order'),
      supabase.from('severity_levels').select('*').eq('active', true).order('priority', { ascending: false }),
      supabase.from('deviation_nature').select('*').eq('active', true).order('display_order'),
      supabase.from('lv_evaluation_options').select('*').eq('active', true).order('display_order'),
      supabase.from('routine_activity_status').select('*').eq('active', true).order('display_order'),
      supabase.from('lv_criticality_levels').select('*').eq('active', true).order('display_order'),
      supabase.from('lv_inspection_types').select('*').eq('active', true).order('display_order'),
      supabase.from('waste_classifications').select('*').eq('active', true).order('display_order'),
      supabase.from('lv_validation_rules').select('*').eq('active', true)
    ]);

    console.log('✅ [CONFIGURAÇÕES API] Configurações dinâmicas carregadas');

    res.json({
      termTypes: termTypes.data || [],
      termStatus: termStatus.data || [],
      severityLevels: severityLevels.data || [],
      deviationNature: deviationNature.data || [],
      lvEvaluationOptions: lvEvaluationOptions.data || [],
      routineStatus: routineStatus.data || [],
      lvCriticalityLevels: lvCriticalityLevels.data || [],
      lvInspectionTypes: lvInspectionTypes.data || [],
      wasteClassifications: wasteClassifications.data || [],
      lvValidationRules: lvValidationRules.data || []
    });
  } catch (error) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar configurações dinâmicas:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações dinâmicas' });
  }
});

/**
 * GET /api/configuracoes/dinamicas/term-types
 * Retorna tipos de termos ambientais
 */
router.get('/dinamicas/term-types', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('term_types')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar term_types:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/term-status
 * Retorna status de termos
 */
router.get('/dinamicas/term-status', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('term_status')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar term_status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/severity-levels
 * Retorna níveis de severidade
 */
router.get('/dinamicas/severity-levels', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('severity_levels')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar severity_levels:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/deviation-nature
 * Retorna naturezas de desvio
 */
router.get('/dinamicas/deviation-nature', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('deviation_nature')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar deviation_nature:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/lv-evaluation-options
 * Retorna opções de avaliação LV (C/NC/NA)
 */
router.get('/dinamicas/lv-evaluation-options', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('lv_evaluation_options')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar lv_evaluation_options:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/routine-status
 * Retorna status de atividades de rotina
 */
router.get('/dinamicas/routine-status', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('routine_activity_status')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar routine_status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/lv-criticality-levels
 * Retorna níveis de criticidade LV
 */
router.get('/dinamicas/lv-criticality-levels', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('lv_criticality_levels')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar lv_criticality_levels:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/lv-inspection-types
 * Retorna tipos de inspeção LV
 */
router.get('/dinamicas/lv-inspection-types', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('lv_inspection_types')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar lv_inspection_types:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/waste-classifications
 * Retorna classificações de resíduos
 */
router.get('/dinamicas/waste-classifications', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('waste_classifications')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar waste_classifications:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/lv-validation-rules
 * Retorna regras de validação LV
 */
router.get('/dinamicas/lv-validation-rules', async (req: Request, res: Response) => {
  try {
    const { entity_type } = req.query;

    let query = supabase
      .from('lv_validation_rules')
      .select('*')
      .eq('active', true);

    if (entity_type) {
      query = query.or(`entity_type.eq.${entity_type},entity_type.is.null`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar lv_validation_rules:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/configuracoes/dinamicas/term-status/:id/transitions
 * Retorna transições permitidas para um status de termo
 */
router.get('/dinamicas/term-status/:id/transitions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('term_status_transitions')
      .select(`
        *,
        to_status:to_status_id (
          id,
          code,
          name,
          color,
          icon
        )
      `)
      .eq('from_status_id', id)
      .eq('active', true);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('❌ [CONFIGURAÇÕES API] Erro ao buscar transições:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 