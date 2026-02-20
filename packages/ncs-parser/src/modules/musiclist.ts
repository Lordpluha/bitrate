import type Song from '../entities/Song'
import { search } from './search'

export const getSongs = async (page = 0): Promise<Song[]> => {
  return search({}, page)
}
