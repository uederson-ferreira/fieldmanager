# Estratégia de Generalização Multi-Domínio - EcoField

## 📋 Sumário Executivo

Este documento descreve a estratégia completa para transformar o **EcoField** (sistema focado em gestão ambiental) em uma **plataforma generalista multi-domínio** que pode atender diferentes áreas:

- 🏗️ **Segurança do Trabalho** (NR-35, NR-10, NR-33, etc.)
- 🏥 **Saúde Ocupacional** (PCMSO, PGR, ASO)
- ✅ **Gestão da Qualidade** (ISO 9001, 5S, Auditorias)
- 🌱 **Meio Ambiente** (ISO 14001, Resíduos, Efluentes) - **Atual**
- 🏭 **Manutenção Industrial** (TPM, Preventiva, Preditiva)
- 📊 **Auditorias e Compliance** (Certificações, Regulamentações)

---

## 🎯 Objetivo da Generalização

### Benefícios Estratégicos

1. **Escalabilidade de Mercado**: Atender múltiplos nichos com uma única plataforma
2. **Reutilização de Código**: 80-90% do código atual pode ser reutilizado
3. **Redução de Custos**: Manutenção centralizada de uma plataforma única
4. **Diferencial Competitivo**: Solução integrada multi-domínio (único no mercado)
5. **Receita Recorrente**: Modelo SaaS multi-tenant com módulos pagos

### Modelo de Negócio Proposto

- **Base Gratuita**: Módulo principal com funcionalidades básicas
- **Módulos Premium**: Cada domínio como add-on pago (R$ 99-299/mês por módulo)
- **Enterprise**: Todos os módulos + suporte + customização (R$ 2.999+/mês)

---

## 🏗️ Arquitetura Proposta

### 1. Multi-Tenancy (Multi-Inquilino)

#### Níveis de Isolamento

##### Opção A: Tenant por Domínio (Recomendada Fase 1)

```bash
tenant_id = UUID único por cliente/empresa
domain_id = UUID único por domínio (ambiental, segurança, qualidade, etc.)
```

##### Opção B: Tenant por Empresa (Recomendada Fase 2 - Escalável)

```bash
empresa_id = UUID único por empresa cliente
dominio_id = UUID do domínio ativo
modulos_ativos = ['ambiental', 'seguranca', 'qualidade']
```

#### Estrutura de Banco de Dados

##### Nova tabela: `tenants` (Inquilinos/Empresas)

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_empresa VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  razao_social VARCHAR(255),
  segmento VARCHAR(100), -- 'industria', 'construcao', 'logistica', etc.
  plano VARCHAR(50) DEFAULT 'free', -- 'free', 'starter', 'professional', 'enterprise'
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_expiracao TIMESTAMP, -- Para controle de assinatura
  configuracoes JSONB DEFAULT '{}', -- Configurações específicas do tenant
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

##### Nova tabela: `dominios` (Domínios de Atuação)

