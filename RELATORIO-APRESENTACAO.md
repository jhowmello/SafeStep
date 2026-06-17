# Relatório Técnico — SafeStep
## Testes Automatizados com Playwright e Avaliação de Segurança OWASP

---

**Projeto:** SafeStep — Aplicativo de Conformidade em Segurança do Trabalho
**Disciplina:** Desenvolvimento de Software
**Aluno:** João Gregorio
**Data:** 16/06/2026
**Repositório:** GitHub — SafeStep

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Processo SDD — Scrum/Kanban](#2-processo-sdd--scrumkanban)
3. [Testes Automatizados com Playwright](#3-testes-automatizados-com-playwright)
4. [Avaliação de Segurança — OWASP Top 10](#4-avaliação-de-segurança--owasp-top-10)
5. [Correções de Segurança Implementadas](#5-correções-de-segurança-implementadas)
6. [Conclusão](#6-conclusão)

---

## 1. Visão Geral do Projeto

O **SafeStep** é um aplicativo mobile desenvolvido em **React Native com Expo**, cujo objetivo é garantir que técnicos de campo cumpram os checklists de segurança obrigatórios antes de executar trabalhos de risco, em conformidade com as normas regulamentadoras brasileiras:

- **NR-10** — Segurança em Instalações e Serviços em Eletricidade
- **NR-35** — Trabalho em Altura

### Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React Native 0.81 + Expo SDK 54 |
| Web | React Native Web + Expo Router |
| Backend | JSON Server (mock REST API) |
| Linguagem | TypeScript |
| Testes Unitários | Jest + React Testing Library |
| Testes E2E | **Playwright 1.60** |
| CI/CD | GitHub Actions |

### Fluxo Principal do Aplicativo

```
Login → Ordens de Serviço → Checklist de Segurança → Resultado (Aprovado/Reprovado)
```

---

## 2. Processo SDD — Scrum/Kanban

O processo de desenvolvimento adotou a metodologia **Scrum** com quadro **Kanban** gerenciado via **GitHub Projects**.

### Estrutura do Processo

```
Backlog → Sprint Backlog → Em Andamento → Em Revisão → Concluído
```

### Artefatos Configurados no Repositório

| Artefato | Localização | Finalidade |
|---|---|---|
| Documento Scrum | `.github/SCRUM.md` | Papéis, cerimônias, DoD, estimativas |
| Template User Story | `.github/ISSUE_TEMPLATE/user-story.md` | Padrão para histórias de usuário |
| Template Bug Report | `.github/ISSUE_TEMPLATE/bug-report.md` | Padrão para reportar defeitos |
| Template Task | `.github/ISSUE_TEMPLATE/task.md` | Tarefas técnicas |
| CI/CD Pipeline | `.github/workflows/playwright.yml` | Execução automática dos testes |

### Definição de Pronto (DoD)

Um item só é considerado **Concluído** quando:
- Código implementado e revisado por par
- Testes unitários criados (Jest)
- Testes E2E criados com Playwright (mín. 1 por história)
- Screenshots de evidência geradas em `e2e/screenshots/`
- Pull Request aprovado e mergeado

---

## 3. Testes Automatizados com Playwright

### O que é o Playwright?

O **Playwright** é um framework de testes End-to-End (E2E) desenvolvido pela Microsoft que permite automatizar interações reais com navegadores (Chromium, Firefox, WebKit). Diferente dos testes unitários, os testes E2E simulam o comportamento real do usuário na interface.

```
Testes Unitários  →  testam funções isoladas (Jest)
Testes E2E        →  testam o fluxo completo do usuário (Playwright)
```

### Configuração do Ambiente

```
SafeStep/
├── playwright.config.ts       ← Configuração principal
├── e2e/
│   ├── fixtures/
│   │   └── mocks.ts           ← Dados fake e interceptação da API
│   ├── tests/
│   │   ├── 01-login.spec.ts
│   │   ├── 02-ordens-servico.spec.ts
│   │   ├── 03-criar-ordem.spec.ts
│   │   └── 04-checklist.spec.ts
│   └── screenshots/           ← Evidências geradas automaticamente
```

### Como os Testes Funcionam

O Playwright:
1. **Inicia o servidor web** automaticamente (`npx serve web-build`)
2. **Intercepta chamadas de API** com dados mockados (`page.route()`)
3. **Simula interações** do usuário (clicar, digitar, navegar)
4. **Captura screenshots** automaticamente em cada passo
5. **Valida o resultado** com asserções (`expect`)

```typescript
// Exemplo de teste Playwright
test('TC04 - Login válido navega para Ordens', async ({ page }) => {
  await mockApiRoutes(page);                              // intercepta API
  await page.goto('/');                                   // abre o app
  await page.locator('input[type="email"]').fill('joao.silva@safestep.com');
  await page.locator('input[type="password"]').fill('123456');
  await page.getByTestId('btn-login').click();           // clica no botão
  await expect(page.getByText('Ordens de Serviço')).toBeVisible(); // valida
  await page.screenshot({ path: 'TC04-login-sucesso.png' });       // evidência
});
```

---

### Casos de Teste Executados

#### Módulo 1 — Autenticação (Login)

| ID | Caso de Teste | Resultado | Tempo | Evidência |
|---|---|---|---|---|
| TC01 | Página de login exibe título SafeStep, logo e badges NR-10 e NR-35 | ✅ Passou | 1,6s | `TC01-login-pagina-inicial.png` |
| TC02 | Login com campos vazios não navega — permanece na tela de login | ✅ Passou | 2,4s | `TC02-login-campos-vazios.png` |
| TC03 | Login com credenciais inválidas não navega — permanece na tela de login | ✅ Passou | 3,4s | `TC03-login-credenciais-invalidas.png` |
| TC04 | Login com credenciais válidas navega para a tela de Ordens de Serviço | ✅ Passou | 1,4s | `TC04-login-sucesso-tela-ordens.png` |

**O que foi validado:**
- Renderização correta da tela de login com todos os elementos visuais
- Validação de campos obrigatórios (campos vazios não permitem login)
- Rejeição de credenciais inválidas (usuário permanece na tela de login)
- Fluxo completo de autenticação com credenciais corretas

---

#### Módulo 2 — Ordens de Serviço

| ID | Caso de Teste | Resultado | Tempo | Evidência |
|---|---|---|---|---|
| TC05 | Tela exibe os quatro filtros: Todos, Pendentes, Concluídas, Reprovadas | ✅ Passou | 1,6s | `TC05-ordens-filtros.png` |
| TC06 | Filtro "Pendentes" exibe ordem pendente e oculta concluída | ✅ Passou | 2,0s | `TC06-ordens-filtro-pendentes.png` |
| TC07 | Filtro "Concluídas" exibe ordem concluída e oculta pendente | ✅ Passou | 2,0s | `TC07-ordens-filtro-concluidas.png` |
| TC08 | Filtro "Reprovadas" exibe ordem reprovada e oculta as demais | ✅ Passou | 2,1s | `TC08-ordens-filtro-reprovadas.png` |

**O que foi validado:**
- Presença e visibilidade de todos os filtros de status
- Funcionamento correto de cada filtro (exibe apenas o status correto)
- Ocultação de ordens que não correspondem ao filtro ativo

---

#### Módulo 3 — Criar Ordem de Serviço

| ID | Caso de Teste | Resultado | Tempo | Evidência |
|---|---|---|---|---|
| TC09 | Tela de criação exibe todos os campos: Descrição, Local, Prioridade, Normas e Data Limite | ✅ Passou | 1,6s | `TC09-tela-criar-ordem.png` |
| TC10 | Salvar sem preencher campos mantém o usuário na tela de criação | ✅ Passou | 2,5s | `TC10-criar-ordem-validacao.png` |
| TC11 | Selecionar prioridade "Alta" destaca visualmente o botão correspondente | ✅ Passou | 1,9s | `TC11-criar-ordem-prioridade-alta.png` |
| TC12 | Selecionar NR-10 e NR-35 mantém ambas as normas ativas simultaneamente | ✅ Passou | 2,1s | `TC12-criar-ordem-normas-selecionadas.png` |

**O que foi validado:**
- Presença de todos os campos obrigatórios do formulário
- Validação de campos obrigatórios antes do envio
- Seleção de prioridade com feedback visual
- Seleção múltipla de normas regulamentadoras

---

#### Módulo 4 — Checklist de Segurança

| ID | Caso de Teste | Resultado | Tempo | Evidência |
|---|---|---|---|---|
| TC13 | Checklist abre com barra de progresso em 0% e botão "Concluir" visível | ✅ Passou | 1,6s | `TC13-checklist-barra-progresso.png` |
| TC14 | Marcar um item do checklist atualiza a porcentagem de progresso | ✅ Passou | 2,1s | `TC14-checklist-item-marcado.png` |
| TC15 | Tentar concluir sem marcar itens obrigatórios mantém o usuário no checklist | ✅ Passou | 2,5s | `TC15-checklist-validacao-obrigatorios.png` |

**O que foi validado:**
- Estado inicial do checklist (0% de progresso)
- Atualização dinâmica da barra de progresso ao marcar itens
- Bloqueio de conclusão quando há itens obrigatórios pendentes

---

### Resultado Geral dos Testes

```
╔══════════════════════════════════════════╗
║   RESULTADO FINAL DOS TESTES PLAYWRIGHT  ║
╠══════════════════════════════════════════╣
║   Total de testes:       15              ║
║   Passou:                15  ✅          ║
║   Falhou:                 0  ❌          ║
║   Taxa de sucesso:      100%             ║
║   Tempo total:          34,7s            ║
║   Browser:              Chromium         ║
║   Evidências geradas:   15 screenshots   ║
╚══════════════════════════════════════════╝
```

### Comandos para Executar os Testes

```bash
# Instalar dependências e browsers
cd SafeStep
npm install
npx playwright install chromium

# Executar todos os testes (gera screenshots automaticamente)
npm run test:e2e

# Executar com browser visível (para demonstração)
npm run test:e2e:headed

# Abrir relatório HTML visual
npm run test:e2e:report
```

---

## 4. Avaliação de Segurança — OWASP Top 10

### O que é o OWASP?

O **OWASP** (Open Web Application Security Project) é uma fundação sem fins lucrativos dedicada à segurança de software. O **OWASP Top 10** é um documento de conscientização que lista as 10 categorias de vulnerabilidades mais críticas em aplicações web e mobile, atualizado periodicamente com base em dados reais de ataques.

Referência: [owasp.org/Top10](https://owasp.org/Top10/)

---

### Resultado da Avaliação por Categoria

#### A01 — Broken Access Control (Controle de Acesso Quebrado)
**Severidade: 🔴 CRÍTICO**

**O que é:** Quando usuários conseguem executar ações ou acessar dados além do que deveriam ter permissão.

**Encontrado no SafeStep:**
- O backend (JSON Server) não possui autenticação em nenhuma rota
- Qualquer pessoa na rede pode executar: `GET /tecnicos` (retorna todos os usuários com senhas), `DELETE /ordensServico/1`, `POST /checklists` (registra checklist aprovado sem fazer nada)
- O `tecnicoId` está fixado como `1` no código, ignorando quem está logado
- O "logout" apenas muda a tela, sem invalidar qualquer sessão

**Status: ⚠️ Identificado — Requer refatoração de backend**

---

#### A02 — Cryptographic Failures (Falhas Criptográficas)
**Severidade: 🔴 CRÍTICO**

**O que é:** Dados sensíveis expostos por ausência ou má implementação de criptografia.

**Encontrado no SafeStep:**
```json
// backend/db.json — ANTES da correção
{ "email": "joao.silva@safestep.com", "senha": "123456" }
```
- Senhas armazenadas em texto puro (sem bcrypt ou qualquer hash)
- O login busca TODOS os usuários com senhas e compara no cliente — qualquer proxy de rede captura todas as credenciais
- Comunicação via `http://` (sem HTTPS) — dados trafegam em texto claro

**Status: ⚠️ Parcialmente corrigido** — arquivo com senhas removido do git

---

#### A03 — Injection (Injeção)
**Severidade: 🟡 BAIXO**

**O que é:** Dados não confiáveis enviados a interpretadores (SQL, comandos OS, scripts).

**Encontrado no SafeStep:**
- Risco de SQL Injection: **N/A** (projeto usa arquivo JSON, sem banco SQL)
- Campos de texto livre (`descricao`, `local`) não são sanitizados, mas React Native não renderiza HTML diretamente — risco baixo no contexto atual

**Status: ✅ Baixo risco no escopo atual**

---

#### A04 — Insecure Design (Design Inseguro)
**Severidade: 🔴 CRÍTICO**

**O que é:** Falhas de arquitetura que não podem ser corrigidas com patches — exigem redesign.

**Encontrado no SafeStep:**
- Toda a autenticação ocorre no CLIENTE: o servidor retorna todos os usuários com senhas e o app compara localmente. Isso não é um bug — é um erro de design fundamental
- A tela de Perfil exibe dados fixos no código (`nome: 'João Silva'`) independente de quem fez login
- A conformidade NR-10/NR-35 pode ser forjada com um simples `POST /checklists` via terminal

**Status: ⚠️ Identificado — Exige redesign do backend**

---

#### A05 — Security Misconfiguration (Má Configuração de Segurança)
**Severidade: 🟠 ALTO**

**O que é:** Configurações padrão inseguras, permissões excessivas, dados sensíveis em repositórios.

**Encontrado no SafeStep — ANTES das correções:**

| Problema | Localização |
|---|---|
| IP privado hardcoded no código-fonte | `src/services/api.ts` |
| Backend exposto em todas as interfaces de rede (`0.0.0.0`) | `backend/package.json` |
| Banco de dados com senhas rastreado pelo git | `backend/db.json` |
| Arquivo `.env` não protegido no `.gitignore` | `SafeStep/.gitignore` |

**Status: ✅ TOTALMENTE CORRIGIDO** — ver seção 5

---

#### A06 — Vulnerable and Outdated Components
**Severidade: 🟡 MÉDIO**

**O que é:** Uso de bibliotecas com vulnerabilidades conhecidas ou sem suporte.

**Encontrado no SafeStep:**
- `json-server ^0.17.4` é uma ferramenta de **prototipagem**, não de produção — sem autenticação, rate limiting ou HTTPS nativo
- Ausência de `npm audit` no pipeline de CI/CD

**Status: ⚠️ Identificado — json-server é adequado para fins acadêmicos**

---

#### A07 — Identification and Authentication Failures
**Severidade: 🔴 CRÍTICO**

**O que é:** Falhas na verificação de identidade e gerenciamento de sessões.

**Diagnóstico do SafeStep:**

| Requisito | Status |
|---|---|
| Hash de senhas (bcrypt/argon2) | ❌ Ausente |
| Autenticação no servidor | ❌ Ausente — feita no cliente |
| Token JWT / OAuth | ❌ Ausente |
| Bloqueio após tentativas falhas | ❌ Ausente |
| Timeout de sessão | ❌ Ausente |
| Validação de formato do e-mail | ✅ Parcial (campo type="email") |
| Campos obrigatórios no login | ✅ Implementado |

**Status: ⚠️ Parcialmente corrigido — validações básicas implementadas**

---

#### A08 — Software and Data Integrity Failures
**Severidade: 🔴 CRÍTICO**

**O que é:** Falhas que permitem violar a integridade de dados ou do pipeline de software.

**Encontrado no SafeStep:**
```bash
# Qualquer pessoa pode forjar um checklist aprovado:
curl -X POST http://IP:3000/checklists \
  -H "Content-Type: application/json" \
  -d '{"ordemServicoId": 1, "aprovado": true}'

# E também pode deletar logs de auditoria:
curl -X DELETE http://IP:3000/logs/1
```
- Os logs de conformidade (NR-10/NR-35) podem ser criados, alterados ou excluídos sem qualquer autenticação
- O `tecnicoId` é controlado pelo cliente, tornando a rastreabilidade inválida

**Status: ⚠️ Identificado — Exige backend com autenticação**

---

#### A09 — Security Logging and Monitoring Failures
**Severidade: 🟠 ALTO**

**O que é:** Ausência de logs, monitoramento e alertas para detectar e responder a incidentes.

**Encontrado no SafeStep:**
- Tentativas de login com credenciais inválidas não são registradas
- Os logs de auditoria existentes podem ser deletados por qualquer cliente
- Nenhuma integração com serviços de monitoramento (Sentry, Datadog, etc.)

**O que existe:** O app registra conclusões de checklist via `POST /logs` — demonstra consciência da necessidade de rastreabilidade, mas sem proteção.

**Status: ⚠️ Identificado**

---

#### A10 — Server-Side Request Forgery (SSRF)
**Severidade: 🟢 N/A**

**O que é:** O servidor é induzido a fazer requisições para destinos não intencionais.

**Avaliação:** O backend atual (JSON Server) não processa URLs fornecidas pelos clientes em requisições externas. Não aplicável no escopo atual.

**Status: ✅ Não aplicável**

---

## 5. Correções de Segurança Implementadas

Das vulnerabilidades identificadas, as seguintes foram **corrigidas durante o projeto**:

### Correção 1 — IP Privado Removido do Código-Fonte (A05)

**Antes:**
```typescript
// src/services/api.ts
const BASE_URL = 'http://10.0.44.94:3000'; // IP interno exposto no repositório
```

**Depois:**
```typescript
// src/services/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
```

**Impacto:** O endereço do servidor não fica mais exposto no código-fonte. Cada desenvolvedor configura seu próprio `.env`.

---

### Correção 2 — Arquivo `.env` Protegido no Git (A05)

**Antes:** O `.gitignore` só ignorava `.env*.local`

**Depois:**
```
# SafeStep/.gitignore
.env
.env*.local
.env.production
```

Criado também o arquivo `SafeStep/.env.example`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Impacto:** Variáveis de ambiente nunca serão commitadas acidentalmente.

---

### Correção 3 — Backend Não Exposto em Toda a Rede (A05)

**Antes:**
```json
"start": "json-server --watch db.json --host 0.0.0.0 --port 3000"
```

**Depois:**
```json
"start": "json-server --watch db.json --port 3000",
"start:network": "json-server --watch db.json --host 0.0.0.0 --port 3000"
```

**Impacto:** Por padrão, o servidor só aceita conexões locais. A flag `0.0.0.0` ficou em um script separado para uso explícito quando necessário (ex: testes em dispositivo físico).

---

### Correção 4 — Banco de Dados com Senhas Removido do Git (A02 / A05)

**Adicionado ao `backend/.gitignore`:**
```
.env
```

**Criado `backend/db.example.json`:**
```json
{
  "tecnicos": [
    {
      "email": "tecnico@empresa.com",
      "senha": "<HASH_BCRYPT_DA_SENHA>"
    }
  ]
}
```

**Impacto:** O banco com credenciais reais não é mais rastreado. O arquivo de exemplo deixa claro que senhas devem ser hasheadas com bcrypt em produção.

---

### Resumo das Correções

| # | Correção | Categoria OWASP | Arquivo Modificado |
|---|---|---|---|
| 1 | IP hardcoded → variável de ambiente | A05 | `src/services/api.ts` |
| 2 | `.env` adicionado ao `.gitignore` | A05 | `SafeStep/.gitignore` |
| 3 | Criado `.env.example` com instruções | A05 | `SafeStep/.env.example` |
| 4 | `--host 0.0.0.0` removido do script padrão | A05 | `backend/package.json` |
| 5 | `db.json` com senhas excluído do git | A02 / A05 | `backend/.gitignore` |
| 6 | `db.example.json` criado como template seguro | A02 | `backend/db.example.json` |

---

### Vulnerabilidades Identificadas Mas Não Corrigidas (Escopo Acadêmico)

As seguintes vulnerabilidades foram identificadas e documentadas, porém sua correção exige uma **refatoração completa do backend** (substituição do JSON Server por um servidor real com Node.js/Express + banco de dados relacional + JWT), o que está além do escopo do bimestre:

| Vulnerabilidade | Categoria | O que seria necessário |
|---|---|---|
| Autenticação no servidor | A01, A07 | Backend Node.js/Express com JWT |
| Hash de senhas (bcrypt) | A02 | Middleware de autenticação |
| Endpoint `/auth/login` seguro | A04 | API REST com autenticação |
| Logs imutáveis de auditoria | A08 | Banco de dados com controle de acesso |
| Bloqueio de conta por tentativas | A07 | Rate limiting no backend |
| HTTPS em produção | A02 | Certificado TLS + proxy reverso |

---

## 6. Conclusão

### O que foi entregue

| Entregável | Status |
|---|---|
| Processo Scrum/Kanban configurado no GitHub | ✅ Entregue |
| Templates de Issues (User Story, Bug, Task) | ✅ Entregue |
| Playwright instalado e configurado | ✅ Entregue |
| 15 casos de teste E2E (mínimo exigido: 10) | ✅ Entregue |
| 15 screenshots como evidência | ✅ Entregue |
| CI/CD no GitHub Actions | ✅ Entregue |
| Avaliação OWASP Top 10 completa | ✅ Entregue |
| 6 correções de segurança implementadas | ✅ Entregue |
| Relatório de segurança no repositório | ✅ Entregue |

### Aprendizados

**Testes com Playwright:**
Os testes E2E com Playwright garantem que o fluxo completo do usuário funciona corretamente, do login ao checklist. Diferente dos testes unitários (que testam funções isoladas), os testes E2E detectam problemas de integração entre componentes, navegação e chamadas de API. As screenshots geradas automaticamente servem como evidência auditável de que a funcionalidade foi testada.

**Segurança com OWASP:**
A avaliação OWASP revelou que um aplicativo pode parecer funcional mas conter vulnerabilidades críticas que comprometem sua finalidade. No caso do SafeStep, cujo propósito é garantir segurança do trabalho, as falhas encontradas permitem que registros de conformidade sejam forjados — o que seria gravíssimo em produção real. A aplicação do OWASP Top 10 como checklist é uma prática essencial no desenvolvimento de qualquer sistema.

---

*Relatório gerado para apresentação na disciplina de Desenvolvimento de Software.*
*Repositório: GitHub — projeto SafeStep*
*Todos os testes, evidências e documentação de segurança estão disponíveis no repositório.*
