"""Build the release candidate image for linux/amd64 and linux/arm64 and verify that the amd64 image serves the application."""

import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen

TAG = "hiitbuddy:candidate"
ARCHIVE = Path("dist/hiitbuddy.tar")
PORT = "18080"


def labels(version, source):
    return [
        "--label", f"org.opencontainers.image.version=v{version}",
        "--label", f"org.opencontainers.image.revision={source}",
    ]  # fmt: skip


def build(version, source):
    ARCHIVE.parent.mkdir(exist_ok=True)
    subprocess.run(
        [
            "docker", "buildx", "build", "--platform", "linux/amd64,linux/arm64",
            "--provenance=mode=max", "--sbom=true", *labels(version, source),
            "--output", f"type=oci,dest={ARCHIVE}", ".",
        ],
        check=True,
    )  # fmt: skip


def load(version, source):
    """Loads the amd64 image for the smoke test; the layers come from the cache of the candidate build."""
    subprocess.run(
        [
            "docker", "buildx", "build", "--platform", "linux/amd64", "--provenance=false", "--sbom=false",
            "--load", "--tag", TAG, *labels(version, source), ".",
        ],
        check=True,
    )  # fmt: skip


def serves(url, attempts=30, pause=1.0):
    for _ in range(attempts):
        try:
            with urlopen(url, timeout=5) as response:  # noqa: S310 - fixed local URL
                if response.status == 200 and b"<html" in response.read().lower():
                    return True
        except (URLError, OSError):
            pass
        time.sleep(pause)
    return False


def smoke():
    container = subprocess.check_output(
        ["docker", "run", "--detach", "--rm", "--platform", "linux/amd64", "--publish", f"127.0.0.1:{PORT}:8080", TAG], text=True
    ).strip()
    try:
        if not serves(f"http://127.0.0.1:{PORT}/"):
            raise ValueError("The candidate image does not serve the application")
    finally:
        subprocess.run(["docker", "stop", container], check=False)


def main():
    version, source = os.environ["EXPECTED_RELEASE_VERSION"], os.environ["GITHUB_SHA"]
    build(version, source)
    load(version, source)
    smoke()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # A crash is a technical failure, never a FAIL verdict.
        print(f"ERROR: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(2)
