# Correções do Sistema de Metas - EcoField

**Data:** 07/11/2025
**Módulo:** Sistema de Metas (LVs, Termos Ambientais, Rotinas)
**Status:** ✅ Concluído e Testado

---

## 📋 Sumário Executivo

O sistema de metas estava parcialmente implementado mas apresentava múltiplos erros que impediam:
- Criação de LVs (Listas de Verificação)
- Atualização automática do progresso das metas
- Exibição de metas no dashboard

Após análise e correção, o sistema está **100% funcional** com atualização automática de progresso via triggers PostgreSQL.

---

## 🔍 Problemas Identificados

### 1. Erro: `column "criada_por" does not exist`
**Contexto:** Ao tentar criar uma LV, o sistema retornava erro 500.

**Causa Raiz:**
- A função `atualizar_progresso_meta()` usava a coluna `criada_por` na tabela `lvs`
- Esta coluna não existe; o campo correto é `usuario_id`
- Campos corretos por tabela:
  - `lvs`: `usuario_id`
  - `termos_ambientais`: `emitido_por_usuario_id`
  - `atividades_rotina`: `tma_responsavel_id`

**Arquivo Afetado:** `sql/migrations/00_metas_completo_refatorado.sql` (linhas 280, 289, 298)

---

### 2. Erro: `there is no unique or exclusion constraint matching the ON CONFLICT specification`
**Contexto:** Após corrigir o erro anterior, novo erro ao inserir na tabela `progresso_metas`.

**Causa Raiz:**
- A função `atualizar_progresso_meta()` usava `ON CONFLICT` sem constraint única
- Tabela `progresso_metas` não possuía constraint para `(meta_id, tma_id, periodo, ano, mes)`

**Solução:** Criada constraint única antes de usar ON CONFLICT.

---

### 3. Erro: `record "new" has no field "emitido_por_usuario_id"`
**Contexto:** Trigger disparava erro ao tentar criar LV.

**Causa Raiz:**
- A função `calcular_progresso_metas()` no banco de dados estava **completamente incorreta**
- Código encontrado:
```sql
BEGIN
  -- Popular auth_user_id se não estiver definido
  IF NEW.auth_user_id IS NULL AND NEW.emitido_por_usuario_id IS NOT NULL THEN
    NEW.auth_user_id := NEW.emitido_por_usuario_id;
  END IF;
  RETURN NEW;
END;
```
- Função tentava popular `auth_user_id` ao invés de **calcular progresso de metas**
- Tentava acessar `NEW.emitido_por_usuario_id` em TODAS as tabelas (mas só existe em `termos_ambientais`)

**Impacto:** Sistema de metas completamente não funcional.

---

## ✅ Soluções Implementadas

### Solução 1: Correção da função `atualizar_progresso_meta()`

**Arquivo:** `sql/migrations/97_fix_atualizar_progresso_meta.sql`

**Mudanças:**
```sql
-- ANTES (ERRO):
FROM lvs
WHERE ... AND (v_meta.escopo = 'equipe' OR criada_por IN (...))

-- DEPOIS (CORRETO):
FROM lvs
WHERE ... AND (v_meta.escopo = 'equipe' OR usuario_id = p_tma_id)
```

**Campos corretos por tabela:**
- `lvs`: `usuario_id` ✅
- `termos_ambientais`: `emitido_por_usuario_id` ✅
- `atividades_rotina`: `tma_responsavel_id` ✅

---

### Solução 2: Criação de constraint única

**Arquivo:** `sql/migrations/96_fix_on_conflict_progresso_metas.sql`

**Ações:**
1. Remoção de duplicatas existentes
2. Criação de constraint:
```sql
ALTER TABLE progresso_metas
ADD CONSTRAINT progresso_metas_unique_key
UNIQUE (meta_id, tma_id, periodo, ano, mes);
```
3. Atualização da função `atualizar_progresso_meta()` para usar constraint correta no `ON CONFLICT`

---

### Solução 3: Recriação completa da função `calcular_progresso_metas()`

**Arquivo:** `sql/migrations/92_recriar_funcao_calcular_progresso_metas.sql`

