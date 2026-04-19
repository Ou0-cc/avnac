import type { Canvas, FabricObject } from 'fabric'
import { Point } from 'fabric'

export type SceneSnapGuide = { axis: 'v' | 'h'; pos: number }

type Options = {
  width: number
  height: number
  threshold?: number
  fabricMod: typeof import('fabric')
  onGuidesChange?: (guides: SceneSnapGuide[]) => void
}

/** Prefer keeping the same guide briefly to avoid flip-flop at threshold edges. */
const SNAP_HYSTERESIS_PX = 6

const QUANT = 1000

function q(n: number): number {
  return Math.round(n * QUANT) / QUANT
}

function collectTargets(
  canvas: Canvas,
  moving: FabricObject,
  fabricMod: typeof import('fabric'),
): FabricObject[] {
  return canvas.getObjects().filter((o) => {
    if (o === moving) return false
    if (
      fabricMod.ActiveSelection &&
      moving instanceof fabricMod.ActiveSelection
    ) {
      return !moving.getObjects().includes(o)
    }
    return true
  })
}

function guideSticky(
  axis: 'v' | 'h',
  line: number,
  previous: SceneSnapGuide[],
): boolean {
  return previous.some(
    (g) => g.axis === axis && Math.abs(g.pos - line) < 1.5,
  )
}

function snapMovingObject(
  moving: FabricObject,
  canvas: Canvas,
  fabricMod: typeof import('fabric'),
  width: number,
  height: number,
  threshold: number,
  previousGuides: SceneSnapGuide[],
): { guides: SceneSnapGuide[]; didSnap: boolean } {
  const guides: SceneSnapGuide[] = []
  const midX = width / 2
  const midY = height / 2

  const c = moving.getCenterPoint()
  let br = moving.getBoundingRect()
  let left = q(br.left)
  let right = q(br.left + br.width)
  let top = q(br.top)
  let bottom = q(br.top + br.height)
  let cx = q(left + br.width / 2)
  let cy = q(top + br.height / 2)

  const targets = collectTargets(canvas, moving, fabricMod)

  let bestDx = 0
  let bestXScore = threshold + 1
  let guideX: number | undefined

  const tryX = (myX: number, theirX: number, gLine: number) => {
    const d = q(theirX - myX)
    const ad = Math.abs(d)
    if (ad > threshold) return
    const sticky = guideSticky('v', gLine, previousGuides)
    const score = ad - (sticky ? SNAP_HYSTERESIS_PX : 0)
    if (score < bestXScore - 1e-9) {
      bestXScore = score
      bestDx = d
      guideX = gLine
    }
  }

  for (const o of targets) {
    const b = o.getBoundingRect()
    const ox = q(b.left)
    const oc = q(b.left + b.width / 2)
    const or = q(b.left + b.width)
    for (const mx of [left, cx, right]) {
      for (const tx of [ox, oc, or]) {
        tryX(mx, tx, tx)
      }
    }
  }

  const cxMidDist = Math.abs(cx - midX)
  if (cxMidDist <= threshold) {
    const sticky = guideSticky('v', midX, previousGuides)
    const score = cxMidDist - (sticky ? SNAP_HYSTERESIS_PX : 0)
    if (score < bestXScore - 1e-9) {
      bestDx = q(midX - cx)
      bestXScore = score
      guideX = midX
    }
  }

  let didSnap = false

  if (bestXScore <= threshold && guideX !== undefined) {
    moving.setPositionByOrigin(
      new Point(c.x + bestDx, c.y),
      'center',
      'center',
    )
    didSnap = true
    guides.push({ axis: 'v', pos: q(guideX) })
  }

  br = moving.getBoundingRect()
  left = q(br.left)
  right = q(br.left + br.width)
  top = q(br.top)
  bottom = q(br.top + br.height)
  cx = q(left + br.width / 2)
  cy = q(top + br.height / 2)

  let bestDy = 0
  let bestYScore = threshold + 1
  let guideY: number | undefined

  const tryY = (myY: number, theirY: number, gLine: number) => {
    const d = q(theirY - myY)
    const ad = Math.abs(d)
    if (ad > threshold) return
    const sticky = guideSticky('h', gLine, previousGuides)
    const score = ad - (sticky ? SNAP_HYSTERESIS_PX : 0)
    if (score < bestYScore - 1e-9) {
      bestYScore = score
      bestDy = d
      guideY = gLine
    }
  }

  for (const o of targets) {
    const b = o.getBoundingRect()
    const oy = q(b.top)
    const oc = q(b.top + b.height / 2)
    const ob = q(b.top + b.height)
    for (const my of [top, cy, bottom]) {
      for (const ty of [oy, oc, ob]) {
        tryY(my, ty, ty)
      }
    }
  }

  const cyMidDist = Math.abs(cy - midY)
  if (cyMidDist <= threshold) {
    const sticky = guideSticky('h', midY, previousGuides)
    const score = cyMidDist - (sticky ? SNAP_HYSTERESIS_PX : 0)
    if (score < bestYScore - 1e-9) {
      bestDy = q(midY - cy)
      bestYScore = score
      guideY = midY
    }
  }

  if (bestYScore <= threshold && guideY !== undefined) {
    const c2 = moving.getCenterPoint()
    moving.setPositionByOrigin(
      new Point(c2.x, c2.y + bestDy),
      'center',
      'center',
    )
    didSnap = true
    guides.push({ axis: 'h', pos: q(guideY) })
  }

  return { guides, didSnap }
}

function guidesEqual(a: SceneSnapGuide[], b: SceneSnapGuide[]): boolean {
  if (a.length !== b.length) return false
  return a.every(
    (x, i) =>
      x.axis === b[i]?.axis &&
      Math.abs(x.pos - (b[i]?.pos ?? NaN)) < 0.51,
  )
}

export function installSceneSnap(
  canvas: Canvas,
  { width, height, threshold: thOpt, fabricMod, onGuidesChange }: Options,
) {
  const threshold =
    thOpt ?? Math.max(20, Math.round(Math.min(width, height) * 0.006))

  let lastGuides: SceneSnapGuide[] = []
  let previousSnapGuides: SceneSnapGuide[] = []

  const setGuides = (g: SceneSnapGuide[]): boolean => {
    if (guidesEqual(g, lastGuides)) return false
    lastGuides = g
    onGuidesChange?.(g)
    return true
  }

  const onMoving = (opt: { target: FabricObject }) => {
    const { guides, didSnap } = snapMovingObject(
      opt.target,
      canvas,
      fabricMod,
      width,
      height,
      threshold,
      previousSnapGuides,
    )
    previousSnapGuides = guides
    const guidesChanged = setGuides(guides)
    if (didSnap || guidesChanged) {
      canvas.requestRenderAll()
    }
  }

  const clearGuides = () => {
    previousSnapGuides = []
    setGuides([])
    canvas.requestRenderAll()
  }

  canvas.on('object:moving', onMoving)
  canvas.on('object:modified', clearGuides)
  canvas.on('selection:cleared', clearGuides)

  return () => {
    canvas.off('object:moving', onMoving)
    canvas.off('object:modified', clearGuides)
    canvas.off('selection:cleared', clearGuides)
    previousSnapGuides = []
    if (lastGuides.length) {
      lastGuides = []
      onGuidesChange?.([])
    }
  }
}
