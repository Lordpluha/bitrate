// Writes the resource-page specs (admin-resources.mjs) into the admin prototype between its
// @resources markers, so the prototype and the Pencil pages are filled from the same data.
import { readFileSync, writeFileSync } from 'node:fs'
import {
  DETAIL_STATES,
  FORM_STATES,
  LIST_STATES,
  RESOURCES,
  RESOURCES_UK,
  STATE_LABEL,
} from './admin-resources.mjs'

const START = '/* @resources:start */'
const END = '/* @resources:end */'

export function writePrototypeData(file) {
  const html = readFileSync(file, 'utf8')
  const a = html.indexOf(START)
  const b = html.indexOf(END)
  if (a < 0 || b < a) throw new Error(`${file}: no @resources markers`)
  const data = [
    `const RESOURCES = ${JSON.stringify(RESOURCES, null, 2)}`,
    `const LIST_STATES = ${JSON.stringify(LIST_STATES)}`,
    `const DETAIL_STATES = ${JSON.stringify(DETAIL_STATES)}`,
    `const FORM_STATES = ${JSON.stringify(FORM_STATES)}`,
    `const STATE_LABEL = ${JSON.stringify(STATE_LABEL, null, 2)}`,
    `const RESOURCES_UK = ${JSON.stringify(RESOURCES_UK, null, 2)}`,
  ].join('\n')
  const next = `${html.slice(0, a + START.length)}\n${data}\n${html.slice(b)}`
  if (next !== html) writeFileSync(file, next)
}
