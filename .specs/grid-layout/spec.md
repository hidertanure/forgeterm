# Grid Layout Specification

## Problem Statement

O modelo atual do ForgeTerm exibe apenas um terminal por vez (selecionado via sidebar). Usuários com 2-4 sessões simultâneas precisam alternar constantemente entre elas para monitorar outputs e estado. Isso causa perda de contexto e dificulta a visibilidade do que está acontecendo em cada sessão.

## Goals

- [x] Permitir visualizar múltiplos terminais simultaneamente em layout de grid redimensionável
- [x] Manter o modo sidebar existente como alternativa, com toggle simples entre os modos
- [x] Preservar todas as funcionalidades existentes (criação de sessão, atalhos, busca, info panel) no modo grid

## Out of Scope

| Feature               | Reason                                              |
| --------------------- | --------------------------------------------------- |
| Grid em janelas separadas do SO | O escopo é grid dentro da mesma janela. Janelas independentes são feature separada. |
| Layouts customizados salvos por projeto | Fora do MVP. Pode ser considerado futuramente. |

---

## User Stories

### P1: Visualização simultânea de múltiplos terminais ⭐ MVP

**User Story**: Como desenvolvedor, quero ver todos os meus terminais abertos lado a lado em um grid redimensionável, para monitorar o estado e output de todas as sessões sem precisar alternar entre elas.

**Why P1**: É o core da feature. Sem isso, nada mais faz sentido.

**Acceptance Criteria**:

1. WHEN o usuário alterna para o modo grid (via botão na titlebar/sidebar) THEN o sistema SHALL ocultar a sidebar e exibir todos os terminais abertos em layout de grid
2. WHEN há apenas 1 sessão ativa THEN o terminal SHALL ocupar 100% da área disponível
3. WHEN há 2 sessões THEN o sistema SHALL dividir a área em 2 colunas de largura igual (split vertical)
4. WHEN há 3 sessões THEN o sistema SHALL exibir 1 coluna à esquerda (50% largura) e 2 linhas à direita (50% largura, 50% altura cada)
5. WHEN há 4 sessões THEN o sistema SHALL exibir grid 2x2 balanceado
6. WHEN há 5+ sessões THEN o sistema SHALL usar grid 3x2 ou maior, preenchendo por linha da esquerda para direita
7. WHEN uma sessão é fechada (Cmd+W) no modo grid THEN o grid SHALL se reorganizar automaticamente preenchendo o espaço vago

**Independent Test**: Abrir ForgeTerm com 2+ sessões, clicar no botão de grid, verificar que todos os terminais aparecem lado a lado e que ao fechar uma sessão o grid se reorganiza.

---

### P2: Redimensionamento livre dos painéis

**User Story**: Como desenvolvedor, quero redimensionar os painéis do grid arrastando as bordas entre eles, para dar mais espaço ao terminal que estou usando no momento.

**Why P2**: Essencial para usabilidade diária, mas a funcionalidade base de ver múltiplos terminais funciona sem isso.

**Acceptance Criteria**:

1. WHEN o usuário arrasta uma borda entre dois painéis adjacentes THEN o sistema SHALL redimensionar ambos os painéis proporcionalmente em tempo real
2. WHEN o cursor está sobre uma borda entre painéis THEN o sistema SHALL exibir o cursor de resize apropriado (col-resize para borda vertical, row-resize para borda horizontal)
3. WHEN o redimensionamento reduz um painel abaixo de 150px de largura ou 100px de altura THEN o sistema SHALL impedir o redimensionamento adicional (limite mínimo)
4. WHEN o tamanho da janela do app é alterado THEN o sistema SHALL manter as proporções relativas entre os painéis

**Independent Test**: No modo grid com 2+ sessões, arrastar a borda entre painéis e verificar que ambos redimensionam, que o cursor muda, e que há limite mínimo.

---

### P3: Indicador de foco e identificação de sessão

**User Story**: Como desenvolvedor, quero identificar visualmente qual terminal está com foco e qual sessão cada painel representa, para navegar rapidamente entre eles.

**Why P3**: Usabilidade importante mas o grid funciona sem indicadores visuais rebuscados.

**Acceptance Criteria**:

