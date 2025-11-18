// ===================================================================
// API DE TERMOS - BACKEND ECOFIELD SYSTEM (CORRIGIDO)
// Localização: backend/src/routes/termos.ts
// ===================================================================

import express from 'express';
import { supabaseAdmin } from '../supabase';
import { authenticateUser } from '../middleware/auth'; // ✅ IMPORTAR O MIDDLEWARE CORRETO
import type { Request, Response } from 'express';

const router = express.Router();

// Listar termos
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { tipo_termo, status, data_inicio, data_fim } = req.query;
    const user = (req as any).user;

    console.log('🔍 [TERMOS API] Listando termos:', {
      tipo_termo,
      status,
      data_inicio,
      data_fim,
      user_id: user?.id,
      user_email: user?.email
    });

    if (!user || !user.id) {
      console.error('❌ [TERMOS API] User ou user.id está undefined!');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar perfil do usuário para verificar se é admin
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user.id)
      .single();

    if (userError) {
      console.error('❌ [TERMOS API] Erro ao buscar usuário:', userError);
    }

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';
    const isAdminOrSup = isAdmin || isSupervisor;

    console.log('🔐 [TERMOS API] Perfil:', perfil?.nome, '| Admin?', isAdmin, '| Supervisor?', isSupervisor);

    let query = supabaseAdmin
      .from('termos_ambientais')
      .select('*')
      .order('created_at', { ascending: false });

    // Admin/Supervisor veem todos, Técnico vê só os seus
    if (!isAdminOrSup) {
      query = query.eq('auth_user_id', user.id);
      console.log('🔒 [TERMOS API] Filtrando por auth_user_id (técnico)');
    } else {
      console.log('🔓 [TERMOS API] Admin/Supervisor - retornando todos os termos');
    }

    // Aplicar filtros
    if (tipo_termo && tipo_termo !== 'TODOS') {
      query = query.eq('tipo_termo', tipo_termo);
    }

    if (status && status !== 'TODOS') {
      query = query.eq('status', status);
    }

    if (data_inicio) {
      query = query.gte('data_emissao', data_inicio as string);
    }

    if (data_fim) {
      query = query.lte('data_emissao', data_fim as string);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [TERMOS API] Erro ao buscar termos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    console.log('✅ [TERMOS API] Termos encontrados:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar número sequencial
router.get('/numero-sequencial', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { tipo, ano } = req.query;

    console.log('🔍 [TERMOS API] Gerando número sequencial:', { tipo, ano });

    if (!tipo || !ano) {
      return res.status(400).json({ error: 'Tipo e ano são obrigatórios' });
    }

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar o maior número sequencial para o tipo e ano
    const { data, error } = await supabaseAdmin
      .from('termos_ambientais')
      .select('numero_sequencial')
      .eq('tipo_termo', tipo)
      .gte('created_at', `${ano}-01-01`)
      .lt('created_at', `${parseInt(ano as string) + 1}-01-01`)
      .order('numero_sequencial', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ [TERMOS API] Erro ao buscar número sequencial:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const proximoNumero = data && data.length > 0 ? data[0].numero_sequencial + 1 : 1;

    console.log('✅ [TERMOS API] Número sequencial gerado:', proximoNumero);
    res.json({ numero_sequencial: proximoNumero });
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar fotos do termo (DEVE VIR ANTES DA ROTA GENÉRICA /:id)
router.get('/:id/fotos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log('📸 [TERMOS API] Buscando fotos do termo:', id);
    console.log('📸 [TERMOS API] User ID:', user?.id);

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se o termo existe e pertence ao usuário
    const { data: existingTermo, error: checkError } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingTermo) {
      console.error('❌ [TERMOS API] Termo não encontrado ou não autorizado');
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    // Buscar fotos do termo
    const { data: fotos, error } = await supabaseAdmin
      .from('termos_fotos')
      .select('*')
      .eq('termo_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [TERMOS API] Erro ao buscar fotos:', error);
      return res.status(500).json({ error: 'Erro ao buscar fotos', details: error });
    }

    console.log('✅ [TERMOS API] Fotos encontradas:', fotos?.length || 0);
    res.json(fotos || []);
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar fotos do termo (DEVE VIR ANTES DA ROTA GENÉRICA /:id)
router.post('/:id/fotos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { fotos } = req.body;

    console.log('📸 [TERMOS API] Salvando fotos do termo:', id);
    console.log('📸 [TERMOS API] User ID:', user?.id);

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se o termo existe e pertence ao usuário
    const { data: existingTermo, error: checkError } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingTermo) {
      console.error('❌ [TERMOS API] Termo não encontrado ou não autorizado');
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    if (!fotos || !Array.isArray(fotos)) {
      return res.status(400).json({ error: 'Fotos inválidas' });
    }

    // Preparar fotos para inserção
    const fotosParaSalvar = fotos.map((foto: Record<string, unknown>) => ({
      termo_id: id,
      nome_arquivo: foto.nome_arquivo,
      url_arquivo: foto.url_arquivo,
      tamanho_bytes: foto.tamanho_bytes,
      tipo_mime: foto.tipo_mime,
      categoria: foto.categoria || 'geral',
      descricao: foto.descricao || '',
      latitude: foto.latitude,
      longitude: foto.longitude,
      precisao_gps: foto.precisao_gps,
      endereco: foto.endereco,
      timestamp_captura: foto.timestamp_captura,
      offline: false,
      sincronizado: true
    }));

    // Salvar fotos
    const { data, error } = await supabaseAdmin
      .from('termos_fotos')
      .insert(fotosParaSalvar)
      .select();

    if (error) {
      console.error('❌ [TERMOS API] Erro ao salvar fotos:', error);
      return res.status(500).json({ error: 'Erro ao salvar fotos', details: error });
    }

    console.log('✅ [TERMOS API] Fotos salvas:', data ? data.length : 0);
    res.json({
      success: true,
      fotos_salvas: data ? data.length : 0,
      message: 'Fotos salvas com sucesso'
    });
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar relatório do termo (DEVE VIR ANTES DA ROTA GENÉRICA /:id)
router.get('/:id/relatorio', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log('📄 [TERMOS API] Gerando relatório do termo:', id);
    console.log('📄 [TERMOS API] User ID:', user?.id);

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se o termo existe e pertence ao usuário
    const { data: existingTermo, error: checkError } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingTermo) {
      console.error('❌ [TERMOS API] Termo não encontrado ou não autorizado');
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    // Buscar o termo com todas as informações necessárias
    const { data: termo, error } = await supabaseAdmin
      .from('termos_ambientais')
      .select(`
        *,
        termos_fotos(*)
      `)
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (error || !termo) {
      console.error('❌ [TERMOS API] Termo não encontrado:', error);
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    // Gerar dados do relatório
    const relatorio = {
      termo: termo,
      fotos: termo.termos_fotos || [],
      assinaturas: {
        responsavel_area: termo.assinatura_responsavel_area,
        emitente: termo.assinatura_emitente,
        responsavel_area_img: termo.assinatura_responsavel_area_img,
        emitente_img: termo.assinatura_emitente_img
      },
      gerado_em: new Date().toISOString(),
      gerado_por: user?.email
    };

    console.log('✅ [TERMOS API] Relatório gerado:', id);
    res.json(relatorio);
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTA DE PDF REMOVIDA - PDFs são gerados localmente no frontend
// router.get('/:id/pdf', authenticateUser, async (req: Request, res: Response) => { ... });

// ===================================================================
// ESTATÍSTICAS DE TERMOS - DEVE VIR ANTES DA ROTA /:id
// ===================================================================

router.get('/estatisticas', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log('📊 [TERMOS API] Buscando estatísticas de termos');

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar perfil do usuário
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';
    const isAdminOrSup = isAdmin || isSupervisor;

    console.log('🔐 [TERMOS API] Perfil:', perfilNome, '| Admin?', isAdmin);

    // Buscar tipos de termos da tabela term_types
    const { data: termTypes, error: termTypesError } = await supabaseAdmin
      .from('term_types')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (termTypesError) {
      console.error('❌ [TERMOS API] Erro ao buscar tipos de termos:', termTypesError);
      return res.status(500).json({ error: 'Erro ao buscar tipos de termos' });
    }

    // Buscar termos (sem JOIN, pois tipo_termo não é FK)
    let query = supabaseAdmin
      .from('termos_ambientais')
      .select('id, tipo_termo');

    // Filtrar por usuário se não for admin/supervisor
    if (!isAdminOrSup) {
      query = query.eq('auth_user_id', user?.id);
    }

    const { data: termos, error } = await query;

    if (error) {
      console.error('❌ [TERMOS API] Erro ao buscar termos:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }

    // Contar dinamicamente por cada tipo (comparando strings)
    const estatisticasPorTipo = termTypes?.map(tipo => {
      const count = termos?.filter(t => t.tipo_termo === tipo.code).length || 0;

      return {
        code: tipo.code,
        name: tipo.name,
        count: count,
        color: tipo.color
      };
    }) || [];

    // Para manter compatibilidade com o frontend (pode ser removido depois)
    const total_notificacoes = estatisticasPorTipo.find(t => t.code === 'NOTIFICACAO')?.count || 0;
    const total_paralizacoes = estatisticasPorTipo.find(t => t.code === 'PARALIZACAO_TECNICA')?.count || 0;
    const total_recomendacoes = estatisticasPorTipo.find(t => t.code === 'RECOMENDACAO')?.count || 0;

    const stats = {
      total_notificacoes,
      total_paralizacoes,
      total_recomendacoes,
      total: termos?.length || 0,
      por_tipo: estatisticasPorTipo // Dados dinâmicos completos
    };

    console.log('✅ [TERMOS API] Estatísticas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [TERMOS API] Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar termo específico
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user; // ✅ USAR CASTING

    console.log('🔍 [TERMOS API] Buscando termo:', id);

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data, error } = await supabaseAdmin
      .from('termos_ambientais')
      .select(`
        *,
        termos_fotos(*)
      `)
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (error) {
      console.error('❌ [TERMOS API] Erro ao buscar termo:', error);
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    console.log('✅ [TERMOS API] Termo encontrado:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar termo
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // ✅ USAR CASTING
    const termoData: Record<string, unknown> = req.body;

    console.log('📝 [TERMOS API] Criando termo - User ID:', user?.id);
    console.log('📝 [TERMOS API] Dados recebidos do frontend:', JSON.stringify(termoData, null, 2));
    console.log('📝 [TERMOS API] Campo numero_termo recebido:', (termoData as any).numero_termo);
    console.log('📝 [TERMOS API] Campo data_assinatura_responsavel recebido:', (termoData as any).data_assinatura_responsavel);
    console.log('📝 [TERMOS API] Campo data_assinatura_emitente recebido:', (termoData as any).data_assinatura_emitente);
    console.log('📝 [TERMOS API] Campo tipo_termo recebido:', (termoData as any).tipo_termo);
    
    // ✅ DEBUG: Verificar se numero_termo está sendo enviado
    if ((termoData as any).numero_termo) {
      console.log('✅ [TERMOS API] numero_termo está sendo enviado:', (termoData as any).numero_termo);
    } else {
      console.log('❌ [TERMOS API] numero_termo NÃO está sendo enviado');
    }
    
    // ✅ DEBUG: Verificar se data_assinatura_responsavel está sendo enviado
    if ((termoData as any).data_assinatura_responsavel) {
      console.log('✅ [TERMOS API] data_assinatura_responsavel está sendo enviado:', (termoData as any).data_assinatura_responsavel);
    } else {
      console.log('❌ [TERMOS API] data_assinatura_responsavel NÃO está sendo enviado');
    }

    // Validar dados obrigatórios
    if (!termoData.tipo_termo) {
      console.error('❌ [TERMOS API] Tipo do termo não fornecido');
      return res.status(400).json({ error: 'Tipo do termo é obrigatório' });
    }

    // Preparar dados para inserção
    const novoTermo = {
      ...termoData,
      auth_user_id: user?.id || '',
      emitido_por_usuario_id: null, // ✅ CORREÇÃO: Não usar FK que não existe
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'PENDENTE', // ✅ CORREÇÃO: Usar valor válido da constraint
      sincronizado: true,
      offline: false
    };

    // ✅ DEIXAR emitido_por_usuario_id como null - o trigger vai preencher automaticamente
    novoTermo.emitido_por_usuario_id = null;

    console.log('📝 [TERMOS API] Dados para inserção:', JSON.stringify(novoTermo, null, 2));
    console.log('📝 [TERMOS API] Supabase Admin configurado:', !!supabaseAdmin);
    
    // ✅ DEBUG ESPECÍFICO: Verificar se numero_termo está no JSON para Supabase
    console.log('🔍 [TERMOS API] VERIFICAÇÃO FINAL - JSON para Supabase:');
    console.log('🔍 [TERMOS API] - numero_termo presente:', !!(novoTermo as any).numero_termo);
    console.log('🔍 [TERMOS API] - numero_termo valor:', (novoTermo as any).numero_termo);
    console.log('🔍 [TERMOS API] - JSON completo:', JSON.stringify(novoTermo, null, 2));
    
    // ✅ DEBUG: Verificar campos específicos no novoTermo
    console.log('🔍 [TERMOS API] Campos específicos no novoTermo:', {
      numero_termo: (novoTermo as any).numero_termo,
      data_assinatura_responsavel: (novoTermo as any).data_assinatura_responsavel,
      data_assinatura_emitente: (novoTermo as any).data_assinatura_emitente,
      emitido_por_usuario_id: (novoTermo as any).emitido_por_usuario_id
    });

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    console.log('📝 [TERMOS API] Executando INSERT no Supabase...');
    const { data, error } = await supabaseAdmin
      .from('termos_ambientais')
      .insert(novoTermo)
      .select()
      .single();

    if (error) {
      console.error('❌ [TERMOS API] Erro ao criar termo:', error);
      console.error('❌ [TERMOS API] Detalhes do erro:', JSON.stringify(error, null, 2));
      return res.status(500).json({ error: 'Erro ao criar termo', details: error });
    }

    console.log('✅ [TERMOS API] Termo criado:', data);
    console.log('🔍 [TERMOS API] Verificando campos salvos:', {
      numero_termo: data.numero_termo,
      data_assinatura_responsavel: data.data_assinatura_responsavel,
      data_assinatura_emitente: data.data_assinatura_emitente,
      emitido_por_usuario_id: data.emitido_por_usuario_id
    });
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    console.error('❌ [TERMOS API] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// CONTINUAR COM OUTRAS ROTAS USANDO (req as any).user
// ===================================================================

// Atualizar termo
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const termoData: Record<string, unknown> = req.body;

    console.log('📝 [TERMOS API] Atualizando termo:', id);
    console.log('📝 [TERMOS API] User ID:', user?.id);
    console.log('📝 [TERMOS API] Dados recebidos:', JSON.stringify(termoData, null, 2));

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se o termo existe e pertence ao usuário
    const { data: existingTermo, error: checkError } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingTermo) {
      console.error('❌ [TERMOS API] Termo não encontrado ou não autorizado');
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      ...termoData,
      updated_at: new Date().toISOString()
    };

    console.log('📝 [TERMOS API] Executando UPDATE no Supabase...');
    const { data, error } = await supabaseAdmin
      .from('termos_ambientais')
      .update(dadosAtualizacao)
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .select()
      .single();

    if (error) {
      console.error('❌ [TERMOS API] Erro ao atualizar termo:', error);
      return res.status(500).json({ error: 'Erro ao atualizar termo', details: error });
    }

    console.log('✅ [TERMOS API] Termo atualizado:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir termo
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log('🗑️ [TERMOS API] Excluindo termo:', id);
    console.log('🗑️ [TERMOS API] User ID:', user?.id);
    console.log('🗑️ [TERMOS API] URL completa:', req.originalUrl);
    console.log('🗑️ [TERMOS API] Método:', req.method);

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se o termo existe e pertence ao usuário
    const { data: existingTermo, error: checkError } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingTermo) {
      console.error('❌ [TERMOS API] Termo não encontrado ou não autorizado');
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    // Excluir o termo
    const { error } = await supabaseAdmin
      .from('termos_ambientais')
      .delete()
      .eq('id', id)
      .eq('auth_user_id', user?.id || '');

    if (error) {
      console.error('❌ [TERMOS API] Erro ao excluir termo:', error);
      return res.status(500).json({ error: 'Erro ao excluir termo', details: error });
    }

    console.log('✅ [TERMOS API] Termo excluído:', id);
    res.json({ success: true, message: 'Termo excluído com sucesso' });
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir fotos de um termo específico
router.delete('/:id/fotos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log('🗑️ [TERMOS API] Excluindo fotos do termo:', id);
    console.log('🗑️ [TERMOS API] User ID:', user?.id);

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se o termo existe e pertence ao usuário
    const { data: existingTermo, error: checkError } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingTermo) {
      console.error('❌ [TERMOS API] Termo não encontrado ou não autorizado');
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    // Buscar fotos do termo
    const { data: fotos, error: fotosError } = await supabaseAdmin
      .from('termos_fotos')
      .select('*')
      .eq('termo_id', id);

    if (fotosError) {
      console.error('❌ [TERMOS API] Erro ao buscar fotos:', fotosError);
      return res.status(500).json({ error: 'Erro ao buscar fotos', details: fotosError });
    }

    // Excluir metadados das fotos
    const { error: deleteError } = await supabaseAdmin
      .from('termos_fotos')
      .delete()
      .eq('termo_id', id);

    if (deleteError) {
      console.error('❌ [TERMOS API] Erro ao excluir metadados das fotos:', deleteError);
      return res.status(500).json({ error: 'Erro ao excluir metadados das fotos', details: deleteError });
    }

    // Excluir arquivos do bucket (se existirem)
    if (fotos && fotos.length > 0) {
      try {
        for (const foto of fotos) {
          if (foto.url_arquivo) {
            // ✅ CORRIGIR: Extrair o caminho do arquivo da URL corretamente
            // URL exemplo: https://xxx.supabase.co/storage/v1/object/public/fotos-termos/termos/123/acao_1/1754396171382-14.png
            const url = new URL(foto.url_arquivo);
            const pathParts = url.pathname.split('/');
            
            // Encontrar o índice de 'fotos-termos' e pegar tudo depois
            const bucketIndex = pathParts.findIndex(part => part === 'fotos-termos');
            if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
              const filePath = pathParts.slice(bucketIndex + 1).join('/');
              
              console.log('🗑️ [TERMOS API] Excluindo arquivo do bucket:', {
                urlOriginal: foto.url_arquivo,
                filePath: filePath,
                pathParts: pathParts
              });
              
              const { error: bucketError } = await supabaseAdmin.storage
                .from('fotos-termos')
                .remove([filePath]);

              if (bucketError) {
                console.error('❌ [TERMOS API] Erro ao excluir arquivo do bucket:', bucketError);
              } else {
                console.log('✅ [TERMOS API] Arquivo excluído do bucket com sucesso:', filePath);
              }
            } else {
              console.error('❌ [TERMOS API] Não foi possível extrair caminho da URL:', foto.url_arquivo);
            }
          }
        }
      } catch (bucketError) {
        console.error('❌ [TERMOS API] Erro ao excluir arquivos do bucket:', bucketError);
      }
    }

    console.log('✅ [TERMOS API] Fotos do termo excluídas:', id);
    res.json({ success: true, message: 'Fotos excluídas com sucesso', fotosExcluidas: fotos?.length || 0 });
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir fotos específicas de um termo
router.delete('/:id/fotos/especificas', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fotos } = req.body as { fotos: { id: string; categoria: string; nome_arquivo: string }[] };
    const user = (req as any).user;

    console.log('🗑️ [TERMOS API] Excluindo fotos específicas do termo:', id);
    console.log('🗑️ [TERMOS API] Fotos para remover:', fotos.length);
    console.log('🗑️ [TERMOS API] User ID:', user?.id);

    if (!supabaseAdmin) {
      console.error('❌ [TERMOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar se o termo existe e pertence ao usuário
    const { data: existingTermo, error: checkError } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (checkError || !existingTermo) {
      console.error('❌ [TERMOS API] Termo não encontrado ou não autorizado');
      return res.status(404).json({ error: 'Termo não encontrado' });
    }

    // Buscar fotos específicas para obter URLs dos arquivos
    const fotoIds = fotos.map(f => f.id);
    const { data: fotosParaExcluir, error: fotosError } = await supabaseAdmin
      .from('termos_fotos')
      .select('*')
      .in('id', fotoIds)
      .eq('termo_id', id);

    if (fotosError) {
      console.error('❌ [TERMOS API] Erro ao buscar fotos específicas:', fotosError);
      return res.status(500).json({ error: 'Erro ao buscar fotos', details: fotosError });
    }

    // ✅ CORRIGIR ORDEM: PRIMEIRO excluir arquivos físicos do bucket
    if (fotosParaExcluir && fotosParaExcluir.length > 0) {
      console.log('🗑️ [TERMOS API] Excluindo arquivos físicos do bucket primeiro...');
      try {
        for (const foto of fotosParaExcluir) {
          if (foto.url_arquivo) {
            // ✅ CORRIGIR: Extrair o caminho do arquivo da URL corretamente
            // URL exemplo: https://xxx.supabase.co/storage/v1/object/public/fotos-termos/termos/123/acao_1/1754396171382-14.png
            const url = new URL(foto.url_arquivo);
            const pathParts = url.pathname.split('/');
            
            // Encontrar o índice de 'fotos-termos' e pegar tudo depois
            const bucketIndex = pathParts.findIndex(part => part === 'fotos-termos');
            if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
              const filePath = pathParts.slice(bucketIndex + 1).join('/');
              
              console.log('🗑️ [TERMOS API] Excluindo arquivo específico do bucket:', {
                urlOriginal: foto.url_arquivo,
                filePath: filePath,
                pathParts: pathParts
              });
              
              const { error: bucketError } = await supabaseAdmin.storage
                .from('fotos-termos')
                .remove([filePath]);

              if (bucketError) {
                console.error('❌ [TERMOS API] Erro ao excluir arquivo específico do bucket:', bucketError);
              } else {
                console.log('✅ [TERMOS API] Arquivo excluído do bucket com sucesso:', filePath);
              }
            } else {
              console.error('❌ [TERMOS API] Não foi possível extrair caminho da URL:', foto.url_arquivo);
            }
          }
        }
      } catch (bucketError) {
        console.error('❌ [TERMOS API] Erro ao excluir arquivos específicos do bucket:', bucketError);
      }
    }

    // ✅ DEPOIS: Excluir metadados das fotos específicas
    console.log('🗑️ [TERMOS API] Excluindo metadados das fotos...');
    const { error: deleteError } = await supabaseAdmin
      .from('termos_fotos')
      .delete()
      .in('id', fotoIds)
      .eq('termo_id', id);

    if (deleteError) {
      console.error('❌ [TERMOS API] Erro ao excluir metadados das fotos:', deleteError);
      return res.status(500).json({ error: 'Erro ao excluir metadados das fotos', details: deleteError });
    }

    console.log('✅ [TERMOS API] Fotos específicas excluídas:', id);
    res.json({ 
      success: true, 
      message: 'Fotos específicas excluídas com sucesso', 
      fotosExcluidas: fotosParaExcluir?.length || 0 
    });
  } catch (error) {
    console.error('❌ [TERMOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;