# Relatório de Segurança — SafeStep
**Padrão:** OWASP Top 10 (2021)
**Projeto:** SafeStep — Aplicativo de Conformidade em Segurança do Trabalho (NR-10 / NR-35)
**Data da Avaliação:** 16/06/2026
**Responsável:** João Gregorio

---

## Sumário Executivo

Este relatório documenta a avaliação de segurança do projeto SafeStep com base nas **10 categorias de vulnerabilidade do OWASP Top 10 (2021)**. Para cada categoria foi identificada a presença de vulnerabilidade, descrita a evidência técnica no código e indicado o status de resolução.

| # | Categoria OWASP | Severidade | Status |
|---|---|---|---|
| A01 | Broken Access Control | 🔴 Crítico | ⚠️ Parcialmente Resolvido |
| A02 | Cryptographic Failures | 🔴 Crítico | ✅ Resolvido (cadastro/login) |
| A03 | Injection | 🟡 Baixo | ✅ Mitigado / Baixo Risco |
| A04 | Insecure Design | 🔴 Crítico | ⚠️ Parcialmente Resolvido |
| A05 | Security Misconfiguration | 🟠 Alto | ✅ Resolvido |
| A06 | Vulnerable and Outdated Components | 🟡 Médio | ⚠️ Identificado |
| A07 | Identification and Authentication Failures | 🔴 Crítico | ✅ Resolvido (cadastro/login) |
| A08 | Software and Data Integrity Failures | 🔴 Crítico | ⚠️ Identificado / Escopo Acadêmico |
| A09 | Security Logging and Monitoring Failures | 🟠 Alto | ⚠️ Parcialmente Resolvido |
| A10 | Server-Side Request Forgery (SSRF) | 🟢 N/A | ✅ Não Aplicável |

---

## A01 — Broken Access Control

### Descrição
Ocorre quando usuários conseguem agir fora de suas permissões pretendidas. É a categoria mais crítica do OWASP 2021.

### Vulnerabilidades Encontradas

**1. Backend sem autenticação nas rotas**
O servidor `json-server` não possui middleware de autenticação. Qualquer cliente com acesso à rede pode:
- `GET /tecnicos` → retorna todos os usuários com senhas em texto plano
- `DELETE /ordensServico/:id` → exclui qualquer ordem sem verificar identidade
- `POST /checklists` → registra checklist aprovado sem autenticação

**2. `tecnicoId` hardcoded no cliente**
Nos arquivos `src/screens/CriarOrdemScreen.tsx` (linha 73) e `src/screens/ChecklistScreen.tsx` (linha 139), o campo `tecnicoId` é fixado como `1`, independentemente de quem está autenticado. Isso invalida completamente a rastreabilidade de auditoria.

**3. Logout sem invalidação de sessão**
O botão "Sair" em `src/screens/PerfilScreen.tsx` apenas navega para a tela de Login (`navigation.replace('Login')`), sem limpar tokens ou estado de sessão.

**4. Escrita direta em `/tecnicos` (mitigado nesta entrega)**
Antes desta correção, qualquer cliente podia `POST/PUT/PATCH/DELETE /tecnicos` diretamente pelo router genérico do json-server, contornando qualquer validação de cadastro.

### Status: ⚠️ Parcialmente Resolvido

| Item | Status | Ação Tomada |
|---|---|---|
| Middleware JWT no backend | ❌ Pendente | Requer refatoração do backend (fora do escopo do bimestre) |
| tecnicoId dinâmico | ❌ Pendente | Depende de implementar JWT primeiro |
| Logout com limpeza de estado | ❌ Pendente | Depende de implementar JWT primeiro |
| Bloqueio de escrita direta em `/tecnicos` | ✅ Resolvido | `backend/server.js` (`bloquearEscritaDiretaTecnicos`) retorna 405 para `POST/PUT/PATCH/DELETE` em `/tecnicos`; cadastro só é possível via `/auth/register` |
| Resposta de `/tecnicos` sem campos sensíveis | ✅ Resolvido | `backend/server.js` (`interceptarRespostaTecnicos`) remove `senha`/`senhaHash` de toda resposta da rota |

**Recomendação para produção:** Implementar autenticação JWT com middleware em todas as rotas do backend. O `tecnicoId` deve ser extraído do token no servidor, nunca aceito do cliente.

---

## A02 — Cryptographic Failures

