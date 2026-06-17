import { test, expect } from '@playwright/test';
import { login, ORDENS_SERVICO, CHECKLIST_ITENS } from '../fixtures/mocks';
import path from 'path';

const ss = (name: string) => path.join(__dirname, '..', 'screenshots', name);

async function abrirChecklist(page: any) {
  await login(page);
  await page.getByText(ORDENS_SERVICO[0].descricao).first().click();
  await expect(page.getByTestId('btn-concluir-checklist')).toBeVisible({ timeout: 6000 });
}

test.describe('TC13 a TC15 — Checklist de Segurança', () => {

  test.beforeEach(async ({ page }) => {
    page.on('dialog', d => d.dismiss().catch(() => {}));
  });

  test('TC13 - Checklist exibe barra de progresso em 0% ao abrir', async ({ page }) => {
    await abrirChecklist(page);
    await expect(page.getByText('0%').first()).toBeVisible();
    await expect(page.getByTestId('btn-concluir-checklist')).toBeVisible();
    await page.screenshot({ path: ss('TC13-checklist-barra-progresso.png'), fullPage: true });
  });

  test('TC14 - Marcar item do checklist aumenta porcentagem de progresso', async ({ page }) => {
    await abrirChecklist(page);
    await page.getByText(CHECKLIST_ITENS[0].descricao).first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ss('TC14-checklist-item-marcado.png'), fullPage: true });
    await expect(page.locator('text=/[1-9][0-9]?%/').first()).toBeVisible();
  });

  test('TC15 - Concluir sem itens obrigatórios mantém usuário no checklist', async ({ page }) => {
    await abrirChecklist(page);
    await page.getByTestId('btn-concluir-checklist').click();
    await page.waitForTimeout(800);
    await expect(page.getByTestId('btn-concluir-checklist')).toBeVisible();
    await page.screenshot({ path: ss('TC15-checklist-validacao-obrigatorios.png'), fullPage: true });
  });

});
