import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Configuração do multer para upload de arquivos
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    fieldSize: 1 * 1024 * 1024 // 1MB para campos de texto
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  }
});

// ================================================================
// GET /api/execucoes
// Retorna execuções (inspeções/checklists realizados)
// ================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenantId, moduloId, usuarioId, status, limit = 50, offset = 0 } = req.query;

    console.log('📋 [EXECUCOES] Buscando execuções', {
      tenantId,
      moduloId,
      usuarioId,
      status,
      limit,
      offset
    });

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
      console.log(`🔍 [EXECUCOES] Filtro tenant_id: ${tenantId}`);
    }

    if (moduloId) {
      query = query.eq('modulo_id', moduloId);
      console.log(`🔍 [EXECUCOES] Filtro modulo_id: ${moduloId}`);
    }

    // Converter usuarioId (pode ser auth_user_id) para usuarios.id
    let usuarioIdFinal: string | undefined = usuarioId as string | undefined;
    if (usuarioId) {
      // Verificar se o usuarioId existe na tabela usuarios
      const { data: usuarioExistente, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', usuarioId)
        .single();

      // Se não encontrou, tentar buscar por auth_user_id
      if (usuarioError || !usuarioExistente) {
        console.log(`🔍 [EXECUCOES] usuarioId não encontrado em usuarios, tentando buscar por auth_user_id: ${usuarioId}`);
        
        const { data: usuarioPorAuth, error: authError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_user_id', usuarioId)
          .single();

        if (authError || !usuarioPorAuth) {
          console.log(`⚠️ [EXECUCOES] Usuário não encontrado nem por id nem por auth_user_id: ${usuarioId} - buscando sem filtro de usuário`);
          usuarioIdFinal = undefined; // Não filtrar por usuário se não encontrar
        } else {
          usuarioIdFinal = usuarioPorAuth.id;
          console.log(`✅ [EXECUCOES] Usuário encontrado por auth_user_id: ${usuarioId} -> usuarios.id: ${usuarioIdFinal}`);
        }
      } else {
        console.log(`✅ [EXECUCOES] Usuário encontrado diretamente: ${usuarioId}`);
      }
    }

    if (usuarioIdFinal) {
      query = query.eq('usuario_id', usuarioIdFinal);
      console.log(`🔍 [EXECUCOES] Filtro usuario_id: ${usuarioIdFinal}`);
    }

    if (status) {
      query = query.eq('status', status);
      console.log(`🔍 [EXECUCOES] Filtro status: ${status}`);
    }

    // Fazer query para contar total (sem paginação)
    let countQuery = supabase
      .from('execucoes')
      .select('*', { count: 'exact', head: true });

    if (tenantId) {
      countQuery = countQuery.eq('tenant_id', tenantId);
    }
    if (moduloId) {
      countQuery = countQuery.eq('modulo_id', moduloId);
    }
    if (usuarioIdFinal) {
      countQuery = countQuery.eq('usuario_id', usuarioIdFinal);
    }
    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    // Executar queries em paralelo
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);

    if (error) {
      console.error('❌ [EXECUCOES] Erro ao buscar:', error);
      return res.status(500).json({
        error: 'Erro ao buscar execuções',
        details: error.message
      });
    }

    if (countError) {
      console.error('❌ [EXECUCOES] Erro ao contar:', countError);
    }

    const totalCount = count || 0;
    console.log(`✅ [EXECUCOES] ${data.length} execuções encontradas (total no banco: ${totalCount})`);
    return res.json({
      data,
      total: totalCount,
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

    // Converter usuario_id (pode ser auth_user_id) para usuarios.id
    let usuarioIdFinal = usuario_id;
    
    // Verificar se o usuario_id existe na tabela usuarios
    const { data: usuarioExistente, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', usuario_id)
      .single();

    // Se não encontrou, tentar buscar por auth_user_id
    if (usuarioError || !usuarioExistente) {
      console.log(`🔍 [EXECUCOES] usuario_id não encontrado em usuarios, tentando buscar por auth_user_id: ${usuario_id}`);
      
      const { data: usuarioPorAuth, error: authError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', usuario_id)
        .single();

      if (authError || !usuarioPorAuth) {
        console.error('❌ [EXECUCOES] Usuário não encontrado nem por id nem por auth_user_id:', usuario_id);
        return res.status(400).json({
          error: 'Usuário não encontrado no sistema',
          details: `Nenhum usuário encontrado com id ou auth_user_id: ${usuario_id}`
        });
      }

      usuarioIdFinal = usuarioPorAuth.id;
      console.log(`✅ [EXECUCOES] Usuário encontrado por auth_user_id: ${usuario_id} -> usuarios.id: ${usuarioIdFinal}`);
    } else {
      console.log(`✅ [EXECUCOES] Usuário encontrado diretamente: ${usuario_id}`);
    }

    // Criar execução
    const { data: execucao, error: execError } = await supabase
      .from('execucoes')
      .insert({
        tenant_id,
        modulo_id,
        usuario_id: usuarioIdFinal, // Usar o ID convertido
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
// POST /api/execucoes/:id/fotos
// Upload de fotos para uma execução (usa service role - bypass RLS)
// ================================================================
// @ts-ignore - Multer middleware type compatibility
router.post('/:id/fotos', upload.array('fotos', 50), async (req: any, res: Response) => {
  try {
    const { id: execucaoId } = req.params;
    const files = req.files || [];
    const { perguntaId, perguntaCodigo, descricao } = req.body;

    console.log(`📸 [EXECUCOES] Upload de ${files.length} fotos para execução: ${execucaoId}`);

    // Verificar se a execução existe
    const { data: execucao, error: execError } = await supabase
      .from('execucoes')
      .select('id')
      .eq('id', execucaoId)
      .single();

    if (execError || !execucao) {
      return res.status(404).json({ error: 'Execução não encontrada' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma foto enviada' });
    }

    const BUCKET_NAME = 'execucoes';
    const fotosUploaded: any[] = [];

    // Upload de cada arquivo
    for (const file of files) {
      try {
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const extensao = file.originalname.split('.').pop() || 'jpg';
        const nomeArquivo = `${execucaoId}/${timestamp}_${perguntaCodigo || 'geral'}.${extensao}`;

        // Upload para Supabase Storage (usando service role - bypass RLS)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(nomeArquivo, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`❌ [EXECUCOES] Erro no upload de ${file.originalname}:`, uploadError);
          continue;
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(nomeArquivo);

        fotosUploaded.push({
          id: uploadData.path,
          url: urlData.publicUrl,
          nome_arquivo: file.originalname,
          tamanho: file.size,
          tipo: file.mimetype,
          descricao,
          execucao_id: execucaoId,
          pergunta_id: perguntaId,
          pergunta_codigo: perguntaCodigo,
          uploaded_at: new Date().toISOString()
        });

        console.log(`✅ [EXECUCOES] Foto uploadada: ${nomeArquivo}`);
      } catch (error: any) {
        console.error(`❌ [EXECUCOES] Erro ao processar ${file.originalname}:`, error);
      }
    }

    if (fotosUploaded.length === 0) {
      return res.status(500).json({ error: 'Nenhuma foto foi enviada com sucesso' });
    }

    console.log(`✅ [EXECUCOES] ${fotosUploaded.length} fotos uploadadas com sucesso`);
    return res.json({
      success: true,
      data: fotosUploaded,
      total: fotosUploaded.length
    });

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado no upload de fotos:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// ================================================================
// POST /api/execucoes/:id/assinatura
// Cria assinatura digital para uma execução (usa service role - bypass RLS)
// ================================================================
router.post('/:id/assinatura', async (req: Request, res: Response) => {
  try {
    const { id: execucaoId } = req.params;
    const {
      tenant_id,
      usuario_id,
      assinatura_base64,
      hash_assinatura,
      timestamp_assinatura,
      usuario_nome,
      usuario_email,
      usuario_matricula,
      cargo_responsavel,
      validado_por,
      metodo_captura = 'canvas',
      dispositivo,
      navegador,
      user_agent,
      ip_address,
      latitude,
      longitude,
      local_assinatura,
      observacoes
    } = req.body;

    console.log(`✍️ [EXECUCOES] Criando assinatura para execução: ${execucaoId}`);

    // Validações básicas
    if (!tenant_id || !usuario_id || !assinatura_base64 || !hash_assinatura) {
      return res.status(400).json({
        error: 'Campos obrigatórios: tenant_id, usuario_id, assinatura_base64, hash_assinatura'
      });
    }

    // Verificar se a execução existe
    const { data: execucao, error: execError } = await supabase
      .from('execucoes')
      .select('id')
      .eq('id', execucaoId)
      .single();

    if (execError || !execucao) {
      return res.status(404).json({ error: 'Execução não encontrada' });
    }

    // Verificar se já existe assinatura para esta execução
    const { data: assinaturaExistente } = await supabase
      .from('assinaturas_execucoes')
      .select('id')
      .eq('execucao_id', execucaoId)
      .single();

    if (assinaturaExistente) {
      return res.status(409).json({ error: 'Esta execução já possui uma assinatura' });
    }

    // Converter usuario_id (pode ser auth_user_id) para usuarios.id
    let usuarioIdFinal = usuario_id;
    
    // Verificar se o usuario_id existe na tabela usuarios
    const { data: usuarioExistente, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', usuario_id)
      .single();

    // Se não encontrou, tentar buscar por auth_user_id
    if (usuarioError || !usuarioExistente) {
      console.log(`🔍 [EXECUCOES] usuario_id não encontrado em usuarios, tentando buscar por auth_user_id: ${usuario_id}`);
      
      const { data: usuarioPorAuth, error: authError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', usuario_id)
        .single();

      if (authError || !usuarioPorAuth) {
        console.error('❌ [EXECUCOES] Usuário não encontrado nem por id nem por auth_user_id:', usuario_id);
        return res.status(400).json({
          error: 'Usuário não encontrado no sistema',
          details: `Nenhum usuário encontrado com id ou auth_user_id: ${usuario_id}`
        });
      }

      usuarioIdFinal = usuarioPorAuth.id;
      console.log(`✅ [EXECUCOES] Usuário encontrado por auth_user_id: ${usuario_id} -> usuarios.id: ${usuarioIdFinal}`);
    }

    // Criar assinatura (usando service role - bypass RLS)
    const { data: assinatura, error: assinaturaError } = await supabase
      .from('assinaturas_execucoes')
      .insert({
        execucao_id: execucaoId,
        tenant_id,
        usuario_id: usuarioIdFinal, // Usar o ID convertido
        assinatura_base64,
        hash_assinatura,
        timestamp_assinatura: timestamp_assinatura || new Date().toISOString(),
        usuario_nome,
        usuario_email,
        usuario_matricula,
        cargo_responsavel,
        validado_por,
        metodo_captura,
        dispositivo,
        navegador,
        user_agent,
        ip_address,
        latitude,
        longitude,
        local_assinatura,
        observacoes,
        status: 'ativa'
      })
      .select()
      .single();

    if (assinaturaError) {
      console.error('❌ [EXECUCOES] Erro ao criar assinatura:', assinaturaError);
      return res.status(500).json({
        error: 'Erro ao criar assinatura',
        details: assinaturaError.message
      });
    }

    console.log(`✅ [EXECUCOES] Assinatura criada: ${assinatura.id}`);
    return res.status(201).json(assinatura);

  } catch (error: any) {
    console.error('❌ [EXECUCOES] Erro inesperado ao criar assinatura:', error);
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