**Ações:**
1. **Remoção da função incorreta:**
```sql
DROP FUNCTION IF EXISTS calcular_progresso_metas() CASCADE;
```

2. **Criação da função correta:**
```sql
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id_atual UUID;
    tipo_meta_atual TEXT;
    v_ano INTEGER;
    v_mes INTEGER;
BEGIN
    -- Detectar tabela e campos corretos usando TG_TABLE_NAME
    CASE TG_TABLE_NAME
        WHEN 'termos_ambientais' THEN
            usuario_id_atual := NEW.emitido_por_usuario_id;
            tipo_meta_atual := 'termo';
        WHEN 'lvs' THEN
            usuario_id_atual := NEW.usuario_id;
            tipo_meta_atual := 'lv';
        WHEN 'lv_residuos' THEN
            usuario_id_atual := NEW.usuario_id;
            tipo_meta_atual := 'lv';
        WHEN 'atividades_rotina' THEN
            usuario_id_atual := NEW.tma_responsavel_id;
            tipo_meta_atual := 'rotina';
        ELSE
            RETURN NEW;
    END CASE;

    -- Calcular progresso e inserir/atualizar em progresso_metas
    -- ...
END;
$$ LANGUAGE plpgsql;
```

3. **Recriação de todos os triggers:**
```sql
CREATE TRIGGER trigger_calcular_progresso_lvs
    AFTER INSERT OR UPDATE ON lvs
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_termos
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lv_residuos
    AFTER INSERT OR UPDATE ON lv_residuos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_rotinas
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();
```

---

## 🏗️ Arquitetura do Sistema de Metas

### Estrutura de Tabelas

#### `metas`
```sql
- id: UUID (PK)
- tipo_meta: 'lv' | 'termo' | 'rotina'
- categoria: VARCHAR (nullable)
- periodo: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual'
- ano: INTEGER
- mes: INTEGER (nullable)
- meta_quantidade: INTEGER
- escopo: 'equipe' | 'individual'
- ativa: BOOLEAN
- auth_user_id: UUID
```

#### `metas_atribuicoes`
```sql
- id: UUID (PK)
- meta_id: UUID (FK → metas)
- tma_id: UUID (FK → usuarios)
- meta_quantidade_individual: INTEGER (nullable)
- responsavel: BOOLEAN
```

#### `progresso_metas`
```sql
- id: UUID (PK)
- meta_id: UUID (FK → metas)
- tma_id: UUID (FK → usuarios, nullable para metas de equipe)
- periodo: VARCHAR
- ano: INTEGER
- mes: INTEGER (nullable)
- quantidade_atual: INTEGER
- percentual_alcancado: NUMERIC(5,2)
- status: 'em_andamento' | 'alcancada' | 'superada' | 'nao_alcancada'
- ultima_atualizacao: TIMESTAMP

CONSTRAINT: UNIQUE (meta_id, tma_id, periodo, ano, mes)
```

---

### Fluxo de Funcionamento

#### 1. Criação de Meta (Admin/Supervisor)
```
Frontend → Backend (POST /api/metas)
         ↓
Backend → Supabase (INSERT INTO metas)
         ↓
Supabase → RLS Policies (verificação de permissão)
         ↓
Meta criada com sucesso
```

#### 2. Atribuição de Meta Individual
```
Frontend → Backend (POST /api/metas/:id/atribuir)
         ↓
Backend → Supabase (INSERT INTO metas_atribuicoes)
         ↓
Meta atribuída ao(s) técnico(s)
```

#### 3. Criação de LV pelo Técnico (Atualização Automática)
```
Técnico cria LV no frontend
         ↓
Backend → Supabase (INSERT INTO lvs)
         ↓
Trigger: trigger_calcular_progresso_lvs DISPARA
         ↓
Função: calcular_progresso_metas()
         ↓
1. Detecta tabela = 'lvs'
2. Extrai usuario_id = NEW.usuario_id
3. Busca metas ativas de tipo 'lv' para este usuário
4. Conta quantas LVs o usuário criou no período
5. Calcula percentual alcançado
6. Determina status (em_andamento/alcancada/superada/nao_alcancada)
         ↓
INSERT/UPDATE em progresso_metas (usando ON CONFLICT)
         ↓
✅ Progresso atualizado automaticamente!
```

