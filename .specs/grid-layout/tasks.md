# Grid Layout Tasks

**Design**: `.specs/grid-layout/design.md`
**Status**: Done

**Note**: Projeto sem test runner configurado (CLAUDE.md: "No test runner or linter is configured"). Gate = `npx tsc --noEmit` (TypeScript type-check). Tests = none.

---

## Execution Plan

### Phase 1: Foundation (Parallel OK)

```
T1 [P] ──┐
T2 [P] ──┼──→ T4, T5, T6
T3 [P] ──┘
```

### Phase 2: Core Components (Parallel OK)

```
T1 complete ──┐
T2 complete ──┼── T4 [P] ──┐
T3 complete ──┘   T5 [P] ──┼──→ T7
                   T6 [P] ──┘
```

### Phase 3: Grid Assembly (Parallel OK)

```
T4, T5, T6 done ──→ T7 [P] ──┐
T2 done          ──→ T8 [P] ──┼──→ T9, T10
```

### Phase 4: Integration (Parallel OK)

```
T7, T8 done ──→ T9 [P] ──┐
T7 done      ──→ T10 [P] ─┘
```

### Phase 5: Persistence (Sequential — main → preload → renderer)

```
T7 done ──→ T11 ──→ T12 ──→ T13 ──→ T14
```

### Phase 6: Edge Cases (Sequential)

```
T9, T10, T14 done ──→ T15
```

### Phase 7: Final Integration (Sequential)

```
T15 done ──→ T16
```

---

## Task Breakdown

### T1: Instalar react-resizable-panels [P]

**What**: Adicionar dependência `react-resizable-panels` ao projeto.
**Where**: `package.json`, `pnpm-lock.yaml`
**Depends on**: None
**Reuses**: N/A
**Requirement**: GRID-08 (base para redimensionamento)
**Tests**: none
**Gate**: build

**Done when**:
- [ ] `pnpm add react-resizable-panels` executa sem erros
- [ ] `npx tsc --noEmit` passa

**Verify**: `grep react-resizable-panels package.json` retorna a entrada.

---

### T2: Estender sessionStore com viewMode e gridLayout [P]

**What**: Adicionar campos `viewMode`, `gridLayout` e actions `setViewMode`, `setGridLayout`, `swapGridPanels` ao Zustand store.
**Where**: `src/store/sessionStore.ts`
**Depends on**: None
**Reuses**: Estrutura existente do Zustand store (create + set/get)
**Requirement**: GRID-01, GRID-24
**Tests**: none
**Gate**: build

**Done when**:
- [ ] `viewMode: 'sidebar' | 'grid'` com default `'sidebar'`
- [ ] `gridLayout: { [sessionId: string]: number }` com default `{}`
- [ ] `setViewMode(mode)` atualiza viewMode
- [ ] `setGridLayout(layout)` atualiza gridLayout
- [ ] `swapGridPanels(fromId, toId)` troca posições no array `sessions`
- [ ] Actions existentes (`setActive`, `addSession`, `removeSession`) inalteradas
- [ ] `npx tsc --noEmit` passa

**Verify**: No browser console, `useSessionStore.getState().setViewMode('grid')` e verificar `viewMode === 'grid'`.

---

### T3: Criar utilitário autoTile [P]

**What**: Implementar algoritmo de auto-tile que recebe array de sessionIds e retorna grid 2D (`string[][]`).
**Where**: `src/utils/autoTile.ts`
**Depends on**: None
**Reuses**: N/A (utilidade pura, sem dependências)
**Requirement**: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, GRID-06
**Tests**: none
**Gate**: build

**Done when**:
- [ ] 1 sessão → `[[id]]`
- [ ] 2 sessões → `[[id0], [id1]]` (2 cols)
- [ ] 3 sessões → `[[id0], [id1, id2]]` (col 0: 1 row, col 1: 2 rows)
- [ ] 4 sessões → `[[id0, id2], [id1, id3]]` (2 cols × 2 rows, preenchido por coluna)
- [ ] 5+ sessões → `ceil(sqrt(N))` cols, filled top-to-bottom per column
- [ ] `npx tsc --noEmit` passa

**Verify**: Testar no browser: `autoTile(['a','b','c','d'])` → `[['a','d'],['b'],['c']]` para 4 (ordem por coluna).

