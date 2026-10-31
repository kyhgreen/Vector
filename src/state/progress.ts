/*
  Which lessons are done, open, or locked.

  The rules:
  - Your age decides your "home" tier: 11–14 is tier 1, 15–18 is tier 2.
  - In your home tier, lessons unlock one at a time, in order.
  - Tier 2 unlocks for younger players as soon as they finish ALL of tier 1
    (every lesson plus every unit quiz). No waiting to get older.
  - Older players can jump into any tier 1 lesson for review.
  - Demo mode (settings.unlockAll) opens everything.
*/
import { pathForTier, tierForAge, type PathNode } from '../content'
import type { TierId } from '../content/types'
import type { GameData } from './types'

export type NodeStatus = 'done' | 'current' | 'open' | 'locked'

export function isNodeDone(data: GameData, node: PathNode): boolean {
  return node.kind === 'lesson' ? !!data.lessons[node.id] : !!data.quizzes[node.unit.id]?.passed
}

export function homeTier(data: GameData): TierId {
  return tierForAge(data.profile.age || 11)
}

export function isTierComplete(data: GameData, tier: TierId): boolean {
  const nodes = pathForTier(tier)
  return nodes.length > 0 && nodes.every((n) => isNodeDone(data, n))
}

export function isTierUnlocked(data: GameData, tier: TierId): boolean {
  if (data.settings.unlockAll) return true
  if (tier === 1) return true
  return homeTier(data) >= 2 || isTierComplete(data, 1)
}

export interface PathItem {
  node: PathNode
  status: NodeStatus
}

export function pathWithStatus(data: GameData, tier: TierId): PathItem[] {
  const nodes = pathForTier(tier)
  const unlocked = isTierUnlocked(data, tier)
  const freeRoam = data.settings.unlockAll || tier < homeTier(data)
  let currentFound = false
  return nodes.map((node) => {
    const done = isNodeDone(data, node)
    let status: NodeStatus
    if (done) status = 'done'
    else if (!unlocked) status = 'locked'
    else if (!currentFound) {
      status = 'current'
      currentFound = true
    } else status = freeRoam ? 'open' : 'locked'
    return { node, status }
  })
}

/** The next thing to do in a tier, or undefined if it's all done. */
export function nextNode(data: GameData, tier: TierId): PathNode | undefined {
  return pathWithStatus(data, tier).find((p) => p.status === 'current')?.node
}

/** 0..1 completion for a set of nodes. */
export function completion(data: GameData, nodes: PathNode[]): number {
  if (!nodes.length) return 0
  return nodes.filter((n) => isNodeDone(data, n)).length / nodes.length
}

/** Can the player start this node right now? */
export function canStart(data: GameData, tier: TierId, nodeId: string): boolean {
  const item = pathWithStatus(data, tier).find((p) => p.node.id === nodeId)
  return !!item && item.status !== 'locked'
}
