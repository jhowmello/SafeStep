import { expect, Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

// Senha de teste usada por todos os técnicos mockados (não representa o hash
// real armazenado pelo backend - o login é simulado via mock de /auth/login).
const SENHA_TESTE = 'MinhaSenh@123';

export const TECNICOS = [
  { id: 1, nome: 'João Silva', matricula: 'TEC123', email: 'joao.silva@safestep.com', senha: SENHA_TESTE, cargo: 'Eletricista' },
  { id: 2, nome: 'Maria Souza', matricula: 'TEC456', email: 'maria.souza@safestep.com', senha: SENHA_TESTE, cargo: 'Instaladora de Fibra' },
  { id: 3, nome: 'Carlos Mendes', matricula: 'TEC789', email: 'carlos.mendes@safestep.com', senha: SENHA_TESTE, cargo: 'Técnico de Manutenção' },
];

export const ORDENS_SERVICO = [
  { id: 1, descricao: 'Instalação de fibra óptica', local: 'Poste 45 - Rua das Flores', tecnicoId: 1, status: 'pendente', prioridade: 'media', normas: ['NR-10'], episObrigatorios: [1, 2], dataCriacao: '2026-06-01', dataLimite: '2026-06-10' },
  { id: 2, descricao: 'Manutenção em quadro elétrico', local: 'Subestação Centro - Bloco B', tecnicoId: 2, status: 'concluida', prioridade: 'alta', normas: ['NR-10'], episObrigatorios: [1, 2, 4], dataCriacao: '2026-04-19', dataLimite: '2026-04-20' },
  { id: 3, descricao: 'Trabalho em altura - Torre', local: 'Torre Setor Norte', tecnicoId: 3, status: 'reprovada', prioridade: 'critica', normas: ['NR-35', 'NR-10'], episObrigatorios: [1, 2, 3], dataCriacao: '2026-04-19', dataLimite: '2026-04-21' },
];

export const CHECKLIST_ITENS = [
  { id: 1, descricao: 'EPIs estão em boas condições?', norma: 'NR-6', obrigatorio: true },
  { id: 2, descricao: 'Área de trabalho isolada e sinalizada?', norma: 'NR-10', obrigatorio: true },
  { id: 3, descricao: 'Equipamentos elétricos desligados e bloqueados?', norma: 'NR-10', obrigatorio: true },
  { id: 4, descricao: 'Linha de vida e cinto de segurança instalados?', norma: 'NR-35', obrigatorio: true },
  { id: 5, descricao: 'Condições climáticas seguras para trabalho em altura?', norma: 'NR-35', obrigatorio: true },
  { id: 6, descricao: 'CA dos EPIs estão dentro da validade?', norma: 'NR-6', obrigatorio: true },
  { id: 7, descricao: 'Comunicação com a equipe de segurança realizada?', norma: 'NR-10', obrigatorio: false },
];

export async function mockApiRoutes(page: Page) {
  page.on('dialog', d => d.dismiss().catch(() => {}));

  await page.route(`${BASE}/tecnicos`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TECNICOS) })
  );
  await page.route(`${BASE}/auth/login`, route => {
    const corpo = JSON.parse(route.request().postData() ?? '{}');
    const tecnico = TECNICOS.find(
      t => t.email === corpo.email && t.senha === corpo.senha
    );
    if (!tecnico) {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ erro: 'E-mail ou senha invalidos.' }) });
    }
    const { senha, ...dadosPublicos } = tecnico;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dadosPublicos) });
  });
  await page.route(`${BASE}/auth/register`, route => {
    const corpo = JSON.parse(route.request().postData() ?? '{}');
    const novo = { id: 99, nome: corpo.nome, matricula: corpo.matricula, email: corpo.email, cargo: corpo.cargo };
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(novo) });
  });
  await page.route(`${BASE}/ordensServico`, route => {
    if (route.request().method() === 'POST') {
      const nova = { id: 99, status: 'pendente', ...JSON.parse(route.request().postData() ?? '{}') };
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(nova) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ORDENS_SERVICO) });
  });
  await page.route(`${BASE}/ordensServico/1`, route => {
    if (route.request().method() === 'PATCH')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...ORDENS_SERVICO[0], status: 'concluida' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ORDENS_SERVICO[0]) });
  });
  await page.route(`${BASE}/checklistItens`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CHECKLIST_ITENS) })
  );
  await page.route(`${BASE}/checklists`, route =>
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 10 }) })
  );
  await page.route(`${BASE}/logs`, route =>
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 10 }) })
  );
}

export async function login(page: Page) {
  await mockApiRoutes(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"]').fill(TECNICOS[0].email);
  await page.locator('input[type="password"]').fill(TECNICOS[0].senha);
  await page.getByTestId('btn-login').click();
  await expect(page.getByText('Ordens de Serviço').first()).toBeVisible({ timeout: 8000 });
}

export { expect };
