# Remover Integracao com Claude Code — Especificacao

## Problem Statement

O ForgeTerm tem uma integracao profunda com Claude Code (~300 referencias em 22 arquivos) que cobre deteccao de sessoes, auto-resume, hooks de atividade, banners de UI, e configuracao especifica. Para usuarios que nao usam Claude Code, isso e codigo morto que polui a base, a UI, e o schema de configuracao. O objetivo e remover completamente essa integracao, deixando o projeto como se ela nunca tivesse existido.

## Goals

- [ ] Zero referencias a "claude" na base de codigo (exceto mencoes residuais em specs internas e CLAUDE.md do projeto)
- [ ] Nenhum componente de UI relacionado a Claude visivel
- [ ] Nenhum IPC handler, tipo, ou config field relacionado a Claude
- [ ] Documentacao reescrita sem mencionar integracao com Claude Code
- [ ] CLI tool sem flags/comandos relacionados a Claude

## Out of Scope

| Feature                        | Reason                                 |
| ------------------------------ | -------------------------------------- |
| Remover CLAUDE.md do projeto   | Arquivo e instrucao do proprio projeto, nao da integracao |
| Alterar .specs/ existentes     | Specs de grid-layout e codebase sao artefatos separados |
| Adicionar feature flag         | Remocao e total; nao ha necessidade de toggle |

---

## User Stories

### P1: Remover codigo e tipos do core ⭐ MVP

**User Story**: Como mantenedor do ForgeTerm, quero remover todo codigo fonte, componentes, tipos e IPC handlers relacionados ao Claude Code para que a base de codigo fique mais limpa e sem funcionalidades nao utilizadas.

**Why P1**: E o nucleo da remocao — sem isso, o resto nao faz sentido. Remove a funcionalidade do runtime.

**Acceptance Criteria**:

1. WHEN o projeto for compilado apos a remocao THEN o TypeScript SHALL compilar sem erros relacionados a tipos/imports de Claude removidos
2. WHEN o app for iniciado THEN nenhum banner "Claude connection" SHALL aparecer na UI
3. WHEN o usuario abrir o modal de instalacao de CLI (CliInstallModal) THEN a secao "Claude Activity Indicators" SHALL estar ausente
4. WHEN o usuario abrir o modal de edicao de workspace THEN o campo "Claude CLI command" SHALL estar ausente
5. WHEN o usuario abrir ProjectSettings THEN o campo "Claude CLI command" SHALL estar ausente
6. WHEN o usuario abrir SessionInfoPanel THENnenhuma referencia a "Claude conversation" SHALL aparecer
7. WHEN uma sessao for detectada ou restaurada THEN nenhum `claudeSessionId` SHALL ser atribuido ou processado

**Independent Test**: Compilar o projeto com `pnpm build` e iniciar o app — verificar que a UI nao exibe nenhum elemento relacionado a Claude.

**Files affected**:
- `src/components/ClaudeConnectionBanner.tsx` — DELETAR
- `src/App.tsx` — remover imports, estado `claudeLaunch`, funcao `resumeClaudeConversation`, uso do banner
- `src/App.css` — remover estilos `.claude-connection-banner*`, `@keyframes claude-pulse`, comentarios
- `src/components/CliInstallModal.tsx` — remover estado `claudeHooksInstalled`/`claudeHooksBusy`, handler `handleClaudeHooksInstall`, secao "Claude Activity Indicators"
- `src/components/EditWorkspaceModal.tsx` — remover estado `wsClaudeCliName`, campo "Claude CLI command"
- `src/components/ProjectSettings.tsx` — remover estado `claudeCliName`, campo "Claude CLI command"
- `src/components/SessionInfoPanel.tsx` — remover referencia a "Claude conversation"
- `src/components/TerminalView.tsx` — remover logica de skip relacionada a Claude hooks
- `src/store/sessionStore.ts` — remover referencias a Claude hook / ft activity
- `shared/types.ts` — remover `claudeResumeArgs`, `claudeCliName`, `ClaudeLaunch`, `ClaudeConnectionStatus`, `installClaudeHooks`, `areClaudeHooksInstalled`, `checkClaudeConnection`, `getClaudeSetupPrompt`, `getClaudeLaunch`, `claudeSessionId`
- `electron/preload.ts` — remover declaracoes de IPC: `installClaudeHooks`, `areClaudeHooksInstalled`, `checkClaudeConnection`, `getClaudeSetupPrompt`, `getClaudeLaunch`
- `electron/main.ts` — remover `resolveClaudeLaunch()`, `checkClaudeConnection()`, `getClaudeSetupPrompt()`, `findClaudeSessionIdInTree()`, `detectConversationIds()`, `CLAUDE_ACTIVITY_HOOKS`, IPC handlers para `claude:*` e `claude-hooks:*`
- `electron/ptyManager.ts` — remover comentario/referencia a Claude rename

