import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resolvePath } from './resolve-path.mjs'

/** This repo's root, derived from this file so the tests survive a rename or a clone elsewhere. */
const workspaceRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../..')

describe('resolvePath', () => {
  describe('absolute paths', () => {
    it('returns the absolute path unchanged', async () => {
      const result = await resolvePath('/usr/local/icons', '/some/base')
      expect(result).toBe('/usr/local/icons')
    })

    it('returns a nested absolute path unchanged', async () => {
      const result = await resolvePath('/home/user/project/src/icons', '/base')
      expect(result).toBe('/home/user/project/src/icons')
    })
  })

  describe('relative paths', () => {
    it('resolves relative path against basePath', async () => {
      const base = '/home/user/project'
      const result = await resolvePath('./icons', base)
      expect(result).toBe(path.resolve(base, './icons'))
    })

    it('resolves parent directory traversal', async () => {
      const base = '/home/user/project/src'
      const result = await resolvePath('../assets/icons', base)
      expect(result).toBe(path.resolve(base, '../assets/icons'))
    })

    it('resolves deeply nested relative path', async () => {
      const base = '/home/user/project'
      const result = await resolvePath('packages/ui/icons', base)
      expect(result).toBe(path.resolve(base, 'packages/ui/icons'))
    })
  })

  describe('@scope/package paths', () => {
    it('throws when workspace root cannot be found', async () => {
      // Use an isolated temp path with no workspace markers
      await expect(resolvePath('@nonexistent/pkg/icons', '/tmp')).rejects.toThrow()
    })

    it('throws when the package is not found in the workspace', async () => {
      // The workspace root exists (this repo) but the package does not
      await expect(
        resolvePath('@nonexistent/totally-fake-pkg/icons', workspaceRoot),
      ).rejects.toThrow()
    })

    it('resolves a real workspace package without a sub-path', async () => {
      const result = await resolvePath('@bitrate/svgr', workspaceRoot)
      expect(path.isAbsolute(result)).toBe(true)
      expect(result).toContain('svgr')
    })

    it('resolves a real workspace package with a sub-path', async () => {
      const result = await resolvePath('@bitrate/svgr/src', workspaceRoot)
      expect(result.endsWith('/src')).toBe(true)
    })
  })
})
