# 🎨 Paleta de Cores Ideal - FieldManager v2.0

## 📋 Visão Geral

Esta paleta foi projetada para uma **plataforma multi-domínio profissional**, garantindo:

- ✅ **Consistência visual** entre domínios
- ✅ **Acessibilidade** (WCAG AA)
- ✅ **Diferenciação clara** entre domínios
- ✅ **Profissionalismo** e modernidade
- ✅ **Escalabilidade** para novos domínios

---

## 🎯 Cor Principal (Brand)

### Azul FieldManager (Primary)

**Cor escolhida**: `#3b82f6` (Blue-500)

**Por quê?**

- ✅ Profissional e confiável
- ✅ Neutro (não remete a um domínio específico)
- ✅ Boa legibilidade
- ✅ Funciona bem em dark/light mode
- ✅ Associado a tecnologia e gestão

**Variações**:

```css
--fieldmanager-50:  #eff6ff   /* Backgrounds suaves */
--fieldmanager-100: #dbeafe   /* Hover states */
--fieldmanager-500: #3b82f6   /* Principal (botões, links) */
--fieldmanager-600: #2563eb   /* Hover/Active */
--fieldmanager-700: #1d4ed8   /* Texto em fundo claro */
--fieldmanager-900: #1e3a8a   /* Texto escuro */
```

**Uso**:

- Logo e identidade visual
- Botões primários
- Links importantes
- Headers e navegação principal
- Ícones de sistema

---

## 🌈 Cores dos Domínios

### 1. 🌿 Meio Ambiente

```css
--ambiental-primary: #10b981   /* Emerald-500 */
--ambiental-secondary: #059669 /* Emerald-600 */
--ambiental-light: #d1fae5     /* Emerald-100 */
```

**Justificativa**: Verde remete a natureza, sustentabilidade, meio ambiente.

---

### 2. 🦺 Segurança do Trabalho

```css
--seguranca-primary: #f59e0b   /* Amber-500 */
--seguranca-secondary: #d97706 /* Amber-600 */
--seguranca-light: #fef3c7     /* Amber-100 */
```

**Justificativa**: Laranja/Amarelo = atenção, alerta, segurança (cones de trânsito, EPIs).

---

### 3. ⭐ Qualidade

```css
--qualidade-primary: #3b82f6   /* Blue-500 (mesma do brand) */
--qualidade-secondary: #2563eb /* Blue-600 */
--qualidade-light: #dbeafe      /* Blue-100 */
```

**Justificativa**: Azul = confiança, precisão, excelência (ISO, certificações).

---

### 4. 🏥 Saúde Ocupacional

```css
--saude-primary: #ec4899       /* Pink-500 */
--saude-secondary: #db2777      /* Pink-600 */
--saude-light: #fce7f3          /* Pink-100 */
```

**Justificativa**: Rosa/Vermelho = saúde, cuidado, medicina (cruz vermelha, hospitais).

**Alternativa** (mais profissional):

```css
--saude-primary: #dc2626       /* Red-600 */
--saude-secondary: #b91c1c     /* Red-700 */
--saude-light: #fee2e2         /* Red-100 */
```

---

### 5. 🔧 Manutenção

```css
--manutencao-primary: #8b5cf6   /* Violet-500 */
--manutencao-secondary: #7c3aed /* Violet-600 */
--manutencao-light: #ede9fe     /* Violet-100 */
```

**Justificativa**: Roxo = técnico, engenharia, manutenção industrial.

---

### 6. 📋 Auditoria

```css
--auditoria-primary: #6366f1   /* Indigo-500 */
--auditoria-secondary: #4f46e5 /* Indigo-600 */
--auditoria-light: #e0e7ff      /* Indigo-100 */
```

**Justificativa**: Índigo = formalidade, auditoria, compliance (mais sério que azul).

---

## ⚪ Sistema de Cores Neutras

### Escala de Cinzas (Base)

```css
--gray-50:  #f9fafb   /* Backgrounds muito claros */
--gray-100: #f3f4f6   /* Backgrounds claros */
--gray-200: #e5e7eb   /* Bordas suaves */
--gray-300: #d1d5db   /* Bordas médias */
--gray-400: #9ca3af   /* Texto secundário */
--gray-500: #6b7280   /* Texto padrão */
--gray-600: #4b5563   /* Texto importante */
--gray-700: #374151   /* Texto escuro */
--gray-800: #1f2937   /* Texto muito escuro */
--gray-900: #111827   /* Texto principal */
```

**Uso**:

- `gray-50/100`: Backgrounds de cards, seções
- `gray-200/300`: Bordas, divisores
- `gray-500/600`: Texto secundário
- `gray-700/800`: Texto principal

---

## 🎭 Cores de Estado (Feedback)

### ✅ Sucesso

```css
--success-50:  #f0fdf4
--success-500: #22c55e  /* Verde */
--success-600: #16a34a
```

**Uso**: Conformidade, sucesso, aprovação

---

### ⚠️ Aviso

