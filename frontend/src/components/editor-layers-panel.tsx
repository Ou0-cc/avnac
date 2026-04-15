import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons'

export type EditorLayerRow = {
  id: string
  index: number
  label: string
  visible: boolean
  selected: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  rows: EditorLayerRow[]
  onSelectLayer: (stackIndex: number) => void
  onToggleVisible: (stackIndex: number) => void
  onBringForward: (stackIndex: number) => void
  onSendBackward: (stackIndex: number) => void
}

export default function EditorLayersPanel({
  open,
  onClose,
  rows,
  onSelectLayer,
  onToggleVisible,
  onBringForward,
  onSendBackward,
}: Props) {
  if (!open) return null

  return (
    <div
      data-avnac-chrome
      className="pointer-events-auto absolute right-3 top-14 z-40 flex w-[min(100vw-1.5rem,280px)] flex-col overflow-hidden rounded-xl border border-black/[0.08] bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md sm:right-4 sm:top-16"
      role="dialog"
      aria-label="Layers"
    >
      <div className="flex items-center justify-between border-b border-black/[0.06] px-3 py-2">
        <span className="text-sm font-semibold text-neutral-800">Layers</span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-black/[0.06]"
          onClick={onClose}
          aria-label="Close layers"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.75} />
        </button>
      </div>
      <ul className="max-h-[min(60vh,360px)] overflow-auto p-1">
        {rows.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-neutral-500">
            No objects yet
          </li>
        ) : (
          rows.map((row) => (
            <li
              key={row.id}
              className={[
                'flex items-center gap-0.5 rounded-lg py-0.5',
                row.selected ? 'bg-[#8B3DFF]/12' : 'hover:bg-black/[0.04]',
              ].join(' ')}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm text-neutral-800"
                onClick={() => onSelectLayer(row.index)}
              >
                <span className="truncate">{row.label}</span>
              </button>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-600 hover:bg-black/[0.06]"
                title={row.visible ? 'Hide' : 'Show'}
                aria-label={row.visible ? 'Hide layer' : 'Show layer'}
                onClick={() => onToggleVisible(row.index)}
              >
                <HugeiconsIcon
                  icon={row.visible ? ViewIcon : ViewOffSlashIcon}
                  size={18}
                  strokeWidth={1.75}
                />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-600 hover:bg-black/[0.06]"
                title="Forward"
                aria-label="Bring forward"
                onClick={() => onBringForward(row.index)}
              >
                <HugeiconsIcon
                  icon={ArrowUp01Icon}
                  size={18}
                  strokeWidth={1.75}
                />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-600 hover:bg-black/[0.06]"
                title="Backward"
                aria-label="Send backward"
                onClick={() => onSendBackward(row.index)}
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={18}
                  strokeWidth={1.75}
                />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
