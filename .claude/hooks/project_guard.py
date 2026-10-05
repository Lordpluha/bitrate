"""Claude tool-call guard. Never executes the submitted shell command.

Denies secret access, environment dumps, force pushes and pushes to develop. Asks for
one-call approval only when an operation can lose data outside an agent worktree or
changes the developer's main checkout; ordinary shell syntax stays quiet.
"""
import json
import os
from pathlib import Path
import re
import shlex
import signal
import subprocess
import sys
import tempfile

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


HEREDOC = re.compile(r"(?<!<)<<(-?)\s*(['\"]?)([A-Za-z_][A-Za-z_0-9]*)\2")
SHELLS = {'sh', 'bash', 'zsh', 'dash', 'ksh'}


def split_heredocs(command):
    """Drop heredoc bodies (data, not commands); return bodies fed to a shell for inspection."""
    lines, kept, shell_bodies, index = command.split('\n'), [], [], 0
    while index < len(lines):
        line = lines[index]
        kept.append(line)
        index += 1
        for match in HEREDOC.finditer(line):
            body = []
            while index < len(lines) and lines[index].strip() != match.group(3):
                body.append(lines[index])
                index += 1
            index += 1
            if any(Path(token).name in SHELLS for token in re.split(r'[\s;&|()]+', line)):
                shell_bodies.append('\n'.join(body))
    return '\n'.join(kept), shell_bodies


def substitutions(command):
    """Return the text of every `...` and $(...) outside single quotes and escapes."""
    found, index, quote = [], 0, None
    while index < len(command):
        char = command[index]
        if char == '\\' and quote != "'":
            index += 1
        elif quote == "'":
            quote = None if char == "'" else quote
        elif char == "'" and quote is None:
            quote = "'"
        elif char == '"':
            quote = None if quote == '"' else '"'
        elif char == '`':
            end = command.find('`', index + 1)
            end = len(command) if end == -1 else end
            found.append(command[index + 1:end])
            index = end
        elif command.startswith('$(', index):
            depth, end = 0, len(command)
            for end in range(index + 1, len(command)):
                depth += {'(': 1, ')': -1}.get(command[end], 0)
                if depth == 0:
                    break
            found.append(command[index + 2:end])
            index = end
        index += 1
    return found


def shell_segments(command):
    """Split into simple commands; parenthesis tokens are kept to track subshell cwd."""
    lexer = shlex.shlex(command, posix=True, punctuation_chars=';&|()<>\n')
    lexer.whitespace = ' \t\r'
    lexer.whitespace_split = True
    lexer.commenters = '#'
    items, current = [], []
    for word in lexer:
        if word and all(c in ';&|()\n' for c in word):
            if current:
                items.append(current)
            current = []
            parens = ''.join(c for c in word if c in '()')
            if parens:
                items.append(parens)
        else:
            current.append(word)
    if current:
        items.append(current)
    return items


def strip_redirections(words):
    redirect = lambda w: bool(w) and set(w) <= set('<>&') and ('<' in w or '>' in w)
    result, skip = [], False
    for index, word in enumerate(words):
        if skip:
            skip = False
        elif redirect(word):
            skip = True
        elif not (word.isdigit() and index + 1 < len(words) and redirect(words[index + 1])):
            result.append(word)
    return result


ASSIGNMENT = re.compile(r'^([A-Za-z_][A-Za-z_0-9]*)=(.*)$', re.S)
VARIABLE = re.compile(r'\$\{([A-Za-z_][A-Za-z_0-9]*)\}|\$([A-Za-z_][A-Za-z_0-9]*)')


def expand(word, known):
    return VARIABLE.sub(lambda m: known.get(m.group(1) or m.group(2), m.group(0)), word)


def remember(assignments, known):
    for word in assignments:
        match = ASSIGNMENT.match(word)
        if match:
            value = expand(match.group(2), known)
            if '$' in value or '`' in value:
                known.pop(match.group(1), None)
            else:
                known[match.group(1)] = value


def decide(decision, reason, mode):
    if decision == 'ask' and mode in {'bypassPermissions', 'dontAsk'}:
        decision = 'deny'
        reason += ' Use an interactive permission mode to approve this single operation.'
    print(json.dumps({'hookSpecificOutput': {
        'hookEventName': 'PreToolUse', 'permissionDecision': decision,
        'permissionDecisionReason': reason,
    }}))


def git_probe(cwd, *args):
    if cwd is None:
        raise subprocess.CalledProcessError(1, 'git')
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env.update(GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=os.devnull)
    return subprocess.run(['git', '-C', str(cwd), *args], env=env,
                          capture_output=True, text=True, timeout=2, check=True).stdout.strip()


