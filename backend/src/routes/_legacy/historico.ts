// ===================================================================
// ROTA DE HISTÓRICO - ECOFIELD SYSTEM
// Localização: backend/src/routes/historico.ts
// ===================================================================

import express from 'express';
import { supabase, supabaseAdmin } from '../../supabase';
import { authenticateUser } from '../../middleware/auth';

const historicoRouter = express.Router();

// GET /api/historico/usuario/:userId - Buscar histórico completo do usuário
historicoRouter.get('/usuario/:userId', authenticateUser, async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 [HISTÓRICO] Buscando histórico para usuário:', userId);
    
    // Usar supabaseAdmin para bypass RLS
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Converter userId (pode ser auth_user_id) para usuarios.id se necessário
    let usuarioIdFinal = userId;
    
    // Verificar se o userId existe na tabela usuarios
    const { data: usuarioExistente } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('id', userId)
      .single();

    // Se não encontrou, tentar buscar por auth_user_id
    if (!usuarioExistente) {
      console.log(`🔍 [HISTÓRICO] userId não encontrado em usuarios, tentando buscar por auth_user_id: ${userId}`);
      
      const { data: usuarioPorAuth, error: authError } = await supabaseAdmin
        .from('usuarios')
        .select('id, auth_user_id, nome, email')
        .eq('auth_user_id', userId)
        .single();

      if (authError) {
        console.log(`⚠️ [HISTÓRICO] Erro ao buscar por auth_user_id:`, authError.message);
      }

      if (usuarioPorAuth) {
        usuarioIdFinal = usuarioPorAuth.id;
        console.log(`✅ [HISTÓRICO] Usuário encontrado por auth_user_id: ${userId} -> usuarios.id: ${usuarioIdFinal} (${usuarioPorAuth.nome})`);
      } else {
        console.log(`⚠️ [HISTÓRICO] Usuário não encontrado nem por id nem por auth_user_id: ${userId}`);
      }
    } else {
      console.log(`✅ [HISTÓRICO] Usuário encontrado diretamente: ${userId}`);
    }

    console.log(`🔍 [HISTÓRICO] Buscando histórico com usuarioIdFinal: ${usuarioIdFinal}, userId original: ${userId}`);

    // Buscar dados em paralelo
    const [
      termosResult,
      lvsResult,
      lvResiduosResult,
      rotinasResult,
      execucoesResult
    ] = await Promise.all([
      // Termos Ambientais - buscar por emitido_por_usuario_id OU auth_user_id
      supabaseAdmin
        .from('termos_ambientais')
        .select('*')
        .or(`emitido_por_usuario_id.eq.${usuarioIdFinal},auth_user_id.eq.${userId}`)
        .order('created_at', { ascending: false }),
      
      // LVs (Listas de Verificação) - buscar por usuario_id OU auth_user_id
      supabaseAdmin
        .from('lvs')
        .select('*')
        .or(`usuario_id.eq.${usuarioIdFinal},auth_user_id.eq.${userId}`)
        .order('created_at', { ascending: false }),
      
      // LVs de Resíduos - buscar por usuario_id OU auth_user_id
      supabaseAdmin
        .from('lv_residuos')
        .select('*')
        .or(`usuario_id.eq.${usuarioIdFinal},auth_user_id.eq.${userId}`)
        .order('created_at', { ascending: false }),
      
      // Rotinas/Atividades - buscar por tma_responsavel_id OU auth_user_id
      supabaseAdmin
        .from('atividades_rotina')
        .select('*')
        .or(`tma_responsavel_id.eq.${usuarioIdFinal},auth_user_id.eq.${userId}`)
        .order('created_at', { ascending: false }),
      
      // Execuções - buscar por usuario_id (já convertido)
      supabaseAdmin
        .from('execucoes')
        .select('*')
        .eq('usuario_id', usuarioIdFinal)
        .order('created_at', { ascending: false })
    ]);

    // Log de resultados
    console.log(`📊 [HISTÓRICO] Resultados encontrados:`, {
      termos: termosResult.data?.length || 0,
      lvs: lvsResult.data?.length || 0,
      lvResiduos: lvResiduosResult.data?.length || 0,
      rotinas: rotinasResult.data?.length || 0,
      execucoes: execucoesResult.data?.length || 0
    });

    // Verificar erros
    if (termosResult.error) console.error('❌ [HISTÓRICO] Erro ao buscar termos:', termosResult.error);
    if (lvsResult.error) console.error('❌ [HISTÓRICO] Erro ao buscar LVs:', lvsResult.error);
    if (lvResiduosResult.error) console.error('❌ [HISTÓRICO] Erro ao buscar LVs Resíduos:', lvResiduosResult.error);
    if (rotinasResult.error) console.error('❌ [HISTÓRICO] Erro ao buscar rotinas:', rotinasResult.error);
    if (execucoesResult.error) console.error('❌ [HISTÓRICO] Erro ao buscar execuções:', execucoesResult.error);
    
    // Processar resultados
    const historicoCompleto: any[] = [];
    
    // Processar Termos Ambientais
    if (termosResult.data) {
      termosResult.data.forEach(termo => {
        historicoCompleto.push({
          id: termo.id,
          tipo: 'termo',
          titulo: `Termo ${termo.tipo_termo}`,
          descricao: termo.descricao || 'Termo ambiental emitido',
          data_criacao: termo.created_at,
          status: termo.status || 'Emitido',
          local: termo.local_ocorrencia,
          observacoes: termo.observacoes
        });
      });
    }
    
    // Processar LVs
    if (lvsResult.data) {
      lvsResult.data.forEach(lv => {
        historicoCompleto.push({
          id: lv.id,
          tipo: 'lv',
          titulo: `LV ${lv.tipo_lv}`,
          descricao: `Lista de verificação ${lv.tipo_lv}`,
          data_criacao: lv.created_at,
          status: lv.status || 'Concluída',
          local: lv.local_inspecao,
          observacoes: lv.observacoes
        });
      });
    }
    
    // Processar LVs de Resíduos
    if (lvResiduosResult.data) {
      lvResiduosResult.data.forEach(lv => {
        historicoCompleto.push({
          id: lv.id,
          tipo: 'lv_residuos',
          titulo: 'LV Resíduos',
          descricao: 'Lista de verificação de resíduos',
          data_criacao: lv.created_at,
          status: lv.status || 'Concluída',
          local: lv.local_inspecao,
          observacoes: lv.observacoes
        });
      });
    }
    
    // Processar Rotinas
    if (rotinasResult.data) {
      rotinasResult.data.forEach(rotina => {
        historicoCompleto.push({
          id: rotina.id,
          tipo: 'rotina',
          titulo: rotina.titulo || 'Atividade de Rotina',
          descricao: rotina.descricao || 'Atividade de rotina realizada',
          data_criacao: rotina.created_at,
          status: rotina.status || 'Concluída',
          local: rotina.local_atividade,
          observacoes: rotina.observacoes
        });
      });
    }

    // Processar Execuções
    if (execucoesResult.data) {
      execucoesResult.data.forEach(execucao => {
        historicoCompleto.push({
          id: execucao.id,
          tipo: 'execucao',
          titulo: execucao.numero_documento || 'Execução de Checklist',
          descricao: `Execução de checklist - ${execucao.local_atividade || 'Local não informado'}`,
          data_criacao: execucao.created_at || execucao.data_execucao,
          status: execucao.status || 'Concluída',
          local: execucao.local_atividade,
          observacoes: execucao.observacoes
        });
      });
    }
    
    // Ordenar por data (mais recente primeiro)
    historicoCompleto.sort((a, b) => 
      new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
    );
    
    console.log('✅ [HISTÓRICO] Histórico encontrado:', historicoCompleto.length, 'itens');
    
    res.json({
      historico: historicoCompleto,
      total: historicoCompleto.length
    });
    
  } catch (error) {
    console.error('❌ [HISTÓRICO] Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default historicoRouter; 