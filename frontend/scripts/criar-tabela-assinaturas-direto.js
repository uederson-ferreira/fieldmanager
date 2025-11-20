#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function criarTabela() {
  console.log('🚀 Criando tabela assinaturas_execucoes diretamente...\n');

  // Executar via fetch direto para o endpoint SQL
  const sqlQuery = `
    CREATE TABLE IF NOT EXISTS assinaturas_execucoes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      execucao_id UUID NOT NULL REFERENCES execucoes(id) ON DELETE CASCADE,
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
      assinatura_base64 TEXT NOT NULL,
      hash_assinatura VARCHAR(64) NOT NULL,
      timestamp_assinatura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      usuario_nome VARCHAR(255) NOT NULL,
      usuario_email VARCHAR(255) NOT NULL,
      usuario_matricula VARCHAR(50),
      cargo_responsavel VARCHAR(255),
      validado_por VARCHAR(20) NOT NULL CHECK (validado_por IN ('senha', 'pin', 'biometria')),
      metodo_captura VARCHAR(20) NOT NULL DEFAULT 'canvas' CHECK (metodo_captura IN ('canvas', 'tablet', 'biometria')),
      dispositivo VARCHAR(20) NOT NULL CHECK (dispositivo IN ('mobile', 'desktop', 'tablet')),
      navegador VARCHAR(50),
      user_agent TEXT,
      ip_address INET,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      precisao_gps INTEGER,
      local_assinatura VARCHAR(255),
      observacoes TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'revogada', 'expirada')),
      motivo_revogacao TEXT,
      data_revogacao TIMESTAMP WITH TIME ZONE,
      revogado_por UUID REFERENCES usuarios(id),
      certificado_digital JSONB,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      CONSTRAINT uk_assinatura_execucao UNIQUE (execucao_id)
    );

    ALTER TABLE assinaturas_execucoes ENABLE ROW LEVEL SECURITY;
  `;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sqlQuery })
    });

    if (!response.ok) {
      console.log('⚠️  API REST não suporta execução direta de DDL\n');
      console.log('📋 COPIE E EXECUTE ESTE SQL NO SUPABASE DASHBOARD:\n');
      console.log('=' .repeat(70));
      console.log(sqlQuery);
      console.log('=' .repeat(70));
    }
  } catch (error) {
    console.log('⚠️  Execute manualmente no Supabase Dashboard\n');
  }

  // Verificar se funcionou
  const { error } = await supabase.from('assinaturas_execucoes').select('id').limit(1);
  
  if (error) {
    console.log('\n❌ Tabela ainda não foi criada');
    console.log('\n🔗 Link direto: https://supabase.com/dashboard/project/ysvyfdzczfxwhuyajzre/sql/new');
    console.log('\n📄 Cole o SQL de: sql/migrations/03_criar_tabela_assinaturas.sql\n');
  } else {
    console.log('✅ Tabela criada com sucesso!\n');
  }
}

criarTabela();
