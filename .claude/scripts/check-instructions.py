#!/usr/bin/env python3
"""Validate instruction metadata, local links and representative rule scopes.

Run: uv run --offline --no-project --with pyyaml python .claude/scripts/check-instructions.py
"""
import argparse
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote

import yaml

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = {
    'apps/web-player/src/views/Home/ui/Home.tsx': ({'web-player-rules', 'react', 'styling'}, {'forms', 'admin-rules', 'mobile-rules'}),
    'apps/web-player/src/features/Auth/ui/LoginForm.tsx': ({'forms'}, {'admin-rules'}),
    'apps/admin/src/app/example.ts': ({'admin-rules', 'typescript'}, {'react', 'fsd-web-player', 'forms'}),
    'apps/admin/src/styles.css': ({'admin-rules', 'design-tokens'}, {'react', 'styling'}),
    'apps/mobile/src/Screen.tsx': ({'mobile-rules'}, {'react', 'fsd-web-player', 'styling', 'forms'}),
    'apps/desktop/src/Screen.tsx': ({'desktop-rules', 'react'}, {'fsd-web-player', 'forms', 'styling'}),
    'packages/player/src/Player.svelte': ({'player-rules'}, {'react', 'fsd-web-player', 'styling'}),
    'apps/api/src/tracks.service.ts': ({'api-rules', 'typescript'}, {'react', 'forms', 'styling'}),
    'apps/docs/docs/guide.md': ({'project-conventions'}, {'react', 'api-rules', 'monorepo'}),
}


def frontmatter(text):
    if not text.startswith('---\n'):
        return {}
    parts = text.split('---', 2)
    if len(parts) != 3:
        raise ValueError('Unclosed YAML frontmatter')
    data = yaml.safe_load(parts[1])
    if not isinstance(data, dict):
        raise ValueError('Frontmatter must be a mapping')
    return data


def matches(pattern, path):
    # Current project patterns use *, ** and ?. Refuse unsupported syntax, not a false pass.
    if any(c in pattern for c in '{}[]'):
        raise ValueError('Scope checker needs a fixture/parser update for this glob syntax')
    regex = re.escape(pattern).replace(r'\*\*/', '(?:.*/)?').replace(r'\*\*', '.*')
    regex = regex.replace(r'\*', '[^/]*').replace(r'\?', '[^/]')
    return re.fullmatch(regex, path) is not None


def profile(directory):
    rules = {}
    for file in directory.glob('*.md'):
        text = file.read_text()
        paths = frontmatter(text).get('paths')
        if paths is not None and (not isinstance(paths, list) or not paths or
                                  not all(isinstance(p, str) for p in paths)):
            raise ValueError(f'{file}: paths must be a nonempty string list')
        rules[file.stem] = (paths, len(text.encode()))
    return {path: {'rules': sorted(name for name, (patterns, _) in rules.items()
                                  if patterns is None or any(matches(p, path) for p in patterns)),
                   'source_bytes': sum(size for patterns, size in rules.values()
                                       if patterns is None or any(matches(p, path) for p in patterns))}
            for path in FIXTURES}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', type=Path, help='Optional earlier repository root snapshot')
    args = parser.parse_args()
    errors = []
    files = [ROOT / 'CLAUDE.md']
    for folder in ['rules', 'agents', 'commands', 'references', 'output-styles']:
        files.extend((ROOT / '.claude' / folder).glob('*.md'))
    files.extend((ROOT / '.claude/skills').glob('br-*/SKILL.md'))
    files.append(ROOT / '.claude/templates/task-spec.md')
    for file in files:
        text = file.read_text()
        try:
            metadata = frontmatter(text)
            if file.parent.name == 'agents' and not all(metadata.get(k) for k in ('name', 'description')):
                errors.append(f'{file.relative_to(ROOT)}: agent metadata incomplete')
        except (ValueError, yaml.YAMLError) as exc:
            errors.append(f'{file.relative_to(ROOT)}: {exc}')
        if file.parent.name == 'output-styles' and metadata.get('keep-coding-instructions') is not True:
            errors.append(f'{file.relative_to(ROOT)}: coding instructions must be preserved')
        # Code fences can contain example/template links, not real repository references.
        prose = re.sub(r'```.*?```', '', text, flags=re.S)
        for target in re.findall(r'(?<!!)\[[^\]]*\]\(([^\s)]+)\)', prose):
            target = unquote(target.split('#', 1)[0])
            if not target or re.match(r'[a-z]+:', target) or target.startswith('/'):
                continue
            if not (file.parent / target).exists():
                errors.append(f'{file.relative_to(ROOT)}: broken link {target}')
    current = profile(ROOT / '.claude/rules')
    for path, (required, forbidden) in FIXTURES.items():
        actual = set(current[path]['rules'])
        if not required <= actual or forbidden & actual:
            errors.append(f'{path}: missing {sorted(required - actual)}, unexpected {sorted(forbidden & actual)}')
    if len((ROOT / 'CLAUDE.md').read_text().splitlines()) >= 200:
        errors.append('CLAUDE.md no longer under 200 lines')
    result = {'profiles': current, 'errors': errors}
    if args.baseline:
        old = profile(args.baseline / '.claude/rules')
        for path in current:
            current[path]['before_bytes'] = old[path]['source_bytes']
    print(json.dumps(result, indent=2))
    return bool(errors)


if __name__ == '__main__':
    sys.exit(main())