### Descrição
Falhas relacionadas à proteção de dados sensíveis em trânsito e em repouso, especialmente credenciais.

### Vulnerabilidades Encontradas

**1. Senhas armazenadas em texto plano**
O arquivo `backend/db.json` contém as senhas de todos os técnicos sem nenhum hash:
```json
{ "email": "joao.silva@safestep.com", "senha": "123456" }
```

**2. Autenticação expõe todas as senhas**
O fluxo de login em `src/screens/LoginScreen.tsx` busca `/tecnicos` (que retorna todos os usuários com senhas) e faz a comparação no cliente. Qualquer proxy de rede intercepta todas as credenciais.

**3. Comunicação sem HTTPS**
A URL base configurada usa protocolo `http://`, transmitindo dados sensíveis em texto claro.

### Status: ✅ Resolvido (cadastro/login)

| Item | Status | Ação Tomada |
|---|---|---|
| Hash de senhas | ✅ Resolvido | `backend/lib/passwordHash.js` usa `crypto.scrypt` (nativo do Node, sem dependência externa) com salt aleatório de 16 bytes por usuário (N=2^16, r=8, p=1, 64 bytes de saída), no formato `scrypt$N$r$p$salt$hash`. Não há mais campo `senha` em texto puro em nenhuma resposta ou registro novo. |
| Migração de senhas legadas | ✅ Resolvido | `backend/server.js` (`migrarSenhasEmTextoPuro`) converte, na inicialização do servidor, qualquer `senha` em texto puro remanescente em `db.json` para `senhaHash`, removendo o campo original. Idempotente. |
| Comparação de senha em tempo constante | ✅ Resolvido | `verifyPassword` em `passwordHash.js` usa `crypto.timingSafeEqual` e um hash dummy fixo quando o usuário não existe, evitando enumeração de contas por tempo de resposta. |
| Endpoint de login no servidor | ✅ Resolvido | `POST /auth/login` em `backend/server.js`: a comparação de senha agora ocorre inteiramente no servidor; o cliente nunca mais busca a lista de técnicos com senhas (`SafeStep/src/services/auth.ts`, `loginTecnico`). |
| HTTPS em produção | ❌ Pendente | Aplicável somente em ambiente de produção, fora do escopo de um servidor de desenvolvimento local |
| Senhas removidas do código-fonte | ✅ Resolvido | `db.json` removido do rastreamento git via `.gitignore` atualizado; arquivo `db.example.json` criado com instruções |

**Arquivo adicionado ao `.gitignore`:** `backend/.gitignore` atualizado.
**Arquivo de referência criado:** `backend/db.example.json` com o campo `senhaHash` (gerado automaticamente pelo backend, nunca definido manualmente).

---

## A03 — Injection

### Descrição
Injeção de código malicioso (SQL, NoSQL, comandos OS, XSS) por meio de entradas não sanitizadas.

### Vulnerabilidades Encontradas

**1. Sem sanitização de inputs (baixo risco atual)**
Os campos `descricao` e `local` em `CriarOrdemScreen.tsx` não são sanitizados antes de serem enviados à API. No contexto atual (React Native), o risco de XSS é baixo pois os dados são renderizados por componentes nativos (`Text`), não como HTML.

**2. Prototype Pollution via json-server**
A versão `0.17.4` do json-server aceita queries como `?__proto__[field]=value`, o que pode causar poluição de protótipo JavaScript.

**3. Cadastro de usuários sem validação (mitigado nesta entrega)**
Antes desta correção, não havia validação de formato/tamanho para nome, matrícula, e-mail ou cargo em nenhuma rota.

### Status: ✅ Mitigado / Baixo Risco

| Item | Status | Observação |
|---|---|---|
| SQL Injection | ✅ N/A | Projeto usa json-server (arquivo JSON), sem banco SQL |
| XSS (versão mobile) | ✅ Mitigado | React Native não renderiza HTML diretamente |
| XSS (versão web) | ⚠️ Atenção | Se dados forem renderizados em contexto HTML no Expo Web, sanitização é necessária |
| Prototype Pollution | ⚠️ Atenção | Inerente ao json-server 0.17.x — mitigado na produção substituindo por backend real |
| Validação/sanitização em `/auth/register` | ✅ Resolvido | `backend/lib/sanitize.js` valida formato e tamanho de nome (`\p{L}` Unicode), matrícula, e-mail e cargo, remove caracteres de controle e limita o payload a 15kb (`express.json({ limit: '15kb' })` em `server.js`) |