```sql
CREATE TABLE dominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL, -- 'ambiental', 'seguranca', 'qualidade', etc.
  nome VARCHAR(100) NOT NULL, -- 'Meio Ambiente', 'Segurança do Trabalho', etc.
  descricao TEXT,
  icone VARCHAR(100), -- Nome do ícone Lucide React
  cor_primaria VARCHAR(20), -- '#10b981' (verde para ambiental)
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

##### Nova tabela: `tenant_dominios` (Módulos Ativos por Tenant)

```sql
CREATE TABLE tenant_dominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  dominio_id UUID REFERENCES dominios(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  data_ativacao TIMESTAMP DEFAULT NOW(),
  data_desativacao TIMESTAMP,
  configuracoes_especificas JSONB DEFAULT '{}', -- Customizações do módulo
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, dominio_id)
);
```

##### Modificação tabela `usuarios`

```sql
ALTER TABLE usuarios
ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN dominios_acesso UUID[] DEFAULT '{}'; -- Array de IDs de domínios que o user pode acessar
```

---

### 2. Refatoração de Categorias LV

**Problema Atual**:

- `categorias_lv` é específico para meio ambiente
- Códigos hard-coded (LV-01, LV-02, etc.)
- Perguntas fixas para domínio ambiental

**Solução Proposta**:

#### Nova tabela: `modulos_sistema` (Módulos Configuráveis)

```sql
CREATE TABLE modulos_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dominio_id UUID REFERENCES dominios(id),
  codigo VARCHAR(50) NOT NULL, -- 'lv-residuos', 'nr35-trabalho-altura', 'iso9001-processos'
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  tipo_modulo VARCHAR(50), -- 'checklist', 'formulario', 'inspecao', 'auditoria'
  configuracao JSONB DEFAULT '{}', -- Estrutura flexível de campos
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  template BOOLEAN DEFAULT false, -- Se é um template padrão do sistema
  tenant_id UUID REFERENCES tenants(id), -- NULL para templates do sistema
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(dominio_id, codigo, tenant_id)
);
```

#### Nova tabela: `perguntas_modulos` (Perguntas Genéricas)

```sql
CREATE TABLE perguntas_modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID REFERENCES modulos_sistema(id) ON DELETE CASCADE,
  codigo VARCHAR(50) NOT NULL, -- '01.001', 'NR35.001', 'ISO9001.001'
  pergunta TEXT NOT NULL,
  tipo_resposta VARCHAR(50) DEFAULT 'boolean', -- 'boolean', 'text', 'multiple_choice', 'numeric', 'date'
  opcoes_resposta JSONB, -- Para multiple_choice: ['Conforme', 'Não Conforme', 'N/A']
  obrigatoria BOOLEAN DEFAULT false,
  permite_foto BOOLEAN DEFAULT true,
  permite_observacao BOOLEAN DEFAULT true,
  categoria VARCHAR(100), -- 'EPI', 'Procedimentos', 'Documentação', etc.
  subcategoria VARCHAR(100),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  metadados JSONB DEFAULT '{}', -- Campos extras configuráveis
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Migração de Dados Existentes

```sql
-- 1. Criar domínio "Meio Ambiente"
INSERT INTO dominios (codigo, nome, descricao, icone, cor_primaria, ordem)
VALUES ('ambiental', 'Meio Ambiente', 'Gestão Ambiental e Resíduos', 'Leaf', '#10b981', 1);

-- 2. Migrar categorias existentes para modulos_sistema
INSERT INTO modulos_sistema (dominio_id, codigo, nome, descricao, tipo_modulo, configuracao, ordem, ativo, template)
SELECT
  (SELECT id FROM dominios WHERE codigo = 'ambiental'),
  codigo,
  nome,
  descricao,
  'checklist' as tipo_modulo,
  jsonb_build_object(
    'numero_lv', codigo,
    'titulo_lv', nome,
    'revisao', '01',
    'dataRevisao', '2025-01-01'
  ) as configuracao,
  ordem,
  ativa,
  true as template
FROM categorias_lv;

-- 3. Migrar perguntas existentes
INSERT INTO perguntas_modulos (modulo_id, codigo, pergunta, tipo_resposta, obrigatoria, permite_foto, permite_observacao, categoria, ordem, ativo)
SELECT
  ms.id as modulo_id,
  pl.codigo,
  pl.pergunta,
  'boolean' as tipo_resposta,
  pl.obrigatoria,
  true as permite_foto,
  true as permite_observacao,
  cl.nome as categoria,
  pl.ordem,
  pl.ativa
FROM perguntas_lv pl
JOIN categorias_lv cl ON pl.categoria_id = cl.id
JOIN modulos_sistema ms ON ms.codigo = cl.codigo;
```

---

### 3. Sistema de Templates e Customização

#### Templates Pré-Configurados por Domínio

##### Segurança do Trabalho

