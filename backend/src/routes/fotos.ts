import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../supabase';

// Middleware de autenticação
const authenticateUser = async (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Erro na autenticação:', error);
    res.status(401).json({ error: 'Erro na autenticação' });
  }
};

const router = Router();

// Listar todas as fotos do sistema
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    console.log('📸 [FOTOS API] Listando todas as fotos...');

    // Buscar fotos de LVs
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    const { data: fotosLV, error: errorLV } = await supabaseAdmin
      .from('lv_fotos')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorLV) {
      console.error('❌ [FOTOS API] Erro ao buscar fotos de LVs:', errorLV);
    }

    // Buscar fotos de Termos
    const { data: fotosTermos, error: errorTermos } = await supabaseAdmin
      .from('termos_fotos')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorTermos) {
      console.error('❌ [FOTOS API] Erro ao buscar fotos de Termos:', errorTermos);
    }

    // Buscar fotos de Rotinas
    const { data: fotosRotina, error: errorRotina } = await supabaseAdmin
      .from('fotos_rotina')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorRotina) {
      console.error('❌ [FOTOS API] Erro ao buscar fotos de Rotinas:', errorRotina);
    }

    // Consolidar todas as fotos
    const todasFotos = [
      ...(fotosLV || []).map(foto => ({
        ...foto,
        tipo: 'lv',
        tipo_lv: foto.tipo_lv || 'residuos'
      })),
      ...(fotosTermos || []).map(foto => ({
        ...foto,
        tipo: 'termo'
      })),
      ...(fotosRotina || []).map(foto => ({
        ...foto,
        tipo: 'rotina'
      }))
    ];

    // Ordenar por data de criação (mais recentes primeiro)
    todasFotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`✅ [FOTOS API] ${todasFotos.length} fotos encontradas`);
    res.json(todasFotos);

  } catch (error) {
    console.error('❌ [FOTOS API] Erro ao listar fotos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar foto por ID
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📸 [FOTOS API] Buscando foto:', id);

    // Tentar buscar em todas as tabelas
    const tabelas = ['lv_fotos', 'termos_fotos', 'fotos_rotina'];
    let foto = null;

    for (const tabela of tabelas) {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        foto = {
          ...data,
          tipo: tabela === 'lv_fotos' ? 'lv' : tabela === 'termos_fotos' ? 'termo' : 'rotina'
        };
        break;
      }
    }

    if (!foto) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    console.log('✅ [FOTOS API] Foto encontrada:', foto.id);
    res.json(foto);

  } catch (error) {
    console.error('❌ [FOTOS API] Erro ao buscar foto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar foto
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;
    console.log('🗑️ [FOTOS API] Deletando foto:', id, 'tipo:', tipo);

    let tabela = '';
    switch (tipo) {
      case 'lv':
        tabela = 'lv_fotos';
        break;
      case 'termo':
        tabela = 'termos_fotos';
        break;
      case 'rotina':
        tabela = 'fotos_rotina';
        break;
      default:
        return res.status(400).json({ error: 'Tipo de foto inválido' });
    }

    const { error } = await supabase
      .from(tabela)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [FOTOS API] Erro ao deletar foto:', error);
      return res.status(500).json({ error: 'Erro ao deletar foto' });
    }

    console.log('✅ [FOTOS API] Foto deletada:', id);
    res.json({ success: true });

  } catch (error) {
    console.error('❌ [FOTOS API] Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar fotos de um termo específico
router.get('/fotos-termo/:termoId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { termoId } = req.params;
    console.log('📸 [FOTOS API] Buscando fotos do termo:', termoId);

    const { data: fotos, error } = await supabase
      .from('termos_fotos')
      .select('*')
      .eq('termo_id', termoId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [FOTOS API] Erro ao buscar fotos do termo:', error);
      return res.status(500).json({ error: 'Erro ao buscar fotos do termo' });
    }

    console.log(`✅ [FOTOS API] ${fotos?.length || 0} fotos encontradas para o termo ${termoId}`);
    res.json({ fotos: fotos || [] });

  } catch (error) {
    console.error('❌ [FOTOS API] Erro ao buscar fotos do termo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de fotos
router.get('/stats', authenticateUser, async (req: Request, res: Response) => {
  try {
    console.log('📊 [FOTOS API] Calculando estatísticas...');

    // Contar fotos por tabela
    const { count: countLV } = await supabase
      .from('lv_fotos')
      .select('*', { count: 'exact', head: true });

    const { count: countTermos } = await supabase
      .from('termos_fotos')
      .select('*', { count: 'exact', head: true });

    const { count: countRotina } = await supabase
      .from('fotos_rotina')
      .select('*', { count: 'exact', head: true });

    const total = (countLV || 0) + (countTermos || 0) + (countRotina || 0);

    // Buscar algumas fotos para calcular tamanho estimado
    const { data: amostraFotos } = await supabase
      .from('lv_fotos')
      .select('tamanho_bytes')
      .limit(100);

    const tamanhoMedio = amostraFotos && amostraFotos.length > 0 
      ? amostraFotos.reduce((acc, foto) => acc + (foto.tamanho_bytes || 1024 * 1024), 0) / amostraFotos.length
      : 1024 * 1024; // 1MB padrão

    const tamanhoTotal = total * tamanhoMedio;

    const stats = {
      total,
      porTipo: {
        lv: countLV || 0,
        termo: countTermos || 0,
        rotina: countRotina || 0
      },
      tamanhoTotal: Math.round(tamanhoTotal)
    };

    console.log('✅ [FOTOS API] Estatísticas calculadas:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ [FOTOS API] Erro ao calcular estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 