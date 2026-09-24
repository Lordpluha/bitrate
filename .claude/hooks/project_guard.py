"""Claude tool-call guard. Never executes the submitted shell command."""
import json
import os
from pathlib import Path
import re
import shlex
import signal
import subprocess
import sys

TEMPLATES = {'.env.example', '.env.sample', '.env.template', '.env.dist'}
SECRET_NAMES = {'.envrc', '.npmrc', '.netrc', '_netrc', '.pgpass', '.git-credentials', 'credentials.json'}


def protected(path, cwd):
    path = Path(os.path.expanduser(path))
    if not path.is_absolute():
        path = cwd / path
    for candidate in (path, path.resolve()):
        name, parts = candidate.name, candidate.parts
        if {'.ssh', '.aws', '.gnupg'} & set(parts):
            return True
        if '.docker' in parts and name == 'config.json':
            return True
        if len(parts) > 1 and parts[1] == 'proc' and name == 'environ':
            return True
        if name in SECRET_NAMES or name.startswith(('.envrc.', 'id_rsa', 'id_ed25519', 'id_ecdsa')):
            return True
        if name == '.env' or (name.startswith('.env.') and name not in TEMPLATES):
            return True
        if name.endswith(('.pem', '.p12', '.pfx', '.keystore', '.jks')):
            return True
        if name.startswith('service-account') and name.endswith('.json'):
            return True
    return False


def shell_segments(command):
    lexer = shlex.shlex(command, posix=True, punctuation_chars=';&|()<>\n')
    lexer.whitespace = ' \t\r'
    lexer.whitespace_split = True
    lexer.commenters = '#'
    segments, current = [], []
    for word in lexer:
        if word and all(c in ';&|()\n' for c in word):
            if current:
                segments.append(current)
            current = []
        else:
            current.append(word)
    if current:
        segments.append(current)
    return segments


def decide(decision, reason, mode):
    if decision == 'ask' and mode in {'bypassPermissions', 'dontAsk'}:
        decision = 'deny'
        reason += ' Use an interactive permission mode to approve this single operation.'
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse', 'permissionDecision': decision,
        'permissionDecisionReason': reason,
    }}))


def git_probe(cwd, *args):
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env.update(GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=os.devnull)
    return subprocess.run(['git', '-C', str(cwd), *args], env=env,
                          capture_output=True, text=True, timeout=2, check=True).stdout.strip()


ASK = ('ask', 'Potentially destructive or checkout-changing operation. Approve this tool call only (Allow once).')
READ_GIT = {'status', 'diff', 'log', 'show', 'ls-files', 'ls-tree', 'rev-parse',
            'check-ignore', 'describe', 'shortlog', 'blame', 'grep', 'version', 'help'}


def unwrap(words):
    words = list(words)
    while words:
        name = Path(words[0]).name
        if re.match(r'^[A-Za-z_][A-Za-z_0-9]*=', words[0]):
            if words[0].startswith('GIT_'):
                return None
            words.pop(0)
        elif name in {'command', 'exec', 'env', 'rtk', 'flatpak-spawn'}:
            if name == 'env' and len(words) == 1:
                break
            words.pop(0)
            while words and words[0] in {'--', '--host', 'proxy'}:
                words.pop(0)
            if words and words[0].startswith('-'):
                return None
        else:
            break
    return words