---

## A04 — Insecure Design

### Descrição
Falhas na arquitetura e design do sistema que não podem ser corrigidas apenas com implementação — requerem mudança no modelo.

### Vulnerabilidades Encontradas

**1. Autenticação inteiramente no cliente (mitigado para login/cadastro)**
O design anterior colocava toda a lógica de autenticação no frontend (comparação de senha em texto puro feita no app). Login e cadastro agora são decididos exclusivamente pelo servidor (`POST /auth/login`, `POST /auth/register`); sessão/token (JWT) ainda não foi implementada — apenas a decisão de "credenciais válidas ou não" migrou para o backend.

**2. Perfil hardcoded — sem contexto de sessão**
`src/screens/PerfilScreen.tsx` exibe dados fixos no código (`nome: 'João Silva'`), não refletindo o usuário autenticado. Qualquer pessoa logada vê o perfil do mesmo técnico.

**3. Conformidade NR-10/NR-35 forjável**
Como o endpoint `/checklists` não exige autenticação, qualquer pessoa pode registrar um checklist aprovado via requisição HTTP direta, sem realizar nenhum item de segurança. Isso compromete o propósito central do aplicativo.

### Status: ⚠️ Parcialmente Resolvido

| Item | Status | Observação |
|---|---|---|
| Decisão de autenticação no servidor (login/cadastro) | ✅ Resolvido | `backend/server.js` (`/auth/login`, `/auth/register`); cliente não compara mais senhas localmente |
| Sessão com token (JWT) | ❌ Fora do escopo | Requer backend com Express/Node + JWT (projeto futuro); hoje o app apenas navega para `HomeTabs` após um 200 de `/auth/login`, sem token |
| Perfil baseado em sessão real | ❌ Fora do escopo | Depende de JWT implementado |
| Proteção da integridade do checklist | ❌ Fora do escopo | Requer autenticação no backend |

**Nota acadêmica:** As vulnerabilidades remanescentes foram identificadas e documentadas. A correção completa (sessão com token, JWT, contexto de usuário autenticado) exige refatoração de arquitetura além do escopo desta entrega.

---

## A05 — Security Misconfiguration

### Descrição
Configurações inseguras em servidores, frameworks, banco de dados ou infraestrutura.

### Vulnerabilidades Encontradas (antes das correções)

**1. IP privado hardcoded no código-fonte**
`src/services/api.ts` continha `const BASE_URL = 'http://10.0.44.94:3000'` — um endereço IP interno exposto no repositório.

**2. Backend exposto em todas as interfaces de rede**
`backend/package.json` usava `--host 0.0.0.0`, expondo a API para toda a rede local.

**3. Credenciais no controle de versão**
`backend/db.json` com senhas dos usuários estava sendo rastreado pelo git.

**4. Arquivo `.env` sem proteção**
O `.gitignore` não incluía arquivos `.env`, permitindo commit acidental de variáveis de ambiente.

**5. Ausência de headers de segurança HTTP (mitigado nesta entrega)**
O servidor não enviava headers como `X-Content-Type-Options`, `X-Frame-Options` ou `Referrer-Policy`, e expunha o header `X-Powered-By: Express`, facilitando fingerprinting da stack.

### Status: ✅ Resolvido

| Item | Status | Ação Tomada |
|---|---|---|
| IP hardcoded removido | ✅ Resolvido | `src/services/api.ts` atualizado para usar `process.env.EXPO_PUBLIC_API_URL` |
| Arquivo `.env.example` criado | ✅ Resolvido | `SafeStep/.env.example` criado com instrução de configuração |
| `.env` protegido no git | ✅ Resolvido | `SafeStep/.gitignore` atualizado com `.env` e `.env.production` |
| Backend não exposto em 0.0.0.0 | ✅ Resolvido | `backend/package.json`: `start` agora usa `localhost`; `start:network` criado para uso explícito em rede |
| `db.json` fora do git | ✅ Resolvido | `backend/.gitignore` atualizado; `db.example.json` criado como referência |
| Headers de segurança HTTP | ✅ Resolvido | `backend/server.js` (`securityHeaders`) define `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Resource-Policy: same-origin`; `X-Powered-By` desabilitado via `server.disable('x-powered-by')` |
| Limite de tamanho de payload | ✅ Resolvido | `express.json({ limit: '15kb' })` restrito às rotas `/auth`, mitigando payloads excessivos |

