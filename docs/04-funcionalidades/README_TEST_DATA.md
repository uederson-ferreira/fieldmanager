# 🧪 Gerador de Dados de Teste para LVs

## Visão Geral

Utilitário para preencher automaticamente formulários de Listas de Verificação (LV) com dados de teste realistas, incluindo fotos mockadas, facilitando o processo de desenvolvimento e testes.

## Localização

- **Gerador**: `src/utils/testDataGenerator.ts`
- **Uso**: `src/components/lv/components/LVForm.tsx`

## Funcionalidades

### ✅ Dados Gerados Automaticamente

1. **Informações Básicas**
   - Área de verificação (aleatória de uma lista pré-definida)
   - Data da inspeção (data atual)
   - Responsável técnico (aleatório)
   - Responsável da área (aleatório)
   - Responsável da empresa (aleatório)
   - Inspetor secundário (50% de chance)

2. **Localização GPS**
   - Latitude e longitude (região de São Paulo)
   - Precisão GPS (5-20 metros)
   - Endereço formatado

3. **Avaliações dos Itens**
   - Distribuição realista:
     - 70% Conformes (C)
     - 20% Não Conformes (NC)
     - 10% Não Aplicáveis (NA)
   - ✅ Observações individuais em TODOS os itens (100%)

4. **Fotos Mockadas**
   - Geradas via Canvas API
   - Cores baseadas na avaliação:
     - ✅ Verde para Conforme
     - ❌ Vermelho para Não Conforme
     - ➖ Amarelo para Não Aplicável
   - ✅ Padrão alternado consistente:
     - Item 1: 1 foto
     - Item 2: 2 fotos
     - Item 3: 1 foto
     - Item 4: 2 fotos
     - E assim sucessivamente...
   - Metadados inclusos (nome do arquivo, timestamp)

5. **Assinaturas Digitais**
   - Assinatura principal (sempre gerada)
   - Assinatura secundária (50% de chance)
   - Formato: PNG base64
   - Simulação de assinatura manuscrita com curvas

## Como Usar

### No Formulário LV

1. **Abra qualquer formulário de LV** (ex: LV-01, LV-02, etc.)

2. **Localize o botão "Dados de Teste"**
   - Aparece no canto superior direito do formulário
   - Ícone: ✨ Sparkles
   - Cor roxa para destacar que é função de desenvolvimento

3. **Clique no botão**
   - Um alerta de confirmação aparecerá
   - Avisa que todos os dados atuais serão sobrescritos

4. **Aguarde a geração**
   - O botão mostrará "Gerando..." com animação
   - Processo leva ~2-5 segundos dependendo do número de itens

5. **Revise os dados**
   - Um alerta mostrará as estatísticas:
     - Total de itens avaliados
     - Conformes / Não conformes / Não aplicáveis
     - Total de fotos geradas
   - Role a página para ver todos os campos preenchidos

### Programaticamente

```typescript
import { generateTestData, getTestDataStats } from '../utils/testDataGenerator';

// Gerar dados
const testData = await generateTestData(
  configuracao,  // LVConfig
  nomeUsuario,   // string
  matricula      // string
);

// Obter estatísticas
const stats = getTestDataStats(testData);
console.log(stats);
// {
//   totalItens: 25,
//   conformes: 18,
//   naoConformes: 5,
//   naoAplicaveis: 2,
//   itensComFoto: 8,
//   totalFotos: 10
// }
```

## Visibilidade do Botão

O botão **só aparece em ambiente de desenvolvimento**:

```typescript
// Condição no código
import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development'
```

Para forçar em produção (temporariamente):
```bash
# No .env
VITE_APP_ENV=development
```

## Exemplos de Dados Gerados

### Áreas
- "Área de Produção - Setor A"
- "Almoxarifado Central"
- "Pátio de Máquinas"
- "Laboratório de Análises"
- "Estação de Tratamento"
- "Canteiro de Obras - Fase 2"

### Observações
- "Verificação realizada conforme procedimento padrão..."
- "Inspeção realizada em condições normais de operação..."
- "Durante a verificação, foram observados pontos de melhoria..."
- "Área inspecionada apresentou bom estado geral..."

### Fotos
- Dimensões: 400x300px
- Formato: PNG
- Grid decorativo (simula azulejo/parede)
- Texto: Tipo de avaliação + ID do item
- Timestamp da geração

## Vantagens

### 🚀 Desenvolvimento Mais Rápido
- Não precisa preencher 30+ campos manualmente
- Teste fluxos completos em segundos

### 🎯 Testes Realistas
- Distribuição de avaliações similar à realidade
- Fotos com metadados corretos
- GPS com coordenadas válidas

### 🔍 Identificação de Bugs
- Testa comportamento com muitas fotos
- Valida campos opcionais preenchidos
- Verifica cálculos de estatísticas

### 📊 Demos e Apresentações
- Dados profissionais instantaneamente
- Screenshots com conteúdo realista

## Limitações

1. **Fotos são placeholders**
   - Não são fotos reais
   - Apenas para testes visuais

2. **Dados aleatórios**
   - Nomes e áreas não correspondem a dados reais
   - Use apenas para desenvolvimento/testes

3. **Não persiste automaticamente**
   - Você ainda precisa clicar em "Salvar Verificação"
   - Útil para testar o fluxo de salvamento

## Segurança

- ✅ Botão invisível em produção
- ✅ Confirmação antes de sobrescrever dados
- ✅ Logs no console para debug
- ✅ Não interfere com dados reais

## Performance

- **Tempo de geração**: ~2-5 segundos
- **Fotos**: Geradas sob demanda (não pre-cached)
- **Memória**: ~100-500KB por formulário (depende do número de fotos)

## Troubleshooting

### Botão não aparece
```bash
# Verifique se está em modo desenvolvimento
pnpm dev

# Ou force no .env
VITE_APP_ENV=development
```

### Erro ao gerar fotos
- Verifique suporte do navegador ao Canvas API
- Abra console: Ctrl+Shift+J (Chrome) / Cmd+Option+J (Mac)

### Fotos não aparecem
- Verifique rede (se estiver offline, fotos não serão enviadas ao servidor)
- URLs temporárias são geradas, mas expiram ao recarregar página

## Changelog

### v1.0.0 (2025-01-05)
- ✨ Implementação inicial
- 🖼️ Geração de fotos mockadas via Canvas
- ✍️ Assinaturas digitais simuladas
- 📊 Estatísticas de dados gerados
- 🎨 UI com botão roxo destacado

## Próximas Melhorias

- [ ] Configurar distribuição de avaliações (C/NC/NA)
- [ ] Selecionar tipos de fotos (equipamento, área, documento)
- [ ] Salvar presets de dados de teste
- [ ] Exportar/importar dados de teste
- [ ] Integração com testes automatizados (E2E)

## Autor

Sistema EcoField - Módulo de Testes