1. WHEN um painel do grid está com foco THEN o sistema SHALL exibir uma borda destacada com a cor de destaque do tema ao redor do painel
2. WHEN um painel do grid está com foco THEN o sistema SHALL destacar o título da sessão na barra de título do painel
3. WHEN o usuário clica em um painel do grid THEN o sistema SHALL transferir o foco para aquele terminal e atualizar o indicador visual
4. WHEN o usuário pressiona Cmd+1 até Cmd+9 THEN o sistema SHALL transferir o foco para o terminal correspondente à posição no grid
5. WHEN o indicador de contexto do Claude está ativo THEN o sistema SHALL exibi-lo apenas no painel com foco (não em todos os painéis)
6. WHEN um painel sem foco tem atividade nova (output do PTY) THEN o sistema SHALL indicar sutilmente (ex: leve brilho na borda ou indicador mínimo) que houve atividade

**Independent Test**: No modo grid, clicar em diferentes painéis e verificar que borda e título mudam. Pressionar Cmd+1-4 e verificar navegação.

---

### P4: Criação de sessões no modo grid

**User Story**: Como desenvolvedor, quero criar novas sessões enquanto estou no modo grid, com o grid se reorganizando automaticamente para acomodá-las.

**Why P4**: Funcionalidade essencial mas pode ser usada com workaround (voltar ao modo sidebar para criar).

**Acceptance Criteria**:

1. WHEN o usuário pressiona Cmd+T ou Cmd+N no modo grid THEN o sistema SHALL abrir o modal de nova sessão normalmente
2. WHEN uma nova sessão é criada no modo grid THEN o grid SHALL se reorganizar automaticamente seguindo a mesma lógica de auto-tile do P1
3. WHEN a nova sessão é do tipo idle (parada) THEN o sistema SHALL exibi-la no grid com indicador visual de sessão parada

**Independent Test**: No modo grid com 2 sessões, criar uma terceira e verificar que o grid reorganiza para layout de 3 painéis.

---

### P5: Painel de informações da sessão (SessionInfoPanel)

**User Story**: Como desenvolvedor, quero acessar as informações detalhadas de uma sessão (contexto Claude, timeline) sem quebrar o layout do grid.

**Why P5**: Usabilidade complementar. O modal de info já existe e precisa funcionar no novo modo.

**Acceptance Criteria**:

1. WHEN o usuário abre o SessionInfoPanel no modo grid THEN o sistema SHALL exibi-lo como overlay flutuante sobre o terminal ativo
2. WHEN o overlay está aberto THEN o sistema SHALL permitir fechá-lo clicando fora ou no botão de fechar
3. WHEN o overlay está aberto e o usuário muda o foco para outro painel THEN o sistema SHALL fechar o overlay automaticamente

**Independent Test**: No modo grid, abrir info panel de uma sessão e verificar que aparece como overlay sem redimensionar o grid.

---

### P6: Toggle entre modos (sidebar ↔ grid)

**User Story**: Como desenvolvedor, quero alternar facilmente entre o modo sidebar tradicional e o novo modo grid, mantendo a preferência durante a sessão.

**Why P6**: Essencial para adoção. Usuários precisam de ambos os modos dependendo da tarefa.

**Acceptance Criteria**:

1. WHEN o usuário clica no botão de toggle na titlebar/sidebar THEN o sistema SHALL alternar entre modo sidebar e modo grid
2. WHEN o usuário alterna do modo grid para sidebar THEN o sistema SHALL preservar a sessão ativa no grid como a sessão selecionada na sidebar
3. WHEN o usuário alterna da sidebar para o grid THEN o sistema SHALL aplicar auto-tile com todas as sessões abertas e focar a sessão que estava ativa na sidebar
4. WHEN o app inicia e há layout de grid persistido da sessão anterior THEN o sistema SHALL restaurar o modo grid com o layout salvo
5. WHEN o app inicia e não há layout de grid persistido THEN o sistema SHALL iniciar no modo sidebar (comportamento atual)

**Independent Test**: Alternar entre modos 3x e verificar que todas as sessões são preservadas e o foco é mantido. Fechar o app em modo grid, reabrir e verificar que volta no mesmo layout.

---

### P7: Persistência do layout do grid entre sessões do app

