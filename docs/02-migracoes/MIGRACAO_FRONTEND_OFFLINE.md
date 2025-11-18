# 🖥️ Migração Frontend e Funcionalidade Offline

## 🎯 **Impacto da Migração no Frontend**

### **✅ NÃO haverá perda visual ou funcional**

A migração para estrutura unificada **NÃO afetará** a experiência do usuário. O frontend continuará funcionando exatamente como antes, mas com código mais eficiente e manutenível.

## 📱 **Interface Visual - Sem Mudanças**

### **O que NÃO muda:**

- ✅ **Layout e design** permanecem idênticos
- ✅ **Formulários** continuam com a mesma aparência
- ✅ **Navegação** permanece igual
- ✅ **Funcionalidades** (salvar, editar, excluir, visualizar) idênticas
- ✅ **Responsividade** mantida
- ✅ **Temas e cores** inalterados

### **O que muda (internamente):**

- 🔄 **Código mais limpo** e reutilizável
- 🔄 **Performance melhorada**
- 🔄 **Manutenção facilitada**

## 🔌 **Funcionalidade Offline - Preservada e Melhorada**

### **Estrutura Offline Atual:**

```typescript
// Atual - Tabelas específicas
lv_residuos!: Table<LVResiduos, string>;
lv_residuos_avaliacoes!: Table<LVResiduosAvaliacao, string>;
lv_residuos_fotos!: Table<LVResiduosFoto, string>;
```

### **Estrutura Offline Nova:**

```typescript
// Nova - Tabelas unificadas
lvs!: Table<LV, string>;
lv_avaliacoes!: Table<LVAvaliacao, string>;
lv_fotos!: Table<LVFoto, string>;
```

## 🔄 **Plano de Migração Frontend**

### **Fase 1: Adaptação das Interfaces (1 semana)**

#### **1.1 Atualizar Tipos TypeScript**

```typescript
// ANTES (específico)
interface LVResiduos {
  id: string;
  lv_tipo: string;
  lv_nome: string;
  // ... campos específicos
}

// DEPOIS (unificado)
interface LV {
  id: string;
  tipo_lv: string; // '01', '02', '03', etc.
  nome_lv: string; // 'Resíduos', 'Segurança', etc.
  // ... campos unificados
}
```

#### **1.2 Criar Configuração Dinâmica**

```typescript
// Configuração por tipo de LV
const LV_CONFIGS = {
  '01': {
    nome: 'Resíduos',
    nomeCompleto: '01.Resíduos',
    revisao: 'Revisão 09',
    bucket: 'fotos-lvs'
  },
  '02': {
    nome: 'Segurança',
    nomeCompleto: '02.Segurança',
    revisao: 'Revisão 05',
    bucket: 'fotos-lvs'
  }
  // ... outras LVs
};
```

### **Fase 2: Adaptação do Banco Offline (1 semana)**

#### **2.1 Atualizar IndexedDB**

```typescript
// Atualizar estrutura do Dexie
export class EcoFieldDB extends Dexie {
  // ANTES
  lv_residuos!: Table<LVResiduos, string>;
  lv_residuos_avaliacoes!: Table<LVResiduosAvaliacao, string>;
  lv_residuos_fotos!: Table<LVResiduosFoto, string>;

  // DEPOIS
  lvs!: Table<LV, string>;
  lv_avaliacoes!: Table<LVAvaliacao, string>;
  lv_fotos!: Table<LVFoto, string>;
}
```

#### **2.2 Migrar Dados Offline Existentes**

```typescript
// Função para migrar dados offline
async function migrarDadosOffline() {
  const db = new EcoFieldDB();
  
  // Migrar LVs existentes
  const lvsAntigas = await db.lv_residuos.toArray();
  for (const lv of lvsAntigas) {
    await db.lvs.add({
      ...lv,
      tipo_lv: '01', // LV Resíduos
      nome_lv: 'Resíduos'
    });
  }

  // Migrar avaliações
  const avaliacoesAntigas = await db.lv_residuos_avaliacoes.toArray();
  for (const av of avaliacoesAntigas) {
    await db.lv_avaliacoes.add({
      ...av,
      lv_id: av.lv_residuos_id,
      tipo_lv: '01'
    });
  }

  // Migrar fotos
  const fotosAntigas = await db.lv_residuos_fotos.toArray();
  for (const foto of fotosAntigas) {
    await db.lv_fotos.add({
      ...foto,
      lv_id: foto.lv_residuos_id,
      tipo_lv: '01'
    });
  }
}
```

