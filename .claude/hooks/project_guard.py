"""Claude tool-call guard. Never executes the submitted shell command.

Denies secret access, environment dumps, force pushes and pushes to develop. Asks for
one-call approval only when an operation can lose data outside an agent worktree or
changes the developer's main checkout; ordinary shell syntax stays quiet.
"""
import glob
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


def candidates(word, cwd):
    """The word plus its brace expansions and glob matches, as the shell would pass them."""
    pending, found = [word], []
    while pending and len(found) < 64:
        current = pending.pop()
        match = re.search(r'\{([^{}]*,[^{}]*)\}', current)
        if match:
            pending.extend(current[:match.start()] + part + current[match.end():]
                           for part in match.group(1).split(','))
            continue
        found.append(current)
        if cwd is not None and any(c in current for c in '*?['):
            path = Path(os.path.expanduser(current))
            found.extend(glob.glob(str(path if path.is_absolute() else cwd / path))[:64])
    return found


HEREDOC = re.compile(r'<<(-?)[ \t]*(\'[^\'\n]*\'|"[^"\n]*"|[^\s;&|<>()]+)')
SHELLS = {'sh', 'bash', 'zsh', 'dash', 'ksh'}
INTERPRETER = re.compile(r'python[0-9.]*|node|perl|ruby|php|bun|deno')
RUNS_SCRIPT = re.compile(r'(?:^|[\s;&|(])(?:sh|bash|zsh|dash|ksh|source|\.)[ \t]+(?!-)\S')


def closing(command, start):
    """Index of the parenthesis that closes the one at `start`, honouring quotes and escapes."""
    depth, quote, index = 0, None, start
    while index < len(command):
        char = command[index]
        if char == '\\' and quote != "'":
            index += 1
        elif quote:
            quote = None if char == quote else quote
        elif char in '\'"':
            quote = char
        elif char in '()':
            depth += 1 if char == '(' else -1
            if depth == 0:
                return index
        index += 1
    return len(command)


def scan(command):
    """Strip comments and heredoc bodies outside quotes, as the shell does.

    Returns the remaining command, the bodies of `...`, $(...), <(...) and >(...), and
    (line, body) pairs for heredocs so callers can inspect bodies that a shell executes.
    """
    out, subs, docs, waiting, index, quote = [], [], [], [], 0, None
    while index < len(command):
        char = command[index]
        if quote == "'":
            quote = None if char == "'" else quote
        elif char == '\\':
            out.append(command[index:index + 2])
            index += 2
            continue
        elif char == '`' or command.startswith('$(', index) or (
                quote is None and command.startswith(('<(', '>('), index)):
            if char == '`':
                end = command.find('`', index + 1)
                end, body = (len(command), command[index + 1:]) if end == -1 else (end, command[index + 1:end])
            else:
                end = closing(command, index + 1)
                body = command[index + 2:end]
            subs.append(body)
            out.append(command[index:end + 1])
            index = end + 1
            continue
        elif char == '"':
            quote = None if quote == '"' else '"'
        elif quote is None and char == "'":
            quote = "'"
        elif quote is None and char == '#' and (not out or out[-1][-1] in ' \t\n;&|()'):
            end = command.find('\n', index)
            index = len(command) if end == -1 else end
            continue
        elif quote is None and command.startswith('<<', index) and not command.startswith('<<<', index):
            match = HEREDOC.match(command, index)
            if match:
                waiting.append(re.sub(r'[\'"\\]', '', match.group(2)))
                out.append(match.group(0))
                index = match.end()
                continue
        elif quote is None and char == '\n' and waiting:
            line = ''.join(out).rsplit('\n', 1)[-1]
            lines, consumed = command[index + 1:].split('\n'), 0
            for delimiter in waiting:
                body = []
                while consumed < len(lines) and lines[consumed].strip() != delimiter:
                    body.append(lines[consumed])
                    consumed += 1
                consumed += 1
                docs.append((line, '\n'.join(body)))
            waiting = []
            out.append('\n')
            index += 1 + sum(len(text) + 1 for text in lines[:consumed])
            continue
        out.append(char)
        index += 1
    return ''.join(out), subs, docs