---

### T4: Criar PanelTitleBar [P]

**What**: Barra de título de cada painel do grid com nome da sessão, indicadores de status, e alça de drag.
**Where**: `src/components/PanelTitleBar.tsx`
**Depends on**: T2 (sessionStore types)
**Reuses**: `ContextCircle` de `src/components/ContextCircle.tsx`
**Requirement**: GRID-12, GRID-13, GRID-14
**Tests**: none
**Gate**: build

**Done when**:
- [ ] Exibe nome da sessão (com truncate para nomes longos)
- [ ] Exibe `ContextCircle` apenas quando `isFocused === true`
- [ ] Indicador running/stopped (bolinha verde/cinza)
- [ ] Classes CSS: `.panel-titlebar`, `.panel-titlebar.focused` (cor accent-color)
- [ ] Suporte a drag: `draggable={true}`, `onDragStart` callback
- [ ] Clique no título: chama `onFocus`
- [ ] Botão "i" para abrir SessionInfoPanel (se disponível)
- [ ] `npx tsc --noEmit` passa

**Verify**: Renderizar com `isFocused=true` e verificar borda/accent-color aplicados.

---

### T5: Refatorar TerminalView com prop variant [P]

**What**: Adicionar prop `variant: 'tab' | 'grid'` ao TerminalView. Modo `grid`: terminal sempre visível, sem `display:none/block`.
**Where**: `src/components/TerminalView.tsx`
**Depends on**: T2 (sessionStore types)
**Reuses**: Toda lógica existente de xterm.js, ResizeObserver, addons
**Requirement**: GRID-01
**Tests**: none
**Gate**: build

**Done when**:
- [ ] Nova prop `variant?: 'tab' | 'grid'` com default `'tab'`
- [ ] Modo `tab` (atual): comportamento inalterado — `display:none/block` via `active`
- [ ] Modo `grid`: terminal wrapper sempre `display: block`, `ResizeObserver` gerencia fit
- [ ] No modo `grid`, efeito de ativação (`requestAnimationFrame` + `terminal.refresh()`) é condicional — só executa se terminal estava hidden
- [ ] `active` prop no modo grid controla foco/input, não visibilidade
- [ ] Compatibilidade retroativa: todos consumers existentes funcionam sem passar `variant`
- [ ] `npx tsc --noEmit` passa

**Verify**: Modo sidebar (tab) funciona exatamente como antes. Modo grid: terminal visível mesmo com `active=false`.

---

### T6: Criar GridPanel [P]

**What**: Wrapper de cada célula do grid. Compõe PanelTitleBar + TerminalView. Gerencia estados de foco e atividade.
**Where**: `src/components/GridPanel.tsx`
**Depends on**: T4 (PanelTitleBar), T5 (TerminalView variant)
**Reuses**: `TerminalView` com `variant='grid'`, `PanelTitleBar`
**Requirement**: GRID-12, GRID-13, GRID-14, GRID-16, GRID-17
**Tests**: none
**Gate**: build

**Done when**:
- [ ] Recebe props: `sessionId`, `isFocused`, `onFocus` e session data do store
- [ ] Renderiza `PanelTitleBar` + `TerminalView` em coluna flex
- [ ] Borda colorida (`var(--accent-color)`) quando `isFocused`
- [ ] Sombra `box-shadow` no painel focado
- [ ] Suporte a drop target para drag-and-drop: handlers `onDragOver`, `onDragLeave`, `onDrop`
- [ ] Indicador sutil de atividade em painel não-focado (pulsação CSS na borda)
- [ ] CSS: `.grid-panel`, `.grid-panel.focused`, `.grid-panel.drop-target`
- [ ] `npx tsc --noEmit` passa

**Verify**: No grid com 3 painéis, focar cada um e verificar borda/sombra mudam.

---

### T7: Criar GridLayout com nested Groups [P]

**What**: Componente raiz do grid. Usa `react-resizable-panels` para construir árvore de `Group`/`Panel`/`Separator` aninhados via auto-tile.
**Where**: `src/components/GridLayout.tsx`
**Depends on**: T1 (lib instalada), T3 (autoTile), T6 (GridPanel)
**Reuses**: `react-resizable-panels` (`Group`, `Panel`, `Separator`), `autoTile`, `GridPanel`
**Requirement**: GRID-01 a GRID-07, GRID-08 a GRID-11, GRID-19
**Tests**: none
**Gate**: build

