// ===================================================================
// ROTA DE HISTÓRICO - ECOFIELD SYSTEM
// Localização: backend/src/routes/historico.ts
// ===================================================================

import express from 'express';
import { supabase, supabaseAdmin } from '../supabase';
import { authenticateUser } from '../middleware/auth';

const historicoRouter = express.Router();

// GET /api/historico/usuario/:userId - Buscar histórico completo do usuário
historicoRouter.get('/usuario/:userId', authenticateUser, async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 [HISTÓRICO] Buscando histórico para usuário:', userId);
    
    // Buscar dados em paralelo
    const [
      termosResult,
      lvsResult,
      lvResiduosResult,
      rotinasResult
    ] = await Promise.all([
      // Termos Ambientais
      supabase
        .from('termos_ambientais')
        .select('*')
        .eq('emitido_por_usuario_id', userId)
        .order('created_at', { ascending: false }),
      
      // LVs (Listas de Verificação)
      supabase
        .from('lvs')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false }),
      
      // LVs de Resíduos
      supabase
        .from('lv_residuos')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false }),
      
      // Rotinas/Atividades
      supabase
        .from('atividades_rotina')
        .select('*')
        .eq('tma_responsavel_id', userId)
        .order('created_at', { ascending: false })
    ]);
    
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