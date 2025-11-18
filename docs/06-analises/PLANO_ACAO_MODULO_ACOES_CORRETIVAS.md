# 🎯 Plano de Ação: Módulo de Ações Corretivas para NCs

**Data:** 17/11/2025
**Versão:** 1.0
**Objetivo:** Implementar sistema completo de gestão de não conformidades com planos de ação automáticos

---

## 📊 Visão Geral do Projeto

### Problema Identificado

Atualmente, quando uma Não Conformidade (NC) é detectada em uma Lista de Verificação (LV), o sistema apenas registra a ocorrência, mas **não gera nenhuma ação de tratativa automática**.

### Solução Proposta

Implementar um **Módulo de Ações Corretivas** que:

- ✅ Cria automaticamente planos de ação para NCs
- ✅ Atribui responsáveis e define prazos
- ✅ Envia notificações para os envolvidos
- ✅ Acompanha o status de resolução
- ✅ Valida evidências de correção
- ✅ Gera relatórios e métricas de efetividade

---

## 🎯 Objetivos e Benefícios

### Objetivos Específicos

1. **Rastreabilidade Completa** - Todas as NCs devem ter tratativa registrada
2. **Automatização** - Reduzir trabalho manual de criação de planos de ação
3. **Accountability** - Responsáveis claramente definidos com prazos
4. **Visibilidade** - Gestores podem acompanhar NCs em tempo real
5. **Compliance** - Atender requisitos de ISO 14001, auditorias e legislação

### Benefícios Esperados

| Benefício | Antes | Depois | Melhoria |
|-----------|-------|--------|----------|
| Tempo para criar plano de ação | 15-30 min (manual) | < 1 min (automático) | 🚀 95% |
| NCs sem tratativa | ~30% perdidas | 0% | ✅ 100% |
| Tempo médio de resolução | Desconhecido | Rastreado com métricas | 📊 +Insight |
| Notificações de NCs críticas | Manual (WhatsApp/email) | Automático | ⚡ Imediato |
| Conformidade com ISO 14001 | Parcial | Completa | ✅ Auditável |

---

## 📅 Fases do Projeto

### Fase 1: Fundação (Sprint 1-2) - 2 semanas

**Objetivo:** Criar estrutura básica de dados e APIs

### Fase 2: Interface Básica (Sprint 3-4) - 2 semanas

**Objetivo:** Desenvolver componentes de criação e visualização

### Fase 3: Automação (Sprint 5-6) - 2 semanas

**Objetivo:** Implementar criação automática e notificações

### Fase 4: Workflow Completo (Sprint 7-8) - 2 semanas

**Objetivo:** Adicionar validação, evidências e fechamento

### Fase 5: Melhorias e Integrações (Sprint 9-10) - 2 semanas

**Objetivo:** Dashboard, relatórios e integrações

**📊 Duração Total: 10 semanas (2,5 meses)*

---

## 🗄️ FASE 1: Fundação - Banco de Dados e APIs

### 1.1 Criar Tabelas no Banco de Dados

#### Tabela: `acoes_corretivas`

```sql
CREATE TABLE acoes_corretivas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vinculação
  lv_id uuid NOT NULL REFERENCES lvs(id) ON DELETE CASCADE,
  avaliacao_id uuid NOT NULL REFERENCES lv_avaliacoes(id) ON DELETE CASCADE,

  -- Identificação da NC
  tipo_lv text NOT NULL,
  item_codigo text NOT NULL,
  item_pergunta text NOT NULL,
  descricao_nc text NOT NULL, -- Cópia da observação original

  -- Classificação
  criticidade text CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  categoria text, -- 'residuos', 'efluentes', 'emissoes', etc.

  -- Ação Corretiva
  acao_proposta text NOT NULL,
  acao_descricao text,

  -- Responsabilidade
  responsavel_id uuid REFERENCES usuarios(id),
  responsavel_nome text, -- Denormalizado para histórico
  area_responsavel text,

  -- Prazos
  prazo_inicial date NOT NULL,
  prazo_atual date NOT NULL,
  data_abertura timestamp DEFAULT NOW(),
  data_conclusao timestamp,

  -- Status
  status text NOT NULL DEFAULT 'aberta'
    CHECK (status IN ('aberta', 'em_andamento', 'aguardando_validacao', 'concluida', 'cancelada')),

  -- Evidências de Correção
  evidencias_correcao jsonb DEFAULT '[]'::jsonb, -- Array de URLs de fotos
  observacoes_conclusao text,

  -- Validação
  validada_por uuid REFERENCES usuarios(id),
  validada_em timestamp,
  validacao_observacoes text,

  -- Auditoria
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  created_by uuid REFERENCES usuarios(id),
  updated_by uuid REFERENCES usuarios(id),

  -- Índices
  CONSTRAINT prazo_atual_maior_igual_inicial CHECK (prazo_atual >= prazo_inicial)
);

-- Índices para performance
CREATE INDEX idx_acoes_lv_id ON acoes_corretivas(lv_id);
CREATE INDEX idx_acoes_responsavel ON acoes_corretivas(responsavel_id);
CREATE INDEX idx_acoes_status ON acoes_corretivas(status);
CREATE INDEX idx_acoes_prazo ON acoes_corretivas(prazo_atual);
CREATE INDEX idx_acoes_criticidade ON acoes_corretivas(criticidade);

-- Trigger para atualizar updated_at
CREATE TRIGGER atualizar_acoes_corretivas_updated_at
  BEFORE UPDATE ON acoes_corretivas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();
```

#### Tabela: `historico_acoes_corretivas`

```sql
CREATE TABLE historico_acoes_corretivas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id uuid NOT NULL REFERENCES acoes_corretivas(id) ON DELETE CASCADE,

  -- Evento
  tipo_evento text NOT NULL
    CHECK (tipo_evento IN (
      'criada', 'atribuida', 'iniciada', 'atualizada',
      'prazo_alterado', 'evidencia_adicionada', 'validada',
      'concluida', 'cancelada', 'reaberta'
    )),

  -- Dados do evento
  descricao text NOT NULL,
  dados_anteriores jsonb,
  dados_novos jsonb,

  -- Autor
  usuario_id uuid REFERENCES usuarios(id),
  usuario_nome text,

  -- Timestamp
  created_at timestamp DEFAULT NOW()
);

CREATE INDEX idx_historico_acao_id ON historico_acoes_corretivas(acao_id);
CREATE INDEX idx_historico_created_at ON historico_acoes_corretivas(created_at);
```

#### Tabela: `regras_criticidade_nc`

```sql
CREATE TABLE regras_criticidade_nc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Critérios
  tipo_lv text,
  categoria_lv text,
  item_codigo text,
  palavra_chave text, -- Na pergunta ou observação

  -- Classificação
  criticidade text NOT NULL CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  requer_acao_imediata boolean DEFAULT false,
  prazo_padrao_dias integer,

  -- Ação sugerida
  acao_sugerida text,
  categoria_sugerida text,

  -- Status
  ativo boolean DEFAULT true,
  prioridade integer DEFAULT 0, -- Ordem de avaliação

  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

CREATE INDEX idx_regras_tipo_lv ON regras_criticidade_nc(tipo_lv);
CREATE INDEX idx_regras_ativo ON regras_criticidade_nc(ativo);
```

#### Tabela: `notificacoes_acoes`

```sql
CREATE TABLE notificacoes_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  acao_id uuid NOT NULL REFERENCES acoes_corretivas(id) ON DELETE CASCADE,

  -- Destinatário
  usuario_id uuid NOT NULL REFERENCES usuarios(id),

  -- Tipo de notificação
  tipo text NOT NULL CHECK (tipo IN (
    'nova_acao', 'acao_atribuida', 'prazo_proximo',
    'prazo_vencido', 'validacao_solicitada', 'acao_validada',
    'acao_rejeitada', 'comentario_adicionado'
  )),

  -- Conteúdo
  titulo text NOT NULL,
  mensagem text NOT NULL,

  -- Status
  lida boolean DEFAULT false,
  lida_em timestamp,

  -- Canal
  enviada_email boolean DEFAULT false,
  enviada_whatsapp boolean DEFAULT false,

  created_at timestamp DEFAULT NOW()
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes_acoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes_acoes(lida);
CREATE INDEX idx_notificacoes_acao ON notificacoes_acoes(acao_id);
```