**Done when**:
- [ ] Usa `autoTile(sessionIds)` para determinar estrutura de grid
- [ ] Renderiza `Group direction="horizontal"` com colunas
- [ ] Cada coluna é `Group direction="vertical"` com painéis
- [ ] `Separator` entre todas as colunas e entre painéis dentro de cada coluna
- [ ] `minSize={10}` em todos os `Panel` para prevenir colapso
- [ ] `onLayoutChange` prop repassada do App para persistência futura
- [ ] Drag-and-drop: suporte a swap via `onDropSwap(fromId, toId)`
- [ ] `defaultLayout` aplicado quando disponível (restore de layout persistido)
- [ ] Reorganiza automaticamente quando `sessions` array muda (add/remove)
- [ ] CSS: `.grid-layout { flex: 1; overflow: hidden; }`
- [ ] `npx tsc --noEmit` passa

**Verify**: Abrir 3 sessões no grid, redimensionar painéis pelas bordas. Fechar uma sessão, verificar reorganização.

---

### T8: Criar GridToggle button [P]

**What**: Botão na titlebar que alterna entre `viewMode: 'sidebar'` e `viewMode: 'grid'`.
**Where**: `src/App.tsx` (titlebar section) + `src/components/Sidebar.tsx` (actions area)
**Depends on**: T2 (sessionStore viewMode)
**Reuses**: Padrão de ícones SVG inline da titlebar existente
**Requirement**: GRID-24, GRID-25, GRID-26
**Tests**: none
**Gate**: build

**Done when**:
- [ ] Ícone SVG de grid (4 quadrados) na titlebar
- [ ] Tooltip: "Grid Layout" / "Sidebar View"
- [ ] Ao clicar: alterna `viewMode` entre `'sidebar'` e `'grid'`
- [ ] Ícone visualmente indica modo ativo (highlight quando grid ativo)
- [ ] Botão também presente na área de ações da Sidebar
- [ ] Segue padrão de estilo dos botões existentes na titlebar
- [ ] `npx tsc --noEmit` passa

**Verify**: Clicar no botão 3x, verificar alternância sidebar ↔ grid no UI.

---

### T9: Integrar GridLayout no App.tsx [P]

**What**: Substituir `terminal-area` condicionalmente por `GridLayout` quando `viewMode === 'grid'`. Ajustar layout e comportamento do título.
**Where**: `src/App.tsx`
**Depends on**: T7 (GridLayout), T8 (GridToggle)
**Reuses**: Estrutura existente de `main-layout`, `TerminalView` com variant
**Requirement**: GRID-01, GRID-18, GRID-24, GRID-25, GRID-26
**Tests**: none
**Gate**: build

**Done when**:
- [ ] `main-layout` renderiza Sidebar apenas se `viewMode === 'sidebar' && sidebarMode !== 'hidden'`
- [ ] `main-layout` renderiza `GridLayout` se `viewMode === 'grid'`
- [ ] `main-layout` renderiza `terminal-area` atual se `viewMode === 'sidebar'`
- [ ] `SessionInfoPanel` usa modo overlay (`position: absolute`) quando em grid
- [ ] `NewSessionModal` funciona normalmente em ambos modos (já existente)
- [ ] `Cmd+1-9` navega corretamente no grid (mapeia índice → posição)
- [ ] Sidebar toggle (`Cmd+B`) não conflita com grid toggle
- [ ] `npx tsc --noEmit` passa

**Verify**: Alternar entre sidebar e grid com 3 sessões ativas. Criar nova sessão em ambos modos. Navegar com Cmd+1-4.

---

### T10: Implementar drag-and-drop para reordenar painéis [P]

**What**: Implementar swap de painéis via HTML5 Drag and Drop nos títulos dos painéis.
**Where**: `src/components/GridLayout.tsx` (handlers), `src/components/GridPanel.tsx` (drop target), `src/components/PanelTitleBar.tsx` (drag source)
**Depends on**: T7 (GridLayout render)
**Reuses**: HTML5 Drag and Drop API nativa
**Requirement**: GRID-34, GRID-35, GRID-36, GRID-37, GRID-38, GRID-39
**Tests**: none
**Gate**: build

