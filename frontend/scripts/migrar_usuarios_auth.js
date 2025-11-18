// ===================================================================
// SCRIPT DE MIGRAÇÃO DE USUÁRIOS PARA AUTH - ECOFIELD
// Localização: scripts/migrar_usuarios_auth.js
// ===================================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carregar variáveis do backend
const backendEnvPath = join(process.cwd(), '..', '..', 'backend', '.env');
const backendEnvContent = readFileSync(backendEnvPath, 'utf8');

// Parsear variáveis do backend
const backendEnv = {};
backendEnvContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    backendEnv[key.trim()] = value.trim();
  }
});

const supabaseUrl = backendEnv.SUPABASE_URL;
const supabaseServiceKey = backendEnv.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do backend não configuradas');
  console.error('URL:', supabaseUrl ? '✅' : '❌');
  console.error('Service Key:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ [MIGRAÇÃO] Variáveis de ambiente carregadas do backend');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrarUsuariosParaAuth() {
  console.log('🚀 [MIGRAÇÃO] Iniciando migração de usuários para Auth...\n');

  try {
    // 1. Buscar todos os usuários da tabela usuarios
    console.log('📊 [MIGRAÇÃO] Buscando usuários da tabela usuarios...');
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select(`
        *,
        perfis(nome, descricao, permissoes)
      `)
      .eq('ativo', true);

    if (errorUsuarios) {
      console.error('❌ [MIGRAÇÃO] Erro ao buscar usuários:', errorUsuarios);
      return;
    }

    console.log(`✅ [MIGRAÇÃO] Encontrados ${usuarios.length} usuários para migrar`);

    // 2. Migrar cada usuário
    let sucessos = 0;
    let erros = 0;

    for (const usuario of usuarios) {
      try {
        console.log(`\n🔄 [MIGRAÇÃO] Migrando usuário: ${usuario.nome} (${usuario.email})`);

        // Verificar se usuário já existe no Auth
        const { data: { users: existingUsers }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error(`❌ [MIGRAÇÃO] Erro ao listar usuários existentes:`, listError);
          continue;
        }

        const userExists = existingUsers.find(u => u.email === usuario.email);

        if (userExists) {
          console.log(`⚠️ [MIGRAÇÃO] Usuário ${usuario.email} já existe no Auth, pulando...`);
          continue;
        }

        // Preparar metadados
        const metadata = {
          nome: usuario.nome,
          matricula: usuario.matricula,
          perfil: usuario.perfis?.nome || 'TMA Campo',
          funcao: usuario.perfis?.descricao || 'Técnico',
          telefone: usuario.telefone,
          ativo: usuario.ativo,
          permissoes: usuario.perfis?.permissoes || {},
          // Campos de migração
          migrado_em: new Date().toISOString(),
          usuario_original_id: usuario.id
        };

        // Criar usuário no Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: usuario.email,
          password: 'Temp123!', // Senha temporária
          email_confirm: true,
          user_metadata: metadata
        });

        if (error) {
          console.error(`❌ [MIGRAÇÃO] Erro ao criar usuário ${usuario.email}:`, error.message);
          erros++;
          continue;
        }

        if (data.user) {
          console.log(`✅ [MIGRAÇÃO] Usuário ${usuario.email} migrado com sucesso`);
          sucessos++;
        } else {
          console.error(`❌ [MIGRAÇÃO] Falha ao criar usuário ${usuario.email}`);
          erros++;
        }

      } catch (error) {
        console.error(`💥 [MIGRAÇÃO] Erro inesperado ao migrar ${usuario.email}:`, error);
        erros++;
      }
    }

    // 3. Resumo final
    console.log('\n' + '='.repeat(50));
    console.log('📊 [MIGRAÇÃO] RESUMO FINAL');
    console.log('='.repeat(50));
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📈 Total processado: ${sucessos + erros}`);
    
    if (sucessos > 0) {
      console.log('\n🎉 [MIGRAÇÃO] Migração concluída com sucesso!');
      console.log('📝 [MIGRAÇÃO] Todos os usuários migrados têm senha temporária: Temp123!');
      console.log('🔐 [MIGRAÇÃO] Recomenda-se que os usuários alterem suas senhas no primeiro login.');
    } else {
      console.log('\n⚠️ [MIGRAÇÃO] Nenhum usuário foi migrado.');
    }

  } catch (error) {
    console.error('💥 [MIGRAÇÃO] Erro crítico na migração:', error);
  }
}

// Executar migração
migrarUsuariosParaAuth(); 