ASK = ('ask', 'Potentially destructive or checkout-changing operation. Approve this tool call only (Allow once).')
SAFE_GIT = {'status', 'diff', 'log', 'show', 'ls-files', 'ls-tree', 'rev-parse', 'check-ignore',
            'describe', 'shortlog', 'blame', 'grep', 'version', 'help', 'merge-base', 'rev-list',
            'cat-file', 'for-each-ref', 'name-rev', 'ls-remote', 'show-ref', 'show-branch',
            'whatchanged', 'range-diff', 'diff-tree', 'diff-files', 'diff-index', 'count-objects',
            'var', 'check-attr', 'check-ref-format', 'cherry', 'fsck', 'verify-commit', 'verify-tag',
            'format-patch', 'add', 'commit', 'fetch', 'mv', 'notes', 'apply', 'init', 'clone',
            'commit-tree', 'hash-object', 'mktree', 'write-tree', 'merge-tree', 'update-index'}
RUNNERS = {
    'timeout': {'-k', '-s', '--kill-after', '--signal'}, 'nice': {'-n', '--adjustment'},
    'ionice': {'-c', '-n', '-p'}, 'watch': {'-n', '--interval'}, 'nohup': set(), 'time': set(),
    'stdbuf': set(), 'setsid': set(),
    'xargs': {'-I', '-n', '-P', '-L', '-d', '-E', '-s', '-a', '--max-args', '--max-procs',
              '--delimiter', '--arg-file', '--replace'},
}


def unwrap(words):
    """Strip wrappers and runners; None means the real command cannot be identified."""
    words = list(words)
    while words:
        name = Path(words[0]).name
        if ASSIGNMENT.match(words[0]):
            if words[0].startswith('GIT_'):
                return None
            words.pop(0)
        elif name in {'command', 'rtk'} and words[1:2] and words[1].startswith('-') and words[1] != '--':
            break
        elif name in {'command', 'exec', 'env', 'rtk', 'flatpak-spawn'}:
            if name == 'env' and len(words) == 1:
                break
            words.pop(0)
            while words and (words[0] in {'--', '--host', 'proxy', '-i', '--ignore-environment'} or
                             name == 'env' and words[0].startswith(('-u', '--unset'))):
                if words.pop(0) == '-u' and words:
                    words.pop(0)
            if words and words[0].startswith('-'):
                return None
        elif name in RUNNERS:
            words.pop(0)
            while words and (words[0].startswith('-') or re.fullmatch(r'\d+(\.\d+)?[smhd]?', words[0])):
                if words.pop(0) in RUNNERS[name] and words:
                    words.pop(0)
        else:
            break
    return words


def short_flags(flags):
    return {c for f in flags if f.startswith('-') and not f.startswith('--') for c in f[1:]}


