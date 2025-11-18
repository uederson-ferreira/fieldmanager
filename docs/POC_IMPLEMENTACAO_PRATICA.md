# Proof of Concept (PoC) - Implementação Prática Multi-Domínio

## 🎯 Objetivo do PoC

Validar a viabilidade técnica da arquitetura multi-domínio através da implementação de:

1. **Estrutura de banco de dados** multi-tenant + multi-domínio
2. **1 novo domínio completo**: Segurança do Trabalho (NR-35)
3. **Componente frontend genérico** que funciona para qualquer domínio
4. **APIs backend** para servir módulos dinamicamente

**Duração**: 1 semana (40 horas)
**Resultado Esperado**: Sistema funcionando com 2 domínios (Ambiental + Segurança)

---

## 📋 Checklist de Implementação

### Fase 1: Database (8 horas)

- [ ] Criar tabela `dominios`
- [ ] Criar tabela `tenants`
- [ ] Criar tabela `tenant_dominios`
- [ ] Criar tabela `modulos_sistema`
- [ ] Criar tabela `perguntas_modulos`
- [ ] Criar tabela `execucoes` (substitui `lvs`)
- [ ] Criar tabela `execucoes_respostas` (substitui `lv_avaliacoes`)
- [ ] Criar tabela `execucoes_fotos` (substitui `lv_fotos`)
- [ ] Popular dados de exemplo
- [ ] Configurar RLS policies
- [ ] Testar queries

### Fase 2: Backend (12 horas)

- [ ] Criar `/api/dominios` - CRUD domínios
- [ ] Criar `/api/dominios/:id/modulos` - Listar módulos
- [ ] Criar `/api/modulos/:id/perguntas` - Listar perguntas
- [ ] Criar `/api/execucoes` - CRUD execuções
- [ ] Implementar middleware de tenant
- [ ] Testar endpoints com Postman

### Fase 3: Frontend (16 horas)

- [ ] Criar `DominioContext.tsx`
- [ ] Criar `DominioSelector.tsx`
- [ ] Refatorar `DashboardNavigation.tsx` (dinâmico)
- [ ] Criar `ModuloContainer.tsx` (genérico)
- [ ] Criar `ModuloForm.tsx` (genérico)
- [ ] Testar fluxo completo
- [ ] Integrar com componentes existentes

### Fase 4: Validação (4 horas)

- [ ] Criar checklist NR-35 completo
- [ ] Testar cadastro de execução
- [ ] Validar isolamento de dados por tenant
- [ ] Comparar performance (antes vs depois)
- [ ] Documentar resultados

---

## 🗄️ Código SQL Completo

### 1. Criar Tabelas Base