```sql
-- Exemplo: NR-35 (Trabalho em Altura)
INSERT INTO modulos_sistema (dominio_id, codigo, nome, descricao, tipo_modulo, configuracao, template)
VALUES (
  (SELECT id FROM dominios WHERE codigo = 'seguranca'),
  'nr35-trabalho-altura',
  'Checklist NR-35 - Trabalho em Altura',
  'Verificação de segurança para trabalho acima de 2 metros',
  'checklist',
  '{
    "nr": "NR-35",
    "revisao": "Portaria 3.214/78 - Atualização 2023",
    "campo_aplicacao": "Trabalhos acima de 2m de altura",
    "periodicidade": "Diária antes do início dos trabalhos"
  }',
  true
);

-- Perguntas NR-35
INSERT INTO perguntas_modulos (modulo_id, codigo, pergunta, categoria, obrigatoria) VALUES
((SELECT id FROM modulos_sistema WHERE codigo = 'nr35-trabalho-altura'), 'NR35.001', 'O trabalhador está usando cinto de segurança tipo paraquedista?', 'EPI', true),
((SELECT id FROM modulos_sistema WHERE codigo = 'nr35-trabalho-altura'), 'NR35.002', 'O trabalhador possui treinamento NR-35 válido?', 'Documentação', true),
((SELECT id FROM modulos_sistema WHERE codigo = 'nr35-trabalho-altura'), 'NR35.003', 'Há sistema de proteção contra quedas instalado?', 'Equipamentos', true),
((SELECT id FROM modulos_sistema WHERE codigo = 'nr35-trabalho-altura'), 'NR35.004', 'A APR (Análise Preliminar de Risco) foi preenchida?', 'Documentação', true),
((SELECT id FROM modulos_sistema WHERE codigo = 'nr35-trabalho-altura'), 'NR35.005', 'Há supervisor de segurança no local?', 'Pessoal', true);
```

##### Gestão da Qualidade

```sql
-- Exemplo: ISO 9001 - Auditoria Interna
INSERT INTO modulos_sistema (dominio_id, codigo, nome, descricao, tipo_modulo, configuracao, template)
VALUES (
  (SELECT id FROM dominios WHERE codigo = 'qualidade'),
  'iso9001-auditoria-interna',
  'Checklist ISO 9001 - Auditoria Interna',
  'Verificação de conformidade com requisitos ISO 9001:2015',
  'auditoria',
  '{
    "norma": "ISO 9001:2015",
    "tipo_auditoria": "Interna",
    "clausulas": ["4", "5", "6", "7", "8", "9", "10"]
  }',
  true
);

-- Perguntas ISO 9001
INSERT INTO perguntas_modulos (modulo_id, codigo, pergunta, categoria, tipo_resposta) VALUES
((SELECT id FROM modulos_sistema WHERE codigo = 'iso9001-auditoria-interna'), 'ISO9001.4.1', 'A organização determinou questões internas e externas pertinentes?', 'Contexto da Organização', 'boolean'),
((SELECT id FROM modulos_sistema WHERE codigo = 'iso9001-auditoria-interna'), 'ISO9001.5.1', 'A alta direção demonstra liderança e comprometimento?', 'Liderança', 'boolean'),
((SELECT id FROM modulos_sistema WHERE codigo = 'iso9001-auditoria-interna'), 'ISO9001.8.1', 'Os processos necessários ao SGQ estão implementados?', 'Operação', 'boolean');
```

##### Saúde Ocupacional

```sql
-- Exemplo: PCMSO - Controle de ASO
INSERT INTO modulos_sistema (dominio_id, codigo, nome, descricao, tipo_modulo, configuracao, template)
VALUES (
  (SELECT id FROM dominios WHERE codigo = 'saude'),
  'pcmso-controle-aso',
  'Controle de ASO - PCMSO',
  'Acompanhamento de Atestados de Saúde Ocupacional',
  'formulario',
  '{
    "nr": "NR-7",
    "tipo_exame": ["Admissional", "Periódico", "Retorno ao Trabalho", "Mudança de Função", "Demissional"],
    "validade_meses": 12
  }',
  true
);
```

