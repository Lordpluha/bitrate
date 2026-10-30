import { readFileSync } from 'node:fs'

/**
 * A Vite plugin for the `native` spec project: serves the CMAF fixture under
 * `/__capped-cmaf/<bitrate>.m4a` the way the API answers `/tracks/:id/cmaf/:bitrate` since
 * ADR-0067 (D15): a `Range` of at most the largest fragment is served exactly; a missing or longer
 * range is served to the end of the file (the API paces that response to real time — the 12 s
 * fixture fits the API's 60 s allowance, so it is not paced here). `GET /__capped-cmaf/log` lists
 * what was served;
 * `DELETE` clears it. This models the API's rule to prove browsers cope with it; the API's own
 * implementation is covered by its unit specs.
 *
 * @param {{ fixtureDir: URL }} options
 * @returns {import('vite').Plugin}
 */
export function cappedCmafFixture({ fixtureDir }) {
  const manifest = JSON.parse(readFileSync(new URL('manifest.json', fixtureDir), 'utf8'))
  /** @type {{ range: string | null, kind: 'exact' | 'paced', served: number, cap: number }[]} */
  const log = []

  return {
    name: 'capped-cmaf-fixture',
    configureServer(server) {
      server.middlewares.use('/__capped-cmaf/', (req, res) => {
        if (req.url === '/log') {
          if (req.method === 'DELETE') log.length = 0
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(log))
          return
        }

        const bitrate = Number(/^\/(\d+)\.m4a/.exec(req.url ?? '')?.[1])
        const rendition = manifest.renditions.find((candidate) => candidate.bitrate === bitrate)
        if (!rendition) {
          res.statusCode = 404
          res.end()
          return
        }

        const bytes = readFileSync(new URL(`${bitrate}.m4a`, fixtureDir))
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? '')
        const start = range ? Number(range[1]) : 0
        const requestedEnd = range?.[2] ? Number(range[2]) : bytes.length - 1
        if (start >= bytes.length) {
          res.writeHead(416, { 'content-range': `bytes */${bytes.length}` })
          res.end()
          return
        }

        const cap = Math.max(...rendition.fragments.map(([, , , length]) => length))
        const asked = Math.min(requestedEnd, bytes.length - 1) - start + 1
        const kind = range && asked <= cap ? 'exact' : 'paced'
        const end = kind === 'exact' ? start + asked - 1 : bytes.length - 1
        log.push({ range: req.headers.range ?? null, kind, served: end - start + 1, cap })
        res.writeHead(206, {
          'accept-ranges': 'bytes',
          'content-length': end - start + 1,
          'content-range': `bytes ${start}-${end}/${bytes.length}`,
          'content-type': 'audio/mp4',
        })
        res.end(req.method === 'HEAD' ? undefined : bytes.subarray(start, end + 1))
      })
    },
  }
}
