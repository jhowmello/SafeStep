# Testes E2E com Playwright — SafeStep

## Pré-requisitos

```bash
# Na pasta SafeStep/
npm install
npx playwright install chromium
```

## Como Executar

```bash
# Todos os testes (inicia o servidor Expo Web automaticamente)
npm run test:e2e

# Com interface gráfica (modo UI)
npm run test:e2e:ui

# Com browser visível
npm run test:e2e:headed

# Ver relatório HTML após execução
npm run test:e2e:report
```

> **Nota:** O Playwright inicia o servidor `expo start --web` automaticamente na porta 8081.
> Todas as chamadas de API são interceptadas por mocks, não é necessário o backend rodando.

---

## Casos de Teste

### 01-login.spec.ts — Autenticação

| ID | Caso de Teste | Evidência |
|---|---|---|
| TC01 | Página de login exibe título, logo e badges NR-10 e NR-35 | `TC01-login-pagina-inicial.png` |
| TC02 | Login com campos vazios não navega — permanece na tela de login | `TC02-login-campos-vazios.png` |
| TC03 | Login com credenciais inválidas não navega — permanece na tela de login | `TC03-login-credenciais-invalidas.png` |
| TC04 | Login com credenciais válidas navega para a tela de Ordens | `TC04-login-sucesso-tela-ordens.png` |

### 02-ordens-servico.spec.ts — Ordens de Serviço

| ID | Caso de Teste | Evidência |
|---|---|---|
| TC05 | Tela de ordens exibe filtros: Todos, Pendentes, Concluídas, Reprovadas | `TC05-ordens-filtros.png` |
| TC06 | Filtro "Pendentes" exibe apenas ordens com status pendente | `TC06-ordens-filtro-pendentes.png` |
| TC07 | Filtro "Concluídas" exibe apenas ordens concluídas | `TC07-ordens-filtro-concluidas.png` |
| TC08 | Filtro "Reprovadas" exibe apenas ordens reprovadas | `TC08-ordens-filtro-reprovadas.png` |

### 03-criar-ordem.spec.ts — Criar Ordem de Serviço

| ID | Caso de Teste | Evidência |
|---|---|---|
| TC09 | Tela de criação exibe campos Descrição, Local, Prioridade, Normas e Data Limite | `TC09-tela-criar-ordem.png` |
| TC10 | Salvar sem preencher campos mantém usuário na tela de criação | `TC10-criar-ordem-validacao.png` |
| TC11 | Seleção de prioridade "Alta" é destacada visualmente | `TC11-criar-ordem-prioridade-alta.png` |
| TC12 | Seleção de normas NR-10 e NR-35 marca ambas | `TC12-criar-ordem-normas-selecionadas.png` |

### 04-checklist.spec.ts — Checklist de Segurança

| ID | Caso de Teste | Evidência |
|---|---|---|
| TC13 | Checklist exibe barra de progresso em 0% ao abrir | `TC13-checklist-barra-progresso.png` |
| TC14 | Marcar item no checklist atualiza porcentagem de progresso | `TC14-checklist-item-marcado.png` |
| TC15 | Concluir sem itens obrigatórios mantém usuário no checklist | `TC15-checklist-validacao-obrigatorios.png` |

---

## Estrutura de Arquivos

```
e2e/
├── fixtures/
│   └── mocks.ts          # Dados mockados e helpers de login
├── tests/
│   ├── 01-login.spec.ts
│   ├── 02-ordens-servico.spec.ts
│   ├── 03-criar-ordem.spec.ts
│   └── 04-checklist.spec.ts
├── screenshots/           # Evidências geradas automaticamente
└── README.md
```

## Screenshots (Evidências)

As screenshots são salvas automaticamente em `e2e/screenshots/` a cada execução.
O relatório HTML completo é gerado em `playwright-report/`.

---

## CI/CD

Os testes rodam automaticamente no GitHub Actions a cada push nas branches `main`, `master` e `develop`.
As evidências são salvas como artefatos do workflow e ficam disponíveis por 30 dias.

Ver: [`.github/workflows/playwright.yml`](../.github/workflows/playwright.yml)