```css
--warning-50:  #fffbeb
--warning-500: #f59e0b  /* Amarelo/Laranja */
--warning-600: #d97706
```

**Uso**: Atenção, pendências, alertas

---

### ❌ Erro

```css
--error-50:  #fef2f2
--error-500: #ef4444    /* Vermelho */
--error-600: #dc2626
```

**Uso**: Não conformidade, erros, crítico

---

### ℹ️ Informação

```css
--info-50:  #eff6ff
--info-500: #3b82f6     /* Azul (mesma do brand) */
--info-600: #2563eb
```

**Uso**: Informações, dicas, ajuda

---

## 🎨 Paleta Completa Recomendada

### Tailwind Config

```javascript
colors: {
  // Brand (Principal)
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  // Principal
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },

  // Domínios
  dominio: {
    ambiental: {
      primary: '#10b981',
      secondary: '#059669',
      light: '#d1fae5',
    },
    seguranca: {
      primary: '#f59e0b',
      secondary: '#d97706',
      light: '#fef3c7',
    },
    qualidade: {
      primary: '#3b82f6',  // Mesma do brand
      secondary: '#2563eb',
      light: '#dbeafe',
    },
    saude: {
      primary: '#ec4899',  // Ou '#dc2626' (mais profissional)
      secondary: '#db2777',
      light: '#fce7f3',
    },
    manutencao: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      light: '#ede9fe',
    },
    auditoria: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      light: '#e0e7ff',
    },
  },

  // Estados
  success: { /* ... */ },
  warning: { /* ... */ },
  error: { /* ... */ },
  info: { /* ... */ },
}
```

---

## 📐 Guia de Uso

### 1. **Hierarquia Visual**

```bash
Brand (Azul) > Domínios > Estados > Neutros
```

- **Brand**: Elementos globais (logo, navegação principal)
- **Domínios**: Elementos específicos do domínio ativo
- **Estados**: Feedback (sucesso, erro, aviso)
- **Neutros**: Base, textos, backgrounds

---

### 2. **Contraste e Acessibilidade**

✅ **Bom contraste** (WCAG AA):

- Texto escuro (`gray-800`) em fundo claro (`gray-50`)
- Texto branco em cores escuras (`brand-600`, `dominio-*-600`)

❌ **Evitar**:

- Texto claro em fundo claro
- Texto escuro em fundo escuro
- Cores muito próximas (ex: `blue-400` em `blue-500`)

---

### 3. **Aplicação por Contexto**

#### **Dashboard**

- Header: `brand-500` (azul FieldManager)
- Cards: `gray-50` com borda `gray-200`
- Gráficos: Cores do domínio ativo

#### **Formulários**

- Botão primário: Cor do domínio ativo
- Botão secundário: `gray-200` com texto `gray-700`
- Validação: `success-500` (conforme) / `error-500` (NC)

#### **Listas e Tabelas**

- Header: `gray-100`
- Linhas alternadas: `gray-50` / `white`
- Hover: `brand-50` ou cor do domínio light

---

## 🎯 Recomendações Finais

### ✅ **Fazer**

1. Usar **azul (#3b82f6)** como cor principal do sistema
2. Aplicar **cor do domínio** apenas em elementos contextuais
3. Manter **consistência** entre domínios (mesma estrutura, cores diferentes)
4. Usar **tons claros** para backgrounds (`*-50`, `*-100`)
5. Usar **tons escuros** para textos (`*-700`, `*-800`)

### ❌ **Evitar**

1. Misturar muitas cores em uma tela
2. Usar cores muito saturadas (cansam a vista)
3. Ignorar contraste (acessibilidade)
4. Mudar cores sem contexto (confunde usuário)

---

## 🔄 Migração

### Atual → Recomendado

| Elemento | Atual | Recomendado | Motivo |
|----------|-------|-------------|--------|
| Brand | Verde `#10b981` | Azul `#3b82f6` | Mais profissional, neutro |
| Primary | Verde | Azul (brand) | Alinhar com identidade |
| Domínios | ✅ OK | Manter | Já estão bem definidos |
| Estados | ✅ OK | Manter | Padrão universal |

---

## 📊 Comparação Visual

### Opção 1: Azul como Brand (Recomendado) ✅

```bash
FieldManager (Azul) → Profissional, Tecnológico
├── Ambiental (Verde)
├── Segurança (Laranja)
├── Qualidade (Azul - mesma do brand)
├── Saúde (Rosa/Vermelho)
├── Manutenção (Roxo)
└── Auditoria (Índigo)
```

### Opção 2: Verde como Brand (EcoField legacy)

```bash
FieldManager (Verde) → Ambiental, Natureza
├── Ambiental (Verde - conflito)
├── Segurança (Laranja)
└── ...
```

**Conclusão**: Azul é melhor para multi-domínio! ✅

---

## 🎨 Ferramentas

- **Coolors.co**: Gerar paletas harmoniosas
- **Contrast Checker**: Verificar acessibilidade
- **Tailwind Colors**: Usar escala padrão do Tailwind

---

**Última atualização**: 19/01/2025
**Versão**: 2.0.0
