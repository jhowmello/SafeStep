import { test, expect } from '@playwright/test';
import { mockApiRoutes, TECNICOS } from '../fixtures/mocks';
import path from 'path';

const ss = (name: string) => path.join(__dirname, '..', 'screenshots', name);

test.describe('TC01 a TC04 — Autenticação (Login)', () => {

  test.beforeEach(async ({ page }) => {
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await mockApiRoutes(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC01 - Página de login exibe título SafeStep e badges NR-10 e NR-35', async ({ page }) => {
    await expect(page.getByText('SafeStep').first()).toBeVisible();
    await expect(page.getByText('NR-10').first()).toBeVisible();
    await expect(page.getByText('NR-35').first()).toBeVisible();
    await expect(page.getByText('Entrar na conta').first()).toBeVisible();
    await page.screenshot({ path: ss('TC01-login-pagina-inicial.png'), fullPage: true });
  });

  test('TC02 - Login com campos vazios não navega — permanece na tela de login', async ({ page }) => {
    await page.getByTestId('btn-login').click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Entrar na conta').first()).toBeVisible();
    await page.screenshot({ path: ss('TC02-login-campos-vazios.png'), fullPage: true });
  });

  test('TC03 - Login com credenciais inválidas não navega — permanece na tela de login', async ({ page }) => {
    await page.locator('input[type="email"]').fill('hacker@falso.com');
    await page.locator('input[type="password"]').fill('senhaerrada');
    await page.getByTestId('btn-login').click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('Entrar na conta').first()).toBeVisible();
    await page.screenshot({ path: ss('TC03-login-credenciais-invalidas.png'), fullPage: true });
  });

  test('TC04 - Login com credenciais válidas navega para a tela de Ordens', async ({ page }) => {
    await page.locator('input[type="email"]').fill(TECNICOS[0].email);
    await page.locator('input[type="password"]').fill(TECNICOS[0].senha);
    await page.getByTestId('btn-login').click();
    await expect(page.getByText('Ordens de Serviço').first()).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: ss('TC04-login-sucesso-tela-ordens.png'), fullPage: true });
  });

});