**Done when**:
- [ ] `PanelTitleBar`: `draggable`, `onDragStart` → seta `dataTransfer` com `sessionId`
- [ ] `GridPanel`: `onDragOver` → `preventDefault()`, destaque visual (classe `.drop-target`)
- [ ] `GridPanel`: `onDragLeave` → remove destaque
- [ ] `GridPanel`: `onDrop` → lê `sessionId`, chama `onDropSwap(fromId, toId)`
- [ ] `GridLayout`: `onDropSwap` → `swapGridPanels(fromId, toId)` no store
- [ ] Painel arrastado fica com `opacity: 0.5` durante drag
- [ ] Painel alvo mostra `border: 2px dashed var(--accent-color)` durante hover
- [ ] `Escape` durante drag cancela operação
- [ ] Drag desabilitado quando `sessions.length <= 1`
- [ ] Cursor `not-allowed` quando sobre área não-drop
- [ ] `npx tsc --noEmit` passa

**Verify**: Grid com 3 sessões, arrastar painel A sobre painel C, verificar swap visual. Pressionar Escape durante drag, verificar cancelamento.

---

### T11: Estender saved-sessions.json com gridLayout state

**What**: Adicionar campo `gridLayout?` ao tipo `SavedWindowState` e modificar `saveWindowSessionState` para serializar estado do grid.
**Where**: `electron/main.ts`
**Depends on**: T7 (GridLayout — precisamos do formato do layout)
**Reuses**: `saveWindowSessionState`, `loadSavedSessions`, `schedulePersist` existentes
**Requirement**: GRID-27, GRID-28, GRID-29
**Tests**: none
**Gate**: build

**Done when**:
- [ ] Tipo `GridLayoutPersisted` definido: `{ mode: 'grid', layout: { [id: string]: number }, activeSessionId: string }`
- [ ] Campo `gridLayout?: GridLayoutPersisted` adicionado a `SavedWindowState`
- [ ] `saveWindowSessionState`: quando viewMode é grid, salva layout + activeSessionId
- [ ] `saveWindowSessionState`: quando viewMode é sidebar, salva `gridLayout: undefined` (limpa)
- [ ] `getSavedSessions` handler retorna `gridLayout` no payload
- [ ] `npx tsc --noEmit` passa para o código main process

**Verify**: Abrir grid, mover painéis, fechar app. Inspecionar `saved-sessions.json` — deve conter `gridLayout`.

---

### T12: Adicionar IPC handlers para grid layout

**What**: Criar handlers `session:set-grid-layout` e `session:get-grid-layout` no main process.
**Where**: `electron/main.ts`
**Depends on**: T11 (schema definido)
**Reuses**: Infraestrutura IPC existente (`ipcMain.handle`, `ipcMain.on`)
**Requirement**: GRID-29, GRID-30
**Tests**: none
**Gate**: build

**Done when**:
- [ ] `ipcMain.handle('session:set-grid-layout', ...)`: recebe `GridLayoutPersisted`, armazena no `PtyManager`, dispara `schedulePersist`
- [ ] `ipcMain.handle('session:get-grid-layout', ...)`: retorna `gridLayout` do saved state ou `null`
- [ ] Integrado com `schedulePersist` (debounce 800ms) para salvar após mudanças
- [ ] `npx tsc --noEmit` passa

**Verify**: Do renderer, chamar `saveGridLayout(state)` via IPC, verificar `saved-sessions.json` atualizado.

---

### T13: Adicionar APIs no preload

**What**: Expor `saveGridLayout` e `getGridLayout` no `window.forgeterm` via preload.
**Where**: `electron/preload.ts`, `shared/types.ts` (ForgeTermAPI interface)
**Depends on**: T12 (IPC handlers)
**Reuses**: Padrão existente de `contextBridge.exposeInMainWorld`
**Requirement**: GRID-27, GRID-28, GRID-29, GRID-30
**Tests**: none
**Gate**: build

