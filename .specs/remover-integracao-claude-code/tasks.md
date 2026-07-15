# Remover Integracao com Claude Code — Tasks

**Design**: `.specs/remover-integracao-claude-code/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1: Remove Usage (Components) — Parallel

```
T1 ─┐
T2 ─┤
T3 ─┤
T4 ─┼──→ T10 (preload bridge removal)
T5 ─┤
T6 ─┤
T7 ─┤
T8 ─┤
T9 ─┘
T11 ─────────→
```

### Phase 2: Core Removal (Sequential — depende de Phase 1)

```
T10 + T11 complete → T12 (main.ts, ~60 refs) → T13 (types.ts definitions)
```

### Phase 3: CLI + Docs Cleanup (Parallel — pode rodar junto com Phase 2)

```
T14 (CLI tools) ─┐
                 ├──→ T16 (verify)
T15 (docs/assets) ┘
```

### Phase 4: Verification Gate

```
All complete → T16 (rg scan + pnpm build + pnpm dev)
```

---

## Task Breakdown

### T1: Deletar ClaudeConnectionBanner.tsx [P]

**What**: Deletar o arquivo `src/components/ClaudeConnectionBanner.tsx`
**Where**: `src/components/ClaudeConnectionBanner.tsx` (DELETE)
**Depends on**: None
**Reuses**: Nenhum — e remocao pura
**Requirement**: CLAUDE-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Arquivo `src/components/ClaudeConnectionBanner.tsx` nao existe mais
- [ ] `rg -i claude src/components/ClaudeConnectionBanner.tsx` retorna "No such file"

**Tests**: none
**Gate**: build

---

### T2: Limpar App.tsx [P]

**What**: Remover imports de `ClaudeConnectionBanner` e `ClaudeLaunch`, estado `claudeLaunch`, funcao `resumeClaudeConversation()`, e renderizacao condicional do banner
**Where**: `src/App.tsx`
**Depends on**: T1 (banner deletado, import quebraria)
**Reuses**: Padrao de remocao limpa de imports/state/JSX
**Requirement**: CLAUDE-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Nenhum import de `ClaudeConnectionBanner` ou `ClaudeLaunch` em App.tsx
- [ ] Estado `claudeLaunch` removido (useState + tipo)
- [ ] Funcao `resumeClaudeConversation` removida
- [ ] Renderizacao `<ClaudeConnectionBanner>` removida do JSX
- [ ] Bloco de init que chama `getClaudeLaunch()` removido
- [ ] `rg -i claude src/App.tsx` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T3: Limpar App.css [P]

**What**: Remover seletores `.claude-connection-banner*`, `@keyframes claude-pulse` e comentarios relacionados
**Where**: `src/App.css`
**Depends on**: None
**Reuses**: Nenhum
**Requirement**: CLAUDE-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Nenhum seletor `.claude-connection-banner*` em App.css
- [ ] `@keyframes claude-pulse` removido
- [ ] `rg -i claude src/App.css` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T4: Limpar CliInstallModal.tsx [P]

**What**: Remover estado `claudeHooksInstalled`/`claudeHooksBusy`, handler `handleClaudeHooksInstall`, secao UI "Claude Activity Indicators", e chamadas `window.forgeterm.areClaudeHooksInstalled()`/`installClaudeHooks()`
**Where**: `src/components/CliInstallModal.tsx`
**Depends on**: None
**Reuses**: Padrao de remocao de estado + handler + JSX de secao
**Requirement**: CLAUDE-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Estados `claudeHooksInstalled` e `claudeHooksBusy` removidos
- [ ] Handler `handleClaudeHooksInstall` removido
- [ ] Secao "Claude Activity Indicators" removida do JSX (botao + status)
- [ ] Chamadas a `window.forgeterm.areClaudeHooksInstalled()` e `window.forgeterm.installClaudeHooks()` removidas
- [ ] `rg -i claude src/components/CliInstallModal.tsx` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T5: Limpar EditWorkspaceModal.tsx [P]

**What**: Remover estado `wsClaudeCliName` e campo "Claude CLI command" do formulario e logica de save
**Where**: `src/components/EditWorkspaceModal.tsx`
**Depends on**: None
**Reuses**: Padrao de remocao de campo de formulario
**Requirement**: CLAUDE-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Estado `wsClaudeCliName` removido
- [ ] Campo "Claude CLI command" removido do JSX
- [ ] `claudeCliName` nao incluido no payload de save
- [ ] `rg -i claude src/components/EditWorkspaceModal.tsx` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T6: Limpar ProjectSettings.tsx [P]

**What**: Remover estado `claudeCliName` e campo "Claude CLI command" do formulario e logica de save
**Where**: `src/components/ProjectSettings.tsx`
**Depends on**: None
**Reuses**: Padrao de remocao de campo de formulario (similar ao T5)
**Requirement**: CLAUDE-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Estado `claudeCliName` removido
- [ ] Campo "Claude CLI command" removido do JSX
- [ ] `claudeCliName` nao incluido no payload de save
- [ ] `rg -i claude src/components/ProjectSettings.tsx` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T7: Limpar SessionInfoPanel.tsx [P]

**What**: Remover referencia a "Claude conversation" (label/texto e botao de resume se existir)
**Where**: `src/components/SessionInfoPanel.tsx`
**Depends on**: None
**Reuses**: Nenhum
**Requirement**: CLAUDE-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Nenhuma referencia textual a "Claude conversation" no componente
- [ ] Botao/acao de resume Claude removido (se existir)
- [ ] `rg -i claude src/components/SessionInfoPanel.tsx` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T8: Limpar TerminalView.tsx [P]

**What**: Remover logica de skip relacionada a Claude hooks
**Where**: `src/components/TerminalView.tsx`
**Depends on**: None
**Reuses**: Nenhum
**Requirement**: CLAUDE-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Logica condicional que referencia Claude hooks removida
- [ ] `rg -i claude src/components/TerminalView.tsx` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T9: Limpar sessionStore.ts [P]

**What**: Remover comentarios com mencões a "Claude hook"
**Where**: `src/store/sessionStore.ts`
**Depends on**: None
**Reuses**: Nenhum
**Requirement**: CLAUDE-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `rg -i claude src/store/sessionStore.ts` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T10: Limpar preload.ts [P]

**What**: Remover metodos `installClaudeHooks`, `areClaudeHooksInstalled`, `checkClaudeConnection`, `getClaudeSetupPrompt`, `getClaudeLaunch`, `onConversationUpdated` da bridge preload
**Where**: `electron/preload.ts`
**Depends on**: T1-T9 (componentes nao usam mais esses metodos)
**Reuses**: Padrao existente de remocao de metodo na bridge (manter estrutura de `ipcRenderer.invoke/send/on`)
**Requirement**: CLAUDE-12

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Metodo `installClaudeHooks` removido (linhas 199-200)
- [ ] Metodo `areClaudeHooksInstalled` removido (linhas 202-203)
- [ ] Metodo `checkClaudeConnection` removido (linhas 369-370)
- [ ] Metodo `getClaudeSetupPrompt` removido (linhas 372-373)
- [ ] Metodo `getClaudeLaunch` removido (linhas 375-376)
- [ ] Metodo `onConversationUpdated` removido (linhas 339-343)
- [ ] `rg -i claude electron/preload.ts` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T11: Limpar ptyManager.ts [P]

**What**: Remover comentario sobre "Claude rename"
**Where**: `electron/ptyManager.ts`
**Depends on**: None
**Reuses**: Nenhum
**Requirement**: CLAUDE-14

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `rg -i claude electron/ptyManager.ts` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T12: Limpar main.ts (~60 referencias)

⚠️ **CONCERNS.md Risk HIGH**: main.ts e um monolito de 3135 linhas. Remover apenas codigo Claude, sem refatorar.

**What**: Remover todas as funcoes, constantes, IPC handlers e referencias relacionadas a Claude:
- 7 funcoes: `resolveClaudeLaunch`, `checkClaudeConnection`, `getClaudeSetupPrompt`, `findClaudeSessionIdInTree`, `claudeSettingsPath`, `areClaudeActivityHooksInstalled`, `installClaudeActivityHooks`
- Constantes: `CLAUDE_ACTIVITY_HOOKS`
- Helpers: `claudeHooksScriptPath`, `hasActivityHook`
- 5 IPC handlers: `claude-hooks:installed`, `claude-hooks:install`, `claude:check-connection`, `claude:get-setup-prompt`, `claude:get-launch`
- Funcao `detectConversationIds()` inteira
- Bloco de resolucao de `claudeCliName`/`dangerouslySkipPermissions` do config
- Bloco de instalacao de hooks na inicializacao
- `ClaudeConnectionStatus` interface local
- Persistencia de `claudeSessionId` em `saveWindowState()`
- `import type` de `ClaudeLaunch` e `ClaudeConnectionStatus`
**Where**: `electron/main.ts`
**Depends on**: T10 (preload bridges removidos — ninguem chama os canais Claude), T1-T9 (componentes limpos)
**Reuses**: Nenhum — remocao atomica por funcao/bloco
**Requirement**: CLAUDE-13, CLAUDE-15

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `resolveClaudeLaunch()` removida (linha ~783)
- [ ] `checkClaudeConnection()` removida (linha ~805)
- [ ] `getClaudeSetupPrompt()` removida (linha ~828)
- [ ] `findClaudeSessionIdInTree()` removida (linha ~967)
- [ ] `detectConversationIds()` removida integralmente
- [ ] `claudeSettingsPath()`, `areClaudeActivityHooksInstalled()`, `installClaudeActivityHooks()` removidas
- [ ] `CLAUDE_ACTIVITY_HOOKS`, `claudeHooksScriptPath`, `hasActivityHook` removidos
- [ ] 5 IPC handlers `claude:*` e `claude-hooks:*` removidos
- [ ] Bloco de resolucao de `claudeCliName`/`dangerouslySkipPermissions` do config removido
- [ ] `ClaudeConnectionStatus` interface local removida
- [ ] `claudeSessionId` removido da persistencia em `saveWindowState()`/`loadWindowState()`
- [ ] `import type` de simbolos Claude removidos
- [ ] PRESERVADO: `session:activity-updated`, `activity:report`, `session:context-updated`, `session:info-updated`
- [ ] `rg -i claude electron/main.ts` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T13: Limpar shared/types.ts

**What**: Remover definicoes de tipos relacionados a Claude:
- Interfaces: `ClaudeLaunch`, `ClaudeConnectionStatus`
- Campos: `claudeResumeArgs`, `claudeCliName`, `dangerouslySkipPermissions` em `ForgeTermConfig`
- Campos: `claudeCliName`, `dangerouslySkipPermissions` em `Workspace`
- Campo: `claudeSessionId` em `SavedSession`
- Metodos API: `installClaudeHooks`, `areClaudeHooksInstalled`, `checkClaudeConnection`, `getClaudeSetupPrompt`, `getClaudeLaunch`, `onConversationUpdated`
- Atualizar comentario em `SessionActivitySignal` removendo "Claude hooks"
**Where**: `shared/types.ts`
**Depends on**: T12 (main.ts), T10 (preload.ts), T1-T9 (componentes) — todo uso foi removido
**Reuses**: Nenhum
**Requirement**: CLAUDE-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `ClaudeLaunch` interface removida
- [ ] `ClaudeConnectionStatus` interface removida
- [ ] `claudeResumeArgs`, `claudeCliName`, `dangerouslySkipPermissions` removidos de `ForgeTermConfig`
- [ ] `claudeCliName`, `dangerouslySkipPermissions` removidos de `Workspace`
- [ ] `claudeSessionId` removido de `SavedSession`
- [ ] 6 metodos Claude removidos de `ForgeTermAPI`
- [ ] Comentario em `SessionActivitySignal` atualizado (sem "Claude hooks")
- [ ] `rg -i claude shared/types.ts` retorna zero resultados

**Tests**: none
**Gate**: build

---

### T14: Limpar ferramentas CLI [P]

**What**: 
- `bin/forgeterm.cjs`: remover flag `--claude-cli`, referencias a `CLAUDE.md`, texto de ajuda relacionado
- `bin/forgeterm-cli.sh`: remover `--claude-cli`, funcao `cmd_conversation()`, case `conversation)`, referencias no help
- `bin/hooks/report-activity.cjs`: DELETAR
- `bin/hooks/`: DELETAR diretorio (se vazio)
**Where**: `bin/forgeterm.cjs`, `bin/forgeterm-cli.sh`, `bin/hooks/report-activity.cjs`, `bin/hooks/`
**Depends on**: T12 (main.ts — hooks nao sao mais instalados)
**Reuses**: Nenhum
**Requirement**: CLAUDE-16, CLAUDE-17, CLAUDE-18

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `bin/forgeterm.cjs`: `rg -i claude` retorna zero resultados
- [ ] `bin/forgeterm-cli.sh`: `rg -i claude` retorna zero resultados
- [ ] `bin/forgetterm-cli.sh`: funcao `cmd_conversation` removida
- [ ] `bin/forgetterm-cli.sh`: case `conversation)` removido do switch
- [ ] `bin/forgetterm-cli.sh`: `--claude-cli` flag removida
- [ ] `bin/hooks/report-activity.cjs` deletado
- [ ] `bin/hooks/` diretorio deletado (se vazio)
- [ ] `PRESERVADO`: `cmd_activity()` no CLI (usado independentemente)
- [ ] `node bin/forgeterm.cjs --help` nao mostra `--claude-cli`
- [ ] `bash bin/forgetterm-cli.sh help` nao mostra `conversation`

**Tests**: none
**Gate**: build

---

### T15: Limpar documentacao e assets [P]

**What**:
- `README.md`: remover secao "Claude Code Integration", screenshot, paragrafos com mencão a Claude, exemplo `claudeResumeArgs`
- `HELP.md`: remover secao "Claude Code Integration", screenshot, paragrafos com mencão a Claude, reescrever secao "With AI agents"
- `docs/claude-setup.md`: DELETAR
- `public/screenshots/feature-claude-banner.png`: DELETAR
- `choco/forgeterm.nuspec`: remover "and Claude Code integration" da descricao
**Where**: `README.md`, `HELP.md`, `docs/claude-setup.md`, `public/screenshots/feature-claude-banner.png`, `choco/forgeterm.nuspec`
**Depends on**: None
**Reuses**: Nenhum
**Requirement**: CLAUDE-19, CLAUDE-20, CLAUDE-21, CLAUDE-22, CLAUDE-23

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `docs/claude-setup.md` deletado
- [ ] `public/screenshots/feature-claude-banner.png` deletado
- [ ] `README.md`: secao "Claude Code Integration" removida
- [ ] `README.md`: screenshot `feature-claude-banner.png` removido
- [ ] `README.md`: paragrafo sobre "Claude Code conversation IDs" reescrito
- [ ] `README.md`: exemplo `claudeResumeArgs` no JSON removido
- [ ] `HELP.md`: secao "Claude Code Integration" removida
- [ ] `HELP.md`: screenshot removido
- [ ] `HELP.md`: paragrafos com mencão a Claude reescritos
- [ ] `HELP.md`: secao "With AI agents" reescrita (generica, sem "Claude Code")
- [ ] `choco/forgeterm.nuspec`: descricao sem "Claude Code integration"
- [ ] `rg -i claude README.md` retorna zero resultados relevantes
- [ ] `rg -i claude HELP.md` retorna zero resultados relevantes

**Tests**: none
**Gate**: build

---

### T16: Verificacao final

**What**: Validar que a remocao foi completa e o projeto compila e inicia
**Where**: Projeto inteiro
**Depends on**: T1-T15 (todos os anteriores)
**Reuses**: Nenhum
**Requirement**: Todos (CLAUDE-01 a CLAUDE-23)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `rg -i claude src/ electron/ shared/` retorna zero resultados
- [ ] `rg -i claude README.md HELP.md` retorna zero resultados relevantes (pode ter residuais em `.specs/` e `CLAUDE.md`)
- [ ] `pnpm build` passa sem erros de compilacao
- [ ] `pnpm dev` inicia o app sem erros de runtime
- [ ] Banner "Claude connection" nao aparece na UI
- [ ] `.forgeterm.json` com campos `claudeResumeArgs`/`claudeCliName` carrega sem erros (testar com config legado)
- [ ] `node bin/forgeterm.cjs --help` nao mostra `--claude-cli`
- [ ] `bash bin/forgetterm-cli.sh help` nao mostra `conversation`

**Tests**: none
**Gate**: build

---

## Parallel Execution Map

```
Phase 1 (Component Cleanup — todos [P], paralelizaveis):
  T1 (delete banner) ─┤
  T2 (App.tsx) ───────┤  ← T2 depende de T1 (arquivo deletado)
  T3 (App.css) ───────┤
  T4 (CliInstallModal)─┤
  T5 (EditWorkspace) ──┼──→ T10 (preload bridge removal)
  T6 (ProjectSettings)─┤
  T7 (SessionInfoPanel)┤
  T8 (TerminalView) ───┤
  T9 (sessionStore) ───┘
  T11 (ptyManager) ────→

