import { useState } from 'react'
import {
  useSaveWorkspaceLayout,
  useWorkspaceLayout,
} from '../api/useWorkspaceLayout'
import type { GridTile } from './grid'
import {
  defaultLayout,
  fromStoredLayout,
  type LayoutPage,
  sameLayout,
  type TileDefinition,
  toStoredLayout,
} from './layout'

/**
 * A page's tiles on the free grid in the artist's arrangement, plus a customize mode that
 * edits a draft and saves it on Done. Until the stored layout loads, the default one is shown.
 * Tiles not on the grid wait in the drawer.
 */
export function useCustomizableLayout(
  artistId: string,
  page: LayoutPage,
  definitions: readonly TileDefinition[],
) {
  const stored = useWorkspaceLayout(artistId, page)
  const save = useSaveWorkspaceLayout(artistId, page)
  const [draft, setDraft] = useState<GridTile[] | null>(null)
  const saved = fromStoredLayout(definitions, stored.data ?? [])
  const fallback = defaultLayout(definitions)
  return {
    definitions,
    loading: stored.isPending,
    tiles: draft ?? saved,
    editing: draft !== null,
    saving: save.isPending,
    saveError: save.error?.message ?? null,
    edit: () => {
      save.reset()
      setDraft(saved)
    },
    cancel: () => setDraft(null),
    reset: () => setDraft(fallback),
    change: (next: GridTile[]) => setDraft(next),
    done: () => {
      if (!draft) return
      if (sameLayout(draft, saved)) {
        setDraft(null)
        return
      }
      save.mutate(
        sameLayout(draft, fallback) ? null : toStoredLayout(definitions, draft),
        { onSuccess: () => setDraft(null) },
      )
    },
  }
}

export type CustomizableLayout = ReturnType<typeof useCustomizableLayout>
