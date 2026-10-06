import ncs from '../src/main'

/**
 * This file is a smoke script run by `pnpm test` through plain node, not an assertion suite.
 * Without a rejection handler a failing network call surfaced as an unhandled rejection, which
 * node reports without naming which of the three chains broke. `exitCode` rather than `exit`
 * lets the other chains finish and still fails the run.
 */
const report = (error: unknown): void => {
  console.error(error)
  process.exitCode = 1
}

console.log('running getSongs')
ncs
  .getSongs()
  .then((res) => {
    console.log('results getSongs', res.length)
    console.dir(res[0], { depth: null })
  })
  .catch(report)

console.log('running Search')
ncs
  .search({
    search: 'you',
    genre: ncs.Genre.Electronic,
  })
  .then((res) => {
    console.log('results Search', res.length)
    console.dir(res[0], { depth: null })
  })
  .catch(report)

console.log('running artist info')
ncs
  .getArtistInfo('/artist/172/harley-bird')
  .then((res) => {
    console.log('results artist info')
    if (res) {
      console.dir({ ...res, songs: [res.songs[0]] }, { depth: null })
    }
  })
  .catch(report)
