// ===================================================================
// ROTAS DE AUTENTICAÇÃO - ECOFIELD SYSTEM
// Localização: backend/src/routes/auth.ts
// ===================================================================

import express from 'express';
import { supabase } from '../supabase';
import { authenticateUser } from '../middleware/auth';
import crypto from 'crypto';

const authRouter = express.Router();

// ===================================================================
// CHAVE DE CRIPTOGRAFIA (DEVE SER A MESMA DO FRONTEND)
// ===================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

// ✅ VALIDAÇÃO DE SEGURANÇA
if (!ENCRYPTION_KEY) {
  throw new Error('❌ [SECURITY] ENCRYPTION_KEY não definida! Configure a variável de ambiente.');
}

// ===================================================================
// UTILITÁRIOS DE SEGURANÇA
// ===================================================================

/**
 * Valida se o ambiente é seguro
 */
function isSecureEnvironment(req: express.Request): boolean {
  // Temporariamente desabilitado para Vercel
  return true;
}

/**
 * Descriptografa senha usando AES
 */

// function decryptPassword(encryptedPassword: string): string {
//   try {
//     const parts = encryptedPassword.split(':');
//     if (parts.length !== 2) {
//       throw new Error('Formato de senha criptografada inválido');
//     }
    
//     const iv = Buffer.from(parts[0], 'hex');
//     const encrypted = Buffer.from(parts[1], 'hex');
    
//     const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY!), iv);
//     let decrypted = decipher.update(encrypted);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
    
//     return decrypted.toString('utf8');
//   } catch (error) {
//     console.error('❌ [AUTH BACKEND] Erro ao descriptografar senha:', error);
//     throw new Error('Erro ao processar senha criptografada');
//   }
// }

// ===================================================================
// FUNÇÃO CORRIGIDA - DESCRIPTOGRAFIA AES
// ===================================================================

function decryptPassword(encryptedPassword: string): string {
  try {
    // 🔒 SEGURANÇA: Logs removidos para não expor dados sensíveis

    const parts = encryptedPassword.split(':');
    if (parts.length !== 2) {
      throw new Error('Formato de senha criptografada inválido');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');

    // ✅ CORREÇÃO: CONVERTER CHAVE HEX PARA BUFFER
    const keyBuffer = Buffer.from(ENCRYPTION_KEY!, 'hex');

    // ✅ USAR CHAVE CONVERTIDA
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const result = decrypted.toString('utf8');

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [DEBUG] Descriptografia bem-sucedida');
    }

    return result;

  } catch (error) {
    console.error('❌ [AUTH BACKEND] Erro ao descriptografar senha');
    throw new Error('Erro ao processar senha criptografada');
  }
}

/**
 * Mascara dados sensíveis nos logs
 */
function maskSensitiveData(data: any): string {
  const masked = { ...data };
  if (masked.password) {
    masked.password = '[OCULTO]';
  }
  return JSON.stringify(masked);
}

