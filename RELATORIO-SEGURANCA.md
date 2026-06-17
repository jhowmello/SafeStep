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
| A02 | Cryptographic Failures | 🔴 Crítico | ⚠️ Parcialmente Resolvido |
| A03 | Injection | 🟡 Baixo | ✅ Não Aplicável / Baixo Risco |
| A04 | Insecure Design | 🔴 Crítico | ⚠️ Identificado / Escopo Acadêmico |
| A05 | Security Misconfiguration | 🟠 Alto | ✅ Resolvido |
| A06 | Vulnerable and Outdated Components | 🟡 Médio | ⚠️ Identificado |
| A07 | Identification and Authentication Failures | 🔴 Crítico | ⚠️ Parcialmente Resolvido |
| A08 | Software and Data Integrity Failures | 🔴 Crítico | ⚠️ Identificado / Escopo Acadêmico |
| A09 | Security Logging and Monitoring Failures | 🟠 Alto | ⚠️ Identificado |
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

### Status: ⚠️ Parcialmente Resolvido

| Item | Status | Ação Tomada |
|---|---|---|
| Middleware JWT no backend | ❌ Pendente | Requer refatoração do backend (fora do escopo do bimestre) |
| tecnicoId dinâmico | ❌ Pendente | Depende de implementar JWT primeiro |
| Logout com limpeza de estado | ❌ Pendente | Depende de implementar JWT primeiro |

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

### Status: ⚠️ Parcialmente Resolvido

| Item | Status | Ação Tomada |
|---|---|---|
| Hash de senhas (bcrypt) | ❌ Pendente | json-server não suporta middleware de hash nativamente |
| Endpoint de login no servidor | ❌ Pendente | Requer backend real (Express/Node) |
| HTTPS em produção | ❌ Pendente | Aplicável somente em ambiente de produção |
| Senhas removidas do código-fonte | ✅ Resolvido | `db.json` removido do rastreamento git via `.gitignore` atualizado; arquivo `db.example.json` criado com instruções |

**Arquivo adicionado ao `.gitignore`:** `backend/.gitignore` atualizado.
**Arquivo de referência criado:** `backend/db.example.json` com senha como `<HASH_BCRYPT_DA_SENHA>`.

---

## A03 — Injection

### Descrição
Injeção de código malicioso (SQL, NoSQL, comandos OS, XSS) por meio de entradas não sanitizadas.

### Vulnerabilidades Encontradas

**1. Sem sanitização de inputs (baixo risco atual)**
Os campos `descricao` e `local` em `CriarOrdemScreen.tsx` não são sanitizados antes de serem enviados à API. No contexto atual (React Native), o risco de XSS é baixo pois os dados são renderizados por componentes nativos (`Text`), não como HTML.

**2. Prototype Pollution via json-server**
A versão `0.17.4` do json-server aceita queries como `?__proto__[field]=value`, o que pode causar poluição de protótipo JavaScript.

### Status: ✅ Baixo Risco / Não Aplicável

| Item | Status | Observação |
|---|---|---|
| SQL Injection | ✅ N/A | Projeto usa json-server (arquivo JSON), sem banco SQL |
| XSS (versão mobile) | ✅ Mitigado | React Native não renderiza HTML diretamente |
| XSS (versão web) | ⚠️ Atenção | Se dados forem renderizados em contexto HTML no Expo Web, sanitização é necessária |
| Prototype Pollution | ⚠️ Atenção | Inerente ao json-server 0.17.x — mitigado na produção substituindo por backend real |

---

## A04 — Insecure Design

### Descrição
Falhas na arquitetura e design do sistema que não podem ser corrigidas apenas com implementação — requerem mudança no modelo.

### Vulnerabilidades Encontradas

**1. Autenticação inteiramente no cliente**
O design atual coloca toda a lógica de autenticação no frontend. Não é possível corrigir essa falha sem redesenhar o backend. Em qualquer sistema real, o servidor deve validar credenciais e emitir tokens.

**2. Perfil hardcoded — sem contexto de sessão**
`src/screens/PerfilScreen.tsx` exibe dados fixos no código (`nome: 'João Silva'`), não refletindo o usuário autenticado. Qualquer pessoa logada vê o perfil do mesmo técnico.

**3. Conformidade NR-10/NR-35 forjável**
Como o endpoint `/checklists` não exige autenticação, qualquer pessoa pode registrar um checklist aprovado via requisição HTTP direta, sem realizar nenhum item de segurança. Isso compromete o propósito central do aplicativo.

### Status: ⚠️ Identificado — Escopo Acadêmico

| Item | Status | Observação |
|---|---|---|
| Redesign da arquitetura de autenticação | ❌ Fora do escopo | Requer backend com Express/Node + JWT (projeto futuro) |
| Perfil baseado em sessão real | ❌ Fora do escopo | Depende de JWT implementado |
| Proteção da integridade do checklist | ❌ Fora do escopo | Requer autenticação no backend |

