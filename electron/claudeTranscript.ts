// Searching Claude Code conversations.
//
// Claude Code (v2.1+) renders its TUI in the terminal's *alternate screen
// buffer*, which xterm.js gives no scrollback. So the live terminal buffer only
// ever holds the currently-painted viewport - there is nothing to search for
// anything that scrolled past. The full conversation does live on disk, though:
// Claude writes a JSONL transcript per conversation under
// ~/.claude/projects/<encoded-project-path>/<conversation-id>.jsonl. This module
// locates, parses and searches those files so ForgeTerm can search a Claude
// session's full history (and closed sessions) instead of the empty buffer.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { TranscriptMatch, TranscriptSearchTarget } from '../shared/types'

interface Segment {
  role: 'user' | 'assistant'
  kind: 'text' | 'thinking' | 'tool_use' | 'tool_result'
  text: string
  /** Line index within the JSONL file (stable ordering / identity for a match). */
  msgIndex: number
  /** Epoch ms parsed from the entry timestamp, if present. */
  timestamp?: number
}

interface CacheEntry {
  mtimeMs: number
  size: number
  segments: Segment[]
}

// Parsed-segment cache keyed by transcript path. Re-parsed only when the file's
// mtime or size changes, so repeated keystroke searches over a 3MB transcript
// stay cheap (a substring scan over already-extracted segments).
const cache = new Map<string, CacheEntry>()

function claudeProjectsRoot(): string {
  const base = process.env.CLAUDE_CONFIG_DIR && process.env.CLAUDE_CONFIG_DIR.trim()
    ? process.env.CLAUDE_CONFIG_DIR.trim()
    : path.join(os.homedir(), '.claude')
  return path.join(base, 'projects')
}

// Claude derives the project folder name by replacing every '/' and '.' in the
// absolute path with '-'. We try that first (fast path); if the file is missing
// we fall back to scanning all project dirs for the conversation UUID, which is
// globally unique, so encoding edge cases never break resolution.
function encodeProjectDir(projectPath: string): string {
  return projectPath.replace(/[/.]/g, '-')
}

/** Resolve the on-disk transcript path for a conversation, or null if not found. */
export function resolveTranscriptPath(conversationId: string, projectPath: string): string | null {
  if (!conversationId) return null
  const root = claudeProjectsRoot()
  const fast = path.join(root, encodeProjectDir(projectPath), `${conversationId}.jsonl`)
  if (fs.existsSync(fast)) return fast
  // Fallback: the encoded dir may differ; the UUID is unique so scan for it.
  try {
    for (const dir of fs.readdirSync(root)) {
      const candidate = path.join(root, dir, `${conversationId}.jsonl`)
      if (fs.existsSync(candidate)) return candidate
    }
  } catch {
    /* projects root missing */
  }
  return null
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function describeToolInput(input: unknown): string {
  if (!input || typeof input !== 'object') return ''
  const obj = input as Record<string, unknown>
  // Prefer the most human-meaningful field per tool (command, path, query, ...).
  for (const key of ['command', 'file_path', 'path', 'pattern', 'query', 'prompt', 'url', 'description']) {
    const v = obj[key]
    if (typeof v === 'string' && v) return v
  }
  try {
    return JSON.stringify(obj)
  } catch {
    return ''
  }
}

function extractToolResult(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((b) => (b && typeof b === 'object' && (b as any).type === 'text' ? String((b as any).text ?? '') : ''))
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

function extractSegments(entry: any, msgIndex: number): Segment[] {
  if (!entry || (entry.type !== 'user' && entry.type !== 'assistant')) return []
  const message = entry.message
  if (!message) return []
  const role: 'user' | 'assistant' = message.role === 'assistant' ? 'assistant' : 'user'
  const timestamp = entry.timestamp ? Date.parse(entry.timestamp) || undefined : undefined
  const content = message.content
  const out: Segment[] = []
  const push = (kind: Segment['kind'], raw: string) => {
    const text = collapse(raw)
    if (text) out.push({ role, kind, text, msgIndex, timestamp })
  }

  if (typeof content === 'string') {
    push('text', content)
    return out
  }
  if (!Array.isArray(content)) return out

  for (const block of content) {
    if (!block || typeof block !== 'object') continue
    switch (block.type) {
      case 'text':
        push('text', String(block.text ?? ''))
        break
      case 'thinking':
        push('thinking', String(block.thinking ?? ''))
        break
      case 'tool_use':
        push('tool_use', `${block.name ?? 'tool'}: ${describeToolInput(block.input)}`)
        break
      case 'tool_result':
        push('tool_result', extractToolResult(block.content))
        break
      default:
        break // image and anything else: not searchable text
    }
  }
  return out
}

function loadSegments(filePath: string): Segment[] {
  let stat: fs.Stats
  try {
    stat = fs.statSync(filePath)
  } catch {
    return []
  }
  const cached = cache.get(filePath)
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached.segments
  }
  let segments: Segment[] = []
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const lines = raw.split('\n')
    segments = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue
      let entry: any
      try {
        entry = JSON.parse(line)
      } catch {
        continue // partial last line during a live write, or non-JSON
      }
      const segs = extractSegments(entry, i)
      if (segs.length) segments.push(...segs)
    }
  } catch {
    segments = []
  }
  cache.set(filePath, { mtimeMs: stat.mtimeMs, size: stat.size, segments })
  return segments
}

// Build a short, single-line preview windowed around the match so the IPC payload
// stays small; `col` is the match offset within the returned preview.
function makePreview(text: string, idx: number, needleLen: number): { preview: string; col: number } {
  const PAD_BEFORE = 60
  const PAD_AFTER = 340
  const start = Math.max(0, idx - PAD_BEFORE)
  const preview = text.slice(start, idx + needleLen + PAD_AFTER)
  return { preview, col: idx - start }
}

function searchFile(filePath: string, needle: string, limit: number): TranscriptMatch[] {
  const segments = loadSegments(filePath)
  const matches: TranscriptMatch[] = []
  // Scan newest-first so that, when capped, the kept matches are the most recent.
  for (let i = segments.length - 1; i >= 0 && matches.length < limit; i--) {
    const seg = segments[i]
    const idx = seg.text.toLowerCase().indexOf(needle)
    if (idx === -1) continue
    const { preview, col } = makePreview(seg.text, idx, needle.length)
    matches.push({
      role: seg.role,
      kind: seg.kind,
      preview,
      col,
      msgIndex: seg.msgIndex,
      timestamp: seg.timestamp,
    })
  }
  return matches
}

/**
 * Search the on-disk transcript of each target conversation for `query`
 * (case-insensitive substring). Returns one entry per target that has any match,
 * preserving target order. Targets whose transcript can't be found are skipped.
 */
export function searchTranscripts(
  targets: TranscriptSearchTarget[],
  query: string,
  perTargetLimit = 80,
): { id: string; matches: TranscriptMatch[] }[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  const results: { id: string; matches: TranscriptMatch[] }[] = []
  for (const target of targets) {
    const filePath = resolveTranscriptPath(target.conversationId, target.projectPath)
    if (!filePath) continue
    const matches = searchFile(filePath, needle, perTargetLimit)
    if (matches.length) results.push({ id: target.id, matches })
  }
  return results
}
