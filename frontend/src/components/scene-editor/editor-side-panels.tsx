import type { AiDesignController } from '../../lib/avnac-ai-controller'
import type {
  AvnacVectorBoardMeta,
} from '../../lib/avnac-vector-boards-storage'
import {
  emptyVectorBoardDocument,
  type VectorBoardDocument,
} from '../../lib/avnac-vector-board-document'
import EditorAiPanel from '../editor-ai-panel'
import EditorAppsPanel from '../editor-apps-panel'
import EditorFloatingSidebar, {
  type EditorSidebarPanelId,
} from '../editor-floating-sidebar'
import EditorImagesPanel from '../editor-images-panel'
import EditorLayersPanel, {
  type EditorLayerRow,
} from '../editor-layers-panel'
import EditorUploadsPanel from '../editor-uploads-panel'
import EditorVectorBoardPanel from '../editor-vector-board-panel'
import VectorBoardWorkspace from '../vector-board-workspace'

export function EditorSidePanels({
  activePanel,
  aiController,
  boardDocs,
  boards,
  createVectorBoard,
  deleteVectorBoard,
  layerRows,
  onClosePanel,
  onLayerBringForward,
  onLayerReorder,
  onLayerSendBackward,
  onRenameLayer,
  onSelectLayer,
  onSelectPanel,
  onToggleLayerVisible,
  onVectorBoardDocumentChange,
  openVectorBoardWorkspace,
  placeActiveVectorBoardAtArtboardCenter,
  ready,
  vectorWorkspaceId,
  vectorWorkspaceName,
  closeVectorWorkspace,
}: {
  activePanel: EditorSidebarPanelId | null
  aiController: AiDesignController
  boardDocs: Record<string, VectorBoardDocument>
  boards: AvnacVectorBoardMeta[]
  createVectorBoard: () => void
  deleteVectorBoard: (id: string) => void
  layerRows: EditorLayerRow[]
  onClosePanel: () => void
  onLayerBringForward: (stackIndex: number) => void
  onLayerReorder: (orderedLayerIds: string[]) => void
  onLayerSendBackward: (stackIndex: number) => void
  onRenameLayer: (stackIndex: number, name: string) => void
  onSelectLayer: (stackIndex: number) => void
  onSelectPanel: (id: EditorSidebarPanelId) => void
  onToggleLayerVisible: (stackIndex: number) => void
  onVectorBoardDocumentChange: (boardId: string, next: VectorBoardDocument) => void
  openVectorBoardWorkspace: (id: string) => void
  placeActiveVectorBoardAtArtboardCenter: () => void
  ready: boolean
  vectorWorkspaceId: string | null
  vectorWorkspaceName: string
  closeVectorWorkspace: () => void
}) {
  return (
    <>
      {ready ? (
        <EditorFloatingSidebar
          activePanel={activePanel}
          onSelectPanel={onSelectPanel}
        />
      ) : null}

      <EditorLayersPanel
        open={ready && activePanel === 'layers'}
        onClose={onClosePanel}
        rows={layerRows}
        onSelectLayer={onSelectLayer}
        onToggleVisible={onToggleLayerVisible}
        onBringForward={onLayerBringForward}
        onSendBackward={onLayerSendBackward}
        onReorder={onLayerReorder}
        onRenameLayer={onRenameLayer}
      />
      <EditorUploadsPanel
        open={ready && activePanel === 'uploads'}
        onClose={onClosePanel}
      />
      <EditorImagesPanel
        open={ready && activePanel === 'images'}
        onClose={onClosePanel}
        controller={aiController}
      />
      <EditorVectorBoardPanel
        open={ready && activePanel === 'vector-board'}
        onClose={onClosePanel}
        boards={boards}
        boardDocs={boardDocs}
        onCreateNew={createVectorBoard}
        onOpenBoard={openVectorBoardWorkspace}
        onDeleteBoard={deleteVectorBoard}
      />
      <EditorAppsPanel
        open={ready && activePanel === 'apps'}
        onClose={onClosePanel}
        controller={aiController}
      />
      <EditorAiPanel
        open={ready && activePanel === 'ai'}
        onClose={onClosePanel}
        controller={aiController}
      />
      {vectorWorkspaceId ? (
        <VectorBoardWorkspace
          open
          boardName={vectorWorkspaceName}
          document={boardDocs[vectorWorkspaceId] ?? emptyVectorBoardDocument()}
          onDocumentChange={(next) => onVectorBoardDocumentChange(vectorWorkspaceId, next)}
          onSave={closeVectorWorkspace}
          onSaveAndPlace={() => {
            placeActiveVectorBoardAtArtboardCenter()
            closeVectorWorkspace()
          }}
          onClose={closeVectorWorkspace}
        />
      ) : null}
    </>
  )
}
