import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("candidate", Path(__file__).with_name("check.py"))
candidate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(candidate)


class CandidateCheckTest(unittest.TestCase):
    def test_build_writes_the_archive_of_the_target_labeled_with_version_and_source(self):
        with patch.object(candidate.subprocess, "run") as run, patch("pathlib.Path.mkdir"):
            candidate.build("linux-arm64", "1.2.3", "a" * 40)
        command = run.call_args.args[0]
        self.assertIn("org.opencontainers.image.version=v1.2.3", command)
        self.assertIn("org.opencontainers.image.revision=" + "a" * 40, command)
        self.assertIn("linux/arm64", command)
        self.assertIn("--provenance=mode=max", command)
        self.assertIn("--sbom=true", command)
        self.assertIn("type=oci,dest=dist/hiitbuddy-linux-arm64.tar", command)

    def test_load_provides_the_image_of_the_target_for_the_smoke_test(self):
        with patch.object(candidate.subprocess, "run") as run:
            candidate.load("linux-amd64", "1.2.3", "a" * 40)
        command = run.call_args.args[0]
        self.assertIn("--load", command)
        self.assertEqual(command[command.index("--platform") + 1], "linux/amd64")

    def test_unreachable_image_is_reported_as_not_serving(self):
        with patch.object(candidate, "urlopen", side_effect=OSError("refused")):
            self.assertFalse(candidate.serves("http://127.0.0.1:1/", attempts=2, pause=0))

    def test_failed_smoke_test_stops_the_container(self):
        with (
            patch.object(candidate.subprocess, "check_output", return_value="abc\n"),
            patch.object(candidate.subprocess, "run") as run,
            patch.object(candidate, "serves", return_value=False),
        ):
            with self.assertRaises(ValueError):
                candidate.smoke("linux-amd64")
        run.assert_called_once_with(["docker", "stop", "abc"], check=False)


if __name__ == "__main__":
    unittest.main()