def git_guard(words, cwd, depth=0):
    args = words[1:]
    while args and args[0].startswith('-'):
        flag = args.pop(0)
        if flag == '-C' and args:
            cwd = (cwd / args.pop(0)).resolve()
        elif flag in {'--no-pager', '--no-optional-locks', '--literal-pathspecs'}:
            continue
        elif flag in {'--version', '--help'}:
            return None
        else:
            return ASK
    if not args:
        return None
    op, flags = args[0], args[1:]
    if op == 'push' and any(f.startswith(('--force', '+')) or
                           (f.startswith('-') and not f.startswith('--') and 'f' in f) for f in flags):
        return 'deny', 'Force push is prohibited by project policy.'
    if op in READ_GIT or (op == 'clean' and any(f == '--dry-run' or
                         (f.startswith('-') and not f.startswith('--') and 'n' in f) for f in flags)):
        return None
    if op == 'branch' and not any(f.startswith(('--delete', '--force', '--move', '--copy',
                                               '--edit', '--set', '--unset')) or
                                 (f.startswith('-') and not f.startswith('--') and
                                  set(f[1:]) & set('dDfFmMcCu')) for f in flags):
        return None
    if op == 'worktree' and flags and flags[0] == 'list':
        return None
    if op in {'switch', 'checkout', 'merge', 'pull', 'rebase', 'cherry-pick', 'am'}:
        git_dir = Path(git_probe(cwd, 'rev-parse', '--absolute-git-dir')).resolve()
        common = Path(git_probe(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir')).resolve()
        if git_dir == common or op not in {'switch', 'checkout'}:
            return ASK
        if op == 'switch' and any(f.startswith('-') and f not in {
            '-c', '--create', '-d', '--detach', '--guess', '--no-guess', '-t', '--track',
            '--no-track', '-q', '--quiet', '--progress', '--no-progress',
        } for f in flags):
            return ASK
        if any(f.startswith(('-B', '-C', '--force', '--discard')) or f in {'--', '-f', '--force', '--discard-changes', '-B', '-C', '--force-create',
                     '--merge', '-m', '--orphan', '--ours', '--theirs', '-p', '--patch'} for f in flags):
            return ASK
        # checkout accepts pathspecs without `--`; only a single branch-like argument is safe.
        if op == 'checkout' and len(flags) != 1:
            return ASK
        if op == 'checkout':
            try:
                git_probe(cwd, 'rev-parse', '--verify', '--end-of-options', flags[0] + '^{commit}')
            except subprocess.CalledProcessError:
                return ASK
        return None
    if op in {'reset', 'restore', 'clean', 'stash', 'branch', 'worktree', 'config',
              'reflog', 'update-ref', 'symbolic-ref', 'read-tree', 'apply', 'submodule'}:
        return ASK
    if op in {'add', 'commit', 'fetch', 'push'}:
        return None
    if depth >= 3:
        return ASK
    try:
        alias = git_probe(cwd, 'config', '--get', 'alias.' + op)
    except subprocess.CalledProcessError:
        return ASK
    if alias.startswith('!'):
        return ASK
    return git_guard(['git', *shlex.split(alias), *flags], cwd, depth + 1)


def guard(command, cwd):
    pending = None
    for words in shell_segments(command):
        words = unwrap(words)
        if not words:
            pending = ASK
            continue
        executable = Path(words[0]).name
        if executable in {'env', 'printenv'} or (executable == 'gh' and words[1:3] == ['auth', 'token']):
            return 'deny', 'Reading credentials or dumping the environment is prohibited.'
        paths = words[1:]
        if executable in {'echo', 'printf'}:
            paths = [words[i + 1] for i, w in enumerate(words[:-1]) if '<' in w or '>' in w]
        if any(protected(w.split('=', 1)[-1], cwd) for w in paths if w not in {'<', '>', '>>'}):
            return 'deny', 'Access to a protected credentials path is prohibited.'
        if executable == 'cd':
            if len(words) != 2 or any(c in words[1] for c in '$`~') or '||' in command:
                pending = ASK
            else:
                cwd = (cwd / words[1]).resolve()
        elif executable == 'git':
            try:
                verdict = git_guard(words, cwd)
            except subprocess.CalledProcessError:
                verdict = ASK
            if verdict and verdict[0] == 'deny':
                return verdict
            pending = verdict or pending
        elif executable in {'rm', 'rmdir', 'sh', 'bash', 'zsh', 'eval', 'source', '.', 'sudo', 'timeout', 'nice', 'xargs'}:
            pending = ASK
    if command.strip() == 'env':
        return 'deny', 'Dumping the environment is prohibited.'
    # Dynamic shell evaluation cannot be classified as a literal tool operation.
    if '$(' in command or '`' in command or re.search(r'\$[A-Za-z_{]', command):
        pending = ASK
    if 'git' in command and any(c in command for c in '()'):
        pending = ASK
    return pending
    return None


def main():
    event = json.load(sys.stdin)
    if not isinstance(event, dict) or not isinstance(event.get('tool_input'), dict):
        raise ValueError('Invalid hook event')
    mode = event.get('permission_mode', 'default')
    data, tool = event['tool_input'], event['tool_name']
    cwd = Path(event['cwd'])
    if tool == 'Bash':
        verdict = guard(data['command'], cwd)
    else:
        paths = [data[key] for key in ('file_path', 'notebook_path', 'path') if data.get(key)]
        if tool == 'Glob' and data.get('pattern'):
            paths.append(str(Path(data.get('path', str(cwd))) / data['pattern']))
        verdict = ('deny', 'Access to a protected credentials path is prohibited.') if any(
            protected(path, cwd) for path in paths) else None
    if verdict:
        decide(*verdict, mode)


if __name__ == '__main__':
    def deadline(_signum, _frame):
        raise TimeoutError('Guard deadline')

    signal.signal(signal.SIGALRM, deadline)
    signal.alarm(6)
    try:
        main()
    except (ValueError, KeyError, TypeError, AttributeError, RuntimeError, OSError, subprocess.SubprocessError):
        decide('deny', 'Cannot safely inspect this tool call; check hook input and Git context.', 'default')
