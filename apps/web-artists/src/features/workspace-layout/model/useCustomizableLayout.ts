import { useState } from 'react'
import {
  useSaveWorkspaceLayout,
  useWorkspaceLayout,
} from '../api/useWorkspaceLayout'
import {
  defaultLayout,
  type LayoutPage,
  type LayoutTile,
  mergeLayout,
  sameLayout,
  type TileDefinition,
} from './layout'

/**
 * A page's tiles in the artist's arrangement, plus a customize mode that edits a draft and
 * saves it on Done. Until the stored layout loads, the default one is shown.
 */
export function useCustomizableLayout(
  artistId: string,
  page: LayoutPage,
  definitions: readonly TileDefinition[],
) {
  const stored = useWorkspaceLayout(artistId, page)
  const save = useSaveWorkspaceLayout(artistId, page)
  const [draft, setDraft] = useState<LayoutTile[] | null>(null)
  const saved = mergeLayout(definitions, stored.data ?? [])
  const fallback = defaultLayout(definitions)
  return {
    definitions,
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
    change: (next: LayoutTile[]) => setDraft(next),
    done: () => {
      if (!draft) return
      if (sameLayout(draft, saved)) {
        setDraft(null)
        return
      }
      save.mutate(sameLayout(draft, fallback) ? null : draft, {
        onSuccess: () => setDraft(null),
      })
    },
  }
}

export type CustomizableLayout = ReturnType<typeof useCustomizableLayout>
