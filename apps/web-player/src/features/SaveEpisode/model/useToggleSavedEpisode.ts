'use client'

import {
  type Episode,
  type PodcastDetail,
  toSavedEpisode,
  useSaveEpisode,
  useUnsaveEpisode,
} from '@/entities/Podcast'
import { showApiErrorToast } from '@/shared/api/feedback'

type UseToggleSavedEpisodeInput = {
  /** The show the toggled episodes belong to, shown in the library entry of a new save. */
  podcast: PodcastDetail
}

type ToggleSavedEpisodeInput = {
  episode: Episode
  isSaved: boolean
}

/** Saves or removes one of the show's episodes, reporting a failed request in a toast. */
export const useToggleSavedEpisode = ({
  podcast,
}: UseToggleSavedEpisodeInput) => {
  const saveEpisode = useSaveEpisode()
  const unsaveEpisode = useUnsaveEpisode()

  return ({ episode, isSaved }: ToggleSavedEpisodeInput) => {
    if (isSaved) {
      unsaveEpisode.mutate(episode.id, {
        onError: (error) =>
          showApiErrorToast(error, `Unable to remove ${episode.title}.`),
      })
      return
    }

    saveEpisode.mutate(toSavedEpisode({ episode, podcast }), {
      onError: (error) =>
        showApiErrorToast(error, `Unable to save ${episode.title}.`),
    })
  }
}
