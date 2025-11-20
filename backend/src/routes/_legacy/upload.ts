import { Router } from 'express';
import multer from 'multer';
import { supabase, supabaseAdmin } from '../supabase';
import { getCurrentTimestamp } from '../utils/dateUtils';

console.log('🚦 [UPLOAD ROUTES] Arquivo carregado!');

// ===================================================================
// VALIDAÇÃO DE SEGURANÇA
// ===================================================================

// Tipos MIME permitidos (apenas imagens)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];

// Tamanho máximo: 10MB (reduzido de 50MB para segurança)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Magic bytes para validação de arquivo real (primeiros 4 bytes)
const VALID_IMAGE_SIGNATURES: Record<string, string[]> = {
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  'image/png': ['89504e47'],
  'image/webp': ['52494646'], // RIFF
  'image/heic': ['66747970', '6674797068656963'], // ftyp, ftypheic
  'image/heif': ['66747970']
};

/**
 * Valida se o arquivo é realmente uma imagem verificando magic bytes
 */
function validateImageSignature(buffer: Buffer, mimeType: string): boolean {
  const signature = buffer.slice(0, 4).toString('hex');
  const validSignatures = VALID_IMAGE_SIGNATURES[mimeType] || [];

  return validSignatures.some(valid => signature.startsWith(valid));
}

/**
 * Sanitiza path para prevenir path traversal
 */
function sanitizePath(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
}