def shell_segments(command):
    """Split into simple commands; parenthesis tokens are kept to track subshell cwd."""
    lexer = shlex.shlex(command, posix=True, punctuation_chars=';&|()<>\n')
    lexer.whitespace = ' \t\r'
    lexer.whitespace_split = True
    lexer.commenters = ''
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
    """Track literal assignments; True when one redirects Git (GIT_DIR, GIT_WORK_TREE, ...)."""
    redirects_git = False
    for word in assignments:
        match = ASSIGNMENT.match(word)
        if match:
            redirects_git = redirects_git or match.group(1).startswith('GIT_')
            value = expand(match.group(2), known)
            if '$' in value or '`' in value:
                known.pop(match.group(1), None)
            else:
                known[match.group(1)] = value
    return redirects_git


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
SECRET = ('deny', 'Access to a protected credentials path is prohibited.')
DUMP = ('deny', 'Reading credentials or dumping the environment is prohibited.')
# `git -c` can run arbitrary programs (core.pager, core.fsmonitor, alias.*); only display keys are quiet.
SAFE_CONFIG = re.compile(r'(color|advice|column|i18n)\.[\w.-]+|core\.(quotepath|abbrev)|'
                         r'diff\.(noprefix|mnemonicprefix|renames|algorithm|colormoved|context|relative)|'
                         r'log\.(date|decorate|abbrevcommit|showroot)|user\.(name|email)|commit\.gpgsign|'
                         r'init\.defaultbranch|merge\.conflictstyle|gc\.auto', re.I)
SAFE_PAGERS = {'', 'cat', 'less', 'less -R', 'more'}
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


KEYWORDS = {'if', 'then', 'else', 'elif', 'while', 'until', 'do', '!', '{', '}'}


def unwrap(words):
    """Strip keywords, wrappers and runners.

    Returns (words, appended): words is None when the real command cannot be identified;
    appended means xargs adds arguments the guard cannot see.
    """
    words, appended = list(words), False
    while words:
        name = Path(words[0]).name
        if words[0] in KEYWORDS:
            words.pop(0)
        elif ASSIGNMENT.match(words[0]):
            if words[0].startswith('GIT_'):
                return None, appended
            words.pop(0)
        elif name == 'command' and words[1:2] and words[1] in {'-v', '-V'}:
            break
        elif name in {'command', 'exec', 'env', 'rtk', 'flatpak-spawn', 'busybox'}:
            if name == 'env' and len(words) == 1:
                break
            words.pop(0)
            while words and (words[0] in {'--', '--host', 'proxy', '-i', '--ignore-environment'} or
                             name == 'command' and words[0] == '-p' or
                             name == 'rtk' and words[0].startswith('-') or
                             name == 'env' and words[0].startswith(('-u', '--unset'))):
                if words.pop(0) == '-u' and words:
                    words.pop(0)
            if words and words[0].startswith('-'):
                return None, appended
        elif name in RUNNERS:
            words.pop(0)
            appended = appended or name == 'xargs'
            while words and (words[0].startswith('-') or re.fullmatch(r'\d+(\.\d+)?[smhd]?', words[0])):
                if words.pop(0) in RUNNERS[name] and words:
                    words.pop(0)
            if name == 'watch' and words:
                # watch joins its arguments and runs them through `sh -c`.
                return ['sh', '-c', ' '.join(words)], appended
        else:
            break
    return words, appended


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
    # These options run a program or overwrite an arbitrary file even under read-only commands.
    if any(f == '--output' or f.startswith(('--output=', '--open-files-in-pager')) or
           (op == 'grep' and f.startswith('-O')) for f in flags):
        return 'always'
    if op in SAFE_GIT:
        return None
    if op == 'clean':
        return None if 'n' in short or '--dry-run' in flags else 'user'
    if op == 'stash':
        if sub in {'list', 'show', 'create'}:
            return None
        # The stash stack is shared by every worktree, including the developer's checkout.
        return 'always' if sub in {'drop', 'clear', 'pop', 'branch'} else 'user'
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
    if '--mirror' in flags or any(f.startswith(('--force', '+')) or
                                  (f.startswith('-') and not f.startswith('--') and 'f' in f) for f in flags):
        return 'deny', 'Force and mirror pushes are prohibited by project policy.'
    positional = [f for f in flags if not f.startswith('-')]
    # Every positional is checked: `--repo=origin develop` has no remote positional.
    targets = [r.split(':')[-1].removeprefix('refs/heads/') for r in positional]
    if {'--all', '--branches', '--prune'} & set(flags) or any('*' in t for t in targets):
        return 'ask', 'This push can update develop or delete remote branches. Approve this single push only.'
    if len(positional) <= 1 or 'HEAD' in targets:
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
            key, _, value = args.pop(0).partition('=')
            if not (SAFE_CONFIG.fullmatch(key) or key.lower() == 'core.pager' and value in SAFE_PAGERS):
                return ASK
        elif flag in {'--no-pager', '-P', '--paginate', '--no-optional-locks', '--literal-pathspecs'}:
            continue
        elif flag in {'--version', '--help'}:
            return None
        else:
            return ASK
    if not args:
        return None
    op, flags = args[0], args[1:]
    if op.startswith('credential'):
        return DUMP
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


