import type { Readable } from 'node:stream'

/** Drains an export stream into its text, for assertions. */
export async function readCsvExport(stream: Readable): Promise<string> {
  let text = ''
  for await (const chunk of stream) text += String(chunk)
  return text
}
