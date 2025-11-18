# 📋 Plano de Migração para Estrutura Unificada de LVs

## 🎯 **Objetivo**

Migrar da estrutura específica (36 tabelas) para estrutura unificada (3 tabelas) mantendo compatibilidade e funcionalidade.

## 📊 **Estrutura Atual vs Nova**

### **Estrutura Atual (Específica)**

```bash
lv_residuos + lv_residuos_avaliacoes + lv_residuos_fotos
lv_seguranca + lv_seguranca_avaliacoes + lv_seguranca_fotos
lv_agua + lv_agua_avaliacoes + lv_agua_fotos
-- ... 12 LVs = 36 tabelas
```

### **Estrutura Nova (Unificada)**

```bash
lvs (tabela principal)
lv_avaliacoes (avaliações de todas as LVs)
lv_fotos (fotos de todas as LVs)
lv_configuracoes (configuração de cada LV)
```

## 🚀 **Fases da Migração**

### **Fase 1: Preparação do Banco**

- [x] Criar script de migração SQL
- [ ] Executar migração no Supabase
- [ ] Verificar integridade dos dados
- [ ] Configurar políticas RLS

### **Fase 2: Adaptação do Frontend**

- [ ] Criar interfaces TypeScript unificadas
- [ ] Adaptar funções de API
- [ ] Implementar configuração dinâmica de LVs
- [ ] Testar funcionalidades existentes

### **Fase 3: Implementação de Novas LVs**

- [ ] Criar configurações para novas LVs
- [ ] Implementar componentes genéricos
- [ ] Testar com dados reais

### **Fase 4: Limpeza**

- [ ] Remover tabelas antigas
- [ ] Otimizar código
- [ ] Documentação final

## 🔧 **Implementação Técnica**

### **1. Interfaces TypeScript Unificadas**

```typescript
// Tipos unificados
interface LV {
  id: string;
  tipo_lv: string; // '01', '02', '03', etc.
  nome_lv: string; // 'Resíduos', 'Segurança', etc.
  usuario_id: string;
  usuario_nome: string;
  data_inspecao: string;
  area: string;
  responsavel_tecnico: string;
  observacoes_gerais?: string;
  total_fotos: number;
  total_conformes: number;
  total_nao_conformes: number;
  total_nao_aplicaveis: number;
  percentual_conformidade: number;
  status: 'concluido' | 'rascunho' | 'concluida';
  numero_sequencial: number;
  created_at: string;
}

interface LVAvaliacao {
  id: string;
  lv_id: string;
  tipo_lv: string;
  item_id: number;
  item_codigo: string;
  item_pergunta: string;
  avaliacao: 'C' | 'NC' | 'NA' | 'conforme' | 'nao_conforme' | 'nao_aplicavel';
  observacao?: string;
}

interface LVFoto {
  id: string;
  lv_id: string;
  tipo_lv: string;
  item_id: number;
  nome_arquivo: string;
  url_arquivo: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
}

interface LVConfiguracao {
  tipo_lv: string;
  nome_lv: string;
  nome_completo: string;
  revisao?: string;
  data_revisao?: string;
  bucket_fotos: string;
  ativa: boolean;
}
```

### **2. Configuração Dinâmica de LVs**

```typescript
// Configurações das LVs
const LV_CONFIGS: Record<string, LVConfiguracao> = {
  '01': {
    tipo_lv: '01',
    nome_lv: 'Resíduos',
    nome_completo: '01.Resíduos',
    revisao: 'Revisão 09',
    data_revisao: '2023-05-01',
    bucket_fotos: 'fotos-lvs',
    ativa: true
  },
  '02': {
    tipo_lv: '02',
    nome_lv: 'Segurança',
    nome_completo: '02.Segurança',
    revisao: 'Revisão 05',
    data_revisao: '2023-06-15',
    bucket_fotos: 'fotos-lvs',
    ativa: true
  },
  // ... outras LVs
};

// Função para obter configuração
const getLVConfig = (tipo_lv: string): LVConfiguracao => {
  return LV_CONFIGS[tipo_lv] || LV_CONFIGS['01']; // fallback
};
```