**Commits realizados:**
- `src/services/api.ts` — uso de variável de ambiente
- `SafeStep/.env.example` — arquivo de referência criado
- `SafeStep/.gitignore` — proteção de arquivos `.env`
- `backend/package.json` — `--host 0.0.0.0` removido do script padrão
- `backend/.gitignore` — exclusão do `db.json`
- `backend/db.example.json` — template sem dados sensíveis

---

## A06 — Vulnerable and Outdated Components

### Descrição
Uso de bibliotecas e frameworks com vulnerabilidades conhecidas ou sem suporte.

### Vulnerabilidades Encontradas

**1. `json-server ^0.17.4` — ferramenta de desenvolvimento usada como backend**
O `json-server` é explicitamente uma ferramenta para prototipagem e desenvolvimento. Não possui:
- Autenticação nativa
- Rate limiting
- CORS configurável com segurança
- Suporte a HTTPS

**2. Ausência de auditoria de dependências no CI**
Não há execução de `npm audit` no pipeline de CI/CD para detectar vulnerabilidades nas dependências.

### Status: ⚠️ Identificado

| Item | Status | Ação Tomada |
|---|---|---|
| Substituir json-server por backend real | ❌ Pendente | Requer implementação de Node/Express (escopo futuro) |
| `npm audit` no CI | ⚠️ Documentado | Recomendado adicionar ao `playwright.yml` |

**Recomendação:**
```yaml
# Adicionar ao .github/workflows/playwright.yml
- name: Verificar vulnerabilidades
  run: npm audit --audit-level=high
```

---

## A07 — Identification and Authentication Failures

### Descrição
Falhas na verificação de identidade, autenticação e gerenciamento de sessões.

### Vulnerabilidades Encontradas

| Requisito de Segurança | Status no Projeto |
|---|---|
| Hash de senhas (scrypt) | ✅ Implementado — ver A02 |
| Autenticação no servidor | ✅ Implementado — `POST /auth/login` decide no backend |
| Política de complexidade de senha | ✅ Implementado — ver abaixo |
| Bloqueio/limitação após tentativas falhas | ✅ Implementado — rate limiting em `/auth/login` e `/auth/register` |
| Mensagens de erro genéricas (anti-enumeração de contas) | ✅ Implementado |
| Token de sessão (JWT/OAuth) | ❌ Ausente |
| Timeout de sessão | ❌ Ausente |
| Invalidação de sessão no logout | ❌ Ausente |
| Autenticação multifator (MFA) | ❌ Ausente |

### Status: ✅ Resolvido (cadastro/login) / ⚠️ Sessão pendente

| Item | Status | Ação Tomada |
|---|---|---|
| Validação de campos no cliente | ✅ Implementado | Login exige e-mail e senha não vazios; cadastro valida todos os campos antes de enviar (`CadastroScreen.tsx`) |
| Hash de senhas | ✅ Resolvido | `backend/lib/passwordHash.js` — ver A02 |
| Política de senha (OWASP ASVS V2.1) | ✅ Resolvido | `backend/lib/passwordPolicy.js`: mínimo 10 / máximo 128 caracteres, no mínimo 3 das 4 classes de caractere (minúscula/maiúscula/número/símbolo), bloqueio de senhas comuns (`SENHAS_COMUNS`) e de senhas que contenham e-mail, nome ou matrícula do usuário. Validado tanto no cliente (`CadastroScreen.tsx`, checklist visual) quanto, de forma autoritativa, no servidor. |
| Bloqueio por tentativas (rate limiting) | ✅ Resolvido | `backend/lib/rateLimit.js`: limite de 8 tentativas de cadastro por IP/15min, 30 tentativas de login por IP/15min e 8 tentativas de login por conta/15min, com resposta 429 |
| Mensagens de erro genéricas no login | ✅ Resolvido | `POST /auth/login` retorna a mesma mensagem ("E-mail ou senha invalidos.") tanto para conta inexistente quanto para senha errada, com tempo de resposta normalizado via `crypto.timingSafeEqual` + hash dummy, mitigando enumeração de contas |
| Sessão/token (JWT) | ❌ Pendente | Fora do escopo desta entrega — ver A04 |