---

### 4. Refatoração do Frontend

#### 4.1. Sistema de Roteamento Dinâmico

**Problema Atual**: Rotas hard-coded para cada LV

```typescript
// Atual (linha 393-428 em DashboardMainContent.tsx)
case 'lv-residuos':
case 'lv-02':
case 'lv-03':
// ... 26 cases fixos
```

**Solução Proposta**: Roteamento dinâmico por domínio

```typescript
// src/types/dominio.ts
export interface Dominio {
  id: string;
  codigo: string; // 'ambiental', 'seguranca', 'qualidade'
  nome: string;
  descricao?: string;
  icone: string; // Nome do ícone Lucide
  corPrimaria: string; // Hex color
  corSecundaria?: string;
  ordem: number;
  ativo: boolean;
  modulos: ModuloSistema[];
}

export interface ModuloSistema {
  id: string;
  dominio_id: string;
  codigo: string; // 'lv-residuos', 'nr35-trabalho-altura'
  nome: string;
  descricao?: string;
  tipo_modulo: 'checklist' | 'formulario' | 'inspecao' | 'auditoria';
  configuracao: Record<string, any>;
  icone?: string;
  ordem: number;
  ativo: boolean;
  perguntas: PerguntaModulo[];
}

export interface PerguntaModulo {
  id: string;
  modulo_id: string;
  codigo: string;
  pergunta: string;
  tipo_resposta: 'boolean' | 'text' | 'multiple_choice' | 'numeric' | 'date';
  opcoes_resposta?: string[];
  obrigatoria: boolean;
  permite_foto: boolean;
  permite_observacao: boolean;
  categoria?: string;
  subcategoria?: string;
  ordem: number;
  ativo: boolean;
  metadados?: Record<string, any>;
}
```

#### 4.2. Componente Seletor de Domínio

##### Novo componente: `DominioSelector.tsx`

```typescript
// src/components/common/DominioSelector.tsx
import React from 'react';
import { Leaf, HardHat, Award, Stethoscope, Wrench, ClipboardCheck } from 'lucide-react';
import type { Dominio } from '../../types/dominio';

interface DominioSelectorProps {
  dominiosAtivos: Dominio[];
  dominioAtual: string | null;
  onChangeDominio: (dominioId: string) => void;
}

const iconMap = {
  Leaf, HardHat, Award, Stethoscope, Wrench, ClipboardCheck
};

const DominioSelector: React.FC<DominioSelectorProps> = ({
  dominiosAtivos,
  dominioAtual,
  onChangeDominio
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Domínios Ativos</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {dominiosAtivos.map(dominio => {
          const Icon = iconMap[dominio.icone as keyof typeof iconMap] || ClipboardCheck;
          const isActive = dominio.id === dominioAtual;

          return (
            <button
              key={dominio.id}
              onClick={() => onChangeDominio(dominio.id)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${isActive
                  ? `border-[${dominio.corPrimaria}] bg-gradient-to-br from-white to-gray-50 shadow-md`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
              style={{
                borderColor: isActive ? dominio.corPrimaria : undefined,
                color: isActive ? dominio.corPrimaria : undefined
              }}
            >
              <Icon
                className={`h-8 w-8 mb-2 ${isActive ? '' : 'text-gray-600'}`}
                style={{ color: isActive ? dominio.corPrimaria : undefined }}
              />
              <span className="text-xs font-medium text-center">{dominio.nome}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DominioSelector;
```

#### 4.3. Context de Domínio Ativo

##### Novo context: `DominioContext.tsx`