---

## 🧪 Testes Realizados

### Teste 1: Diagnóstico de Problema
**Arquivo:** `sql/migrations/98_diagnostico_criada_por_lvs.sql`

**Resultado:**
- ✅ Identificou que `criada_por` não existe em `lvs`
- ✅ Encontrou função `atualizar_progresso_meta` usando campo incorreto

---

### Teste 2: Verificação de Triggers
**Arquivo:** `sql/migrations/94_verificar_e_corrigir_triggers.sql`

**Resultado:**
- ✅ 4 triggers ativos confirmados:
  - `trigger_calcular_progresso_lvs` → `lvs`
  - `trigger_calcular_progresso_termos` → `termos_ambientais`
  - `trigger_calcular_progresso_lv_residuos` → `lv_residuos`
  - `trigger_calcular_progresso_rotinas` → `atividades_rotina`

---

### Teste 3: Teste Automático de Trigger
**Arquivo:** `sql/migrations/91_testar_trigger_automatico.sql`

**Ações do Teste:**
1. Registrou estado do progresso ANTES
2. Criou LV de teste automaticamente
3. Aguardou 2 segundos
4. Verificou estado do progresso DEPOIS
5. Removeu LV de teste

**Resultado:**
```
✅ TRIGGER FUNCIONANDO!
Progresso foi atualizado automaticamente
```

---

### Teste 4: Verificação de Progresso Real
**Arquivo:** `sql/migrations/95_verificar_progresso_meta.sql`

**Resultado:**
- ✅ 1 LV criada hoje
- ✅ 2 metas de LV ativas
- ✅ 4 progressos atualizados nos últimos 5 minutos

---

## 📊 Resultados Finais

### Backend
- ✅ Rota POST `/api/metas` funcionando (criar meta)
- ✅ Rota GET `/api/metas` funcionando (listar metas)
- ✅ Rota GET `/api/metas/dashboard/resumo` funcionando
- ✅ Rota POST `/api/metas/:id/atribuir` funcionando
- ✅ Rota POST `/api/lvs` funcionando (criar LV)
- ✅ Backend usando `supabaseAdmin` (service_role) para bypass de RLS

### Banco de Dados
- ✅ Função `calcular_progresso_metas()` recriada corretamente
- ✅ Função `atualizar_progresso_meta()` corrigida
- ✅ Constraint única criada em `progresso_metas`
- ✅ 4 triggers ativos e funcionais
- ✅ ON CONFLICT funcionando com constraint correta

### Frontend
- ✅ LVs sendo criadas com sucesso
- ✅ Metas sendo exibidas no dashboard
- ✅ Progresso sendo calculado automaticamente

---

## 🔧 Arquivos SQL Criados/Modificados

### Criados Durante Correção:
1. `98_diagnostico_criada_por_lvs.sql` - Diagnóstico inicial
2. `97_fix_atualizar_progresso_meta.sql` - Corrigir campos usuario_id
3. `96_fix_on_conflict_progresso_metas.sql` - Criar constraint única
4. `95_verificar_progresso_meta.sql` - Verificar progresso após correção
5. `94_verificar_e_corrigir_triggers.sql` - Verificar triggers ativos
6. `93_ver_funcao_calcular_progresso.sql` - Ver código da função no banco
7. `92_recriar_funcao_calcular_progresso_metas.sql` - **Correção principal**
8. `91_testar_trigger_automatico.sql` - Teste final completo

### Modificados:
- Backend: `/backend/src/routes/lvs.ts` (já estava correto, removendo campos `criada_por`)
- Backend: `/backend/src/routes/metas.ts` (completo rewrite anterior)
- Frontend: `/frontend/src/types/metas.ts` (alinhamento com DB)
- Frontend: `/frontend/src/lib/metasAPI.ts` (transformação de campos)
- Frontend: `/frontend/src/hooks/useCrudMetas.ts` (correção de TypeScript)

---

## 📝 Lições Aprendidas

### 1. Sempre usar Service Role no Backend
✅ **Correto:** Backend usa `supabaseAdmin` (service_role_key)
❌ **Erro comum:** Usar `supabase` (anon_key) que é limitado por RLS

