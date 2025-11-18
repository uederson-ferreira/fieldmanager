# 🧪 GUIA DE IMPLEMENTAÇÃO - SPRINT 6: TESTES E2E

**Data:** 13/11/2025
**Status:** 📋 DOCUMENTAÇÃO PARA IMPLEMENTAÇÃO FUTURA
**Prioridade:** ALTA
**Tempo Estimado:** 6-8 horas

---

## 📊 CONTEXTO

Os testes unitários e de integração já cobrem ~80% do código crítico do sistema. No entanto, para validar **fluxos completos end-to-end** em um ambiente próximo à produção, precisamos de testes E2E com um navegador real.

### Por que E2E?

- ✅ Valida fluxos completos de usuário
- ✅ Testa integrações reais (IndexedDB, Service Worker, API)
- ✅ Detecta problemas que testes unitários não pegam
- ✅ Simula cenários reais de uso offline/online

### Por que Playwright?

**Limitação do Vitest:** O ambiente jsdom do Vitest não suporta IndexedDB nativamente, o que impossibilita testes E2E realistas do sistema offline-first.

**Solução:** Playwright ou Cypress fornecem um navegador real (Chromium/Firefox/WebKit) onde o IndexedDB e Service Workers funcionam perfeitamente.

---

## 🚀 FASE 1: SETUP DO PLAYWRIGHT (1-2h)

### 1.1 Instalação

```bash
cd frontend
pnpm add -D @playwright/test
pnpm exec playwright install
```

### 1.2 Configuração

