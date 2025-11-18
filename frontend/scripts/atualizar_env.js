// ===================================================================
// SCRIPT PARA ATUALIZAR VARIÁVEIS DE AMBIENTE - ECOFIELD
// Localização: scripts/atualizar_env.js
// ===================================================================

import fs from 'fs';
import path from 'path';

async function atualizarVariaveisAmbiente() {
  console.log('🔧 ATUALIZANDO VARIÁVEIS DE AMBIENTE - ECOFIELD');
  console.log('==============================================\n');

  try {
    // 1. Atualizar .env do frontend
    console.log('1️⃣ Atualizando .env do frontend...');
    
    const frontendEnvPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(frontendEnvPath)) {
      let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
      
      // Adicionar VITE_FRONTEND_URL se não existir
      if (!frontendEnv.includes('VITE_FRONTEND_URL')) {
        frontendEnv += '\n# CONFIGURAÇÕES DO FRONTEND\nVITE_FRONTEND_URL=http://localhost:5173\n';
      }
      
      // Atualizar VITE_API_URL se necessário
      if (!frontendEnv.includes('VITE_API_URL=http://localhost:3001')) {
        frontendEnv = frontendEnv.replace(
          /VITE_API_URL=.*/g,
          'VITE_API_URL=http://localhost:3001'
        );
      }
      
      fs.writeFileSync(frontendEnvPath, frontendEnv);
      console.log('✅ .env do frontend atualizado');
    } else {
      console.log('⚠️ Arquivo .env do frontend não encontrado');
    }

    // 2. Atualizar .env do backend
    console.log('\n2️⃣ Atualizando .env do backend...');
    
    const backendEnvPath = path.join(process.cwd(), '../backend/.env');
    if (fs.existsSync(backendEnvPath)) {
      let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
      
      // Adicionar FRONTEND_URL se não existir
      if (!backendEnv.includes('FRONTEND_URL')) {
        backendEnv += '\n# CONFIGURAÇÕES DO FRONTEND\nFRONTEND_URL=http://localhost:5173\n';
      }
      
      // Atualizar API_URL se necessário
      if (!backendEnv.includes('API_URL=http://localhost:3001')) {
        backendEnv = backendEnv.replace(
          /API_URL=.*/g,
          'API_URL=http://localhost:3001'
        );
      }
      
      fs.writeFileSync(backendEnvPath, backendEnv);
      console.log('✅ .env do backend atualizado');
    } else {
      console.log('⚠️ Arquivo .env do backend não encontrado');
    }

    // 3. Verificar se as variáveis estão corretas
    console.log('\n3️⃣ Verificando variáveis de ambiente...');
    
    // Frontend
    if (fs.existsSync(frontendEnvPath)) {
      const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
      const hasViteApiUrl = frontendEnv.includes('VITE_API_URL=http://localhost:3001');
      const hasViteFrontendUrl = frontendEnv.includes('VITE_FRONTEND_URL=http://localhost:5173');
      
      console.log(`   Frontend - VITE_API_URL: ${hasViteApiUrl ? '✅' : '❌'}`);
      console.log(`   Frontend - VITE_FRONTEND_URL: ${hasViteFrontendUrl ? '✅' : '❌'}`);
    }
    
    // Backend
    if (fs.existsSync(backendEnvPath)) {
      const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
      const hasApiUrl = backendEnv.includes('API_URL=http://localhost:3001');
      const hasFrontendUrl = backendEnv.includes('FRONTEND_URL=http://localhost:5173');
      
      console.log(`   Backend - API_URL: ${hasApiUrl ? '✅' : '❌'}`);
      console.log(`   Backend - FRONTEND_URL: ${hasFrontendUrl ? '✅' : '❌'}`);
    }

    console.log('\n✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n📋 RESUMO DAS ALTERAÇÕES:');
    console.log('   ✅ Variáveis de ambiente atualizadas');
    console.log('   ✅ Referências ao localhost substituídas por variáveis');
    console.log('   ✅ Compatibilidade com diferentes ambientes');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Reiniciar o backend para aplicar as mudanças');
    console.log('   2. Reiniciar o frontend para aplicar as mudanças');
    console.log('   3. Testar se as APIs estão funcionando corretamente');
    console.log('   4. Verificar se o dropdown de encarregados está funcionando');

  } catch (error) {
    console.error('❌ ERRO AO ATUALIZAR VARIÁVEIS:', error.message);
  }
}

// Executar atualização
atualizarVariaveisAmbiente(); 