**User Story**: Como desenvolvedor, quero que o arranjo do grid (posições, tamanhos, sessão ativa) seja salvo ao fechar o app e restaurado ao reabrir, para não precisar reorganizar os painéis toda vez que inicio o ForgeTerm.

**Why P7**: Importante para fluxo de trabalho contínuo. Sem isso, o usuário precisa reconfigurar o grid em cada inicialização.

**Acceptance Criteria**:

1. WHEN o app é fechado (quit) enquanto está em modo grid THEN o sistema SHALL salvar o estado do layout (posição de cada sessão no grid, proporções de tamanho, sessão ativa) junto com o estado de sessões já existente
2. WHEN o app é reaberto e havia layout de grid salvo THEN o sistema SHALL restaurar o grid com as mesmas sessões nas mesmas posições e proporções
3. WHEN o app é reaberto e uma sessão do layout salvo não existe mais THEN o sistema SHALL ignorar apenas aquela sessão e reorganizar as restantes com auto-tile
4. WHEN o layout é restaurado e sessões foram adicionadas/removidas via restore do saved-sessions.json THEN o sistema SHALL aplicar auto-tile para distribuir as sessões restauradas, ignorando o layout de grid
5. WHEN o usuário está em modo sidebar ao fechar o app THEN o sistema SHALL salvar modo sidebar (não salva layout de grid) e restaurar sidebar ao reabrir

**Independent Test**: Configurar grid com 3 sessões, redimensionar painéis, fechar app, reabrir, verificar grid idêntico.

---

### P8: Drag-and-drop para reordenar painéis

**User Story**: Como desenvolvedor, quero arrastar a barra de título de um painel do grid para trocá-lo de posição com outro, para reorganizar rapidamente a disposição dos terminais.

**Why P8**: Complementa o redimensionamento (P2) com reordenação visual rápida. Sem isso, a única forma de mudar a ordem é fechar e recriar sessões.

**Acceptance Criteria**:

1. WHEN o usuário inicia o arrasto a partir da barra de título de um painel THEN o sistema SHALL iniciar o drag com o painel seguindo o cursor em opacidade reduzida
2. WHEN o painel arrastado está sobre outro painel (hover) THEN o sistema SHALL destacar o painel alvo com indicador visual (ex: borda tracejada ou brilho)
3. WHEN o usuário solta o painel sobre outro painel THEN o sistema SHALL trocar as duas sessões de posição no grid
4. WHEN o usuário solta o painel fora de qualquer painel alvo THEN o sistema SHALL cancelar a operação e retornar o painel à posição original
5. WHEN o grid tem apenas 1 sessão THEN o sistema SHALL desabilitar drag (não há com quem trocar)
6. WHEN o usuário pressiona Escape durante o drag THEN o sistema SHALL cancelar a operação

**Independent Test**: No modo grid com 3 sessões, arrastar painel A sobre painel C, verificar que trocaram de posição.

---

## Edge Cases

- WHEN o usuário redimensiona a janela do app para menos de 400px de largura no modo grid THEN o sistema SHALL colapsar para exibição de painel único (modo empilhado)
- WHEN todas as sessões são fechadas no modo grid THEN o sistema SHALL automaticamente voltar ao modo sidebar e mostrar o estado vazio padrão
- WHEN uma sessão é renomeada (Cmd+R) no modo grid THEN o sistema SHALL mostrar o input inline na barra de título do painel correspondente
- WHEN o usuário inicia busca global (Cmd+Shift+F) no modo grid THEN o sistema SHALL abrir o painel de busca normalmente, com overlay sobre o grid
- WHEN uma sessão no grid é restartada/killed THEN o indicador de status no painel SHALL atualizar em tempo real
- WHEN o modo compacto da sidebar está ativo e o usuário alterna para grid THEN o grid SHALL iniciar normalmente (modo compacto não se aplica ao grid)
- WHEN o layout de grid salvo está corrompido ou ilegível THEN o sistema SHALL ignorá-lo e iniciar em modo sidebar com auto-tile
- WHEN o usuário arrasta um painel sobre uma área que não é um painel alvo válido THEN o cursor SHALL indicar que o drop não é permitido (ex: cursor "not-allowed")
- WHEN o layout de grid é restaurado e a janela do app tem tamanho diferente da sessão anterior THEN o sistema SHALL ajustar proporcionalmente os tamanhos dos painéis ao viewport atual