Criar `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 1.3 Scripts package.json

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 🎯 FASE 2: CENÁRIO 1 - FLUXO OFFLINE COMPLETO (2h)

### Objetivo

Validar o fluxo completo: usuário cria inspeção offline → preenche dados → adiciona fotos → volta online → sincroniza → verifica no backend.

### Arquivo: `src/test/e2e/01-offline-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('E2E - Fluxo Offline Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Login (ou mock de autenticação)
    await page.goto('/login');
    await page.fill('[name="email"]', 'tecnico@ecofield.com');
    await page.fill('[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    // Aguardar dashboard carregar
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('deve criar inspeção offline e sincronizar quando online', async ({ page, context }) => {
    // ==============================================================
    // FASE 1: USUÁRIO VAI OFFLINE
    // ==============================================================
    await context.setOffline(true);

    // Verificar indicador offline na UI
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // ==============================================================
    // FASE 2: CRIAR INSPEÇÃO OFFLINE
    // ==============================================================
    await page.goto('/inspecoes/nova');

    // Preencher formulário
    await page.selectOption('[name="tipo_inspecao"]', 'ambiental');
    await page.fill('[name="local_inspecao"]', 'Área Industrial A');
    await page.fill('[name="observacoes"]', 'Inspeção de rotina mensal');

    // Adicionar foto (simular upload)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/foto-teste.jpg');

    // Salvar
    await page.click('button[type="submit"]');

    // Verificar mensagem de sucesso
    await expect(page.locator('text=Inspeção salva offline')).toBeVisible();

    // ==============================================================
    // FASE 3: VERIFICAR DADOS NO INDEXEDDB
    // ==============================================================
    const inspecoesOffline = await page.evaluate(async () => {
      const { offlineDB } = await import('../lib/offline/database');
      return await offlineDB.inspecoes.toArray();
    });

    expect(inspecoesOffline.length).toBe(1);
    expect(inspecoesOffline[0].tipo_inspecao).toBe('ambiental');
    expect(inspecoesOffline[0].sincronizado).toBe(false);

    // Verificar foto em base64
    const fotosOffline = await page.evaluate(async () => {
      const { offlineDB } = await import('../lib/offline/database');
      return await offlineDB.fotos_inspecao.toArray();
    });

    expect(fotosOffline.length).toBe(1);
    expect(fotosOffline[0].arquivo_base64).toContain('data:image');

    // ==============================================================
    // FASE 4: VERIFICAR FILA DE SINCRONIZAÇÃO
    // ==============================================================
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="sync-pending-count"]')).toHaveText('1');

    // ==============================================================
    // FASE 5: USUÁRIO VOLTA ONLINE
    // ==============================================================
    await context.setOffline(false);

    // Verificar indicador online
    await expect(page.locator('[data-testid="online-indicator"]')).toBeVisible();

    // ==============================================================
    // FASE 6: SINCRONIZAÇÃO AUTOMÁTICA
    // ==============================================================
    // Aguardar sincronização automática (pode levar alguns segundos)
    await page.waitForTimeout(5000);

    // Verificar que fila foi zerada
    await expect(page.locator('[data-testid="sync-pending-count"]')).toHaveText('0');

    // Verificar mensagem de sincronização
    await expect(page.locator('text=Sincronização concluída')).toBeVisible();

    // ==============================================================
    // FASE 7: VERIFICAR INDEXEDDB VAZIO
    // ==============================================================
    const inspecoesAposSinc = await page.evaluate(async () => {
      const { offlineDB } = await import('../lib/offline/database');
      return await offlineDB.inspecoes.toArray();
    });

    expect(inspecoesAposSinc.length).toBe(0);

    // ==============================================================
    // FASE 8: VERIFICAR DADOS NO BACKEND
    // ==============================================================
    await page.goto('/inspecoes');

    // Verificar que inspeção aparece na lista
    await expect(page.locator('text=Área Industrial A')).toBeVisible();
    await expect(page.locator('text=Inspeção de rotina mensal')).toBeVisible();
  });
});
```

---

## 🎯 FASE 3: CENÁRIO 2 - CONFLITOS REAIS (2h)

### Objetivo

Simular dois usuários editando a mesma entidade e validar resolução de conflitos.

### Arquivo: `src/test/e2e/02-conflict-resolution.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('E2E - Resolução de Conflitos', () => {
  test('deve detectar e resolver conflitos automaticamente', async ({ browser }) => {
    // ==============================================================
    // SETUP: DOIS CONTEXTOS (USUÁRIO A e USUÁRIO B)
    // ==============================================================
    const userA = await browser.newContext();
    const pageA = await userA.newPage();

    const userB = await browser.newContext();
    const pageB = await userB.newPage();

    // Login Usuário A
    await pageA.goto('/login');
    await pageA.fill('[name="email"]', 'usuarioA@ecofield.com');
    await pageA.fill('[name="password"]', 'senha123');
    await pageA.click('button[type="submit"]');

    // Login Usuário B
    await pageB.goto('/login');
    await pageB.fill('[name="email"]', 'usuarioB@ecofield.com');
    await pageB.fill('[name="password"]', 'senha123');
    await pageB.click('button[type="submit"]');

    // ==============================================================
    // USUÁRIO A: CRIAR TERMO ONLINE
    // ==============================================================
    await pageA.goto('/termos/novo');
    await pageA.fill('[name="numero_termo"]', 'T-CONFLICT-001');
    await pageA.fill('[name="destinatario_nome"]', 'José Silva');
    await pageA.fill('[name="observacoes"]', 'Versão inicial');
    await pageA.click('button[type="submit"]');

    // Aguardar salvamento
    await expect(pageA.locator('text=Termo criado com sucesso')).toBeVisible();

    // Capturar ID do termo
    const termoId = await pageA.evaluate(() => {
      return new URLSearchParams(window.location.search).get('id');
    });

    // ==============================================================
    // USUÁRIO B: EDITAR O MESMO TERMO (ONLINE)
    // ==============================================================
    await pageB.goto(`/termos/editar?id=${termoId}`);
    await pageB.fill('[name="observacoes"]', 'Editado por Usuário B');
    await pageB.click('button[type="submit"]');

    await expect(pageB.locator('text=Termo atualizado')).toBeVisible();

    // ==============================================================
    // USUÁRIO A: VAI OFFLINE E EDITA O MESMO TERMO
    // ==============================================================
    await userA.setOffline(true);

    await pageA.goto(`/termos/editar?id=${termoId}`);
    await pageA.fill('[name="observacoes"]', 'Editado OFFLINE por Usuário A');
    await pageA.click('button[type="submit"]');

    await expect(pageA.locator('text=Termo salvo offline')).toBeVisible();

    // ==============================================================
    // USUÁRIO A: VOLTA ONLINE → CONFLITO DETECTADO
    // ==============================================================
    await userA.setOffline(false);

    // Aguardar sincronização
    await pageA.waitForTimeout(5000);

    // Verificar notificação de conflito
    await expect(pageA.locator('[data-testid="conflict-notification"]')).toBeVisible();
    await expect(pageA.locator('text=Conflito detectado')).toBeVisible();

    // ==============================================================
    // VERIFICAR ESTRATÉGIA DE RESOLUÇÃO
    // ==============================================================
    // Assumindo estratégia USE_REMOTE (ou MERGE)
    await pageA.click('[data-testid="resolve-conflict-btn"]');

    // Recarregar e verificar dados
    await pageA.reload();

    // Se USE_REMOTE: deve ter dados do Usuário B
    const observacoesFinais = await pageA.inputValue('[name="observacoes"]');

    // Dependendo da estratégia configurada:
    // USE_REMOTE → "Editado por Usuário B"
    // USE_LOCAL → "Editado OFFLINE por Usuário A"
    // MERGE → Combinação de ambos

    expect(observacoesFinais).toBeTruthy();

    // ==============================================================
    // CLEANUP
    // ==============================================================
    await userA.close();
    await userB.close();
  });
});
```

---

## 🎯 FASE 4: CENÁRIO 3 - PERFORMANCE E ESCALA (1-2h)

### Objetivo

Validar que o sistema suporta grandes volumes de dados offline.

### Arquivo: `src/test/e2e/03-performance.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('E2E - Performance e Escala', () => {
  test('deve lidar com 1000 inspeções offline sem degradação', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'tecnico@ecofield.com');
    await page.fill('[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    // ==============================================================
    // CRIAR 1000 INSPEÇÕES NO INDEXEDDB
    // ==============================================================
    console.log('Criando 1000 inspeções no IndexedDB...');

    const startCreate = Date.now();

    await page.evaluate(async () => {
      const { InspecaoManager } = await import('../lib/offline/entities');

      const promises = [];
      for (let i = 0; i < 1000; i++) {
        promises.push(
          InspecaoManager.create({
            tipo_inspecao: 'ambiental',
            usuario_id: 'user-123',
            usuario_nome: 'Técnico Teste',
            data_inspecao: '2025-01-15',
            hora_inspecao: '10:00',
            local_inspecao: `Área ${i}`,
            status: 'concluida',
            sincronizado: false,
            offline: true,
          } as any)
        );
      }

      await Promise.all(promises);
    });

    const createDuration = Date.now() - startCreate;
    console.log(`✅ 1000 inspeções criadas em ${createDuration}ms`);

    // Performance benchmark: deve criar em < 5s
    expect(createDuration).toBeLessThan(5000);

    // ==============================================================
    // TESTAR QUERY PERFORMANCE
    // ==============================================================
    console.log('Testando query performance...');

    const startQuery = Date.now();

    const inspecoes = await page.evaluate(async () => {
      const { InspecaoManager } = await import('../lib/offline/entities');
      return await InspecaoManager.getAll();
    });

    const queryDuration = Date.now() - startQuery;
    console.log(`✅ Query executada em ${queryDuration}ms`);

    // Performance benchmark: query deve rodar em < 100ms
    expect(queryDuration).toBeLessThan(100);
    expect(inspecoes.length).toBe(1000);

    // ==============================================================
    // TESTAR SINCRONIZAÇÃO EM LOTE
    // ==============================================================
    console.log('Testando sincronização em lote...');

    // Mock do backend para responder rapidamente
    await page.route('**/api/inspecoes', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: { id: 'mock-id' } }),
      });
    });

    const startSync = Date.now();

    await page.evaluate(async () => {
      const { InspecaoSync } = await import('../lib/offline/sync/syncers/InspecaoSync');
      return await InspecaoSync.syncAll();
    });

    const syncDuration = Date.now() - startSync;
    console.log(`✅ 1000 inspeções sincronizadas em ${syncDuration}ms`);

    // Performance benchmark: sincronização de 1000 itens em < 30s
    expect(syncDuration).toBeLessThan(30000);

    // ==============================================================
    // VERIFICAR MEMORY USAGE (OPCIONAL)
    // ==============================================================
    const metrics = await page.evaluate(() => {
      return {
        jsHeapSize: (performance as any).memory?.usedJSHeapSize,
        totalHeapSize: (performance as any).memory?.totalJSHeapSize,
      };
    });

    console.log(`💾 Memory Usage: ${Math.round(metrics.jsHeapSize / 1024 / 1024)}MB`);

    // Verificar que não está usando mais de 200MB
    expect(metrics.jsHeapSize).toBeLessThan(200 * 1024 * 1024);
  });
});
```

---

## 🎯 FASE 5: CENÁRIO 4 - RESILIÊNCIA (1-2h)

### Objetivo

Testar comportamento do sistema em condições adversas.

### Arquivo: `src/test/e2e/04-resilience.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('E2E - Resiliência', () => {
  test('deve recuperar de rede intermitente', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'tecnico@ecofield.com');
    await page.fill('[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    // ==============================================================
    // CRIAR INSPEÇÃO OFFLINE
    // ==============================================================
    await context.setOffline(true);

    await page.goto('/inspecoes/nova');
    await page.selectOption('[name="tipo_inspecao"]', 'ambiental');
    await page.fill('[name="local_inspecao"]', 'Teste Resiliência');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Inspeção salva offline')).toBeVisible();

    // ==============================================================
    // SIMULAR REDE INTERMITENTE (ON/OFF/ON/OFF)
    // ==============================================================
    await context.setOffline(false);

    // Mock do backend para falhar nas primeiras 3 tentativas
    let attemptCount = 0;

    await page.route('**/api/inspecoes', route => {
      attemptCount++;

      if (attemptCount <= 3) {
        // Simular timeout/erro de rede
        route.abort('timedout');
      } else {
        // Sucesso na 4ª tentativa
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, data: { id: 'insp-123' } }),
        });
      }
    });

    // ==============================================================
    // AGUARDAR RETRY COM EXPONENTIAL BACKOFF
    // ==============================================================
    // 1ª tentativa: imediata → falha
    await page.waitForTimeout(1000);

    // 2ª tentativa: após 2s → falha
    await page.waitForTimeout(2000);

    // 3ª tentativa: após 4s → falha
    await page.waitForTimeout(4000);

    // 4ª tentativa: após 8s → SUCESSO
    await page.waitForTimeout(8000);

    // ==============================================================
    // VERIFICAR SUCESSO NA SINCRONIZAÇÃO
    // ==============================================================
    await expect(page.locator('text=Sincronização concluída')).toBeVisible();

    // Verificar que fila foi zerada
    await expect(page.locator('[data-testid="sync-pending-count"]')).toHaveText('0');

    // Verificar que foram feitas 4 tentativas
    expect(attemptCount).toBe(4);

    console.log(`✅ Sistema recuperou após ${attemptCount} tentativas com exponential backoff`);
  });

  test('deve manter dados íntegros após crash/reload', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'tecnico@ecofield.com');
    await page.fill('[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    await context.setOffline(true);

    // ==============================================================
    // CRIAR MÚLTIPLAS INSPEÇÕES
    // ==============================================================
    for (let i = 1; i <= 5; i++) {
      await page.goto('/inspecoes/nova');
      await page.selectOption('[name="tipo_inspecao"]', 'ambiental');
      await page.fill('[name="local_inspecao"]', `Área ${i}`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // ==============================================================
    // SIMULAR CRASH: RECARREGAR PÁGINA
    // ==============================================================
    await page.reload();

    // Aguardar reload
    await page.waitForLoadState('networkidle');

    // ==============================================================
    // VERIFICAR QUE DADOS PERSISTIRAM
    // ==============================================================
    const inspecoes = await page.evaluate(async () => {
      const { InspecaoManager } = await import('../lib/offline/entities');
      return await InspecaoManager.getAll();
    });

    expect(inspecoes.length).toBe(5);

    // Verificar que fila está intacta
    await expect(page.locator('[data-testid="sync-pending-count"]')).toHaveText('5');

    // ==============================================================
    // VOLTAR ONLINE E SINCRONIZAR
    // ==============================================================
    await context.setOffline(false);

    // Mock do backend
    await page.route('**/api/inspecoes', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: { id: 'mock-id' } }),
      });
    });

    // Aguardar sincronização
    await page.waitForTimeout(5000);

    // Verificar que tudo foi sincronizado
    await expect(page.locator('[data-testid="sync-pending-count"]')).toHaveText('0');

    console.log('✅ Dados permaneceram íntegros após crash e reload');
  });
});
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Pré-requisitos
- [ ] Instalar Playwright: `pnpm add -D @playwright/test`
- [ ] Instalar navegadores: `pnpm exec playwright install`
- [ ] Criar `playwright.config.ts`
- [ ] Adicionar scripts no `package.json`