### 1.2 Políticas RLS (Row Level Security)

```sql
-- Políticas para acoes_corretivas

-- Todos usuários autenticados podem ver ações
CREATE POLICY "Usuários podem ver ações corretivas"
  ON acoes_corretivas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND ativo = true
    )
  );

-- Admins e supervisores podem criar
CREATE POLICY "Admins/Supervisores podem criar ações"
  ON acoes_corretivas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome IN ('ADM', 'SUP')
      AND u.ativo = true
    )
  );

-- Admins, supervisores e responsável podem atualizar
CREATE POLICY "Admins/Supervisores/Responsável podem atualizar"
  ON acoes_corretivas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND (
        p.nome IN ('ADM', 'SUP')
        OR u.id = acoes_corretivas.responsavel_id
      )
      AND u.ativo = true
    )
  );

-- Apenas admins podem deletar
CREATE POLICY "Apenas admins podem deletar ações"
  ON acoes_corretivas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.auth_user_id = auth.uid()
      AND p.nome = 'ADM'
      AND u.ativo = true
    )
  );
```

### 1.3 Views Úteis

```sql
-- View para listagem com informações completas
CREATE VIEW v_acoes_corretivas_completa AS
SELECT
  ac.*,

  -- Dados do responsável
  u.nome as responsavel_nome_atual,
  u.email as responsavel_email,

  -- Dados da LV
  lv.nome_lv,
  lv.data_inspecao,
  lv.area as lv_area,

  -- Dados da avaliação
  av.observacao as nc_observacao_original,

  -- Status calculados
  CASE
    WHEN ac.status = 'concluida' THEN 'concluida'
    WHEN ac.prazo_atual < CURRENT_DATE THEN 'atrasada'
    WHEN ac.prazo_atual <= CURRENT_DATE + INTERVAL '3 days' THEN 'proxima_vencer'
    ELSE 'no_prazo'
  END as status_prazo,

  -- Dias até o prazo (negativo = atrasado)
  ac.prazo_atual - CURRENT_DATE as dias_ate_prazo,

  -- Contagem de evidências
  jsonb_array_length(ac.evidencias_correcao) as qtd_evidencias

FROM acoes_corretivas ac
LEFT JOIN usuarios u ON ac.responsavel_id = u.id
LEFT JOIN lvs lv ON ac.lv_id = lv.id
LEFT JOIN lv_avaliacoes av ON ac.avaliacao_id = av.id;

-- View para dashboard/estatísticas
CREATE VIEW v_estatisticas_acoes AS
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'aberta') as abertas,
  COUNT(*) FILTER (WHERE status = 'em_andamento') as em_andamento,
  COUNT(*) FILTER (WHERE status = 'aguardando_validacao') as aguardando_validacao,
  COUNT(*) FILTER (WHERE status = 'concluida') as concluidas,
  COUNT(*) FILTER (WHERE status = 'cancelada') as canceladas,

  COUNT(*) FILTER (WHERE criticidade = 'critica') as criticas,
  COUNT(*) FILTER (WHERE criticidade = 'alta') as altas,

  COUNT(*) FILTER (
    WHERE status NOT IN ('concluida', 'cancelada')
    AND prazo_atual < CURRENT_DATE
  ) as atrasadas,

  COUNT(*) FILTER (
    WHERE status NOT IN ('concluida', 'cancelada')
    AND prazo_atual <= CURRENT_DATE + INTERVAL '3 days'
  ) as proximas_vencer,

  -- Tempo médio de resolução (em dias)
  AVG(
    EXTRACT(EPOCH FROM (data_conclusao - data_abertura)) / 86400
  ) FILTER (WHERE status = 'concluida') as tempo_medio_resolucao_dias

FROM acoes_corretivas;
```

### 1.4 Dados Iniciais (Seeds)

```sql
-- Regras de criticidade padrão
INSERT INTO regras_criticidade_nc (tipo_lv, categoria_lv, item_codigo, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida, categoria_sugerida) VALUES

-- Resíduos Perigosos (Classe I) - CRÍTICO
('01', 'Resíduos', '05.02', 'critica', true, 1, 'Providenciar contenção adequada imediata', 'residuos_classe_i'),
('01', 'Resíduos', '05.03', 'critica', true, 1, 'Regularizar armazenamento temporário', 'residuos_classe_i'),

-- Efluentes - ALTA
('01', 'Efluentes', '03.%', 'alta', true, 3, 'Corrigir sistema de tratamento', 'efluentes'),

-- Emissões atmosféricas - ALTA
('01', 'Emissões', '04.%', 'alta', true, 3, 'Ajustar sistema de controle', 'emissoes'),

-- Documentação - MÉDIA
('01', 'Documentação', '01.%', 'media', false, 7, 'Atualizar documentação', 'documentacao'),
('01', 'Licenças', '02.%', 'alta', true, 5, 'Regularizar licença', 'licencas'),

-- EPI/Segurança - ALTA
('01', NULL, NULL, 'alta', true, 2, 'Providenciar EPIs adequados', 'seguranca');

-- Palavra-chave: "vazamento" sempre crítico
INSERT INTO regras_criticidade_nc (palavra_chave, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida)
VALUES ('vazamento', 'critica', true, 1, 'Conter vazamento e avaliar impacto');

-- Palavra-chave: "vencid" (vencido/vencida) sempre alta
INSERT INTO regras_criticidade_nc (palavra_chave, criticidade, requer_acao_imediata, prazo_padrao_dias, acao_sugerida)
VALUES ('vencid', 'alta', true, 3, 'Renovar/atualizar item vencido');
```

### 1.5 Backend - API Endpoints

Criar arquivo: `backend/src/routes/acoesCorretivas.ts`