---

## Requirement Traceability

| Requirement ID    | Story                          | Phase  | Status  |
| ----------------- | ------------------------------ | ------ | ------- |
| GRID-01           | P1: Visualização simultânea    | Verified | ✅ |
| GRID-02           | P1: Auto-tile 1 sessão         | Verified | ✅ |
| GRID-03           | P1: Auto-tile 2 sessões        | Verified | ✅ |
| GRID-04           | P1: Auto-tile 3 sessões        | Verified | ✅ |
| GRID-05           | P1: Auto-tile 4 sessões        | Verified | ✅ |
| GRID-06           | P1: Auto-tile 5+ sessões       | Verified | ✅ |
| GRID-07           | P1: Reorganizar ao fechar      | Verified | ✅ |
| GRID-08           | P2: Redimensionamento livre    | Verified | ✅ |
| GRID-09           | P2: Cursor de resize           | Verified | ✅ |
| GRID-10           | P2: Limite mínimo de tamanho   | Verified | ✅ |
| GRID-11           | P2: Manter proporções ao resize da janela | Verified | ✅ |
| GRID-12           | P3: Indicador de foco (borda)  | Verified | ✅ |
| GRID-13           | P3: Título destacado           | Verified | ✅ |
| GRID-14           | P3: Clique para focar          | Verified | ✅ |
| GRID-15           | P3: Cmd+1-9 para navegar       | Verified | ✅ |
| GRID-16           | P3: Anel de contexto só no foco | Verified | ✅ |
| GRID-17           | P3: Indicador de atividade em bg | Verified | ✅ |
| GRID-18           | P4: Modal de nova sessão       | Verified | ✅ |
| GRID-19           | P4: Auto-tile ao criar sessão  | Verified | ✅ |
| GRID-20           | P4: Sessão idle no grid        | Verified | ✅ |
| GRID-21           | P5: Overlay de info            | Verified | ✅ |
| GRID-22           | P5: Fechar overlay             | Verified | ✅ |
| GRID-23           | P5: Fechar ao mudar foco       | Verified | ✅ |
| GRID-24           | P6: Botão de toggle            | Verified | ✅ |
| GRID-25           | P6: Preservar sessão ativa     | Verified | ✅ |
| GRID-26           | P6: Auto-tile ao entrar no grid | Verified | ✅ |
| GRID-27           | P6: Restaurar grid persistido  | Verified | ✅ |
| GRID-28           | P6: Fallback sidebar sem persistencia | Verified | ✅ |
| GRID-29           | P7: Salvar layout ao fechar    | Verified | ✅ |
| GRID-30           | P7: Restaurar grid ao reabrir  | Verified | ✅ |
| GRID-31           | P7: Ignorar sessão inexistente | Verified | ✅ |
| GRID-32           | P7: Auto-tile quando saved-sessions difere | Verified | ✅ |
| GRID-33           | P7: Salvar modo sidebar        | Verified | ✅ |
| GRID-34           | P8: Iniciar drag pela titlebar | Verified | ✅ |
| GRID-35           | P8: Destacar painel alvo       | Verified | ✅ |
| GRID-36           | P8: Trocar posições ao soltar  | Verified | ✅ |
| GRID-37           | P8: Cancelar ao soltar fora    | Verified | ✅ |
| GRID-38           | P8: Desabilitar com 1 sessão   | Verified | ✅ |
| GRID-39           | P8: Cancelar com Escape        | Verified | ✅ |

**Coverage:** 39 total, 39 verified ✅, 0 unmapped

---

## Success Criteria

- [x] Usuário consegue visualizar 2-4 terminais simultaneamente sem perda de funcionalidade
- [x] Alternância entre modos sidebar/grid leva menos de 1 segundo
- [x] Redimensionamento de painéis é responsivo (sem lag perceptível ao arrastar)
- [x] Nenhuma funcionalidade existente é quebrada no modo sidebar tradicional
- [x] Layout do grid sobrevive a fechar/reabrir o app (persistência)
- [x] Reordenação por drag-and-drop funciona com feedback visual claro
