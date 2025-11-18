import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../supabase';

const router = Router();

// Verificar se supabaseAdmin está configurado
if (!supabaseAdmin) {
  console.error('❌ [AÇÕES CORRETIVAS] supabaseAdmin não configurado!');
  throw new Error('SUPABASE_SERVICE_KEY não configurada');
}

// ============================================
// INTERFACES
// ============================================

interface AcaoCorretiva {
  id?: string;
  lv_id: string;
  avaliacao_id: string;
  tipo_lv: string;
  item_codigo: string;
  item_pergunta: string;
  descricao_nc: string;
  criticidade?: 'baixa' | 'media' | 'alta' | 'critica';
  categoria?: string;
  acao_proposta: string;
  acao_descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  area_responsavel?: string;
  prazo_dias?: number;
  status?: string;
}

// ============================================
// GET /api/acoes-corretivas
// Lista todas as ações corretivas com filtros
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      responsavel_id,
      criticidade,
      prazo_de,
      prazo_ate,
      lv_id,
      status_prazo,
      limite = '50',
      offset = '0'
    } = req.query;

    let query = supabaseAdmin!
      .from('v_acoes_corretivas_completa')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (status) query = query.eq('status', status);
    if (responsavel_id) query = query.eq('responsavel_id', responsavel_id);
    if (criticidade) query = query.eq('criticidade', criticidade);
    if (lv_id) query = query.eq('lv_id', lv_id);
    if (prazo_de) query = query.gte('prazo_atual', prazo_de);
    if (prazo_ate) query = query.lte('prazo_atual', prazo_ate);
    if (status_prazo) query = query.eq('status_prazo', status_prazo);

    // Ordenação: mais urgentes primeiro
    query = query
      .order('criticidade', { ascending: false })
      .order('prazo_atual', { ascending: true })
      .order('created_at', { ascending: false });

    // Paginação
    const limiteNum = parseInt(limite as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    query = query.range(offsetNum, offsetNum + limiteNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao listar ações:', error);
      throw error;
    }

    res.json({
      acoes: data || [],
      total: count || 0,
      limite: limiteNum,
      offset: offsetNum
    });

  } catch (error: any) {
    console.error('Erro ao listar ações corretivas:', error);
    res.status(500).json({
      error: 'Erro ao listar ações corretivas',
      details: error.message
    });
  }
});

// ============================================
// GET /api/acoes-corretivas/estatisticas
// Retorna estatísticas agregadas
// ============================================
router.get('/estatisticas', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin!
      .from('v_estatisticas_acoes')
      .select('*')
      .single();

    if (error) throw error;

    res.json(data || {
      total: 0,
      abertas: 0,
      em_andamento: 0,
      aguardando_validacao: 0,
      concluidas: 0,
      canceladas: 0,
      criticas: 0,
      altas: 0,
      medias: 0,
      baixas: 0,
      atrasadas: 0,
      proximas_vencer: 0,
      tempo_medio_resolucao_dias: null,
      tempo_medio_critica: null,
      tempo_medio_alta: null,
      taxa_conclusao_no_prazo: null
    });

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      details: error.message
    });
  }
});

// ============================================
// GET /api/acoes-corretivas/:id
// Busca uma ação específica com histórico
// ============================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar ação
    const { data: acao, error: erroAcao } = await supabaseAdmin!
      .from('v_acoes_corretivas_completa')
      .select('*')
      .eq('id', id)
      .single();

    if (erroAcao) throw erroAcao;

    if (!acao) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Buscar histórico
    const { data: historico, error: erroHistorico } = await supabaseAdmin!
      .from('historico_acoes_corretivas')
      .select('*')
      .eq('acao_id', id)
      .order('created_at', { ascending: false });

    if (erroHistorico) throw erroHistorico;

    // Buscar comentários
    const { data: comentarios, error: erroComentarios } = await supabaseAdmin!
      .from('comentarios_acoes')
      .select('*')
      .eq('acao_id', id)
      .order('created_at', { ascending: true });

    if (erroComentarios) throw erroComentarios;

    res.json({
      acao,
      historico: historico || [],
      comentarios: comentarios || []
    });

  } catch (error: any) {
    console.error('Erro ao buscar ação:', error);
    res.status(500).json({
      error: 'Erro ao buscar ação',
      details: error.message
    });
  }
});

