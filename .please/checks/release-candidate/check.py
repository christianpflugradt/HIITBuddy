"""Build the release candidate image for the platform of the job and verify that it serves the application."""

import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen

TAG = "hiitbuddy:candidate"
PORT = "18080"


def platform(target):
    return target.replace("-", "/", 1)


def labels(version, source):
    return [
        "--label", f"org.opencontainers.image.version=v{version}",
        "--label", f"org.opencontainers.image.revision={source}",
    ]  # fmt: skip


def build(target, version, source):
    archive = Path(f"dist/hiitbuddy-{target}.tar")
    archive.parent.mkdir(exist_ok=True)
    subprocess.run(
        [
            "docker", "buildx", "build", "--platform", platform(target),
            "--provenance=mode=max", "--sbom=true", *labels(version, source),
            "--output", f"type=oci,dest={archive}", ".",
        ],
        check=True,
    )  # fmt: skip


def load(target, version, source):
    """Loads the image of the platform for the smoke test; the layers come from the cache of the candidate build."""
    subprocess.run(
        [
            "docker", "buildx", "build", "--platform", platform(target), "--provenance=false", "--sbom=false",
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


def smoke(target):
    container = subprocess.check_output(
        ["docker", "run", "--detach", "--rm", "--platform", platform(target), "--publish", f"127.0.0.1:{PORT}:8080", TAG], text=True
    ).strip()
    try:
        if not serves(f"http://127.0.0.1:{PORT}/"):
            raise ValueError("The candidate image does not serve the application")
    finally:
        subprocess.run(["docker", "stop", container], check=False)


def main():
    target, version, source = os.environ["RELEASE_TARGET"], os.environ["EXPECTED_RELEASE_VERSION"], os.environ["GITHUB_SHA"]
    build(target, version, source)
    load(target, version, source)
    smoke(target)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # A crash is a technical failure, never a FAIL verdict.
        print(f"ERROR: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(2)
