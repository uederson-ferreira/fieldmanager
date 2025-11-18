// ===================================================================
// API DE ESTATÍSTICAS - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/estatisticas.ts
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
    console.error('❌ [ESTATÍSTICAS API] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Buscar estatísticas do dashboard
router.get('/dashboard', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('🔍 [ESTATÍSTICAS API] Buscando estatísticas do dashboard');

    // Buscar LVs do usuário
    const { data: lvs, error: errorLVs } = await supabase
      .from('lvs')
      .select('*')
      .eq('auth_user_id', user?.id || '');

    if (errorLVs) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar LVs:', errorLVs);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Buscar termos do usuário
    const { data: termos, error: errorTermos } = await supabase
      .from('termos_ambientais')
      .select('*')
      .eq('auth_user_id', user?.id || '');

    if (errorTermos) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar termos:', errorTermos);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Buscar rotinas do usuário
    const { data: rotinas, error: errorRotinas } = await supabase
      .from('atividades_rotina')
      .select('*')
      .eq('auth_user_id', user?.id || '');

    if (errorRotinas) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar rotinas:', errorRotinas);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Calcular estatísticas de LVs
    const lvsHoje = lvs?.filter(lv => {
      const data = new Date(lv.created_at);
      const hoje = new Date();
      return data.toDateString() === hoje.toDateString();
    }).length || 0;

    const lvsPendentes = lvs?.filter(lv => !lv.concluida).length || 0;
    const lvsCompletas = lvs?.filter(lv => lv.concluida).length || 0;
    const lvsNaoConformes = lvs?.filter(lv => lv.percentual_conformidade < 80).length || 0;
    const lvsPercentualConformidade = lvs?.length > 0 
      ? Math.round((lvs.filter(lv => lv.concluida).length / lvs.length) * 100)
      : 0;

    // Calcular estatísticas de Termos
    const termosHoje = termos?.filter(termo => {
      const data = new Date(termo.created_at);
      const hoje = new Date();
      return data.toDateString() === hoje.toDateString();
    }).length || 0;

    const termosPendentes = termos?.filter(termo => termo.status === 'PENDENTE').length || 0;
    const termosCorrigidos = termos?.filter(termo => termo.status === 'CORRIGIDO').length || 0;
    const paralizacoes = termos?.filter(termo => termo.tipo_termo === 'PARALIZACAO').length || 0;

    // Calcular estatísticas de Rotinas
    const rotinasHoje = rotinas?.filter(rotina => {
      const data = new Date(rotina.data_atividade);
      const hoje = new Date();
      return data.toDateString() === hoje.toDateString();
    }).length || 0;

    const rotinasMes = rotinas?.filter(rotina => {
      const data = new Date(rotina.data_atividade);
      const hoje = new Date();
      return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    }).length || 0;

    // Calcular tempo médio das rotinas (em minutos)
    const rotinasComTempo = rotinas?.filter(rotina => rotina.hora_inicio && rotina.hora_fim) || [];
    const tempoMedio = rotinasComTempo.length > 0 
      ? Math.round(rotinasComTempo.reduce((acc, rotina) => {
          const inicio = new Date(`2000-01-01T${rotina.hora_inicio}`);
          const fim = new Date(`2000-01-01T${rotina.hora_fim}`);
          return acc + (fim.getTime() - inicio.getTime()) / (1000 * 60);
        }, 0) / rotinasComTempo.length)
      : 0;

    // Retornar formato esperado pelo frontend
    const estatisticas = {
      // LVs (Listas de Verificação)
      lvsPendentes,
      lvsCompletas,
      lvsNaoConformes,
      lvsPercentualConformidade,
      
      // Termos Ambientais
      total_termos: termos?.length || 0,
      termosPendentes,
      termosCorrigidos,
      paralizacoes,
      notificacoes: 0, // TODO: Implementar quando houver tabela de notificações
      total_recomendacoes: 0, // TODO: Implementar quando houver tabela de recomendações
      
      // Rotinas/Atividades
      rotinasHoje,
      rotinasMes,
      itensEmitidos: rotinas?.length || 0,
      tempoMedio,
      
      loading: false,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ [ESTATÍSTICAS API] Estatísticas calculadas:', estatisticas);
    res.json(estatisticas);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar estatísticas específicas de LVs
router.get('/lvs', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { tipo_lv } = req.query;

    console.log('🔍 [ESTATÍSTICAS API] Buscando estatísticas de LVs');

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

    console.log('🔐 [ESTATÍSTICAS API] Perfil:', perfilNome, '| Admin?', isAdmin);

    let query = supabaseAdmin
      .from('lvs')
      .select('*');

    // Filtrar por usuário se não for admin/supervisor
    if (!isAdminOrSup) {
      query = query.eq('auth_user_id', user?.id || '');
    }

    if (tipo_lv) {
      query = query.eq('tipo_lv', tipo_lv);
    }

    const { data: lvsData, error } = await query;

    if (error) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar LVs:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas de LVs' });
    }

    const lvs = lvsData || [];

    // Calcular conformidade média corretamente
    const lvsCompletas = lvs.filter(lv => lv.concluida);
    const conformidadeMedia = lvsCompletas.length > 0
      ? Math.round(lvsCompletas.reduce((acc, lv) => acc + (lv.percentual_conformidade || 0), 0) / lvsCompletas.length)
      : 0;

    const stats = {
      total: lvs.length,
      pendentes: lvs.filter(lv => !lv.concluida).length,
      completas: lvsCompletas.length,
      naoConformes: lvs.filter(lv => lv.percentual_conformidade < 80).length,
      percentualConformidade: conformidadeMedia
    };

    console.log('✅ [ESTATÍSTICAS API] Estatísticas de LVs:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar estatísticas específicas de Termos
router.get('/termos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { status, tipo_termo } = req.query;

    console.log('🔍 [ESTATÍSTICAS API] Buscando estatísticas de Termos');

    let query = supabase
      .from('termos_ambientais')
      .select('*')
      .eq('auth_user_id', user?.id || '');

    if (status) {
      query = query.eq('status', status);
    }

    if (tipo_termo) {
      query = query.eq('tipo_termo', tipo_termo);
    }

    const { data: termosData, error } = await query;

    if (error) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar termos:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas de termos' });
    }

    const termos = termosData || [];
    const stats = {
      total: termos.length,
      pendentes: termos.filter(termo => !termo.corrigido).length,
      corrigidos: termos.filter(termo => termo.corrigido).length,
      paralizacoes: termos.filter(termo => termo.tipo_termo === 'paralizacao').length,
      notificacoes: termos.filter(termo => termo.tipo_termo === 'notificacao').length,
      recomendacoes: termos.filter(termo => termo.tipo_termo === 'recomendacao').length
    };

    console.log('✅ [ESTATÍSTICAS API] Estatísticas de Termos:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar estatísticas específicas de Rotinas
router.get('/rotinas', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { data_inicio, data_fim } = req.query;

    console.log('🔍 [ESTATÍSTICAS API] Buscando estatísticas de Rotinas');

    let query = supabase
      .from('atividades_rotina')
      .select('*')
      .eq('auth_user_id', user?.id || '');

    if (data_inicio) {
      query = query.gte('data_atividade', data_inicio);
    }

    if (data_fim) {
      query = query.lte('data_atividade', data_fim);
    }

    const { data: rotinasData, error } = await query;

    if (error) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar rotinas:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas de rotinas' });
    }

    const rotinas = rotinasData || [];
    const hoje = new Date().toISOString().split('T')[0];
    
    const stats = {
      total: rotinas.length,
      hoje: rotinas.filter(rotina => rotina.data_atividade === hoje).length,
      itensEmitidos: rotinas.reduce((total, rotina) => total + (rotina.itens_emitidos || 0), 0),
      tempoMedio: rotinas.length > 0 
        ? Math.round(rotinas.reduce((total, rotina) => total + (rotina.tempo_atividade || 0), 0) / rotinas.length)
        : 0
    };

    console.log('✅ [ESTATÍSTICAS API] Estatísticas de Rotinas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar estatísticas por período
router.get('/periodo', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { inicio, fim } = req.query;
    const user = req.user;

    console.log('🔍 [ESTATÍSTICAS API] Buscando estatísticas por período:', { inicio, fim });

    if (!inicio || !fim) {
      return res.status(400).json({ error: 'Data de início e fim são obrigatórias' });
    }

    // Buscar LVs do período
    const { data: lvs, error: errorLVs } = await supabase
      .from('lvs')
      .select('*')
      .eq('auth_user_id', user?.id || '')
      .gte('created_at', inicio as string)
      .lte('created_at', fim as string);

    if (errorLVs) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar LVs:', errorLVs);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Buscar termos do período
    const { data: termos, error: errorTermos } = await supabase
      .from('termos_ambientais')
      .select('*')
      .eq('auth_user_id', user?.id || '')
      .gte('created_at', inicio as string)
      .lte('created_at', fim as string);

    if (errorTermos) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar termos:', errorTermos);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    // Buscar rotinas do período
    const { data: rotinas, error: errorRotinas } = await supabase
      .from('atividades_rotina')
      .select('*')
      .eq('auth_user_id', user?.id || '')
      .gte('created_at', inicio as string)
      .lte('created_at', fim as string);

    if (errorRotinas) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar rotinas:', errorRotinas);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const estatisticas = {
      periodo: { inicio, fim },
      total_lvs: lvs?.length || 0,
      total_termos: termos?.length || 0,
      total_rotinas: rotinas?.length || 0
    };

    console.log('✅ [ESTATÍSTICAS API] Estatísticas do período:', estatisticas);
    res.json(estatisticas);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// ENDPOINTS PARA DASHBOARDS - DADOS AGREGADOS
// ===================================================================

// Evolução mensal de atividades (últimos 6 meses)
router.get('/evolucao-mensal', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log('📊 [ESTATÍSTICAS API] Buscando evolução mensal');

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

    console.log('🔐 [ESTATÍSTICAS API] Perfil:', perfilNome, '| Admin?', isAdmin);

    // Calcular últimos 6 meses
    const meses = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        ano: data.getFullYear(),
        mesNum: data.getMonth() + 1
      });
    }

    // Usar constante local para evitar erro de null
    const supaClient = supabaseAdmin;

    const evolucao = await Promise.all(meses.map(async ({ mes, ano, mesNum }) => {
      // LVs
      let queryLVs = supaClient
        .from('lvs')
        .select('id, percentual_conformidade', { count: 'exact' })
        .gte('created_at', `${ano}-${String(mesNum).padStart(2, '0')}-01`)
        .lt('created_at', `${mesNum === 12 ? ano + 1 : ano}-${String(mesNum === 12 ? 1 : mesNum + 1).padStart(2, '0')}-01`);

      if (!isAdminOrSup) {
        queryLVs = queryLVs.eq('auth_user_id', user?.id);
      }

      const { data: lvsData, count: countLVs } = await queryLVs;

      // Termos
      let queryTermos = supaClient
        .from('termos_ambientais')
        .select('id', { count: 'exact' })
        .gte('created_at', `${ano}-${String(mesNum).padStart(2, '0')}-01`)
        .lt('created_at', `${mesNum === 12 ? ano + 1 : ano}-${String(mesNum === 12 ? 1 : mesNum + 1).padStart(2, '0')}-01`);

      if (!isAdminOrSup) {
        queryTermos = queryTermos.eq('auth_user_id', user?.id);
      }

      const { count: countTermos } = await queryTermos;

      // Rotinas
      let queryRotinas = supaClient
        .from('atividades_rotina')
        .select('id', { count: 'exact' })
        .gte('created_at', `${ano}-${String(mesNum).padStart(2, '0')}-01`)
        .lt('created_at', `${mesNum === 12 ? ano + 1 : ano}-${String(mesNum === 12 ? 1 : mesNum + 1).padStart(2, '0')}-01`);

      if (!isAdminOrSup) {
        queryRotinas = queryRotinas.eq('auth_user_id', user?.id);
      }

      const { count: countRotinas } = await queryRotinas;

      // Calcular conformidade média do mês
      const conformidade = lvsData && lvsData.length > 0
        ? Math.round(lvsData.reduce((acc, lv) => acc + (lv.percentual_conformidade || 0), 0) / lvsData.length)
        : 0;

      return {
        mes,
        lvs: countLVs || 0,
        termos: countTermos || 0,
        rotinas: countRotinas || 0,
        conformidade
      };
    }));

    console.log('✅ [ESTATÍSTICAS API] Evolução mensal:', evolucao);
    res.json(evolucao);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro ao buscar evolução mensal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Conformidade por tipo de LV
router.get('/conformidade-por-tipo', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log('📊 [ESTATÍSTICAS API] Buscando conformidade por tipo');

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

    console.log('🔐 [ESTATÍSTICAS API] Perfil:', perfilNome, '| Admin?', isAdmin);

    let queryLVs = supabaseAdmin
      .from('lvs')
      .select('tipo_lv, nome_lv, percentual_conformidade');

    if (!isAdminOrSup) {
      queryLVs = queryLVs.eq('auth_user_id', user?.id);
    }

    const { data: lvs } = await queryLVs;

    const tipos = [
      { codigo: '01', nome: 'Resíduos', fill: '#10b981' },
      { codigo: '02', nome: 'Segurança', fill: '#3b82f6' },
      { codigo: '03', nome: 'Água', fill: '#06b6d4' },
      { codigo: '04', nome: 'Emissões', fill: '#f59e0b' },
      { codigo: '05', nome: 'Ruído', fill: '#8b5cf6' }
    ];

    const conformidadePorTipo = tipos.map(tipo => {
      const lvsDoTipo = lvs?.filter(lv => lv.tipo_lv === tipo.codigo) || [];
      const value = lvsDoTipo.length > 0
        ? Math.round(lvsDoTipo.reduce((acc, lv) => acc + (lv.percentual_conformidade || 0), 0) / lvsDoTipo.length)
        : 0;

      return {
        nome: tipo.nome,
        value,
        fill: tipo.fill
      };
    });

    console.log('✅ [ESTATÍSTICAS API] Conformidade por tipo:', conformidadePorTipo);
    res.json(conformidadePorTipo);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro ao buscar conformidade por tipo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atividades recentes (últimas 10)
router.get('/atividades-recentes', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log('📊 [ESTATÍSTICAS API] Buscando atividades recentes');

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

    console.log('🔐 [ESTATÍSTICAS API] Perfil:', perfilNome, '| Admin?', isAdmin);

    const atividades: any[] = [];

    // Buscar LVs recentes
    let queryLVs = supabaseAdmin
      .from('lvs')
      .select('id, created_at, status, tipo_lv, nome_lv, usuario_nome')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!isAdminOrSup) {
      queryLVs = queryLVs.eq('auth_user_id', user?.id);
    }

    const { data: lvsRecentes } = await queryLVs;

    lvsRecentes?.forEach(lv => {
      const acao = lv.status === 'concluido' || lv.status === 'concluida' ? 'completou' : 'iniciou';
      atividades.push({
        user: lv.usuario_nome || 'Usuário',
        action: `${acao} LV ${lv.nome_lv || lv.tipo_lv}`,
        time: lv.created_at,
        status: lv.status === 'concluido' || lv.status === 'concluida' ? 'success' : 'progress'
      });
    });

    // Buscar termos recentes
    let queryTermos = supabaseAdmin
      .from('termos_ambientais')
      .select('id, created_at, tipo_termo, emitido_por')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!isAdminOrSup) {
      queryTermos = queryTermos.eq('auth_user_id', user?.id);
    }

    const { data: termosRecentes } = await queryTermos;

    termosRecentes?.forEach(termo => {
      const tipoLabel = termo.tipo_termo === 'paralizacao' ? 'Paralização' :
                       termo.tipo_termo === 'notificacao' ? 'Notificação' : 'Recomendação';
      atividades.push({
        user: termo.emitido_por || 'Usuário',
        action: `emitiu ${tipoLabel}`,
        time: termo.created_at,
        status: 'warning'
      });
    });

    // Buscar rotinas recentes
    let queryRotinas = supabaseAdmin
      .from('atividades_rotina')
      .select('id, created_at, atividade, responsavel')
      .order('created_at', { ascending: false })
      .limit(2);

    if (!isAdminOrSup) {
      queryRotinas = queryRotinas.eq('auth_user_id', user?.id);
    }

    const { data: rotinasRecentes } = await queryRotinas;

    rotinasRecentes?.forEach(rotina => {
      atividades.push({
        user: rotina.responsavel || 'Usuário',
        action: `realizou ${rotina.atividade}`,
        time: rotina.created_at,
        status: 'info'
      });
    });

    // Ordenar por data e pegar as 10 mais recentes
    const atividadesOrdenadas = atividades
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)
      .map(ativ => {
        const diff = Date.now() - new Date(ativ.time).getTime();
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);

        let timeLabel = '';
        if (dias > 0) timeLabel = `${dias}d atrás`;
        else if (horas > 0) timeLabel = `${horas}h atrás`;
        else if (minutos > 0) timeLabel = `${minutos} min atrás`;
        else timeLabel = 'agora';

        return {
          user: ativ.user,
          action: ativ.action,
          time: timeLabel,
          status: ativ.status
        };
      });

    console.log('✅ [ESTATÍSTICAS API] Atividades recentes:', atividadesOrdenadas.length);
    res.json(atividadesOrdenadas);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS API] Erro ao buscar atividades recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 