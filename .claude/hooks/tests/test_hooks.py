"""Exercise hook stdin/stdout contracts without touching the working checkout."""
import json
import os
import shlex
from pathlib import Path
import subprocess
import tempfile
import unittest

HOOKS = Path(__file__).resolve().parents[1]


class HookTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name) / 'repo'
        self.repo.mkdir()
        subprocess.run(['git', 'init', '-q', str(self.repo)], check=True)

    def call(self, tool, data, mode='default', cwd=None, script='project_guard.py'):
        result = subprocess.run(
            ['python3', str(HOOKS / script)],
            input=json.dumps({'tool_name': tool, 'tool_input': data,
                              'cwd': str(cwd or self.repo), 'permission_mode': mode}),
            text=True, capture_output=True,
            env={**os.environ, 'CLAUDE_PROJECT_DIR': str(self.repo)},
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)['hookSpecificOutput'] if result.stdout else {}

    def test_reset_requires_one_operation_approval_and_does_not_execute(self):
        marker = self.repo / 'keep.txt'
        marker.write_text('user changes')
        response = self.call('Bash', {'command': 'git reset --hard'})
        self.assertEqual(response['permissionDecision'], 'ask')
        self.assertEqual(marker.read_text(), 'user changes')
        self.assertNotIn('updatedPermissions', json.dumps(response))

    def test_secret_paths_and_symlink_templates_are_denied_without_contents(self):
        secret = self.repo / '.env'
        secret.write_text('TOKEN=never-output-this')
        (self.repo / '.env.example').symlink_to(secret)
        for tool, data in [
            ('Read', {'file_path': '.env'}),
            ('Write', {'file_path': '.aws/new-file'}),
            ('Read', {'file_path': '.env.example'}),
            ('Bash', {'command': 'sed -n 1p .env'}),
            ('Bash', {'command': 'cat < .env'}),
            ('Bash', {'command': 'printenv'}),
        ]:
            with self.subTest(tool=tool, data=data):
                response = self.call(tool, data)
                self.assertEqual(response['permissionDecision'], 'deny')
                self.assertNotIn('never-output-this', json.dumps(response))

    def test_real_templates_and_normal_source_are_allowed(self):
        for path in ['.env.example', '.env.sample', 'src/main.ts']:
            self.assertEqual(self.call('Read', {'file_path': path}), {})
        self.assertEqual(self.call('Bash', {'command': "printf '%s' '.env'"}), {})

    def test_git_risk_variants_require_approval(self):
        subprocess.run(['git', '-C', str(self.repo), 'config', 'alias.wipe', 'reset --hard'], check=True)
        for command in [
            'git switch develop', 'git checkout -b feature', 'git merge feature',
            'git restore src/a.ts', 'git clean -xdf', 'rtk git reset --hard',
            'env FOO=bar git reset --hard', 'git -C . reset --hard', 'git wipe',
            'git branch -D feature', 'git stash push', 'git worktree remove ../agent',
            'cd /tmp || git switch develop', "sh -c 'git reset --hard'",
            'rm -rf node_modules',
            'git status\ngit reset --hard', 'timeout 30 git reset --hard',
            'env -i git reset --hard', '(cd /tmp); git switch develop',
        ]:
            with self.subTest(command=command):
                self.assertEqual(self.call('Bash', {'command': command})['permissionDecision'], 'ask')

    def test_read_only_commands_are_quiet(self):
        for command in ['git status', 'git diff', 'git branch --list', 'git clean -nd',
                        "printf '%s' 'git reset --hard'", 'rg title src', 'git log -3']:
            with self.subTest(command=command):
                self.assertEqual(self.call('Bash', {'command': command}), {})

    def test_linked_worktree_branch_switch_and_explicit_main_target(self):
        linked = self.repo.parent / 'agent'
        subprocess.run(['git', '-C', str(self.repo), 'worktree', 'add', '--orphan',
                        '-b', 'agent', str(linked)], check=True, capture_output=True)
        self.assertEqual(self.call('Bash', {'command': 'git switch task'}, cwd=linked), {})
        command = f'git -C {shlex.quote(str(self.repo))} switch task'
        self.assertEqual(self.call('Bash', {'command': command}, cwd=linked)['permissionDecision'], 'ask')
        for command in ['git switch -fCtask', 'git checkout missing-tracked-file.ts']:
            self.assertEqual(self.call('Bash', {'command': command}, cwd=linked)['permissionDecision'], 'ask')

    def test_cd_secret_paths_and_stdin_redirects_remain_protected(self):
        directory = self.repo / 'credentials'
        directory.mkdir()
        (directory / 'harmless-name').symlink_to(self.repo / '.env')
        for command in ['cd credentials && cat harmless-name', "printf hi > .env",
                        'git status; cat .env', 'cat .env.example; cat .env.production']:
            self.assertEqual(self.call('Bash', {'command': command})['permissionDecision'], 'deny')

    def test_no_permission_mode_bypass_and_no_force_push(self):
        for mode in ['bypassPermissions', 'dontAsk']:
            self.assertEqual(self.call('Bash', {'command': 'git reset --hard'}, mode)['permissionDecision'], 'deny')
        for command in ['git push origin feature --force-with-lease', 'rtk git push origin +HEAD:main']:
            self.assertEqual(self.call('Bash', {'command': command})['permissionDecision'], 'deny')

    def test_malformed_hook_input_is_denied(self):
        for payload in ['not-json', '[]', '{"tool_input": []}']:
            result = subprocess.run(['python3', str(HOOKS / 'project_guard.py')],
                                    input=payload, text=True, capture_output=True)
            self.assertEqual(result.returncode, 0)
            self.assertEqual(json.loads(result.stdout)['hookSpecificOutput']['permissionDecision'], 'deny')

    def formatter(self, root, name):
        binary = root / 'node_modules' / '.bin' / name
        binary.parent.mkdir(parents=True, exist_ok=True)
        binary.write_text('#!/usr/bin/env python3\nimport pathlib,sys\n'
                          'p=pathlib.Path(sys.argv[-1]);p.write_text("formatted")\n')
        binary.chmod(0o755)

    def test_formatter_routes_admin_to_prettier_and_only_touches_target(self):
        admin = self.repo / 'apps' / 'admin'
        admin.mkdir(parents=True)
        (admin / 'package.json').write_text('{}')
        self.formatter(admin, 'prettier')
        target, sibling = admin / 'a.ts', admin / 'b.ts'
        target.write_text('unformatted')
        sibling.write_text('preserve me')
        response = self.call('Edit', {'file_path': str(target)}, script='format_file.py')
        self.assertEqual(response, {})
        self.assertEqual(target.read_text(), 'formatted')
        self.assertEqual(sibling.read_text(), 'preserve me')

    def test_formatter_supports_linked_worktrees(self):
        linked = self.repo / '.claude' / 'worktrees' / 'agent'
        subprocess.run(['git', '-C', str(self.repo), 'worktree', 'add', '--orphan',
                        '-b', 'agent', str(linked)], check=True, capture_output=True)
        self.formatter(linked, 'biome')
        target = linked / 'a.ts'
        target.write_text('unformatted')
        self.call('Write', {'file_path': str(target)}, script='format_file.py')
        self.assertEqual(target.read_text(), 'formatted')

    def test_formatter_reports_missing_tool_and_skips_foreign_symlink(self):
        target = self.repo / 'a.ts'
        target.write_text('unchanged')
        response = self.call('Write', {'file_path': str(target)}, script='format_file.py')
        self.assertIn('unavailable', response['additionalContext'])
        outside = self.repo.parent / 'outside.ts'
        outside.write_text('private')
        target.unlink()
        target.symlink_to(outside)
        self.formatter(self.repo, 'biome')
        self.call('Write', {'file_path': str(target)}, script='format_file.py')
        self.assertEqual(outside.read_text(), 'private')

    def test_formatter_reports_failure_without_leaking_output(self):
        self.formatter(self.repo, 'biome')
        binary = self.repo / 'node_modules/.bin/biome'
        binary.write_text('#!/bin/sh\necho DO_NOT_LEAK >&2\nexit 7\n')
        target = self.repo / 'a.ts'
        target.write_text('unchanged')
        response = self.call('Edit', {'file_path': str(target)}, script='format_file.py')
        self.assertIn('exit 7', response['additionalContext'])
        self.assertNotIn('DO_NOT_LEAK', json.dumps(response))
        self.assertEqual(target.read_text(), 'unchanged')

    def test_player_uses_prettier_and_mobile_does_not_use_biome(self):
        player = self.repo / 'packages/player'
        player.mkdir(parents=True)
        self.formatter(player, 'prettier')
        target = player / 'Component.svelte'
        target.write_text('<div>hello</div>')
        self.assertEqual(self.call('Write', {'file_path': str(target)}, script='format_file.py'), {})
        self.assertEqual(target.read_text(), 'formatted')
        mobile = self.repo / 'apps/mobile'
        mobile.mkdir(parents=True)
        target = mobile / 'app.tsx'
        target.write_text('unchanged')
        self.formatter(self.repo, 'biome')
        response = self.call('Write', {'file_path': str(target)}, script='format_file.py')
        self.assertIn('no configured formatter', response['additionalContext'])
        self.assertEqual(target.read_text(), 'unchanged')

    def test_real_installed_biome_on_temporary_source(self):
        installed = HOOKS.parents[1] / 'node_modules/.bin/biome'
        if not installed.is_file():
            self.skipTest('Local Biome not installed')
        binary = self.repo / 'node_modules/.bin/biome'
        binary.parent.mkdir(parents=True)
        binary.symlink_to(installed.resolve())
        (self.repo / 'biome.json').write_text('{}')
        target = self.repo / 'example.ts'
        target.write_text('const x={a:1}')
        self.assertEqual(self.call('Edit', {'file_path': str(target)}, script='format_file.py'), {})
        self.assertEqual(target.read_text(), 'const x = { a: 1 };\n')

    def test_registered_shell_entrypoints(self):
        settings = json.loads((HOOKS.parent / 'settings.json').read_text())
        guard = settings['hooks']['PreToolUse'][0]
        self.assertIn('Bash', guard['matcher'].split('|'))
        result = subprocess.run(['bash', str(HOOKS / 'block-env-access.sh')],
                                input=json.dumps({'tool_name': 'Bash',
                                                  'tool_input': {'command': 'git reset --hard'},
                                                  'cwd': str(self.repo)}),
                                text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)['hookSpecificOutput']['permissionDecision'], 'ask')


if __name__ == '__main__':
    unittest.main()
