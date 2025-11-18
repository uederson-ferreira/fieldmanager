import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../supabase';

const router = Router();

// ===================================================================
// TIPOS
// ===================================================================

interface UsuarioCompleto {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  matricula?: string;
  telefone?: string;
  perfil_id: string;
  empresa_id?: string;
  ativo: boolean;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
}

interface PermissoesPerfil {
  admin?: boolean;
  usuarios?: string[];
  lvs?: string[];
  termos?: string[];
  rotinas?: string[];
  metas?: string[];
  fotos?: string[];
  relatorios?: string[];
  perfis?: string[];
  sistema?: string[];
}

// ===================================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ===================================================================

const authenticateUser = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação necessário' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar usuário na tabela usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (usuarioError || !usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado no sistema' });
    }

    req.user = { ...user, ...usuario } as unknown as any;
    next();
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro de autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================================================
// ROTAS DA API
// ===================================================================

// Buscar usuário atual
router.get('/me', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UsuarioCompleto;
    console.log('👤 [USUARIOS API] Buscando usuário atual:', user.email);

    res.json({
      id: user.id,
      auth_user_id: user.auth_user_id,
      nome: user.nome,
      email: user.email,
      matricula: user.matricula,
      perfil_id: user.perfil_id,
      empresa_id: user.empresa_id,
      ativo: user.ativo,
      ultimo_login: user.ultimo_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuários ativos (apenas admin)
router.get('/usuarios-ativos', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UsuarioCompleto;
    console.log('👥 [USUARIOS API] Buscando usuários ativos');

    // PERMISSÃO LIBERADA: Qualquer usuário autenticado pode ver a lista de usuários ativos
    // Isso é necessário para atribuir ações corretivas, selecionar responsáveis, etc.

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        email,
        matricula,
        perfil_id,
        empresa_id,
        ativo,
        ultimo_login,
        created_at,
        updated_at,
        perfis (
          id,
          nome,
          descricao
        )
      `)
      .eq('ativo', true)
      .order('nome');

    if (error) {
      console.error('❌ [USUARIOS API] Erro ao buscar usuários:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }

    console.log('✅ [USUARIOS API] Usuários encontrados:', usuarios?.length);
    res.json(usuarios);
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuários TMA (apenas admin)
router.get('/usuarios-tma', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UsuarioCompleto;
    console.log('👥 [USUARIOS API] Buscando usuários TMA');

    // Verificar se é admin
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('permissoes')
      .eq('id', user.perfil_id)
      .single();

    if (perfilError || !perfil) {
      return res.status(403).json({ error: 'Perfil não encontrado' });
    }

    const permissoes = perfil.permissoes as PermissoesPerfil;
    if (!permissoes?.admin && !permissoes?.usuarios?.includes('view')) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar usuários com perfil TMA
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        email,
        matricula,
        perfil_id,
        empresa_id,
        ativo,
        ultimo_login,
        created_at,
        updated_at,
        perfis (
          id,
          nome,
          descricao
        )
      `)
      .eq('ativo', true)
      .like('perfis.nome', '%TMA%')
      .order('nome');

    if (error) {
      console.error('❌ [USUARIOS API] Erro ao buscar usuários TMA:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuários TMA' });
    }

    console.log('✅ [USUARIOS API] Usuários TMA encontrados:', usuarios?.length);
    res.json(usuarios);
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar usuário (apenas admin)
router.post('/criar-usuario', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UsuarioCompleto;
    const userData = req.body;

    console.log('📝 [USUARIOS API] Criando usuário:', userData.email);

    // Verificar se é admin
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('permissoes')
      .eq('id', user.perfil_id)
      .single();

    if (perfilError || !perfil) {
      return res.status(403).json({ error: 'Perfil não encontrado' });
    }

    const permissoes = perfil.permissoes as PermissoesPerfil;
    if (!permissoes?.admin && !permissoes?.usuarios?.includes('create')) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Validar dados obrigatórios
    if (!userData.email || !userData.nome || !userData.senha || !userData.perfil_id) {
      return res.status(400).json({ error: 'Email, nome, senha e perfil são obrigatórios' });
    }

    // 1. Criar usuário no Supabase Auth
    console.log('🔧 [USUARIOS API] Verificando supabaseAdmin:', !!supabaseAdmin);
    if (!supabaseAdmin) {
      console.error('❌ [USUARIOS API] Supabase Admin não configurado');
      return res.status(500).json({ error: 'Serviço de autenticação não configurado' });
    }

    console.log('🔧 [USUARIOS API] Tentando criar usuário no Auth:', userData.email);
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.senha,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ [USUARIOS API] Erro ao criar usuário no Auth:', authError);
      return res.status(500).json({ error: 'Erro ao criar usuário no sistema de autenticação' });
    }

    console.log('✅ [USUARIOS API] Usuário criado no Auth:', authUser.user?.id);

    // 2. Criar usuário na tabela usuarios
    const novoUsuario = {
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha, // Será criptografada pelo Supabase
      matricula: userData.matricula || null,
      telefone: userData.telefone || null,
      perfil_id: userData.perfil_id,
      empresa_id: userData.empresa_id || null,
      ativo: true,
      auth_user_id: authUser.user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .insert(novoUsuario)
      .select()
      .single();

    if (usuarioError) {
      console.error('❌ [USUARIOS API] Erro ao criar usuário na tabela:', usuarioError);
      // Tentar deletar o usuário do Auth se falhou na tabela
      if (authUser.user?.id && supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      }
      return res.status(500).json({ error: 'Erro ao criar usuário na tabela' });
    }

    console.log('✅ [USUARIOS API] Usuário criado:', usuario.email);
    res.status(201).json(usuario);
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário (apenas admin ou próprio usuário)
router.put('/atualizar-usuario/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UsuarioCompleto;
    const { id } = req.params;
    const userData = req.body;

    console.log('📝 [USUARIOS API] Atualizando usuário:', id);

    // Verificar se é admin ou está editando próprio perfil
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('permissoes')
      .eq('id', user.perfil_id)
      .single();

    if (perfilError || !perfil) {
      return res.status(403).json({ error: 'Perfil não encontrado' });
    }

    const permissoes = perfil.permissoes as PermissoesPerfil;
    const isAdmin = permissoes?.admin || permissoes?.usuarios?.includes('edit');
    const isOwnProfile = user.id === id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar usuário existente
    const { data: usuarioExistente, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Preparar dados para atualização
    const dadosAtualizacao: Partial<UsuarioCompleto> = {
      nome: userData.nome || usuarioExistente.nome,
      email: userData.email || usuarioExistente.email,
      matricula: userData.matricula || usuarioExistente.matricula,
      telefone: userData.telefone || usuarioExistente.telefone,
      empresa_id: userData.empresa_id || usuarioExistente.empresa_id,
      ativo: userData.ativo !== undefined ? userData.ativo : usuarioExistente.ativo,
      updated_at: new Date().toISOString()
    };

    // Apenas admin pode alterar perfil
    if (isAdmin && userData.perfil_id) {
      dadosAtualizacao.perfil_id = userData.perfil_id;
    }

    // Atualizar na tabela usuarios
    const { data: usuario, error: updateError } = await supabase
      .from('usuarios')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [USUARIOS API] Erro ao atualizar usuário:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }

    // Se senha foi fornecida, atualizar no Auth
    if (userData.senha && usuarioExistente.auth_user_id && supabaseAdmin) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        usuarioExistente.auth_user_id,
        { password: userData.senha }
      );

      if (authError) {
        console.error('❌ [USUARIOS API] Erro ao atualizar senha no Auth:', authError);
        // Não falhar a operação se apenas a senha falhou
      }
    }

    console.log('✅ [USUARIOS API] Usuário atualizado:', usuario.email);
    res.json(usuario);
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário (apenas admin)
router.delete('/deletar-usuario/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UsuarioCompleto;
    const { id } = req.params;

    console.log('🗑️ [USUARIOS API] Deletando usuário:', id);

    // Verificar se é admin
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('permissoes')
      .eq('id', user.perfil_id)
      .single();

    if (perfilError || !perfil) {
      return res.status(403).json({ error: 'Perfil não encontrado' });
    }

    const permissoes = perfil.permissoes as PermissoesPerfil;
    if (!permissoes?.admin && !permissoes?.usuarios?.includes('delete')) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Não permitir deletar próprio usuário
    if (user.id === id) {
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
    }

    // Buscar usuário para pegar auth_user_id
    const { data: usuario, error: fetchError } = await supabase
      .from('usuarios')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    if (fetchError || !usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deletar da tabela usuarios
    const { error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ [USUARIOS API] Erro ao deletar usuário:', deleteError);
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }

    // Deletar do Auth se existir
    if (usuario.auth_user_id && supabaseAdmin) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(usuario.auth_user_id);
      if (authError) {
        console.error('❌ [USUARIOS API] Erro ao deletar usuário do Auth:', authError);
        // Não falhar a operação se apenas o Auth falhou
      }
    }

    console.log('✅ [USUARIOS API] Usuário deletado:', id);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID (apenas admin ou próprio usuário)
router.get('/usuario/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UsuarioCompleto;
    const { id } = req.params;

    console.log('🔍 [USUARIOS API] Buscando usuário:', id);

    // Verificar se é admin ou está buscando próprio perfil
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('permissoes')
      .eq('id', user.perfil_id)
      .single();

    if (perfilError || !perfil) {
      return res.status(403).json({ error: 'Perfil não encontrado' });
    }

    const permissoes = perfil.permissoes as PermissoesPerfil;
    const isAdmin = permissoes?.admin || permissoes?.usuarios?.includes('view');
    const isOwnProfile = user.id === id;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        email,
        matricula,
        telefone,
        perfil_id,
        empresa_id,
        ativo,
        ultimo_login,
        created_at,
        updated_at,
        perfis (
          id,
          nome,
          descricao
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ [USUARIOS API] Erro ao buscar usuário:', error);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ [USUARIOS API] Usuário encontrado:', usuario.email);
    res.json(usuario);
  } catch (error) {
    console.error('❌ [USUARIOS API] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 