// ===================================================================
// API DE METAS - BACKEND ECOFIELD SYSTEM (REFATORADO COMPLETO)
// Localização: backend/src/routes/metas.ts
// Data: 2025-11-06
// ===================================================================

import express from 'express';
import { supabaseAdmin } from '../supabase';
import { authenticateUser } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = express.Router();

// Usar supabaseAdmin para bypasser RLS
const supabase = supabaseAdmin!;

// ===================================================================
// ROTAS PRINCIPAIS - CRUD DE METAS
// ===================================================================

/**
 * GET /api/metas - Listar todas as metas (com filtros)
 * Query params: tipo_meta, escopo, ativa, periodo, ano, mes
 */
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { tipo_meta, escopo, ativa, periodo, ano, mes } = req.query;
    const user = req.user;

    console.log('🔍 [METAS API] Listando metas - Request recebido');
    console.log('📋 [METAS API] Filtros:', { tipo_meta, escopo, ativa, periodo, ano, mes });
    console.log('👤 [METAS API] User auth_user_id:', user?.id);

    // Buscar perfil do usuário
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    if (userError) {
      console.error('❌ [METAS API] Erro ao buscar usuário:', userError);
    }

    console.log('👤 [METAS API] Usuário encontrado:', usuario);

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';
    const isAdminOrSup = isAdmin || isSupervisor;

    console.log('🔐 [METAS API] Perfil:', perfil?.nome, '| Admin?', isAdmin, '| Supervisor?', isSupervisor);

    let query = supabase
      .from('metas')
      .select(`
        *,
        metas_atribuicoes(
          id,
          tma_id,
          meta_quantidade_individual,
          responsavel,
          usuarios(id, nome, email, matricula, perfil_id, perfis(nome))
        ),
        progresso_metas(
          id,
          quantidade_atual,
          percentual_alcancado,
          status,
          ultima_atualizacao,
          tma_id
        )
      `)
      .order('created_at', { ascending: false });

    console.log('🔍 [METAS API] Query montada, executando...');

    // Admin/Supervisor veem todas, Técnico vê só as suas
    if (!isAdminOrSup) {
      const metasAtribuidasIds = await getMetasAtribuidasIds(user?.id);
      const filtrosOr: string[] = ['escopo.eq.equipe'];

      if (metasAtribuidasIds.length > 0) {
        const idsList = metasAtribuidasIds.map(id => `"${id}"`).join(',');
        filtrosOr.push(`id.in.(${idsList})`);
      }

      query = query.or(filtrosOr.join(','));
    }

    // Aplicar filtros
    if (tipo_meta) query = query.eq('tipo_meta', tipo_meta);
    if (escopo) query = query.eq('escopo', escopo);
    if (ativa !== undefined) query = query.eq('ativa', ativa === 'true');
    if (periodo) query = query.eq('periodo', periodo);
    if (ano) query = query.eq('ano', parseInt(ano as string));
    if (mes) query = query.eq('mes', parseInt(mes as string));

    const { data, error } = await query;

    if (error) {
      console.error('❌ [METAS API] Erro ao buscar metas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    console.log('✅ [METAS API] Metas encontradas:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📊 [METAS API] Primeira meta:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️ [METAS API] Nenhuma meta retornada pela query!');
    }

    res.json(data || []);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/metas/dashboard/resumo - Dashboard com resumo de metas
 */
router.get('/dashboard/resumo', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('📊 [METAS API] Buscando dashboard');

    // Buscar todas as metas ativas
    const { data: metas } = await supabase
      .from('metas')
      .select(`
        *,
        progresso_metas(quantidade_atual, percentual_alcancado, status)
      `)
      .eq('ativa', true);

    // Calcular estatísticas
    const dashboard = {
      total_metas: metas?.length || 0,
      metas_por_tipo: {
        lv: metas?.filter(m => m.tipo_meta === 'lv').length || 0,
        termo: metas?.filter(m => m.tipo_meta === 'termo').length || 0,
        rotina: metas?.filter(m => m.tipo_meta === 'rotina').length || 0
      },
      metas_por_escopo: {
        equipe: metas?.filter(m => m.escopo === 'equipe').length || 0,
        individual: metas?.filter(m => m.escopo === 'individual').length || 0
      },
      metas_por_status: {
        alcancada: 0,
        em_andamento: 0,
        nao_alcancada: 0,
        superada: 0
      }
    };

    // Contar status dos progressos
    metas?.forEach(meta => {
      const progresso = meta.progresso_metas?.[0];
      if (progresso?.status) {
        dashboard.metas_por_status[progresso.status as keyof typeof dashboard.metas_por_status]++;
      } else {
        dashboard.metas_por_status.em_andamento++;
      }
    });

    console.log('✅ [METAS API] Dashboard gerado:', dashboard);
    res.json(dashboard);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/metas/com-progresso-individual - Metas com progresso individual detalhado
 */
router.get('/com-progresso-individual', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('📈 [METAS API] Buscando metas com progresso individual');

    const { data, error } = await supabase
      .from('metas')
      .select(`
        *,
        metas_atribuicoes(
          id,
          tma_id,
          meta_quantidade_individual,
          usuarios(id, nome, email, matricula)
        ),
        progresso_metas(
          id,
          quantidade_atual,
          percentual_alcancado,
          status,
          ultima_atualizacao,
          tma_id
        )
      `)
      .eq('ativa', true)
      .eq('escopo', 'individual');

    if (error) {
      console.error('❌ [METAS API] Erro ao buscar metas:', error);
      return res.status(500).json({ error: 'Erro ao buscar metas' });
    }

    console.log('✅ [METAS API] Metas encontradas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/metas/:id - Buscar meta específica
 */
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🔍 [METAS API] Buscando meta:', id);

    const { data, error } = await supabase
      .from('metas')
      .select(`
        *,
        metas_atribuicoes(
          id,
          tma_id,
          meta_quantidade_individual,
          responsavel,
          usuarios(id, nome, email, matricula)
        ),
        progresso_metas(
          id,
          quantidade_atual,
          percentual_alcancado,
          status,
          ultima_atualizacao,
          tma_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [METAS API] Erro ao buscar meta:', error);
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    console.log('✅ [METAS API] Meta encontrada:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/metas - Criar nova meta
 */
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const metaData = req.body;

    console.log('📝 [METAS API] Criando meta:', metaData);

    // Validar campos obrigatórios
    if (!metaData.tipo_meta || !metaData.periodo || !metaData.ano || !metaData.meta_quantidade) {
      return res.status(400).json({
        error: 'Campos obrigatórios: tipo_meta, periodo, ano, meta_quantidade'
      });
    }

    // Buscar o ID do usuário na tabela usuarios
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user?.id)
      .single();

    // Preparar dados
    const novaMeta = {
      tipo_meta: metaData.tipo_meta,
      categoria: metaData.categoria || null,
      periodo: metaData.periodo,
      ano: parseInt(metaData.ano),
      mes: metaData.mes ? parseInt(metaData.mes) : null,
      semana: metaData.semana ? parseInt(metaData.semana) : null,
      dia: metaData.dia ? parseInt(metaData.dia) : null,
      meta_quantidade: parseInt(metaData.meta_quantidade),
      meta_percentual: metaData.meta_percentual ? parseFloat(metaData.meta_percentual) : null,
      descricao: metaData.descricao || null,
      escopo: metaData.escopo || 'equipe',
      ativa: true,
      criada_por: usuario?.id || null,
      auth_user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('metas')
      .insert(novaMeta)
      .select()
      .single();

    if (error) {
      console.error('❌ [METAS API] Erro ao criar meta:', error);
      return res.status(500).json({ error: 'Erro ao criar meta', details: error.message });
    }

    console.log('✅ [METAS API] Meta criada:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/metas/:id - Atualizar meta
 */
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metaData = req.body;

    console.log('📝 [METAS API] Atualizando meta:', id);

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Atualizar apenas campos fornecidos
    if (metaData.tipo_meta) updateData.tipo_meta = metaData.tipo_meta;
    if (metaData.categoria !== undefined) updateData.categoria = metaData.categoria;
    if (metaData.periodo) updateData.periodo = metaData.periodo;
    if (metaData.ano) updateData.ano = parseInt(metaData.ano);
    if (metaData.mes !== undefined) updateData.mes = metaData.mes ? parseInt(metaData.mes) : null;
    if (metaData.meta_quantidade) updateData.meta_quantidade = parseInt(metaData.meta_quantidade);
    if (metaData.meta_percentual !== undefined) updateData.meta_percentual = metaData.meta_percentual ? parseFloat(metaData.meta_percentual) : null;
    if (metaData.descricao !== undefined) updateData.descricao = metaData.descricao;
    if (metaData.escopo) updateData.escopo = metaData.escopo;
    if (metaData.ativa !== undefined) updateData.ativa = metaData.ativa;

    const { data, error } = await supabase
      .from('metas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [METAS API] Erro ao atualizar meta:', error);
      return res.status(500).json({ error: 'Erro ao atualizar meta' });
    }

    console.log('✅ [METAS API] Meta atualizada:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/metas/:id - Excluir meta
 */
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🗑️ [METAS API] Excluindo meta:', id);

    const { error } = await supabase
      .from('metas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [METAS API] Erro ao excluir meta:', error);
      return res.status(500).json({ error: 'Erro ao excluir meta' });
    }

    console.log('✅ [METAS API] Meta excluída');
    res.json({ success: true, message: 'Meta excluída com sucesso' });
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PATCH /api/metas/:id/toggle - Ativar/Desativar meta
 */
router.patch('/:id/toggle', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🔄 [METAS API] Alternando status da meta:', id);

    // Buscar meta atual
    const { data: metaAtual } = await supabase
      .from('metas')
      .select('ativa')
      .eq('id', id)
      .single();

    // Inverter status
    const { data, error } = await supabase
      .from('metas')
      .update({
        ativa: !metaAtual?.ativa,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [METAS API] Erro ao alternar meta:', error);
      return res.status(500).json({ error: 'Erro ao alternar status' });
    }

    console.log('✅ [METAS API] Status alternado:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// ROTAS DE ATRIBUIÇÃO
// ===================================================================

/**
 * POST /api/metas/:id/atribuir - Atribuir meta a técnico(s)
 */
router.post('/:id/atribuir', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tma_ids, meta_quantidade_individual, atribuicoes } = req.body;

    console.log('👥 [METAS API] Atribuindo meta:', { id, tma_ids, atribuicoes });

    const atribuicoesEntrada: Array<{ tma_id: string; meta_quantidade_individual?: number; responsavel?: boolean }> | null =
      Array.isArray(atribuicoes) ? atribuicoes : null;

    const tmaIds = atribuicoesEntrada?.map(item => item.tma_id) || tma_ids;

    if (!tmaIds || !Array.isArray(tmaIds) || tmaIds.length === 0) {
      return res.status(400).json({ error: 'tma_ids deve ser um array não vazio' });
    }

    const { data: meta, error: metaError } = await supabase
      .from('metas')
      .select('id, periodo, ano, mes, semana, dia, escopo, meta_quantidade')
      .eq('id', id)
      .single();

    if (metaError || !meta) {
      console.error('❌ [METAS API] Meta não encontrada para atribuição:', metaError);
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    const agora = new Date().toISOString();
    const authUserId = req.user?.id || null;

    const atribuicoesParaInserir = tmaIds.map((tmaId: string, index: number) => {
      const payloadBase = atribuicoesEntrada?.[index];

      return {
        meta_id: id,
        tma_id: tmaId,
        meta_quantidade_individual:
          payloadBase?.meta_quantidade_individual ?? meta_quantidade_individual ?? null,
        responsavel: payloadBase?.responsavel ?? true,
        auth_user_id: authUserId,
        created_at: agora,
        updated_at: agora
      };
    });

    const { data: atribuicoesCriadas, error: atribuicaoError } = await supabase
      .from('metas_atribuicoes')
      .upsert(atribuicoesParaInserir, { onConflict: 'meta_id,tma_id' })
      .select();

    if (atribuicaoError) {
      console.error('❌ [METAS API] Erro ao atribuir meta:', atribuicaoError);
      return res.status(500).json({ error: 'Erro ao atribuir meta' });
    }

    // Garantir registro de progresso para cada TMA atribuído
    const registrosProgresso = tmaIds.map(tmaId => ({
      meta_id: id,
      periodo: meta.periodo,
      ano: meta.ano,
      mes: meta.mes,
      semana: meta.semana,
      dia: meta.dia,
      quantidade_atual: 0,
      percentual_atual: 0,
      percentual_alcancado: 0,
      status: 'em_andamento',
      tma_id: tmaId,
      auth_user_id: authUserId,
      ultima_atualizacao: agora,
      created_at: agora,
      updated_at: agora
    }));

    const { error: progressoError } = await supabase
      .from('progresso_metas')
      .upsert(registrosProgresso, {
        onConflict: 'meta_id,periodo,ano,mes,semana,dia,tma_id'
      });

    if (progressoError) {
      console.error('⚠️ [METAS API] Erro ao sincronizar progresso pós-atribuição:', progressoError);
    }

    const { data: metaAtualizada } = await supabase
      .from('metas')
      .select(`
        *,
        metas_atribuicoes(
          id,
          tma_id,
          meta_quantidade_individual,
          responsavel,
          auth_user_id
        ),
        progresso_metas(
          id,
          quantidade_atual,
          percentual_alcancado,
          status,
          ultima_atualizacao,
          tma_id
        )
      `)
      .eq('id', id)
      .single();

    console.log('✅ [METAS API] Meta atribuída:', atribuicoesCriadas?.length || 0);
    res.status(201).json({
      sucesso: true,
      atribuicoes: atribuicoesCriadas,
      meta: metaAtualizada
    });
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/metas/:metaId/atribuicoes/:atribuicaoId - Remover atribuição
 */
router.delete('/:metaId/atribuicoes/:atribuicaoId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { atribuicaoId } = req.params;

    console.log('🗑️ [METAS API] Removendo atribuição:', atribuicaoId);

    const { error } = await supabase
      .from('metas_atribuicoes')
      .delete()
      .eq('id', atribuicaoId);

    if (error) {
      console.error('❌ [METAS API] Erro ao remover atribuição:', error);
      return res.status(500).json({ error: 'Erro ao remover atribuição' });
    }

    console.log('✅ [METAS API] Atribuição removida');
    res.json({ success: true, message: 'Atribuição removida com sucesso' });
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// ROTAS DE PROGRESSO E DASHBOARD
// ===================================================================

/**
 * GET /api/metas/dashboard - Dashboard com resumo de metas
 */
router.get('/dashboard/resumo', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('📊 [METAS API] Buscando dashboard');

    // Buscar todas as metas ativas
    const { data: metas } = await supabase
      .from('metas')
      .select(`
        *,
        progresso_metas(quantidade_atual, percentual_alcancado, status)
      `)
      .eq('ativa', true);

    // Calcular estatísticas
    const dashboard = {
      total_metas: metas?.length || 0,
      metas_por_tipo: {
        lv: metas?.filter(m => m.tipo_meta === 'lv').length || 0,
        termo: metas?.filter(m => m.tipo_meta === 'termo').length || 0,
        rotina: metas?.filter(m => m.tipo_meta === 'rotina').length || 0
      },
      metas_por_escopo: {
        equipe: metas?.filter(m => m.escopo === 'equipe').length || 0,
        individual: metas?.filter(m => m.escopo === 'individual').length || 0
      },
      metas_por_status: {
        alcancada: 0,
        em_andamento: 0,
        nao_alcancada: 0,
        superada: 0
      }
    };

    // Contar status dos progressos
    metas?.forEach(meta => {
      const progresso = meta.progresso_metas?.[0];
      if (progresso?.status) {
        dashboard.metas_por_status[progresso.status as keyof typeof dashboard.metas_por_status]++;
      } else {
        dashboard.metas_por_status.em_andamento++;
      }
    });

    console.log('✅ [METAS API] Dashboard gerado:', dashboard);
    res.json(dashboard);
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/metas/usuario/:usuarioId - Metas atribuídas a um técnico
 */
router.get('/usuario/:usuarioId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;

    console.log('👤 [METAS API] Buscando metas do usuário:', usuarioId);

    let usuarioChave = usuarioId;
    const { data: usuarioDireto } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', usuarioId)
      .single();

    if (!usuarioDireto) {
      const { data: usuarioPorAuth } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', usuarioId)
        .single();

      if (usuarioPorAuth?.id) {
        usuarioChave = usuarioPorAuth.id;
      }
    }

    const { data, error } = await supabase
      .from('metas_atribuicoes')
      .select(`
        id,
        meta_quantidade_individual,
        responsavel,
        metas(
          *,
          progresso_metas(
            quantidade_atual,
            percentual_alcancado,
            status,
            ultima_atualizacao
          )
        )
      `)
      .eq('tma_id', usuarioChave);

    if (error) {
      console.error('❌ [METAS API] Erro ao buscar metas do usuário:', error);
      return res.status(500).json({ error: 'Erro ao buscar metas' });
    }

    const metasEquipe: any[] = [];
    const metasIndividuais: any[] = [];

    (data || []).forEach(atribuicao => {
      const meta = (atribuicao as any).metas as Record<string, any> | null;
      if (!meta) return;

      const progressoIndividual = (meta.progresso_metas as any[] | undefined)?.find((progresso: any) => progresso.tma_id === usuarioId) || null;

      const metaFormatada = {
        ...meta,
        atribuicao_id: atribuicao.id,
        meta_quantidade_individual: atribuicao.meta_quantidade_individual,
        responsavel: atribuicao.responsavel,
        progresso_individual: progressoIndividual,
        metas_atribuicoes: (meta.metas_atribuicoes as any[] | undefined) || []
      };

      if (meta.escopo === 'individual') {
        metasIndividuais.push(metaFormatada);
      } else {
        metasEquipe.push(metaFormatada);
      }
    });

    console.log('✅ [METAS API] Metas do usuário encontradas:', {
      atribuicoes: data?.length || 0,
      metasEquipe: metasEquipe.length,
      metasIndividuais: metasIndividuais.length
    });

    res.json({ metasEquipe, metasIndividuais });
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/metas/:id/calcular-progresso - Recalcular progresso de uma meta
 */
router.post('/:id/calcular-progresso', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🔄 [METAS API] Recalculando progresso da meta:', id);

    // Buscar meta
    const { data: meta } = await supabase
      .from('metas')
      .select('*')
      .eq('id', id)
      .single();

    if (!meta) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    // Chamar função SQL para recalcular
    const { data, error } = await supabase.rpc('atualizar_progresso_meta', {
      p_tipo_meta: meta.tipo_meta,
      p_tma_id: null, // Recalcular para todos
      p_ano: meta.ano,
      p_mes: meta.mes,
      p_semana: meta.semana,
      p_dia: meta.dia
    });

    if (error) {
      console.error('❌ [METAS API] Erro ao recalcular progresso:', error);
      return res.status(500).json({ error: 'Erro ao recalcular progresso' });
    }

    console.log('✅ [METAS API] Progresso recalculado');
    res.json({ success: true, message: 'Progresso recalculado com sucesso' });
  } catch (error) {
    console.error('❌ [METAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// FUNÇÕES AUXILIARES
// ===================================================================

/**
 * Buscar IDs de metas atribuídas a um usuário
 */
async function getMetasAtribuidasIds(authUserId: string | undefined): Promise<string[]> {
  if (!authUserId) return [];

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();

  if (!usuario) return [];

  const { data: atribuicoes } = await supabase
    .from('metas_atribuicoes')
    .select('meta_id')
    .eq('tma_id', usuario.id);

  return atribuicoes?.map(a => a.meta_id).filter(Boolean) || [];
}

export default router;