// ============================================
// POST /api/acoes-corretivas
// Cria nova ação corretiva manualmente
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    // Buscar usuário logado
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin!.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar usuário do banco
    const { data: usuario, error: erroUsuario } = await supabaseAdmin!
      .from('usuarios')
      .select('id, perfil_id')
      .eq('auth_user_id', user.id)
      .single();

    if (erroUsuario || !usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const {
      lv_id,
      avaliacao_id,
      tipo_lv,
      item_codigo,
      item_pergunta,
      descricao_nc,
      criticidade = 'media',
      categoria,
      acao_proposta,
      acao_descricao,
      responsavel_id,
      area_responsavel,
      prazo_dias = 7
    }: AcaoCorretiva = req.body;

    // Validações
    if (!lv_id || !avaliacao_id || !descricao_nc || !acao_proposta) {
      return res.status(400).json({
        error: 'Campos obrigatórios: lv_id, avaliacao_id, descricao_nc, acao_proposta'
      });
    }

    // Calcular prazo
    const prazoInicial = new Date();
    prazoInicial.setDate(prazoInicial.getDate() + (prazo_dias || 7));
    const prazoStr = prazoInicial.toISOString().split('T')[0];

    // Buscar nome do responsável se fornecido
    let responsavelNome: string | null = null;
    if (responsavel_id) {
      const { data: resp } = await supabaseAdmin!
        .from('usuarios')
        .select('nome')
        .eq('id', responsavel_id)
        .single();
      responsavelNome = resp?.nome || null;
    }

    // Criar ação
    const { data: acao, error: erroAcao } = await supabaseAdmin!
      .from('acoes_corretivas')
      .insert({
        lv_id,
        avaliacao_id,
        tipo_lv,
        item_codigo,
        item_pergunta,
        descricao_nc,
        criticidade,
        categoria,
        acao_proposta,
        acao_descricao,
        responsavel_id,
        responsavel_nome: responsavelNome,
        area_responsavel,
        prazo_inicial: prazoStr,
        prazo_atual: prazoStr,
        status: 'aberta',
        created_by: usuario.id
      })
      .select()
      .single();

    if (erroAcao) throw erroAcao;

    // Registrar no histórico (não-crítico)
    try {
      await supabaseAdmin!.rpc('registrar_historico_acao', {
        p_acao_id: acao.id,
        p_tipo_evento: 'criada',
        p_descricao: '✅ Ação corretiva criada manualmente',
        p_usuario_id: usuario.id
      });
    } catch (histErr) {
      console.warn('⚠️ Erro ao registrar histórico (não-crítico):', histErr);
    }

    // Criar notificação se tiver responsável (não-crítico)
    if (responsavel_id) {
      try {
        await supabaseAdmin!
          .from('notificacoes_acoes')
          .insert({
            acao_id: acao.id,
            usuario_id: responsavel_id,
            tipo: 'acao_atribuida',
            titulo: `Nova Ação Corretiva: ${criticidade.toUpperCase()}`,
            mensagem: `Você foi atribuído como responsável pela ação: ${acao_proposta}`
          });
      } catch (notifErr) {
        console.warn('⚠️ Erro ao criar notificação (não-crítico):', notifErr);
      }
    }

    res.status(201).json(acao);

  } catch (error: any) {
    console.error('Erro ao criar ação corretiva:', error);
    res.status(500).json({
      error: 'Erro ao criar ação corretiva',
      details: error.message
    });
  }
});

