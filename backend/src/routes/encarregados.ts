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
// LISTAR ENCARREGADOS COMPLETOS (COM EMPRESAS)
// ===================================================================
router.get('/encarregados-completos', async (req, res) => {
  try {
    console.log('👥 [API] Buscando encarregados completos...');
    
    const { data: encarregados, error } = await supabase
      .from('encarregados')
      .select(`
        id,
        nome_completo,
        apelido,
        telefone,
        ativo,
        created_at,
        updated_at,
        empresa_contratada_id,
        empresas_contratadas (
          id,
          nome,
          cnpj,
          ativa
        )
      `)
      .eq('ativo', true)
      .order('nome_completo');

    if (error) {
      console.error('❌ [API] Erro ao buscar encarregados:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar encarregados',
        message: error.message 
      });
    }

    // Formatar dados para o frontend
    const encarregadosFormatados = (encarregados || []).map((enc) => ({
      id: enc.id,
      nome_completo: enc.nome_completo,
      apelido: enc.apelido,
      telefone: enc.telefone,
      ativo: enc.ativo,
      empresa: Array.isArray(enc.empresas_contratadas) && enc.empresas_contratadas[0] ? {
        id: enc.empresas_contratadas[0].id,
        nome: enc.empresas_contratadas[0].nome,
        cnpj: enc.empresas_contratadas[0].cnpj
      } : null,
      created_at: enc.created_at,
      updated_at: enc.updated_at
    }));

    res.json({ 
      encarregados: encarregadosFormatados,
      total: encarregadosFormatados.length
    });

  } catch (error) {
    console.error('❌ [API] Erro interno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// CRIAR NOVO ENCARREGADO
// ===================================================================
router.post('/criar-encarregado', async (req, res) => {
  try {
    console.log('➕ [API] Criando novo encarregado...');
    
    const { nome_completo, apelido, telefone, empresa_contratada_id } = req.body;
    
    // Validações
    if (!nome_completo || nome_completo.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Nome completo é obrigatório e deve ter pelo menos 3 caracteres' 
      });
    }

    // Verificar se empresa existe (se fornecida)
    if (empresa_contratada_id) {
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas_contratadas')
        .select('id, nome')
        .eq('id', empresa_contratada_id)
        .eq('ativa', true)
        .limit(1);

      if (empresaError || !empresa || empresa.length === 0) {
        return res.status(400).json({ 
          error: 'Empresa contratada não encontrada ou inativa' 
        });
      }
    }

    // Criar encarregado
    const { data: novoEncarregadoArr, error } = await supabase
      .from('encarregados')
      .insert({
        nome_completo: nome_completo.trim(),
        apelido: apelido?.trim() || null,
        telefone: telefone?.trim() || null,
        empresa_contratada_id: empresa_contratada_id || null,
        ativo: true
      })
      .select(`
        id,
        nome_completo,
        apelido,
        telefone,
        ativo,
        created_at,
        updated_at,
        empresa_contratada_id,
        empresas_contratadas (
          id,
          nome,
          cnpj
        )
      `);

    if (error) {
      console.error('❌ [API] Erro ao criar encarregado:', error);
      return res.status(500).json({ 
        error: 'Erro ao criar encarregado',
        message: error.message 
      });
    }

    const novoEncarregado = novoEncarregadoArr && Array.isArray(novoEncarregadoArr) ? novoEncarregadoArr[0] : novoEncarregadoArr;

    // Formatar resposta
    const encarregadoFormatado = {
      id: novoEncarregado.id,
      nome_completo: novoEncarregado.nome_completo,
      apelido: novoEncarregado.apelido,
      telefone: novoEncarregado.telefone,
      ativo: novoEncarregado.ativo,
      empresa: Array.isArray(novoEncarregado.empresas_contratadas) && novoEncarregado.empresas_contratadas[0] ? {
        id: novoEncarregado.empresas_contratadas[0].id,
        nome: novoEncarregado.empresas_contratadas[0].nome,
        cnpj: novoEncarregado.empresas_contratadas[0].cnpj
      } : null,
      created_at: novoEncarregado.created_at,
      updated_at: novoEncarregado.updated_at
    };

    res.status(201).json({ 
      encarregado: encarregadoFormatado,
      message: 'Encarregado criado com sucesso'
    });

  } catch (error) {
    console.error('❌ [API] Erro interno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// ATUALIZAR ENCARREGADO
// ===================================================================
router.put('/atualizar-encarregado/:id', async (req, res) => {
  try {
    console.log('✏️ [API] Atualizando encarregado...');
    
    const { id } = req.params;
    const { nome_completo, apelido, telefone, empresa_contratada_id, ativo } = req.body;
    
    // Validações
    if (!id) {
      return res.status(400).json({ error: 'ID do encarregado é obrigatório' });
    }

    if (!nome_completo || nome_completo.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Nome completo é obrigatório e deve ter pelo menos 3 caracteres' 
      });
    }

    // Verificar se encarregado existe
    const { data: encarregadoExistente, error: checkError } = await supabase
      .from('encarregados')
      .select('id')
      .eq('id', id)
      .limit(1);

    if (checkError || !encarregadoExistente || encarregadoExistente.length === 0) {
      return res.status(404).json({ error: 'Encarregado não encontrado' });
    }

    // Verificar se empresa existe (se fornecida)
    if (empresa_contratada_id) {
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas_contratadas')
        .select('id, nome')
        .eq('id', empresa_contratada_id)
        .eq('ativa', true)
        .limit(1);

      if (empresaError || !empresa || empresa.length === 0) {
        return res.status(400).json({ 
          error: 'Empresa contratada não encontrada ou inativa' 
        });
      }
    }

    // Atualizar encarregado
    const { data: encarregadoAtualizadoArr, error } = await supabase
      .from('encarregados')
      .update({
        nome_completo: nome_completo.trim(),
        apelido: apelido?.trim() || null,
        telefone: telefone?.trim() || null,
        empresa_contratada_id: empresa_contratada_id || null,
        ativo: ativo !== undefined ? ativo : true
      })
      .eq('id', id)
      .select(`
        id,
        nome_completo,
        apelido,
        telefone,
        ativo,
        created_at,
        updated_at,
        empresa_contratada_id,
        empresas_contratadas (
          id,
          nome,
          cnpj
        )
      `);

    if (error) {
      console.error('❌ [API] Erro ao atualizar encarregado:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar encarregado',
        message: error.message 
      });
    }

    const encarregadoAtualizado = encarregadoAtualizadoArr && Array.isArray(encarregadoAtualizadoArr) ? encarregadoAtualizadoArr[0] : encarregadoAtualizadoArr;

    // Formatar resposta
    const encarregadoFormatado = {
      id: encarregadoAtualizado.id,
      nome_completo: encarregadoAtualizado.nome_completo,
      apelido: encarregadoAtualizado.apelido,
      telefone: encarregadoAtualizado.telefone,
      ativo: encarregadoAtualizado.ativo,
      empresa: Array.isArray(encarregadoAtualizado.empresas_contratadas) && encarregadoAtualizado.empresas_contratadas[0] ? {
        id: encarregadoAtualizado.empresas_contratadas[0].id,
        nome: encarregadoAtualizado.empresas_contratadas[0].nome,
        cnpj: encarregadoAtualizado.empresas_contratadas[0].cnpj
      } : null,
      created_at: encarregadoAtualizado.created_at,
      updated_at: encarregadoAtualizado.updated_at
    };

    res.json({ 
      encarregado: encarregadoFormatado,
      message: 'Encarregado atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ [API] Erro interno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// LISTAR EMPRESAS CONTRATADAS (PARA DROPDOWN)
// ===================================================================
router.get('/empresas-contratadas', async (req, res) => {
  try {
    console.log('🏢 [API] Buscando empresas contratadas...');
    
    const { data: empresas, error } = await supabase
      .from('empresas_contratadas')
      .select('id, nome, cnpj')
      .eq('ativa', true)
      .order('nome');

    if (error) {
      console.error('❌ [API] Erro ao buscar empresas:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar empresas',
        message: error.message 
      });
    }

    res.json({ 
      empresas: empresas || [],
      total: empresas?.length || 0
    });

  } catch (error) {
    console.error('❌ [API] Erro interno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router; 