import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ================================================================
// GET /api/dominios
// Retorna todos os domínios disponíveis no sistema
// ================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('📋 [DOMINIOS] Buscando todos os domínios');

    const { data, error } = await supabase
      .from('dominios')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      console.error('❌ [DOMINIOS] Erro ao buscar:', error);
      return res.status(500).json({
        error: 'Erro ao buscar domínios',
        details: error.message
      });
    }

    console.log(`✅ [DOMINIOS] ${data.length} domínios encontrados`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [DOMINIOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/dominios/:id
// Retorna um domínio específico por ID
// ================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 [DOMINIOS] Buscando domínio: ${id}`);

    const { data, error } = await supabase
      .from('dominios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Domínio não encontrado' });
      }
      console.error('❌ [DOMINIOS] Erro ao buscar:', error);
      return res.status(500).json({
        error: 'Erro ao buscar domínio',
        details: error.message
      });
    }

    console.log(`✅ [DOMINIOS] Domínio encontrado: ${data.nome}`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [DOMINIOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/dominios/tenant/:tenantId/ativos
// Retorna domínios ativos para um tenant específico
// ================================================================
router.get('/tenant/:tenantId/ativos', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    console.log(`📋 [DOMINIOS] Buscando domínios ativos para tenant: ${tenantId}`);

    const { data, error } = await supabase
      .from('tenant_dominios')
      .select(`
        id,
        ativo,
        data_ativacao,
        configuracoes_especificas,
        dominios:dominio_id (
          id,
          codigo,
          nome,
          descricao,
          icone,
          cor_primaria,
          cor_secundaria,
          ordem
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .order('dominios(ordem)', { ascending: true });

    if (error) {
      console.error('❌ [DOMINIOS] Erro ao buscar:', error);
      return res.status(500).json({
        error: 'Erro ao buscar domínios do tenant',
        details: error.message
      });
    }

    // Transformar resposta para formato mais limpo
    const dominios = data.map((td: any) => ({
      ...td.dominios,
      tenant_dominio_id: td.id,
      data_ativacao: td.data_ativacao,
      configuracoes: td.configuracoes_especificas
    }));

    console.log(`✅ [DOMINIOS] ${dominios.length} domínios ativos para o tenant`);
    return res.json(dominios);

  } catch (error: any) {
    console.error('❌ [DOMINIOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/dominios/:dominioId/modulos
// Retorna módulos disponíveis para um domínio
// Inclui templates do sistema + módulos customizados do tenant
// ================================================================
router.get('/:dominioId/modulos', async (req: Request, res: Response) => {
  try {
    const { dominioId } = req.params;
    const { tenantId } = req.query;

    console.log(`📋 [DOMINIOS] Buscando módulos do domínio: ${dominioId}`);
    if (tenantId) {
      console.log(`   Incluindo módulos customizados do tenant: ${tenantId}`);
    }

    // Buscar templates do sistema + módulos do tenant
    let query = supabase
      .from('modulos_sistema')
      .select('*')
      .eq('dominio_id', dominioId)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    // Se tenantId fornecido, buscar templates (tenant_id = NULL) + módulos do tenant
    if (tenantId) {
      query = query.or(`tenant_id.is.null,tenant_id.eq.${tenantId}`);
    } else {
      // Sem tenant, buscar apenas templates do sistema
      query = query.is('tenant_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [DOMINIOS] Erro ao buscar módulos:', error);
      return res.status(500).json({
        error: 'Erro ao buscar módulos',
        details: error.message
      });
    }

    console.log(`✅ [DOMINIOS] ${data.length} módulos encontrados`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [DOMINIOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// POST /api/dominios/:dominioId/ativar-tenant
// Ativa um domínio para um tenant específico
// ================================================================
router.post('/:dominioId/ativar-tenant', async (req: Request, res: Response) => {
  try {
    const { dominioId } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId é obrigatório' });
    }

    console.log(`📋 [DOMINIOS] Ativando domínio ${dominioId} para tenant ${tenantId}`);

    const { data, error } = await supabase
      .from('tenant_dominios')
      .insert({
        tenant_id: tenantId,
        dominio_id: dominioId,
        ativo: true
      })
      .select()
      .single();

    if (error) {
      // Se já existe, apenas atualizar para ativo
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('tenant_dominios')
          .update({ ativo: true, data_ativacao: new Date().toISOString() })
          .eq('tenant_id', tenantId)
          .eq('dominio_id', dominioId)
          .select()
          .single();

        if (updateError) {
          console.error('❌ [DOMINIOS] Erro ao atualizar:', updateError);
          return res.status(500).json({
            error: 'Erro ao ativar domínio',
            details: updateError.message
          });
        }

        console.log(`✅ [DOMINIOS] Domínio reativado com sucesso`);
        return res.json(updated);
      }

      console.error('❌ [DOMINIOS] Erro ao ativar:', error);
      return res.status(500).json({
        error: 'Erro ao ativar domínio',
        details: error.message
      });
    }

    console.log(`✅ [DOMINIOS] Domínio ativado com sucesso`);
    return res.status(201).json(data);

  } catch (error: any) {
    console.error('❌ [DOMINIOS] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
