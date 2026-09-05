/**
 * Reads the box layout of a fragmented MP4 and turns its global `sidx` into a
 * time-to-byte fragment index. This is what lets the player ask for one
 * fragment with a single Range request instead of guessing byte offsets.
 */

/** Bounds index allocation even when a corrupt box advertises an absurd size. */
const MAX_SIDX_BYTES = 16 * 1024 * 1024

/** Prevents a malicious file from forcing an unbounded top-level scan. */
const MAX_TOP_LEVEL_BOXES = 4096

/**
 * Reads top-level boxes in [start, end).
 * @param {Buffer|Uint8Array} data
 * @param {number} [start]
 * @param {number} [end]
 * @returns {{type: string, start: number, end: number, payload: number}[]}
 */
export function readBoxes(data, start = 0, end = data.length) {
  if (
    !(Number.isSafeInteger(start) && Number.isSafeInteger(end) && start >= 0 && end <= data.length)
  ) {
    throw new Error('Invalid MP4 box scan bounds')
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const boxes = []
  let pos = start

  while (pos + 8 <= end) {
    let size = view.getUint32(pos)
    const type = String.fromCharCode(data[pos + 4], data[pos + 5], data[pos + 6], data[pos + 7])
    let payload = pos + 8

    if (size === 1) {
      if (pos + 16 > end) throw new Error('Truncated extended MP4 box header')
      const high = view.getUint32(pos + 8)
      const low = view.getUint32(pos + 12)
      size = high * 2 ** 32 + low
      payload = pos + 16
    } else if (size === 0) {
      size = end - pos
    }

    if (!Number.isSafeInteger(size) || size < payload - pos || pos + size > end) {
      throw new Error(`Invalid ${type || 'unknown'} MP4 box size`)
    }

    boxes.push({ type, start: pos, end: pos + size, payload })
    if (boxes.length > MAX_TOP_LEVEL_BOXES) throw new Error('Too many top-level MP4 boxes')
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

  if (
    !Number.isSafeInteger(box.payload) ||
    !Number.isSafeInteger(box.end) ||
    box.payload < 0 ||
    box.end > data.length ||
    box.payload + 24 > box.end
  ) {
    throw new Error('Invalid or truncated sidx box')
  }

  const version = data[pos]
  if (version !== 0 && version !== 1) throw new Error(`Unsupported sidx version: ${version}`)
  const fixedHeaderLength = version === 0 ? 24 : 32
  if (box.payload + fixedHeaderLength > box.end) throw new Error('Truncated sidx header')
  pos += 4 // version + flags
  pos += 4 // reference_ID

  const timescale = view.getUint32(pos)
  if (timescale === 0) throw new Error('sidx timescale must be positive')
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
    if (!(Number.isSafeInteger(earliestPresentationTime) && Number.isSafeInteger(firstOffset))) {
      throw new Error('sidx 64-bit values exceed JavaScript safe integer range')
    }
    pos += 16
  }

  pos += 2 // reserved
  const referenceCount = view.getUint16(pos)
  pos += 2

  if (pos + referenceCount * 12 > box.end) throw new Error('Truncated sidx references')

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
    if (length === 0 || durationTicks === 0) {
      throw new Error('sidx fragment length and duration must be positive')
    }
    if (!Number.isSafeInteger(offset + length)) throw new Error('sidx byte offset is unsafe')

    fragments.push({ startTicks: ticks, durationTicks, offset, length })
    offset += length
    ticks += durationTicks
  }

  return { timescale, fragments }
}

/** Finalizes and validates an index against the complete representation size. */
function finalizeIndex({ moovEnd, sidxStart, sidxEnd, timescale, fragments, fileSize }) {
  if (fragments.length === 0) throw new Error('sidx contains no fragment references')
  const first = fragments[0]
  const last = fragments.at(-1)
  if (!(first && last)) throw new Error('sidx contains no fragment references')
  if (fragments.some((fragment) => fragment.offset + fragment.length > fileSize)) {
    throw new Error('sidx fragment points outside the rendition file')
  }

  return {
    timescale,
    /** Initialization segment for MSE is ftyp+moov only — sidx must not be appended. */
    initRange: [0, moovEnd - 1],
    indexRange: [sidxStart, sidxEnd - 1],
    durationTicks: last.startTicks + last.durationTicks - first.startTicks,
    fragments,
  }
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

  return finalizeIndex({
    moovEnd: moov.end,
    sidxStart: sidx.start,
    sidxEnd: sidx.end,
    timescale,
    fragments,
    fileSize: data.length,
  })
}

/** Reads exactly one byte window from a Node file handle. */
async function readWindow(handle, length, position) {
  const data = Buffer.alloc(length)
  const { bytesRead } = await handle.read(data, 0, length, position)
  if (bytesRead !== length) throw new Error('Unexpected end of CMAF rendition')
  return data
}

/**
 * Builds an index by reading only top-level headers plus the bounded global
 * `sidx`, keeping memory independent from the encoded audio size.
 *
 * @param {{read: Function}} handle Node.js FileHandle-compatible reader.
 * @param {number} fileSize
 */
export async function buildFragmentIndexFromFile(handle, fileSize) {
  if (!Number.isSafeInteger(fileSize) || fileSize < 8) throw new Error('Invalid CMAF file size')

  let position = 0
  let boxCount = 0
  let moovEnd = null
  let sidxBox = null

  while (position + 8 <= fileSize) {
    const header = await readWindow(handle, Math.min(16, fileSize - position), position)
    const type = header.subarray(4, 8).toString('latin1')
    let size = header.readUInt32BE(0)
    let headerSize = 8

    if (size === 1) {
      if (header.length < 16) throw new Error('Truncated extended MP4 box header')
      size = Number(header.readBigUInt64BE(8))
      headerSize = 16
    } else if (size === 0) {
      size = fileSize - position
    }

    if (!Number.isSafeInteger(size) || size < headerSize || position + size > fileSize) {
      throw new Error(`Invalid ${type || 'unknown'} MP4 box size`)
    }

    boxCount += 1
    if (boxCount > MAX_TOP_LEVEL_BOXES) throw new Error('Too many top-level MP4 boxes')
    if (type === 'moov') moovEnd = position + size
    if (type === 'sidx') {
      if (size > MAX_SIDX_BYTES) throw new Error('sidx box exceeds the safe parser limit')
      sidxBox = { start: position, end: position + size, headerSize, size }
      break
    }
    position += size
  }

  if (moovEnd === null) throw new Error('No moov box: input is not an MP4')
  if (!sidxBox) throw new Error('No sidx box: re-encode with -movflags +global_sidx')

  const data = await readWindow(handle, sidxBox.size, sidxBox.start)
  const parsed = parseSidx(data, {
    payload: sidxBox.headerSize,
    end: sidxBox.size,
  })
  const fragments = parsed.fragments.map((fragment) => ({
    ...fragment,
    offset: fragment.offset + sidxBox.start,
  }))

  return finalizeIndex({
    moovEnd,
    sidxStart: sidxBox.start,
    sidxEnd: sidxBox.end,
    timescale: parsed.timescale,
    fragments,
    fileSize,
  })
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
