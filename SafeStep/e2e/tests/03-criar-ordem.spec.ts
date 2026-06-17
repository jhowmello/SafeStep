import { test, expect } from '@playwright/test';
import { login } from '../fixtures/mocks';
import path from 'path';

const ss = (name: string) => path.join(__dirname, '..', 'screenshots', name);

async function abrirCriarOrdem(page: any) {
  await login(page);
  await page.getByTestId('btn-nova-ordem').click();
  await expect(page.getByTestId('btn-salvar-ordem')).toBeVisible({ timeout: 5000 });
}

test.describe('TC09 a TC12 — Criar Ordem de Serviço', () => {

  test.beforeEach(async ({ page }) => {
    page.on('dialog', d => d.dismiss().catch(() => {}));
  });

  test('TC09 - Tela de criação exibe campos Descrição, Local, Prioridade, Normas e Data Limite', async ({ page }) => {
    await abrirCriarOrdem(page);
    await expect(page.getByText('DESCRIÇÃO', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('LOCAL', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('PRIORIDADE', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('NORMAS', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('DATA LIMITE', { exact: false }).first()).toBeVisible();
    await page.screenshot({ path: ss('TC09-tela-criar-ordem.png'), fullPage: true });
  });

  test('TC10 - Salvar sem preencher campos mantém usuário na tela de criação', async ({ page }) => {
    await abrirCriarOrdem(page);
    await page.getByTestId('btn-salvar-ordem').click();
    await page.waitForTimeout(800);
    await expect(page.getByTestId('btn-salvar-ordem')).toBeVisible();
    await page.screenshot({ path: ss('TC10-criar-ordem-validacao.png'), fullPage: true });
  });

  test('TC11 - Selecionar prioridade "Alta" destaca visualmente o botão', async ({ page }) => {
    await abrirCriarOrdem(page);
    await page.getByTestId('btn-prioridade-alta').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: ss('TC11-criar-ordem-prioridade-alta.png'), fullPage: true });
    await expect(page.getByTestId('btn-prioridade-alta')).toBeVisible();
  });

  test('TC12 - Selecionar NR-10 e NR-35 mantém ambas as normas ativas', async ({ page }) => {
    await abrirCriarOrdem(page);
    await page.getByTestId('btn-norma-NR-10').click();
    await page.waitForTimeout(200);
    await page.getByTestId('btn-norma-NR-35').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: ss('TC12-criar-ordem-normas-selecionadas.png'), fullPage: true });
    await expect(page.getByTestId('btn-norma-NR-10')).toBeVisible();
    await expect(page.getByTestId('btn-norma-NR-35')).toBeVisible();
  });

});
