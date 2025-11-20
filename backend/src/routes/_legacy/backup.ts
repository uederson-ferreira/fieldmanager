// ===================================================================
// API DE BACKUP - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/backup.ts
// ===================================================================

import express from 'express';
import { supabase } from '../supabase';
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
    console.error('❌ [BACKUP API] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Listar tabelas disponíveis para backup
router.get('/tabelas', authenticateUser, async (req: Request, res: Response) => {
  try {
    const _user = req.user;

    console.log('🔍 [BACKUP API] Listando tabelas disponíveis');

    const tabelas = [
      // Usuários e Perfis
      'usuarios',
      'perfis',

      // Estrutura
      'areas',
      'categorias_lv',
      'empresas_contratadas',

      // LVs
      'lvs',
      'lv_avaliacoes',
      'lv_fotos',

      // Termos Ambientais
      'termos_ambientais',
      'termos_fotos',

      // Atividades e Rotinas
      'atividades_rotina',

      // Metas
      'metas',
      'metas_atribuicoes',
      'progresso_metas',

      // Ações Corretivas
      'acoes_corretivas',
      'historico_acoes',
      'comentarios_acoes',

      // Sistema
      'configuracoes',
      'logs'
    ];

    console.log('✅ [BACKUP API] Tabelas disponíveis:', tabelas.length);
    res.json({ tabelas });
  } catch (error) {
    console.error('❌ [BACKUP API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Fazer backup de uma tabela específica
router.get('/:tabela', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { tabela } = req.params;

    console.log('💾 [BACKUP API] Fazendo backup da tabela:', tabela);

    // Validar tabela
    const tabelasValidas = [
      'usuarios', 'perfis', 'areas', 'categorias_lv', 'empresas_contratadas',
      'lvs', 'lv_avaliacoes', 'lv_fotos', 'termos_ambientais', 'termos_fotos',
      'atividades_rotina', 'metas', 'metas_atribuicoes', 'progresso_metas',
      'acoes_corretivas', 'historico_acoes', 'comentarios_acoes',
      'configuracoes', 'logs'
    ];

    if (!tabelasValidas.includes(tabela)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    // Buscar dados da tabela
    const { data, error } = await supabase
      .from(tabela)
      .select('*');

    if (error) {
      console.error('❌ [BACKUP API] Erro ao buscar dados:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados' });
    }

    const backup = {
      tabela,
      timestamp: new Date().toISOString(),
      total_registros: data?.length || 0,
      dados: data || []
    };

    console.log('✅ [BACKUP API] Backup criado:', backup.tabela, backup.total_registros, 'registros');
    res.json(backup);
  } catch (error) {
    console.error('❌ [BACKUP API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Restaurar dados de uma tabela
router.post('/:tabela/restaurar', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { tabela } = req.params;
    const { dados } = req.body;

    console.log('🔄 [BACKUP API] Restaurando dados da tabela:', tabela);

    // Validar tabela
    const tabelasValidas = [
      'usuarios', 'perfis', 'areas', 'categorias_lv', 'empresas_contratadas',
      'lvs', 'lv_avaliacoes', 'lv_fotos', 'termos_ambientais', 'termos_fotos',
      'atividades_rotina', 'metas', 'metas_atribuicoes', 'progresso_metas',
      'acoes_corretivas', 'historico_acoes', 'comentarios_acoes',
      'configuracoes', 'logs'
    ];

    if (!tabelasValidas.includes(tabela)) {
      return res.status(400).json({ error: 'Tabela inválida' });
    }

    if (!dados || !Array.isArray(dados)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Limpar tabela existente
    const { error: deleteError } = await supabase
      .from(tabela)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('❌ [BACKUP API] Erro ao limpar tabela:', deleteError);
      return res.status(500).json({ error: 'Erro ao limpar tabela' });
    }

    // Inserir novos dados
    const { data, error: insertError } = await supabase
      .from(tabela)
      .insert(dados)
      .select();

    if (insertError) {
      console.error('❌ [BACKUP API] Erro ao restaurar dados:', insertError);
      return res.status(500).json({ error: 'Erro ao restaurar dados' });
    }

    console.log('✅ [BACKUP API] Dados restaurados:', data?.length || 0, 'registros');
    res.json({
      success: true,
      total_restaurado: data?.length || 0,
      tabela
    });
  } catch (error) {
    console.error('❌ [BACKUP API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Backup completo do sistema
router.get('/completo/sistema', authenticateUser, async (req: Request, res: Response) => {
  try {
    console.log('📊 [BACKUP API] Iniciando backup completo do sistema');
    
    const backupCompleto: {
      timestamp: string;
      tabelas: Record<string, unknown>;
    } = {
      timestamp: new Date().toISOString(),
      tabelas: {}
    };
    
    // Lista de tabelas para backup
    const tabelas = [
      'usuarios',
      'areas',
      'categorias_lv',
      'versoes_lv',
      'perguntas_lv',
      'metas_sistema',
      'progresso_metas',
      'termos_ambientais',
      'termos_fotos',
      'lv_residuos',
      'lv_residuos_avaliacoes',
      'lv_residuos_fotos',
      'atividades_rotina',
      'fotos_rotina',
      'configuracoes_sistema',
      'logs_sistema'
    ];
    
    // Exportar cada tabela
    for (const tabela of tabelas) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*');
        
        if (error) {
          console.warn(`⚠️ [BACKUP API] Erro ao exportar ${tabela}:`, error);
          backupCompleto.tabelas[tabela] = { error: error.message };
        } else {
          backupCompleto.tabelas[tabela] = data || [];
          console.log(`✅ [BACKUP API] ${tabela}: ${data?.length || 0} registros`);
        }
      } catch (tableError) {
        console.error(`❌ [BACKUP API] Erro crítico em ${tabela}:`, tableError);
        backupCompleto.tabelas[tabela] = { error: 'Erro crítico' };
      }
    }
    
    console.log('✅ [BACKUP API] Backup completo finalizado');
    res.json({ 
      success: true, 
      data: backupCompleto
    });
  } catch (error) {
    console.error('❌ [BACKUP API] Erro interno:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router; 