import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { packagerPath } from './packager-path.mjs'

describe('packagerPath', () => {
  it('resolves the binary the npm package ships for each supported platform', () => {
    expect(packagerPath('linux', 'x64')).toMatch(/shaka-packager[\\/]bin[\\/]packager-linux-x64$/)
    expect(packagerPath('linux', 'arm64')).toMatch(/packager-linux-arm64$/)
    expect(packagerPath('darwin', 'arm64')).toMatch(/packager-osx-arm64$/)
    expect(packagerPath('win32', 'x64')).toMatch(/packager-win-x64\.exe$/)
  })

  it('refuses a platform the package has no binary for', () => {
    expect(() => packagerPath('linux', 'ia32')).toThrow('no binary for linux/ia32')
    expect(() => packagerPath('freebsd', 'x64')).toThrow('no binary for freebsd/x64')
  })

  it('runs on this machine', () => {
    expect(execFileSync(packagerPath(), ['--version'], { encoding: 'utf8' })).toMatch(/packager/)
  })
})