### **3. API Unificada**

```typescript
// Funções de API unificadas
export const lvAPI = {
  // Listar LVs por tipo
  async listarLVs(tipo_lv: string): Promise<LV[]> {
    const { data, error } = await supabase
      .from('lvs')
      .select('*')
      .eq('tipo_lv', tipo_lv)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Buscar LV específica
  async buscarLV(id: string): Promise<LV | null> {
    const { data, error } = await supabase
      .from('lvs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Salvar LV
  async salvarLV(lv: Partial<LV>): Promise<LV> {
    const { data, error } = await supabase
      .from('lvs')
      .insert(lv)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar LV
  async atualizarLV(id: string, lv: Partial<LV>): Promise<LV> {
    const { data, error } = await supabase
      .from('lvs')
      .update(lv)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar LV
  async deletarLV(id: string): Promise<void> {
    const { error } = await supabase
      .from('lvs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const lvAvaliacoesAPI = {
  // Buscar avaliações de uma LV
  async buscarAvaliacoes(lv_id: string): Promise<LVAvaliacao[]> {
    const { data, error } = await supabase
      .from('lv_avaliacoes')
      .select('*')
      .eq('lv_id', lv_id)
      .order('item_id');
    
    if (error) throw error;
    return data || [];
  },

  // Salvar avaliações
  async salvarAvaliacoes(lv_id: string, tipo_lv: string, avaliacoes: LVAvaliacao[]): Promise<void> {
    // Deletar avaliações existentes
    await supabase
      .from('lv_avaliacoes')
      .delete()
      .eq('lv_id', lv_id);

    // Inserir novas avaliações
    const avaliacoesParaSalvar = avaliacoes.map(av => ({
      ...av,
      lv_id,
      tipo_lv
    }));

    const { error } = await supabase
      .from('lv_avaliacoes')
      .insert(avaliacoesParaSalvar);
    
    if (error) throw error;
  }
};

export const lvFotosAPI = {
  // Buscar fotos de uma LV
  async buscarFotos(lv_id: string): Promise<LVFoto[]> {
    const { data, error } = await supabase
      .from('lv_fotos')
      .select('*')
      .eq('lv_id', lv_id)
      .order('item_id');
    
    if (error) throw error;
    return data || [];
  },

  // Upload de fotos
  async uploadFotos(lv_id: string, tipo_lv: string, fotos: File[]): Promise<LVFoto[]> {
    const config = getLVConfig(tipo_lv);
    const fotosSalvas: LVFoto[] = [];

    for (const foto of fotos) {
      const nomeArquivo = `${lv_id}/${Date.now()}_${foto.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(config.bucket_fotos)
        .upload(nomeArquivo, foto);

      if (uploadError) throw uploadError;

      const urlArquivo = supabase.storage
        .from(config.bucket_fotos)
        .getPublicUrl(nomeArquivo).data.publicUrl;

      const { data: fotoData, error: fotoError } = await supabase
        .from('lv_fotos')
        .insert({
          lv_id,
          tipo_lv,
          item_id: 0, // Será atualizado depois
          nome_arquivo: nomeArquivo,
          url_arquivo: urlArquivo
        })
        .select()
        .single();

      if (fotoError) throw fotoError;
      fotosSalvas.push(fotoData);
    }

    return fotosSalvas;
  }
};
```

### **4. Componente Genérico de LV**

```typescript
// Componente genérico para qualquer LV
interface LVFormProps {
  tipo_lv: string;
  lv?: LV;
  onSave: (lv: LV) => void;
  onCancel: () => void;
}

