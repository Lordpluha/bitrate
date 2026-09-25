"""Format only the edited file using tools installed in its own checkout."""
import json
import os
from pathlib import Path
import subprocess
import sys

from project_guard import git_probe, protected


def notice(message):
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PostToolUse',
                                           'additionalContext': message}}))


def main():
    event = json.load(sys.stdin)
    cwd = Path(event['cwd'])
    value = event['tool_input'].get('file_path')
    if not value:
        return
    lexical = cwd / value
    if protected(value, cwd) or lexical.is_symlink():
        return
    target = lexical.resolve()
    if not target.is_file():
        return
    root = Path(git_probe(target.parent, 'rev-parse', '--show-toplevel')).resolve()
    project = Path(os.environ.get('CLAUDE_PROJECT_DIR', str(cwd)))
    common_args = ('rev-parse', '--path-format=absolute', '--git-common-dir')
    if Path(git_probe(root, *common_args)).resolve() != Path(git_probe(project, *common_args)).resolve():
        notice('Formatting skipped: file belongs to another repository.')
        return
    relative = target.relative_to(root)
    if set(relative.parts) & {'node_modules', '.git', '.next', 'dist', 'build', 'coverage',
                             '.turbo', '.expo', 'target', 'storybook-static'}:
        return
    area = '/'.join(relative.parts[:2])
    if area == 'apps/mobile':
        notice('Formatting skipped: mobile has no configured formatter. Use its scoped lint workflow.')
        return
    prettier = area in {'apps/admin', 'packages/player'}
    extensions = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.jsonc', '.css'}
    if prettier:
        extensions |= {'.svelte', '.html', '.scss', '.md', '.yaml', '.yml'}
    if target.suffix not in extensions:
        return
    workspace = root / area if len(relative.parts) > 2 and relative.parts[0] in {'apps', 'packages'} else root
    name = 'prettier' if prettier else 'biome'
    binary = next((p for p in (workspace / 'node_modules/.bin' / name,
                              root / 'node_modules/.bin' / name) if os.access(p, os.X_OK)), None)
    if binary is None:
        notice(f'Formatting not run: local {name} is unavailable in this checkout.')
        return
    args = ['--write'] if prettier else ['format', '--write']
    # Diagnostics can contain source or credentials: report status, not formatter output.
    result = subprocess.run([str(binary), *args, str(target)], cwd=workspace,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=15)
    if result.returncode:
        notice(f'{name} formatting failed (exit {result.returncode}); inspect the file with its workspace formatter.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, AttributeError, RuntimeError, OSError, subprocess.SubprocessError):
        notice('Formatting not completed: invalid event, Git context, timeout or tool failure.')