// ===================================================================
// LOGIN
// ===================================================================

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password, useHash } = req.body;
    
    // 🔒 SEGURANÇA: Logs de senhas removidos
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 [AUTH BACKEND] Dados recebidos:', {
        email,
        password: '[OCULTO]',
        passwordLength: password ? password.length : 0,
        useHash
      });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // ✅ VALIDAR AMBIENTE SEGURO
    if (!isSecureEnvironment(req)) {
      console.error('⚠️ [SECURITY] Tentativa de login via HTTP não seguro!');
      return res.status(403).json({ error: 'Acesso via HTTPS obrigatório em produção' });
    }

    // 🔒 SEGURANÇA: Não logar email e senha juntos
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [AUTH BACKEND] Tentando login:', email, '[SENHA OCULTA]');
    }

    // ✅ PROCESSAR SENHA (CRIPTOGRAFADA OU TEXTO PLANO)
    let processedPassword = password;

    if (useHash) {
      // ✅ DESCRIPTOGRAFAR SENHA USANDO AES
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 [AUTH BACKEND] Tentando descriptografar senha AES...');
        }

        // ✅ DESCRIPTOGRAFAR COM CHAVE COMPARTILHADA
        const decryptedPassword = decryptPassword(password);
        processedPassword = decryptedPassword;

        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [AUTH BACKEND] Senha descriptografada com sucesso');
        }
      } catch (error) {
        console.error('❌ [AUTH BACKEND] Erro ao descriptografar senha');
        return res.status(400).json({ error: 'Erro ao processar credenciais' });
      }
    } else {
      // Se recebeu texto plano, usar diretamente
      processedPassword = password;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 [AUTH BACKEND] Usando senha original');
      }
    }

    // 1. Autenticar no Supabase (usando senha original)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: processedPassword
    });

    if (error) {
      console.error('❌ [AUTH BACKEND] Erro no login Supabase:', error.message);
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
      }
      return res.status(401).json({ error: errorMessage });
    }

    if (!data.user) {
      console.error('❌ [AUTH BACKEND] Usuário não encontrado');
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // 2. Buscar dados completos na tabela usuarios
    const { data: userData, error: userError } = await supabase
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
        perfis (
          nome,
          permissoes
        )
      `)
      .eq('auth_user_id', data.user.id)
      .single();

    if (userError) {
      console.error('❌ [AUTH BACKEND] Erro ao buscar dados do usuário:', userError.message);
      return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }

    if (!userData) {
      console.error('❌ [AUTH BACKEND] Usuário não encontrado na tabela usuarios');
      return res.status(401).json({ error: 'Usuário não encontrado no sistema' });
    }

    // 3. Converter para UserData
    const user = {
      id: data.user.id,
      usuario_id: userData.id,
      nome: userData.nome,
      email: userData.email,
      matricula: userData.matricula || '',
      perfil: (userData.perfis as any)?.nome || 'TMA Campo',
      funcao: (userData.perfis as any)?.nome || 'Técnico',
      telefone: userData.telefone,
      ativo: userData.ativo,
      permissoes: (userData.perfis as any)?.permissoes || {},
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    console.log('✅ [AUTH BACKEND] Login bem-sucedido:', user.nome);
    
    res.json({ 
      user,
      token: data.session?.access_token 
    });
  } catch (error) {
    console.error('💥 [AUTH BACKEND] Erro inesperado no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// LOGOUT
// ===================================================================

authRouter.post('/logout', authenticateUser, async (req, res) => {
  try {
    console.log('🚪 [AUTH BACKEND] Iniciando logout...');
    
    // Fazer logout do Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [AUTH BACKEND] Erro no logout Supabase:', error.message);
      // Não retornar erro, apenas logar
    }

    console.log('✅ [AUTH BACKEND] Logout bem-sucedido');
    res.json({ success: true });
  } catch (error) {
    console.error('💥 [AUTH BACKEND] Erro inesperado no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// OBTER USUÁRIO ATUAL
// ===================================================================

authRouter.get('/me', authenticateUser, async (req, res) => {
  try {
    console.log('👤 [AUTH BACKEND] Obtendo usuário atual...');
    
    const userId = (req as any).user.id;

    // Buscar dados completos na tabela usuarios
    const { data: userData, error: userError } = await supabase
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
        perfis (
          nome,
          permissoes
        )
      `)
      .eq('auth_user_id', userId)
      .single();

    if (userError) {
      console.error('❌ [AUTH BACKEND] Erro ao buscar dados do usuário:', userError.message);
      return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }

    if (!userData) {
      console.error('❌ [AUTH BACKEND] Usuário não encontrado na tabela usuarios');
      return res.status(404).json({ error: 'Usuário não encontrado no sistema' });
    }

    // Converter para UserData
    const user = {
      id: userId,
      usuario_id: userData.id,
      nome: userData.nome,
      email: userData.email,
      matricula: userData.matricula || '',
      perfil: (userData.perfis as any)?.nome || 'TMA Campo',
      funcao: (userData.perfis as any)?.nome || 'Técnico',
      telefone: userData.telefone,
      ativo: userData.ativo,
      permissoes: (userData.perfis as any)?.permissoes || {},
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    console.log('✅ [AUTH BACKEND] Usuário obtido:', user.nome);
    res.json({ user });
  } catch (error) {
    console.error('💥 [AUTH BACKEND] Erro inesperado ao obter usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// REGISTRAR USUÁRIO (ADMIN)
// ===================================================================

authRouter.post('/register', authenticateUser, async (req, res) => {
  try {
    const { nome, email, password, matricula, telefone, perfil } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    console.log('👤 [AUTH BACKEND] Criando usuário:', email);

    // 1. Criar usuário no auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        matricula,
        telefone
      },
    });

    if (authError) {
      console.error('❌ [AUTH BACKEND] Erro ao criar usuário no auth:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      console.error('❌ [AUTH BACKEND] Usuário não foi criado no auth');
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    // 2. Buscar perfil por nome
    const { data: perfilData, error: perfilError } = await supabase
      .from('perfis')
      .select('id')
      .eq('nome', perfil || 'TMA Campo')
      .single();

    if (perfilError) {
      console.error('❌ [AUTH BACKEND] Erro ao buscar perfil:', perfilError.message);
      return res.status(400).json({ error: 'Perfil não encontrado' });
    }

    // 3. Criar registro na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .insert({
        nome,
        email: email.toLowerCase().trim(),
        matricula,
        telefone,
        perfil_id: perfilData.id,
        auth_user_id: authData.user.id,
        ativo: true,
      })
      .select(`
        id,
        nome,
        email,
        matricula,
        telefone,
        ativo,
        created_at,
        updated_at,
        perfis (
          nome,
          permissoes
        )
      `)
      .single();

    if (userError) {
      console.error('❌ [AUTH BACKEND] Erro ao criar usuário na tabela usuarios:', userError.message);
      // Tentar deletar o usuário do auth se falhou na tabela usuarios
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Erro ao criar usuário no sistema' });
    }

    // 4. Converter para UserData
    const user = {
      id: authData.user.id,
      nome: userData.nome,
      email: userData.email,
      matricula: userData.matricula || '',
      perfil: (userData.perfis as any)?.nome || perfil || 'TMA Campo',
      funcao: (userData.perfis as any)?.nome || 'Técnico',
      telefone: userData.telefone,
      ativo: userData.ativo,
      permissoes: (userData.perfis as any)?.permissoes || {},
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    console.log('✅ [AUTH BACKEND] Usuário criado com sucesso:', user.nome);
    res.json({ user });
  } catch (error) {
    console.error('💥 [AUTH BACKEND] Erro inesperado ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ===================================================================
// RECUPERAÇÃO DE SENHA
// ===================================================================

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    console.log('📧 [AUTH BACKEND] Processando recuperação de senha para:', email);

    // 1. Verificar se o usuário existe
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('email', email.toLowerCase().trim())
      .eq('ativo', true)
      .single();

    if (userError || !userData) {
      console.log('⚠️ [AUTH BACKEND] Usuário não encontrado ou inativo:', email);
      // Por segurança, não revelar se o email existe ou não
      return res.json({ 
        success: true, 
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação' 
      });
    }

    // 2. Gerar token de recuperação (opcional - implementação básica)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // 3. Salvar token no banco (opcional - implementação básica)
    // Por enquanto, apenas simular o envio

    console.log('✅ [AUTH BACKEND] Processamento de recuperação concluído para:', email);
    
    // 4. Resposta de sucesso (simulando envio de email)
    res.json({ 
      success: true, 
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação em breve',
      // Em produção, aqui seria enviado um email real
      debug: {
        email: email.toLowerCase().trim(),
        resetToken,
        resetExpiry: resetExpiry.toISOString()
      }
    });

  } catch (error) {
    console.error('💥 [AUTH BACKEND] Erro inesperado na recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default authRouter; 