const LVForm: React.FC<LVFormProps> = ({ tipo_lv, lv, onSave, onCancel }) => {
  const config = getLVConfig(tipo_lv);
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
          nome_lv: config.nome_lv
        });
      }

      // Salvar avaliações
      await lvAvaliacoesAPI.salvarAvaliacoes(lvSalva.id, tipo_lv, avaliacoes);

      // Salvar fotos
      // ... lógica de upload

      onSave(lvSalva);
    } catch (error) {
      console.error('Erro ao salvar LV:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        {lv ? 'Editar' : 'Nova'} {config.nome_completo}
      </h2>
      
      {/* Formulário principal */}
      <LVFormPrincipal 
        dados={dadosFormulario}
        onChange={setDadosFormulario}
      />

      {/* Avaliações */}
      <LVAvaliacoesForm
        tipo_lv={tipo_lv}
        avaliacoes={avaliacoes}
        onChange={setAvaliacoes}
      />

      {/* Fotos */}
      <LVFotosForm
        tipo_lv={tipo_lv}
        fotos={fotos}
        onChange={setFotos}
      />

      {/* Botões */}
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

### **5. Hook para Gerenciar LVs**

```typescript
// Hook para gerenciar LVs de qualquer tipo
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
        nome_lv: getLVConfig(tipo_lv).nome_lv
      });
      
      setLvs(prev => [lvSalva, ...prev]);
      return lvSalva;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar LV');
      throw err;
    }
  };

  const atualizarLV = async (id: string, lv: Partial<LV>) => {
    try {
      const lvAtualizada = await lvAPI.atualizarLV(id, lv);
      setLvs(prev => prev.map(l => l.id === id ? lvAtualizada : l));
      return lvAtualizada;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar LV');
      throw err;
    }
  };

  const deletarLV = async (id: string) => {
    try {
      await lvAPI.deletarLV(id);
      setLvs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar LV');
      throw err;
    }
  };

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

## 📁 **Estrutura de Arquivos**

```bash
src/
├── components/
│   ├── lv/
│   │   ├── LVForm.tsx          # Formulário genérico
│   │   ├── LVList.tsx          # Lista genérica
│   │   ├── LVView.tsx          # Visualização genérica
│   │   ├── LVAvaliacoesForm.tsx
│   │   └── LVFotosForm.tsx
│   └── pages/
│       ├── LVResiduos.tsx      # Página específica (legado)
│       ├── LVSeguranca.tsx     # Nova página
│       └── LVAgua.tsx          # Nova página
├── lib/
│   ├── lvAPI.ts               # API unificada
│   └── lvConfig.ts            # Configurações
├── hooks/
│   └── useLV.ts               # Hook genérico
└── types/
    └── lv.ts                  # Tipos unificados
```

## 🔄 **Migração Gradual**

### **Passo 1: Implementar Estrutura Unificada**

1. Criar interfaces e APIs unificadas
2. Implementar componentes genéricos
3. Manter compatibilidade com LV Resíduos atual

### **Passo 2: Migrar LV Resíduos**

1. Adaptar página atual para usar estrutura unificada
2. Testar todas as funcionalidades
3. Verificar integridade dos dados

### **Passo 3: Implementar Novas LVs**

1. Criar configurações para novas LVs
2. Implementar páginas específicas
3. Testar com dados reais

### **Passo 4: Limpeza**

1. Remover código legado
2. Otimizar performance
3. Documentar mudanças

## ✅ **Benefícios da Migração**

1. **Manutenibilidade**: 1 código para todas as LVs
2. **Escalabilidade**: Nova LV = apenas configuração
3. **Performance**: Índices otimizados
4. **Consistência**: Estrutura padronizada
5. **Flexibilidade**: Configuração dinâmica

## 🚨 **Riscos e Mitigações**

### **Riscos**

- Perda de dados durante migração
- Quebra de funcionalidades existentes
- Complexidade inicial

### **Mitigações**

- Backup completo antes da migração
- Testes extensivos em ambiente de desenvolvimento
- Migração gradual com rollback
- Documentação detalhada

## 📅 **Cronograma Sugerido**

- **Semana 1**: Implementar estrutura unificada
- **Semana 2**: Migrar LV Resíduos
- **Semana 3**: Implementar 2-3 novas LVs
- **Semana 4**: Testes e otimizações
- **Semana 5**: Limpeza e documentação

---

**Este plano garante uma migração segura e eficiente para a estrutura unificada! 🚀