```sql
-- ================================================================
-- MIGRAÇÃO: Sistema Multi-Domínio
-- Arquivo: sql/migrations/20250118_criar_sistema_multidominio.sql
-- ================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABELA: tenants (Empresas/Clientes)
-- ================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_empresa VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  razao_social VARCHAR(255),
  segmento VARCHAR(100), -- 'industria', 'construcao', 'logistica', etc.
  plano VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'professional', 'enterprise'
  max_usuarios INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP, -- Para controle de assinatura
  configuracoes JSONB DEFAULT '{}', -- Config específicas do tenant
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tenants_ativo ON tenants(ativo);
CREATE INDEX idx_tenants_plano ON tenants(plano);

-- ================================================================
-- TABELA: dominios (Áreas de Atuação)
-- ================================================================
CREATE TABLE IF NOT EXISTS dominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL, -- 'ambiental', 'seguranca', 'qualidade'
  nome VARCHAR(100) NOT NULL, -- 'Meio Ambiente', 'Segurança do Trabalho'
  descricao TEXT,
  icone VARCHAR(100), -- Nome do ícone Lucide React
  cor_primaria VARCHAR(20) DEFAULT '#10b981', -- Hex color
  cor_secundaria VARCHAR(20),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_dominios_codigo ON dominios(codigo);
CREATE INDEX idx_dominios_ativo ON dominios(ativo);
CREATE INDEX idx_dominios_ordem ON dominios(ordem);

-- ================================================================
-- TABELA: tenant_dominios (Módulos Ativos por Tenant)
-- ================================================================
CREATE TABLE IF NOT EXISTS tenant_dominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dominio_id UUID NOT NULL REFERENCES dominios(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  data_ativacao TIMESTAMP DEFAULT NOW(),
  data_desativacao TIMESTAMP,
  configuracoes_especificas JSONB DEFAULT '{}', -- Customizações do módulo
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, dominio_id)
);

-- Índices
CREATE INDEX idx_tenant_dominios_tenant ON tenant_dominios(tenant_id);
CREATE INDEX idx_tenant_dominios_dominio ON tenant_dominios(dominio_id);
CREATE INDEX idx_tenant_dominios_ativo ON tenant_dominios(ativo);

-- ================================================================
-- TABELA: modulos_sistema (Checklists/Formulários Configuráveis)
-- ================================================================
CREATE TABLE IF NOT EXISTS modulos_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dominio_id UUID NOT NULL REFERENCES dominios(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = template do sistema
  codigo VARCHAR(100) NOT NULL, -- 'lv-residuos', 'nr35-trabalho-altura'
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  tipo_modulo VARCHAR(50) DEFAULT 'checklist', -- 'checklist', 'formulario', 'inspecao', 'auditoria'
  configuracao JSONB DEFAULT '{}', -- Estrutura flexível (número LV, revisão, etc.)
  icone VARCHAR(100),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  template BOOLEAN DEFAULT false, -- Se é template padrão do sistema
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(dominio_id, codigo, COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::UUID))
);

-- Índices
CREATE INDEX idx_modulos_dominio ON modulos_sistema(dominio_id);
CREATE INDEX idx_modulos_tenant ON modulos_sistema(tenant_id);
CREATE INDEX idx_modulos_template ON modulos_sistema(template);
CREATE INDEX idx_modulos_ativo ON modulos_sistema(ativo);

-- ================================================================
-- TABELA: perguntas_modulos (Itens de Verificação Genéricos)
-- ================================================================
CREATE TABLE IF NOT EXISTS perguntas_modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID NOT NULL REFERENCES modulos_sistema(id) ON DELETE CASCADE,
  codigo VARCHAR(50) NOT NULL, -- '01.001', 'NR35.001'
  pergunta TEXT NOT NULL,
  tipo_resposta VARCHAR(50) DEFAULT 'boolean', -- 'boolean', 'text', 'multiple_choice', 'numeric', 'date'
  opcoes_resposta JSONB, -- Para multiple_choice: ['C', 'NC', 'NA']
  valor_padrao TEXT,
  obrigatoria BOOLEAN DEFAULT false,
  permite_foto BOOLEAN DEFAULT true,
  permite_observacao BOOLEAN DEFAULT true,
  categoria VARCHAR(100), -- 'EPI', 'Procedimentos', 'Documentação'
  subcategoria VARCHAR(100),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  metadados JSONB DEFAULT '{}', -- Campos extras configuráveis
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_perguntas_modulo ON perguntas_modulos(modulo_id);
CREATE INDEX idx_perguntas_ativo ON perguntas_modulos(ativo);
CREATE INDEX idx_perguntas_ordem ON perguntas_modulos(ordem);

-- ================================================================
-- TABELA: execucoes (Substitui lvs - Genérico)
-- ================================================================
CREATE TABLE IF NOT EXISTS execucoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES modulos_sistema(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  numero_sequencial SERIAL,
  numero_documento VARCHAR(100), -- Gerado automaticamente
  data_execucao TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'concluido', -- 'rascunho', 'concluido', 'cancelado'

  -- Dados do executor
  executor_nome VARCHAR(255),
  executor_matricula VARCHAR(50),
  executor_funcao VARCHAR(100),

  -- Dados adicionais
  area_id UUID,
  area_nome VARCHAR(255),
  local_atividade TEXT,

  -- Responsáveis/Inspetores
  responsavel_tecnico VARCHAR(255),
  inspetor_secundario VARCHAR(255),
  inspetor_secundario_matricula VARCHAR(50),

  -- Observações gerais
  observacoes TEXT,

  -- Assinaturas
  assinatura_principal TEXT, -- Base64
  data_assinatura_principal TIMESTAMP,
  assinatura_secundaria TEXT,
  data_assinatura_secundaria TIMESTAMP,

  -- Localização
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  gps_accuracy DECIMAL(10, 2),
  endereco_gps TEXT,

  -- Estatísticas calculadas
  total_itens INTEGER DEFAULT 0,
  total_conformes INTEGER DEFAULT 0,
  total_nao_conformes INTEGER DEFAULT 0,
  total_nao_aplicaveis INTEGER DEFAULT 0,
  percentual_conformidade DECIMAL(5, 2),

  -- Campos customizados (JSON flexível)
  campos_customizados JSONB DEFAULT '{}',

  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_execucoes_tenant ON execucoes(tenant_id);
CREATE INDEX idx_execucoes_modulo ON execucoes(modulo_id);
CREATE INDEX idx_execucoes_usuario ON execucoes(usuario_id);
CREATE INDEX idx_execucoes_data ON execucoes(data_execucao);
CREATE INDEX idx_execucoes_status ON execucoes(status);

-- ================================================================
-- TABELA: execucoes_respostas (Substitui lv_avaliacoes)
-- ================================================================
CREATE TABLE IF NOT EXISTS execucoes_respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execucao_id UUID NOT NULL REFERENCES execucoes(id) ON DELETE CASCADE,
  pergunta_id UUID NOT NULL REFERENCES perguntas_modulos(id) ON DELETE CASCADE,
  pergunta_codigo VARCHAR(50),
  resposta TEXT, -- 'C', 'NC', 'NA', ou texto livre, ou número
  resposta_booleana BOOLEAN, -- Para tipo_resposta = 'boolean'
  observacao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(execucao_id, pergunta_id)
);

-- Índices
CREATE INDEX idx_respostas_execucao ON execucoes_respostas(execucao_id);
CREATE INDEX idx_respostas_pergunta ON execucoes_respostas(pergunta_id);

-- ================================================================
-- TABELA: execucoes_fotos (Substitui lv_fotos)
-- ================================================================
CREATE TABLE IF NOT EXISTS execucoes_fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execucao_id UUID NOT NULL REFERENCES execucoes(id) ON DELETE CASCADE,
  pergunta_id UUID REFERENCES perguntas_modulos(id) ON DELETE SET NULL,
  pergunta_codigo VARCHAR(50),
  nome_arquivo VARCHAR(255) NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_bytes BIGINT,
  tipo_mime VARCHAR(100),
  categoria VARCHAR(50) DEFAULT 'evidencia', -- 'evidencia', 'nao_conformidade'
  descricao TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp_captura TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_fotos_execucao ON execucoes_fotos(execucao_id);
CREATE INDEX idx_fotos_pergunta ON execucoes_fotos(pergunta_id);

-- ================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dominios_updated_at BEFORE UPDATE ON dominios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_dominios_updated_at BEFORE UPDATE ON tenant_dominios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modulos_sistema_updated_at BEFORE UPDATE ON modulos_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perguntas_modulos_updated_at BEFORE UPDATE ON perguntas_modulos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_execucoes_updated_at BEFORE UPDATE ON execucoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- FUNCTION: Gerar número de documento automaticamente
-- ================================================================
CREATE OR REPLACE FUNCTION gerar_numero_documento()
RETURNS TRIGGER AS $$
DECLARE
  modulo_codigo VARCHAR(50);
  ano_atual VARCHAR(4);
  seq_numero INTEGER;
BEGIN
  -- Buscar código do módulo
  SELECT codigo INTO modulo_codigo FROM modulos_sistema WHERE id = NEW.modulo_id;

  -- Ano atual
  ano_atual := TO_CHAR(NOW(), 'YYYY');

  -- Número sequencial
  seq_numero := NEW.numero_sequencial;

  -- Gerar número: CODIGO-AAAA-NNNN (ex: NR35-2025-0001)
  NEW.numero_documento := UPPER(modulo_codigo) || '-' || ano_atual || '-' || LPAD(seq_numero::TEXT, 4, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gerar_numero_documento
BEFORE INSERT ON execucoes
FOR EACH ROW EXECUTE FUNCTION gerar_numero_documento();

-- ================================================================
-- FIM DA MIGRAÇÃO
-- ================================================================
```