**Nota:** A validação de formulário no cliente é uma boa prática, mas não substitui validação no servidor — todas as regras acima são reaplicadas e decididas de forma autoritativa em `backend/server.js`, independentemente do que o cliente envie.

---

## A08 — Software and Data Integrity Failures

### Descrição
Falhas que permitem violação da integridade de dados, software ou pipeline de CI/CD.

### Vulnerabilidades Encontradas

**1. Auditoria de conformidade forjável**
Requisições diretas ao endpoint `POST /checklists` com `"aprovado": true` registram conformidade sem que nenhum item tenha sido verificado. O `tecnicoId` também pode ser qualquer valor, tornando o log de auditoria inválido.

**2. Logs mutáveis**
Os registros de auditoria em `/logs` podem ser modificados (`PUT /logs/1`) ou excluídos (`DELETE /logs/1`) por qualquer cliente, comprometendo a rastreabilidade.

**3. Validação de dados ausente no servidor**
O banco contém datas inválidas como `"dataLimite": "2023-29-04"`, pois o json-server aceita qualquer valor sem validação de schema.

### Status: ⚠️ Identificado — Escopo Acadêmico

| Item | Status | Observação |
|---|---|---|
| Proteção dos endpoints de auditoria | ❌ Pendente | Depende de autenticação JWT no backend |
| Imutabilidade dos logs | ❌ Pendente | Requer backend com regras de negócio |
| Validação de schema | ❌ Pendente | json-server não suporta validação |

**Recomendação para produção:** Implementar backend com Node/Express + banco de dados relacional (PostgreSQL) com logs imutáveis e validação de schema em todas as entradas.

---

## A09 — Security Logging and Monitoring Failures

### Descrição
Ausência de logs, monitoramento e alertas adequados para detectar, escalar e responder a incidentes.

### Vulnerabilidades Encontradas

**1. Tentativas de login falhas não eram registradas (mitigado nesta entrega)**
O fluxo anterior de autenticação em `LoginScreen.tsx` não gerava nenhum log quando credenciais inválidas eram usadas, e a verificação ocorria inteiramente no cliente — o servidor não tinha visibilidade alguma sobre tentativas de login.

**2. Logs de auditoria sem integridade**
Os registros em `/logs` estão na mesma base de dados desprotegida. Não há separação entre logs de segurança e dados da aplicação, e os registros continuam mutáveis (ver A08).

**3. Nenhum alerta ou monitoramento configurado**
Não há integração com serviços de monitoramento (ex: Sentry, Datadog) para detectar erros ou padrões suspeitos em tempo real.

### Status: ⚠️ Parcialmente Resolvido

| Item | Status | Observação |
|---|---|---|
| Log de tentativas de login/cadastro | ✅ Resolvido | `backend/server.js` (`registrarLog`) grava em `/logs` os eventos `cadastro_realizado`, `cadastro_rejeitado`, `login_sucesso` e `login_falhou`, incluindo IP e (quando aplicável) e-mail/`tecnicoId` — nunca a senha |
| Integridade dos logs | ❌ Pendente | Requer banco de dados protegido / logs append-only |
| Monitoramento e alertas | ❌ Pendente | Aplicável em produção |

**O que existe atualmente:** Além dos eventos de checklist, a aplicação agora registra tentativas de autenticação e cadastro (sucesso e falha) via `registrarLog`, dando visibilidade básica sobre tentativas de força bruta — ainda sem alertas automáticos.

---

## A10 — Server-Side Request Forgery (SSRF)

### Descrição
O servidor é induzido a fazer requisições para destinos não intencionais a partir de entrada do usuário.

### Avaliação

O backend atual (json-server) não realiza nenhuma requisição HTTP a partir de dados fornecidos pelo cliente. Não há endpoints que aceitem URLs como parâmetro e façam fetch externo.

### Status: ✅ Não Aplicável

| Item | Status | Observação |
|---|---|---|
| SSRF no backend | ✅ N/A | json-server não processa URLs fornecidas pelos clientes |

---

## Resumo das Ações Realizadas

### Correções Implementadas Neste Projeto

