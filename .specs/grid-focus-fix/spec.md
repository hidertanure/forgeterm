# Correção de Foco e Bordas no Modo Grid

## Problem Statement

No modo grid, dois bugs comprometem a experiência de uso: (1) as bordas inferiores dos painéis de terminal são cortadas visualmente devido ao `overflow: hidden` nos contêineres; (2) clicar diretamente na área do terminal (xterm.js) para digitar não atualiza o indicador visual de foco do painel — o `activeSessionId` só é alterado ao clicar na titlebar. O terminal aceita input mas o painel permanece visualmente como não-focado.

## Goals

- [ ] Borda inferior dos painéis `.grid-panel` visível sem cortes em todos os estados (normal, focado, drop-target)
- [ ] Clicar em qualquer área do painel (titlebar OU terminal xterm) atualiza `activeSessionId` e aplica o indicador visual de foco

## Out of Scope

| Feature                    | Reason                        |
| -------------------------- | ----------------------------- |
| Indicador de foco da janela no OS (macOS) | O foco aqui é foco interno entre painéis |
| Modo tabs/sidebar          | Os bugs reportados são específicos do modo grid |
| Redesenho do indicador de foco | O design atual (borda accent-color + box-shadow) é mantido |

---

## User Stories

### P1: Borda inferior dos painéis visível sem cortes ⭐ MVP

**User Story**: As a usuário do modo grid, quero ver a borda completa dos painéis de terminal para identificar visualmente os limites de cada painel e o estado de foco.

**Why P1**: Borda cortada é um defeito visual que afeta todos os painéis, degradando a estética e a usabilidade da interface.

**Acceptance Criteria**:

1. WHEN um painel `.grid-panel` é renderizado no modo grid THEN o sistema SHALL exibir suas 4 bordas completas (topo, direita, inferior, esquerda) sem cortes visíveis
2. WHEN um painel está no estado focado (`border-width: 2px`) THEN o sistema SHALL exibir a borda inferior completa, sem clipping
3. WHEN um painel está no estado drop-target (`border-width: 2px`, `border-style: dashed`) THEN o sistema SHALL exibir a borda inferior completa, sem clipping
4. WHEN o layout grid é redimensionado THEN o sistema SHALL manter a visibilidade completa das bordas inferiores de todos os painéis

**Independent Test**: Abrir 2+ terminais no modo grid e inspecionar visualmente — as bordas inferiores de cada painel devem estar completamente visíveis. Redimensionar a janela e verificar novamente.

---

### P2: Clique no terminal atualiza indicador de foco do painel ⭐ MVP

**User Story**: As a usuário do modo grid, quero que ao clicar diretamente na área de digitação do terminal, o painel correspondente receba o indicador visual de foco (borda accent-color), para ter feedback visual consistente independente de onde clico no painel.

**Why P1**: A inconsistência entre "terminal aceita input" e "painel parece não-focado" causa confusão — o usuário digita mas não sabe qual painel está ativo.

**Acceptance Criteria**:

1. WHEN o usuário clica na área do terminal xterm de um painel no modo grid THEN o sistema SHALL definir `activeSessionId` para o sessionId desse painel e aplicar os estilos de foco (borda accent-color + box-shadow + titlebar colorida)
2. WHEN o usuário clica na titlebar de um painel no modo grid THEN o sistema SHALL definir `activeSessionId` para o sessionId desse painel E direcionar o foco do teclado para o terminal xterm (`terminal.focus()`)
3. WHEN `activeSessionId` muda para um painel no modo grid THEN o sistema SHALL chamar `terminal.focus()` no xterm desse painel para garantir que input de teclado vá para o terminal correto
4. WHEN o usuário usa atalhos de teclado para trocar de painel (Cmd+1-9) no modo grid THEN o sistema SHALL atualizar `activeSessionId` E focar o terminal xterm correspondente (comportamento atual deve ser preservado)

**Independent Test**: Modo grid com 2 terminais. Clicar no terminal A (não na titlebar) — borda deve ficar accent-color. Clicar no terminal B — borda de B deve ficar accent-color e a de A voltar ao normal. Digitar após cada clique deve funcionar no terminal esperado.

---

## Edge Cases

- WHEN há apenas 1 painel no modo grid THEN o painel único deve exibir indicador de foco por padrão
- WHEN o modo grid tem 0 sessões THEN o sistema deve retornar ao modo sidebar (comportamento existente)
- WHEN o usuário clica na área de scrollbar do terminal THEN o foco do painel deve ser atualizado (o clique é dentro do wrapper do terminal)
- WHEN um painel está no estado `dragging` (opacity: 0.5) THEN a borda inferior deve permanecer visível sem cortes mesmo com opacidade reduzida
- WHEN a janela é muito estreita (modo narrow/empilhado) THEN as bordas dos painéis devem permanecer visíveis sem cortes

---

## Requirement Traceability

| Requirement ID | Story                      | Phase       | Status      |
| -------------- | -------------------------- | ----------- | ----------- |
| GRID-01        | P1: Borda inferior visível | Implemented | Verified    |
| GRID-02        | P2: Foco ao clicar no terminal | Implemented | Verified    |
| GRID-03        | P2: Foco do xterm ao ativar painel | Implemented | Verified    |

**ID format:** `GRID-[NUMBER]`

**Coverage:** 3 total, 3 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Todas as 4 bordas de qualquer `.grid-panel` visíveis sem clipping em qualquer estado (focused, unfocused, drop-target, dragging)
- [ ] Clicar no terminal xterm em grid mode atualiza o `activeSessionId` e aplica estilos visuais de foco imediatamente
- [ ] Clicar na titlebar em grid mode foca o terminal xterm (`terminal.focus()`) para que input funcione sem clique adicional
- [ ] Nenhuma regressão no modo tabs/sidebar