Phase 2 (Core — sequencial):
  T10 + T11 complete → T12 (main.ts) → T13 (types.ts)

Phase 3 (CLI + Docs — paralelo com Phase 2, [P]):
  T14 (CLI tools) ──┐
                    ├──→ T16 (verify)
  T15 (docs/assets) ┘

Phase 4 (Gate):
  T13 + T14 + T15 complete → T16 (verificacao final)
```

**Paralelismo:** Tarefas marcadas `[P]` nao compartilham estado mutavel e operam em arquivos distintos. T2 depende de T1 (banner deletado antes de App.tsx remover o import) — as demais componentes sao independentes entre si.

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Deletar banner | 1 arquivo (delete) | ✅ Granular |
| T2: Limpar App.tsx | 1 arquivo (editar) | ✅ Granular |
| T3: Limpar App.css | 1 arquivo (editar) | ✅ Granular |
| T4: Limpar CliInstallModal | 1 arquivo (editar) | ✅ Granular |
| T5: Limpar EditWorkspaceModal | 1 arquivo (editar) | ✅ Granular |
| T6: Limpar ProjectSettings | 1 arquivo (editar) | ✅ Granular |
| T7: Limpar SessionInfoPanel | 1 arquivo (editar) | ✅ Granular |
| T8: Limpar TerminalView | 1 arquivo (editar) | ✅ Granular |
| T9: Limpar sessionStore | 1 arquivo (editar) | ✅ Granular |
| T10: Limpar preload.ts | 1 arquivo (editar) | ✅ Granular |
| T11: Limpar ptyManager.ts | 1 arquivo (editar) | ✅ Granular |
| T12: Limpar main.ts | 1 arquivo (editar, ~60 refs) | ⚠️ Coeso — mesma unidade logica, mesmo arquivo |
| T13: Limpar types.ts | 1 arquivo (editar) | ✅ Granular |
| T14: Limpar CLI tools | 3 arquivos (2 edit + 1 delete + 1 dir) | ⚠️ Coeso — todos em `bin/`, mesma unidade logica |
| T15: Limpar docs/assets | 5 arquivos (2 edit + 3 delete) | ⚠️ Coeso — mesma unidade logica (docs+assets) |
| T16: Verificacao final | Projeto inteiro | ✅ Verificacao (nao e tarefa de implementacao) |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|----------------------|---------------|--------|
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | None | None (parallel) | ✅ Match |
| T4 | None | None (parallel) | ✅ Match |
| T5 | None | None (parallel) | ✅ Match |
| T6 | None | None (parallel) | ✅ Match |
| T7 | None | None (parallel) | ✅ Match |
| T8 | None | None (parallel) | ✅ Match |
| T9 | None | None (parallel) | ✅ Match |
| T10 | T1-T9 | T1-T9 → T10 | ✅ Match |
| T11 | None | None (parallel) | ✅ Match |
| T12 | T10, T1-T9 | T10+T11 → T12 | ✅ Match |
| T13 | T12, T10, T1-T9 | T12 → T13 | ✅ Match |
| T14 | T12 | T12 → T14 | ✅ Match |
| T15 | None | None (parallel with Phase 2) | ✅ Match |
| T16 | T13, T14, T15 | T13+T14+T15 → T16 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
|------|-----------|----------------|-----------|--------|
| T1-T16 | Todos | N/A (sem infra de testes) | none | ✅ OK |

**Nota:** O projeto nao possui infraestrutura de testes (TESTING.md confirma zero testes). Tasks usam `Tests: none` e `Gate: build` (unica verificacao disponivel: `pnpm build`).

---

## Requirement Traceability

| Task | Requirements Covered |
|------|---------------------|
| T1 | CLAUDE-02 |
| T2 | CLAUDE-03 |
| T3 | CLAUDE-04 |
| T4 | CLAUDE-05 |
| T5 | CLAUDE-06 |
| T6 | CLAUDE-07 |
| T7 | CLAUDE-08 |
| T8 | CLAUDE-09 |
| T9 | CLAUDE-10 |
| T10 | CLAUDE-12 |
| T11 | CLAUDE-14 |
| T12 | CLAUDE-13, CLAUDE-15 |
| T13 | CLAUDE-11 |
| T14 | CLAUDE-16, CLAUDE-17, CLAUDE-18 |
| T15 | CLAUDE-19, CLAUDE-20, CLAUDE-21, CLAUDE-22, CLAUDE-23 |
| T16 | CLAUDE-01 (verificacao de todos) |

**Coverage:** 23/23 requirements mapped to tasks ✅