const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB
    fieldSize: 1 * 1024 * 1024 // 1MB para campos de texto
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}. Apenas imagens são aceitas.`));
      return;
    }
    cb(null, true);
  }
});

const router = Router();

// @ts-ignore - Multer middleware type compatibility issue
router.post('/upload', upload.single('file'), async (req: any, res: any) => {
  const { entityType, entityId, categoria } = req.body;
  const file = req.file;

  // 🔒 VALIDAÇÃO 1: Arquivo presente
  if (!file) {
    res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    return;
  }

  // 🔒 VALIDAÇÃO 2: Tamanho do arquivo
  if (file.size > MAX_FILE_SIZE) {
    res.status(400).json({
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    });
    return;
  }

  // 🔒 VALIDAÇÃO 3: Tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    res.status(400).json({
      error: `Tipo de arquivo não permitido: ${file.mimetype}. Apenas imagens são aceitas.`
    });
    return;
  }

  // 🔒 VALIDAÇÃO 4: Magic bytes (validar que é realmente uma imagem)
  if (!validateImageSignature(file.buffer, file.mimetype)) {
    console.warn(`⚠️ [SECURITY] Arquivo rejeitado - Magic bytes inválidos para ${file.mimetype}`);
    res.status(400).json({
      error: 'Arquivo inválido. O arquivo não corresponde ao tipo declarado.'
    });
    return;
  }

  // Determinar o bucket baseado no entityType
  let bucketName = 'fotos-lv-residuos'; // padrão

  if (entityType === 'termos') {
    bucketName = 'fotos-termos';
  } else if (entityType === 'rotina') {
    bucketName = 'fotos-rotina';
  } else if (entityType === 'acoes') {
    bucketName = 'fotos-acoes';
  }

  console.log(`📤 Upload tentativa: bucket=${bucketName}, size=${file.size}`);
  console.log(`📊 Detalhes do arquivo:`, {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    bufferLength: file.buffer?.length,
    entityType,
    entityId,
    categoria
  });
  
  if (!supabaseAdmin) {
    console.error('❌ [UPLOAD API] Supabase Admin não configurado');
    return res.status(500).json({ error: 'Erro de configuração do servidor' });
  }

  // Verificar se o bucket existe
  const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
  if (bucketsError) {
    console.error(`❌ Erro ao listar buckets: ${bucketsError.message}`);
    res.status(500).json({ error: `Erro ao verificar buckets: ${bucketsError.message}` });
    return;
  }
  
  const bucketExists = buckets?.some(bucket => bucket.id === bucketName);
  if (!bucketExists) {
    console.error(`❌ Bucket ${bucketName} não existe`);
    res.status(500).json({ error: `Bucket ${bucketName} não existe. Execute o script SQL para criá-lo.` });
    return;
  }
  
  // 🔒 VALIDAÇÃO 5: Sanitizar entityId e categoria para prevenir path traversal
  const safeEntityId = sanitizePath(entityId);
  const safeCategoria = sanitizePath(categoria || 'geral');

  // Sanitizar nome do arquivo para evitar caracteres especiais
  const sanitizedFileName = file.originalname
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100) // Limitar tamanho
    .toLowerCase();

  let sanitizedFilePath = entityType === 'termos'
    ? `termos/${safeEntityId}/${safeCategoria}/${Date.now()}-${sanitizedFileName}`
    : `${entityType}/${safeEntityId}/${Date.now()}-${sanitizedFileName}`;

  console.log(`📤 Upload sanitizado: ${sanitizedFilePath}`);
  console.log(`📊 Metadados do upload:`, {
    bucketName,
    sanitizedFilePath,
    contentType: file.mimetype || 'image/jpeg',
    bufferSize: file.buffer.length,
    originalFileName: file.originalname,
    sanitizedFileName
  });

  // Upload simples e direto
  try {
    console.log(`🔄 Tentando upload direto...`);
    
    // Criar um buffer limpo sem metadata problemático
    const cleanBuffer = Buffer.from(file.buffer);
    
    console.log(`📊 Tamanho do arquivo: ${file.size} bytes`);
    console.log(`📊 Tamanho do buffer: ${cleanBuffer.length} bytes`);
    
    // Tentar upload com configuração mínima para evitar problemas de metadata
    const result = await supabaseAdmin.storage
      .from(bucketName)
      .upload(sanitizedFilePath, cleanBuffer, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: false, // Não sobrescrever arquivos existentes
        cacheControl: '3600' // Cache por 1 hora
      });
    
    if (result.error) {
      console.error(`❌ Erro no upload:`, result.error);
      res.status(500).json({ 
        error: result.error.message,
        bucket: bucketName,
        path: sanitizedFilePath,
        details: result.error 
      });
      return;
    }
    
    console.log(`✅ Upload realizado com sucesso: ${sanitizedFilePath}`);
    const { publicUrl } = supabaseAdmin.storage.from(bucketName).getPublicUrl(sanitizedFilePath).data;
    console.log(`🔗 URL pública gerada: ${publicUrl}`);
    res.json({ url: publicUrl, filePath: sanitizedFilePath });
    
  } catch (error) {
    console.error(`❌ Erro no upload:`, error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload',
      bucket: bucketName,
      path: sanitizedFilePath,
      details: error 
    });
  }
});

// Endpoint de teste para verificar se o backend está funcionando
router.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'OK', 
    timestamp: getCurrentTimestamp(),
    message: 'Backend funcionando corretamente' 
  });
});

// Endpoint de teste para verificar buckets
router.get('/buckets', async (req: any, res: any) => {
  try {
    if (!supabaseAdmin) {
      console.error('❌ [UPLOAD API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ buckets });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erro desconhecido' });
  }
});

// Endpoint para salvar termos ambientais
router.post('/termos/salvar', async (req: any, res: any) => {
  try {
    const {
      dados,
      numeroTermo,
      fotos
    } = req.body;

    // Corrigir: buscar assinaturas dentro de dados
    const assinatura_responsavel_area_img = dados.assinatura_responsavel_area_img;
    const assinatura_emitente_img = dados.assinatura_emitente_img;

    // LOGS DETALHADOS
    console.log('📝 Salvando termo ambiental:', {
      numeroTermo,
      tipoTermo: dados.tipo_termo,
      emitidoPor: dados.emitido_por_nome,
      destinatario: dados.destinatario_nome
    });
    console.log('🖊️ Assinatura emitente (inicio):', assinatura_emitente_img ? assinatura_emitente_img.slice(0, 100) : 'NULA');
    console.log('🖊️ Assinatura responsável (inicio):', assinatura_responsavel_area_img ? assinatura_responsavel_area_img.slice(0, 100) : 'NULA');
    console.log('🖊️ Tamanho assinatura emitente:', assinatura_emitente_img ? assinatura_emitente_img.length : 0);
    console.log('🖊️ Tamanho assinatura responsável:', assinatura_responsavel_area_img ? assinatura_responsavel_area_img.length : 0);
    
    // LOGS PARA DEPURAR ARRAYS
    console.log('🟦 [DEBUG BACKEND] Não Conformidades recebidas:', dados.nao_conformidades);
    console.log('🟦 [DEBUG BACKEND] Ações de Correção recebidas:', dados.acoes_correcao);
    console.log('🟦 [DEBUG BACKEND] Tipo de dados.nao_conformidades:', typeof dados.nao_conformidades);
    console.log('🟦 [DEBUG BACKEND] É array?', Array.isArray(dados.nao_conformidades));
    console.log('🟦 [DEBUG BACKEND] Dados completos recebidos:', Object.keys(dados));

    // Preparar dados para inserção na tabela termos_ambientais
    const dadosParaInserir: Record<string, unknown> = {
      // Identificação básica
      data_termo: dados.data_termo,
      hora_termo: dados.hora_termo,
      local_atividade: dados.local_atividade,
      projeto_ba: dados.projeto_ba,
      fase_etapa_obra: dados.fase_etapa_obra,
      
      // Emissor
      emitido_por_nome: dados.emitido_por_nome,
      emitido_por_gerencia: dados.emitido_por_gerencia,
      emitido_por_empresa: dados.emitido_por_empresa,
      emitido_por_usuario_id: dados.emitido_por_usuario_id,
      
      // Destinatário
      destinatario_nome: dados.destinatario_nome,
      destinatario_gerencia: dados.destinatario_gerencia,
      destinatario_empresa: dados.destinatario_empresa,
      
      // Localização
      area_equipamento_atividade: dados.area_equipamento_atividade,
      equipe: dados.equipe,
      atividade_especifica: dados.atividade_especifica,
      
      // Tipo e natureza
      tipo_termo: dados.tipo_termo,
      natureza_desvio: dados.natureza_desvio,
      
      // Lista de verificação
      lista_verificacao_aplicada: dados.lista_verificacao_aplicada,
      tst_tma_responsavel: dados.tst_tma_responsavel,
      
      // Assinaturas
      assinatura_responsavel_area: dados.assinatura_responsavel_area,
      assinatura_emitente: dados.assinatura_emitente,
      // Adicionar as imagens base64
      ...(assinatura_responsavel_area_img ? { assinatura_responsavel_area_img } : {}),
      ...(assinatura_emitente_img ? { assinatura_emitente_img } : {}),
      
      // Textos
      providencias_tomadas: dados.providencias_tomadas,
      observacoes: dados.observacoes,
      
      // GPS
      latitude: dados.latitude,
      longitude: dados.longitude,
      precisao_gps: dados.precisao_gps,
      endereco_gps: dados.endereco_gps,
      
      // Número do termo
      status: 'PENDENTE',
      sincronizado: true,
      offline: false
    };

    // Gerar número definitivo do termo
    const { data: numeroGerado, error: erroNumero } = await supabase.rpc('gerar_proximo_numero_termo', {
      p_tipo_termo: dados.tipo_termo
    });
    if (erroNumero) {
      return res.status(500).json({ success: false, error: 'Erro ao gerar número do termo' });
    }
    dadosParaInserir.numero_termo = numeroGerado;

    // Mapear não conformidades (até 10 itens)
    if (dados.nao_conformidades && Array.isArray(dados.nao_conformidades)) {
      console.log('🟦 [DEBUG BACKEND] Mapeando não conformidades:', dados.nao_conformidades.length, 'itens');
      dados.nao_conformidades.forEach((nc: { descricao: string; severidade: string }, index: number) => {
        if (index < 10) {
          dadosParaInserir[`descricao_nc_${index + 1}`] = nc.descricao;
          dadosParaInserir[`severidade_nc_${index + 1}`] = nc.severidade;
          console.log(`🟦 [DEBUG BACKEND] Mapeado NC ${index + 1}:`, nc.descricao, nc.severidade);
        }
      });
    } else {
      console.log('🟦 [DEBUG BACKEND] Não conformidades não encontradas ou não é array');
    }

    // Mapear ações de correção (até 10 itens)
    if (dados.acoes_correcao && Array.isArray(dados.acoes_correcao)) {
      console.log('🟦 [DEBUG BACKEND] Mapeando ações de correção:', dados.acoes_correcao.length, 'itens');
      dados.acoes_correcao.forEach((acao: { descricao: string; prazo: string }, index: number) => {
        if (index < 10) {
          dadosParaInserir[`acao_correcao_${index + 1}`] = acao.descricao;
          dadosParaInserir[`prazo_acao_${index + 1}`] = acao.prazo;
          console.log(`🟦 [DEBUG BACKEND] Mapeado Ação ${index + 1}:`, acao.descricao, acao.prazo);
        }
      });
    } else {
      console.log('🟦 [DEBUG BACKEND] Ações de correção não encontradas ou não é array');
    }

    // Adicionar liberação se for Paralização Técnica
    if (dados.tipo_termo === 'PARALIZACAO_TECNICA' && dados.liberacao) {
      dadosParaInserir.liberacao_nome = dados.liberacao.nome;
      dadosParaInserir.liberacao_empresa = dados.liberacao.empresa;
      dadosParaInserir.liberacao_gerencia = dados.liberacao.gerencia;
      dadosParaInserir.liberacao_data = dados.liberacao.data;
      dadosParaInserir.liberacao_horario = dados.liberacao.horario;
      dadosParaInserir.liberacao_assinatura_carimbo = dados.liberacao.assinatura_carimbo;
    }

    // Adicionar assinaturas em base64 se fornecidas
    if (assinatura_responsavel_area_img) {
      dadosParaInserir.assinatura_responsavel_area_img = assinatura_responsavel_area_img;
    }
    if (assinatura_emitente_img) {
      dadosParaInserir.assinatura_emitente_img = assinatura_emitente_img;
    }

    console.log('📊 Dados preparados para inserção:', Object.keys(dadosParaInserir));

    // 1. Salvar o termo na tabela termos_ambientais
    const { data: termoSalvo, error: erroTermo } = await supabase
      .from('termos_ambientais')
      .insert(dadosParaInserir)
      .select()
      .single();

    if (erroTermo) {
      console.error('❌ Erro ao salvar termo:', erroTermo);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao salvar termo: ${erroTermo.message}` 
      });
    }

    console.log('✅ Termo salvo com sucesso:', termoSalvo.id);

    // 2. Salvar fotos se houver
    let fotosSalvas = 0;
    if (fotos && Object.keys(fotos).length > 0) {
      const fotosParaSalvar = [];
      
      for (const [categoria, fotosCategoria] of Object.entries(fotos)) {
        for (const foto of fotosCategoria as Array<{ nome: string; url?: string; tamanho: number; tipo: string; descricao?: string; latitude?: number; longitude?: number; accuracy?: number; endereco?: string; timestamp?: string }>) {
          // Verificar se já existe uma foto igual para este termo, categoria e nome
          const { data: fotoExistente, error: erroBusca } = await supabase
            .from('termos_fotos')
            .select('id')
            .eq('termo_id', termoSalvo.id)
            .eq('categoria', categoria)
            .eq('nome_arquivo', foto.nome)
            .maybeSingle();

          if (erroBusca) {
            console.error('Erro ao verificar foto existente:', erroBusca);
            continue; // Pula esta foto em caso de erro de busca
          }

          if (!fotoExistente) {
            fotosParaSalvar.push({
              termo_id: termoSalvo.id,
              nome_arquivo: foto.nome,
              url_arquivo: foto.url || '',
              tamanho_bytes: foto.tamanho,
              tipo_mime: foto.tipo,
              categoria: categoria,
              descricao: foto.descricao || '',
              latitude: foto.latitude,
              longitude: foto.longitude,
              precisao_gps: foto.accuracy,
              endereco: foto.endereco,
              timestamp_captura: foto.timestamp,
              offline: false,
              sincronizado: true
            });
          } else {
            console.log(`⚠️ Foto já existe para termo_id=${termoSalvo.id}, categoria=${categoria}, nome=${foto.nome}`);
          }
        }
      }

      if (fotosParaSalvar.length > 0) {
        const { error: erroFotos } = await supabase
          .from('termos_fotos')
          .insert(fotosParaSalvar);

        if (erroFotos) {
          console.error('❌ Erro ao salvar fotos:', erroFotos);
          // Não falhar o salvamento do termo por causa das fotos
        } else {
          fotosSalvas = fotosParaSalvar.length;
          console.log(`✅ ${fotosSalvas} fotos salvas com sucesso`);
        }
      }
    }

    res.json({
      success: true,
      termo: termoSalvo,
      termoId: termoSalvo.id,
      fotosSalvas: fotosSalvas
    });

  } catch (error) {
    console.error('❌ Erro geral ao salvar termo:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
});