```typescript
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// Middleware de autenticação (já existe no projeto)
import { verificarAutenticacao } from '../middleware/auth';

// ============================================
// GET /api/acoes-corretivas
// Lista todas as ações corretivas com filtros
// ============================================
router.get('/', verificarAutenticacao, async (req: Request, res: Response) => {
  try {
    const {
      status,
      responsavel_id,
      criticidade,
      prazo_de,
      prazo_ate,
      lv_id,
      limite = 50,
      offset = 0
    } = req.query;

    let query = supabaseAdmin
      .from('v_acoes_corretivas_completa')
      .select('*', { count: 'exact' });

    // Filtros
    if (status) query = query.eq('status', status);
    if (responsavel_id) query = query.eq('responsavel_id', responsavel_id);
    if (criticidade) query = query.eq('criticidade', criticidade);
    if (lv_id) query = query.eq('lv_id', lv_id);
    if (prazo_de) query = query.gte('prazo_atual', prazo_de);
    if (prazo_ate) query = query.lte('prazo_atual', prazo_ate);

    // Ordenação
    query = query.order('prazo_atual', { ascending: true });
    query = query.order('criticidade', { ascending: false });

    // Paginação
    query = query.range(Number(offset), Number(offset) + Number(limite) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      acoes: data,
      total: count,
      limite: Number(limite),
      offset: Number(offset)
    });

  } catch (error: any) {
    console.error('Erro ao listar ações corretivas:', error);
    res.status(500).json({
      error: 'Erro ao listar ações corretivas',
      details: error.message
    });
  }
});

// ============================================
// GET /api/acoes-corretivas/:id
// Busca uma ação específica com histórico
// ============================================
router.get('/:id', verificarAutenticacao, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar ação
    const { data: acao, error: erroAcao } = await supabaseAdmin
      .from('v_acoes_corretivas_completa')
      .select('*')
      .eq('id', id)
      .single();

    if (erroAcao) throw erroAcao;
    if (!acao) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Buscar histórico
    const { data: historico, error: erroHistorico } = await supabaseAdmin
      .from('historico_acoes_corretivas')
      .select('*')
      .eq('acao_id', id)
      .order('created_at', { ascending: false });

    if (erroHistorico) throw erroHistorico;

    res.json({
      acao,
      historico
    });

  } catch (error: any) {
    console.error('Erro ao buscar ação:', error);
    res.status(500).json({
      error: 'Erro ao buscar ação',
      details: error.message
    });
  }
});

// ============================================
// POST /api/acoes-corretivas
// Cria nova ação corretiva
// ============================================
router.post('/', verificarAutenticacao, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const {
      lv_id,
      avaliacao_id,
      tipo_lv,
      item_codigo,
      item_pergunta,
      descricao_nc,
      criticidade,
      categoria,
      acao_proposta,
      acao_descricao,
      responsavel_id,
      area_responsavel,
      prazo_dias
    } = req.body;

    // Validações
    if (!lv_id || !avaliacao_id || !descricao_nc || !acao_proposta) {
      return res.status(400).json({
        error: 'Campos obrigatórios: lv_id, avaliacao_id, descricao_nc, acao_proposta'
      });
    }

    // Calcular prazo
    const prazoInicial = new Date();
    prazoInicial.setDate(prazoInicial.getDate() + (prazo_dias || 7));

    // Buscar nome do responsável
    let responsavelNome = null;
    if (responsavel_id) {
      const { data: usuario } = await supabaseAdmin
        .from('usuarios')
        .select('nome')
        .eq('id', responsavel_id)
        .single();
      responsavelNome = usuario?.nome;
    }

    // Criar ação
    const { data: acao, error: erroAcao } = await supabaseAdmin
      .from('acoes_corretivas')
      .insert({
        lv_id,
        avaliacao_id,
        tipo_lv,
        item_codigo,
        item_pergunta,
        descricao_nc,
        criticidade: criticidade || 'media',
        categoria,
        acao_proposta,
        acao_descricao,
        responsavel_id,
        responsavel_nome: responsavelNome,
        area_responsavel,
        prazo_inicial: prazoInicial.toISOString().split('T')[0],
        prazo_atual: prazoInicial.toISOString().split('T')[0],
        status: 'aberta',
        created_by: usuarioId
      })
      .select()
      .single();

    if (erroAcao) throw erroAcao;

    // Registrar no histórico
    await supabaseAdmin
      .from('historico_acoes_corretivas')
      .insert({
        acao_id: acao.id,
        tipo_evento: 'criada',
        descricao: 'Ação corretiva criada',
        usuario_id: usuarioId
      });

    // TODO: Enviar notificação (Fase 3)

    res.status(201).json(acao);

  } catch (error: any) {
    console.error('Erro ao criar ação corretiva:', error);
    res.status(500).json({
      error: 'Erro ao criar ação corretiva',
      details: error.message
    });
  }
});

// ============================================
// PATCH /api/acoes-corretivas/:id/status
// Atualiza status da ação
// ============================================
router.patch('/:id/status', verificarAutenticacao, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).usuario.id;
    const { status, observacoes } = req.body;

    const statusValidos = ['aberta', 'em_andamento', 'aguardando_validacao', 'concluida', 'cancelada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Buscar ação atual
    const { data: acaoAtual, error: erroGet } = await supabaseAdmin
      .from('acoes_corretivas')
      .select('*')
      .eq('id', id)
      .single();

    if (erroGet) throw erroGet;
    if (!acaoAtual) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Atualizar
    const updates: any = {
      status,
      updated_by: usuarioId,
      updated_at: new Date().toISOString()
    };

    if (status === 'concluida') {
      updates.data_conclusao = new Date().toISOString();
      if (observacoes) {
        updates.observacoes_conclusao = observacoes;
      }
    }

    const { data: acaoAtualizada, error: erroUpdate } = await supabaseAdmin
      .from('acoes_corretivas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (erroUpdate) throw erroUpdate;

    // Registrar no histórico
    await supabaseAdmin
      .from('historico_acoes_corretivas')
      .insert({
        acao_id: id,
        tipo_evento: status === 'concluida' ? 'concluida' : 'atualizada',
        descricao: `Status alterado de "${acaoAtual.status}" para "${status}"`,
        dados_anteriores: { status: acaoAtual.status },
        dados_novos: { status },
        usuario_id: usuarioId
      });

    res.json(acaoAtualizada);

  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: 'Erro ao atualizar status',
      details: error.message
    });
  }
});

// ============================================
// POST /api/acoes-corretivas/:id/evidencias
// Adiciona evidência de correção
// ============================================
router.post('/:id/evidencias', verificarAutenticacao, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).usuario.id;
    const { url_foto, descricao } = req.body;

    if (!url_foto) {
      return res.status(400).json({ error: 'URL da foto é obrigatória' });
    }

    // Buscar ação atual
    const { data: acao, error: erroGet } = await supabaseAdmin
      .from('acoes_corretivas')
      .select('evidencias_correcao')
      .eq('id', id)
      .single();

    if (erroGet) throw erroGet;

    // Adicionar nova evidência
    const evidencias = acao.evidencias_correcao || [];
    evidencias.push({
      url: url_foto,
      descricao: descricao || '',
      data: new Date().toISOString(),
      usuario_id: usuarioId
    });

    // Atualizar
    const { data: acaoAtualizada, error: erroUpdate } = await supabaseAdmin
      .from('acoes_corretivas')
      .update({
        evidencias_correcao: evidencias,
        updated_by: usuarioId
      })
      .eq('id', id)
      .select()
      .single();

    if (erroUpdate) throw erroUpdate;

    // Registrar no histórico
    await supabaseAdmin
      .from('historico_acoes_corretivas')
      .insert({
        acao_id: id,
        tipo_evento: 'evidencia_adicionada',
        descricao: 'Evidência de correção adicionada',
        usuario_id: usuarioId
      });

    res.json(acaoAtualizada);

  } catch (error: any) {
    console.error('Erro ao adicionar evidência:', error);
    res.status(500).json({
      error: 'Erro ao adicionar evidência',
      details: error.message
    });
  }
});

// ============================================
// GET /api/acoes-corretivas/estatisticas
// Retorna estatísticas agregadas
// ============================================
router.get('/estatisticas/geral', verificarAutenticacao, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('v_estatisticas_acoes')
      .select('*')
      .single();

    if (error) throw error;

    res.json(data);

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      details: error.message
    });
  }
});

export default router;
```

Registrar no `backend/src/index.ts`:

```typescript
import acoesCorretivasRouter from './routes/acoesCorretivas';

// ...

app.use('/api/acoes-corretivas', acoesCorretivasRouter);
```

### 1.6 Frontend - API Client

Criar arquivo: `frontend/src/lib/acoesCorretivasAPI.ts`

```typescript
import { supabase } from './supabase';

export interface AcaoCorretiva {
  id: string;
  lv_id: string;
  avaliacao_id: string;
  tipo_lv: string;
  item_codigo: string;
  item_pergunta: string;
  descricao_nc: string;
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  categoria?: string;
  acao_proposta: string;
  acao_descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  area_responsavel?: string;
  prazo_inicial: string;
  prazo_atual: string;
  data_abertura: string;
  data_conclusao?: string;
  status: 'aberta' | 'em_andamento' | 'aguardando_validacao' | 'concluida' | 'cancelada';
  evidencias_correcao: Array<{
    url: string;
    descricao: string;
    data: string;
    usuario_id: string;
  }>;
  observacoes_conclusao?: string;
  validada_por?: string;
  validada_em?: string;
  validacao_observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface AcaoCorretivaCompleta extends AcaoCorretiva {
  responsavel_nome_atual?: string;
  responsavel_email?: string;
  nome_lv?: string;
  data_inspecao?: string;
  lv_area?: string;
  nc_observacao_original?: string;
  status_prazo: 'concluida' | 'atrasada' | 'proxima_vencer' | 'no_prazo';
  dias_ate_prazo: number;
  qtd_evidencias: number;
}

export interface HistoricoAcao {
  id: string;
  acao_id: string;
  tipo_evento: string;
  descricao: string;
  dados_anteriores?: any;
  dados_novos?: any;
  usuario_id?: string;
  usuario_nome?: string;
  created_at: string;
}

export interface FiltrosAcoes {
  status?: string;
  responsavel_id?: string;
  criticidade?: string;
  prazo_de?: string;
  prazo_ate?: string;
  lv_id?: string;
  limite?: number;
  offset?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================
// Listar ações corretivas
// ============================================
export async function listarAcoesCorretivas(
  filtros?: FiltrosAcoes
): Promise<{
  acoes: AcaoCorretivaCompleta[];
  total: number;
  limite: number;
  offset: number;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${API_URL}/api/acoes-corretivas?${params}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao listar ações corretivas');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao listar ações:', error);
    throw error;
  }
}

// ============================================
// Buscar ação específica
// ============================================
export async function buscarAcaoCorretiva(
  id: string
): Promise<{
  acao: AcaoCorretivaCompleta;
  historico: HistoricoAcao[];
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await fetch(`${API_URL}/api/acoes-corretivas/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar ação corretiva');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar ação:', error);
    throw error;
  }
}

