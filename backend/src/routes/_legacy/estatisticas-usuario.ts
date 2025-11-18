import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../supabase';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Estatísticas de LVs por usuário
router.get('/usuario/:userId/lvs', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    console.log('🔍 [ESTATÍSTICAS USUÁRIO] Buscando LVs do usuário:', userId);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar permissões
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';

    // Apenas admin/supervisor pode ver estatísticas de outros usuários
    if (!isAdmin && !isSupervisor && user?.id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para ver estes dados' });
    }

    // Buscar usuário alvo
    const { data: usuarioAlvo } = await supabaseAdmin
      .from('usuarios')
      .select('id, auth_user_id')
      .eq('id', userId)
      .single();

    if (!usuarioAlvo) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar LVs do usuário
    const { data: lvs, error } = await supabaseAdmin
      .from('lvs')
      .select('*')
      .eq('auth_user_id', usuarioAlvo.auth_user_id);

    if (error) {
      console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro ao buscar LVs:', error);
      return res.status(500).json({ error: 'Erro ao buscar LVs' });
    }

    const lvsCompletas = (lvs || []).filter(lv => lv.concluida);
    const lvsComPercentual = (lvs || []).filter(lv => lv.percentual_conformidade !== null && lv.percentual_conformidade !== undefined);

    // Calcular média de conformidade de TODAS as LVs que têm percentual (não apenas concluídas)
    const conformidadeMedia = lvsComPercentual.length > 0
      ? Math.round(lvsComPercentual.reduce((acc, lv) => acc + (lv.percentual_conformidade || 0), 0) / lvsComPercentual.length)
      : 0;

    const stats = {
      total: (lvs || []).length,
      completas: lvsCompletas.length,
      pendentes: (lvs || []).filter(lv => !lv.concluida).length,
      naoConformes: (lvs || []).filter(lv => lv.percentual_conformidade < 80).length,
      conformidadeMedia
    };

    console.log('✅ [ESTATÍSTICAS USUÁRIO] LVs:', stats);
    console.log('📊 [DEBUG] LVs com percentual:', lvsComPercentual.length, '| Média conformidade:', conformidadeMedia);

    // Debug: mostrar algumas LVs
    if ((lvs || []).length > 0) {
      console.log('📋 [DEBUG] Primeiras LVs:', (lvs || []).slice(0, 3).map(lv => ({
        id: lv.id,
        concluida: lv.concluida,
        percentual: lv.percentual_conformidade
      })));
    }

    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de Rotinas por usuário
router.get('/usuario/:userId/rotinas', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    console.log('🔍 [ESTATÍSTICAS USUÁRIO] Buscando rotinas do usuário:', userId);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar permissões
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';

    if (!isAdmin && !isSupervisor && user?.id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para ver estes dados' });
    }

    // Buscar usuário alvo
    const { data: usuarioAlvo } = await supabaseAdmin
      .from('usuarios')
      .select('id, auth_user_id')
      .eq('id', userId)
      .single();

    if (!usuarioAlvo) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar rotinas do usuário
    console.log('🔍 [DEBUG] Buscando rotinas para auth_user_id:', usuarioAlvo.auth_user_id);

    const { data: rotinas, error } = await supabaseAdmin
      .from('atividades_rotina')
      .select('*')
      .eq('auth_user_id', usuarioAlvo.auth_user_id);

    console.log('🔍 [DEBUG] Rotinas encontradas:', rotinas?.length || 0);

    if (error) {
      console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro ao buscar rotinas:', error);
      return res.status(500).json({ error: 'Erro ao buscar rotinas' });
    }

    const statusConcluidos = ['CONCLUIDA', 'CONCLUIDO', 'FINALIZADA'];
    const rotinasConcluidas = (rotinas || []).filter(r => statusConcluidos.includes((r.status || '').toUpperCase())).length;
    const totalNC = (rotinas || []).reduce((acc, r) => acc + (r.total_nao_conformes || 0), 0);

    const rotinasComTempo = (rotinas || []).filter(r => r.hora_inicio && r.hora_fim);
    const tempoMedio = rotinasComTempo.length > 0
      ? Math.round(rotinasComTempo.reduce((acc, rotina) => {
          const inicio = new Date(`2000-01-01T${rotina.hora_inicio}`);
          const fim = new Date(`2000-01-01T${rotina.hora_fim}`);
          return acc + (fim.getTime() - inicio.getTime()) / (1000 * 60);
        }, 0) / rotinasComTempo.length)
      : 0;

    const stats = {
      total: (rotinas || []).length,
      concluidas: rotinasConcluidas,
      pendentes: Math.max((rotinas || []).length - rotinasConcluidas, 0),
      naoConformes: totalNC,
      tempoMedio
    };

    console.log('✅ [ESTATÍSTICAS USUÁRIO] Rotinas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de Termos por usuário
router.get('/usuario/:userId/termos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    console.log('🔍 [ESTATÍSTICAS USUÁRIO] Buscando termos do usuário:', userId);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar permissões
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';

    if (!isAdmin && !isSupervisor && user?.id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para ver estes dados' });
    }

    // Buscar usuário alvo
    const { data: usuarioAlvo } = await supabaseAdmin
      .from('usuarios')
      .select('id, auth_user_id')
      .eq('id', userId)
      .single();

    if (!usuarioAlvo) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar termos do usuário
    const { data: termos, error } = await supabaseAdmin
      .from('termos_ambientais')
      .select('id, tipo_termo')
      .eq('auth_user_id', usuarioAlvo.auth_user_id);

    if (error) {
      console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro ao buscar termos:', error);
      return res.status(500).json({ error: 'Erro ao buscar termos' });
    }

    const notificacoes = (termos || []).filter(t => t.tipo_termo === 'NOTIFICACAO').length;
    const paralizacoes = (termos || []).filter(t => t.tipo_termo === 'PARALIZACAO_TECNICA').length;
    const recomendacoes = (termos || []).filter(t => t.tipo_termo === 'RECOMENDACAO').length;

    const stats = {
      total: (termos || []).length,
      notificacoes,
      paralizacoes,
      recomendacoes
    };

    console.log('✅ [ESTATÍSTICAS USUÁRIO] Termos:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Comparativo geral (médias de todos os usuários)
router.get('/comparativo-geral', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('🔍 [ESTATÍSTICAS USUÁRIO] Buscando comparativo geral');

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar permissões
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';

    if (!isAdmin && !isSupervisor) {
      return res.status(403).json({ error: 'Sem permissão para ver estes dados' });
    }

    // Buscar todas as LVs
    const { data: lvs, error: lvsError } = await supabaseAdmin
      .from('lvs')
      .select('auth_user_id, concluida, percentual_conformidade');

    console.log('📊 [DEBUG COMPARATIVO] Total LVs retornadas:', (lvs || []).length);
    if (lvsError) {
      console.error('❌ [DEBUG COMPARATIVO] Erro ao buscar LVs:', lvsError);
    }
    if ((lvs || []).length > 0) {
      console.log('📋 [DEBUG COMPARATIVO] Primeiras 3 LVs:', (lvs || []).slice(0, 3).map(lv => ({
        auth_user_id: lv.auth_user_id,
        concluida: lv.concluida,
        percentual: lv.percentual_conformidade
      })));
    }

    // Buscar todas as rotinas
    const { data: rotinas } = await supabaseAdmin
      .from('atividades_rotina')
      .select('auth_user_id, status, hora_inicio, hora_fim');

    // Buscar todos os termos
    const { data: termos } = await supabaseAdmin
      .from('termos_ambientais')
      .select('auth_user_id');

    // Buscar todos os usuários
    const { data: usuarios } = await supabaseAdmin
      .from('usuarios')
      .select('auth_user_id');

    const totalUsuarios = (usuarios || []).length || 1;

    // Calcular médias - considera TODAS as LVs que têm percentual de conformidade
    const lvsComConformidade = (lvs || []).filter(lv => lv.percentual_conformidade !== null && lv.percentual_conformidade !== undefined);
    const conformidadeGeral = lvsComConformidade.length > 0
      ? Math.round(lvsComConformidade.reduce((acc, lv) => acc + (lv.percentual_conformidade || 0), 0) / lvsComConformidade.length)
      : 0;

    console.log('📊 [DEBUG] Conformidade - Total LVs:', (lvs || []).length, '| Com conformidade:', lvsComConformidade.length, '| Média:', conformidadeGeral);

    // Buscar todas as metas com progresso
    const { data: todasMetas } = await supabaseAdmin
      .from('metas_atribuicoes')
      .select(`
        progresso_metas(percentual_alcancado)
      `);

    let somaPercentualMetas = 0;
    let totalMetasComProgresso = 0;

    (todasMetas || []).forEach((atrib: any) => {
      if (atrib.progresso_metas && atrib.progresso_metas.length > 0) {
        const percentual = atrib.progresso_metas[0].percentual_alcancado || 0;
        somaPercentualMetas += percentual;
        totalMetasComProgresso++;
      }
    });

    const percentualMedioMetas = totalMetasComProgresso > 0
      ? Math.round(somaPercentualMetas / totalMetasComProgresso)
      : 0;

    const stats = {
      lvs_media: Math.round((lvs || []).length / totalUsuarios),
      rotinas_media: Math.round((rotinas || []).length / totalUsuarios),
      termos_media: Math.round((termos || []).length / totalUsuarios),
      conformidade_geral: conformidadeGeral,
      metas_media: Math.round((todasMetas || []).length / totalUsuarios),
      percentual_medio_metas: percentualMedioMetas
    };

    console.log('✅ [ESTATÍSTICAS USUÁRIO] Comparativo geral:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de Metas por usuário
router.get('/usuario/:userId/metas', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    console.log('🔍 [ESTATÍSTICAS USUÁRIO] Buscando metas do usuário:', userId);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Verificar permissões
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';

    if (!isAdmin && !isSupervisor && user?.id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para ver estes dados' });
    }

    // Buscar usuário alvo
    const { data: usuarioAlvo } = await supabaseAdmin
      .from('usuarios')
      .select('id, auth_user_id')
      .eq('id', userId)
      .single();

    if (!usuarioAlvo) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar metas atribuídas ao usuário com progresso
    const { data: metasAtribuicoes, error } = await supabaseAdmin
      .from('metas_atribuicoes')
      .select(`
        id,
        meta_id,
        tma_id,
        meta_quantidade_individual,
        metas!inner(
          id,
          tipo_meta,
          descricao,
          periodo,
          ano,
          mes,
          ativa,
          progresso_metas(
            id,
            quantidade_atual,
            percentual_alcancado,
            status,
            ultima_atualizacao,
            tma_id
          )
        )
      `)
      .eq('tma_id', usuarioAlvo.id);

    console.log('📊 [DEBUG METAS] Atribuições encontradas:', (metasAtribuicoes || []).length);

    if (error) {
      console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro ao buscar metas:', error);
      return res.status(500).json({ error: 'Erro ao buscar metas' });
    }

    const metasAtivas = (metasAtribuicoes || []).filter(m => (m.metas as any)?.ativa);
    const totalMetas = metasAtivas.length;

    // Calcular estatísticas de progresso
    let totalConcluidas = 0;
    let totalEmAndamento = 0;
    let totalNaoIniciadas = 0;
    let somaPercentual = 0;
    let somaMetasQuantidadeIndividual = 0;

    // Separar por tipo de meta
    let metasLv = 0;
    let metasRotina = 0;
    let metasTermo = 0;

    metasAtivas.forEach(meta => {
      const metaObj = meta.metas as any;

      // Somar meta_quantidade_individual
      somaMetasQuantidadeIndividual += meta.meta_quantidade_individual || 0;

      // Separar por tipo_meta
      const tipoMeta = metaObj?.tipo_meta?.toLowerCase();
      const quantidade = meta.meta_quantidade_individual || 0;

      if (tipoMeta === 'lv') {
        metasLv += quantidade;
      } else if (tipoMeta === 'rotina') {
        metasRotina += quantidade;
      } else if (tipoMeta === 'termo') {
        metasTermo += quantidade;
      }

      // Buscar o progresso específico deste usuário (tma_id)
      const progresso = Array.isArray(metaObj?.progresso_metas) && metaObj.progresso_metas.length > 0
        ? metaObj.progresso_metas.find((p: any) => p.tma_id === usuarioAlvo.id)
        : null;

      console.log('📊 [DEBUG] Meta:', metaObj?.tipo_meta, metaObj?.descricao, '| TMA:', meta.tma_id, '| Quantidade:', meta.meta_quantidade_individual, '| Progresso:', progresso);

      if (progresso) {
        const percentual = progresso.percentual_alcancado || 0;
        somaPercentual += percentual;

        if (percentual >= 100) {
          totalConcluidas++;
        } else if (percentual > 0) {
          totalEmAndamento++;
        } else {
          totalNaoIniciadas++;
        }
      } else {
        totalNaoIniciadas++;
      }
    });

    const percentualMedio = totalMetas > 0 ? Math.round(somaPercentual / totalMetas) : 0;

    const stats = {
      total: totalMetas,
      quantidadeTotal: somaMetasQuantidadeIndividual,
      porTipo: {
        lv: metasLv,
        rotina: metasRotina,
        termo: metasTermo
      },
      concluidas: totalConcluidas,
      emAndamento: totalEmAndamento,
      naoIniciadas: totalNaoIniciadas,
      percentualMedio
    };

    console.log('✅ [ESTATÍSTICAS USUÁRIO] Metas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [ESTATÍSTICAS USUÁRIO] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