// ============================================
// POST /api/acoes-corretivas/auto-criar
// Cria automaticamente ação para uma NC
// usando regras de criticidade
// ============================================
router.post('/auto-criar', async (req: Request, res: Response) => {
  try {
    // Auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin!.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { data: usuario } = await supabaseAdmin!
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const { avaliacao_id } = req.body;

    if (!avaliacao_id) {
      return res.status(400).json({ error: 'avaliacao_id é obrigatório' });
    }

    // 1. Buscar dados da avaliação NC
    const { data: avaliacao, error: erroAval } = await supabaseAdmin!
      .from('lv_avaliacoes')
      .select(`
        *,
        lvs:lv_id (
          id,
          tipo_lv,
          nome_lv,
          area,
          usuario_id
        )
      `)
      .eq('id', avaliacao_id)
      .eq('avaliacao', 'NC')
      .single();

    if (erroAval) throw erroAval;
    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação NC não encontrada' });
    }

    // 2. Verificar se já existe ação para esta NC
    const { data: acaoExistente } = await supabaseAdmin!
      .from('acoes_corretivas')
      .select('id')
      .eq('avaliacao_id', avaliacao_id)
      .maybeSingle();

    if (acaoExistente) {
      return res.status(409).json({
        error: 'Já existe ação corretiva para esta NC',
        acao_id: acaoExistente.id
      });
    }

    // 3. Buscar regras de criticidade
    const { data: regras } = await supabaseAdmin!
      .from('regras_criticidade_nc')
      .select('*')
      .eq('ativo', true)
      .order('prioridade', { ascending: false });

    let criticidade = 'media';
    let prazoDias = 7;
    let acaoSugerida = 'Corrigir não conformidade detectada';
    let categoria = '';

    // Aplicar regras (primeira que der match)
    for (const regra of regras || []) {
      let match = false;

      // Verificar tipo de LV
      if (regra.tipo_lv && regra.tipo_lv === avaliacao.tipo_lv) {
        match = true;
      }

      // Verificar código do item (suporta wildcard %)
      if (regra.item_codigo) {
        if (regra.item_codigo.includes('%')) {
          const pattern = regra.item_codigo.replace(/%/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(avaliacao.item_codigo)) {
            match = true;
          }
        } else if (regra.item_codigo === avaliacao.item_codigo) {
          match = true;
        }
      }

      // Verificar palavra-chave
      if (regra.palavra_chave) {
        const textoCompleto = `${avaliacao.item_pergunta} ${avaliacao.observacao || ''}`.toLowerCase();
        if (textoCompleto.includes(regra.palavra_chave.toLowerCase())) {
          match = true;
        }
      }

      // Se encontrou match, aplicar regra e parar
      if (match) {
        criticidade = regra.criticidade;
        prazoDias = regra.prazo_padrao_dias || prazoDias;
        acaoSugerida = regra.acao_sugerida || acaoSugerida;
        categoria = regra.categoria_sugerida || categoria;
        break;
      }
    }

    // 4. Determinar responsável (técnico que fez a LV)
    const lvData = Array.isArray(avaliacao.lvs) ? avaliacao.lvs[0] : avaliacao.lvs;
    let responsavelId = lvData?.usuario_id;
    let responsavelNome: string | null = null;

    // Validar se o responsável existe na tabela usuarios
    if (responsavelId) {
      const { data: responsavel, error: errResp } = await supabaseAdmin!
        .from('usuarios')
        .select('id, nome')
        .eq('id', responsavelId)
        .maybeSingle();

      if (errResp || !responsavel) {
        console.warn(`⚠️ Responsável ${responsavelId} não encontrado, criando ação sem responsável`);
        responsavelId = null; // Não existe, então deixar null
      } else {
        responsavelNome = responsavel.nome;
      }
    }

    // 5. Calcular prazo
    const prazoInicial = new Date();
    prazoInicial.setDate(prazoInicial.getDate() + prazoDias);
    const prazoStr = prazoInicial.toISOString().split('T')[0];

    // 6. Criar ação automática
    const { data: acao, error: erroAcao } = await supabaseAdmin!
      .from('acoes_corretivas')
      .insert({
        lv_id: avaliacao.lv_id,
        avaliacao_id: avaliacao.id,
        tipo_lv: avaliacao.tipo_lv,
        item_codigo: avaliacao.item_codigo,
        item_pergunta: avaliacao.item_pergunta,
        descricao_nc: avaliacao.observacao || 'Não conformidade detectada',
        criticidade,
        categoria,
        acao_proposta: acaoSugerida,
        responsavel_id: responsavelId || null,
        responsavel_nome: responsavelNome,
        area_responsavel: lvData?.area,
        prazo_inicial: prazoStr,
        prazo_atual: prazoStr,
        status: 'aberta',
        created_by: usuario.id
      })
      .select()
      .single();

    if (erroAcao) throw erroAcao;

    // 7. Registrar no histórico (não-crítico)
    try {
      await supabaseAdmin!.rpc('registrar_historico_acao', {
        p_acao_id: acao.id,
        p_tipo_evento: 'criada',
        p_descricao: '🤖 Ação corretiva criada automaticamente',
        p_usuario_id: usuario.id
      });
    } catch (histErr) {
      console.warn('⚠️ Erro ao registrar histórico (não-crítico):', histErr);
      // Continuar mesmo se falhar - histórico é opcional
    }

    // 8. Criar notificação (não-crítico)
    if (responsavelId) {
      try {
        await supabaseAdmin!
          .from('notificacoes_acoes')
          .insert({
            acao_id: acao.id,
            usuario_id: responsavelId,
            tipo: 'acao_atribuida',
            titulo: `⚠️ Nova Ação Corretiva: ${criticidade.toUpperCase()}`,
            mensagem: `NC detectada: ${acaoSugerida}. Prazo: ${prazoDias} dias.`
          });
      } catch (notifErr) {
        console.warn('⚠️ Erro ao criar notificação (não-crítico):', notifErr);
        // Continuar mesmo se falhar - notificação é opcional
      }
    }

    res.status(201).json({
      acao,
      auto_criada: true,
      regra_aplicada: {
        criticidade,
        prazo_dias: prazoDias,
        categoria
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar ação automaticamente:', error);
    res.status(500).json({
      error: 'Erro ao criar ação automaticamente',
      details: error.message
    });
  }
});

// ============================================
// PATCH /api/acoes-corretivas/:id/status
// Atualiza status da ação
// ============================================
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    // Auth
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin!.auth.getUser(token);
    const { data: usuario } = await supabaseAdmin!
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user?.id)
      .single();

    const statusValidos = ['aberta', 'em_andamento', 'aguardando_validacao', 'concluida', 'cancelada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Buscar ação atual
    const { data: acaoAtual, error: erroGet } = await supabaseAdmin!
      .from('acoes_corretivas')
      .select('*')
      .eq('id', id)
      .single();

    if (erroGet) throw erroGet;
    if (!acaoAtual) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Preparar atualização
    const updates: any = {
      status,
      updated_by: usuario?.id,
      updated_at: new Date().toISOString()
    };

    if (status === 'concluida') {
      updates.data_conclusao = new Date().toISOString();
      if (observacoes) {
        updates.observacoes_conclusao = observacoes;
      }
    }

    // Atualizar
    const { data: acaoAtualizada, error: erroUpdate } = await supabaseAdmin!
      .from('acoes_corretivas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (erroUpdate) throw erroUpdate;

    // Registrar no histórico
    await supabaseAdmin!.rpc('registrar_historico_acao', {
      p_acao_id: id,
      p_tipo_evento: status === 'concluida' ? 'concluida' : 'atualizada',
      p_descricao: `Status alterado de "${acaoAtual.status}" para "${status}"`,
      p_usuario_id: usuario?.id,
      p_dados_anteriores: JSON.stringify({ status: acaoAtual.status }),
      p_dados_novos: JSON.stringify({ status })
    });

    res.json(acaoAtualizada);

  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: 'Erro ao atualizar status',
      details: error.message
    });
  }
});

