# ⚡ Guia Rápido: Dados de Teste LV

## 🚀 Como Usar em 30 Segundos

```bash
# 1. Inicie o servidor
cd frontend && pnpm dev
```

```bash
# 2. No navegador
Dashboard → Listas de Verificação → Escolher qualquer LV
```

```bash
# 3. No formulário
Clique no botão roxo "✨ Dados de Teste" (canto superior direito)
```

```bash
# 4. Confirme
OK no alerta
```

```bash
# 5. Pronto! ✅
Formulário 100% preenchido com:
- Todos os campos
- Fotos coloridas
- Assinaturas
- GPS
```

---

## 🎯 O Que Vai Acontecer

### Antes

```bash
┌─────────────────────────────────────┐
│ LV-01 - Resíduos                    │
├─────────────────────────────────────┤
│ Data: [ vazio ]                     │
│ Área: [ vazio ]                     │
│ Responsável: [ vazio ]              │
│ ...                                 │
│ Itens: [ ] [ ] [ ] [ ] [ ] [ ]     │
│ Fotos: (nenhuma)                    │
│ Assinaturas: (nenhuma)              │
└─────────────────────────────────────┘
```

### Depois (2-5 segundos)

```bash
┌─────────────────────────────────────┐
│ LV-01 - Resíduos        [✨ Dados]  │
├─────────────────────────────────────┤
│ Data: 05/01/2025 ✓                  │
│ Área: Pátio de Máquinas ✓          │
│ Responsável: Carlos Silva ✓         │
│ GPS: -23.5505, -46.6333 ✓          │
│ ...                                 │
│ Itens: [C] [C] [NC] [C] [NA] [C]   │
│ Fotos: 🟢🟢🔴🟢🟡🟢 (9 fotos)       │
│ Assinaturas: ✍️ ✍️ (2)               │
└─────────────────────────────────────┘
```

---

## 📊 Resultados Típicos

```bash
✅ Conformes:        70% (~21/30 itens)
❌ Não conformes:    20% (~6/30 itens)
➖ Não aplicáveis:   10% (~3/30 itens)
📸 Fotos geradas:    9-12 fotos
✍️  Assinaturas:      1-2 assinaturas
📍 GPS:              Sim
```

---

## 🖼️ Fotos Geradas

```bash
┌────────────────────┐
│  FOTO DE TESTE     │ 🟢 Verde = Conforme
│  C - Item 1        │
│  05/01/2025 14:30  │
└────────────────────┘

┌────────────────────┐
│  FOTO DE TESTE     │ 🔴 Vermelho = Não Conforme
│  NC - Item 5       │
│  05/01/2025 14:30  │
└────────────────────┘

┌────────────────────┐
│  FOTO DE TESTE     │ 🟡 Amarelo = Não Aplicável
│  NA - Item 8       │
│  05/01/2025 14:30  │
└────────────────────┘
```

---

## ⚠️ Importante

- ✅ Funciona **apenas em desenvolvimento** (DEV mode)
- ✅ Pede **confirmação** antes de sobrescrever
- ✅ **Não salva automaticamente** (você ainda precisa clicar em "Salvar")
- ✅ Gera **dados aleatórios** (use só para testes)

---

## 🗑️ Remover Depois

Quando terminar os testes:

```bash
📖 Leia: frontend/REMOVER_DADOS_TESTE.md
```

3 passos simples para remover tudo!

---

## 🐛 Problemas?

### Botão não aparece

```bash
# Certifique-se que está em modo DEV
pnpm dev  # ✅ Botão aparece
pnpm build && pnpm preview  # ❌ Botão NÃO aparece
```

### Erro ao gerar

```bash
Abra o console (F12) → Veja os logs
```

---

## 💡 Dica Pro

Use para:

- ✅ Testar fluxo completo rapidamente
- ✅ Fazer demos/apresentações
- ✅ Validar cálculos de conformidade
- ✅ Testar com muitas fotos
- ✅ Simular cenários realistas

---

**Pronto para testar? Vamos lá! 🚀*

`cd frontend && pnpm dev`
