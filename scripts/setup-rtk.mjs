#!/usr/bin/env node
import { execSync } from 'node:child_process'

function commandExists(cmd) {
  try {
    execSync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`, {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' })
}

function main() {
  if (process.env.CI || process.env.SKIP_RTK_INSTALL) return

  if (commandExists('rtk')) return

  if (process.platform === 'win32') {
    console.log(
      '[setup-rtk] skipped — no installer for Windows. Install manually: ' +
        'https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh (WSL/Git Bash).',
    )
    return
  }

  console.log('[setup-rtk] installing rtk...')
  run('curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh')
  run('rtk init --global')
}

try {
  main()
} catch (error) {
  console.log(`[setup-rtk] skipped — ${error.message}`)
}