### 2. Verificar funções no banco, não apenas nos arquivos
- Arquivos SQL podem estar corretos
- Mas função no banco pode ter sido sobrescrita incorretamente
- **Solução:** Sempre consultar `pg_proc.prosrc` para ver código real

### 3. Triggers precisam usar TG_TABLE_NAME
- Uma função trigger pode ser usada em múltiplas tabelas
- Use `CASE TG_TABLE_NAME` para detectar qual tabela disparou
- Cada tabela tem campos diferentes (usuario_id vs emitido_por_usuario_id)

### 4. ON CONFLICT requer constraint única
- Não adivinhe nomes de constraints
- Sempre verifique `pg_constraint` antes
- Crie constraint explicitamente se não existir

### 5. Testes automatizados são essenciais
- Script de teste SQL pode criar, verificar e limpar dados
- Usa `pg_sleep()` para aguardar triggers assíncronos
- Retorna resultado claro (✅ FUNCIONANDO / ❌ NÃO FUNCIONANDO)

---

## 🚀 Como Usar o Sistema de Metas

### Para Administradores/Supervisores

#### 1. Criar Meta de Equipe
```typescript
POST /api/metas
{
  "tipo_meta": "lv",
  "periodo": "mensal",
  "ano": 2025,
  "mes": 11,
  "meta_quantidade": 50,
  "escopo": "equipe",
  "descricao": "Meta de LVs para toda a equipe"
}
```

#### 2. Criar Meta Individual
```typescript
POST /api/metas
{
  "tipo_meta": "lv",
  "periodo": "mensal",
  "ano": 2025,
  "mes": 11,
  "meta_quantidade": 10,
  "escopo": "individual",
  "descricao": "Meta individual de LVs"
}
```

#### 3. Atribuir Meta a Técnicos
```typescript
POST /api/metas/:id/atribuir
{
  "tma_ids": ["uuid-tma-1", "uuid-tma-2"],
  "meta_quantidade_individual": 5
}
```

#### 4. Ver Dashboard
```typescript
GET /api/metas/dashboard/resumo

Response:
{
  "total_metas": 5,
  "metas_por_tipo": { "lv": 2, "termo": 2, "rotina": 1 },
  "metas_por_escopo": { "equipe": 2, "individual": 3 },
  "metas_por_status": {
    "alcancada": 1,
    "em_andamento": 3,
    "nao_alcancada": 1,
    "superada": 0
  }
}
```

### Para Técnicos (TMA)

#### 1. Ver Minhas Metas
```typescript
GET /api/metas/usuario/:usuario_id

Response: [
  {
    "id": "...",
    "tipo_meta": "lv",
    "meta_quantidade": 10,
    "progresso_individual": {
      "quantidade_atual": 7,
      "percentual_alcancado": 70.00,
      "status": "em_andamento",
      "ultima_atualizacao": "2025-11-07T23:00:00Z"
    }
  }
]
```

#### 2. Criar LV (Progresso Atualiza Automaticamente)
```typescript
POST /api/lvs
{
  "tipo_lv": "02",
  "nome_lv": "Recursos Hídricos",
  "usuario_id": "uuid-do-tecnico",
  "data_inspecao": "2025-11-07",
  "area": "Área Industrial",
  // ... outros campos
}

// Após salvar, o trigger calcula automaticamente:
// - Conta quantas LVs o técnico criou no mês
// - Atualiza progresso_metas
// - Recalcula percentual e status
```

---

## 🔐 Segurança e Permissões

### Row Level Security (RLS)
- **Metas:** Admin/Supervisor podem CRUD; Técnico pode apenas SELECT suas metas
- **Backend bypassa RLS:** Usa `service_role_key` para operações do sistema

### Políticas de Acesso
```sql
-- Técnico vê apenas metas atribuídas a ele ou de equipe
WHERE (
  m.escopo = 'equipe' OR
  EXISTS (SELECT 1 FROM metas_atribuicoes WHERE meta_id = m.id AND tma_id = auth.uid())
)

-- Admin/Supervisor vê todas
WHERE EXISTS (
  SELECT 1 FROM usuarios u
  JOIN perfis p ON u.perfil_id = p.id
  WHERE u.auth_user_id = auth.uid()
    AND p.nome IN ('Admin', 'Supervisor')
)
```

