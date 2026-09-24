#!/usr/bin/env python3
"""Read-only Linux preflight for heavy verification. Exit 1 means wait/narrow scope."""
import argparse
import json
from pathlib import Path
import sys
import time


def counters(path):
    return {parts[0].rstrip(':'): int(parts[1])
            for line in path.read_text().splitlines() if len(parts := line.split()) >= 2}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--proc-root', type=Path, default=Path('/proc'), help='Procfs root; override for fixtures')
    parser.add_argument('--interval', type=float, default=1, help='Seconds between three swap samples (0–5)')
    args = parser.parse_args()
    if not 0 <= args.interval <= 5:
        parser.error('interval must be between 0 and 5')
    swap = []
    for index in range(4):
        if index:
            time.sleep(args.interval)
        sample = counters(args.proc_root / 'vmstat')
        swap.append(sample['pswpin'] + sample['pswpout'])
    active_samples = sum(b > a for a, b in zip(swap, swap[1:]))
    memory = counters(args.proc_root / 'meminfo')
    percent = memory['MemAvailable'] / memory['MemTotal'] * 100
    heavy, unreadable = 0, 0
    names = {'tsc', 'tsc.js', 'jest', 'jest.js', 'vitest', 'vitest.mjs', 'biome', 'knip', 'knip.js'}
    for directory in args.proc_root.iterdir():
        if not directory.name.isdigit():
            continue
        try:
            words = (directory / 'cmdline').read_bytes().decode(errors='replace').split('\0')
        except FileNotFoundError:
            continue  # Process exited during sampling.
        except PermissionError:
            unreadable += 1
            continue
        # Never print process arguments, which may contain private values.
        binaries = {Path(word).name for word in words[:3]}
        if binaries & names or (binaries & {'ng', 'next', 'vite', 'turbo', 'prisma'} and
                                set(words) & {'build', 'test', 'check-types', 'generate'}):
            heavy += 1
    reasons = []
    if percent < 25:
        reasons.append('available memory below 25%')
    if active_samples >= 2:
        reasons.append('swapping in most samples')
    if heavy:
        reasons.append('another heavy command is active')
    if unreadable:
        reasons.append('process census incomplete')
    print(json.dumps({'ok': not reasons, 'available_percent': round(percent, 1),
                      'active_swap_samples': active_samples, 'heavy_processes': heavy,
                      'reasons': reasons}))
    return int(bool(reasons))


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError, ZeroDivisionError):
        print(json.dumps({'ok': False, 'reasons': ['resource measurement unavailable']}))
        sys.exit(1)
