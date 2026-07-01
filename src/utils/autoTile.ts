export function autoTile(sessionIds: string[]): string[][] {
  const n = sessionIds.length
  if (n === 0) return []
  if (n === 1) return [[sessionIds[0]]]
  if (n === 2) return [[sessionIds[0]], [sessionIds[1]]]
  if (n === 3) return [[sessionIds[0]], [sessionIds[1], sessionIds[2]]]
  if (n === 4) return [[sessionIds[0], sessionIds[2]], [sessionIds[1], sessionIds[3]]]

  const cols = Math.ceil(Math.sqrt(n))
  const result: string[][] = Array.from({ length: cols }, () => [])
  for (let i = 0; i < n; i++) {
    result[i % cols].push(sessionIds[i])
  }
  return result
}