### 2. Popular Dados Iniciais

```sql
-- ================================================================
-- POPULAR DADOS INICIAIS
-- Arquivo: sql/migrations/20250118_popular_dados_iniciais.sql
-- ================================================================

-- ================================================================
-- DOMÍNIOS PADRÃO
-- ================================================================
INSERT INTO dominios (codigo, nome, descricao, icone, cor_primaria, cor_secundaria, ordem) VALUES
('ambiental', 'Meio Ambiente', 'Gestão Ambiental, Resíduos, Efluentes e Emissões', 'Leaf', '#10b981', '#059669', 1),
('seguranca', 'Segurança do Trabalho', 'NRs, EPIs, Prevenção de Acidentes, DDS', 'HardHat', '#f59e0b', '#d97706', 2),
('qualidade', 'Gestão da Qualidade', 'ISO 9001, Auditorias, 5S, Processos', 'Award', '#3b82f6', '#2563eb', 3),
('saude', 'Saúde Ocupacional', 'PCMSO, ASO, Exames, Ergonomia', 'Stethoscope', '#ef4444', '#dc2626', 4),
('manutencao', 'Manutenção', 'TPM, Preventiva, Preditiva, Ordens', 'Wrench', '#8b5cf6', '#7c3aed', 5),
('auditoria', 'Auditorias & Compliance', 'Certificações, Regulamentações, Conformidade', 'ClipboardCheck', '#ec4899', '#db2777', 6);

-- ================================================================
-- TENANT PADRÃO (Para sistema atual)
-- ================================================================
INSERT INTO tenants (nome_empresa, plano, max_usuarios, max_storage_gb, ativo)
VALUES ('EcoField - Sistema Principal', 'enterprise', 999, 999, true)
ON CONFLICT DO NOTHING;

-- Variável para armazenar ID do tenant
DO $$
DECLARE
  tenant_padrao_id UUID;
  dominio_ambiental_id UUID;
  dominio_seguranca_id UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO tenant_padrao_id FROM tenants WHERE nome_empresa = 'EcoField - Sistema Principal';
  SELECT id INTO dominio_ambiental_id FROM dominios WHERE codigo = 'ambiental';
  SELECT id INTO dominio_seguranca_id FROM dominios WHERE codigo = 'seguranca';

  -- Ativar domínio ambiental para tenant padrão
  INSERT INTO tenant_dominios (tenant_id, dominio_id, ativo)
  VALUES (tenant_padrao_id, dominio_ambiental_id, true)
  ON CONFLICT (tenant_id, dominio_id) DO NOTHING;

  -- Ativar domínio segurança para tenant padrão (PoC)
  INSERT INTO tenant_dominios (tenant_id, dominio_id, ativo)
  VALUES (tenant_padrao_id, dominio_seguranca_id, true)
  ON CONFLICT (tenant_id, dominio_id) DO NOTHING;
END $$;

-- ================================================================
-- MÓDULO EXEMPLO: NR-35 Trabalho em Altura
-- ================================================================
DO $$
DECLARE
  dominio_seg_id UUID;
  modulo_nr35_id UUID;
BEGIN
  -- Buscar domínio segurança
  SELECT id INTO dominio_seg_id FROM dominios WHERE codigo = 'seguranca';

  -- Criar módulo NR-35
  INSERT INTO modulos_sistema (
    dominio_id,
    codigo,
    nome,
    descricao,
    tipo_modulo,
    configuracao,
    icone,
    ordem,
    ativo,
    template
  ) VALUES (
    dominio_seg_id,
    'nr35-trabalho-altura',
    'NR-35 - Trabalho em Altura',
    'Checklist de segurança para trabalhos realizados acima de 2 metros de altura',
    'checklist',
    '{
      "nr": "NR-35",
      "revisao": "Portaria 3.214/78 - Atualização 2023",
      "campo_aplicacao": "Trabalhos acima de 2m de altura",
      "periodicidade": "Diária antes do início dos trabalhos",
      "responsavel": "Técnico de Segurança",
      "validade_horas": 8
    }'::jsonb,
    'HardHat',
    1,
    true,
    true
  )
  RETURNING id INTO modulo_nr35_id;

  -- Inserir perguntas NR-35
  INSERT INTO perguntas_modulos (modulo_id, codigo, pergunta, tipo_resposta, categoria, obrigatoria, ordem) VALUES
  -- Categoria: EPIs e Equipamentos
  (modulo_nr35_id, 'NR35.001', 'O trabalhador está usando cinto de segurança tipo paraquedista?', 'boolean', 'EPIs', true, 1),
  (modulo_nr35_id, 'NR35.002', 'O cinto está fixado ao ponto de ancoragem adequado?', 'boolean', 'EPIs', true, 2),
  (modulo_nr35_id, 'NR35.003', 'O capacete está com jugular fixada?', 'boolean', 'EPIs', true, 3),
  (modulo_nr35_id, 'NR35.004', 'O trava-quedas está instalado corretamente?', 'boolean', 'Equipamentos', true, 4),
  (modulo_nr35_id, 'NR35.005', 'A linha de vida está instalada e sinalizada?', 'boolean', 'Equipamentos', true, 5),

  -- Categoria: Documentação
  (modulo_nr35_id, 'NR35.006', 'O trabalhador possui treinamento NR-35 válido (até 2 anos)?', 'boolean', 'Documentação', true, 6),
  (modulo_nr35_id, 'NR35.007', 'Foi emitida a Permissão de Trabalho em Altura (PTA)?', 'boolean', 'Documentação', true, 7),
  (modulo_nr35_id, 'NR35.008', 'A APR (Análise Preliminar de Risco) foi preenchida?', 'boolean', 'Documentação', true, 8),
  (modulo_nr35_id, 'NR35.009', 'O ASO (Atestado de Saúde Ocupacional) está válido?', 'boolean', 'Documentação', true, 9),

  -- Categoria: Área de Trabalho
  (modulo_nr35_id, 'NR35.010', 'A área está isolada e sinalizada?', 'boolean', 'Área de Trabalho', true, 10),
  (modulo_nr35_id, 'NR35.011', 'Há proteção contra queda de objetos?', 'boolean', 'Área de Trabalho', true, 11),
  (modulo_nr35_id, 'NR35.012', 'O piso está livre de obstáculos e nivelado?', 'boolean', 'Área de Trabalho', true, 12),
  (modulo_nr35_id, 'NR35.013', 'As condições climáticas são adequadas (sem chuva/vento forte)?', 'boolean', 'Área de Trabalho', false, 13),

  -- Categoria: Supervisão e Equipe
  (modulo_nr35_id, 'NR35.014', 'Há supervisor de segurança designado no local?', 'boolean', 'Supervisão', true, 14),
  (modulo_nr35_id, 'NR35.015', 'A equipe de resgate está disponível e preparada?', 'boolean', 'Supervisão', true, 15),
  (modulo_nr35_id, 'NR35.016', 'Há comunicação eficaz entre trabalhador e equipe de apoio?', 'boolean', 'Supervisão', false, 16),

  -- Categoria: Equipamentos de Acesso
  (modulo_nr35_id, 'NR35.017', 'Escadas/andaimes estão em boas condições?', 'boolean', 'Equipamentos de Acesso', true, 17),
  (modulo_nr35_id, 'NR35.018', 'Plataformas elevatórias possuem certificado de inspeção válido?', 'boolean', 'Equipamentos de Acesso', false, 18),

  -- Categoria: Emergência
  (modulo_nr35_id, 'NR35.019', 'Existe plano de emergência e resgate definido?', 'boolean', 'Emergência', true, 19),
  (modulo_nr35_id, 'NR35.020', 'Kit de primeiros socorros está disponível no local?', 'boolean', 'Emergência', true, 20);

  -- Atualizar metadados do módulo
  UPDATE modulos_sistema
  SET metadata = jsonb_build_object(
    'total_perguntas', 20,
    'perguntas_obrigatorias', 17,
    'categorias', ARRAY['EPIs', 'Equipamentos', 'Documentação', 'Área de Trabalho', 'Supervisão', 'Equipamentos de Acesso', 'Emergência'],
    'tempo_estimado_minutos', 15
  )
  WHERE id = modulo_nr35_id;
END $$;

-- ================================================================
-- ATUALIZAR USUÁRIOS EXISTENTES COM TENANT_ID
-- ================================================================
DO $$
DECLARE
  tenant_padrao_id UUID;
BEGIN
  SELECT id INTO tenant_padrao_id FROM tenants WHERE nome_empresa = 'EcoField - Sistema Principal';

  -- Adicionar coluna se não existir
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS dominios_acesso UUID[] DEFAULT '{}';

  -- Atualizar usuários existentes
  UPDATE usuarios
  SET tenant_id = tenant_padrao_id,
      dominios_acesso = ARRAY(SELECT id FROM dominios WHERE codigo IN ('ambiental', 'seguranca'))
  WHERE tenant_id IS NULL;
END $$;

-- ================================================================
-- FIM DA POPULAÇÃO DE DADOS
-- ================================================================

-- Verificar dados inseridos
SELECT 'Domínios criados:', COUNT(*) FROM dominios;
SELECT 'Tenants criados:', COUNT(*) FROM tenants;
SELECT 'Módulos criados:', COUNT(*) FROM modulos_sistema;
SELECT 'Perguntas criadas:', COUNT(*) FROM perguntas_modulos;
```

