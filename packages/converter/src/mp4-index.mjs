/**
 * Reads the box layout of a fragmented MP4 and turns its global `sidx` into a
 * time-to-byte fragment index. This is what lets the player ask for one
 * fragment with a single Range request instead of guessing byte offsets.
 */

/**
 * Reads top-level boxes in [start, end).
 * @param {Buffer|Uint8Array} data
 * @param {number} [start]
 * @param {number} [end]
 * @returns {{type: string, start: number, end: number, payload: number}[]}
 */
export function readBoxes(data, start = 0, end = data.length) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const boxes = []
  let pos = start

  while (pos + 8 <= end) {
    let size = view.getUint32(pos)
    const type = String.fromCharCode(data[pos + 4], data[pos + 5], data[pos + 6], data[pos + 7])
    let payload = pos + 8

    if (size === 1) {
      const high = view.getUint32(pos + 8)
      const low = view.getUint32(pos + 12)
      size = high * 2 ** 32 + low
      payload = pos + 16
    } else if (size === 0) {
      size = end - pos
    }

    if (size < 8) break

    boxes.push({ type, start: pos, end: pos + size, payload })
    pos += size
  }

  return boxes
}

/**
 * Parses a `sidx` box into fragment entries with absolute byte offsets.
 * @param {Buffer|Uint8Array} data
 * @param {{end: number, payload: number}} box
 * @returns {{timescale: number, fragments: {startTicks: number, durationTicks: number, offset: number, length: number}[]}}
 */
export function parseSidx(data, box) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  let pos = box.payload

  const version = data[pos]
  pos += 4 // version + flags
  pos += 4 // reference_ID

  const timescale = view.getUint32(pos)
  pos += 4

  let earliestPresentationTime
  let firstOffset

  if (version === 0) {
    earliestPresentationTime = view.getUint32(pos)
    firstOffset = view.getUint32(pos + 4)
    pos += 8
  } else {
    earliestPresentationTime = Number(view.getBigUint64(pos))
    firstOffset = Number(view.getBigUint64(pos + 8))
    pos += 16
  }

  pos += 2 // reserved
  const referenceCount = view.getUint16(pos)
  pos += 2

  /** `first_offset` is measured from the end of the sidx box. */
  let offset = box.end + firstOffset
  let ticks = earliestPresentationTime
  const fragments = []

  for (let i = 0; i < referenceCount; i += 1) {
    const word = view.getUint32(pos)
    const durationTicks = view.getUint32(pos + 4)
    pos += 12

    const referenceType = word >>> 31
    const length = word & 0x7fffffff

    if (referenceType !== 0) {
      throw new Error('sidx references another sidx; nested indexes are not supported')
    }

    fragments.push({ startTicks: ticks, durationTicks, offset, length })
    offset += length
    ticks += durationTicks
  }

  return { timescale, fragments }
}

/**
 * Builds the byte-range index for one rendition file.
 * @param {Buffer|Uint8Array} data
 * @returns {{timescale: number, initRange: [number, number], indexRange: [number, number], durationTicks: number, fragments: {startTicks: number, durationTicks: number, offset: number, length: number}[]}}
 */
export function buildFragmentIndex(data) {
  const boxes = readBoxes(data)
  const moov = boxes.find((box) => box.type === 'moov')
  const sidx = boxes.find((box) => box.type === 'sidx')

  if (!moov) {
    throw new Error('No moov box: input is not an MP4')
  }
  if (!sidx) {
    throw new Error('No sidx box: re-encode with -movflags +global_sidx')
  }

  const { timescale, fragments } = parseSidx(data, sidx)

  if (fragments.length === 0) {
    throw new Error('sidx contains no fragment references')
  }

  const last = fragments[fragments.length - 1]

  return {
    timescale,
    /** Initialization segment for MSE is ftyp+moov only — sidx must not be appended. */
    initRange: [0, moov.end - 1],
    indexRange: [sidx.start, sidx.end - 1],
    durationTicks: last.startTicks + last.durationTicks - fragments[0].startTicks,
    fragments,
  }
}

/**
 * Fails when renditions do not share identical fragment boundaries. Without this
 * a fragment from another rendition cannot be appended to the same SourceBuffer.
 * @param {{bitrate: number, index: {timescale: number, fragments: {startTicks: number, durationTicks: number}[]}}[]} renditions
 */
export function assertAlignedRenditions(renditions) {
  if (renditions.length === 0) {
    throw new Error('No renditions to validate')
  }

  const [reference, ...rest] = renditions
  const signature = (rendition) =>
    rendition.index.fragments.map((fragment) => `${fragment.startTicks}:${fragment.durationTicks}`)

  const referenceSignature = signature(reference)

  for (const rendition of rest) {
    if (rendition.index.timescale !== reference.index.timescale) {
      throw new Error(
        `Rendition ${rendition.bitrate} has timescale ${rendition.index.timescale}, expected ${reference.index.timescale}`,
      )
    }

    const current = signature(rendition)

    if (current.length !== referenceSignature.length) {
      throw new Error(
        `Rendition ${rendition.bitrate} has ${current.length} fragments, expected ${referenceSignature.length}`,
      )
    }

    const mismatch = current.findIndex((entry, position) => entry !== referenceSignature[position])

    if (mismatch !== -1) {
      throw new Error(
        `Rendition ${rendition.bitrate} fragment ${mismatch} is ${current[mismatch]}, expected ${referenceSignature[mismatch]}`,
      )
    }
  }
}
