import type { Canvas } from 'fabric'
import { getAvnacLocked } from './avnac-object-lock'

/**
 * Remove whatever is currently selected from the canvas.
 * Locked objects (avnacLocked) are never removed.
 *
 * Single object: remove it directly (skip if locked).
 * ActiveSelection (multi-select): remove only unlocked children.
 *
 * Returns true if at least one object was removed.
 */
export function removeActiveObjectFromCanvas(canvas: Canvas): boolean {
  const active = canvas.getActiveObject()
  if (!active) return false

  if ('multiSelectionStacking' in active) {
    const all = canvas.getActiveObjects().slice()
    const deletable = all.filter((o) => !getAvnacLocked(o))
    if (deletable.length === 0) return false
    canvas.discardActiveObject()
    for (const o of deletable) canvas.remove(o)
    return true
  }

  if (getAvnacLocked(active)) return false
  canvas.remove(active)
  return true
}