// Endpoint para obter próximo número do termo
router.get('/termos/proximo-numero/:tipo', async (req: any, res: any) => {
  try {
    const { tipo } = req.params;
    
    console.log(`🔢 Obtendo próximo número para tipo: ${tipo}`);

    // Chamar a função SQL para gerar o próximo número
    const { data, error } = await supabase.rpc('gerar_proximo_numero_termo', {
      p_tipo_termo: tipo
    });

    if (error) {
      console.error('❌ Erro ao gerar número:', error);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao gerar número: ${error.message}` 
      });
    }

    console.log(`✅ Número gerado: ${data}`);
    res.json({ 
      success: true, 
      numero: data 
    });

  } catch (error) {
    console.error('❌ Erro ao gerar número:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
});

// Novo endpoint para salvar apenas as fotos de um termo já existente
router.post('/termos/salvar-fotos', async (req: any, res: any) => {
  try {
    if (!supabaseAdmin) {
      console.error('❌ [UPLOAD API] Supabase Admin não configurado');
      return res.status(500).json({ success: false, error: 'Erro de configuração do servidor' });
    }
    
    const { termoId, fotos } = req.body;
    if (!termoId || !fotos) {
      return res.status(400).json({ success: false, error: 'termoId e fotos são obrigatórios' });
    }
    let fotosSalvas = 0;
    const fotosParaSalvar = [];
    for (const [categoria, fotosCategoria] of Object.entries(fotos)) {
      for (const foto of fotosCategoria as Array<{ nome: string; url?: string; tamanho: number; tipo: string; descricao?: string; latitude?: number; longitude?: number; accuracy?: number; endereco?: string; timestamp?: string }>) {
        // Verificar se já existe uma foto igual para este termo, categoria e nome
        const { data: fotoExistente, error: erroBusca } = await supabaseAdmin
          .from('termos_fotos')
          .select('id')
          .eq('termo_id', termoId)
          .eq('categoria', categoria)
          .eq('nome_arquivo', foto.nome)
          .maybeSingle();
        if (erroBusca) {
          console.error('Erro ao verificar foto existente:', erroBusca);
          continue;
        }
        if (!fotoExistente) {
          fotosParaSalvar.push({
            termo_id: termoId,
            nome_arquivo: foto.nome,
            url_arquivo: foto.url || '',
            tamanho_bytes: foto.tamanho,
            tipo_mime: foto.tipo,
            categoria: categoria,
            descricao: foto.descricao || '',
            latitude: foto.latitude,
            longitude: foto.longitude,
            precisao_gps: foto.accuracy,
            endereco: foto.endereco,
            timestamp_captura: foto.timestamp,
            offline: false,
            sincronizado: true
          });
        } else {
          console.log(`⚠️ Foto já existe para termo_id=${termoId}, categoria=${categoria}, nome=${foto.nome}`);
        }
      }
    }
    if (fotosParaSalvar.length > 0) {
      if (!supabaseAdmin) {
        console.error('❌ [UPLOAD API] Supabase Admin não configurado');
        return res.status(500).json({ success: false, error: 'Erro de configuração do servidor' });
      }
      
      const { error: erroFotos } = await supabaseAdmin
        .from('termos_fotos')
        .insert(fotosParaSalvar);
      if (erroFotos) {
        console.error('❌ Erro ao salvar fotos:', erroFotos);
      } else {
        fotosSalvas = fotosParaSalvar.length;
        console.log(`✅ ${fotosSalvas} fotos salvas com sucesso`);
      }
    }
    res.json({ success: true, fotosSalvas });
  } catch (error) {
    console.error('❌ Erro geral ao salvar fotos:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
});

// Endpoint para sincronização offline de vários termos e fotos
router.post('/termos/sincronizar', async (req: any, res: any) => {
  try {
    const { termos } = req.body;
    if (!termos || !Array.isArray(termos)) {
      return res.status(400).json({ success: false, error: 'Array de termos é obrigatório' });
    }
    const resultados: Array<{ termoId?: string, uuid?: string, status: string, erro?: string, fotosSalvas?: number }> = [];
    for (const item of termos) {
      const { termo, fotos } = item;
      try {
        // Preparar dados do termo para inserção (mapear campos corretamente)
        const dadosParaInserir: Record<string, unknown> = {
          // Identificação básica
          data_termo: termo.data_termo,
          hora_termo: termo.hora_termo,
          local_atividade: termo.local_atividade,
          projeto_ba: termo.projeto_ba,
          fase_etapa_obra: termo.fase_etapa_obra,
          
          // Emissor
          emitido_por_nome: termo.emitido_por_nome,
          emitido_por_gerencia: termo.emitido_por_gerencia,
          emitido_por_empresa: termo.emitido_por_empresa,
          emitido_por_usuario_id: termo.emitido_por_usuario_id,
          
          // Destinatário
          destinatario_nome: termo.destinatario_nome,
          destinatario_gerencia: termo.destinatario_gerencia,
          destinatario_empresa: termo.destinatario_empresa,
          
          // Localização
          area_equipamento_atividade: termo.area_equipamento_atividade,
          equipe: termo.equipe,
          atividade_especifica: termo.atividade_especifica,
          
          // Tipo e natureza
          tipo_termo: termo.tipo_termo,
          natureza_desvio: termo.natureza_desvio,
          
          // Lista de verificação
          lista_verificacao_aplicada: termo.lista_verificacao_aplicada,
          tst_tma_responsavel: termo.tst_tma_responsavel,
          
          // Assinaturas
          assinatura_responsavel_area: termo.assinatura_responsavel_area,
          assinatura_emitente: termo.assinatura_emitente,
          assinatura_responsavel_area_img: termo.assinatura_responsavel_area_img,
          assinatura_emitente_img: termo.assinatura_emitente_img,
          
          // Textos
          providencias_tomadas: termo.providencias_tomadas,
          observacoes: termo.observacoes,
          
          // GPS
          latitude: termo.latitude,
          longitude: termo.longitude,
          precisao_gps: termo.precisao_gps,
          endereco_gps: termo.endereco_gps,
          
          // Status
          status: 'PENDENTE',
          sincronizado: true,
          offline: false
        };

        // Mapear não conformidades (até 10 itens)
        if (termo.nao_conformidades && Array.isArray(termo.nao_conformidades)) {
          termo.nao_conformidades.forEach((nc: { descricao: string; severidade: string }, index: number) => {
            if (index < 10) {
              dadosParaInserir[`descricao_nc_${index + 1}`] = nc.descricao;
              dadosParaInserir[`severidade_nc_${index + 1}`] = nc.severidade;
            }
          });
        }

        // Mapear ações de correção (até 10 itens)
        if (termo.acoes_correcao && Array.isArray(termo.acoes_correcao)) {
          termo.acoes_correcao.forEach((acao: { descricao: string; prazo: string }, index: number) => {
            if (index < 10) {
              dadosParaInserir[`acao_correcao_${index + 1}`] = acao.descricao;
              dadosParaInserir[`prazo_acao_${index + 1}`] = acao.prazo;
            }
          });
        }

        // Adicionar liberação se for Paralização Técnica
        if (termo.tipo_termo === 'PARALIZACAO_TECNICA' && termo.liberacao) {
          dadosParaInserir.liberacao_nome = termo.liberacao.nome;
          dadosParaInserir.liberacao_empresa = termo.liberacao.empresa;
          dadosParaInserir.liberacao_gerencia = termo.liberacao.gerencia;
          dadosParaInserir.liberacao_data = termo.liberacao.data;
          dadosParaInserir.liberacao_horario = termo.liberacao.horario;
          dadosParaInserir.liberacao_assinatura_carimbo = termo.liberacao.assinatura_carimbo;
        }

        // Gerar número definitivo do termo
        const { data: numeroGerado, error: erroNumero } = await supabase.rpc('gerar_proximo_numero_termo', {
          p_tipo_termo: termo.tipo_termo
        });
        if (erroNumero) {
          resultados.push({ termoId: termo.id, status: 'erro', erro: 'Erro ao gerar número do termo' });
          continue;
        }
        dadosParaInserir.numero_termo = numeroGerado;

        // Salvar termo
        const { data: termoSalvo, error: erroTermo } = await supabase
          .from('termos_ambientais')
          .insert(dadosParaInserir)
          .select()
          .single();
        if (erroTermo) {
          resultados.push({ termoId: termo.id, status: 'erro', erro: erroTermo.message });
          continue;
        }
        let fotosSalvas = 0;
        if (fotos && Object.keys(fotos).length > 0) {
          const fotosParaSalvar = [];
          for (const [categoria, fotosCategoria] of Object.entries(fotos)) {
            for (const foto of fotosCategoria as Array<{ nome: string; url?: string; data?: string; tamanho: number; tipo: string; descricao?: string; latitude?: number; longitude?: number; accuracy?: number; endereco?: string; timestamp?: string }>) {
              fotosParaSalvar.push({
                termo_id: termoSalvo.id,
                nome_arquivo: foto.nome,
                url_arquivo: foto.data || foto.url || '', // Suporta tanto 'data' (offline) quanto 'url' (online)
                tamanho_bytes: foto.tamanho,
                tipo_mime: foto.tipo,
                categoria: categoria,
                descricao: foto.descricao || '',
                latitude: foto.latitude,
                longitude: foto.longitude,
                precisao_gps: foto.accuracy,
                endereco: foto.endereco,
                timestamp_captura: foto.timestamp,
                offline: false,
                sincronizado: true
              });
            }
          }
          if (fotosParaSalvar.length > 0) {
            const { error: erroFotos } = await supabase
              .from('termos_fotos')
              .insert(fotosParaSalvar);
            if (!erroFotos) {
              fotosSalvas = fotosParaSalvar.length;
            }
          }
        }
        resultados.push({ uuid: termo.uuid, status: 'ok', fotosSalvas });
      } catch (err: any) {
        resultados.push({ termoId: item.termo?.id, status: 'erro', erro: err?.message || String(err) });
      }
    }
    res.json({ success: true, resultados });
  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
});

export default router;
