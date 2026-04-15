import type { Canvas, FabricObject } from 'fabric'
import { Point } from 'fabric'

export type ArtboardCenterSnapGuides = {
  vertical: boolean
  horizontal: boolean
}

export type ArtboardCenterSnapOptions = {
  width: number
  height: number
  /** Scene-space distance from artboard midlines to activate snap. */
  threshold?: number
  onGuidesChange?: (guides: ArtboardCenterSnapGuides) => void
}

function applyCenterSnap(
  obj: FabricObject,
  midX: number,
  midY: number,
  threshold: number,
): { v: boolean; h: boolean } {
  const c = obj.getCenterPoint()
  let nx = c.x
  let ny = c.y
  let v = false
  let h = false
  if (Math.abs(nx - midX) <= threshold) {
    nx = midX
    v = true
  }
  if (Math.abs(ny - midY) <= threshold) {
    ny = midY
    h = true
  }
  if (v || h) {
    obj.setPositionByOrigin(new Point(nx, ny), 'center', 'center')
  }
  return { v, h }
}

export function installArtboardCenterSnap(
  canvas: Canvas,
  {
    width,
    height,
    threshold: thresholdOpt,
    onGuidesChange,
  }: ArtboardCenterSnapOptions,
) {
  const threshold =
    thresholdOpt ?? Math.max(20, Math.round(Math.min(width, height) * 0.006))
  const midX = width / 2
  const midY = height / 2

  let snapV = false
  let snapH = false

  const setGuides = (v: boolean, h: boolean) => {
    if (v === snapV && h === snapH) return
    snapV = v
    snapH = h
    onGuidesChange?.({ vertical: v, horizontal: h })
  }

  const onMoving = (opt: { target: FabricObject }) => {
    const { v, h } = applyCenterSnap(opt.target, midX, midY, threshold)
    setGuides(v, h)
    canvas.requestRenderAll()
  }

  const clearGuides = () => {
    setGuides(false, false)
    canvas.requestRenderAll()
  }

  canvas.on('object:moving', onMoving)
  canvas.on('object:modified', clearGuides)
  canvas.on('selection:cleared', clearGuides)

  return () => {
    canvas.off('object:moving', onMoving)
    canvas.off('object:modified', clearGuides)
    canvas.off('selection:cleared', clearGuides)
    if (snapV || snapH) {
      snapV = false
      snapH = false
      onGuidesChange?.({ vertical: false, horizontal: false })
    }
  }
}
