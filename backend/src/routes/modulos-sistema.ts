import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ================================================================
// GET /api/modulos-sistema
// Retorna todos os módulos do sistema (templates)
// ================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, dominioId, template } = req.query;

    console.log('📋 [MODULOS] Buscando módulos');

    let query = supabase
      .from('modulos_sistema')
      .select(`
        *,
        dominios:dominio_id (
          id,
          codigo,
          nome,
          cor_primaria,
          icone
        )
      `)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    // Filtros opcionais
    if (dominioId) {
      query = query.eq('dominio_id', dominioId);
    }

    if (template === 'true') {
      query = query.eq('template', true);
    }

    if (tenantId) {
      query = query.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
    } else {
      query = query.is('tenant_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [MODULOS] Erro ao buscar:', error);
      return res.status(500).json({
        error: 'Erro ao buscar módulos',
        details: error.message
      });
    }

    console.log(`✅ [MODULOS] ${data.length} módulos encontrados`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [MODULOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/modulos-sistema/:id
// Retorna um módulo específico por ID
// ================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 [MODULOS] Buscando módulo: ${id}`);

    const { data, error } = await supabase
      .from('modulos_sistema')
      .select(`
        *,
        dominios:dominio_id (
          id,
          codigo,
          nome,
          cor_primaria,
          icone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }
      console.error('❌ [MODULOS] Erro ao buscar:', error);
      return res.status(500).json({
        error: 'Erro ao buscar módulo',
        details: error.message
      });
    }

    console.log(`✅ [MODULOS] Módulo encontrado: ${data.nome}`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [MODULOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/modulos-sistema/:id/perguntas
// Retorna todas as perguntas de um módulo específico
// ================================================================
router.get('/:id/perguntas', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoria } = req.query;

    console.log(`📋 [MODULOS] Buscando perguntas do módulo: ${id}`);
    if (categoria) {
      console.log(`   Filtrando por categoria: ${categoria}`);
    }

    let query = supabase
      .from('perguntas_modulos')
      .select('*')
      .eq('modulo_id', id)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [MODULOS] Erro ao buscar perguntas:', error);
      return res.status(500).json({
        error: 'Erro ao buscar perguntas',
        details: error.message
      });
    }

    console.log(`✅ [MODULOS] ${data.length} perguntas encontradas`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [MODULOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/modulos-sistema/:id/categorias
// Retorna categorias únicas das perguntas de um módulo
// ================================================================
router.get('/:id/categorias', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 [MODULOS] Buscando categorias do módulo: ${id}`);

    const { data, error } = await supabase
      .from('perguntas_modulos')
      .select('categoria')
      .eq('modulo_id', id)
      .eq('ativo', true)
      .not('categoria', 'is', null);

    if (error) {
      console.error('❌ [MODULOS] Erro ao buscar categorias:', error);
      return res.status(500).json({
        error: 'Erro ao buscar categorias',
        details: error.message
      });
    }

    // Extrair categorias únicas
    const categorias = [...new Set(data.map((p: any) => p.categoria))];

    console.log(`✅ [MODULOS] ${categorias.length} categorias encontradas`);
    return res.json(categorias);

  } catch (error: any) {
    console.error('❌ [MODULOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// POST /api/modulos-sistema
// Cria um novo módulo customizado para um tenant
// ================================================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      dominio_id,
      tenant_id,
      codigo,
      nome,
      descricao,
      tipo_modulo,
      configuracao,
      icone
    } = req.body;

    // Validações básicas
    if (!dominio_id || !codigo || !nome) {
      return res.status(400).json({
        error: 'Campos obrigatórios: dominio_id, codigo, nome'
      });
    }

    console.log(`📋 [MODULOS] Criando módulo: ${nome}`);

    const { data, error } = await supabase
      .from('modulos_sistema')
      .insert({
        dominio_id,
        tenant_id: tenant_id || null,
        codigo,
        nome,
        descricao,
        tipo_modulo: tipo_modulo || 'checklist',
        configuracao: configuracao || {},
        icone,
        template: !tenant_id, // Se não tem tenant, é template do sistema
        ativo: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [MODULOS] Erro ao criar:', error);
      return res.status(500).json({
        error: 'Erro ao criar módulo',
        details: error.message
      });
    }

    console.log(`✅ [MODULOS] Módulo criado: ${data.id}`);
    return res.status(201).json(data);

  } catch (error: any) {
    console.error('❌ [MODULOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// PUT /api/modulos-sistema/:id
// Atualiza um módulo existente
// ================================================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`📋 [MODULOS] Atualizando módulo: ${id}`);

    // Remover campos que não devem ser atualizados
    delete updates.id;
    delete updates.created_at;
    delete updates.dominios;

    const { data, error } = await supabase
      .from('modulos_sistema')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }
      console.error('❌ [MODULOS] Erro ao atualizar:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar módulo',
        details: error.message
      });
    }

    console.log(`✅ [MODULOS] Módulo atualizado`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [MODULOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// DELETE /api/modulos-sistema/:id
// Desativa um módulo (soft delete)
// ================================================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 [MODULOS] Desativando módulo: ${id}`);

    const { data, error } = await supabase
      .from('modulos_sistema')
      .update({ ativo: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Módulo não encontrado' });
      }
      console.error('❌ [MODULOS] Erro ao desativar:', error);
      return res.status(500).json({
        error: 'Erro ao desativar módulo',
        details: error.message
      });
    }

    console.log(`✅ [MODULOS] Módulo desativado`);
    return res.json({ message: 'Módulo desativado com sucesso', data });

  } catch (error: any) {
    console.error('❌ [MODULOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