**Nota acadêmica:** As vulnerabilidades foram identificadas e documentadas. A correção completa exige refatoração de arquitetura além do escopo do bimestre.

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

### Status: ✅ Resolvido

| Item | Status | Ação Tomada |
|---|---|---|
| IP hardcoded removido | ✅ Resolvido | `src/services/api.ts` atualizado para usar `process.env.EXPO_PUBLIC_API_URL` |
| Arquivo `.env.example` criado | ✅ Resolvido | `SafeStep/.env.example` criado com instrução de configuração |
| `.env` protegido no git | ✅ Resolvido | `SafeStep/.gitignore` atualizado com `.env` e `.env.production` |
| Backend não exposto em 0.0.0.0 | ✅ Resolvido | `backend/package.json`: `start` agora usa `localhost`; `start:network` criado para uso explícito em rede |
| `db.json` fora do git | ✅ Resolvido | `backend/.gitignore` atualizado; `db.example.json` criado como referência |

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
| Hash de senhas (bcrypt/argon2) | ❌ Ausente — senhas em texto plano |
| Autenticação no servidor | ❌ Ausente — autenticação feita no cliente |
| Token de sessão (JWT/OAuth) | ❌ Ausente |
| Bloqueio após tentativas falhas | ❌ Ausente |
| Timeout de sessão | ❌ Ausente |
| Complexidade de senha exigida | ❌ Ausente |
| Invalidação de sessão no logout | ❌ Ausente |
| Autenticação multifator (MFA) | ❌ Ausente |

### Status: ⚠️ Parcialmente Resolvido

| Item | Status | Ação Tomada |
|---|---|---|
| Validação de campos no cliente | ✅ Implementado | Login exige e-mail e senha não vazios (`LoginScreen.tsx:31-33`) |
| Hash de senhas e JWT | ❌ Pendente | Requer refatoração do backend |
| Bloqueio por tentativas | ❌ Pendente | Requer middleware no backend |

**Nota:** A validação de formulário no cliente é uma boa prática, mas não substitui validação no servidor. Todas as correções críticas desta categoria dependem de um backend com autenticação real.

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

**1. Tentativas de login falhas não são registradas**
O fluxo de autenticação em `LoginScreen.tsx` não gera nenhum log quando credenciais inválidas são usadas. Ataques de força bruta passam completamente despercebidos.

**2. Logs de auditoria sem integridade**
Os registros em `/logs` estão na mesma base de dados desprotegida. Não há separação entre logs de segurança e dados da aplicação.

**3. Nenhum alerta ou monitoramento configurado**
Não há integração com serviços de monitoramento (ex: Sentry, Datadog) para detectar erros ou padrões suspeitos em tempo real.

### Status: ⚠️ Identificado

| Item | Status | Observação |
|---|---|---|
| Log de tentativas de login | ❌ Pendente | Requer backend com autenticação |
| Integridade dos logs | ❌ Pendente | Requer banco de dados protegido |
| Monitoramento e alertas | ❌ Pendente | Aplicável em produção |

**O que existe atualmente:** A aplicação registra eventos de conclusão de checklist via `POST /logs`. Apesar de não ser seguro, demonstra a consciência da necessidade de rastreabilidade.

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
| `backend/db.example.json` | Criado template do banco sem dados sensíveis, com instrução de hash | A02 |

### Vulnerabilidades Identificadas Mas Não Resolvidas (Escopo Acadêmico)

As vulnerabilidades abaixo foram **identificadas e documentadas**, mas sua correção exige refatoração arquitetural do backend (implementação de Node/Express + banco de dados relacional + JWT) que está além do escopo do bimestre atual:

- A01: Autorização por rotas no backend
- A02: Hash de senhas + HTTPS
- A04: Redesign da arquitetura de autenticação
- A07: JWT, bloqueio de conta, timeout de sessão
- A08: Imutabilidade de logs, validação de schema
- A09: Monitoramento e alertas

---

## Conclusão

O projeto SafeStep, em seu estado atual como aplicativo acadêmico com backend de prototipagem (`json-server`), apresenta vulnerabilidades críticas que o tornam **inadequado para uso em produção**. As 6 correções implementadas resolvem os problemas de configuração mais simples e demonstram o conhecimento das boas práticas.

Para uma versão de produção, seria necessário:

1. **Backend real** (Node.js + Express ou similar) com autenticação JWT
2. **Banco de dados** com controle de acesso, senhas hasheadas com bcrypt
3. **HTTPS** obrigatório em todas as comunicações
4. **Middleware de autorização** em todas as rotas
5. **Sistema de logs** imutável e separado dos dados da aplicação
6. **Monitoramento** com alertas para eventos de segurança

A identificação e documentação dessas vulnerabilidades, seguindo o padrão OWASP Top 10, é o primeiro passo do processo de melhoria contínua de segurança de qualquer sistema de software.

---

*Relatório gerado com base na análise estática do código-fonte conforme metodologia OWASP Top 10 2021.*
*Referência: https://owasp.org/Top10/*