---

## 📈 Monitoramento e Manutenção

### Verificar Status dos Triggers
```sql
SELECT
    tgrelid::regclass as tabela,
    tgname as trigger_name,
    tgenabled::text as status
FROM pg_trigger
WHERE tgname LIKE '%calcular_progresso%'
  AND NOT tgisinternal;
```

### Ver Progresso das Metas
```sql
SELECT
    m.descricao,
    m.tipo_meta,
    m.escopo,
    m.meta_quantidade,
    pm.quantidade_atual,
    pm.percentual_alcancado,
    pm.status,
    u.nome as tecnico
FROM progresso_metas pm
JOIN metas m ON pm.meta_id = m.id
LEFT JOIN usuarios u ON pm.tma_id = u.id
WHERE m.ativa = true
ORDER BY pm.ultima_atualizacao DESC;
```

### Logs dos Triggers
Os triggers geram logs via `RAISE NOTICE`:
```
🔄 TRIGGER: Processando INSERT para tabela lvs
👤 Usuário LVs: uuid-do-usuario
📅 Ano: 2025, Mês: 11
🎯 Processando meta: Meta de LVs (tipo: lv)
📊 Quantidade atual (lv): 8
📈 Percentual individual: 80.00% (meta: 10)
🏷️ Status: em_andamento
✅ Progresso atualizado para meta uuid-da-meta (lv)
✅ Trigger concluído com sucesso para lv
```

---

## ✅ Checklist de Validação

### Backend
- [x] Rota POST /api/metas funciona
- [x] Rota GET /api/metas funciona
- [x] Rota POST /api/metas/:id/atribuir funciona
- [x] Rota GET /api/metas/dashboard/resumo funciona
- [x] Backend usa `supabaseAdmin` (service_role)
- [x] Erros são logados corretamente

### Banco de Dados
- [x] Função `calcular_progresso_metas()` existe e está correta
- [x] Função `atualizar_progresso_meta()` existe e está correta
- [x] Constraint `progresso_metas_unique_key` existe
- [x] Triggers estão ativos em todas as tabelas (lvs, termos, rotinas, lv_residuos)
- [x] ON CONFLICT funciona sem erros

### Frontend
- [x] LVs são criadas com sucesso
- [x] Metas são exibidas no dashboard
- [x] Progresso é mostrado corretamente
- [x] Interface de atribuição funciona

### Testes
- [x] Teste automático de trigger passa
- [x] LV de teste cria e atualiza progresso
- [x] Progresso é calculado corretamente
- [x] Status é determinado corretamente

---

## 🎯 Próximos Passos (Melhorias Futuras)

### Funcionalidades Adicionais
1. **Notificações:** Alertar técnico quando meta está próxima de não ser alcançada
2. **Histórico:** Manter histórico de progresso mês a mês
3. **Relatórios:** Gerar relatórios de performance por técnico/equipe
4. **Gamificação:** Adicionar badges/conquistas ao alcançar metas

### Otimizações
1. **Cache:** Implementar cache de progresso para reduzir cálculos
2. **Batch Updates:** Processar múltiplas atualizações em lote
3. **Índices:** Adicionar índices para queries de progresso

### Monitoramento
1. **Métricas:** Adicionar métricas de quantas vezes triggers são disparados
2. **Alertas:** Alertar admins se triggers falharem
3. **Dashboard Admin:** Painel de monitoramento do sistema de metas

---

## 📞 Contato e Suporte

Para dúvidas ou problemas com o sistema de metas:
1. Verificar logs do backend (`console.log` em `/backend/src/routes/metas.ts`)
2. Verificar logs do banco (via Supabase Dashboard → Database → Logs)
3. Executar scripts de diagnóstico em `/sql/migrations/`

---

**Documentação criada em:** 07/11/2025
**Última atualização:** 07/11/2025
**Versão do sistema:** 1.4.0
**Status:** ✅ Sistema 100% funcional e testado