def checkout_context(cwd):
    """'main' (developer checkout), 'agent' (.claude/worktrees/*) or 'linked' (other worktree)."""
    git_dir = Path(git_probe(cwd, 'rev-parse', '--absolute-git-dir')).resolve()
    common = Path(git_probe(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir')).resolve()
    if git_dir == common:
        return 'main'
    top = Path(git_probe(cwd, 'rev-parse', '--show-toplevel')).resolve()
    return 'agent' if top.is_relative_to(common.parent / '.claude' / 'worktrees') else 'linked'


def by_context(category, cwd):
    """None: quiet. 'main': asks in the main checkout. 'user': asks outside agent worktrees."""
    if category is None:
        return None
    if category == 'always':
        return ASK
    try:
        context = checkout_context(cwd)
    except subprocess.CalledProcessError:
        return ASK
    if category == 'user':
        return None if context == 'agent' else ASK
    return ASK if context == 'main' else None


def git_category(op, flags, cwd):
    short = short_flags(flags)
    positional = [f for f in flags if not f.startswith('-')]
    sub = positional[0] if positional else ''
    if op in SAFE_GIT:
        return None
    if op == 'clean':
        return None if 'n' in short or '--dry-run' in flags else 'user'
    if op == 'stash':
        if sub in {'list', 'show', 'create'}:
            return None
        return 'user'
    if op == 'reset':
        if {'--hard', '--merge', '--keep'} & set(flags):
            return 'user'
        revisions = [f for f in (flags[:flags.index('--')] if '--' in flags else flags) if not f.startswith('-')]
        # Unstaging (`git reset [HEAD] [paths]`) keeps the working tree and branch tip.
        if not revisions or revisions[0] in {'HEAD', '@'} or (cwd is not None and (cwd / revisions[0]).exists()):
            return None
        return 'main'
    if op == 'restore':
        staged_only = ('--staged' in flags or 'S' in short) and not ('--worktree' in flags or 'W' in short)
        return None if staged_only else 'user'
    if op == 'branch':
        forced = short & set('DfMC') or any(f.startswith('--force') for f in flags)
        return 'always' if forced else None
    if op == 'worktree':
        if sub != 'remove' or not ('--force' in flags or 'f' in short):
            return None
        temp = {Path(tempfile.gettempdir()).resolve(), Path('/tmp').resolve()}
        return None if positional[1:] and all(
            any(Path(t).resolve().is_relative_to(root) for root in temp) for t in positional[1:]) else 'always'
    if op == 'config':
        reads = {'--get', '--get-all', '--get-regexp', '--get-urlmatch', '--list', '-l'}
        writes = {'--unset', '--unset-all', '--add', '--replace-all', '--rename-section',
                  '--remove-section', '--edit', '-e'}
        if reads & set(flags) or sub in {'get', 'list'}:
            return None
        return None if not writes & set(flags) and len(positional) <= 1 else 'always'
    if op == 'reflog':
        return 'always' if sub in {'expire', 'delete', 'drop'} else None
    if op == 'remote':
        return 'always' if sub in {'remove', 'rm', 'rename', 'set-url'} else None
    if op == 'tag':
        return 'always' if {'-d', '--delete', '--force'} & set(flags) or 'f' in short else None
    if op == 'rm':
        return 'user' if '--force' in flags or 'f' in short else None
    if op == 'switch':
        if any(f in {'--force', '--discard-changes', '--merge', '--orphan', '--force-create'} or
               (f.startswith('-') and not f.startswith('--') and f[1:2] in {'f', 'C', 'm'}) for f in flags):
            return 'user'
        if any(f == '--create' or (f.startswith('-c') and not f.startswith('--')) for f in flags):
            return None
        return 'main'
    if op == 'checkout':
        if any(f in {'--', '.', '--force', '--ours', '--theirs', '--patch', '--merge', '--orphan',
                     '--overlay', '--pathspec-from-file'} or
               (f.startswith('-') and not f.startswith('--') and f[1:2] in {'f', 'B', 'p', 'm'}) for f in flags):
            return 'user'
        if any(f.startswith('-b') for f in flags) or not positional:
            return None
        # checkout accepts pathspecs without `--`; only a single commit-ish argument switches.
        if len(positional) != 1:
            return 'user'
        try:
            git_probe(cwd, 'rev-parse', '--verify', '--end-of-options', positional[0] + '^{commit}')
        except subprocess.CalledProcessError:
            return 'user'
        return 'main'
    if op in {'merge', 'pull', 'rebase', 'cherry-pick', 'am', 'revert', 'bisect'}:
        return 'main'
    if op in {'filter-branch', 'filter-repo', 'replace', 'update-ref', 'symbolic-ref', 'read-tree',
              'submodule', 'gc', 'prune', 'rerere'}:
        return 'always'
    return 'alias'


def push_guard(flags, cwd):
    if any(f.startswith(('--force', '+')) or (f.startswith('-') and not f.startswith('--') and 'f' in f)
           for f in flags):
        return 'deny', 'Force push is prohibited by project policy.'
    refs = [f for f in flags if not f.startswith('-')][1:]
    targets = [r.split(':')[-1].removeprefix('refs/heads/') for r in refs]
    if not targets or 'HEAD' in targets:
        try:
            targets.append(git_probe(cwd, 'rev-parse', '--abbrev-ref', 'HEAD'))
        except subprocess.CalledProcessError:
            return ASK
    if 'develop' in targets:
        return 'ask', 'Project policy: never push develop. Approve this single push only if the user asked for it.'
    return None


def git_guard(words, cwd, depth=0):
    args = words[1:]
    while args and args[0].startswith('-'):
        flag = args.pop(0)
        if flag == '-C' and args:
            target = Path(os.path.expanduser(args.pop(0)))
            cwd = target.resolve() if target.is_absolute() else (cwd / target).resolve() if cwd else None
        elif flag == '-c' and args:
            args.pop(0)
        elif flag in {'--no-pager', '-P', '--paginate', '--no-optional-locks', '--literal-pathspecs'}:
            continue
        elif flag in {'--version', '--help'}:
            return None
        else:
            return ASK
    if not args:
        return None
    op, flags = args[0], args[1:]
    if op == 'push':
        return push_guard(flags, cwd)
    category = git_category(op, flags, cwd)
    if category != 'alias':
        return by_context(category, cwd)
    if depth >= 3:
        return ASK
    try:
        alias = git_probe(cwd, 'config', '--get', 'alias.' + op)
    except subprocess.CalledProcessError:
        return ASK
    if alias.startswith('!'):
        return ASK
    return git_guard(['git', *shlex.split(alias), *flags], cwd, depth + 1)


def rm_roots():
    roots = {Path(tempfile.gettempdir()).resolve(), Path('/tmp').resolve()}
    if os.environ.get('CLAUDE_PROJECT_DIR'):
        roots.add(Path(os.environ['CLAUDE_PROJECT_DIR']).resolve())
    return roots


def rm_guard(words, cwd):
    """Quiet inside the project or temp dirs; asks for roots, repositories and unknown targets."""
    targets, options, flags = [], True, []
    for word in words[1:]:
        if options and word == '--':
            options = False
        elif options and word.startswith('-'):
            flags.append(word)
        else:
            targets.append(word)
    if not targets:
        recursive = 'r' in short_flags(flags) or 'R' in short_flags(flags) or '--recursive' in flags
        return ASK if recursive else None
    roots = rm_roots()
    for target in targets:
        if '$' in target or '`' in target:
            return ASK
        base = re.split(r'[*?\[]', target, maxsplit=1)[0]
        path = Path(os.path.expanduser(base or '.'))
        if not path.is_absolute():
            if cwd is None:
                return ASK
            path = cwd / path
        if base != target and (base in {'', '.'} or base.endswith('/')):
            path = Path(os.path.realpath(path))
        elif base != target:
            # A named prefix (`/tmp/jest-cache-*`) never matches the directory itself.
            path = Path(os.path.realpath(path.parent)) / (path.name + '*')
        elif path.name in {'', '.', '..'}:
            path = Path(os.path.realpath(path))
        else:
            path = Path(os.path.realpath(path.parent)) / path.name
        if path in roots or '.git' in path.parts or (path / '.git').exists():
            return ASK
        if not any(path.is_relative_to(root) for root in roots):
            return ASK
    return None


def guard(command, cwd, depth=0):
    if depth > 4:
        return ASK
    command, shell_bodies = split_heredocs(command.replace('\\\n', ' '))
    pending = None
    for nested in shell_bodies + substitutions(command):
        try:
            verdict = guard(nested, cwd, depth + 1)
        except ValueError:
            verdict = ASK
        if verdict and verdict[0] == 'deny':
            return verdict
        pending = verdict or pending
    known = {'HOME': str(Path.home())}
    uncertain, stack = False, []
    for item in shell_segments(command):
        if isinstance(item, str):
            for paren in item:
                if paren == '(':
                    stack.append((cwd, uncertain))
                elif stack:
                    cwd, uncertain = stack.pop()
            continue
        words = [expand(word, known) for word in item]
        if all(ASSIGNMENT.match(word) for word in words):
            remember(words, known)
            continue
        words = unwrap(words)
        if words is None:
            pending = ASK
            continue
        if not words:
            continue
        executable = Path(words[0]).name
        if executable in {'env', 'printenv'} or (executable == 'gh' and words[1:3] == ['auth', 'token']):
            return 'deny', 'Reading credentials or dumping the environment is prohibited.'
        paths = words[1:]
        if executable in {'echo', 'printf'}:
            paths = [words[i + 1] for i, w in enumerate(words[:-1]) if '<' in w or '>' in w]
        if any(protected(w.split('=', 1)[-1], cwd) for w in paths if w not in {'<', '>', '>>'}):
            return 'deny', 'Access to a protected credentials path is prohibited.'
        words = strip_redirections(words)
        known_cwd = None if uncertain else cwd
        verdict = None
        if executable == 'export':
            remember(words[1:], known)
        elif executable == 'cd':
            target = words[1] if len(words) == 2 else None
            if target is None or any(c in target for c in '$`') or target == '-':
                uncertain = True
            else:
                cwd = (cwd / os.path.expanduser(target)).resolve()
                uncertain = uncertain or '||' in command
        elif executable == 'git':
            try:
                verdict = git_guard(words, known_cwd)
            except subprocess.CalledProcessError:
                verdict = ASK
        elif executable == 'rm':
            verdict = rm_guard(words, known_cwd)
        elif executable in SHELLS:
            verdict = shell_guard(words, cwd, depth)
        elif executable == 'eval':
            body = ' '.join(words[1:])
            verdict = ASK if '$' in body or '`' in body else guard(body, cwd, depth + 1)
        elif executable in {'sudo', 'su', 'doas', 'pkexec'}:
            verdict = ASK
        if verdict and verdict[0] == 'deny':
            return verdict
        pending = verdict or pending
    if command.strip() == 'env':
        return 'deny', 'Dumping the environment is prohibited.'
    return pending


def shell_guard(words, cwd, depth):
    """Inspect `sh -c SCRIPT`; running a script file is like any other program."""
    args = words[1:]
    while args:
        arg = args.pop(0)
        if arg in {'-o', '+o', '-O', '+O'}:
            args = args[1:]
        elif arg.startswith('-') and not arg.startswith('--') and 'c' in arg[1:]:
            return guard(args[0], cwd, depth + 1) if args else None
        elif not arg.startswith(('-', '+')):
            return None
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
