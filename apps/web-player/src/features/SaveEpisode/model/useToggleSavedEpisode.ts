'use client'

import {
  type Episode,
  type PodcastDetail,
  toSavedEpisode,
  useSaveEpisode,
  useUnsaveEpisode,
} from '@/entities/Podcast'

type UseToggleSavedEpisodeInput = {
  /** The show the toggled episodes belong to, shown in the library entry of a new save. */
  podcast: PodcastDetail
}

type ToggleSavedEpisodeInput = {
  episode: Episode
  isSaved: boolean
}

/** Saves or removes one of the show's episodes; the mutation cache toasts a failed request. */
export const useToggleSavedEpisode = ({
  podcast,
}: UseToggleSavedEpisodeInput) => {
  const saveEpisode = useSaveEpisode()
  const unsaveEpisode = useUnsaveEpisode()

  return ({ episode, isSaved }: ToggleSavedEpisodeInput) => {
    if (isSaved) {
      unsaveEpisode.mutate(episode.id)
      return
    }

    saveEpisode.mutate(toSavedEpisode({ episode, podcast }))
  }
}
