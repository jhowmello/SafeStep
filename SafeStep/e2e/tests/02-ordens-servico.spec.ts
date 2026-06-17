import { test, expect } from '@playwright/test';
import { login, ORDENS_SERVICO } from '../fixtures/mocks';
import path from 'path';

const ss = (name: string) => path.join(__dirname, '..', 'screenshots', name);

test.describe('TC05 a TC08 — Ordens de Serviço', () => {

  test.beforeEach(async ({ page }) => {
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await login(page);
  });

  test('TC05 - Tela de ordens exibe os quatro filtros de status', async ({ page }) => {
    await expect(page.getByTestId('filtro-todos')).toBeVisible();
    await expect(page.getByTestId('filtro-pendente')).toBeVisible();
    await expect(page.getByTestId('filtro-concluida')).toBeVisible();
    await expect(page.getByTestId('filtro-reprovada')).toBeVisible();
    await page.screenshot({ path: ss('TC05-ordens-filtros.png'), fullPage: true });
  });

  test('TC06 - Filtro "Pendentes" exibe ordem pendente e oculta concluída', async ({ page }) => {
    await page.getByTestId('filtro-pendente').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('TC06-ordens-filtro-pendentes.png'), fullPage: true });
    await expect(page.getByText(ORDENS_SERVICO[0].descricao).first()).toBeVisible();
    await expect(page.getByText(ORDENS_SERVICO[1].descricao)).not.toBeVisible();
  });

  test('TC07 - Filtro "Concluídas" exibe ordem concluída e oculta pendente', async ({ page }) => {
    await page.getByTestId('filtro-concluida').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('TC07-ordens-filtro-concluidas.png'), fullPage: true });
    await expect(page.getByText(ORDENS_SERVICO[1].descricao).first()).toBeVisible();
    await expect(page.getByText(ORDENS_SERVICO[0].descricao)).not.toBeVisible();
  });

  test('TC08 - Filtro "Reprovadas" exibe ordem reprovada e oculta pendente e concluída', async ({ page }) => {
    await page.getByTestId('filtro-reprovada').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('TC08-ordens-filtro-reprovadas.png'), fullPage: true });
    await expect(page.getByText(ORDENS_SERVICO[2].descricao).first()).toBeVisible();
    await expect(page.getByText(ORDENS_SERVICO[0].descricao)).not.toBeVisible();
  });

});
