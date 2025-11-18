// ===================================================================
// SCRIPT PARA CRIAR PERFIS NA TABELA DO BANCO - ECOFIELD
// Localização: scripts/criar_perfis_banco.js
// ===================================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carregar variáveis do backend
const backendEnvPath = join(process.cwd(), '..', 'backend', '.env');
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
  process.exit(1);
}

console.log('✅ [PERFIS] Variáveis de ambiente carregadas');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Perfis padrão para inserir na tabela
const PERFIS_PADRAO = [
  {
    nome: 'ADM',
    descricao: 'Administrador do sistema com acesso total',
    permissoes: {
      lvs: ['read', 'write', 'delete', 'admin'],
      termos: ['read', 'write', 'delete', 'admin'],
      rotinas: ['read', 'write', 'delete', 'admin'],
      metas: ['read', 'write', 'delete', 'admin'],
      fotos: ['upload', 'view', 'delete', 'admin'],
      relatorios: ['view', 'export', 'admin'],
      usuarios: ['view', 'create', 'edit', 'delete'],
      perfis: ['view', 'create', 'edit', 'delete'],
      sistema: ['config', 'backup', 'logs'],
      admin: true,
      demo: false
    },
    ativo: true
  },
  {
    nome: 'TMA_GESTAO',
    descricao: 'Gestor de equipe técnica',
    permissoes: {
      lvs: ['read', 'write', 'admin'],
      termos: ['read', 'write', 'admin'],
      rotinas: ['read', 'write', 'admin'],
      metas: ['read', 'write', 'admin'],
      fotos: ['upload', 'view', 'delete'],
      relatorios: ['view', 'export'],
      usuarios: ['view', 'create', 'edit'],
      perfis: ['view'],
      sistema: ['config'],
      admin: false,
      demo: false
    },
    ativo: true
  },
  {
    nome: 'TMA_CAMPO',
    descricao: 'Técnico de campo',
    permissoes: {
      lvs: ['read', 'write'],
      termos: ['read', 'write'],
      rotinas: ['read', 'write'],
      metas: ['read'],
      fotos: ['upload', 'view'],
      relatorios: ['view'],
      usuarios: ['view'],
      perfis: [],
      sistema: [],
      admin: false,
      demo: false
    },
    ativo: true
  },
  {
    nome: 'DESENVOLVEDOR',
    descricao: 'Desenvolvedor do sistema',
    permissoes: {
      lvs: ['read', 'write', 'delete', 'admin'],
      termos: ['read', 'write', 'delete', 'admin'],
      rotinas: ['read', 'write', 'delete', 'admin'],
      metas: ['read', 'write', 'delete', 'admin'],
      fotos: ['upload', 'view', 'delete', 'admin'],
      relatorios: ['view', 'export', 'admin'],
      usuarios: ['view', 'create', 'edit', 'delete'],
      perfis: ['view', 'create', 'edit', 'delete'],
      sistema: ['config', 'backup', 'logs'],
      admin: true,
      demo: false
    },
    ativo: true
  }
];

async function criarPerfisBanco() {
  console.log('🎯 [PERFIS] Criando perfis na tabela do banco...\n');

  try {
    let sucessos = 0;
    let erros = 0;

    for (const perfil of PERFIS_PADRAO) {
      try {
        console.log(`🔄 [PERFIS] Inserindo perfil: ${perfil.nome}`);

        const { data, error } = await supabase
          .from('perfis')
          .upsert({
            nome: perfil.nome,
            descricao: perfil.descricao,
            permissoes: perfil.permissoes,
            ativo: perfil.ativo
          }, {
            onConflict: 'nome',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`❌ [PERFIS] Erro ao inserir ${perfil.nome}:`, error.message);
          erros++;
        } else {
          console.log(`✅ [PERFIS] Perfil ${perfil.nome} criado/atualizado com sucesso`);
          sucessos++;
        }
      } catch (error) {
        console.error(`💥 [PERFIS] Erro inesperado ao processar ${perfil.nome}:`, error);
        erros++;
      }
    }

    // Verificar perfis criados
    console.log('\n📋 [PERFIS] Verificando perfis criados...');
    const { data: perfisCriados, error: listError } = await supabase
      .from('perfis')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (listError) {
      console.error('❌ [PERFIS] Erro ao listar perfis:', listError.message);
    } else {
      console.log(`✅ [PERFIS] ${perfisCriados.length} perfis encontrados no banco:`);
      perfisCriados.forEach(p => {
        console.log(`   • ${p.nome}: ${p.descricao}`);
      });
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 [PERFIS] RESUMO DA CRIAÇÃO DE PERFIS');
    console.log('='.repeat(60));
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    
    console.log('\n🎯 [PERFIS] PERFIS DISPONÍVEIS:');
    console.log('='.repeat(40));
    
    for (const perfil of PERFIS_PADRAO) {
      const dashboard = perfil.permissoes.admin ? 'ADMIN' : 'TÉCNICO';
      
      console.log(`📋 ${perfil.nome}`);
      console.log(`   Descrição: ${perfil.descricao}`);
      console.log(`   Dashboard: ${dashboard}`);
      console.log(`   Admin: ${perfil.permissoes.admin ? '✅ Sim' : '❌ Não'}`);
      console.log('');
    }

  } catch (error) {
    console.error('💥 [PERFIS] Erro crítico na criação:', error);
  }
}

// Executar criação
criarPerfisBanco(); 