---

## 🔧 Código Backend (Express)

### API: `/api/dominios`

```typescript
// backend/src/routes/dominios.ts
import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ================================================================
// GET /api/dominios/tenant/:tenantId/ativos
// Retorna domínios ativos para um tenant
// ================================================================
router.get('/tenant/:tenantId/ativos', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    console.log(`📋 [DOMINIOS] Buscando domínios ativos para tenant: ${tenantId}`);

    const { data, error } = await supabase
      .from('tenant_dominios')
      .select(`
        id,
        ativo,
        configuracoes_especificas,
        dominios:dominio_id (
          id,
          codigo,
          nome,
          descricao,
          icone,
          cor_primaria,
          cor_secundaria,
          ordem
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .order('dominios(ordem)', { ascending: true });

    if (error) {
      console.error('❌ [DOMINIOS] Erro ao buscar:', error);
      throw error;
    }

    const dominios = data.map(td => ({
      ...td.dominios,
      configuracoes: td.configuracoes_especificas
    }));

    console.log(`✅ [DOMINIOS] ${dominios.length} domínios encontrados`);
    res.json({ dominios });
  } catch (error) {
    console.error('❌ [DOMINIOS] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar domínios' });
  }
});

// ================================================================
// GET /api/dominios/:dominioId/modulos
// Retorna módulos de um domínio
// ================================================================
router.get('/:dominioId/modulos', async (req: Request, res: Response) => {
  try {
    const { dominioId } = req.params;
    const { tenantId } = req.query;

    console.log(`📦 [DOMINIOS] Buscando módulos do domínio: ${dominioId}`);

    let query = supabase
      .from('modulos_sistema')
      .select('*')
      .eq('dominio_id', dominioId)
      .eq('ativo', true);

    // Templates do sistema OU módulos customizados do tenant
    if (tenantId) {
      query = query.or(`template.eq.true,tenant_id.eq.${tenantId}`);
    } else {
      query = query.eq('template', true);
    }

    const { data, error } = await query.order('ordem', { ascending: true });

    if (error) {
      console.error('❌ [DOMINIOS] Erro ao buscar módulos:', error);
      throw error;
    }

    console.log(`✅ [DOMINIOS] ${data.length} módulos encontrados`);
    res.json({ modulos: data });
  } catch (error) {
    console.error('❌ [DOMINIOS] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
});

// ================================================================
// GET /api/dominios/modulos/:moduloId/perguntas
// Retorna perguntas de um módulo
// ================================================================
router.get('/modulos/:moduloId/perguntas', async (req: Request, res: Response) => {
  try {
    const { moduloId } = req.params;

    console.log(`❓ [DOMINIOS] Buscando perguntas do módulo: ${moduloId}`);

    const { data, error } = await supabase
      .from('perguntas_modulos')
      .select('*')
      .eq('modulo_id', moduloId)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      console.error('❌ [DOMINIOS] Erro ao buscar perguntas:', error);
      throw error;
    }

    console.log(`✅ [DOMINIOS] ${data.length} perguntas encontradas`);
    res.json({ perguntas: data });
  } catch (error) {
    console.error('❌ [DOMINIOS] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});

// ================================================================
// GET /api/dominios/modulos/:moduloId
// Retorna detalhes de um módulo
// ================================================================
router.get('/modulos/:moduloId', async (req: Request, res: Response) => {
  try {
    const { moduloId } = req.params;

    const { data, error } = await supabase
      .from('modulos_sistema')
      .select('*, dominios:dominio_id(*)')
      .eq('id', moduloId)
      .single();

    if (error) throw error;

    res.json({ modulo: data });
  } catch (error) {
    console.error('❌ [DOMINIOS] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar módulo' });
  }
});

export default router;
```

### Registrar Rotas no Express

```typescript
// backend/src/index.ts
import dominiosRoutes from './routes/dominios';

// ... outras importações

app.use('/api/dominios', dominiosRoutes);
```

---

## ⚛️ Código Frontend (React)

### 1. Context de Domínio

```typescript
// frontend/src/contexts/DominioContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Dominio, ModuloSistema } from '../types/dominio';

interface DominioContextType {
  dominioAtual: Dominio | null;
  dominiosDisponiveis: Dominio[];
  modulosDisponiveis: ModuloSistema[];
  carregando: boolean;
  setDominioAtual: (dominio: Dominio) => void;
  refreshDominios: () => Promise<void>;
}

const DominioContext = createContext<DominioContextType | undefined>(undefined);

export const DominioProvider: React.FC<{
  children: React.ReactNode;
  tenantId: string;
}> = ({ children, tenantId }) => {
  const [dominioAtual, setDominioAtual] = useState<Dominio | null>(null);
  const [dominiosDisponiveis, setDominiosDisponiveis] = useState<Dominio[]>([]);
  const [modulosDisponiveis, setModulosDisponiveis] = useState<ModuloSistema[]>([]);
  const [carregando, setCarregando] = useState(true);

  const refreshDominios = async () => {
    try {
      setCarregando(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dominios/tenant/${tenantId}/ativos`
      );

      const data = await response.json();
      setDominiosDisponiveis(data.dominios || []);

      // Selecionar domínio do localStorage ou primeiro disponível
      const dominioSalvo = localStorage.getItem(`dominio_atual_${tenantId}`);
      let dominioSelecionado = null;

      if (dominioSalvo) {
        dominioSelecionado = data.dominios.find((d: Dominio) => d.id === dominioSalvo);
      }

      if (!dominioSelecionado && data.dominios.length > 0) {
        dominioSelecionado = data.dominios[0];
      }

      if (dominioSelecionado) {
        setDominioAtual(dominioSelecionado);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar domínios:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    refreshDominios();
  }, [tenantId]);

  useEffect(() => {
    if (dominioAtual) {
      localStorage.setItem(`dominio_atual_${tenantId}`, dominioAtual.id);

      // Carregar módulos do domínio
      fetch(
        `${import.meta.env.VITE_API_URL}/api/dominios/${dominioAtual.id}/modulos?tenantId=${tenantId}`
      )
        .then(res => res.json())
        .then(data => setModulosDisponiveis(data.modulos || []))
        .catch(console.error);
    }
  }, [dominioAtual, tenantId]);

  return (
    <DominioContext.Provider
      value={{
        dominioAtual,
        dominiosDisponiveis,
        modulosDisponiveis,
        carregando,
        setDominioAtual,
        refreshDominios
      }}
    >
      {children}
    </DominioContext.Provider>
  );
};

export const useDominio = () => {
  const context = useContext(DominioContext);
  if (!context) {
    throw new Error('useDominio deve ser usado dentro de DominioProvider');
  }
  return context;
};
```

### 2. Componente Seletor de Domínio

```typescript
// frontend/src/components/common/DominioSelector.tsx
import React from 'react';
import * as Icons from 'lucide-react';
import type { Dominio } from '../../types/dominio';

interface DominioSelectorProps {
  dominiosAtivos: Dominio[];
  dominioAtual: string | null;
  onChangeDominio: (dominioId: string) => void;
}

const DominioSelector: React.FC<DominioSelectorProps> = ({
  dominiosAtivos,
  dominioAtual,
  onChangeDominio
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Domínios Ativos
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {dominiosAtivos.map(dominio => {
          // @ts-ignore - Importação dinâmica de ícones
          const Icon = Icons[dominio.icone] || Icons.ClipboardCheck;
          const isActive = dominio.id === dominioAtual;

          return (
            <button
              key={dominio.id}
              onClick={() => onChangeDominio(dominio.id)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${isActive
                  ? 'border-current bg-gradient-to-br from-white to-gray-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
              style={{
                borderColor: isActive ? dominio.cor_primaria : undefined,
                color: isActive ? dominio.cor_primaria : '#6b7280'
              }}
            >
              <Icon className="h-8 w-8 mb-2" />
              <span className="text-xs font-medium text-center">
                {dominio.nome}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DominioSelector;
```

---

## 🧪 Testes de Validação

### Teste 1: Criar Execução NR-35

```bash
curl -X POST http://localhost:3001/api/execucoes \
-H "Content-Type: application/json" \
-d '{
  "tenant_id": "uuid-tenant",
  "modulo_id": "uuid-modulo-nr35",
  "usuario_id": "uuid-usuario",
  "executor_nome": "João Silva",
  "executor_matricula": "12345",
  "area_nome": "Obra - Prédio A",
  "respostas": [
    {
      "pergunta_id": "uuid-pergunta-1",
      "resposta": "C",
      "observacao": "Cinto OK"
    },
    {
      "pergunta_id": "uuid-pergunta-2",
      "resposta": "NC",
      "observacao": "Ancoragem inadequada"
    }
  ]
}'
```

### Resultado Esperado

```json
{
  "sucesso": true,
  "execucao_id": "uuid-exec-001",
  "numero_documento": "NR35-2025-0001",
  "ncs_detectadas": 1,
  "percentual_conformidade": 95.0
}
```

---

## 📊 Métricas de Sucesso do PoC

Ao final do PoC, validar:

- [ ] Sistema funciona com 2 domínios (Ambiental + Segurança)
- [ ] Componente genérico renderiza ambos os tipos sem alterações
- [ ] Isolamento de dados por tenant funciona (RLS)
- [ ] Performance aceitável (< 500ms para carregar módulo)
- [ ] Novo módulo pode ser criado em < 30 minutos
- [ ] Zero duplicação de código entre domínios

**Decisão após PoC**: Se todas as métricas forem atingidas, prosseguir com implementação completa.

---

## 📝 Próximos Passos Pós-PoC

Se PoC for bem-sucedido:

1. Migrar todos os módulos ambientais existentes
2. Criar templates para outros domínios (Qualidade, Saúde)
3. Implementar sistema de customização (Admin criar módulos)
4. Desenvolver dashboards dinâmicos por domínio
5. Implementar billing/cobrança por módulo ativo

**Tempo estimado completo**: 6-8 semanas
