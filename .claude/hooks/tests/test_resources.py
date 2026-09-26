import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[2] / 'scripts/check-resources.py'


class ResourceTests(unittest.TestCase):
    def run_probe(self, available, process=None):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'meminfo').write_text(f'MemTotal: 1000000 kB\nMemAvailable: {available} kB\n')
            (root / 'vmstat').write_text('pswpin 0\npswpout 0\n')
            if process:
                (root / '123').mkdir()
                (root / '123/cmdline').write_bytes(process)
            result = subprocess.run(['python3', str(SCRIPT), '--proc-root', directory,
                                     '--interval', '0'], capture_output=True, text=True)
            return result.returncode, json.loads(result.stdout)

    def test_threshold_and_active_heavy_command(self):
        for available, process, expected in [
            (250000, None, 0), (249999, None, 1),
            (700000, b'node\0/project/node_modules/.bin/tsc\0--noEmit\0', 1),
            (700000, b'node\0/project/node_modules/.bin/vite\0dev\0', 0),
        ]:
            with self.subTest(available=available, process=process):
                code, report = self.run_probe(available, process)
                self.assertEqual(code, expected)
                self.assertEqual(report['ok'], expected == 0)


if __name__ == '__main__':
    unittest.main()