**Done when**:
- [ ] `saveGridLayout(state: GridLayoutPersisted): Promise<void>` no preload
- [ ] `getGridLayout(): Promise<GridLayoutPersisted | null>` no preload
- [ ] Tipos adicionados a `ForgeTermAPI` em `shared/types.ts`
- [ ] `GridLayoutPersisted` type exportado de shared/types
- [ ] `npx tsc --noEmit` passa

**Verify**: No console do renderer: `await window.forgeterm.saveGridLayout({ mode: 'grid', layout: {}, activeSessionId: 'x' })` não lança erro.

---

### T14: Conectar persistência ao GridLayout e Store

**What**: Integrar `onLayoutChanged` do GridLayout com persistência. Restaurar layout no startup.
**Where**: `src/App.tsx` (startup), `src/components/GridLayout.tsx` (onLayoutChanged)
**Depends on**: T13 (preload APIs), T9 (integração App)
**Reuses**: Fluxo existente de restore de `saved-sessions`
**Requirement**: GRID-27, GRID-28, GRID-29, GRID-30, GRID-31, GRID-32, GRID-33
**Tests**: none
**Gate**: build

**Done when**:
- [ ] `GridLayout.onLayoutChange` → chama `window.forgeterm.saveGridLayout({ layout, activeSessionId })`
- [ ] Startup (App.tsx useEffect): após restore de sessões, verifica `getGridLayout()`
- [ ] Se `gridLayout` restaurado → seta `viewMode: 'grid'` e aplica layout via `defaultLayout`
- [ ] Se `gridLayout.mode === 'sidebar'` → inicia em sidebar (default)
- [ ] Se sessão do layout não existe → ignora, aplica auto-tile com restantes (GRID-31)
- [ ] Se saved-sessions.json tem sessões diferentes do grid → auto-tile (GRID-32)
- [ ] `npx tsc --noEmit` passa

**Verify**: Abrir grid com 3 sessões, redimensionar, fechar app, reabrir. Grid deve aparecer idêntico.

---

### T15: Tratar edge cases

**What**: Implementar tratamento de todos os edge cases listados na spec.
**Where**: `src/App.tsx`, `src/components/GridLayout.tsx`, `electron/main.ts`
**Depends on**: T9 (App integração), T10 (drag-and-drop), T14 (persistência)
**Reuses**: N/A
**Requirement**: Edge cases (todos listados na spec)
**Tests**: none
**Gate**: build

**Done when**:
- [ ] Janela < 400px no grid → colapsar para painel único empilhado
- [ ] Todas sessões fechadas no grid → voltar para sidebar + estado vazio
- [ ] Renomear sessão (Cmd+R) no grid → input inline na PanelTitleBar
- [ ] Busca global (Cmd+Shift+F) no grid → overlay sobre o grid
- [ ] Restart/kill sessão no grid → indicador de status atualiza em tempo real
- [ ] Layout salvo corrompido → fallback para sidebar (try/catch no JSON.parse)
- [ ] Cursor "not-allowed" ao arrastar painel sobre área não-drop
- [ ] Layout restaurado com viewport diferente → ajuste proporcional
- [ ] `npx tsc --noEmit` passa

**Verify**: Testar cada edge case manualmente conforme lista acima.

---

### T16: Verificação final de integração

**What**: Teste completo de integração: todos os fluxos funcionando juntos, sem regressões no modo sidebar.
**Where**: Build completo (`pnpm build`)
**Depends on**: T15 (todos edge cases)
**Reuses**: N/A
**Requirement**: Todos os GRID-* (verificação de coverage)
**Tests**: none
**Gate**: build (full)

**Done when**:
- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `pnpm build` completa com sucesso (vite build + electron-builder)
- [ ] Modo sidebar: todas funcionalidades existentes preservadas
  - [ ] Criar/fechar/renomear/alternar sessões
  - [ ] Cmd+1-9 navegação
  - [ ] Cmd+T nova sessão
  - [ ] Cmd+W fecha sessão
  - [ ] Cmd+B sidebar toggle (full/compact/hidden)
  - [ ] Sidebar redimensionamento
  - [ ] SessionInfoPanel
  - [ ] Busca global
  - [ ] Indicadores de atividade (unread/working)