| Arquivo Modificado | Correção | OWASP Relacionado |
|---|---|---|
| `SafeStep/src/services/api.ts` | IP hardcoded substituído por variável de ambiente `EXPO_PUBLIC_API_URL` | A05 |
| `SafeStep/.env.example` | Criado template de configuração de variáveis de ambiente | A05 |
| `SafeStep/.gitignore` | Adicionado `.env`, `.env.production` à lista de exclusões | A05 |
| `backend/package.json` | Removido `--host 0.0.0.0` do script padrão; criado `start:network` separado | A05 |
| `backend/.gitignore` | Adicionado `.env` à lista de exclusões | A05, A02 |
| `backend/db.example.json` | Atualizado para refletir o campo `senhaHash` gerado pelo backend | A02 |
| `backend/lib/passwordHash.js` (novo) | Hash de senha com `crypto.scrypt`, salt aleatório, comparação em tempo constante | A02, A07 |
| `backend/lib/passwordPolicy.js` (novo) | Política de senha OWASP ASVS V2.1 (tamanho, classes de caractere, bloqueio de senhas comuns/dados pessoais) | A07 |
| `backend/lib/sanitize.js` (novo) | Validação e sanitização de nome, matrícula, e-mail e cargo no cadastro | A03 |
| `backend/lib/rateLimit.js` (novo) | Rate limiting em memória para `/auth/register` e `/auth/login` | A07 |
| `backend/server.js` (novo) | Endpoints `/auth/register` e `/auth/login`, headers de segurança, bloqueio de escrita direta em `/tecnicos`, remoção de campos sensíveis nas respostas, migração de senhas legadas, logs de autenticação | A01, A02, A03, A04, A05, A07, A09 |
| `SafeStep/src/services/auth.ts` (novo) | Cliente HTTP para `/auth/login` e `/auth/register` com timeout; substitui a busca de `/tecnicos` para autenticação | A02, A04, A07 |
| `SafeStep/src/screens/CadastroScreen.tsx` (novo) | Tela de auto-cadastro com checklist visual de política de senha | A07 |
| `SafeStep/src/screens/LoginScreen.tsx` | Login passou a chamar `loginTecnico()` (servidor decide); adicionado link "Criar conta" | A02, A04, A07 |
| `SafeStep/src/navigation/AppNavigator.tsx` | Adicionada rota `Cadastro` | A07 |
| `SafeStep/src/types/index.ts` | Removido campo `senha` do tipo `Tecnico` usado pelo cliente | A02 |

### Vulnerabilidades Identificadas Mas Não Resolvidas (Escopo Acadêmico)

As vulnerabilidades abaixo foram **identificadas e documentadas**, mas sua correção exige refatoração arquitetural do backend (implementação de Node/Express + banco de dados relacional + JWT) que está além do escopo do bimestre atual:

- A01: Autorização por rotas restantes do backend (epis, ordensServico, checklists, logs) e `tecnicoId` dinâmico
- A02: HTTPS em produção
- A04: Sessão com token (JWT), perfil baseado em sessão real, integridade do checklist
- A07: Sessão/token, timeout de sessão, invalidação no logout, MFA
- A08: Imutabilidade de logs, validação de schema
- A09: Integridade dos logs, monitoramento e alertas

---

## Conclusão

O projeto SafeStep, em seu estado atual como aplicativo acadêmico com backend de prototipagem (`json-server`), ainda apresenta vulnerabilidades relevantes (principalmente em torno de autorização por rota e ausência de sessão/token) que o tornam **inadequado para uso em produção sem evolução adicional**. Nesta entrega, o fluxo de cadastro e login de técnicos foi reforçado com critérios de segurança alinhados ao OWASP (hash de senha com scrypt, política de senha, rate limiting, validação/sanitização de entrada, headers de segurança, mensagens de erro genéricas e log de tentativas), resolvendo a maior parte das categorias A02 e A07 e mitigando parcialmente A01, A03, A04, A05 e A09.

Para uma versão de produção, ainda seria necessário:

1. **Sessão com token** (JWT ou similar) e middleware de autorização em todas as rotas do backend
2. **HTTPS** obrigatório em todas as comunicações
3. **Banco de dados** com controle de acesso e validação de schema (substituindo o json-server)
4. **Sistema de logs** imutável e separado dos dados da aplicação
5. **Monitoramento** com alertas para eventos de segurança
6. **Autenticação multifator (MFA)** para contas de técnicos

A identificação, correção e documentação contínua dessas vulnerabilidades, seguindo o padrão OWASP Top 10, é parte do processo de melhoria contínua de segurança de qualquer sistema de software.

---

*Relatório gerado com base na análise estática do código-fonte conforme metodologia OWASP Top 10 2021.*
*Referência: https://owasp.org/Top10/*
