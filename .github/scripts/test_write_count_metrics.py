import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("count_metrics", ROOT / ".github/scripts/write-count-metrics.py")
count_metrics = importlib.util.module_from_spec(spec)
spec.loader.exec_module(count_metrics)

SCC = [{"Name": "TypeScript", "Code": 1200}, {"Name": "JSON", "Code": 34}]
OUTPUT = """ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
"""


class WriteCountMetricsTest(unittest.TestCase):
    def test_writes_lines_of_code_and_test_counts_as_badge_metrics(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "scc.json").write_text(json.dumps(SCC), encoding="utf-8")
            (root / "output.txt").write_text(OUTPUT, encoding="utf-8")
            count_metrics.write_metrics(root / "scc.json", root / "output.txt", root / "out")
            loc = json.loads((root / "out" / "loc.json").read_text())
            tests = json.loads((root / "out" / "tests.json").read_text())
        self.assertEqual(loc, {"id": "loc", "label": "LOC", "value": 1234, "kind": "loc", "badge": True})
        self.assertEqual(tests, {"id": "tests", "label": "tests", "value": 12, "kind": "tests", "badge": True})

    def test_rejects_output_without_test_results(self):
        with self.assertRaises(ValueError):
            count_metrics.test_count("running\n")

    def test_rejects_failed_tests(self):
        with self.assertRaises(ValueError):
            count_metrics.test_count("ℹ tests 4\nℹ pass 3\nℹ fail 1\n")


if __name__ == "__main__":
    unittest.main()
