#!/usr/bin/env python3
"""Compare declared verification inputs, not proof that the reported check ran."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'hooks'))
from project_guard import protected

EXCLUDED = {'node_modules', '.git', '.next', '.turbo', 'coverage', '__pycache__', '.claude'}


def snapshot(root, inputs):
    result = {}
    for value in sorted(set(inputs)):
        start = root / value
        start.resolve().relative_to(root)
        if not start.exists() or start.is_symlink() or protected(str(start), root):
            raise ValueError('Invalid verification input')
        candidates = [start]
        if start.is_dir():
            result[str(start.relative_to(root)) + '/'] = 'directory'
            candidates = []
            for directory, dirs, files in os.walk(start, followlinks=False):
                dirs[:] = [d for d in dirs if d not in EXCLUDED and
                           not (Path(directory) / d).is_symlink() and
                           not protected(str(Path(directory) / d), root)]
                candidates.extend(Path(directory) / f for f in files)
        for path in candidates:
            if path.is_symlink():
                raise ValueError('Symlink input requires an explicit safe source selection')
            if protected(str(path), root):
                continue  # Never read or hash credentials; use a non-secret environment label.
            path.resolve().relative_to(root)
            result[str(path.relative_to(root))] = hashlib.sha256(path.read_bytes()).hexdigest()
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=['record', 'check'])
    parser.add_argument('--name', required=True)
    parser.add_argument('--variant', required=True, help='Non-secret environment label')
    parser.add_argument('--tool-version', required=True)
    parser.add_argument('--input', action='append', required=True)
    parser.add_argument('--exit-code', type=int)
    argv = sys.argv[1:]
    if '--' not in argv:
        parser.error('provide the verified command after --')
    split = argv.index('--')
    args = parser.parse_args(argv[:split])
    command = argv[split + 1:]
    if not command or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,63}', args.name):
        parser.error('command and a safe lowercase record name are required')
    if args.operation == 'record' and args.exit_code != 0:
        parser.error('record only an observed successful check with --exit-code 0')
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    root = Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], env=env, text=True).strip()).resolve()
    git_dir = Path(subprocess.check_output(['git', 'rev-parse', '--absolute-git-dir'], env=env, text=True).strip())
    record = git_dir / 'bitrate-verification' / (args.name + '.json')
    evidence = {'cwd': str(Path.cwd().resolve()), 'command': command,
                'variant': args.variant, 'tool_version': args.tool_version,
                'inputs': sorted(set(args.input)), 'files': snapshot(root, args.input)}
    if args.operation == 'record':
        record.parent.mkdir(exist_ok=True)
        evidence['recorded_at'] = time.time()
        temporary = record.with_suffix(f'.{os.getpid()}.tmp')
        temporary.write_text(json.dumps(evidence, sort_keys=True))
        temporary.replace(record)
        print('Recorded declared successful-check evidence; execution was not independently verified.')
        return 0
    previous = json.loads(record.read_text())
    previous.pop('recorded_at', None)
    valid = previous == evidence
    print('Inputs match; reuse still depends on complete dependency/environment coverage.' if valid
          else 'Evidence stale: command, environment label, tool version or input files changed.')
    return 0 if valid else 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, subprocess.SubprocessError):
        print('Evidence unavailable or inputs unsafe/incomplete; rerun the relevant check.', file=sys.stderr)
        sys.exit(1)