- [ ] Modo grid: todos os fluxos P1-P8 funcionais
  - [ ] Auto-tile para 1-9+ sessões
  - [ ] Redimensionamento livre de painéis
  - [ ] Indicadores de foco
  - [ ] Criação de sessão com auto-encaixe
  - [ ] SessionInfoPanel como overlay
  - [ ] Toggle sidebar ↔ grid
  - [ ] Persistência do layout
  - [ ] Drag-and-drop para reordenar
- [ ] App inicia corretamente com/sem estado persistido

**Verify**: `pnpm dev` e teste manual de todos os fluxos listados acima.

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Instalar react-resizable-panels | 1 package install | ✅ Granular |
| T2: Estender sessionStore | 1 file, 3 fields, 3 actions | ✅ Granular |
| T3: Criar autoTile utility | 1 function, 1 file | ✅ Granular |
| T4: Criar PanelTitleBar | 1 component | ✅ Granular |
| T5: Refatorar TerminalView | 1 file, 1 new prop | ✅ Granular |
| T6: Criar GridPanel | 1 component | ✅ Granular |
| T7: Criar GridLayout | 1 component | ✅ Granular |
| T8: Criar GridToggle | 1 feature em 2 locais | ⚠️ Cohesive |
| T9: Integrar no App.tsx | 1 file, conditional rendering | ✅ Granular |
| T10: Drag-and-drop | 3 files, 1 feature | ⚠️ Cohesive |
| T11: Estender saved-sessions.json | 1 file, type + serialization | ✅ Granular |
| T12: IPC handlers | 2 handlers, 1 file | ✅ Granular |
| T13: Preload APIs | 2 APIs, 2 files (preload + types) | ✅ Granular |
| T14: Conectar persistência | 2 files, startup + callback | ✅ Granular |
| T15: Edge cases | Múltiplas condições | ⚠️ Cohesive |
| T16: Verificação final | Teste de integração | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T1 | None | Phase 1 independent | ✅ Match |
| T2 | None | Phase 1 independent | ✅ Match |
| T3 | None | Phase 1 independent | ✅ Match |
| T4 | T2 | T1,T2,T3 → T4,T5,T6 | ✅ Match |
| T5 | T2 | T1,T2,T3 → T4,T5,T6 | ✅ Match (implicit T1 for variant grid) |
| T6 | T4, T5 | T4,T5,T6 → T7 | ✅ Match |
| T7 | T1, T3, T6 | T4,T5,T6 → T7 | ✅ Match |
| T8 | T2 | T2 → T8 | ✅ Match |
| T9 | T7, T8 | T7,T8 → T9,T10 | ✅ Match |
| T10 | T7 | T7 → T10 | ✅ Match |
| T11 | T7 | T7 → T11 | ✅ Match |
| T12 | T11 | T11 → T12 | ✅ Match |
| T13 | T12 | T12 → T13 | ✅ Match |
| T14 | T13, T9 | T13 → T14 | ✅ Match |
| T15 | T9, T10, T14 | T9,T10,T14 → T15 | ✅ Match |
| T16 | T15 | T15 → T16 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
|------|------------|-----------------|-----------|--------|
| T1-T16 | N/A (sem TESTING.md) | N/A | Tests: none | ✅ OK |

**Nota**: Projeto não possui test runner configurado. TypeScript compilation (`npx tsc --noEmit`) é o único gate disponível.

---

## Parallel Execution Map

```
Phase 1 (Foundation — 3 parallel):
  ┌── T1 [P]
  ├── T2 [P]
  └── T3 [P]

Phase 2 (Core Components — 3 parallel):
  T1,T2,T3 done, then:
  ┌── T4 [P]
  ├── T5 [P]
  └── T6 [P]

Phase 3 (Grid Assembly — 2 parallel):
  T4,T5,T6 done, then:
  ┌── T7 [P]
  └── T8 [P]

Phase 4 (Integration — 2 parallel):
  T7,T8 done, then:
  ┌── T9 [P]
  └── T10 [P]

Phase 5 (Persistence — Sequential chain):
  T7 done, then:
  T11 → T12 → T13 → T14

Phase 6 (Edge Cases):
  T9,T10,T14 done, then:
  T15

Phase 7 (Final):
  T15 done, then:
  T16

Total: 16 tasks, 6 phases with parallelism, 1 sequential chain
```
