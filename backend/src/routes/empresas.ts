import express, { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router: express.Router = Router();

// Configuração do Supabase com service role
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===================================================================
// LISTAR TODAS AS EMPRESAS CONTRATADAS
// ===================================================================
router.get('/empresas', async (req, res) => {
  try {
    console.log('📋 [EMPRESAS API] Listando todas as empresas contratadas...');

    const { data, error } = await supabase
      .from('empresas_contratadas')
      .select('*')
      .eq('ativa', true)
      .order('nome');

    if (error) {
      console.error('❌ [EMPRESAS API] Erro ao buscar empresas:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }

    console.log(`✅ [EMPRESAS API] ${data?.length || 0} empresas encontradas`);
    res.json({ 
      success: true, 
      empresas: data || [],
      total: data?.length || 0
    });

  } catch (error) {
    console.error('❌ [EMPRESAS API] Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// BUSCAR EMPRESA POR ID
// ===================================================================
router.get('/empresa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [EMPRESAS API] Buscando empresa com ID: ${id}`);

    const { data, error } = await supabase
      .from('empresas_contratadas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [EMPRESAS API] Erro ao buscar empresa:', error);
      return res.status(404).json({ 
        error: 'Empresa não encontrada',
        details: error.message 
      });
    }

    console.log(`✅ [EMPRESAS API] Empresa encontrada: ${data.nome}`);
    res.json({ 
      success: true, 
      empresa: data
    });

  } catch (error) {
    console.error('❌ [EMPRESAS API] Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// CRIAR NOVA EMPRESA
// ===================================================================
router.post('/criar-empresa', async (req, res) => {
  try {
    const { nome, cnpj, endereco, telefone, email, responsavel } = req.body;
    console.log('➕ [EMPRESAS API] Criando nova empresa:', { nome, cnpj });

    // Validações básicas
    if (!nome || !cnpj) {
      return res.status(400).json({ 
        error: 'Nome e CNPJ são obrigatórios' 
      });
    }

    const novaEmpresa = {
      nome: nome.trim(),
      cnpj: cnpj.trim(),
      endereco: endereco?.trim() || null,
      telefone: telefone?.trim() || null,
      email: email?.trim() || null,
      responsavel: responsavel?.trim() || null,
      ativa: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('empresas_contratadas')
      .insert([novaEmpresa])
      .select()
      .single();

    if (error) {
      console.error('❌ [EMPRESAS API] Erro ao criar empresa:', error);
      return res.status(500).json({ 
        error: 'Erro ao criar empresa',
        details: error.message 
      });
    }

    console.log(`✅ [EMPRESAS API] Empresa criada com sucesso: ${data.nome} (ID: ${data.id})`);
    res.status(201).json({ 
      success: true, 
      empresa: data,
      message: 'Empresa criada com sucesso'
    });

  } catch (error) {
    console.error('❌ [EMPRESAS API] Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// ATUALIZAR EMPRESA
// ===================================================================
router.put('/atualizar-empresa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cnpj, endereco, telefone, email, responsavel, ativa } = req.body;
    console.log(`✏️ [EMPRESAS API] Atualizando empresa ID: ${id}`);

    const dadosAtualizacao = {
      nome: nome?.trim(),
      cnpj: cnpj?.trim(),
      endereco: endereco?.trim() || null,
      telefone: telefone?.trim() || null,
      email: email?.trim() || null,
      responsavel: responsavel?.trim() || null,
      ativa: ativa !== undefined ? ativa : true,
      updated_at: new Date().toISOString()
    };

    // Remove campos undefined
    Object.keys(dadosAtualizacao).forEach(key => {
      if (dadosAtualizacao[key as keyof typeof dadosAtualizacao] === undefined) {
        delete dadosAtualizacao[key as keyof typeof dadosAtualizacao];
      }
    });

    const { data, error } = await supabase
      .from('empresas_contratadas')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [EMPRESAS API] Erro ao atualizar empresa:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar empresa',
        details: error.message 
      });
    }

    console.log(`✅ [EMPRESAS API] Empresa atualizada com sucesso: ${data.nome}`);
    res.json({ 
      success: true, 
      empresa: data,
      message: 'Empresa atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ [EMPRESAS API] Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// DELETAR EMPRESA (SOFT DELETE)
// ===================================================================
router.delete('/deletar-empresa/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ [EMPRESAS API] Deletando empresa ID: ${id}`);

    const { data, error } = await supabase
      .from('empresas_contratadas')
      .update({ 
        ativa: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [EMPRESAS API] Erro ao deletar empresa:', error);
      return res.status(500).json({ 
        error: 'Erro ao deletar empresa',
        details: error.message 
      });
    }

    console.log(`✅ [EMPRESAS API] Empresa deletada com sucesso: ${data.nome}`);
    res.json({ 
      success: true, 
      empresa: data,
      message: 'Empresa deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ [EMPRESAS API] Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// BUSCAR EMPRESAS POR NOME (PESQUISA)
// ===================================================================
router.get('/buscar-empresas', async (req, res) => {
  try {
    const { nome } = req.query;
    console.log(`🔍 [EMPRESAS API] Buscando empresas com nome: ${nome}`);

    let query = supabase
      .from('empresas_contratadas')
      .select('*')
      .eq('ativa', true);

    if (nome) {
      query = query.ilike('nome', `%${nome}%`);
    }

    const { data, error } = await query.order('nome');

    if (error) {
      console.error('❌ [EMPRESAS API] Erro ao buscar empresas:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }

    console.log(`✅ [EMPRESAS API] ${data?.length || 0} empresas encontradas`);
    res.json({ 
      success: true, 
      empresas: data || [],
      total: data?.length || 0
    });

  } catch (error) {
    console.error('❌ [EMPRESAS API] Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router; 