def holds_uncommitted_work(path):
    """True when deleting `path` outside an agent worktree loses modified or untracked files."""
    anchor = path if path.is_dir() and not path.is_symlink() else path.parent
    if not anchor.is_dir():
        return False
    try:
        if checkout_context(anchor) == 'agent':
            return False
    except subprocess.CalledProcessError:
        return False
    return bool(git_probe(anchor, 'status', '--porcelain', '--untracked-files=all', '--', str(path)))


def rm_guard(words, cwd):
    """Quiet for temp dirs, agent worktrees, ignored and committed files; asks for roots,
    repositories, unknown targets and paths holding uncommitted work."""
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
    roots, paths = rm_roots(), []
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
        elif path.name in {'', '.', '..'} or target.endswith('/'):
            # A trailing slash makes rm follow a symlink to the directory it points at.
            path = Path(os.path.realpath(path))
        else:
            path = Path(os.path.realpath(path.parent)) / path.name
        if path in roots or '.git' in path.parts or (path / '.git').exists():
            return ASK
        if not any(path.is_relative_to(root) for root in roots):
            return ASK
        paths.append(path)
    try:
        return ASK if any(holds_uncommitted_work(path) for path in paths) else None
    except subprocess.SubprocessError:
        return ASK


def find_guard(words, cwd, depth):
    """Inspect -exec commands (their {} arguments are unknown) and -delete start points."""
    verdict, index = None, 1
    starts = []
    for word in words[1:]:
        if word.startswith(('-', '(', '!')):
            break
        starts.append(word)
    while index < len(words):
        word = words[index]
        if word in {'-exec', '-execdir', '-ok', '-okdir'}:
            end = index + 1
            while end < len(words) and words[end] not in {';', '+'}:
                end += 1
            inner = [w for w in words[index + 1:end] if w != '{}']
            nested = guard('xargs ' + shlex.join(inner), cwd, depth + 1) if inner else None
            if nested and nested[0] == 'deny':
                return nested
            verdict, index = nested or verdict, end
        elif word == '-delete':
            nested = rm_guard(['rm', '-r', *(f'{s.rstrip("/")}/*' for s in starts or ['.'])], cwd)
            verdict = nested or verdict
        index += 1
    return verdict


LITERAL = re.compile(r'"((?:[^"\\\n]|\\.)*)"|\'((?:[^\'\\\n]|\\.)*)\'|`([^`]*)`')


def code_guard(code, cwd, depth):
    """Interpreter code: deny secret path literals, ask when a literal is a risky shell command."""
    verdict = None
    for match in LITERAL.finditer(code):
        literal = next(group for group in match.groups() if group is not None)
        if '\0' not in literal and any(protected(c, cwd) for c in candidates(literal, cwd)):
            return SECRET
        if not re.search(r'\S\s+\S', literal):
            continue  # a risky command has arguments; single words are identifiers or values
        try:
            if guard(literal, cwd, depth + 1):
                verdict = ASK
        except ValueError:
            continue
    return verdict


