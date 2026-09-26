#!/usr/bin/env python3
"""Serialize participating checks across Git worktrees, then measure resources."""
import argparse
import fcntl
import os
from pathlib import Path
import signal
import subprocess
import sys
import time


class Cancelled(Exception):
    pass


def stop(child):
    try:
        os.killpg(child.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        child.wait(timeout=3)
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(child.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    child.wait()


def run(args):
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    common = subprocess.check_output(
        ['git', 'rev-parse', '--path-format=absolute', '--git-common-dir'],
        env=env, text=True, stderr=subprocess.DEVNULL, timeout=2).strip()
    with open(Path(common) / 'bitrate-heavy.lock', 'a') as lock:
        deadline = time.monotonic() + args.wait
        while True:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    print('Heavy check deferred: another participating command owns the lock.', file=sys.stderr)
                    return 75
                time.sleep(min(.1, max(0, deadline - time.monotonic())))
        probe = subprocess.run([sys.executable, '-B', str(Path(__file__).with_name('check-resources.py')),
                                '--proc-root', str(args.proc_root), '--interval', str(args.interval)])
        if probe.returncode:
            return 78
        child = subprocess.Popen(args.command, start_new_session=True, pass_fds=(lock.fileno(),))
        # The child inherits the descriptor: killing this launcher cannot unlock a live child.
        # Do not LOCK_UN explicitly; closing descriptors releases the lock after the last owner.
        try:
            code = child.wait(timeout=args.timeout)
            return code if code >= 0 else 128 - code
        except subprocess.TimeoutExpired:
            stop(child)
            print('Heavy check timed out; only its process group was stopped.', file=sys.stderr)
            return 124
        except (KeyboardInterrupt, Cancelled) as exc:
            stop(child)
            return 130 if isinstance(exc, KeyboardInterrupt) else 143


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--wait', type=float, default=0, help='Bounded lock wait in seconds; default: do not wait')
    parser.add_argument('--timeout', type=float, default=300, help='Check timeout in seconds')
    parser.add_argument('--proc-root', type=Path, default=Path('/proc'), help='Procfs root (fixtures only when overridden)')
    parser.add_argument('--interval', type=float, default=1, help='Resource sample interval')
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.command[:1] == ['--']:
        args.command = args.command[1:]
    if not args.command or args.wait < 0 or args.wait > 60 or args.timeout <= 0 or not 0 <= args.interval <= 5:
        parser.error('command required; wait 0–60, timeout > 0, interval 0–5')
    return run(args)


if __name__ == '__main__':
    def cancelled(_signum, _frame):
        raise Cancelled()

    signal.signal(signal.SIGTERM, cancelled)
    try:
        sys.exit(main())
    except (OSError, subprocess.SubprocessError):
        print('Heavy check not started: Git context, launcher or command unavailable.', file=sys.stderr)
        sys.exit(78)
    except (KeyboardInterrupt, Cancelled) as exc:
        sys.exit(130 if isinstance(exc, KeyboardInterrupt) else 143)
