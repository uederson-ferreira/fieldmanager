// ===================================================================
// MIDDLEWARE DE AUTENTICAÇÃO COM DEBUG - ECOFIELD SYSTEM
// Localização: backend/src/middleware/auth.ts
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔐 [AUTH MIDDLEWARE] === INÍCIO DA AUTENTICAÇÃO ===');
    
    const authHeader = req.headers.authorization;
    console.log('🔐 [AUTH MIDDLEWARE] Header Authorization:', authHeader ? 'Presente' : 'Ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [AUTH MIDDLEWARE] Token não fornecido ou formato inválido');
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    console.log('🔐 [AUTH MIDDLEWARE] Token extraído:', token ? `Presente (${token.length} chars)` : 'Vazio');
    
    // ===================================================================
    // 🔍 DEBUG: Decodificar token JWT manualmente
    // ===================================================================
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('🔐 [AUTH MIDDLEWARE] Token payload decodificado:', {
          sub: payload.sub,
          email: payload.email,
          exp: new Date(payload.exp * 1000).toISOString(),
          iat: new Date(payload.iat * 1000).toISOString()
        });
      }
    } catch (decodeError) {
      console.error('❌ [AUTH MIDDLEWARE] Erro ao decodificar token:', decodeError);
    }
    
    // ===================================================================
    // 🔍 VERIFICAR TOKEN COM SUPABASE
    // ===================================================================
    console.log('🔐 [AUTH MIDDLEWARE] Verificando token com Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('🔐 [AUTH MIDDLEWARE] Resposta do Supabase:');
    console.log('  - User existe:', user ? 'SIM' : 'NÃO');
    console.log('  - Error:', error ? error.message : 'Nenhum erro');
    
    if (user) {
      console.log('🔐 [AUTH MIDDLEWARE] Dados do user do Supabase:');
      console.log('  - user.id:', user.id);
      console.log('  - user.email:', user.email);
      console.log('  - user.role:', user.role);
      console.log('  - user.aud:', user.aud);
      console.log('  - Objeto user completo:', JSON.stringify(user, null, 2));
    }
    
    if (error || !user) {
      console.error('❌ [AUTH MIDDLEWARE] Erro na autenticação:', error);
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    // ===================================================================
    // 🔍 ADICIONAR USER AO REQUEST
    // ===================================================================
    const userForRequest = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    console.log('🔐 [AUTH MIDDLEWARE] User sendo adicionado ao req:');
    console.log('  - req.user.id:', userForRequest.id);
    console.log('  - req.user.email:', userForRequest.email);
    console.log('  - req.user.role:', userForRequest.role);
    
    // Adicionar usuário à requisição (usando any para evitar conflitos de tipo)
    (req as any).user = userForRequest;
    
    console.log('✅ [AUTH MIDDLEWARE] Usuário autenticado com sucesso:', user.email);
    console.log('🔐 [AUTH MIDDLEWARE] === FIM DA AUTENTICAÇÃO ===\n');
    
    next();
  } catch (error) {
    console.error('💥 [AUTH MIDDLEWARE] Erro inesperado:', error);
    res.status(500).json({ error: 'Erro interno de autenticação' });
  }
};