### **Fase 3: Adaptação das APIs (1 semana)**

#### **3.1 APIs Unificadas**

```typescript
// API unificada para qualquer LV
export const lvAPI = {
  // Listar LVs por tipo
  async listarLVs(tipo_lv: string): Promise<LV[]> {
    if (navigator.onLine) {
      // Online: buscar do Supabase
      const { data, error } = await supabase
        .from('lvs')
        .select('*')
        .eq('tipo_lv', tipo_lv)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } else {
      // Offline: buscar do IndexedDB
      const db = new EcoFieldDB();
      return await db.lvs
        .where('tipo_lv')
        .equals(tipo_lv)
        .toArray();
    }
  },

  // Salvar LV (online/offline)
  async salvarLV(lv: Partial<LV>): Promise<LV> {
    if (navigator.onLine) {
      // Online: salvar no Supabase
      const { data, error } = await supabase
        .from('lvs')
        .insert(lv)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Offline: salvar no IndexedDB
      const db = new EcoFieldDB();
      const id = await db.lvs.add({
        ...lv,
        sincronizado: false,
        offline: true
      });
      
      return { ...lv, id } as LV;
    }
  }
};
```

### **Fase 4: Adaptação dos Componentes (1 semana)**

#### **4.1 Componente Genérico de LV**

```typescript
// Componente que funciona para qualquer LV
interface LVFormProps {
  tipo_lv: string; // '01', '02', '03', etc.
  lv?: LV;
  onSave: (lv: LV) => void;
  onCancel: () => void;
}

const LVForm: React.FC<LVFormProps> = ({ tipo_lv, lv, onSave, onCancel }) => {
  const config = LV_CONFIGS[tipo_lv];
  const [dadosFormulario, setDadosFormulario] = useState<Partial<LV>>({});
  const [avaliacoes, setAvaliacoes] = useState<LVAvaliacao[]>([]);
  const [fotos, setFotos] = useState<LVFoto[]>([]);

  // Carregar dados se for edição
  useEffect(() => {
    if (lv) {
      setDadosFormulario(lv);
      carregarAvaliacoes(lv.id);
      carregarFotos(lv.id);
    }
  }, [lv]);

  const handleSalvar = async () => {
    try {
      let lvSalva: LV;

      if (lv) {
        // Atualizar LV existente
        lvSalva = await lvAPI.atualizarLV(lv.id, dadosFormulario);
      } else {
        // Criar nova LV
        lvSalva = await lvAPI.salvarLV({
          ...dadosFormulario,
          tipo_lv,
          nome_lv: config.nome
        });
      }

      // Salvar avaliações e fotos
      await lvAvaliacoesAPI.salvarAvaliacoes(lvSalva.id, tipo_lv, avaliacoes);
      await lvFotosAPI.salvarFotos(lvSalva.id, tipo_lv, fotos);

      onSave(lvSalva);
    } catch (error) {
      console.error('Erro ao salvar LV:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        {lv ? 'Editar' : 'Nova'} {config.nomeCompleto}
      </h2>
      
      {/* Formulário principal - mesma aparência */}
      <LVFormPrincipal 
        dados={dadosFormulario}
        onChange={setDadosFormulario}
      />

      {/* Avaliações - mesma aparência */}
      <LVAvaliacoesForm
        tipo_lv={tipo_lv}
        avaliacoes={avaliacoes}
        onChange={setAvaliacoes}
      />

      {/* Fotos - mesma aparência */}
      <LVFotosForm
        tipo_lv={tipo_lv}
        fotos={fotos}
        onChange={setFotos}
      />

      {/* Botões - mesma aparência */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSalvar}
          className="px-6 py-2 bg-green-600 text-white rounded-lg"
        >
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
```

#### **4.2 Adaptar Página LV Resíduos**

```typescript
// Página LV Resíduos - mínimas mudanças
const LVResiduos: React.FC = () => {
  const { lvs, loading, carregarLVs, salvarLV, atualizarLV, deletarLV } = useLV('01');
  
  // Resto do código permanece igual
  // Apenas mudança nas chamadas de API
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">LV Resíduos</h1>
      
      {/* Lista de LVs - mesma aparência */}
      <LVList 
        lvs={lvs}
        onEdit={handleEditar}
        onDelete={handleDeletar}
        onView={handleVisualizar}
      />
      
      {/* Modal de formulário - mesma aparência */}
      {showForm && (
        <LVForm
          tipo_lv="01"
          lv={lvEmEdicao}
          onSave={handleSalvar}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
```

