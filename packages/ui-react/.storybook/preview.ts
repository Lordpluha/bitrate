import type { Preview } from '@storybook/react-vite'
import 'loki/configure-react'
import '../src/styles/index.css'

type LokiStory = {
  id: string
  kind: string
  story: string
  parameters: Record<string, unknown>
}

type StorybookExtractedStory = {
  id?: string
  storyId?: string
  title?: string
  kind?: string
  name?: string
  story?: string
  parameters?: Record<string, unknown>
}

type StorybookPreviewCompat = {
  extract?: (options?: {
    includeDocsOnly?: boolean
  }) => Promise<Record<string, StorybookExtractedStory>>
  storyStoreValue?: {
    raw?: () => LokiStory[]
    extract?: (options?: { includeDocsOnly?: boolean }) => Record<string, StorybookExtractedStory>
  }
}

const createLokiRawStories = (preview: StorybookPreviewCompat): LokiStory[] => {
  const extractedStories = preview.storyStoreValue?.extract?.({ includeDocsOnly: false }) ?? {}

  return Object.values(extractedStories).map((story) => ({
    id: story.id ?? story.storyId ?? '',
    kind: story.kind ?? story.title ?? '',
    story: story.story ?? story.name ?? '',
    parameters: story.parameters ?? {},
  }))
}

const installLokiStoryStoreRawShim = () => {
  if (typeof window === 'undefined') {
    return
  }

  const preview = (window as typeof window & { __STORYBOOK_PREVIEW__?: StorybookPreviewCompat })
    .__STORYBOOK_PREVIEW__

  if (
    !preview?.extract ||
    !preview.storyStoreValue ||
    typeof preview.storyStoreValue.raw === 'function'
  ) {
    return
  }

  preview.storyStoreValue.raw = () => createLokiRawStories(preview)
}

installLokiStoryStoreRawShim()

if (typeof window !== 'undefined') {
  const shimIntervalId = window.setInterval(() => {
    installLokiStoryStoreRawShim()

    const preview = (window as typeof window & { __STORYBOOK_PREVIEW__?: StorybookPreviewCompat })
      .__STORYBOOK_PREVIEW__

    if (preview?.storyStoreValue?.raw) {
      window.clearInterval(shimIntervalId)
    }
  }, 50)

  window.setTimeout(() => {
    window.clearInterval(shimIntervalId)
  }, 5000)
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
