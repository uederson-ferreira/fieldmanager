// ===================================================================
// ROTA DE SINCRONIZAÇÃO - ECOFIELD SYSTEM
// Localização: backend/src/routes/sync.ts
// ===================================================================

import express from 'express';
import { supabase, supabaseAdmin } from '../supabase';
import { authenticateUser } from '../middleware/auth';

const syncRouter = express.Router();

// POST /api/sync/usuario/:userId - Sincronizar dados do usuário
syncRouter.post('/usuario/:userId', authenticateUser, async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔄 [SYNC] Iniciando sincronização para usuário:', userId);
    
    // 1. Buscar dados do usuário
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        email,
        matricula,
        telefone,
        ativo,
        created_at,
        updated_at,
        perfil_id,
        perfis (*)
      `)
      .eq('auth_user_id', userId)
      .single();

    if (usuarioError || !usuario) {
      console.error('❌ [SYNC] Erro ao buscar usuário:', usuarioError?.message);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // 2. Buscar perfis ativos
    const { data: perfis, error: perfisError } = await supabase
      .from('perfis')
      .select('*')
      .eq('ativo', true);

    if (perfisError) {
      console.error('❌ [SYNC] Erro ao buscar perfis:', perfisError.message);
      return res.status(500).json({ error: 'Erro ao buscar perfis' });
    }

    // 3. Preparar dados do usuário
    const userData = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      matricula: usuario.matricula || '',
      telefone: usuario.telefone || '',
      ativo: usuario.ativo,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at,
      auth_user_id: userId
    };

    // 4. Preparar dados do perfil se existir
    let perfilData = null;
    if (usuario.perfil_id && usuario.perfis) {
      const perfil = Array.isArray(usuario.perfis) ? usuario.perfis[0] : usuario.perfis;
      
      if (perfil) {
        perfilData = {
          id: perfil.id,
          nome: perfil.nome,
          descricao: perfil.descricao,
          permissoes: perfil.permissoes || {},
          ativo: perfil.ativo ?? true,
          created_at: perfil.created_at,
          updated_at: perfil.updated_at,
        };
      }
    }

    // 5. Preparar lista de perfis
    const perfisList = perfis || [];

    console.log('✅ [SYNC] Dados sincronizados com sucesso');
    console.log('📊 [SYNC] Usuário:', userData.nome);
    console.log('📊 [SYNC] Perfil:', perfilData?.nome || 'Nenhum');
    console.log('📊 [SYNC] Total de perfis:', perfisList.length);

    res.json({
      success: true,
      user: userData,
      perfil: perfilData,
      perfis: perfisList,
      message: 'Dados sincronizados com sucesso'
    });
    
  } catch (error) {
    console.error('💥 [SYNC] Erro na sincronização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/sync/geral - Sincronizar dados gerais
syncRouter.post('/geral', authenticateUser, async (req: any, res) => {
  try {
    console.log('🔄 [SYNC] Iniciando sincronização de dados gerais...');
    
    // Buscar perfis ativos
    const { data: perfis, error: perfisError } = await supabase
      .from('perfis')
      .select('*')
      .eq('ativo', true);

    if (perfisError) {
      console.error('❌ [SYNC] Erro ao buscar perfis:', perfisError.message);
      return res.status(500).json({ error: 'Erro ao buscar perfis' });
    }

    console.log('✅ [SYNC] Dados gerais sincronizados:', perfis?.length || 0, 'perfis');

    res.json({
      success: true,
      perfis: perfis || [],
      message: 'Dados gerais sincronizados com sucesso'
    });
    
  } catch (error) {
    console.error('💥 [SYNC] Erro na sincronização geral:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default syncRouter; 