import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("metrics", ROOT / ".github/scripts/write-coverage-metrics.py")
metrics = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metrics)

LCOV = """SF:dist/a.js
BRF:10
BRH:5
LH:30
LF:40
end_of_record
SF:dist/b.js
BRF:2
BRH:2
LH:10
LF:10
end_of_record
"""


class WriteCoverageMetricsTest(unittest.TestCase):
    def run_with(self, report):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "lcov.info").write_text(report, encoding="utf-8")
            metrics.write_metrics(root / "lcov.info", root / "out")
            return {path.stem: json.loads(path.read_text()) for path in (root / "out").glob("*.json")}

    def test_writes_report_totals_as_badge_metrics(self):
        result = self.run_with(LCOV)
        self.assertEqual(
            result["line-coverage"],
            {"id": "line-coverage", "label": "line coverage", "value": 80.0, "kind": "percent", "badge": True},
        )
        self.assertEqual(result["branch-coverage"]["value"], 58.33)
        self.assertEqual(result["branch-coverage"]["label"], "branch coverage")

    def test_reports_null_without_branches(self):
        result = self.run_with("SF:a.js\nLH:1\nLF:2\nend_of_record\n")
        self.assertIsNone(result["branch-coverage"]["value"])
        self.assertEqual(result["line-coverage"]["value"], 50.0)

    def test_reports_null_for_an_empty_report(self):
        self.assertIsNone(self.run_with("")["line-coverage"]["value"])


if __name__ == "__main__":
    unittest.main()
