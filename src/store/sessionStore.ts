import { create } from 'zustand'
import type { SessionActivityStatus, SessionActivitySignal, SessionContext } from '../../shared/types'

export interface Session {
  id: string
  name: string
  command?: string
  running: boolean
  activityStatus: SessionActivityStatus
  info?: SessionContext
  contextPercent?: number
  conversationId?: string
  // True once a precise activity signal (`ft activity`) has been
  // seen for this session. Disables the PTY-output heuristic so the two never fight.
  hookManaged?: boolean
}

type ViewMode = 'sidebar' | 'grid'

interface SessionStore {
  sessions: Session[]
  activeSessionId: string | null
  // Transient signal: when set, the Sidebar opens inline rename for this session.
  renameRequestId: string | null
  viewMode: ViewMode
  gridLayout: { [sessionId: string]: number }
  addSession: (session: Omit<Session, 'activityStatus'>) => void
  removeSession: (id: string) => void
  setActive: (id: string) => void
  setRunning: (id: string, running: boolean) => void
  renameSession: (id: string, name: string) => void
  setSessionInfo: (id: string, info: SessionContext) => void
  setConversationId: (id: string, conversationId: string) => void
  setContextPercent: (id: string, percent: number) => void
  setActivityStatus: (id: string, status: SessionActivityStatus) => void
  markSessionWorking: (id: string) => void
  applyActivitySignal: (id: string, signal: SessionActivitySignal, viewing: boolean) => void
  requestRename: (id: string) => void
  clearRenameRequest: () => void
  setViewMode: (mode: ViewMode) => void
  setGridLayout: (layout: { [sessionId: string]: number }) => void
  swapGridPanels: (fromId: string, toId: string) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  activeSessionId: null,
  renameRequestId: null,

  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, { ...session, activityStatus: 'idle' }],
      activeSessionId: state.activeSessionId ?? session.id,
    })),

  removeSession: (id) =>
    set((state) => {
      const idx = state.sessions.findIndex((s) => s.id === id)
      const sessions = state.sessions.filter((s) => s.id !== id)
      let activeSessionId = state.activeSessionId
      if (activeSessionId === id) {
        // Pick adjacent session: prefer next, fall back to previous
        const nextIdx = Math.min(idx, sessions.length - 1)
        activeSessionId = nextIdx >= 0 ? sessions[nextIdx].id : null
      }
      return { sessions, activeSessionId }
    }),

  setActive: (id) =>
    set((state) => ({
      activeSessionId: id,
      // Visiting a session clears the unread/needs-attention dot. A hook-managed
      // session that is actively working keeps its loading indicator (a later
      // 'done'/'attention' signal clears it); heuristic sessions clear on view.
      sessions: state.sessions.map((s) =>
        s.id === id && !(s.hookManaged && s.activityStatus === 'working')
          ? { ...s, activityStatus: 'idle' as const }
          : s,
      ),
    })),

  setRunning: (id, running) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, running } : s,
      ),
    })),

  renameSession: (id, name) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, name } : s,
      ),
    })),

  setSessionInfo: (id, info) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, info, contextPercent: info.contextPercent ?? s.contextPercent } : s,
      ),
    })),

  setConversationId: (id, conversationId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, conversationId } : s,
      ),
    })),

  setContextPercent: (id, percent) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, contextPercent: percent } : s,
      ),
    })),

  setActivityStatus: (id, status) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, activityStatus: status } : s,
      ),
    })),

  markSessionWorking: (id) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === id)
      if (!session || session.activityStatus === 'working') return state
      return {
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, activityStatus: 'working' as const } : s,
        ),
      }
    }),

  // Precise activity signal from `ft activity`. Marks the
  // session hook-managed (disabling the PTY heuristic) and maps the signal to
  // a display status: 'done' clears to idle when you're viewing the session,
  // otherwise becomes 'unread'; 'attention' always becomes 'unread'.
  applyActivitySignal: (id, signal, viewing) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === id)
      if (!session) return state
      let status: SessionActivityStatus
      switch (signal) {
        case 'working': status = 'working'; break
        case 'done': status = viewing ? 'idle' : 'unread'; break
        case 'attention': status = 'unread'; break
        default: status = 'idle'
      }
      return {
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, activityStatus: status, hookManaged: true } : s,
        ),
      }
    }),

  requestRename: (id) => set({ renameRequestId: id }),
  clearRenameRequest: () => set({ renameRequestId: null }),

  viewMode: 'sidebar',
  gridLayout: {},

  setViewMode: (mode) => set({ viewMode: mode }),

  setGridLayout: (layout) => set({ gridLayout: layout }),

  swapGridPanels: (fromId, toId) =>
    set((state) => {
      const fromIdx = state.sessions.findIndex((s) => s.id === fromId)
      const toIdx = state.sessions.findIndex((s) => s.id === toId)
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return state
      const sessions = [...state.sessions]
      ;[sessions[fromIdx], sessions[toIdx]] = [sessions[toIdx], sessions[fromIdx]]
      return { sessions }
    }),
}))