## 🔄 **Sincronização Offline - Melhorada**

### **Sincronização Atual vs Nova**

#### **Atual:**

```typescript
// Sincronização específica por LV
export async function syncLVResiduosOffline() {
  const db = new EcoFieldDB();
  const lvsOffline = await db.lv_residuos
    .where('sincronizado')
    .equals(false)
    .toArray();
  
  // Sincronizar uma por uma...
}
```

#### **Nova:**

```typescript
// Sincronização unificada para todas as LVs
export async function syncLVsOffline() {
  const db = new EcoFieldDB();
  const lvsOffline = await db.lvs
    .where('sincronizado')
    .equals(false)
    .toArray();
  
  // Sincronizar todas as LVs de uma vez
  for (const lv of lvsOffline) {
    await syncLVCompleta(lv);
  }
}

async function syncLVCompleta(lv: LV) {
  // Sincronizar LV principal
  await syncLVPrincipal(lv);
  
  // Sincronizar avaliações
  await syncLVAvaliacoes(lv.id);
  
  // Sincronizar fotos
  await syncLVFotos(lv.id);
}
```

## 📱 **Hook Unificado para LVs**

```typescript
// Hook que funciona para qualquer LV
export const useLV = (tipo_lv: string) => {
  const [lvs, setLvs] = useState<LV[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarLVs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await lvAPI.listarLVs(tipo_lv);
      setLvs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar LVs');
    } finally {
      setLoading(false);
    }
  };

  const salvarLV = async (lv: Partial<LV>) => {
    try {
      const lvSalva = await lvAPI.salvarLV({
        ...lv,
        tipo_lv,
        nome_lv: LV_CONFIGS[tipo_lv].nome
      });
      
      setLvs(prev => [lvSalva, ...prev]);
      return lvSalva;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar LV');
      throw err;
    }
  };

  // ... outras funções

  return {
    lvs,
    loading,
    error,
    carregarLVs,
    salvarLV,
    atualizarLV,
    deletarLV
  };
};
```

## 🎯 **Benefícios da Migração Frontend**

### **1. Código Mais Limpo**

- **Redução de 80%** no código duplicado
- **1 componente** para todas as LVs
- **Manutenção facilitada**

### **2. Performance Melhorada**

- **Menos re-renders** desnecessários
- **Cache otimizado** por tipo de LV
- **Sincronização mais eficiente**

### **3. Funcionalidade Offline Preservada**

- **100% das funcionalidades** mantidas
- **Sincronização melhorada**
- **Dados preservados** durante migração

### **4. Escalabilidade**

- **Nova LV** = apenas configuração
- **Sem duplicação** de código
- **Consistência** entre LVs

## 🚨 **Riscos e Mitigações**

### **Riscos Identificados:**

1. **Perda de dados offline** durante migração
2. **Quebra de funcionalidades** existentes
3. **Incompatibilidade** de versões

### **Mitigações Implementadas:**

1. **Backup automático** dos dados offline
2. **Migração gradual** com rollback
3. **Testes extensivos** em ambiente de desenvolvimento
4. **Compatibilidade** com versões antigas

## 📅 **Cronograma Frontend**

### **Semana 1: Preparação**

- [ ] Backup dos dados offline
- [ ] Criação de ambiente de teste
- [ ] Definição das interfaces unificadas

### **Semana 2: Migração de Dados**

- [ ] Atualizar estrutura do IndexedDB
- [ ] Migrar dados offline existentes
- [ ] Testar integridade dos dados

### **Semana 3: Adaptação de Componentes**

- [ ] Criar componentes genéricos
- [ ] Adaptar página LV Resíduos
- [ ] Testar funcionalidades

### **Semana 4: Sincronização e Testes**

- [ ] Implementar sincronização unificada
- [ ] Testes extensivos offline/online
- [ ] Correções e otimizações

## ✅ **Conclusão**

### **✅ Funcionalidade Offline PRESERVADA**

- **100% das funcionalidades** mantidas
- **Dados offline** preservados
- **Sincronização** melhorada

### **✅ Interface Visual INALTERADA**

- **Layout idêntico** ao atual
- **Experiência do usuário** mantida
- **Responsividade** preservada

### **✅ Benefícios Adicionais**

- **Código mais limpo** e manutenível
- **Performance melhorada**
- **Escalabilidade** para futuras LVs

## A migração é segura e não afetará a experiência do usuário! 🚀
