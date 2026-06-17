# Processo Scrum/Kanban — SafeStep

## Visão Geral

O projeto SafeStep adota o processo **Scrum** com quadro **Kanban** no GitHub Projects para organização e rastreabilidade do trabalho.

---

## Papéis

| Papel | Responsabilidade |
|---|---|
| **Product Owner** | Priorizar o backlog, definir critérios de aceitação |
| **Scrum Master** | Facilitar cerimônias, remover impedimentos |
| **Dev Team** | Implementar e testar as histórias de usuário |

---

## Cerimônias

| Cerimônia | Frequência | Duração |
|---|---|---|
| Sprint Planning | Início de cada sprint | 1h |
| Daily Standup | Diário | 15 min |
| Sprint Review | Fim de cada sprint | 30 min |
| Sprint Retrospective | Fim de cada sprint | 30 min |

---

## Estrutura do Kanban

```
Backlog → Sprint Backlog → Em Andamento → Em Revisão → Concluído
```

| Coluna | Descrição |
|---|---|
| **Backlog** | Itens priorizados aguardando sprint |
| **Sprint Backlog** | Comprometidos para a sprint atual |
| **Em Andamento** | Sendo desenvolvido (1 item por dev) |
| **Em Revisão** | PR aberto, aguardando code review |
| **Concluído** | DoD atingida, mergeado na main |

---

## Definição de Pronto (DoD)

Um item só vai para **Concluído** quando:

- [ ] Código implementado e revisado por par
- [ ] Testes unitários criados (Jest)
- [ ] Testes E2E criados com Playwright (mín. 1 por história)
- [ ] Screenshots de evidência geradas e armazenadas em `e2e/screenshots/`
- [ ] Pull Request aprovado e mergeado
- [ ] Branch deletada após o merge

---

## Estimativa (Story Points — Fibonacci)

| Pontos | Complexidade |
|---|---|
| 1 | Mudança trivial (texto, cor) |
| 2 | Componente simples |
| 3 | Tela com lógica básica |
| 5 | Tela com integração de API |
| 8 | Fluxo completo multi-tela |
| 13 | Épico, subdividir antes de estimar |

---

## Labels no GitHub

| Label | Cor | Uso |
|---|---|---|
| `user-story` | Azul | Histórias de usuário |
| `bug` | Vermelho | Defeitos encontrados |
| `task` | Cinza | Tarefas técnicas |
| `backlog` | Branca | Não alocado em sprint |
| `in-sprint` | Verde | Na sprint atual |
| `blocked` | Laranja | Impedimento identificado |
| `prioridade-alta` | Vermelho escuro | Alta prioridade |

---

## Fluxo de Trabalho Git

```
main
 └── develop
      ├── feature/US-001-login
      ├── feature/US-002-checklist
      └── fix/BUG-003-validacao-form
```

1. Criar branch a partir de `develop`
2. Implementar + criar testes Playwright
3. Abrir Pull Request → `develop`
4. Code review obrigatório (1 aprovação mínima)
5. Merge na develop → fechar issue
6. Release: merge `develop` → `main` com tag de versão
