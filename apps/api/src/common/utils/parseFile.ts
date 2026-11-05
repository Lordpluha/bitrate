import { readFileSync } from 'node:fs'
import ts from 'typescript'

/** Parses a source file once, memoized by absolute path. */
const sourceFileCache = new Map<string, ts.SourceFile>()

export function parseFileByPath(filePath: string): ts.SourceFile {
  const cached = sourceFileCache.get(filePath)
  if (cached) return cached
  const text = readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true)
  sourceFileCache.set(filePath, sourceFile)
  return sourceFile
}
