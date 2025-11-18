# 🚀 Guia Rápido: Executar Migração de Configurações

**Data:** 04/01/2025
**Tempo estimado:** 30-45 minutos

---

## ✅ Checklist Rápido

### 1. Executar SQLs no Supabase (5 min)

```bash
# Acessar: https://supabase.com/dashboard → SQL Editor

# Executar na ordem:
1️⃣ frontend/sql/migrations/20250104_criar_tabelas_configuracoes_dinamicas.sql
2️⃣ frontend/sql/migrations/20250104_popular_configuracoes_dinamicas.sql
```

**Validar:** Deve exibir mensagens de sucesso com contagem de registros.

---

### 2. Testar APIs Backend (5 min)

```bash
# Iniciar backend
cd backend
pnpm dev

# Em outro terminal, testar:
curl http://localhost:3001/api/configuracoes/dinamicas/all | jq

# Deve retornar JSON com 10 arrays preenchidos
```

---

### 3. Testar Frontend (5 min)

```typescript
// Em qualquer componente, adicionar teste:
import { getAllConfigurations } from '@/lib/configsDinamicasAPI';

useEffect(() => {
  getAllConfigurations().then(configs => {
    console.log('✅ Configs carregadas:', configs);
  });
}, []);
```

---

### 4. Migrar Componentes (15-20 min)

Prioridade de migração:

1. **TermoFormFields.tsx** - Prefixos de numeração
2. **AtividadesRotinaForm.tsx** - Status options
3. **LVForm.tsx** - Opções C/NC/NA
4. **InspecaoPlugin.tsx** - Criticidade e tipos
5. **ResiduosPlugin.tsx** - Classificação de resíduos

Ver exemplos de código na documentação completa.

---

### 5. Criar CRUDs Admin (10 min)

```bash
# Criar componentes:
frontend/src/components/admin/CrudConfigsDinamicas.tsx
```

Ver template na documentação completa.

---

## 🎯 Resultado Final

Após executar todos os passos:

✅ 11 tabelas de configuração no banco
✅ 12 endpoints de API funcionando
✅ Frontend usando dados dinâmicos
✅ Admin pode editar sem código
✅ Zero hardcode restante

---

## 🐛 Troubleshooting

### Erro: "Tabela já existe"

```sql
-- Dropar tabelas existentes (cuidado!)
DROP TABLE IF EXISTS term_types CASCADE;
DROP TABLE IF EXISTS term_status CASCADE;
-- ... etc
```

### Erro: "RLS policy não permite INSERT"

```sql
-- Desabilitar temporariamente RLS
ALTER TABLE term_types DISABLE ROW LEVEL SECURITY;

-- Após popular, reabilitar
ALTER TABLE term_types ENABLE ROW LEVEL SECURITY;
```

### Erro: "API retorna vazio"

- Verificar se tabelas foram populadas
- Verificar se backend está rodando
- Verificar `VITE_API_URL` no `.env`

---

## 📝 Links Úteis

- [Documentação Completa](./20250104_MIGRACAO_CONFIGURACOES_DINAMICAS.md)
- [SQL de Criação](../sql/migrations/20250104_criar_tabelas_configuracoes_dinamicas.sql)
- [SQL de População](../sql/migrations/20250104_popular_configuracoes_dinamicas.sql)
- [API Client](../src/lib/configsDinamicasAPI.ts)

---

**Boa sorte! 🚀**