---

### P2: Remover suporte de configuracao, CLI e hooks

**User Story**: Como mantenedor do ForgeTerm, quero remover campos de configuracao (`claudeResumeArgs`, `claudeCliName`), opcoes de CLI, e hooks de atividade do Claude para que o schema de configuracao e a ferramenta CLI reflitam a ausencia da integracao.

**Why P2**: Remove suporte externo a feature — schema de config, ferramentas de linha de comando, e hooks no filesystem do usuario.

**Acceptance Criteria**:

1. WHEN um arquivo `.forgeterm.json` contiver `claudeResumeArgs` ou `claudeCliName` THEN o parser SHALL ignora-los silenciosamente sem erro
2. WHEN o usuario rodar `forgeterm --help` THEN nenhuma opcao `--claude-cli` SHALL aparecer
3. WHEN o usuario rodar `ft --help` THEN nenhum comando ou referencia a Claude SHALL aparecer
4. WHEN o diretorio `bin/hooks/` existir THEN o arquivo `report-activity.cjs` SHALL ser removido
5. WHEN o app iniciar THEN nenhum hook SHALL ser instalado em `~/.claude/hooks/forgeterm/`

**Independent Test**: Rodar `node bin/forgeterm.cjs --help` e `bash bin/forgeterm-cli.sh --help` — verificar ausencia de opcoes/comandos Claude.

**Files affected**:
- `electron/main.ts` — remover logica de resolucao de `claudeCliName` e `claudeResumeArgs` do config, remover instalacao de hooks (bloco `CLAUDE_ACTIVITY_HOOKS`)
- `bin/forgeterm.cjs` — remover `--claude-cli`, referencias a `CLAUDE.md` no help, comando `conversation`
- `bin/forgeterm-cli.sh` — remover `--claude-cli`, funcoes de report Claude context/working state, `conversation` subcomando, referencias no help
- `bin/hooks/report-activity.cjs` — DELETAR
- `bin/hooks/` — DELETAR diretorio se vazio apos remocao

---

### P3: Limpar documentacao e assets

**User Story**: Como usuario do ForgeTerm, quero que a documentacao (README, HELP) reflita as funcionalidades reais do terminal sem mencionar integracao com Claude Code, para que eu nao seja confundido por features inexistentes.

**Why P3**: Documentacao desatualizada gera confusao e tickets de suporte desnecessarios.

**Acceptance Criteria**:

1. WHEN o usuario ler o README.md THEN nenhuma secao "Claude Code Integration" SHALL existir
2. WHEN o usuario ler o HELP.md THEN nenhuma secao "Claude Code Integration" SHALL existir e nenhuma referencia a "Claude" SHALL permanecer
3. WHEN o arquivo `docs/claude-setup.md` for buscado THEN ele SHALL nao existir
4. WHEN o screenshot `public/screenshots/feature-claude-banner.png` for buscado THEN ele SHALL nao existir
5. WHEN o `choco/forgeterm.nuspec` for lido THEN a descricao SHALL nao mencionar "Claude Code integration"

**Independent Test**: Buscar por "claude" (case-insensitive) em README.md e HELP.md — zero resultados relevantes a integracao.