```typescript
// src/contexts/DominioContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Dominio, ModuloSistema } from '../types/dominio';
import { dominiosAPI } from '../lib/dominiosAPI';

interface DominioContextType {
  dominioAtual: Dominio | null;
  dominiosDisponiveis: Dominio[];
  modulosDisponiveis: ModuloSistema[];
  carregando: boolean;
  setDominioAtual: (dominio: Dominio) => void;
  refreshDominios: () => Promise<void>;
}

const DominioContext = createContext<DominioContextType | undefined>(undefined);

export const DominioProvider: React.FC<{ children: React.ReactNode; tenantId: string }> = ({
  children,
  tenantId
}) => {
  const [dominioAtual, setDominioAtual] = useState<Dominio | null>(null);
  const [dominiosDisponiveis, setDominiosDisponiveis] = useState<Dominio[]>([]);
  const [modulosDisponiveis, setModulosDisponiveis] = useState<ModuloSistema[]>([]);
  const [carregando, setCarregando] = useState(true);

  const refreshDominios = async () => {
    try {
      setCarregando(true);
      const dominios = await dominiosAPI.getDominiosAtivos(tenantId);
      setDominiosDisponiveis(dominios);

      // Selecionar domínio padrão (ou do localStorage)
      const dominioSalvo = localStorage.getItem(`dominio_atual_${tenantId}`);
      if (dominioSalvo) {
        const dominio = dominios.find(d => d.id === dominioSalvo);
        if (dominio) setDominioAtual(dominio);
      } else if (dominios.length > 0) {
        setDominioAtual(dominios[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
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
      dominiosAPI.getModulosDominio(dominioAtual.id).then(setModulosDisponiveis);
    }
  }, [dominioAtual, tenantId]);

  return (
    <DominioContext.Provider value={{
      dominioAtual,
      dominiosDisponiveis,
      modulosDisponiveis,
      carregando,
      setDominioAtual,
      refreshDominios
    }}>
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

#### 4.4. Navegação Dinâmica

##### Refatoração: `DashboardNavigation.tsx`

```typescript
// src/components/dashboard/DashboardNavigation.tsx
import { useDominio } from '../../contexts/DominioContext';

