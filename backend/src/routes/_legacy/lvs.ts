// ===================================================================
// API DE LVs - BACKEND ECOFIELD SYSTEM
// Localização: backend/src/routes/lvs.ts
// ===================================================================

import express from 'express';
import multer from 'multer';
import { supabase, supabaseAdmin } from '../supabase';
import type { Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

const router = express.Router();

// Configurar multer para upload de arquivos
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    fieldSize: 50 * 1024 * 1024 // 50MB para campos
  },
  storage: multer.memoryStorage() // Armazenar em memória para upload ao Supabase
});

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
    console.error('❌ [LV API] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

// Listar LVs
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { tipo_lv, usuario_id } = req.query;
    const user = req.user;

    console.log('🔍 [LV API] Buscando LVs');

    if (!supabaseAdmin) {
      console.error('❌ [LV API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar perfil do usuário para verificar se é admin
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('perfil_id, perfis!inner(nome)')
      .eq('auth_user_id', user?.id)
      .single();

    if (userError) {
      console.error('❌ [LV API] Erro ao buscar usuário:', userError);
    }

    const perfil = usuario?.perfis as any;
    const perfilNome = perfil?.nome?.toUpperCase() || '';
    const isAdmin = perfilNome === 'ADMIN' || perfilNome === 'ADM';
    const isSupervisor = perfilNome === 'SUPERVISOR';
    const isAdminOrSup = isAdmin || isSupervisor;

    console.log('🔐 [LV API] Perfil:', perfil?.nome, '| Admin?', isAdmin, '| Supervisor?', isSupervisor);

    let query = supabaseAdmin
      .from('lvs')
      .select('*')
      .order('created_at', { ascending: false });

    // Admin/Supervisor veem todas, Técnico vê só as suas
    if (!isAdminOrSup) {
      query = query.eq('auth_user_id', user?.id || '');
      console.log('🔒 [LV API] Filtrando por auth_user_id (técnico)');
    } else {
      console.log('🔓 [LV API] Admin/Supervisor - retornando todas as LVs');
    }

    if (tipo_lv) {
      query = query.eq('tipo_lv', tipo_lv);
    }

    if (usuario_id) {
      query = query.eq('usuario_id', usuario_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [LV API] Erro ao buscar LVs:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    console.log('✅ [LV API] LVs encontradas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// BUSCAR NCs PENDENTES (SEM AÇÃO CORRETIVA)
// IMPORTANTE: Esta rota DEVE vir ANTES de /:id para evitar conflito
// ===================================================================
router.get('/ncs-pendentes', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    console.log('🔍 [LV API] Buscando NCs pendentes (sem ação corretiva)');

    if (!supabaseAdmin) {
      console.error('❌ [LV API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar todas as avaliações NC
    const { data: todasNCs, error: erroNCs } = await supabaseAdmin
      .from('lv_avaliacoes')
      .select(`
        id,
        lv_id,
        item_codigo,
        item_pergunta,
        avaliacao,
        observacao,
        created_at,
        lvs!inner (
          id,
          tipo_lv,
          numero_sequencial,
          nome_lv,
          data_inspecao,
          area,
          usuario_id,
          usuario_nome,
          auth_user_id
        )
      `)
      .eq('avaliacao', 'NC')
      .order('created_at', { ascending: false });

    if (erroNCs) {
      console.error('❌ [LV API] Erro ao buscar NCs:', erroNCs);
      return res.status(500).json({ error: 'Erro ao buscar NCs' });
    }

    // Buscar todas as ações corretivas existentes
    const { data: acoesExistentes, error: erroAcoes } = await supabaseAdmin
      .from('acoes_corretivas')
      .select('avaliacao_id')
      .not('avaliacao_id', 'is', null);

    if (erroAcoes) {
      console.error('❌ [LV API] Erro ao buscar ações:', erroAcoes);
      return res.status(500).json({ error: 'Erro ao buscar ações corretivas' });
    }

    // Filtrar NCs que NÃO têm ação corretiva
    const idsComAcao = new Set(acoesExistentes?.map(a => a.avaliacao_id) || []);
    const ncsPendentes = (todasNCs || []).filter(nc => !idsComAcao.has(nc.id));

    // Filtrar por permissão do usuário (admin vê tudo, técnico vê só suas LVs)
    let ncsFiltradas = ncsPendentes || [];

    // Verificar se é admin/supervisor
    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('permissoes')
      .eq('id', (user as any).perfil_id)
      .single();

    const permissoes = perfil?.permissoes as any;
    const isAdminOrSupervisor = permissoes?.admin || permissoes?.supervisor;

    if (!isAdminOrSupervisor) {
      // Técnico: filtrar apenas suas LVs
      ncsFiltradas = ncsFiltradas.filter((nc: any) =>
        nc.lvs?.auth_user_id === user?.id
      );
    }

    // Buscar regras de criticidade para cada NC
    const ncsComCriticidade = await Promise.all(
      ncsFiltradas.map(async (nc: any) => {
        const { data: regra } = await supabaseAdmin!
          .from('regras_criticidade_nc')
          .select('criticidade, prazo_dias')
          .eq('ativa', true)
          .or(`and(tipo_lv.eq.${nc.lvs.tipo_lv},item_codigo.eq.${nc.item_codigo}),and(tipo_lv.eq.${nc.lvs.tipo_lv},item_codigo.is.null),tipo_lv.is.null`)
          .order('tipo_lv', { ascending: false, nullsFirst: false })
          .order('item_codigo', { ascending: false, nullsFirst: false })
          .limit(1)
          .single();

        const diasDesdeNC = Math.floor(
          (new Date().getTime() - new Date(nc.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...nc,
          criticidade: regra?.criticidade || 'media',
          prazo_dias: regra?.prazo_dias || 7,
          dias_desde_nc: diasDesdeNC,
          atrasada: diasDesdeNC > (regra?.prazo_dias || 7)
        };
      })
    );

    // Ordenar por criticidade e dias em atraso
    const criticidadeOrdem = { critica: 4, alta: 3, media: 2, baixa: 1 };
    ncsComCriticidade.sort((a: any, b: any) => {
      if (a.atrasada !== b.atrasada) return a.atrasada ? -1 : 1;
      if (a.criticidade !== b.criticidade) {
        return criticidadeOrdem[b.criticidade as keyof typeof criticidadeOrdem] -
               criticidadeOrdem[a.criticidade as keyof typeof criticidadeOrdem];
      }
      return b.dias_desde_nc - a.dias_desde_nc;
    });

    console.log(`✅ [LV API] ${ncsComCriticidade.length} NC(s) pendente(s) encontrada(s)`);

    res.status(200).json({
      total: ncsComCriticidade.length,
      ncs: ncsComCriticidade,
      atrasadas: ncsComCriticidade.filter((nc: any) => nc.atrasada).length,
      criticas: ncsComCriticidade.filter((nc: any) => nc.criticidade === 'critica').length
    });
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado ao buscar NCs pendentes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// ===================================================================
// BUSCAR CONTAGEM DE NCs PENDENTES POR LV
// IMPORTANTE: Esta rota também DEVE vir ANTES de /:id
// ===================================================================
router.get('/:id/ncs-pendentes/count', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id: lvId } = req.params;

    console.log(`🔍 [LV API] Buscando contagem de NCs pendentes para LV: ${lvId}`);

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar todas as avaliações NC desta LV
    const { data: ncsLV, error: erroNCs } = await supabaseAdmin
      .from('lv_avaliacoes')
      .select('id')
      .eq('lv_id', lvId)
      .eq('avaliacao', 'NC');

    if (erroNCs) {
      console.error('❌ [LV API] Erro ao buscar NCs:', erroNCs);
      return res.status(500).json({ error: 'Erro ao buscar NCs' });
    }

    if (!ncsLV || ncsLV.length === 0) {
      return res.json({ count: 0 });
    }

    // Buscar ações corretivas existentes para estas NCs
    const idsNCs = ncsLV.map(nc => nc.id);
    const { data: acoesExistentes, error: erroAcoes } = await supabaseAdmin
      .from('acoes_corretivas')
      .select('avaliacao_id')
      .in('avaliacao_id', idsNCs);

    if (erroAcoes) {
      console.error('❌ [LV API] Erro ao buscar ações:', erroAcoes);
      return res.status(500).json({ error: 'Erro ao buscar ações corretivas' });
    }

    // Contar NCs sem ação
    const idsComAcao = new Set(acoesExistentes?.map(a => a.avaliacao_id) || []);
    const ncsPendentes = ncsLV.filter(nc => !idsComAcao.has(nc.id));

    console.log(`✅ [LV API] LV ${lvId}: ${ncsPendentes.length} NCs pendentes de ${ncsLV.length} NCs totais`);

    res.json({ count: ncsPendentes.length, total_ncs: ncsLV.length });

  } catch (error) {
    console.error('❌ [LV API] Erro ao contar NCs pendentes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Buscar LV específica
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🔍 [LV API] Buscando LV:', id);

    const { data, error } = await supabase
      .from('lvs')
      .select('*')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (error) {
      console.error('❌ [LV API] Erro ao buscar LV:', error);
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    console.log('✅ [LV API] LV encontrada:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar LV
router.post('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const lvData: Record<string, unknown> = req.body;

    console.log('📝 [LV API] Criando LV');
    console.log('📋 [LV API] Dados recebidos:', {
      tipo_lv: lvData.tipo_lv,
      titulo: lvData.titulo,
      usuario_id: lvData.usuario_id,
      data_inspecao: lvData.data_inspecao,
      area: lvData.area,
      totalKeys: Object.keys(lvData).length,
      dataSize: JSON.stringify(lvData).length
    });

    // Validar dados obrigatórios
    if (!lvData.tipo_lv) {
      console.warn('⚠️ [LV API] Validação falhou:', {
        tipo_lv: !!lvData.tipo_lv
      });
      return res.status(400).json({ error: 'Tipo é obrigatório' });
    }

    // Remover campos que não existem no banco e mapear 'titulo' para 'nome_lv'
    const {
      offline,
      titulo,
      criada_por,
      criado_por,
      criado_por_id,
      criada_por_id,
      criadaPor,
      criadoPor,
      ...lvDataClean
    } = lvData;

    // Preparar dados para inserção
    const novaLV = {
      ...lvDataClean,
      // Se 'titulo' foi enviado mas 'nome_lv' não, usar 'titulo' como 'nome_lv'
      nome_lv: lvDataClean.nome_lv || titulo,
      auth_user_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'concluido',
      sincronizado: true
    };

    // Garantir que campos inexistentes não sejam enviados
    delete (novaLV as Record<string, unknown>).criada_por;
    delete (novaLV as Record<string, unknown>).criado_por;
    delete (novaLV as Record<string, unknown>).criadaPor;
    delete (novaLV as Record<string, unknown>).criadoPor;

    console.log('💾 [LV API] Inserindo no Supabase...', {
      campos: Object.keys(novaLV),
      possuiCriadaPor: 'criada_por' in novaLV,
      possuiCriadoPor: 'criado_por' in novaLV
    });

    if (!supabaseAdmin) {
      console.error('❌ [LV API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Configuração do servidor inválida' });
    }

    const { data, error } = await supabaseAdmin
      .from('lvs')
      .insert(novaLV)
      .select()
      .single();

    if (error) {
      console.error('❌ [LV API] Erro do Supabase ao criar LV:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return res.status(500).json({
        error: 'Erro ao criar LV',
        details: error.message,
        hint: error.hint
      });
    }

    console.log('✅ [LV API] LV criada com sucesso:', data.id);

    // Retornar LV criada
    res.status(201).json(data);
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Atualizar LV
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const lvData: Record<string, unknown> = req.body;

    console.log('📝 [LV API] Atualizando LV:', id, lvData);

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    // Remover campos que não existem no banco e mapear 'titulo' para 'nome_lv'
    const {
      offline,
      titulo,
      criada_por,
      criado_por,
      criado_por_id,
      criada_por_id,
      criadaPor,
      criadoPor,
      ...lvDataClean
    } = lvData;

    // Atualizar LV
    const { data, error } = await supabase
      .from('lvs')
      .update({
        ...lvDataClean,
        // Se 'titulo' foi enviado mas 'nome_lv' não, usar 'titulo' como 'nome_lv'
        nome_lv: lvDataClean.nome_lv || titulo,
        updated_at: new Date().toISOString(),
        sincronizado: true
      })
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .select()
      .single();

    if (error) {
      console.error('❌ [LV API] Erro ao atualizar LV:', error);
      return res.status(500).json({ error: 'Erro ao atualizar LV' });
    }

    console.log('✅ [LV API] LV atualizada:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// DETECTAR NÃO CONFORMIDADES (NCs) PARA AÇÕES CORRETIVAS
// ===================================================================
// Endpoint separado chamado APÓS salvar avaliações
router.get('/:id/detectar-ncs', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🔍 [LV API] Detectando NCs para LV:', id);

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id, tipo_lv')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    if (!supabaseAdmin) {
      console.error('❌ [LV API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    let ncs_detectadas: any[] = [];

    try {
      // Buscar avaliações NC desta LV
      const { data: avaliacoes, error: avalError } = await supabaseAdmin
        .from('lv_avaliacoes')
        .select('*')
        .eq('lv_id', id)
        .eq('avaliacao', 'NC');

      if (!avalError && avaliacoes && avaliacoes.length > 0) {
        console.log(`🔍 [LV API] ${avaliacoes.length} NC(s) detectada(s) na LV ${id}`);

        // Para cada NC, buscar a regra de criticidade mais específica
        for (const aval of avaliacoes) {
          try {
            // Buscar regra: primeiro por tipo_lv + item_codigo, depois por tipo_lv, depois genérica
            const { data: regra } = await supabaseAdmin
              .from('regras_criticidade_nc')
              .select('*')
              .eq('ativa', true)
              .or(`and(tipo_lv.eq.${existingLV.tipo_lv},item_codigo.eq.${aval.item_codigo}),and(tipo_lv.eq.${existingLV.tipo_lv},item_codigo.is.null),tipo_lv.is.null`)
              .order('tipo_lv', { ascending: false, nullsFirst: false })
              .order('item_codigo', { ascending: false, nullsFirst: false })
              .limit(1)
              .single();

            ncs_detectadas.push({
              avaliacao_id: aval.id,
              item_codigo: aval.item_codigo,
              item_pergunta: aval.item_pergunta,
              observacao: aval.observacao || '',
              criticidade_sugerida: regra?.criticidade || 'media',
              prazo_dias_sugerido: regra?.prazo_dias || 7,
              acao_sugerida: regra?.acao_sugerida || 'Corrigir não conformidade',
              categoria_sugerida: regra?.categoria || '',
              tem_regra: !!regra
            });
          } catch (err) {
            console.warn('⚠️ [LV API] Erro ao buscar regra para NC:', err);
          }
        }

        console.log(`✅ [LV API] ${ncs_detectadas.length} NC(s) processada(s) com regras`);
      } else {
        console.log(`ℹ️ [LV API] Nenhuma NC detectada na LV ${id}`);
      }
    } catch (ncError) {
      console.error('⚠️ [LV API] Erro ao detectar NCs:', ncError);
      return res.status(500).json({
        error: 'Erro ao detectar NCs',
        details: ncError instanceof Error ? ncError.message : 'Erro desconhecido'
      });
    }

    // Retornar NCs detectadas
    res.status(200).json({
      lv_id: id,
      tipo_lv: existingLV.tipo_lv,
      ncs_detectadas: ncs_detectadas.length,
      ncs: ncs_detectadas
    });
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado ao detectar NCs:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Excluir LV
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { excluir_fotos } = req.query;
    const user = req.user;

    // Converter excluir_fotos para boolean (padrão: true)
    const excluirFotos = excluir_fotos === 'false' ? false : true;

    console.log('🗑️ [LV API] Excluindo LV:', id, '- Excluir fotos:', excluirFotos);

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    if (!supabaseAdmin) {
      console.error('❌ [LV API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // 1. Buscar todas as fotos da LV antes de excluir
    const { data: fotos, error: fotosError } = await supabaseAdmin
      .from('lv_fotos')
      .select('id, url_arquivo, nome_arquivo')
      .eq('lv_id', id);

    if (fotosError) {
      console.error('❌ [LV API] Erro ao buscar fotos:', fotosError);
      // Continuar mesmo se houver erro ao buscar fotos
    }

    // 2. Excluir fotos do bucket do Supabase Storage (se solicitado)
    if (excluirFotos && fotos && fotos.length > 0) {
      console.log(`🗑️ [LV API] Excluindo ${fotos.length} foto(s) do bucket...`);
      const bucketName = 'fotos-lvs';
      const filePaths: string[] = [];

      for (const foto of fotos) {
        if (foto.url_arquivo) {
          try {
            // Extrair caminho do arquivo da URL
            // URL exemplo: https://xxx.supabase.co/storage/v1/object/public/fotos-lvs/361437c7-bbc7-4a00-89dc-bc357539839a/item_id/filename.jpg
            const url = new URL(foto.url_arquivo);
            const pathParts = url.pathname.split('/');
            
            // Encontrar o índice de 'fotos-lvs' e pegar tudo depois
            const bucketIndex = pathParts.findIndex(part => part === 'fotos-lvs');
            if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
              const filePath = pathParts.slice(bucketIndex + 1).join('/');
              filePaths.push(filePath);
            } else {
              // Tentar outro formato: pode estar em formato diferente
              // Se a URL contém o ID da LV, tentar construir o caminho
              if (foto.url_arquivo.includes(id)) {
                // Tentar encontrar o padrão id/item_id/filename
                const match = foto.url_arquivo.match(/fotos-lvs\/([^/]+\/[^/]+\/[^/?]+)/);
                if (match) {
                  filePaths.push(match[1]);
                }
              }
            }
          } catch (urlError) {
            console.error(`❌ [LV API] Erro ao processar URL da foto ${foto.id}:`, urlError);
          }
        }
      }

      // Excluir arquivos do bucket em lote
      if (filePaths.length > 0) {
        try {
          const { error: bucketError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove(filePaths);

          if (bucketError) {
            console.error('❌ [LV API] Erro ao excluir arquivos do bucket:', bucketError);
            // Continuar mesmo se houver erro ao excluir do bucket
          } else {
            console.log(`✅ [LV API] ${filePaths.length} arquivo(s) excluído(s) do bucket`);
          }
        } catch (bucketError) {
          console.error('❌ [LV API] Erro ao excluir arquivos do bucket:', bucketError);
        }
      }

      // Alternativa: excluir toda a pasta da LV no bucket recursivamente
      try {
        // Listar arquivos na pasta raiz da LV
        const listFilesRecursively = async (folderPath: string, adminClient: SupabaseClient): Promise<string[]> => {
          const allPaths: string[] = [];
          if (!adminClient) {
            return allPaths;
          }
          
          const { data: items, error } = await adminClient.storage
            .from(bucketName)
            .list(folderPath);

          if (error) {
            console.error(`❌ [LV API] Erro ao listar pasta ${folderPath}:`, error);
            return allPaths;
          }

          if (!items) {
            return allPaths;
          }

          for (const item of items) {
            const itemPath = `${folderPath}/${item.name}`;
            if (item.id === null) {
              // É uma pasta, listar recursivamente
              const subPaths = await listFilesRecursively(itemPath, adminClient);
              allPaths.push(...subPaths);
            } else {
              // É um arquivo
              allPaths.push(itemPath);
            }
          }

          return allPaths;
        };

        if (supabaseAdmin) {
          const allFilesInFolder = await listFilesRecursively(id, supabaseAdmin);
          
          if (allFilesInFolder.length > 0) {
            // Excluir todos os arquivos encontrados
            const { error: removeError } = await supabaseAdmin.storage
              .from(bucketName)
              .remove(allFilesInFolder);

            if (removeError) {
              console.error('❌ [LV API] Erro ao excluir pasta do bucket:', removeError);
            } else {
              console.log(`✅ [LV API] Pasta ${id} excluída do bucket (${allFilesInFolder.length} arquivo(s))`);
            }
          }
        }
      } catch (folderError) {
        console.error('❌ [LV API] Erro ao listar/excluir pasta do bucket:', folderError);
      }
    }

    // 3. Excluir LV (isso vai excluir automaticamente avaliações e fotos por CASCADE)
    const { error } = await supabase
      .from('lvs')
      .delete()
      .eq('id', id)
      .eq('auth_user_id', user?.id || '');

    if (error) {
      console.error('❌ [LV API] Erro ao excluir LV:', error);
      return res.status(500).json({ error: 'Erro ao excluir LV' });
    }

    console.log('✅ [LV API] LV excluída com sucesso:', id);
    res.status(204).send();
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar fotos da LV (aceita FormData com arquivos)
// Usa upload.array() mas permite nenhum arquivo (quando não há fotos)
// @ts-ignore - Multer middleware type compatibility issue
router.post('/:id/fotos', authenticateUser, upload.array('fotos', 50), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const files = req.files || [];

    console.log('📸 [LV API] Salvando fotos da LV:', id);
    console.log('📸 [LV API] Recebidos', files.length, 'arquivos');

    // Se não há arquivos, retornar sucesso (não é erro não ter fotos)
    if (!files || files.length === 0) {
      console.log('✅ [LV API] Nenhuma foto para salvar');
      return res.json({
        success: true,
        fotos_salvas: 0,
        data: [],
        message: 'Nenhuma foto para salvar'
      });
    }

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id, tipo_lv')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    if (!supabaseAdmin) {
      console.error('❌ [LV API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Determinar bucket (padrão: fotos-lvs)
    const bucketName = 'fotos-lvs';
    
    // Verificar se o bucket existe
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.id === bucketName);
    
    if (!bucketExists) {
      console.warn(`⚠️ [LV API] Bucket ${bucketName} não existe, tentando criar...`);
    }

    const fotosSalvas = [];

    // Upload de cada arquivo para o Supabase Storage
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Extrair item_id do FormData (enviado como item_id_0, item_id_1, etc.)
        const itemId = req.body[`item_id_${i}`] || req.body.item_id;
        
        if (!itemId) {
          console.warn(`⚠️ [LV API] item_id não fornecido para foto ${file.originalname}`);
          continue;
        }

        // Sanitizar nome do arquivo
        const sanitizedFileName = file.originalname
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_{2,}/g, '_')
          .toLowerCase();
        
        const filePath = `${id}/${itemId}/${sanitizedFileName}_${Date.now()}`;

        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype || 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error(`❌ [LV API] Erro ao fazer upload de ${file.originalname}:`, uploadError);
          continue;
        }

        // Obter URL pública
        const { data: urlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // Preparar dados para salvar na tabela
        // item_id agora é UUID (referência direta a perguntas_lv.id)
        fotosSalvas.push({
          lv_id: id,
          tipo_lv: existingLV.tipo_lv,
          item_id: itemId, // UUID da pergunta
          nome_arquivo: sanitizedFileName,
          url_arquivo: urlData.publicUrl,
          descricao: req.body[`descricao_${i}`] || null,
          latitude: req.body[`latitude_${i}`] ? parseFloat(req.body[`latitude_${i}`]) : null,
          longitude: req.body[`longitude_${i}`] ? parseFloat(req.body[`longitude_${i}`]) : null,
          created_at: new Date().toISOString()
        });
      } catch (fileError) {
        console.error(`❌ [LV API] Erro ao processar arquivo ${file.originalname}:`, fileError);
      }
    }

    if (fotosSalvas.length === 0) {
      return res.status(400).json({ error: 'Nenhuma foto foi processada com sucesso' });
    }

    // Salvar metadados na tabela lv_fotos
    const { data, error } = await supabaseAdmin
      .from('lv_fotos')
      .insert(fotosSalvas)
      .select();

    if (error) {
      console.error('❌ [LV API] Erro ao salvar metadados das fotos:', error);
      return res.status(500).json({ error: 'Erro ao salvar metadados das fotos' });
    }

    console.log('✅ [LV API] Fotos salvas:', data?.length || 0);
    res.json({
      success: true,
      fotos_salvas: data?.length || 0,
      data: data,
      message: 'Fotos salvas com sucesso'
    });
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar avaliações da LV
router.get('/:id/avaliacoes', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('🔍 [LV API] Buscando avaliações da LV:', id);

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    // Buscar avaliações
    const { data, error } = await supabase
      .from('lv_avaliacoes')
      .select('*')
      .eq('lv_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [LV API] Erro ao buscar avaliações:', error);
      return res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }

    console.log('✅ [LV API] Avaliações encontradas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar fotos da LV
router.get('/:id/fotos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('📸 [LV API] Buscando fotos da LV:', id);

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    // Buscar fotos
    const { data, error } = await supabase
      .from('lv_fotos')
      .select('*')
      .eq('lv_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [LV API] Erro ao buscar fotos:', error);
      return res.status(500).json({ error: 'Erro ao buscar fotos' });
    }

    console.log('✅ [LV API] Fotos encontradas:', data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir foto da LV
router.delete('/:id/fotos/:fotoId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id, fotoId } = req.params;
    const user = req.user;

    console.log(`🗑️ [LV API] Excluindo foto ${fotoId} da LV ${id}`);

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id, tipo_lv')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    // Buscar a foto para pegar a URL antes de excluir
    const { data: foto, error: fotoError } = await supabase
      .from('lv_fotos')
      .select('url_arquivo, nome_arquivo')
      .eq('id', fotoId)
      .eq('lv_id', id)
      .single();

    if (fotoError || !foto) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    // Excluir arquivo do Supabase Storage
    if (foto.url_arquivo && supabaseAdmin) {
      try {
        // Extrair caminho do arquivo da URL
        const url = new URL(foto.url_arquivo);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'fotos-lvs');

        if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');

          const { error: removeError } = await supabaseAdmin.storage
            .from('fotos-lvs')
            .remove([filePath]);

          if (removeError) {
            console.warn('⚠️ [LV API] Erro ao excluir arquivo do storage:', removeError);
          } else {
            console.log('✅ [LV API] Arquivo excluído do storage:', filePath);
          }
        }
      } catch (storageError) {
        console.warn('⚠️ [LV API] Erro ao processar exclusão do storage:', storageError);
      }
    }

    // Excluir registro da foto do banco
    const { error: deleteError } = await supabase
      .from('lv_fotos')
      .delete()
      .eq('id', fotoId)
      .eq('lv_id', id);

    if (deleteError) {
      console.error('❌ [LV API] Erro ao excluir foto:', deleteError);
      return res.status(500).json({ error: 'Erro ao excluir foto' });
    }

    console.log('✅ [LV API] Foto excluída com sucesso');
    res.status(204).send();
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Salvar avaliações da LV
router.post('/:id/avaliacoes', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { avaliacoes } = req.body;

    console.log('📝 [LV API] Salvando avaliações da LV:', id);
    console.log('📋 [LV API] Recebidas', avaliacoes?.length || 0, 'avaliações');
    if (avaliacoes?.length > 0) {
      console.log('📋 [LV API] Exemplo de avaliação:', avaliacoes[0]);
    }

    if (!avaliacoes || !Array.isArray(avaliacoes)) {
      return res.status(400).json({ error: 'Avaliações inválidas' });
    }

    // Verificar se a LV existe e pertence ao usuário
    const { data: existingLV, error: fetchError } = await supabase
      .from('lvs')
      .select('id, tipo_lv')
      .eq('id', id)
      .eq('auth_user_id', user?.id || '')
      .single();

    if (fetchError || !existingLV) {
      return res.status(404).json({ error: 'LV não encontrada' });
    }

    // Preparar avaliações para inserção
    // item_id agora é UUID (referência direta a perguntas_lv.id)
    const avaliacoesParaSalvar = avaliacoes.map((avaliacao: Record<string, unknown>) => ({
      lv_id: id,
      tipo_lv: existingLV.tipo_lv,
      item_id: avaliacao.item_id as string, // UUID da pergunta
      item_codigo: avaliacao.item_codigo,
      item_pergunta: avaliacao.item_pergunta,
      avaliacao: avaliacao.avaliacao,
      observacao: avaliacao.observacao || null,
      created_at: new Date().toISOString()
    }));

    // Salvar avaliações
    const { data, error } = await supabase
      .from('lv_avaliacoes')
      .insert(avaliacoesParaSalvar)
      .select();

    if (error) {
      console.error('❌ [LV API] Erro ao salvar avaliações:', error);
      return res.status(500).json({ error: 'Erro ao salvar avaliações' });
    }

    // Atualizar estatísticas da LV
    const totalConformes = avaliacoes.filter((a: any) => a.avaliacao === 'C').length;
    const totalNaoConformes = avaliacoes.filter((a: any) => a.avaliacao === 'NC').length;
    const totalNaoAplicaveis = avaliacoes.filter((a: any) => a.avaliacao === 'NA').length;
    const totalItens = avaliacoes.length;
    const percentualConformidade = totalItens > 0 ? Math.round((totalConformes / totalItens) * 100) : 0;

    await supabase
      .from('lvs')
      .update({
        total_conformes: totalConformes,
        total_nao_conformes: totalNaoConformes,
        total_nao_aplicaveis: totalNaoAplicaveis,
        percentual_conformidade: percentualConformidade
      })
      .eq('id', id);

    console.log('✅ [LV API] Avaliações salvas:', data?.length || 0);
    res.json({
      success: true,
      avaliacoes_salvas: data?.length || 0,
      estatisticas: {
        total_conformes: totalConformes,
        total_nao_conformes: totalNaoConformes,
        total_nao_aplicaveis: totalNaoAplicaveis,
        percentual_conformidade: percentualConformidade
      },
      message: 'Avaliações salvas com sucesso'
    });
  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar configuração completa de uma LV (com itens/perguntas)
router.get('/configuracao/:tipo_lv', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { tipo_lv } = req.params;
    // User validado pelo middleware authenticateUser

    console.log(`🔍 [LV API] Buscando configuração para LV: ${tipo_lv}`);

    if (!supabaseAdmin) {
      console.error('❌ [LV API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Buscar configuração da LV (CORRIGIDO: usa lv_configuracoes ao invés de versoes_lv)
    const { data: configData, error: configError } = await supabaseAdmin
      .from('lv_configuracoes')
      .select('*')
      .eq('tipo_lv', tipo_lv)
      .eq('ativa', true)
      .single();

    if (configError) {
      console.error('❌ [LV API] Erro ao buscar configuração:', configError);
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    console.log(`✅ [LV API] Configuração encontrada: ${configData.nome_lv}`);

    // Buscar perguntas/itens da LV
    // Perguntas são filtradas pelo código que começa com o tipo_lv (ex: '02.001' para LV tipo '02')
    const { data: perguntas, error: perguntasError } = await supabaseAdmin
      .from('perguntas_lv')
      .select('id, codigo, pergunta, categoria_id, ordem, obrigatoria, ativa')
      .eq('ativa', true)
      .like('codigo', `${tipo_lv}.%`)  // Filtra perguntas que começam com o tipo_lv
      .order('ordem', { ascending: true });

    if (perguntasError) {
      console.error('❌ [LV API] Erro ao buscar perguntas:', perguntasError);
      return res.status(500).json({ error: 'Erro ao buscar itens da LV' });
    }

    console.log(`✅ [LV API] Perguntas encontradas: ${perguntas?.length || 0} itens`);

    // Montar resposta completa
    const configuracaoCompleta = {
      id: configData.id,
      tipo_lv: configData.tipo_lv,
      nome_lv: configData.nome_lv,
      nome_completo: configData.nome_completo,
      revisao: configData.revisao || '1.0',
      data_revisao: configData.data_revisao || configData.created_at,
      ativa: configData.ativa,
      bucket_fotos: configData.bucket_fotos || 'fotos-lvs',
      created_at: configData.created_at,
      updated_at: configData.updated_at,
      itens: perguntas?.map((item: any) => ({
        id: item.id,
        codigo: item.codigo,
        pergunta: item.pergunta,
        categoria: item.categoria_id,
        obrigatorio: item.obrigatoria || true,
        ordem: item.ordem
      })) || []
    };

    console.log(`✅ [LV API] Configuração encontrada: ${configuracaoCompleta.itens.length} itens`);
    res.json(configuracaoCompleta);

  } catch (error) {
    console.error('❌ [LV API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 