// ============================================
// POST /api/acoes-corretivas/:id/evidencias
// Adiciona evidência de correção
// ============================================
router.post('/:id/evidencias', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { url_foto, descricao } = req.body;

    if (!url_foto) {
      return res.status(400).json({ error: 'URL da foto é obrigatória' });
    }

    // Auth
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin!.auth.getUser(token || '');
    const { data: usuario } = await supabaseAdmin!
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user?.id)
      .single();

    // Buscar ação atual
    const { data: acao, error: erroGet } = await supabaseAdmin!
      .from('acoes_corretivas')
      .select('evidencias_correcao')
      .eq('id', id)
      .single();

    if (erroGet) throw erroGet;

    // Adicionar nova evidência
    const evidencias = acao.evidencias_correcao || [];
    evidencias.push({
      url: url_foto,
      descricao: descricao || '',
      data: new Date().toISOString(),
      usuario_id: usuario?.id
    });

    // Atualizar
    const { data: acaoAtualizada, error: erroUpdate } = await supabaseAdmin!
      .from('acoes_corretivas')
      .update({
        evidencias_correcao: evidencias,
        updated_by: usuario?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (erroUpdate) throw erroUpdate;

    // Registrar no histórico
    await supabaseAdmin!.rpc('registrar_historico_acao', {
      p_acao_id: id,
      p_tipo_evento: 'evidencia_adicionada',
      p_descricao: '📸 Evidência de correção adicionada',
      p_usuario_id: usuario?.id
    });

    res.json(acaoAtualizada);

  } catch (error: any) {
    console.error('Erro ao adicionar evidência:', error);
    res.status(500).json({
      error: 'Erro ao adicionar evidência',
      details: error.message
    });
  }
});

// ============================================
// POST /api/acoes-corretivas/:id/comentarios
// Adiciona comentário à ação
// ============================================
router.post('/:id/comentarios', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;

    if (!comentario) {
      return res.status(400).json({ error: 'Comentário é obrigatório' });
    }

    // Auth
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin!.auth.getUser(token || '');
    const { data: usuario } = await supabaseAdmin!
      .from('usuarios')
      .select('id, nome')
      .eq('auth_user_id', user?.id)
      .single();

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Criar comentário
    const { data: novoComentario, error } = await supabaseAdmin!
      .from('comentarios_acoes')
      .insert({
        acao_id: id,
        usuario_id: usuario.id,
        usuario_nome: usuario.nome,
        comentario
      })
      .select()
      .single();

    if (error) throw error;

    // Registrar no histórico
    await supabaseAdmin!.rpc('registrar_historico_acao', {
      p_acao_id: id,
      p_tipo_evento: 'comentario',
      p_descricao: `💬 ${usuario.nome} comentou`,
      p_usuario_id: usuario.id
    });

    res.status(201).json(novoComentario);

  } catch (error: any) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({
      error: 'Erro ao adicionar comentário',
      details: error.message
    });
  }
});

export default router;