const DashboardNavigation: React.FC = () => {
  const { dominioAtual, modulosDisponiveis } = useDominio();
  const { activeSection, setActiveSection } = useDashboard();

  // Itens de menu fixos
  const menuItensFixos = [
    { id: 'dashboard', nome: 'Dashboard', icone: 'LayoutDashboard' },
    { id: 'metas', nome: 'Metas', icone: 'Target' },
    { id: 'acoes-corretivas', nome: 'Ações Corretivas', icone: 'AlertTriangle' }
  ];

  // Itens de menu dinâmicos baseados no domínio
  const menuItensDinamicos = modulosDisponiveis.map(modulo => ({
    id: `modulo-${modulo.id}`,
    nome: modulo.nome,
    icone: modulo.icone || 'FileText',
    codigo: modulo.codigo,
    tipo: modulo.tipo_modulo
  }));

  return (
    <nav className="navigation">
      {/* Header com seletor de domínio */}
      <div className="p-4 border-b border-gray-200">
        <DominioSelector
          dominiosAtivos={dominiosDisponiveis}
          dominioAtual={dominioAtual?.id || null}
          onChangeDominio={(id) => {
            const dominio = dominiosDisponiveis.find(d => d.id === id);
            if (dominio) setDominioAtual(dominio);
          }}
        />
      </div>

      {/* Menus fixos */}
      <div className="menu-section">
        <h3 className="menu-title">Principal</h3>
        {menuItensFixos.map(item => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>

      {/* Menus dinâmicos do domínio */}
      {dominioAtual && (
        <div className="menu-section">
          <h3 className="menu-title">{dominioAtual.nome}</h3>
          {menuItensDinamicos.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </nav>
  );
};
```

---

### 5. Backend - API Endpoints Dinâmicos

#### Nova rota: `/api/dominios`

```typescript
// backend/src/routes/dominios.ts
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/dominios/tenant/:tenantId/ativos
// Retorna domínios ativos para um tenant
router.get('/tenant/:tenantId/ativos', async (req, res) => {
  try {
    const { tenantId } = req.params;

    const { data, error } = await supabase
      .from('tenant_dominios')
      .select(`
        id,
        ativo,
        configuracoes_especificas,
        dominios (
          id,
          codigo,
          nome,
          descricao,
          icone,
          cor_primaria,
          ordem
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .order('dominios(ordem)', { ascending: true });

    if (error) throw error;

    const dominios = data.map(td => ({
      ...td.dominios,
      configuracoes: td.configuracoes_especificas
    }));

    res.json({ dominios });
  } catch (error) {
    console.error('Erro ao buscar domínios:', error);
    res.status(500).json({ error: 'Erro ao buscar domínios' });
  }
});

// GET /api/dominios/:dominioId/modulos
// Retorna módulos de um domínio
router.get('/:dominioId/modulos', async (req, res) => {
  try {
    const { dominioId } = req.params;
    const { tenantId } = req.query;

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

    if (error) throw error;

    res.json({ modulos: data });
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
});

// GET /api/dominios/modulos/:moduloId/perguntas
// Retorna perguntas de um módulo
router.get('/modulos/:moduloId/perguntas', async (req, res) => {
  try {
    const { moduloId } = req.params;

    const { data, error } = await supabase
      .from('perguntas_modulos')
      .select('*')
      .eq('modulo_id', moduloId)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) throw error;

    res.json({ perguntas: data });
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});

// POST /api/dominios/tenant/:tenantId/ativar
// Ativa um domínio para um tenant
router.post('/tenant/:tenantId/ativar', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { dominioId, configuracoes } = req.body;

    const { data, error } = await supabase
      .from('tenant_dominios')
      .insert({
        tenant_id: tenantId,
        dominio_id: dominioId,
        ativo: true,
        configuracoes_especificas: configuracoes || {}
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ sucesso: true, tenant_dominio: data });
  } catch (error) {
    console.error('Erro ao ativar domínio:', error);
    res.status(500).json({ error: 'Erro ao ativar domínio' });
  }
});

export default router;
```

---

### 6. Migração de Dados - Plano de Execução

#### Fase 1: Preparação (Sem Downtime)

```sql
-- 1. Criar novas tabelas
\i sql/migrations/20250118_criar_sistema_multidominio.sql

-- 2. Popular domínios padrão
INSERT INTO dominios (codigo, nome, descricao, icone, cor_primaria, ordem) VALUES
('ambiental', 'Meio Ambiente', 'Gestão Ambiental e Resíduos', 'Leaf', '#10b981', 1),
('seguranca', 'Segurança do Trabalho', 'NRs, EPIs, Prevenção de Acidentes', 'HardHat', '#f59e0b', 2),
('qualidade', 'Gestão da Qualidade', 'ISO 9001, Auditorias, 5S', 'Award', '#3b82f6', 3),
('saude', 'Saúde Ocupacional', 'PCMSO, ASO, Exames', 'Stethoscope', '#ef4444', 4),
('manutencao', 'Manutenção', 'TPM, Preventiva, Preditiva', 'Wrench', '#8b5cf6', 5),
('auditoria', 'Auditorias & Compliance', 'Certificações, Regulamentações', 'ClipboardCheck', '#ec4899', 6);

-- 3. Migrar dados atuais para novo modelo
\i sql/migrations/20250118_migrar_dados_ambientais.sql

-- 4. Criar tenant padrão
INSERT INTO tenants (nome_empresa, plano, ativo)
VALUES ('Sistema EcoField - Tenant Padrão', 'enterprise', true)
RETURNING id;

-- 5. Ativar domínio ambiental para tenant padrão
INSERT INTO tenant_dominios (tenant_id, dominio_id, ativo)
SELECT
  (SELECT id FROM tenants WHERE nome_empresa = 'Sistema EcoField - Tenant Padrão'),
  id,
  true
FROM dominios WHERE codigo = 'ambiental';

-- 6. Atualizar usuários existentes com tenant_id
UPDATE usuarios
SET tenant_id = (SELECT id FROM tenants WHERE nome_empresa = 'Sistema EcoField - Tenant Padrão'),
    dominios_acesso = ARRAY[(SELECT id FROM dominios WHERE codigo = 'ambiental')];
```

#### Fase 2: Testes Paralelos (1-2 semanas)

- Rodar sistema antigo e novo em paralelo
- Testar CRUD de LVs no novo modelo
- Validar migrações de dados
- Ajustar RLS policies

#### Fase 3: Cutover (Deploy Final)

```sql
-- 1. Depreciar tabelas antigas (adicionar views de compatibilidade)
CREATE VIEW categorias_lv AS
SELECT
  id,
  codigo,
  nome,
  descricao,
  ativo as ativa,
  ordem,
  created_at,
  updated_at
FROM modulos_sistema
WHERE dominio_id = (SELECT id FROM dominios WHERE codigo = 'ambiental')
  AND template = true;

-- 2. Redirecionar queries antigas
-- (Manter compatibilidade por 3 meses antes de remover completamente)
```

---

### 7. Roadmap de Implementação

#### Sprint 1 (2 semanas): Infraestrutura

- ✅ Criar tabelas `tenants`, `dominios`, `tenant_dominios`
- ✅ Criar tabelas `modulos_sistema`, `perguntas_modulos`
- ✅ Implementar migrações de dados
- ✅ Criar API endpoints básicos

#### Sprint 2 (2 semanas): Frontend Base

- ✅ Implementar `DominioContext` e `DominioProvider`
- ✅ Criar componente `DominioSelector`
- ✅ Refatorar navegação dinâmica
- ✅ Migrar componente LV para aceitar configuração dinâmica

#### Sprint 3 (2 semanas): Templates Padrão

- ✅ Criar templates de Segurança do Trabalho (5 módulos NR)
- ✅ Criar templates de Qualidade (3 módulos ISO/5S)
- ✅ Criar templates de Saúde (2 módulos PCMSO/ASO)
- ✅ Testes de integração

#### Sprint 4 (1 semana): Multi-Tenancy

- ✅ Implementar autenticação por tenant
- ✅ Implementar RLS policies por tenant
- ✅ Criar tela de gerenciamento de módulos (Admin)
- ✅ Sistema de ativação/desativação de domínios

#### Sprint 5 (1 semana): Customização

- ✅ Permitir criação de módulos customizados por tenant
- ✅ Editor de perguntas para admins
- ✅ Sistema de importação/exportação de templates
- ✅ Documentação e guias

#### Sprint 6 (1 semana): Polimento e Deploy

- ✅ Testes de carga
- ✅ Otimização de performance
- ✅ Deploy staging
- ✅ Deploy produção

#### Total: 9 semanas (~2 meses) para versão MVP generalista

---

### 8. Estimativa de Esforço

| Fase | Horas | Complexidade |
|------|-------|--------------|
| Banco de Dados | 40h | Média |
| Backend APIs | 60h | Média |
| Frontend - Core | 80h | Alta |
| Frontend - Templates | 40h | Média |
| Multi-Tenancy | 60h | Alta |
| Testes | 40h | Média |
| Migração de Dados | 20h | Baixa |
| Deploy e Ajustes | 20h | Baixa |
| **TOTAL** | **360h** | **~45 dias úteis (2 meses)** |

---

### 9. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Perda de dados na migração | Alto | Baixa | Backup completo antes, testes paralelos |
| Performance degradada | Médio | Média | Indexação adequada, caching agressivo |
| Complexidade de RLS policies | Alto | Alta | Documentação detalhada, testes unitários |
| Confusão de usuários | Médio | Média | Tutorial interativo, modo de compatibilidade |
| Aumento de custos Supabase | Médio | Baixa | Monitoramento de queries, otimizações |

---

### 10. Modelo de Precificação Sugerido

#### Planos por Módulo

##### Free Tier (Gratuito)

- ✅ 1 domínio ativo (Ambiental)
- ✅ 3 módulos padrão
- ✅ Até 5 usuários
- ✅ 1GB storage
- ❌ Sem customização de módulos
- ❌ Sem suporte prioritário

##### Starter (R$ 199/mês)

- ✅ 2 domínios ativos
- ✅ 10 módulos padrão
- ✅ Até 20 usuários
- ✅ 10GB storage
- ✅ Customização limitada (5 módulos próprios)
- ✅ Suporte por email

##### Professional (R$ 499/mês)

- ✅ 4 domínios ativos
- ✅ Todos os módulos padrão
- ✅ Até 50 usuários
- ✅ 50GB storage
- ✅ Customização ilimitada
- ✅ Suporte prioritário (WhatsApp/Telefone)
- ✅ Relatórios avançados

##### Enterprise (Sob Consulta)

- ✅ Todos os domínios
- ✅ Usuários ilimitados
- ✅ Storage ilimitado
- ✅ Customização total
- ✅ SLA 99.9%
- ✅ Gerente de conta dedicado
- ✅ Treinamento presencial
- ✅ Integrações customizadas

#### Add-Ons Adicionais

- **Domínio Extra**: R$ 99/mês por domínio
- **Módulo Customizado Premium**: R$ 299 (setup único)
- **Integração API Terceiros**: R$ 499 (setup) + R$ 99/mês
- **Consultoria/Treinamento**: R$ 200/hora

---

### 11. Próximos Passos Recomendados

#### Decisão Estratégica Necessária

1. **Validar o modelo de negócio**:
   - O mercado está disposto a pagar por uma solução multi-domínio?
   - Qual domínio atacar primeiro após Meio Ambiente?

2. **Definir escopo do MVP**:
   - Opção A: Multi-domínio completo (2 meses)
   - Opção B: Apenas preparar arquitetura + 1 novo domínio (3 semanas)
   - Opção C: Apenas multi-tenancy sem novos domínios (2 semanas)

3. **Recursos necessários**:
   - 1 desenvolvedor full-time = 2 meses
   - OU 2 desenvolvedores = 1 mês
   - Budget: R$ 20-30k (se contratar externo)

#### Ação Imediata Sugerida

**Proof of Concept (1 semana)**:

- Criar estrutura de banco de dados
- Implementar 1 novo domínio (Segurança - NR-35) como teste
- Validar se a arquitetura proposta funciona
- Estimar esforço real baseado no PoC

**Comando para iniciar**:

```bash
# Criar branch para desenvolvimento
git checkout -b feature/multi-dominio-poc

# Criar estrutura de migração
mkdir -p sql/migrations/multidominio
touch sql/migrations/multidominio/01_criar_tabelas_base.sql
touch sql/migrations/multidominio/02_popular_dominios.sql
touch sql/migrations/multidominio/03_migrar_dados_ambientais.sql
```

---

## 📊 Conclusão

A transformação do EcoField em uma **plataforma generalista multi-domínio** é **tecnicamente viável** e **estrategicamente vantajosa**. A arquitetura atual já possui 80% da funcionalidade necessária, sendo necessário:

1. ✅ Refatoração do modelo de dados (multi-tenancy + domínios)
2. ✅ Generalização de componentes (LVs → Módulos)
3. ✅ Criação de templates por domínio
4. ✅ Implementação de sistema de permissões por domínio

**Investimento estimado**: 2 meses de desenvolvimento
**ROI esperado**: 5-10x no potencial de mercado (ao invés de apenas "ambiental", atender 6+ mercados)

**Decisão recomendada**: Executar PoC de 1 semana para validar viabilidade técnica antes de comprometer recursos para desenvolvimento completo.