**Files affected**:
- `README.md` — remover secao "Claude Code Integration", reescrever paragrafos que mencionam Claude
- `HELP.md` — remover secao "Claude Code Integration", reescrever paragrafos que mencionam Claude
- `docs/claude-setup.md` — DELETAR
- `public/screenshots/feature-claude-banner.png` — DELETAR
- `choco/forgeterm.nuspec` — remover "and Claude Code integration" da descricao

---

## Edge Cases

- WHEN um `.forgeterm.json` legado contiver `claudeResumeArgs` ou `claudeCliName` THEN o parser SHALL ignora-los sem crash ou warning visivel ao usuario
- WHEN `~/.claude/hooks/forgeterm/` ja existir de instalacao anterior THEN o app SHALL nao tentar ler nem escrever nesse diretorio
- WHEN `~/.claude/sessions/` contiver sessoes antigas THEN o app SHALL nao tentar detecta-las ou associa-las a sessoes do ForgeTerm
- WHEN o projeto for buildado apos as remocoes THEN `pnpm build` SHALL passar sem erros de compilacao ou tipos
- WHEN o app rodar no modo dev (`pnpm dev`) THEN nenhum erro de runtime relacionado a imports ausentes SHALL ocorrer

---

## Requirement Traceability

| Requirement ID | Story                          | Phase  | Status  |
| -------------- | ------------------------------ | ------ | ------- |
| CLAUDE-01      | P1: Remover codigo e tipos     | Design | Done |
| CLAUDE-02      | P1: Deletar ClaudeConnectionBanner | Design | Done |
| CLAUDE-03      | P1: Limpar App.tsx             | Design | Done |
| CLAUDE-04      | P1: Limpar App.css             | Design | Done |
| CLAUDE-05      | P1: Limpar CliInstallModal     | Design | Done |
| CLAUDE-06      | P1: Limpar EditWorkspaceModal  | Design | Done |
| CLAUDE-07      | P1: Limpar ProjectSettings     | Design | Done |
| CLAUDE-08      | P1: Limpar SessionInfoPanel    | Design | Done |
| CLAUDE-09      | P1: Limpar TerminalView        | Design | Done |
| CLAUDE-10      | P1: Limpar sessionStore        | Design | Done |
| CLAUDE-11      | P1: Limpar shared/types.ts     | Design | Done |
| CLAUDE-12      | P1: Limpar preload.ts          | Design | Done |
| CLAUDE-13      | P1: Limpar main.ts (handlers)  | Design | Done |
| CLAUDE-14      | P1: Limpar ptyManager.ts       | Design | Done |
| CLAUDE-15      | P2: Remover suporte de config  | Design | Done |
| CLAUDE-16      | P2: Limpar bin/forgeterm.cjs   | Design | Done |
| CLAUDE-17      | P2: Limpar bin/forgeterm-cli.sh | Design | Done |
| CLAUDE-18      | P2: Deletar hooks Claude       | Design | Done |
| CLAUDE-19      | P3: Limpar README.md           | Design | Done |
| CLAUDE-20      | P3: Limpar HELP.md             | Design | Done |
| CLAUDE-21      | P3: Deletar docs/claude-setup.md | Design | Done |
| CLAUDE-22      | P3: Deletar screenshot         | Design | Done |
| CLAUDE-23      | P3: Limpar choco/nuspec        | Design | Done |

**Coverage:** 23 total, 23 implemented, 0 pending ✅

---

## Success Criteria

- [ ] `pnpm build` passa sem erros apos todas as remocoes
- [ ] `pnpm dev` inicia o app sem erros de runtime
- [ ] `rg -i claude src/ electron/ shared/` retorna zero resultados (fora CLAUDE.md do projeto)
- [ ] `rg -i claude README.md HELP.md` retorna zero resultados relevantes a integracao
- [ ] Banner "Claude connection" nao aparece na UI em nenhum cenario
- [ ] `.forgeterm.json` com campos `claudeResumeArgs`/`claudeCliName` e carregado sem erros