def guard(command, cwd, depth=0):
    if depth > 4:
        return ASK
    command, subs, docs = scan(command.replace('\\\n', ' '))
    nested_scripts, pending = list(subs), None
    runs_script = bool(RUNS_SCRIPT.search(command))
    for line, body in docs:
        tokens = {Path(token).name for token in re.split(r'[\s;&|()]+', line)}
        if runs_script or tokens & SHELLS:
            # A heredoc fed to a shell, or written and run as a script, is code, not data.
            nested_scripts.append(body)
        elif any(INTERPRETER.fullmatch(token) for token in tokens):
            verdict = code_guard(body, cwd, depth)
            if verdict and verdict[0] == 'deny':
                return verdict
            pending = verdict or pending
    for nested in nested_scripts:
        try:
            verdict = guard(nested, cwd, depth + 1)
        except ValueError:
            verdict = ASK
        if verdict and verdict[0] == 'deny':
            return verdict
        pending = verdict or pending
    known = {'HOME': str(Path.home())}
    uncertain, redirects_git, stack = False, False, []
    for item in shell_segments(command):
        if isinstance(item, str):
            for paren in item:
                if paren == '(':
                    stack.append((cwd, uncertain))
                elif stack:
                    cwd, uncertain = stack.pop()
            continue
        stdin_redirect = any(word in {'<', '<<'} for word in item)
        words = []
        for word in item:
            value = expand(word, known)
            # An expanded variable is split into words, like an unquoted shell expansion.
            words.extend(value.split() if value != word and not ASSIGNMENT.match(word) else [value])
        if all(ASSIGNMENT.match(word) for word in words):
            redirects_git = remember(words, known) or redirects_git
            continue
        words, appended = unwrap(words)
        if words is None:
            pending = ASK
            continue
        if not words:
            continue
        if '$' in words[0] or '`' in words[0]:
            pending = ASK
            continue
        executable = Path(words[0]).name
        if executable in {'env', 'printenv'} or (executable == 'gh' and words[1:3] == ['auth', 'token']):
            return DUMP
        if executable == 'gh' and words[1:3] == ['auth', 'status'] and {'-t', '--show-token'} & set(words):
            return DUMP
        if (executable in {'export', 'declare', 'typeset'} and all(w.startswith(('-', '+')) for w in words[1:])
                or executable == 'set' and len(words) == 1):
            return DUMP
        paths = words[1:]
        if executable in {'echo', 'printf'}:
            paths = [words[i + 1] for i, w in enumerate(words[:-1]) if '<' in w or '>' in w]
        if any(protected(c, cwd) for w in paths if w not in {'<', '>', '>>'}
               for c in candidates(w.split('=', 1)[-1], cwd)):
            return SECRET
        words = strip_redirections(words)
        known_cwd = None if uncertain else cwd
        verdict = None
        if executable in {'export', 'declare', 'typeset'}:
            redirects_git = remember(words[1:], known) or redirects_git
        elif executable == 'cd':
            target = words[1] if len(words) == 2 else None
            if target is None or any(c in target for c in '$`') or target == '-':
                uncertain = True
            else:
                cwd = (cwd / os.path.expanduser(target)).resolve()
                uncertain = uncertain or '||' in command
        elif executable in {'pushd', 'popd'}:
            uncertain = True
        elif executable == 'git':
            if redirects_git or appended and not (words[1:2] and words[1] in SAFE_GIT):
                verdict = ASK
            else:
                try:
                    verdict = git_guard(words, known_cwd)
                except subprocess.CalledProcessError:
                    verdict = ASK
        elif executable in {'rm', 'unlink', 'shred'}:
            verdict = rm_guard(words, known_cwd)
        elif executable == 'find':
            verdict = find_guard(words, known_cwd, depth)
        elif executable in SHELLS:
            verdict = shell_guard(words, cwd, depth, stdin_redirect)
        elif INTERPRETER.fullmatch(executable):
            flag = next((i for i, w in enumerate(words) if w in {'-c', '-e', '-p', '-r', '--eval'}), None)
            if flag is not None and flag + 1 < len(words):
                verdict = code_guard(words[flag + 1], cwd, depth)
        elif executable == 'eval':
            body = ' '.join(words[1:])
            verdict = ASK if '$' in body or '`' in body else guard(body, cwd, depth + 1)
        elif executable in {'sudo', 'su', 'doas', 'pkexec'}:
            verdict = ASK
        if verdict and verdict[0] == 'deny':
            return verdict
        pending = verdict or pending
    if command.strip() == 'env':
        return DUMP
    return pending


def shell_guard(words, cwd, depth, stdin_redirect):
    """Inspect `sh -c SCRIPT`; a script file is like any other program; piped stdin is unknown code."""
    args, reads_stdin = words[1:], False
    while args:
        arg = args.pop(0)
        if arg in {'-o', '+o', '-O', '+O'}:
            args = args[1:]
        elif arg.startswith('-') and not arg.startswith('--') and 'c' in arg[1:]:
            return guard(args[0], cwd, depth + 1) if args else None
        elif arg.startswith('-') and not arg.startswith('--') and 's' in arg[1:]:
            reads_stdin = True
        elif not arg.startswith(('-', '+')):
            break
    else:
        reads_stdin = True
    return ASK if reads_stdin and not stdin_redirect else None


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
        if tool == 'Grep' and data.get('glob'):
            paths.extend(candidates(str(Path(data.get('path') or str(cwd)) / data['glob']), cwd))
        verdict = SECRET if any(protected(path, cwd) for path in paths) else None
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
