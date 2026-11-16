"""Write Node line and branch coverage from an LCOV report as metrics for the Statistics workflow."""

import json
from pathlib import Path
import sys

METRICS = (
    ("LH", "LF", "line-coverage", "line coverage"),
    ("BRH", "BRF", "branch-coverage", "branch coverage"),
)


def totals(lcov):
    sums = {}
    for line in lcov.splitlines():
        key, _, value = line.partition(":")
        if key in ("LH", "LF", "BRH", "BRF"):
            sums[key] = sums.get(key, 0) + int(value)
    return sums


def percentage(sums, hit, found):
    return round(sums[hit] * 100 / sums[found], 2) if sums.get(found) else None


def write_metrics(lcov_path, output_dir):
    sums = totals(lcov_path.read_text(encoding="utf-8"))
    output_dir.mkdir(parents=True, exist_ok=True)
    for hit, found, metric_id, label in METRICS:
        metric = {"id": metric_id, "label": label, "value": percentage(sums, hit, found), "kind": "percent", "badge": True}
        (output_dir / f"{metric_id}.json").write_text(json.dumps(metric, indent=2) + "\n", encoding="utf-8")


def main(argv):
    if len(argv) != 3:
        print("Usage: write-coverage-metrics.py <lcov.info> <output-dir>", file=sys.stderr)
        return 2
    write_metrics(Path(argv[1]), Path(argv[2]))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv))
    except Exception as error:  # A crash is a technical failure, never a FAIL verdict.
        print(f"ERROR: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(2)
