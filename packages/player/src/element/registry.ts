/**
 * Every compiled custom element this package defines, in registration order. Loaded only by
 * `defineBitratePlayer()`'s dynamic import — compiled Svelte custom elements extend
 * `HTMLElement` at module evaluation, which throws in a server bundle.
 *
 * The root comes first: its constructor attaches the context listener its parts ask, so it
 * must upgrade before any part in the same tree connects.
 */
import type { Component } from 'svelte'
import { BITRATE_PLAYER_PART_TAG } from '../contract'
import BitratePlayer from './BitratePlayer.svelte'
import ActionsElement from './elements/ActionsElement.svelte'
import CoverElement from './elements/CoverElement.svelte'
import ErrorElement from './elements/ErrorElement.svelte'
import MetaElement from './elements/MetaElement.svelte'
import QualityElement from './elements/QualityElement.svelte'
import SeekElement from './elements/SeekElement.svelte'
import TransportElement from './elements/TransportElement.svelte'
import VolumeElement from './elements/VolumeElement.svelte'

/** The root's tag, duplicated from `index.ts` so this module does not import its own loader. */
const ROOT_TAG_NAME = 'bitrate-player'

type AnyComponent = Component<never>

export const BITRATE_PLAYER_COMPONENTS: ReadonlyArray<readonly [string, AnyComponent]> = [
  [ROOT_TAG_NAME, BitratePlayer],
  [BITRATE_PLAYER_PART_TAG.COVER, CoverElement],
  [BITRATE_PLAYER_PART_TAG.META, MetaElement],
  [BITRATE_PLAYER_PART_TAG.TRANSPORT, TransportElement],
  [BITRATE_PLAYER_PART_TAG.SEEK, SeekElement],
  [BITRATE_PLAYER_PART_TAG.VOLUME, VolumeElement],
  [BITRATE_PLAYER_PART_TAG.ACTIONS, ActionsElement],
  [BITRATE_PLAYER_PART_TAG.QUALITY, QualityElement],
  [BITRATE_PLAYER_PART_TAG.ERROR, ErrorElement],
]
