"""Public CLI checks in temporary repositories; no application state or commits."""
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest

SCRIPTS = Path(__file__).resolve().parents[2] / 'scripts'


class ExecutionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name) / 'repo'
        self.repo.mkdir()
        subprocess.run(['git', 'init', '-q', str(self.repo)], check=True)
        self.proc = Path(self.temp.name) / 'proc'
        self.proc.mkdir()
        (self.proc / 'meminfo').write_text('MemTotal: 1000000 kB\nMemAvailable: 800000 kB\n')
        (self.proc / 'vmstat').write_text('pswpin 0\npswpout 0\n')

    def heavy(self, code, cwd=None, timeout='5'):
        return subprocess.run(self.heavy_args(code, timeout), cwd=cwd or self.repo,
                              text=True, capture_output=True)

    def heavy_args(self, code, timeout='5'):
        return [sys.executable, str(SCRIPTS / 'run-heavy.py'), '--proc-root', str(self.proc),
                '--interval', '0', '--timeout', timeout, '--', sys.executable, '-c', code]

    def test_heavy_preserves_exit_status_and_checks_resources_before_execution(self):
        self.assertEqual(self.heavy('raise SystemExit(7)').returncode, 7)
        (self.proc / 'meminfo').write_text('MemTotal: 1000000 kB\nMemAvailable: 10000 kB\n')
        self.assertEqual(self.heavy('from pathlib import Path;Path("ran").touch()').returncode, 78)
        self.assertFalse((self.repo / 'ran').exists())

    def test_heavy_serializes_worktrees_and_releases_after_timeout(self):
        linked = self.repo.parent / 'linked'
        subprocess.run(['git', '-C', str(self.repo), 'worktree', 'add', '--orphan',
                        '-b', 'worker', str(linked)], check=True, capture_output=True)
        proc = subprocess.Popen(self.heavy_args('from pathlib import Path;import time;'
                                               'Path("started").touch();time.sleep(30)', '1'),
                                cwd=self.repo, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.addCleanup(lambda: proc.poll() is None and proc.kill())
        deadline = time.monotonic() + 5
        while not (self.repo / 'started').exists() and time.monotonic() < deadline:
            time.sleep(.01)
        self.assertTrue((self.repo / 'started').exists())
        self.assertEqual(self.heavy('pass', cwd=linked).returncode, 75)
        self.assertEqual(proc.wait(timeout=5), 124)
        self.assertEqual(self.heavy('pass', cwd=linked).returncode, 0)

    def test_killed_launcher_does_not_release_running_child_lock(self):
        child = 'from pathlib import Path;import os,time;Path("pid").write_text(str(os.getpid()));time.sleep(30)'
        proc = subprocess.Popen(self.heavy_args(child), cwd=self.repo,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        deadline = time.monotonic() + 5
        while not (self.repo / 'pid').exists() and time.monotonic() < deadline:
            time.sleep(.01)
        self.assertTrue((self.repo / 'pid').exists())
        pid = int((self.repo / 'pid').read_text())
        try:
            proc.kill()
            proc.wait(timeout=5)
            self.assertEqual(self.heavy('pass').returncode, 75)
        finally:
            os.killpg(pid, signal.SIGKILL)

    def test_evidence_invalidates_dirty_files_new_files_and_command_changes(self):
        source = self.repo / 'src'
        source.mkdir()
        (source / 'a.ts').write_text('original')
        args = [sys.executable, str(SCRIPTS / 'verification-evidence.py')]
        options = ['--name', 'unit', '--variant', 'local', '--tool-version', 'runner-1',
                   '--input', 'src']
        record = subprocess.run([*args, 'record', *options, '--exit-code', '0', '--', 'runner', 'test'],
                                cwd=self.repo, text=True, capture_output=True)
        self.assertEqual(record.returncode, 0, record.stderr)
        def check(*command):
            return subprocess.run([*args, 'check', *options, '--', *command],
                                  cwd=self.repo, text=True, capture_output=True).returncode
        self.assertEqual(check('runner', 'test'), 0)
        self.assertEqual(check('runner', 'build'), 1)
        (source / 'a.ts').write_text('dirty')
        self.assertEqual(check('runner', 'test'), 1)
        (source / 'a.ts').write_text('original')
        (source / 'b.ts').write_text('untracked')
        self.assertEqual(check('runner', 'test'), 1)

    def test_cancellation_stops_owned_child_and_releases_lock(self):
        proc = subprocess.Popen(self.heavy_args('from pathlib import Path;import time;'
                                               'Path("started").touch();time.sleep(30)'),
                                cwd=self.repo, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.addCleanup(lambda: proc.poll() is None and proc.kill())
        deadline = time.monotonic() + 5
        while not (self.repo / 'started').exists() and time.monotonic() < deadline:
            time.sleep(.01)
        self.assertTrue((self.repo / 'started').exists())
        proc.terminate()
        self.assertEqual(proc.wait(timeout=5), 143)
        self.assertEqual(self.heavy('pass').returncode, 0)


if __name__ == '__main__':
    unittest.main()