### Cenário 1: Fluxo Offline Completo
- [ ] Criar `01-offline-flow.spec.ts`
- [ ] Implementar teste de criação offline
- [ ] Validar salvamento no IndexedDB
- [ ] Validar sincronização automática
- [ ] Verificar dados no backend

### Cenário 2: Conflitos
- [ ] Criar `02-conflict-resolution.spec.ts`
- [ ] Simular múltiplos usuários
- [ ] Detectar conflitos
- [ ] Validar resolução automática

### Cenário 3: Performance
- [ ] Criar `03-performance.spec.ts`
- [ ] Testar criação de 1000 registros
- [ ] Validar query performance < 100ms
- [ ] Validar sincronização em lote < 30s
- [ ] Monitorar memory usage < 200MB

### Cenário 4: Resiliência
- [ ] Criar `04-resilience.spec.ts`
- [ ] Simular rede intermitente
- [ ] Validar retry com exponential backoff
- [ ] Testar integridade após crash/reload

### CI/CD Integration
- [ ] Adicionar Playwright ao GitHub Actions
- [ ] Configurar execução em PRs
- [ ] Gerar relatórios HTML
- [ ] Armazenar screenshots de falhas

---

## 🚀 COMANDOS ÚTEIS

```bash
# Executar todos os testes E2E
pnpm test:e2e

# Executar em modo UI (visual)
pnpm test:e2e:ui

# Executar em modo debug
pnpm test:e2e:debug

# Executar apenas um arquivo
pnpm test:e2e 01-offline-flow.spec.ts

# Executar em navegador específico
pnpm test:e2e --project=chromium

# Gerar relatório HTML
pnpm exec playwright show-report
```

---

## 📊 MÉTRICAS DE SUCESSO

### Critérios de Aceitação

- ✅ 4 cenários E2E completos implementados
- ✅ Testes rodam em Chromium, Firefox e Mobile Chrome
- ✅ Performance benchmarks cumpridos:
  - Query < 100ms
  - Sincronização de 1000 itens < 30s
  - Memory usage < 200MB
- ✅ Resilência validada:
  - Retry com exponential backoff funciona
  - Dados persistem após crash
- ✅ Testes integrados ao CI/CD

---

## 💡 PRÓXIMOS PASSOS APÓS SPRINT 6

1. **Sprint 7: CI/CD** (RECOMENDADO)
   - Automatizar execução dos testes E2E
   - Integrar com GitHub Actions
   - Configurar alertas de falha

2. **Expansão de Cenários E2E**
   - Testar fluxo de LVs completo
   - Testar upload de fotos reais
   - Testar geração de PDFs

3. **Monitoramento Contínuo**
   - Dashboards de performance
   - Alertas de regressão
   - Tracking de flaky tests

---

**Mantido por:** Claude Code
**Última atualização:** 13/11/2025
**Versão:** 1.0