// ============================================
// Criar ação corretiva
// ============================================
export async function criarAcaoCorretiva(
  acao: Partial<AcaoCorretiva> & {
    prazo_dias?: number;
  }
): Promise<AcaoCorretiva> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await fetch(`${API_URL}/api/acoes-corretivas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(acao)
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || 'Erro ao criar ação corretiva');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar ação:', error);
    throw error;
  }
}

// ============================================
// Atualizar status
// ============================================
export async function atualizarStatusAcao(
  id: string,
  status: AcaoCorretiva['status'],
  observacoes?: string
): Promise<AcaoCorretiva> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await fetch(`${API_URL}/api/acoes-corretivas/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, observacoes })
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || 'Erro ao atualizar status');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

// ============================================
// Adicionar evidência
// ============================================
export async function adicionarEvidencia(
  id: string,
  urlFoto: string,
  descricao?: string
): Promise<AcaoCorretiva> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await fetch(`${API_URL}/api/acoes-corretivas/${id}/evidencias`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url_foto: urlFoto, descricao })
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || 'Erro ao adicionar evidência');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao adicionar evidência:', error);
    throw error;
  }
}

// ============================================
// Buscar estatísticas
// ============================================
export async function buscarEstatisticasAcoes(): Promise<{
  total: number;
  abertas: number;
  em_andamento: number;
  aguardando_validacao: number;
  concluidas: number;
  canceladas: number;
  criticas: number;
  altas: number;
  atrasadas: number;
  proximas_vencer: number;
  tempo_medio_resolucao_dias: number;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autenticado');

    const response = await fetch(`${API_URL}/api/acoes-corretivas/estatisticas/geral`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
}
```

### 1.7 TypeScript Types

Adicionar em `frontend/src/types/acoes.ts`:

```typescript
export interface AcaoCorretiva {
  id: string;
  lv_id: string;
  avaliacao_id: string;
  tipo_lv: string;
  item_codigo: string;
  item_pergunta: string;
  descricao_nc: string;
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  categoria?: string;
  acao_proposta: string;
  acao_descricao?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  area_responsavel?: string;
  prazo_inicial: string;
  prazo_atual: string;
  data_abertura: string;
  data_conclusao?: string;
  status: 'aberta' | 'em_andamento' | 'aguardando_validacao' | 'concluida' | 'cancelada';
  evidencias_correcao: Evidencia[];
  observacoes_conclusao?: string;
  validada_por?: string;
  validada_em?: string;
  validacao_observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Evidencia {
  url: string;
  descricao: string;
  data: string;
  usuario_id: string;
}

export interface AcaoCorretivaCompleta extends AcaoCorretiva {
  responsavel_nome_atual?: string;
  responsavel_email?: string;
  nome_lv?: string;
  data_inspecao?: string;
  lv_area?: string;
  nc_observacao_original?: string;
  status_prazo: 'concluida' | 'atrasada' | 'proxima_vencer' | 'no_prazo';
  dias_ate_prazo: number;
  qtd_evidencias: number;
}

export interface HistoricoAcao {
  id: string;
  acao_id: string;
  tipo_evento: TipoEventoAcao;
  descricao: string;
  dados_anteriores?: any;
  dados_novos?: any;
  usuario_id?: string;
  usuario_nome?: string;
  created_at: string;
}

export type TipoEventoAcao =
  | 'criada'
  | 'atribuida'
  | 'iniciada'
  | 'atualizada'
  | 'prazo_alterado'
  | 'evidencia_adicionada'
  | 'validada'
  | 'concluida'
  | 'cancelada'
  | 'reaberta';

export type StatusAcao = 'aberta' | 'em_andamento' | 'aguardando_validacao' | 'concluida' | 'cancelada';
export type Criticidade = 'baixa' | 'media' | 'alta' | 'critica';
export type StatusPrazo = 'concluida' | 'atrasada' | 'proxima_vencer' | 'no_prazo';
```

---

## ✅ Checklist Fase 1 (Fundação)

- [ ] Executar SQL: criar tabela `acoes_corretivas`
- [ ] Executar SQL: criar tabela `historico_acoes_corretivas`
- [ ] Executar SQL: criar tabela `regras_criticidade_nc`
- [ ] Executar SQL: criar tabela `notificacoes_acoes`
- [ ] Executar SQL: criar políticas RLS
- [ ] Executar SQL: criar views `v_acoes_corretivas_completa` e `v_estatisticas_acoes`
- [ ] Executar SQL: inserir dados iniciais (regras de criticidade)
- [ ] Criar arquivo `backend/src/routes/acoesCorretivas.ts`
- [ ] Registrar rotas no `backend/src/index.ts`
- [ ] Criar arquivo `frontend/src/lib/acoesCorretivasAPI.ts`
- [ ] Criar arquivo `frontend/src/types/acoes.ts`
- [ ] Testar endpoints básicos com Postman/Insomnia
- [ ] Verificar permissões RLS funcionando

**Estimativa:** 3-5 dias de desenvolvimento

---

## 🎨 FASE 2: Interface Básica

### 2.1 Componente: Lista de Ações Corretivas

Criar: `frontend/src/components/acoes/ListaAcoesCorretivas.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { listarAcoesCorretivas, AcaoCorretivaCompleta } from '../../lib/acoesCorretivasAPI';

const ListaAcoesCorretivas: React.FC = () => {
  const [acoes, setAcoes] = useState<AcaoCorretivaCompleta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    status: '',
    criticidade: ''
  });

  useEffect(() => {
    carregarAcoes();
  }, [filtros]);

  async function carregarAcoes() {
    try {
      setCarregando(true);
      const resultado = await listarAcoesCorretivas(filtros);
      setAcoes(resultado.acoes);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
    } finally {
      setCarregando(false);
    }
  }

  function getBadgeCriticidade(criticidade: string) {
    const cores = {
      baixa: 'bg-gray-100 text-gray-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    };
    return cores[criticidade as keyof typeof cores] || cores.media;
  }

  function getBadgeStatus(status: string) {
    const config = {
      aberta: { cor: 'bg-blue-100 text-blue-800', icone: <AlertCircle className="w-4 h-4" /> },
      em_andamento: { cor: 'bg-purple-100 text-purple-800', icone: <Clock className="w-4 h-4" /> },
      aguardando_validacao: { cor: 'bg-yellow-100 text-yellow-800', icone: <Clock className="w-4 h-4" /> },
      concluida: { cor: 'bg-green-100 text-green-800', icone: <CheckCircle className="w-4 h-4" /> },
      cancelada: { cor: 'bg-gray-100 text-gray-800', icone: <XCircle className="w-4 h-4" /> }
    };
    return config[status as keyof typeof config] || config.aberta;
  }

  function getBadgePrazo(status_prazo: string, dias: number) {
    if (status_prazo === 'concluida') {
      return { cor: 'bg-green-100 text-green-800', texto: 'Concluída' };
    }
    if (status_prazo === 'atrasada') {
      return { cor: 'bg-red-100 text-red-800', texto: `${Math.abs(dias)} dias atrasada` };
    }
    if (status_prazo === 'proxima_vencer') {
      return { cor: 'bg-orange-100 text-orange-800', texto: `${dias} dias restantes` };
    }
    return { cor: 'bg-blue-100 text-blue-800', texto: `${dias} dias restantes` };
  }

  if (carregando) {
    return <div className="text-center p-8">Carregando ações corretivas...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <select
          value={filtros.status}
          onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos os status</option>
          <option value="aberta">Aberta</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="aguardando_validacao">Aguardando Validação</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <select
          value={filtros.criticidade}
          onChange={(e) => setFiltros({ ...filtros, criticidade: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">Todas as criticidades</option>
          <option value="critica">Crítica</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {acoes.map((acao) => {
          const badgeStatus = getBadgeStatus(acao.status);
          const badgePrazo = getBadgePrazo(acao.status_prazo, acao.dias_ate_prazo);

          return (
            <div key={acao.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              {/* Cabeçalho */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getBadgeCriticidade(acao.criticidade)}`}>
                      {acao.criticidade.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${badgeStatus.cor}`}>
                      {badgeStatus.icone}
                      {acao.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${badgePrazo.cor}`}>
                      {badgePrazo.texto}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">
                    {acao.item_codigo} - {acao.item_pergunta}
                  </h3>
                  <p className="text-sm text-gray-600">{acao.nome_lv} - {acao.lv_area}</p>
                </div>
                <button
                  onClick={() => window.location.href = `/acoes-corretivas/${acao.id}`}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* NC */}
              <div className="bg-red-50 p-3 rounded mb-3">
                <p className="text-sm font-medium text-red-800 mb-1">Não Conformidade:</p>
                <p className="text-sm text-red-700">{acao.descricao_nc}</p>
              </div>

              {/* Ação Proposta */}
              <div className="bg-blue-50 p-3 rounded mb-3">
                <p className="text-sm font-medium text-blue-800 mb-1">Ação Proposta:</p>
                <p className="text-sm text-blue-700">{acao.acao_proposta}</p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-medium">Responsável:</span> {acao.responsavel_nome || 'Não atribuído'}
                </div>
                <div>
                  <span className="font-medium">Prazo:</span> {new Date(acao.prazo_atual).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium">Evidências:</span> {acao.qtd_evidencias}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {acoes.length === 0 && (
        <div className="text-center text-gray-500 p-8">
          Nenhuma ação corretiva encontrada.
        </div>
      )}
    </div>
  );
};

export default ListaAcoesCorretivas;
```

### 2.2 Componente: Formulário de Criação

Criar: `frontend/src/components/acoes/FormAcaoCorretiva.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { criarAcaoCorretiva } from '../../lib/acoesCorretivasAPI';
import { listarUsuarios } from '../../lib/usuariosAPI';

interface Props {
  lvId: string;
  avaliacaoId: string;
  tipoLV: string;
  itemCodigo: string;
  itemPergunta: string;
  descricaoNC: string;
  onSucesso?: () => void;
  onCancelar?: () => void;
}

const FormAcaoCorretiva: React.FC<Props> = ({
  lvId,
  avaliacaoId,
  tipoLV,
  itemCodigo,
  itemPergunta,
  descricaoNC,
  onSucesso,
  onCancelar
}) => {
  const [formulario, setFormulario] = useState({
    acao_proposta: '',
    acao_descricao: '',
    criticidade: 'media' as const,
    categoria: '',
    responsavel_id: '',
    area_responsavel: '',
    prazo_dias: 7
  });

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const usuariosData = await listarUsuarios();
      setUsuarios(usuariosData.filter((u: any) => u.ativo));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSalvando(true);

      await criarAcaoCorretiva({
        lv_id: lvId,
        avaliacao_id: avaliacaoId,
        tipo_lv: tipoLV,
        item_codigo: itemCodigo,
        item_pergunta: itemPergunta,
        descricao_nc: descricaoNC,
        ...formulario
      });

      alert('Ação corretiva criada com sucesso!');
      onSucesso?.();

    } catch (error) {
      console.error('Erro ao criar ação:', error);
      alert('Erro ao criar ação corretiva');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NC Info */}
      <div className="bg-red-50 p-4 rounded border border-red-200">
        <p className="font-medium text-red-800 mb-1">Não Conformidade:</p>
        <p className="text-sm text-red-700">{itemCodigo} - {itemPergunta}</p>
        <p className="text-sm text-red-600 mt-2">{descricaoNC}</p>
      </div>

      {/* Ação Proposta */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Ação Corretiva Proposta *
        </label>
        <input
          type="text"
          value={formulario.acao_proposta}
          onChange={(e) => setFormulario({ ...formulario, acao_proposta: e.target.value })}
          placeholder="Ex: Providenciar tampa para container"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Descrição Detalhada */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Descrição Detalhada
        </label>
        <textarea
          value={formulario.acao_descricao}
          onChange={(e) => setFormulario({ ...formulario, acao_descricao: e.target.value })}
          placeholder="Detalhes adicionais sobre a ação..."
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      {/* Criticidade */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Criticidade *
        </label>
        <select
          value={formulario.criticidade}
          onChange={(e) => setFormulario({ ...formulario, criticidade: e.target.value as any })}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
      </div>

      {/* Responsável */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Responsável pela Ação
        </label>
        <select
          value={formulario.responsavel_id}
          onChange={(e) => setFormulario({ ...formulario, responsavel_id: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Selecione...</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              {usuario.nome} - {usuario.email}
            </option>
          ))}
        </select>
      </div>

      {/* Prazo */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Prazo (dias) *
        </label>
        <input
          type="number"
          value={formulario.prazo_dias}
          onChange={(e) => setFormulario({ ...formulario, prazo_dias: parseInt(e.target.value) })}
          min="1"
          className="w-full border rounded px-3 py-2"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Data final: {new Date(Date.now() + formulario.prazo_dias * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {salvando ? 'Salvando...' : 'Criar Ação Corretiva'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default FormAcaoCorretiva;
```

### 2.3 Integração com LV

Modificar: `frontend/src/components/lv/LVForm.tsx`

Adicionar botão para criar ação corretiva quando marcar NC:

```typescript
// Após marcar um item como NC, mostrar botão
{avaliacao === 'NC' && (
  <button
    onClick={() => setMostrarFormAcao(itemId)}
    className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
  >
    📋 Criar Ação Corretiva
  </button>
)}

// Modal para criar ação
{mostrarFormAcao === itemId && (
  <Modal onClose={() => setMostrarFormAcao(null)}>
    <FormAcaoCorretiva
      lvId={lvId}
      avaliacaoId={avaliacaoId}
      tipoLV={tipoLV}
      itemCodigo={item.codigo}
      itemPergunta={item.pergunta}
      descricaoNC={observacao}
      onSucesso={() => {
        setMostrarFormAcao(null);
        alert('Ação criada!');
      }}
      onCancelar={() => setMostrarFormAcao(null)}
    />
  </Modal>
)}
```

### 2.4 Página de Detalhes da Ação

Criar: `frontend/src/pages/DetalhesAcaoCorretiva.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buscarAcaoCorretiva, AcaoCorretivaCompleta, HistoricoAcao } from '../lib/acoesCorretivasAPI';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';

const DetalhesAcaoCorretiva: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [acao, setAcao] = useState<AcaoCorretivaCompleta | null>(null);
  const [historico, setHistorico] = useState<HistoricoAcao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (id) carregarAcao(id);
  }, [id]);

  async function carregarAcao(acaoId: string) {
    try {
      setCarregando(true);
      const resultado = await buscarAcaoCorretiva(acaoId);
      setAcao(resultado.acao);
      setHistorico(resultado.historico);
    } catch (error) {
      console.error('Erro ao carregar ação:', error);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return <div className="text-center p-8">Carregando...</div>;
  }

  if (!acao) {
    return <div className="text-center p-8">Ação não encontrada</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Ação Corretiva</h1>
      </div>

      {/* Card principal */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{acao.item_codigo} - {acao.item_pergunta}</h2>
            <p className="text-gray-600">{acao.nome_lv} - {acao.lv_area}</p>
          </div>
          <span className={`px-3 py-1 rounded font-medium ${
            acao.criticidade === 'critica' ? 'bg-red-100 text-red-800' :
            acao.criticidade === 'alta' ? 'bg-orange-100 text-orange-800' :
            acao.criticidade === 'media' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {acao.criticidade.toUpperCase()}
          </span>
        </div>

        {/* NC */}
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="font-medium text-red-800 mb-2">Não Conformidade Detectada:</p>
          <p className="text-red-700">{acao.descricao_nc}</p>
        </div>

        {/* Ação */}
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="font-medium text-blue-800 mb-2">Ação Corretiva Proposta:</p>
          <p className="text-blue-700">{acao.acao_proposta}</p>
          {acao.acao_descricao && (
            <p className="text-sm text-blue-600 mt-2">{acao.acao_descricao}</p>
          )}
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Responsável</p>
            <p className="font-medium">{acao.responsavel_nome || 'Não atribuído'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">{acao.status.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Prazo</p>
            <p className="font-medium">{new Date(acao.prazo_atual).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dias restantes</p>
            <p className={`font-medium ${acao.dias_ate_prazo < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {acao.dias_ate_prazo} dias
            </p>
          </div>
        </div>

        {/* Evidências */}
        {acao.evidencias_correcao.length > 0 && (
          <div>
            <p className="font-medium mb-2">Evidências de Correção ({acao.qtd_evidencias})</p>
            <div className="grid grid-cols-3 gap-2">
              {acao.evidencias_correcao.map((evidencia, index) => (
                <img
                  key={index}
                  src={evidencia.url}
                  alt={`Evidência ${index + 1}`}
                  className="w-full h-32 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Histórico</h3>
        <div className="space-y-3">
          {historico.map((item) => (
            <div key={item.id} className="flex gap-3 border-l-2 border-gray-300 pl-4">
              <div className="flex-1">
                <p className="font-medium">{item.descricao}</p>
                <p className="text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                  {item.usuario_nome && ` - ${item.usuario_nome}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetalhesAcaoCorretiva;
```

### 2.5 Adicionar Rotas

Em `frontend/src/App.tsx`:

```typescript
import ListaAcoesCorretivas from './components/acoes/ListaAcoesCorretivas';
import DetalhesAcaoCorretiva from './pages/DetalhesAcaoCorretiva';

// ...

<Route path="/acoes-corretivas" element={<ListaAcoesCorretivas />} />
<Route path="/acoes-corretivas/:id" element={<DetalhesAcaoCorretiva />} />
```

---

## ✅ Checklist Fase 2 (Interface Básica)

- [ ] Criar componente `ListaAcoesCorretivas.tsx`
- [ ] Criar componente `FormAcaoCorretiva.tsx`
- [ ] Criar página `DetalhesAcaoCorretiva.tsx`
- [ ] Integrar botão no `LVForm.tsx` para criar ação ao marcar NC
- [ ] Adicionar rotas no `App.tsx`
- [ ] Adicionar link no menu de navegação
- [ ] Testar fluxo completo: LV → NC → Criar Ação → Visualizar
- [ ] Testar filtros e paginação
- [ ] Ajustar responsividade mobile

**Estimativa:** 3-5 dias de desenvolvimento

---

## 🤖 FASE 3: Automação

### 3.1 Criação Automática de Ações

Modificar: `backend/src/routes/acoesCorretivas.ts`

Adicionar função de criação automática:

```typescript
// ============================================
// POST /api/acoes-corretivas/auto-criar
// Cria automaticamente ação para uma NC
// ============================================
router.post('/auto-criar', verificarAutenticacao, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const { avaliacao_id } = req.body;

    if (!avaliacao_id) {
      return res.status(400).json({ error: 'avaliacao_id é obrigatório' });
    }

    // 1. Buscar dados da avaliação NC
    const { data: avaliacao, error: erroAval } = await supabaseAdmin
      .from('lv_avaliacoes')
      .select(`
        *,
        lvs (
          id,
          tipo_lv,
          nome_lv,
          area,
          usuario_id
        )
      `)
      .eq('id', avaliacao_id)
      .eq('avaliacao', 'NC')
      .single();

    if (erroAval) throw erroAval;
    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação NC não encontrada' });
    }

    // 2. Verificar se já existe ação para esta NC
    const { data: acaoExistente } = await supabaseAdmin
      .from('acoes_corretivas')
      .select('id')
      .eq('avaliacao_id', avaliacao_id)
      .single();

    if (acaoExistente) {
      return res.status(409).json({
        error: 'Já existe ação corretiva para esta NC',
        acao_id: acaoExistente.id
      });
    }

    // 3. Determinar criticidade e prazo baseado em regras
    const { data: regras } = await supabaseAdmin
      .from('regras_criticidade_nc')
      .select('*')
      .eq('ativo', true)
      .order('prioridade', { ascending: false });

    let criticidade = 'media';
    let prazoDias = 7;
    let acaoSugerida = 'Corrigir não conformidade detectada';
    let categoria = '';

    // Aplicar regras na ordem de prioridade
    for (const regra of regras || []) {
      let match = false;

      // Verificar tipo de LV
      if (regra.tipo_lv && regra.tipo_lv === avaliacao.tipo_lv) {
        match = true;
      }

      // Verificar código do item
      if (regra.item_codigo) {
        if (regra.item_codigo.includes('%')) {
          // Wildcard
          const pattern = regra.item_codigo.replace(/%/g, '.*');
          if (new RegExp(pattern).test(avaliacao.item_codigo)) {
            match = true;
          }
        } else if (regra.item_codigo === avaliacao.item_codigo) {
          match = true;
        }
      }

      // Verificar palavra-chave
      if (regra.palavra_chave) {
        const textoCompleto = `${avaliacao.item_pergunta} ${avaliacao.observacao || ''}`.toLowerCase();
        if (textoCompleto.includes(regra.palavra_chave.toLowerCase())) {
          match = true;
        }
      }

      // Se encontrou match, aplicar regra
      if (match) {
        criticidade = regra.criticidade;
        prazoDias = regra.prazo_padrao_dias || prazoDias;
        acaoSugerida = regra.acao_sugerida || acaoSugerida;
        categoria = regra.categoria_sugerida || categoria;
        break; // Primeira regra que der match
      }
    }

    // 4. Determinar responsável (técnico que fez a LV ou gestor da área)
    const responsavelId = avaliacao.lvs.usuario_id;

    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('nome')
      .eq('id', responsavelId)
      .single();

    // 5. Calcular prazo
    const prazoInicial = new Date();
    prazoInicial.setDate(prazoInicial.getDate() + prazoDias);

    // 6. Criar ação automática
    const { data: acao, error: erroAcao } = await supabaseAdmin
      .from('acoes_corretivas')
      .insert({
        lv_id: avaliacao.lv_id,
        avaliacao_id: avaliacao.id,
        tipo_lv: avaliacao.tipo_lv,
        item_codigo: avaliacao.item_codigo,
        item_pergunta: avaliacao.item_pergunta,
        descricao_nc: avaliacao.observacao || 'Não conformidade detectada',
        criticidade,
        categoria,
        acao_proposta: acaoSugerida,
        responsavel_id: responsavelId,
        responsavel_nome: usuario?.nome,
        area_responsavel: avaliacao.lvs.area,
        prazo_inicial: prazoInicial.toISOString().split('T')[0],
        prazo_atual: prazoInicial.toISOString().split('T')[0],
        status: 'aberta',
        created_by: usuarioId
      })
      .select()
      .single();

    if (erroAcao) throw erroAcao;

    // 7. Registrar no histórico
    await supabaseAdmin
      .from('historico_acoes_corretivas')
      .insert({
        acao_id: acao.id,
        tipo_evento: 'criada',
        descricao: '✅ Ação corretiva criada automaticamente',
        usuario_id: usuarioId
      });

    // 8. Criar notificação (TODO: enviar email/push)
    await supabaseAdmin
      .from('notificacoes_acoes')
      .insert({
        acao_id: acao.id,
        usuario_id: responsavelId,
        tipo: 'acao_atribuida',
        titulo: `Nova Ação Corretiva: ${criticidade.toUpperCase()}`,
        mensagem: `Você foi atribuído como responsável pela ação corretiva: ${acaoSugerida}`
      });

    res.status(201).json({
      acao,
      auto_criada: true,
      regra_aplicada: {
        criticidade,
        prazo_dias: prazoDias,
        categoria
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar ação automaticamente:', error);
    res.status(500).json({
      error: 'Erro ao criar ação automaticamente',
      details: error.message
    });
  }
});
```

### 3.2 Trigger no Banco de Dados

Criar trigger que cria ação automaticamente quando NC é registrada:

```sql
-- Função que cria ação corretiva automática
CREATE OR REPLACE FUNCTION criar_acao_automatica_para_nc()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas para NCs
  IF NEW.avaliacao = 'NC' THEN
    -- Chamar API interna ou inserir diretamente
    -- (Implementação via backend é preferível para lógica complexa)

    -- Registrar evento para processamento assíncrono
    INSERT INTO eventos_pendentes (tipo, dados)
    VALUES ('criar_acao_nc', jsonb_build_object(
      'avaliacao_id', NEW.id,
      'lv_id', NEW.lv_id,
      'tipo_lv', NEW.tipo_lv,
      'item_codigo', NEW.item_codigo
    ));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_nc_criar_acao
  AFTER INSERT ON lv_avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION criar_acao_automatica_para_nc();
```

### 3.3 Sistema de Notificações

Criar: `backend/src/services/notificacoes.ts`

```typescript
import { supabaseAdmin } from '../lib/supabase';

interface NotificacaoConfig {
  usuario_id: string;
  acao_id: string;
  tipo: 'nova_acao' | 'acao_atribuida' | 'prazo_proximo' | 'prazo_vencido' | 'validacao_solicitada' | 'acao_validada' | 'acao_rejeitada' | 'comentario_adicionado';
  titulo: string;
  mensagem: string;
}

export async function enviarNotificacao(config: NotificacaoConfig) {
  try {
    // 1. Salvar no banco
    await supabaseAdmin
      .from('notificacoes_acoes')
      .insert({
        ...config,
        lida: false
      });

    // 2. Buscar preferências do usuário
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('email, telefone, notificacoes_email, notificacoes_push')
      .eq('id', config.usuario_id)
      .single();

    if (!usuario) return;

    // 3. Enviar email (se habilitado)
    if (usuario.notificacoes_email && usuario.email) {
      await enviarEmail({
        para: usuario.email,
        assunto: config.titulo,
        corpo: config.mensagem
      });
    }

    // 4. Enviar notificação push (se habilitado)
    if (usuario.notificacoes_push) {
      await enviarPush({
        usuario_id: config.usuario_id,
        titulo: config.titulo,
        mensagem: config.mensagem
      });
    }

    // 5. WhatsApp (opcional, via Twilio/etc)
    // await enviarWhatsApp(...)

  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    // Não lançar erro para não quebrar fluxo principal
  }
}

// Helper: Enviar email
async function enviarEmail(config: { para: string; assunto: string; corpo: string }) {
  // TODO: Implementar com SendGrid, AWS SES, ou Supabase Edge Functions
  console.log('📧 Email enviado para:', config.para);
  console.log('Assunto:', config.assunto);
}

// Helper: Enviar push notification
async function enviarPush(config: { usuario_id: string; titulo: string; mensagem: string }) {
  // TODO: Implementar com FCM (Firebase Cloud Messaging)
  console.log('🔔 Push enviado para:', config.usuario_id);
}

// Job: Verificar prazos e enviar lembretes
export async function verificarPrazosENotificar() {
  try {
    // Ações próximas do prazo (3 dias)
    const { data: proximasVencer } = await supabaseAdmin
      .from('acoes_corretivas')
      .select('id, responsavel_id, acao_proposta, prazo_atual')
      .in('status', ['aberta', 'em_andamento'])
      .gte('prazo_atual', new Date().toISOString().split('T')[0])
      .lte('prazo_atual', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    for (const acao of proximasVencer || []) {
      await enviarNotificacao({
        usuario_id: acao.responsavel_id,
        acao_id: acao.id,
        tipo: 'prazo_proximo',
        titulo: '⏰ Prazo Próximo',
        mensagem: `A ação "${acao.acao_proposta}" vence em ${new Date(acao.prazo_atual).toLocaleDateString('pt-BR')}`
      });
    }

    // Ações atrasadas
    const { data: atrasadas } = await supabaseAdmin
      .from('acoes_corretivas')
      .select('id, responsavel_id, acao_proposta, prazo_atual')
      .in('status', ['aberta', 'em_andamento'])
      .lt('prazo_atual', new Date().toISOString().split('T')[0]);

    for (const acao of atrasadas || []) {
      await enviarNotificacao({
        usuario_id: acao.responsavel_id,
        acao_id: acao.id,
        tipo: 'prazo_vencido',
        titulo: '🚨 Prazo Vencido',
        mensagem: `A ação "${acao.acao_proposta}" está atrasada desde ${new Date(acao.prazo_atual).toLocaleDateString('pt-BR')}`
      });
    }

  } catch (error) {
    console.error('Erro ao verificar prazos:', error);
  }
}

// Executar a cada 6 horas
setInterval(verificarPrazosENotificar, 6 * 60 * 60 * 1000);
```

### 3.4 Frontend: Centro de Notificações

Criar: `frontend/src/components/acoes/Notificacoes.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Notificacao {
  id: string;
  acao_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

const Notificacoes: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    carregarNotificacoes();
    // Inscrever-se para atualizações em tempo real
    const subscription = supabase
      .channel('notificacoes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes_acoes'
      }, () => {
        carregarNotificacoes();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function carregarNotificacoes() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) return;

      // Buscar usuário
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', session.session?.user.id)
        .single();

      if (!usuario) return;

      // Buscar notificações
      const { data } = await supabase
        .from('notificacoes_acoes')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setNotificacoes(data || []);
      setNaoLidas(data?.filter(n => !n.lida).length || 0);

    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }

  async function marcarComoLida(id: string) {
    try {
      await supabase
        .from('notificacoes_acoes')
        .update({ lida: true, lida_em: new Date().toISOString() })
        .eq('id', id);

      carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }

  return (
    <div className="relative">
      {/* Botão */}
      <button
        onClick={() => setMostrar(!mostrar)}
        className="relative p-2 hover:bg-gray-100 rounded"
      >
        <Bell className="w-6 h-6" />
        {naoLidas > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {mostrar && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50">
          <div className="p-3 border-b">
            <h3 className="font-semibold">Notificações</h3>
          </div>

          {notificacoes.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação
            </div>
          )}

          {notificacoes.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                !notif.lida ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                marcarComoLida(notif.id);
                window.location.href = `/acoes-corretivas/${notif.acao_id}`;
              }}
            >
              <p className="font-medium text-sm">{notif.titulo}</p>
              <p className="text-xs text-gray-600 mt-1">{notif.mensagem}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notif.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notificacoes;
```

Adicionar no header: `frontend/src/components/common/Header.tsx`

```typescript
import Notificacoes from '../acoes/Notificacoes';

// ...

<Notificacoes />
```

---

## ✅ Checklist Fase 3 (Automação)

- [ ] Criar endpoint `/api/acoes-corretivas/auto-criar`
- [ ] Implementar lógica de aplicação de regras de criticidade
- [ ] Criar trigger no banco de dados (opcional)
- [ ] Implementar serviço de notificações (`notificacoes.ts`)
- [ ] Integrar envio de emails (SendGrid/AWS SES)
- [ ] Implementar job de verificação de prazos
- [ ] Criar componente de notificações no frontend
- [ ] Adicionar inscrição Realtime do Supabase
- [ ] Testar criação automática ao registrar NC
- [ ] Testar notificações em tempo real
- [ ] Configurar cron job no servidor (para verificação de prazos)

**Estimativa:** 4-6 dias de desenvolvimento

---

## 📊 FASE 4: Workflow Completo

### 4.1 Atualização de Status com Validação

Adicionar lógica de transição de estados:

```typescript
// Estado: aberta → em_andamento (responsável inicia trabalho)
// Estado: em_andamento → aguardando_validacao (responsável adiciona evidências)
// Estado: aguardando_validacao → concluida (supervisor valida)
// Estado: aguardando_validacao → em_andamento (supervisor rejeita, solicita correções)
```

### 4.2 Upload de Evidências

Integrar com sistema de fotos existente:

```typescript
// Usar bucket Supabase Storage
// Upload via FormData
// Vincular fotos à ação corretiva
```

### 4.3 Sistema de Comentários

Permitir discussões sobre ações:

```sql
CREATE TABLE comentarios_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id uuid NOT NULL REFERENCES acoes_corretivas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  comentario text NOT NULL,
  created_at timestamp DEFAULT NOW()
);
```

### 4.4 Validação de Conclusão

Supervisor valida evidências e aprova conclusão:

```typescript
// Endpoint: PATCH /api/acoes-corretivas/:id/validar
// Permite: aprovar ou rejeitar conclusão
// Notifica: responsável sobre resultado
```

---

## ✅ Checklist Fase 4 (Workflow Completo)

- [ ] Implementar máquina de estados para transições
- [ ] Criar endpoint de upload de evidências
- [ ] Criar tabela e endpoints de comentários
- [ ] Implementar validação de conclusão
- [ ] Criar interface de validação para supervisores
- [ ] Adicionar componente de comentários
- [ ] Testar workflow completo de ponta a ponta
- [ ] Adicionar logs de auditoria

**Estimativa:** 4-6 dias de desenvolvimento

---

## 📈 FASE 5: Melhorias e Integrações

### 5.1 Dashboard de Ações Corretivas

Criar: `frontend/src/pages/DashboardAcoes.tsx`

Incluir:

- Gráficos de NCs por criticidade
- Ações atrasadas
- Tempo médio de resolução
- NCs por área/categoria
- Responsáveis com mais ações

### 5.2 Relatórios Exportáveis

- PDF com histórico de ações
- Excel com lista de NCs
- Gráficos de tendências

### 5.3 Integração com Termos Ambientais

```typescript
// NC crítica pode gerar Termo de Não Conformidade automaticamente
// Vincular ação corretiva ao termo
```

### 5.4 Métricas de Efetividade

Calcular:

- Taxa de resolução no prazo
- Tempo médio por criticidade
- Reincidência de NCs
- Eficácia por responsável

### 5.5 Configurações de Regras

Interface para admins gerenciarem regras de criticidade:

```typescript
// CRUD de regras_criticidade_nc
// Testar regras antes de ativar
// Histórico de alterações de regras
```

---

## ✅ Checklist Fase 5 (Melhorias)

- [ ] Criar dashboard com gráficos (Recharts)
- [ ] Implementar exportação de relatórios
- [ ] Criar integração com termos ambientais
- [ ] Implementar cálculo de métricas
- [ ] Criar interface de configuração de regras
- [ ] Adicionar filtros avançados
- [ ] Otimizar queries com índices
- [ ] Implementar cache para dashboards

**Estimativa:** 4-6 dias de desenvolvimento

---

## 🧪 Plano de Testes

### Testes Unitários

- [ ] API endpoints (Jest + Supertest)
- [ ] Funções de validação
- [ ] Lógica de aplicação de regras
- [ ] Cálculo de prazos

### Testes de Integração

- [ ] Fluxo completo: LV → NC → Ação → Conclusão
- [ ] Sistema de notificações
- [ ] Upload de evidências
- [ ] Transições de estado

### Testes E2E

- [ ] Usuário marca NC e cria ação
- [ ] Responsável recebe notificação
- [ ] Responsável adiciona evidências
- [ ] Supervisor valida conclusão

### Testes de Performance

- [ ] Listagem com milhares de ações
- [ ] Dashboard com agregações
- [ ] Notificações em lote

---

## 📚 Documentação

### Documentos a Criar

- [ ] README do módulo
- [ ] Guia de uso para técnicos
- [ ] Guia de uso para supervisores
- [ ] Guia de configuração de regras
- [ ] API documentation (Swagger)
- [ ] Diagrama de fluxo de estados
- [ ] Diagrama de entidades (ERD)

---

## 🚀 Estratégia de Deploy

### Deploy Incremental

**Semana 1-2:** Fase 1 (Fundação)

- Deploy de tabelas no Supabase
- Deploy de APIs no backend
- Testes internos com usuários ADM

**Semana 3-4:** Fase 2 (Interface)

- Deploy de componentes frontend
- Liberação para grupo piloto de supervisores
- Coleta de feedback

**Semana 5-6:** Fase 3 (Automação)

- Ativar criação automática
- Ativar notificações
- Monitorar performance

**Semana 7-8:** Fase 4 (Workflow)

- Ativar validação de conclusão
- Treinamento de usuários
- Rollout para todos

**Semana 9-10:** Fase 5 (Melhorias)

- Ativar dashboard
- Ativar relatórios
- Otimizações finais

---

## 📊 KPIs de Sucesso

### Métricas de Adoção

- % de NCs com ação corretiva criada (meta: 100%)
- % de ações criadas automaticamente (meta: >80%)
- Tempo médio entre NC e criação de ação (meta: <1h)

### Métricas de Efetividade

- % de ações concluídas no prazo (meta: >85%)
- Tempo médio de resolução por criticidade
  - Crítica: <24h
  - Alta: <3 dias
  - Média: <7 dias
  - Baixa: <15 dias

### Métricas de Qualidade

- % de ações validadas na primeira tentativa (meta: >90%)
- Taxa de reincidência de NCs (meta: <5%)
- Satisfação dos usuários (pesquisa trimestral, meta: >4.5/5)

---

## ⚠️ Riscos e Mitigações

### Risco 1: Sobrecarga de Notificações

**Problema:** Usuários recebem muitas notificações
**Mitigação:**

- Permitir configuração de preferências
- Agrupar notificações similares
- Digest diário ao invés de notificações individuais

### Risco 2: Dados Incorretos em Criação Automática

**Problema:** Regras de criticidade/prazo inadequadas
**Mitigação:**

- Fase de testes com grupo piloto
- Permitir edição manual após criação
- Logs detalhados de qual regra foi aplicada
- Interface de teste de regras antes de ativar

### Risco 3: Performance em Grandes Volumes

**Problema:** Dashboard lento com milhares de ações
**Mitigação:**

- Índices otimizados
- Views materializadas para agregações
- Cache com Redis
- Paginação obrigatória

### Risco 4: Usuários Não Adotam Sistema

**Problema:** Preferem planilhas/processo manual
**Mitigação:**

- Treinamento adequado
- Vídeos tutoriais
- Demonstrar valor (relatórios automáticos)
- Fase piloto para ajustes

---

## 💰 Estimativa de Esforço

### Desenvolvimento

| Fase | Esforço | Prazo |
|------|---------|-------|
| Fase 1: Fundação | 30-40h | 5-8 dias |
| Fase 2: Interface | 30-40h | 5-8 dias |
| Fase 3: Automação | 40-50h | 7-10 dias |
| Fase 4: Workflow | 30-40h | 5-8 dias |
| Fase 5: Melhorias | 30-40h | 5-8 dias |
| **TOTAL** | **160-210h** | **27-42 dias** |

### Testes e QA

- Testes: 20-30h
- Correções de bugs: 10-15h
- Testes de aceitação: 5-10h

### Treinamento e Documentação

- Criação de docs: 10-15h
- Vídeos tutoriais: 5-10h
- Treinamento usuários: 5-10h

### Overhead de Projeto

- Reuniões: 10-15h
- Code reviews: 10-15h
- Planejamento detalhado: 5-10h

### Total Geral

**210-330 horas** (26-41 dias úteis com 1 desenvolvedor)
**105-165 horas** (13-21 dias úteis com 2 desenvolvedores)

---

## 🎯 Recomendação Final

### Abordagem Recomendada: **MVP + Incrementos**

**MVP (Mínimo Viável):**

- Fase 1: Fundação ✅
- Fase 2: Interface Básica ✅
- Fase 3: Criação Automática Simples ⚡

**Prazo MVP:** 4-6 semanas
**Benefício:** Sistema já funcional e útil

**Incrementos Posteriores:**

- Notificações avançadas
- Workflow completo
- Dashboard e relatórios

### Priorização por Valor

1. **Alta Prioridade** (MVP):
   - ✅ Tabelas e APIs
   - ✅ Interface de criação manual
   - ✅ Listagem e filtros
   - ⚡ Criação automática básica

2. **Média Prioridade** (v2):
   - 📧 Notificações
   - 🔄 Workflow de validação
   - 📊 Dashboard básico

3. **Baixa Prioridade** (v3):
   - 📈 Relatórios avançados
   - 🔗 Integrações externas
   - 🎨 Customizações avançadas

---

## ✅ Próximos Passos Imediatos

### Para Iniciar Hoje

1. ✅ **Aprovar este plano** - Revisar e ajustar conforme necessário
2. 🗄️ **Executar SQL da Fase 1** - Criar tabelas no Supabase
3. 🔧 **Criar rotas backend** - Implementar endpoints básicos
4. 🧪 **Testar com Postman** - Validar APIs funcionando
5. 🎨 **Criar interface básica** - Componente de listagem

### Primeiros 5 Dias

- Dia 1: SQL + RLS + Views
- Dia 2: Backend APIs (CRUD básico)
- Dia 3: Frontend API client + tipos
- Dia 4: Componente de listagem
- Dia 5: Componente de formulário

**Ao final:** Sistema funcional para criação manual de ações! 🎉

---

## 📞 Suporte e Dúvidas

Para dúvidas durante implementação:

1. Consultar esta documentação
2. Revisar análise original: `ANALISE_NAO_CONFORMIDADES_LV.md`
3. Consultar documentação do Supabase
4. Testar endpoints com dados reais

---

**Documentado por:** Claude Code
**Data:** 17/11/2025
**Versão:** 1.0
**Status:** ✅ Plano aprovado e pronto para execução

---

**Quer que eu inicie a implementação da Fase 1 agora?** 🚀
