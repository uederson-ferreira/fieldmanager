import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ================================================================
// GET /api/execucoes
// Retorna execuções (inspeções/checklists realizados)
// ================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, moduloId, usuarioId, status, limit = 50, offset = 0 } = req.query;

    console.log('📋 [EXECUCOES] Buscando execuções');

    let query = supabase
      .from('execucoes')
      .select(`
        *,
        modulos:modulo_id (
          id,
          codigo,
          nome,
          tipo_modulo,
          icone
        )
      `, { count: 'exact' })
      .order('data_execucao', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Filtros opcionais
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (moduloId) {
      query = query.eq('modulo_id', moduloId);
    }

    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ [EXECUCOES] Erro ao buscar:', error);
      return res.status(500).json({
        error: 'Erro ao buscar execuções',
        details: error.message
      });
    }

    console.log(`✅ [EXECUCOES] ${data.length} execuções encontradas (total: ${count})`);
    return res.json({
      data,
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    });

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/execucoes/:id
// Retorna uma execução específica com todas as respostas e fotos
// ================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 [EXECUCOES] Buscando execução: ${id}`);

    // Buscar execução
    const { data: execucao, error: execError } = await supabase
      .from('execucoes')
      .select(`
        *,
        modulos:modulo_id (
          id,
          codigo,
          nome,
          tipo_modulo,
          configuracao,
          icone
        )
      `)
      .eq('id', id)
      .single();

    if (execError) {
      if (execError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Execução não encontrada' });
      }
      console.error('❌ [EXECUCOES] Erro ao buscar execução:', execError);
      return res.status(500).json({
        error: 'Erro ao buscar execução',
        details: execError.message
      });
    }

    // Buscar respostas
    const { data: respostas, error: respError } = await supabase
      .from('execucoes_respostas')
      .select(`
        *,
        pergunta:pergunta_id (
          codigo,
          pergunta,
          categoria,
          tipo_resposta
        )
      `)
      .eq('execucao_id', id);

    if (respError) {
      console.error('❌ [EXECUCOES] Erro ao buscar respostas:', respError);
    }

    // Buscar fotos
    const { data: fotos, error: fotosError } = await supabase
      .from('execucoes_fotos')
      .select('*')
      .eq('execucao_id', id);

    if (fotosError) {
      console.error('❌ [EXECUCOES] Erro ao buscar fotos:', fotosError);
    }

    const resultado = {
      ...execucao,
      respostas: respostas || [],
      fotos: fotos || []
    };

    console.log(`✅ [EXECUCOES] Execução encontrada com ${respostas?.length || 0} respostas e ${fotos?.length || 0} fotos`);
    return res.json(resultado);

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// POST /api/execucoes
// Cria uma nova execução (inspeção/checklist)
// ================================================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      tenant_id,
      modulo_id,
      usuario_id,
      respostas,
      fotos,
      ...dadosExecucao
    } = req.body;

    // Validações básicas
    if (!tenant_id || !modulo_id || !usuario_id) {
      return res.status(400).json({
        error: 'Campos obrigatórios: tenant_id, modulo_id, usuario_id'
      });
    }

    console.log(`📋 [EXECUCOES] Criando execução para módulo: ${modulo_id}`);

    // Criar execução
    const { data: execucao, error: execError } = await supabase
      .from('execucoes')
      .insert({
        tenant_id,
        modulo_id,
        usuario_id,
        status: dadosExecucao.status || 'concluido',
        ...dadosExecucao
      })
      .select()
      .single();

    if (execError) {
      console.error('❌ [EXECUCOES] Erro ao criar execução:', execError);
      return res.status(500).json({
        error: 'Erro ao criar execução',
        details: execError.message
      });
    }

    const execucaoId = execucao.id;
    console.log(`✅ [EXECUCOES] Execução criada: ${execucaoId}`);
    console.log(`   Número documento: ${execucao.numero_documento}`);

    // Inserir respostas se fornecidas
    if (respostas && respostas.length > 0) {
      console.log(`📝 [EXECUCOES] Inserindo ${respostas.length} respostas`);

      const respostasFormatadas = respostas.map((r: any) => ({
        execucao_id: execucaoId,
        pergunta_id: r.pergunta_id,
        pergunta_codigo: r.pergunta_codigo,
        resposta: r.resposta,
        resposta_booleana: r.resposta_booleana,
        observacao: r.observacao
      }));

      const { error: respError } = await supabase
        .from('execucoes_respostas')
        .insert(respostasFormatadas);

      if (respError) {
        console.error('❌ [EXECUCOES] Erro ao inserir respostas:', respError);
        // Não falhar a requisição, mas logar o erro
      } else {
        console.log(`✅ [EXECUCOES] ${respostas.length} respostas inseridas`);
      }
    }

    // Inserir fotos se fornecidas
    if (fotos && fotos.length > 0) {
      console.log(`📸 [EXECUCOES] Inserindo ${fotos.length} fotos`);

      const fotosFormatadas = fotos.map((f: any) => ({
        execucao_id: execucaoId,
        pergunta_id: f.pergunta_id,
        pergunta_codigo: f.pergunta_codigo,
        nome_arquivo: f.nome_arquivo,
        url_arquivo: f.url_arquivo,
        tamanho_bytes: f.tamanho_bytes,
        tipo_mime: f.tipo_mime,
        categoria: f.categoria,
        descricao: f.descricao,
        latitude: f.latitude,
        longitude: f.longitude,
        timestamp_captura: f.timestamp_captura
      }));

      const { error: fotosError } = await supabase
        .from('execucoes_fotos')
        .insert(fotosFormatadas);

      if (fotosError) {
        console.error('❌ [EXECUCOES] Erro ao inserir fotos:', fotosError);
        // Não falhar a requisição, mas logar o erro
      } else {
        console.log(`✅ [EXECUCOES] ${fotos.length} fotos inseridas`);
      }
    }

    // Retornar execução completa
    const { data: execucaoCompleta } = await supabase
      .from('execucoes')
      .select(`
        *,
        modulos:modulo_id (id, codigo, nome)
      `)
      .eq('id', execucaoId)
      .single();

    return res.status(201).json(execucaoCompleta);

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// PUT /api/execucoes/:id
// Atualiza uma execução existente
// ================================================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`📋 [EXECUCOES] Atualizando execução: ${id}`);

    // Remover campos que não devem ser atualizados
    delete updates.id;
    delete updates.numero_sequencial;
    delete updates.numero_documento;
    delete updates.created_at;
    delete updates.respostas;
    delete updates.fotos;
    delete updates.modulos;

    const { data, error } = await supabase
      .from('execucoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Execução não encontrada' });
      }
      console.error('❌ [EXECUCOES] Erro ao atualizar:', error);
      return res.status(500).json({
        error: 'Erro ao atualizar execução',
        details: error.message
      });
    }

    console.log(`✅ [EXECUCOES] Execução atualizada`);
    return res.json(data);

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// DELETE /api/execucoes/:id
// Remove uma execução (hard delete - cuidado!)
// ================================================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 [EXECUCOES] Removendo execução: ${id}`);

    const { error } = await supabase
      .from('execucoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [EXECUCOES] Erro ao remover:', error);
      return res.status(500).json({
        error: 'Erro ao remover execução',
        details: error.message
      });
    }

    console.log(`✅ [EXECUCOES] Execução removida`);
    return res.json({ message: 'Execução removida com sucesso' });

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// GET /api/execucoes/:id/pdf
// Gera PDF da execução (placeholder - implementar depois)
// ================================================================
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📋 [EXECUCOES] Gerando PDF para execução: ${id}`);

    // TODO: Implementar geração de PDF
    return res.status(501).json({
      message: 'Geração de PDF será implementada em breve',
      execucao_id: id
    });

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
