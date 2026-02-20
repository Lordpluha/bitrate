import axios from 'axios'
import { JSDOM } from 'jsdom'
import type Artist from '../../entities/Artist'
import type Artist_info from '../../entities/ArtistInfo'
import type Song from '../../entities/Song'
import parseTable from '../../helpers/parseTable'

export const getArtistInfo = async (
  artistUrl: string | Artist,
): Promise<Artist_info | undefined> => {
  if (typeof artistUrl !== 'string') artistUrl = artistUrl.url
  const { data: html } = await axios.get<string>(`https://ncs.io${artistUrl}`, {
    responseType: 'text',
  })

  const dom = new JSDOM(html)
  const document = dom.window.document.body

  const infoEl = document.querySelector('.details .info')
  const name = infoEl?.querySelector('h5')?.innerHTML || 'Undefined Artist Name'
  const genres = infoEl?.querySelector('.tags')?.innerHTML.split(', ') || ['Undefined']
  const img = document
    .querySelector<HTMLDivElement>('.img')
    ?.getAttribute('style')
    ?.trim()
    ?.replace("background-image: url('", '')
    ?.replace("')", '')

  const fearuredEl = document.querySelector('.featured tbody')
  const featured: Song[] = !fearuredEl ? [] : parseTable(fearuredEl)

  const songsEl = fearuredEl
    ? document.querySelectorAll('.table tbody')[1]
    : document.querySelector('.table tbody')

  if (!songsEl) {
    return
  }

  const songs: Song[] = parseTable(songsEl)

  return {
    name,
    url: artistUrl,
    img,
    genres,
    featured,
    songs,
  }
}
