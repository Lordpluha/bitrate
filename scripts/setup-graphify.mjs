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
  if (process.env.CI || process.env.SKIP_GRAPHIFY_INSTALL) return

  if (commandExists('graphify')) return

  if (commandExists('uv')) {
    console.log('[setup-graphify] installing graphify via uv...')
    run('uv tool install graphifyy -q')
    return
  }

  if (commandExists('pip3') || commandExists('pip')) {
    const pip = commandExists('pip3') ? 'pip3' : 'pip'
    console.log(`[setup-graphify] installing graphify via ${pip}...`)
    try {
      run(`${pip} install graphifyy -q`)
    } catch {
      run(`${pip} install graphifyy -q --break-system-packages`)
    }
    return
  }

  console.log(
    '[setup-graphify] skipped — no uv or pip found. Install manually: pip install graphifyy ' +
      '(see .claude/rules/knowledge-base.md).',
  )
}

try {
  main()
} catch (error) {
  console.log(`[setup-graphify] skipped — ${error.message}`)
}
